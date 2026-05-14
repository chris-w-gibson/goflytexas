import {
  pgTable,
  pgEnum,
  uuid,
  text,
  timestamp,
  boolean,
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
