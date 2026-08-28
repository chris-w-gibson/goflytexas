/** OpenAI chat-completions wire format, which Vapi's custom-LLM hook expects. */

export const SSE_DONE = 'data: [DONE]\n\n';

export function sseChunk(
  id: string,
  model: string,
  delta: string | null,
  finish: 'stop' | null,
  created: number = Math.floor(Date.now() / 1000),
): string {
  const payload = {
    id,
    object: 'chat.completion.chunk',
    created,
    model,
    choices: [
      {
        index: 0,
        delta: delta === null ? {} : { role: 'assistant', content: delta },
        finish_reason: finish,
      },
    ],
  };
  return `data: ${JSON.stringify(payload)}\n\n`;
}

export function completionJson(
  id: string,
  model: string,
  text: string,
  created: number = Math.floor(Date.now() / 1000),
): Record<string, unknown> {
  return {
    id,
    object: 'chat.completion',
    created,
    model,
    choices: [
      {
        index: 0,
        message: { role: 'assistant', content: text },
        finish_reason: 'stop',
      },
    ],
  };
}
