import { desc, eq } from 'drizzle-orm';
import { db } from '../db';
import { suggestions, type Suggestion } from '../db/schema';
import type { SuggestionKind, SuggestionView } from './rules';

export type NewSuggestion = {
  id: string;
  kind: SuggestionKind;
  body: string;
  pictureKey: string | null;
  pictureType: string | null;
  authorId: string;
  authorName: string;
};

export async function addSuggestion(s: NewSuggestion): Promise<Suggestion> {
  const [row] = await db.insert(suggestions).values(s).returning();
  return row;
}

export async function getSuggestion(id: string): Promise<Suggestion | undefined> {
  const [row] = await db.select().from(suggestions).where(eq(suggestions.id, id)).limit(1);
  return row;
}

export async function listSuggestions(view: SuggestionView, limit = 200): Promise<Suggestion[]> {
  return db
    .select()
    .from(suggestions)
    .where(view === 'open' ? eq(suggestions.status, 'open') : undefined)
    .orderBy(desc(suggestions.createdAt))
    .limit(limit);
}

export async function closeSuggestion(id: string, by: string, reply: string | null): Promise<void> {
  await db
    .update(suggestions)
    .set({ status: 'done', reply, closedByName: by, closedAt: new Date() })
    .where(eq(suggestions.id, id));
}

export async function reopenSuggestion(id: string): Promise<void> {
  await db
    .update(suggestions)
    .set({ status: 'open', closedByName: null, closedAt: null })
    .where(eq(suggestions.id, id));
}
