import { z } from 'zod';

/** Lenient OpenAI chat-completions request as Vapi sends it (extra fields allowed). */
export const openAiChatRequestSchema = z.looseObject({
  model: z.string().optional(),
  stream: z.boolean().optional(),
  messages: z
    .array(
      z.looseObject({
        role: z.string(),
        content: z.union([z.string(), z.null(), z.array(z.unknown())]).optional(),
      }),
    )
    .min(1),
  call: z
    .looseObject({
      id: z.string().optional(),
      customer: z.looseObject({ number: z.string().optional() }).optional(),
      phoneNumber: z.looseObject({ number: z.string().optional() }).optional(),
    })
    .optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});
export type OpenAiChatRequest = z.infer<typeof openAiChatRequestSchema>;

/** Vapi server-message envelope; everything interesting is under `message`. */
export const vapiWebhookEnvelopeSchema = z.looseObject({
  message: z.looseObject({ type: z.string() }),
});
