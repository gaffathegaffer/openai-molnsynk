import { Hono } from 'hono';
import { and, asc, eq, isNull, sql } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import { db } from '../db';
import { chatMessages, chatSessions } from '../db/schema';

export const chatRouter = new Hono();

chatRouter.post('/sessions', async (c) => {
  const { userId, title } = await c.req.json();
  const id = nanoid(21);

  await db.insert(chatSessions).values({
    id,
    userId,
    title: title || 'Ny konversation',
  });

  const [session] = await db.select().from(chatSessions).where(eq(chatSessions.id, id)).limit(1);

  return c.json(session, 201);
});

chatRouter.get('/sessions/:sessionId/messages', async (c) => {
  const sessionId = c.req.param('sessionId');

  const messages = await db
    .select()
    .from(chatMessages)
    .where(and(eq(chatMessages.sessionId, sessionId), isNull(chatMessages.deletedAt)))
    .orderBy(asc(chatMessages.createdAt));

  return c.json(messages);
});

chatRouter.post('/sessions/:sessionId/messages', async (c) => {
  const sessionId = c.req.param('sessionId');
  const { userId, role, content, context } = await c.req.json();
  const id = nanoid(21);

  await db.insert(chatMessages).values({ id, userId, sessionId, role, content, context });

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
