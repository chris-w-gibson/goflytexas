'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import {
  createLead,
  markContacted,
  updateLeadStatus,
  type LeadStatus,
} from '@/lib/leads';
import { leadInputSchema } from '@/lib/validation';

const VALID_STATUSES: LeadStatus[] = [
  'new',
  'contacted',
  'converted',
  'unsubscribed',
];

export async function createManualLeadAction(formData: FormData) {
  const parsed = leadInputSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    phone: formData.get('phone'),
    flightInterest: formData.get('flightInterest'),
    preferredContact: formData.get('preferredContact'),
    message: formData.get('message'),
  });
  if (!parsed.success) {
    throw new Error(parsed.error.issues.map((i) => i.message).join(', '));
  }
  const data = parsed.data;
  await createLead({
    name: data.name,
    email: data.email,
    phone: data.phone || null,
    flightInterest: data.flightInterest || null,
    preferredContact: data.preferredContact ?? 'phone',
    message: data.message || null,
    source: 'manual',
  });
  revalidatePath('/admin');
  revalidatePath('/admin/leads');
  redirect('/admin/leads');
}

export async function updateStatusAction(formData: FormData) {
  const id = String(formData.get('id') ?? '');
  const status = String(formData.get('status') ?? '');
  if (!id || !VALID_STATUSES.includes(status as LeadStatus)) {
    throw new Error('Invalid id or status');
  }
  await updateLeadStatus(id, status as LeadStatus);
  revalidatePath('/admin');
  revalidatePath('/admin/leads');
  revalidatePath(`/admin/leads/${id}`);
}

export async function markContactedAction(formData: FormData) {
  const id = String(formData.get('id') ?? '');
  if (!id) throw new Error('Missing id');
  await markContacted(id);
  revalidatePath('/admin');
  revalidatePath('/admin/leads');
  revalidatePath(`/admin/leads/${id}`);
}
