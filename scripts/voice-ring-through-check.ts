/**
 * Ask the voice model itself how it behaves around ringing a person through:
 * made-up caller turns with the real persona, the real per-turn notes and the
 * real reach_team tool. Prints, per case, whether the tool was used, with what
 * name, and what would be spoken. Nothing is rung: no phone network, no DB.
 *
 *   railway run -e production -s goflytexas -- npx tsx scripts/voice-ring-through-check.ts
 *
 * (needs ANTHROPIC_API_KEY; VOICE_MODEL picks the model as it does on calls)
 */
import Anthropic from '@anthropic-ai/sdk';
import { REACH_TEAM_TOOL, afterMiss, firstRing, ringThroughNote, type RingNoteView } from '../lib/voice/ringThrough';
import { VOICE_GREETING, VOICE_PERSONA, callContextNote } from '../lib/voicePersona';

const model = process.env.VOICE_MODEL ?? process.env.CHAT_MODEL ?? 'claude-haiku-4-5';
const knowledge = 'Reference documents:\n\nDiscovery flight: about one hour, you fly the plane with an instructor. Private pilot training is by appointment, seven days a week.';
const ringing = firstRing({
  plan: [{ userId: 'u', name: 'Mark King', number: '+18175550101' }],
  callerName: null,
  controlUrl: null,
  now: new Date(),
});

type Turn = { role: 'user' | 'assistant'; content: string };
type Case = { name: string; view: RingNoteView; turns: Turn[]; expectTool: boolean };

const greeted: Turn[] = [
  { role: 'user', content: 'Hello?' },
  { role: 'assistant', content: VOICE_GREETING },
];

const cases: Case[] = [
  {
    name: 'asks for a person, name already given',
    view: { kind: 'available' },
    expectTool: true,
    turns: [
      ...greeted,
      { role: 'user', content: 'Hi, this is Susie Johnson, I am interested in a discovery flight.' },
      { role: 'assistant', content: 'Great, Susie. A discovery flight is about an hour and you fly the plane with an instructor. Is this number the best one to reach you?' },
      { role: 'user', content: 'Yes it is. Actually, can I just talk to a person?' },
    ],
  },
  {
    name: 'asks for a human and gives a name in the same breath',
    view: { kind: 'available' },
    expectTool: true,
    turns: [...greeted, { role: 'user', content: "I'd like a real human please. My name is Dana Whitfield." }],
  },
  {
    name: 'asks for a person before giving a name: asks the name first',
    view: { kind: 'available' },
    expectTool: false,
    turns: [...greeted, { role: 'user', content: 'Can I speak to someone?' }],
  },
  {
    name: 'ordinary question, nobody asked for',
    view: { kind: 'available' },
    expectTool: false,
    turns: [...greeted, { role: 'user', content: 'How long is a discovery flight?' }],
  },
  {
    name: 'asks for a person when nobody can be rung',
    view: { kind: 'unavailable' },
    expectTool: false,
    turns: [...greeted, { role: 'user', content: 'This is Tom Reyes. Can I talk to a person please?' }],
  },
  {
    name: 'already ringing, caller asks if someone is coming',
    view: { kind: 'state', state: ringing },
    expectTool: false,
    turns: [
      ...greeted,
      { role: 'user', content: 'This is Tom Reyes. Can I talk to a person please?' },
      { role: 'assistant', content: 'Let me try to reach someone for you. I can keep helping while I do.' },
      { role: 'user', content: 'Okay. Is someone picking up?' },
    ],
  },
  {
    name: 'nobody picked up',
    view: { kind: 'state', state: afterMiss(ringing) },
    expectTool: false,
    turns: [
      ...greeted,
      { role: 'user', content: 'This is Tom Reyes. Can I talk to a person please?' },
      { role: 'assistant', content: 'Let me try to reach someone for you. I can keep helping while I do.' },
      { role: 'user', content: 'Sure, I will wait.' },
    ],
  },
];

async function main() {
  const client = new Anthropic();
  let wrong = 0;
  for (const c of cases) {
    const notes = [
      callContextNote({ callerSpoken: 'two one four, five five five, zero one four two', turn: 2, maxTurns: 16 }),
      ringThroughNote(c.view),
    ].join(' ');
    const messages = c.turns.map((t, i) => (i === c.turns.length - 1 ? { ...t, content: `${notes}\n${t.content}` } : t));
    const res = await client.messages.create({
      model,
      max_tokens: 300,
      system: [
        { type: 'text', text: VOICE_PERSONA },
        { type: 'text', text: knowledge },
      ],
      tools: [REACH_TEAM_TOOL],
      messages,
    });
    const text = res.content.map((b) => (b.type === 'text' ? b.text : '')).join('').trim();
    const tool = res.content.find((b) => b.type === 'tool_use');
    const used = Boolean(tool);
    const ok = used === c.expectTool;
    if (!ok) wrong += 1;
    console.log(`\n# ${c.name}`);
    console.log(`  tool: ${used ? `USED ${JSON.stringify(tool && tool.type === 'tool_use' ? tool.input : null)}` : 'not used'}${ok ? '' : '   <-- NOT AS EXPECTED'}`);
    console.log(`  says: ${text || '(nothing; the route speaks the standing line)'}`);
  }
  console.log(`\n${cases.length} cases, ${wrong} not as expected, model ${model}`);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
