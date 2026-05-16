import { z } from 'zod';

export const leadInputSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(120),
  email: z.string().trim().email('Invalid email').max(200),
  phone: z
    .string()
    .trim()
    .regex(/^\d{3}-\d{3}-\d{4}$/, 'Phone must be in XXX-XXX-XXXX format'),
  flightInterest: z.string().trim().max(60).optional().or(z.literal('')),
  preferredContact: z.enum(['email', 'phone']).optional(),
  message: z.string().trim().max(4000).optional().or(z.literal('')),
});

export type LeadInput = z.infer<typeof leadInputSchema>;
