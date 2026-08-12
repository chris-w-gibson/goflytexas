'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { reportLead } from '@/lib/gtag';

function stripMarkdown(text: string): string {
  return text
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*\n]+)\*/g, '$1')
    .replace(/^#{1,4}\s+/gm, '')
    .replace(/^[-*]\s+/gm, '\u2022 ');
}

function getChatSessionId(): string | undefined {
  if (typeof window === 'undefined') return undefined;
  try {
    let sid = window.sessionStorage.getItem('gft_chat_sid');
    if (!sid) {
      sid = window.crypto.randomUUID();
      window.sessionStorage.setItem('gft_chat_sid', sid);
    }
    return sid;
  } catch {
    return undefined;
  }
}

type ChatMessage = { role: 'user' | 'assistant'; content: string };

const MAX_SESSION_MESSAGES = 30;
const NUDGE_DELAY_MS = 20_000;
const NUDGE_KEY = 'gft-chat-nudged';

const WELCOME =
  "Hi! I'm the GoFlyTexas assistant. Ask me about discovery flights, rentals, lessons, or anything else about flying with us.";

function normalizePhone(input: string): string {
  const digits = input.replace(/\D/g, '').replace(/^1(?=\d{10}$)/, '');
  if (digits.length === 10) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  return input;
}

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [nudge, setNudge] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [leadState, setLeadState] = useState<'idle' | 'sending' | 'sent' | 'error'>(
    'idle',
  );
  const scrollRef = useRef<HTMLDivElement>(null);

  // Gentle nudge: once per browser session, dismissed by opening or closing it.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (sessionStorage.getItem(NUDGE_KEY)) return;
    const timer = window.setTimeout(() => {
      setNudge(true);
      sessionStorage.setItem(NUDGE_KEY, '1');
    }, NUDGE_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages, open, showLeadForm]);

  const send = useCallback(async () => {
    const text = input.trim();
    if (!text || busy) return;
    if (messages.length >= MAX_SESSION_MESSAGES) return;

    const history: ChatMessage[] = [...messages, { role: 'user', content: text }];
    setMessages([...history, { role: 'assistant', content: '' }]);
    setInput('');
    setBusy(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history, sessionId: getChatSessionId() }),
      });

      if (!res.ok || !res.body) {
        let serverMessage = '';
        try {
          serverMessage = (await res.json())?.error ?? '';
        } catch {
          // non-JSON error body — fall through to the defaults
        }
        const fallback =
          serverMessage ||
          (res.status === 429
            ? "You're sending messages a little fast — give it a few minutes and try again."
            : 'Sorry, I had trouble answering. Please try again or leave your info via "Talk to a human".');
        setMessages([...history, { role: 'assistant', content: fallback }]);
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let answer = '';
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        answer += decoder.decode(value, { stream: true });
        setMessages([...history, { role: 'assistant', content: answer }]);
      }
    } catch {
      setMessages([
        ...history,
        {
          role: 'assistant',
          content:
            'Sorry, the connection dropped. Please try again or use "Talk to a human" below.',
        },
      ]);
    } finally {
      setBusy(false);
    }
  }, [input, busy, messages]);

  async function submitLead(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    setLeadState('sending');
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.get('name'),
          email: data.get('email'),
          phone: normalizePhone(String(data.get('phone') ?? '')),
          message: 'Chat widget: visitor asked to talk to a human.',
          preferredContact: 'phone',
        }),
      });
      if (!res.ok) throw new Error(String(res.status));
      setLeadState('sent');
      reportLead();
      form.reset();
    } catch {
      setLeadState('error');
    }
  }

  const capReached = messages.length >= MAX_SESSION_MESSAGES;

  return (
    <>
      {/* Nudge bubble */}
      {nudge && !open && (
        <div className="fixed bottom-24 right-4 z-40 max-w-[240px] bg-white border border-sky-200 shadow-lg rounded-2xl rounded-br-sm p-3 text-sm text-navy-900">
          <button
            aria-label="Dismiss"
            onClick={() => setNudge(false)}
            className="absolute -top-2 -right-2 bg-slate-200 hover:bg-slate-300 rounded-full w-5 h-5 text-xs leading-5 text-slate-600"
          >
            ×
          </button>
          Got a question? I can answer it for you.
        </div>
      )}

      {/* Floating bubble */}
      <button
        aria-label={open ? 'Close chat' : 'Open chat'}
        onClick={() => {
          setOpen((v) => !v);
          setNudge(false);
          if (messages.length === 0) {
            setMessages([{ role: 'assistant', content: WELCOME }]);
          }
        }}
        className="fixed bottom-4 right-4 z-50 w-14 h-14 rounded-full bg-sky-500 hover:bg-sky-600 text-white shadow-xl flex items-center justify-center transition-colors"
      >
        {open ? (
          <span className="text-2xl leading-none">×</span>
        ) : (
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7">
            <path d="M4.913 2.658c2.075-.27 4.19-.408 6.337-.408 2.147 0 4.262.139 6.337.408 1.922.25 3.291 1.861 3.405 3.727a4.403 4.403 0 0 0-1.032-.211 50.89 50.89 0 0 0-8.42 0c-2.358.196-4.04 2.19-4.04 4.434v4.286a4.47 4.47 0 0 0 2.433 3.984L7.28 21.53A.75.75 0 0 1 6 21v-4.03a48.527 48.527 0 0 1-1.087-.128C2.905 16.58 1.5 14.833 1.5 12.862V6.638c0-1.97 1.405-3.718 3.413-3.98Z" />
            <path d="M15.75 7.5c-1.376 0-2.739.057-4.086.169C10.124 7.797 9 9.103 9 10.609v4.285c0 1.507 1.128 2.814 2.67 2.94 1.243.102 2.5.157 3.768.165l2.782 2.781a.75.75 0 0 0 1.28-.53v-2.39l.33-.026c1.542-.125 2.67-1.433 2.67-2.94v-4.286c0-1.505-1.125-2.811-2.664-2.94A49.392 49.392 0 0 0 15.75 7.5Z" />
          </svg>
        )}
      </button>

      {/* Panel */}
      {open && (
        <div className="fixed z-50 inset-x-0 bottom-0 sm:inset-x-auto sm:right-4 sm:bottom-20 sm:w-[380px] flex flex-col bg-white sm:rounded-2xl shadow-2xl border border-slate-200 max-h-[85vh] sm:max-h-[600px] h-[70vh] sm:h-[520px]">
          {/* Header */}
          <div className="bg-sky-500 text-white px-4 py-3 sm:rounded-t-2xl flex items-center justify-between shrink-0">
            <div>
              <p className="font-semibold leading-tight">GoFlyTexas</p>
              <p className="text-xs text-sky-100">AI assistant</p>
            </div>
            <button
              aria-label="Close chat"
              onClick={() => setOpen(false)}
              className="text-sky-100 hover:text-white text-xl leading-none"
            >
              ×
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-2">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm whitespace-pre-wrap ${
                  m.role === 'user'
                    ? 'ml-auto bg-sky-500 text-white rounded-br-sm'
                    : 'mr-auto bg-slate-100 text-navy-900 rounded-bl-sm'
                }`}
              >
                {(m.role === 'assistant' ? stripMarkdown(m.content) : m.content) ||
                  (busy && i === messages.length - 1 ? '…' : '')}
              </div>
            ))}

            {showLeadForm && (
              <div className="mr-auto w-full bg-sky-50 border border-sky-200 rounded-2xl p-3 text-sm">
                {leadState === 'sent' ? (
                  <p className="text-navy-900">
                    Got it — a real person at GoFlyTexas will reach out soon. Blue skies!
                  </p>
                ) : (
                  <form onSubmit={submitLead} className="space-y-2">
                    <p className="font-medium text-navy-900">
                      Leave your info and the team will follow up:
                    </p>
                    <input
                      name="name"
                      required
                      maxLength={120}
                      placeholder="Name"
                      className="w-full border border-slate-300 rounded-lg px-2 py-1.5"
                    />
                    <input
                      name="email"
                      type="email"
                      required
                      maxLength={200}
                      placeholder="Email"
                      className="w-full border border-slate-300 rounded-lg px-2 py-1.5"
                    />
                    <input
                      name="phone"
                      required
                      placeholder="Phone (e.g. 940-555-1234)"
                      className="w-full border border-slate-300 rounded-lg px-2 py-1.5"
                    />
                    {leadState === 'error' && (
                      <p className="text-red-600 text-xs">
                        That didn&apos;t go through — check the phone format
                        (XXX-XXX-XXXX) and try again.
                      </p>
                    )}
                    <button
                      type="submit"
                      disabled={leadState === 'sending'}
                      className="bg-sky-500 hover:bg-sky-600 text-white rounded-lg px-3 py-1.5 font-medium disabled:opacity-50"
                    >
                      {leadState === 'sending' ? 'Sending…' : 'Send to the team'}
                    </button>
                  </form>
                )}
              </div>
            )}

            {capReached && (
              <p className="text-xs text-slate-500 text-center">
                This chat has reached its limit — leave your info above and the team will
                take it from here.
              </p>
            )}
          </div>

          {/* Composer */}
          <div className="border-t border-slate-200 p-3 shrink-0 space-y-2">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void send();
              }}
              className="flex gap-2"
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={busy || capReached}
                maxLength={4000}
                placeholder={capReached ? 'Chat limit reached' : 'Ask a question…'}
                className="flex-1 border border-slate-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 disabled:bg-slate-50"
              />
              <button
                type="submit"
                disabled={busy || capReached || !input.trim()}
                className="bg-sky-500 hover:bg-sky-600 text-white rounded-full px-4 py-2 text-sm font-medium disabled:opacity-50"
              >
                Send
              </button>
            </form>
            <button
              onClick={() => setShowLeadForm((v) => !v)}
              className="text-xs text-sky-700 hover:text-sky-900 underline"
            >
              Talk to a human
            </button>
          </div>
        </div>
      )}
    </>
  );
}
