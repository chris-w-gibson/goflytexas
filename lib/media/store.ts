import { and, desc, eq, sql } from 'drizzle-orm';
import { db } from '../db';
import { mediaItems, type MediaItem } from '../db/schema';
import type { MediaFilter, MediaKind } from './rules';

export type NewMedia = {
  id: string;
  kind: MediaKind;
  storageKey: string;
  thumbKey: string | null;
  filename: string;
  mimeType: string;
  sizeBytes: number;
  width: number | null;
  height: number | null;
  durationSec: number | null;
  note: string | null;
  clearedToPost: boolean;
  uploadedBy: string;
  uploadedByName: string;
};

/** Recording the same upload twice (a retry) keeps the first row. */
export async function addMedia(m: NewMedia): Promise<void> {
  await db.insert(mediaItems).values(m).onConflictDoNothing({ target: mediaItems.id });
}

export async function getMedia(id: string): Promise<MediaItem | undefined> {
  const [row] = await db.select().from(mediaItems).where(eq(mediaItems.id, id)).limit(1);
  return row;
}

export async function listMedia(filter: MediaFilter, limit = 120): Promise<MediaItem[]> {
  const where =
    filter === 'photo' || filter === 'video'
      ? eq(mediaItems.kind, filter)
      : filter === 'cleared'
        ? eq(mediaItems.clearedToPost, true)
        : undefined;
  return db
    .select()
    .from(mediaItems)
    .where(where ? and(where) : undefined)
    .orderBy(desc(mediaItems.createdAt))
    .limit(limit);
}

export type MediaTotals = { items: number; photos: number; videos: number; cleared: number; bytes: number };

export async function mediaTotals(): Promise<MediaTotals> {
  const [row] = await db
    .select({
      items: sql<number>`count(*)::int`,
      photos: sql<number>`count(*) filter (where ${mediaItems.kind} = 'photo')::int`,
      videos: sql<number>`count(*) filter (where ${mediaItems.kind} = 'video')::int`,
      cleared: sql<number>`count(*) filter (where ${mediaItems.clearedToPost})::int`,
      bytes: sql<number>`coalesce(sum(${mediaItems.sizeBytes}), 0)::float8`,
    })
    .from(mediaItems);
  return row;
}

export async function updateMedia(id: string, patch: { note?: string | null; clearedToPost?: boolean }): Promise<void> {
  await db
    .update(mediaItems)
    .set({ ...patch, updatedAt: new Date() })
    .where(eq(mediaItems.id, id));
}

export async function deleteMedia(id: string): Promise<void> {
  await db.delete(mediaItems).where(eq(mediaItems.id, id));
}
