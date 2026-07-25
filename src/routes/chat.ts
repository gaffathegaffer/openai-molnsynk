import { Hono, type Context } from 'hono';
import { and, asc, eq, isNull, sql } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import { db } from '../db';
import { chatMessages, chatSessions } from '../db/schema';

const validRoles = new Set(['system', 'user', 'assistant', 'tool']);

type JsonBody = Record<string, unknown>;

export const chatRouter = new Hono();

async function readJsonBody(c: Context) {
  try {
    const body = await c.req.json<unknown>();

    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return { error: 'Request body måste vara ett JSON-objekt' } as const;
    }

    return { body: body as JsonBody } as const;
  } catch {
    return { error: 'Ogiltig JSON i request body' } as const;
  }
}

function getRequiredString(body: JsonBody, field: string) {
  const value = body[field];

  if (typeof value !== 'string' || value.trim().length === 0) {
    return { error: `${field} måste vara en icke-tom sträng` } as const;
  }

  return { value: value.trim() } as const;
}

async function findActiveSession(sessionId: string) {
  const [session] = await db
    .select()
    .from(chatSessions)
    .where(and(eq(chatSessions.id, sessionId), isNull(chatSessions.deletedAt)))
    .limit(1);

  return session;
}

async function findActiveMessage(sessionId: string, messageId: string) {
  const [message] = await db
    .select()
    .from(chatMessages)
    .where(and(eq(chatMessages.id, messageId), eq(chatMessages.sessionId, sessionId), isNull(chatMessages.deletedAt)))
    .limit(1);

  return message;
}

chatRouter.post('/sessions', async (c) => {
  const parsed = await readJsonBody(c);

  if ('error' in parsed) {
    return c.json({ error: parsed.error }, 400);
  }

  const userId = getRequiredString(parsed.body, 'userId');

  if ('error' in userId) {
    return c.json({ error: userId.error }, 400);
  }

  const rawTitle = parsed.body.title;
  const title = typeof rawTitle === 'string' && rawTitle.trim().length > 0 ? rawTitle.trim() : 'Ny konversation';
  const id = nanoid(21);

  await db.insert(chatSessions).values({
    id,
    userId: userId.value,
    title,
  });

  const [session] = await db.select().from(chatSessions).where(eq(chatSessions.id, id)).limit(1);

  return c.json(session, 201);
});

chatRouter.patch('/sessions/:sessionId', async (c) => {
  const sessionId = c.req.param('sessionId');
  const session = await findActiveSession(sessionId);

  if (!session) {
    return c.json({ error: 'Chattsessionen hittades inte' }, 404);
  }

  const parsed = await readJsonBody(c);

  if ('error' in parsed) {
    return c.json({ error: parsed.error }, 400);
  }

  const title = getRequiredString(parsed.body, 'title');

  if ('error' in title) {
    return c.json({ error: title.error }, 400);
  }

  await db
    .update(chatSessions)
    .set({ title: title.value })
    .where(and(eq(chatSessions.id, sessionId), isNull(chatSessions.deletedAt)));

  const updatedSession = await findActiveSession(sessionId);

  return c.json(updatedSession);
});

chatRouter.get('/sessions/:sessionId/messages', async (c) => {
  const sessionId = c.req.param('sessionId');
  const session = await findActiveSession(sessionId);

  if (!session) {
    return c.json({ error: 'Chattsessionen hittades inte' }, 404);
  }

  const messages = await db
    .select()
    .from(chatMessages)
    .where(and(eq(chatMessages.sessionId, sessionId), isNull(chatMessages.deletedAt)))
    .orderBy(asc(chatMessages.createdAt));

  return c.json(messages);
});

chatRouter.post('/sessions/:sessionId/messages', async (c) => {
  const sessionId = c.req.param('sessionId');
  const session = await findActiveSession(sessionId);

  if (!session) {
    return c.json({ error: 'Chattsessionen hittades inte' }, 404);
  }

  const parsed = await readJsonBody(c);

  if ('error' in parsed) {
    return c.json({ error: parsed.error }, 400);
  }

  const userId = getRequiredString(parsed.body, 'userId');

  if ('error' in userId) {
    return c.json({ error: userId.error }, 400);
  }

  const role = getRequiredString(parsed.body, 'role');

  if ('error' in role) {
    return c.json({ error: role.error }, 400);
  }

  const content = getRequiredString(parsed.body, 'content');

  if ('error' in content) {
    return c.json({ error: content.error }, 400);
  }

  if (!validRoles.has(role.value)) {
    return c.json({ error: 'role måste vara en av: system, user, assistant, tool' }, 400);
  }

  const id = nanoid(21);
  const values = {
    id,
    userId: userId.value,
    sessionId,
    role: role.value,
    content: content.value,
    context: parsed.body.context ?? null,
  };

  await db.insert(chatMessages).values(values);

  await db
    .update(chatSessions)
    .set({
      lastMessageAt: new Date(),
      messageCount: sql<number>`(SELECT COUNT(*) FROM ${chatMessages} WHERE ${chatMessages.sessionId} = ${sessionId} AND ${chatMessages.deletedAt} IS NULL)`,
    })
    .where(and(eq(chatSessions.id, sessionId), isNull(chatSessions.deletedAt)));

  const [message] = await db.select().from(chatMessages).where(eq(chatMessages.id, id)).limit(1);

  return c.json(message, 201);
});

chatRouter.patch('/sessions/:sessionId/messages/:messageId', async (c) => {
  const sessionId = c.req.param('sessionId');
  const messageId = c.req.param('messageId');
  const session = await findActiveSession(sessionId);

  if (!session) {
    return c.json({ error: 'Chattsessionen hittades inte' }, 404);
  }

  const message = await findActiveMessage(sessionId, messageId);

  if (!message) {
    return c.json({ error: 'Meddelandet hittades inte' }, 404);
  }

  const parsed = await readJsonBody(c);

  if ('error' in parsed) {
    return c.json({ error: parsed.error }, 400);
  }

  const updates: { content?: string; context?: unknown } = {};

  if ('content' in parsed.body) {
    const content = getRequiredString(parsed.body, 'content');

    if ('error' in content) {
      return c.json({ error: content.error }, 400);
    }

    updates.content = content.value;
  }

  if ('context' in parsed.body) {
    updates.context = parsed.body.context ?? null;
  }

  if (!('content' in updates) && !('context' in updates)) {
    return c.json({ error: 'Ange content eller context att uppdatera' }, 400);
  }

  await db
    .update(chatMessages)
    .set(updates)
    .where(and(eq(chatMessages.id, messageId), eq(chatMessages.sessionId, sessionId), isNull(chatMessages.deletedAt)));

  const updatedMessage = await findActiveMessage(sessionId, messageId);

  return c.json(updatedMessage);
});
