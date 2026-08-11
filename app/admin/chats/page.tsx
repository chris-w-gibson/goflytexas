import { desc, eq, sql } from 'drizzle-orm';
import { db } from '@/lib/db';
import { chatMessages, chatSessions } from '@/lib/db/schema';

export const dynamic = 'force-dynamic';

export default async function ChatTranscriptsPage() {
  const sessions = await db
    .select({
      id: chatSessions.id,
      startedAt: chatSessions.startedAt,
      lastMessageAt: chatSessions.lastMessageAt,
      messageCount: sql<number>`(
        SELECT count(*)::int FROM chat_messages m WHERE m.session_id = ${chatSessions.id}
      )`,
    })
    .from(chatSessions)
    .orderBy(desc(chatSessions.lastMessageAt))
    .limit(50);

  const recentIds = sessions.map((s) => s.id);
  const messages =
    recentIds.length === 0
      ? []
      : await db
          .select()
          .from(chatMessages)
          .where(sql`${chatMessages.sessionId} IN ${recentIds}`)
          .orderBy(chatMessages.createdAt);
  const bySession = new Map<string, typeof messages>();
  for (const m of messages) {
    const list = bySession.get(m.sessionId) ?? [];
    list.push(m);
    bySession.set(m.sessionId, list);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Chat Transcripts</h1>
        <p className="text-sm text-slate-600 mt-1">
          What visitors ask the website assistant. Questions it couldn&apos;t
          answer are your cue for the next Bot Knowledge upload.
        </p>
      </div>

      {sessions.length === 0 ? (
        <p className="text-slate-500 text-sm">No conversations recorded yet.</p>
      ) : (
        <div className="space-y-4">
          {sessions.map((s) => (
            <details
              key={s.id}
              className="bg-white border border-slate-200 rounded-xl"
            >
              <summary className="p-4 cursor-pointer select-none flex flex-wrap gap-3 items-center">
                <span className="font-medium text-navy-900">
                  {s.startedAt.toLocaleString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                  })}
                </span>
                <span className="text-xs text-slate-500">
                  {s.messageCount} message{s.messageCount === 1 ? '' : 's'}
                </span>
                <span className="text-sm text-slate-600 truncate max-w-md">
                  {bySession.get(s.id)?.find((m) => m.role === 'user')?.content ??
                    ''}
                </span>
              </summary>
              <div className="border-t border-slate-100 p-4 space-y-3">
                {(bySession.get(s.id) ?? []).map((m) => (
                  <div
                    key={m.id}
                    className={
                      m.role === 'user'
                        ? 'text-sm bg-sky-50 border border-sky-100 rounded-lg p-3'
                        : 'text-sm bg-slate-50 border border-slate-100 rounded-lg p-3'
                    }
                  >
                    <span className="block text-[10px] uppercase tracking-wide text-slate-400 mb-1">
                      {m.role === 'user' ? 'Visitor' : 'Assistant'}
                    </span>
                    <span className="whitespace-pre-wrap">{m.content}</span>
                  </div>
                ))}
              </div>
            </details>
          ))}
        </div>
      )}
    </div>
  );
}
