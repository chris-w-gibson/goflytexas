import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { chatMessages, chatSessions } from '@/lib/db/schema';

/**
 * Persist one completed Q&A turn. The widget supplies a stable sessionId per
 * visit; turns without one (older cached widgets) each get their own session
 * so nothing is dropped. Failures are logged and swallowed — transcripts are
 * an owner convenience, never worth failing a visitor's chat over.
 */
export async function logChatTurn(
  sessionId: string | undefined,
  userText: string,
  assistantText: string,
): Promise<void> {
  try {
    let sid = sessionId;
    if (sid) {
      const existing = await db
        .select({ id: chatSessions.id })
        .from(chatSessions)
        .where(eq(chatSessions.id, sid))
        .limit(1);
      if (existing.length === 0) {
        await db.insert(chatSessions).values({ id: sid });
      } else {
        await db
          .update(chatSessions)
          .set({ lastMessageAt: new Date() })
          .where(eq(chatSessions.id, sid));
      }
    } else {
      const [row] = await db.insert(chatSessions).values({}).returning({
        id: chatSessions.id,
      });
      sid = row.id;
    }
    await db.insert(chatMessages).values([
      { sessionId: sid, role: 'user', content: userText.slice(0, 4000) },
      { sessionId: sid, role: 'assistant', content: assistantText.slice(0, 8000) },
    ]);
  } catch (err) {
    console.error('chatLog: failed to persist turn', err);
  }
}
