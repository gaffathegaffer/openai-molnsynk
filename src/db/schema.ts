import { relations, sql } from 'drizzle-orm';
import { int, json, mysqlTable, text, timestamp, varchar } from 'drizzle-orm/mysql-core';

const timestamps = {
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
  deletedAt: timestamp('deleted_at'),
};

export const chatSessions = mysqlTable('chat_sessions', {
  id: varchar('id', { length: 21 }).primaryKey(),
  userId: varchar('user_id', { length: 191 }).notNull(),
  title: varchar('title', { length: 255 }).notNull().default('Ny konversation'),
  messageCount: int('message_count').notNull().default(0),
  lastMessageAt: timestamp('last_message_at'),
  ...timestamps,
});

export const chatMessages = mysqlTable('chat_messages', {
  id: varchar('id', { length: 21 }).primaryKey(),
  userId: varchar('user_id', { length: 191 }).notNull(),
  sessionId: varchar('session_id', { length: 21 }).notNull().references(() => chatSessions.id),
  role: varchar('role', { length: 32 }).notNull(),
  content: text('content').notNull(),
  context: json('context'),
  ...timestamps,
});

export const dayPlans = mysqlTable('day_plans', {
  id: varchar('id', { length: 21 }).primaryKey(),
  userId: varchar('user_id', { length: 191 }).notNull(),
  planDate: timestamp('plan_date').notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  content: json('content').notNull(),
  ...timestamps,
});

export const inventoryItems = mysqlTable('inventory_items', {
  id: varchar('id', { length: 21 }).primaryKey(),
  userId: varchar('user_id', { length: 191 }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  quantity: int('quantity').notNull().default(1),
  metadata: json('metadata'),
  ...timestamps,
});

export const actionPriorities = mysqlTable('action_priorities', {
  id: varchar('id', { length: 21 }).primaryKey(),
  userId: varchar('user_id', { length: 191 }).notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  priority: int('priority').notNull().default(0),
  status: varchar('status', { length: 64 }).notNull().default('open'),
  ...timestamps,
});

export const reports = mysqlTable('reports', {
  id: varchar('id', { length: 21 }).primaryKey(),
  userId: varchar('user_id', { length: 191 }).notNull(),
  type: varchar('type', { length: 64 }).notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  content: json('content').notNull(),
  ...timestamps,
});

export const planAnalyses = mysqlTable('plan_analyses', {
  id: varchar('id', { length: 21 }).primaryKey(),
  userId: varchar('user_id', { length: 191 }).notNull(),
  dayPlanId: varchar('day_plan_id', { length: 21 }).references(() => dayPlans.id),
  summary: text('summary').notNull(),
  analysis: json('analysis').notNull(),
  ...timestamps,
});

export const chatSessionsRelations = relations(chatSessions, ({ many }) => ({
  messages: many(chatMessages),
}));

export const chatMessagesRelations = relations(chatMessages, ({ one }) => ({
  session: one(chatSessions, {
    fields: [chatMessages.sessionId],
    references: [chatSessions.id],
  }),
}));

export const activeRecords = sql`deleted_at IS NULL`;
