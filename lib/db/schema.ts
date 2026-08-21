import {
  pgTable,
  pgEnum,
  uuid,
  text,
  timestamp,
  boolean,
  jsonb,
} from 'drizzle-orm/pg-core';

export const leadStatus = pgEnum('lead_status', [
  'new',
  'contacted',
  'converted',
  'unsubscribed',
]);

export const leadSource = pgEnum('lead_source', ['web', 'manual']);

export const leads = pgTable('leads', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  phone: text('phone'),
  flightInterest: text('flight_interest'),
  preferredContact: text('preferred_contact'),
  message: text('message'),

  status: leadStatus('status').notNull().default('new'),
  source: leadSource('source').notNull().default('web'),
  // First-touch channel attribution (gclid/utm_*), read from the gft_attr cookie
  attribution: jsonb('attribution'),

  unsubscribeToken: uuid('unsubscribe_token').defaultRandom().notNull(),
  unsubscribed: boolean('unsubscribed').notNull().default(false),

  lastContactedAt: timestamp('last_contacted_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const emailEventKind = pgEnum('email_event_kind', [
  'auto_reply',
  'weekly_followup',
  'admin_notify',
  'manual',
]);

export const emailEvents = pgTable('email_events', {
  id: uuid('id').defaultRandom().primaryKey(),
  leadId: uuid('lead_id')
    .notNull()
    .references(() => leads.id, { onDelete: 'cascade' }),
  kind: emailEventKind('kind').notNull(),
  sentAt: timestamp('sent_at', { withTimezone: true }).defaultNow().notNull(),
  error: text('error'),
});

export type Lead = typeof leads.$inferSelect;
export type NewLead = typeof leads.$inferInsert;

export const userRole = pgEnum('user_role', ['admin', 'staff']);

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  name: text('name').notNull(),
  role: userRole('role').notNull().default('admin'),
  mustChangePassword: boolean('must_change_password').notNull().default(true),
  disabled: boolean('disabled').notNull().default(false),
  lastLoginAt: timestamp('last_login_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const passwordResetTokens = pgTable('password_reset_tokens', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  tokenHash: text('token_hash').notNull().unique(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  consumedAt: timestamp('consumed_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export const botDocuments = pgTable('bot_documents', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: text('title').notNull(),
  filename: text('filename').notNull(),
  mimeType: text('mime_type').notNull(),
  content: text('content').notNull(),
  isActive: boolean('is_active').notNull().default(true),
  uploadedBy: uuid('uploaded_by').references(() => users.id, {
    onDelete: 'set null',
  }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export type BotDocument = typeof botDocuments.$inferSelect;
export type NewBotDocument = typeof botDocuments.$inferInsert;

// Chat transcripts (Jim 8/11): every widget conversation is kept so owners
// can see what visitors ask — unanswered questions are the roadmap for
// which documents to upload next.
export const chatSessions = pgTable('chat_sessions', {
  id: uuid('id').defaultRandom().primaryKey(),
  startedAt: timestamp('started_at', { withTimezone: true }).defaultNow().notNull(),
  lastMessageAt: timestamp('last_message_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const chatMessages = pgTable('chat_messages', {
  id: uuid('id').defaultRandom().primaryKey(),
  sessionId: uuid('session_id')
    .notNull()
    .references(() => chatSessions.id, { onDelete: 'cascade' }),
  role: text('role').notNull(), // 'user' | 'assistant'
  content: text('content').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// Free-text activity trail per lead ("called 8/12, left VM").
export const leadNotes = pgTable('lead_notes', {
  id: uuid('id').defaultRandom().primaryKey(),
  leadId: uuid('lead_id')
    .notNull()
    .references(() => leads.id, { onDelete: 'cascade' }),
  authorName: text('author_name').notNull(),
  body: text('body').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export type ChatSession = typeof chatSessions.$inferSelect;
export type ChatMessage = typeof chatMessages.$inferSelect;
export type LeadNote = typeof leadNotes.$inferSelect;
