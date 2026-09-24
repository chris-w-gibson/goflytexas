'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import {
  archiveLead,
  createLead,
  deleteLead,
  markContacted,
  setSubscription,
  unarchiveLead,
  updateLeadStatus,
  type LeadStatus,
} from '@/lib/leads';
import { PIPELINE_STATUSES } from '@/lib/leadFilters';
import { leadInputSchema } from '@/lib/validation';

// Subscription is no longer a status (Jim 2026-09-24) — it has its own toggle.
const VALID_STATUSES: readonly LeadStatus[] = PIPELINE_STATUSES;

function revalidateLead(id?: string) {
  revalidatePath('/admin');
  revalidatePath('/admin/leads');
  if (id) revalidatePath(`/admin/leads/${id}`);
}

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
  revalidateLead();
  redirect('/admin/leads');
}

export async function updateStatusAction(formData: FormData) {
  const id = String(formData.get('id') ?? '');
  const status = String(formData.get('status') ?? '');
  if (!id || !VALID_STATUSES.includes(status as LeadStatus)) {
    throw new Error('Invalid id or status');
  }
  await updateLeadStatus(id, status as LeadStatus);
  revalidateLead(id);
}

export async function markContactedAction(formData: FormData) {
  const id = String(formData.get('id') ?? '');
  if (!id) throw new Error('Missing id');
  await markContacted(id);
  revalidateLead(id);
}

/** "Unsubscribe" / "Resubscribe" on the lead sheet — the flag, not the status. */
export async function setSubscriptionAction(formData: FormData) {
  const id = String(formData.get('id') ?? '');
  const subscribed = String(formData.get('subscribed') ?? '');
  if (!id || (subscribed !== 'yes' && subscribed !== 'no')) {
    throw new Error('Invalid id or subscription');
  }
  await setSubscription(id, subscribed === 'yes');
  revalidateLead(id);
}

/** Settled contacts leave the working list; subscription untouched. */
export async function archiveLeadAction(formData: FormData) {
  const id = String(formData.get('id') ?? '');
  if (!id) throw new Error('Missing id');
  await archiveLead(id);
  revalidateLead(id);
}

export async function unarchiveLeadAction(formData: FormData) {
  const id = String(formData.get('id') ?? '');
  if (!id) throw new Error('Missing id');
  await unarchiveLead(id);
  revalidateLead(id);
}

/**
 * Delete for good — the fake leads the AI call bot made during testing, which
 * the team now mistakes for real ones (Jim 2026-09-24). The form carries an
 * explicit confirm box; without it nothing happens.
 */
export async function deleteLeadAction(formData: FormData) {
  const id = String(formData.get('id') ?? '');
  if (!id) throw new Error('Missing id');
  if (formData.get('confirm') !== 'on') {
    throw new Error('Tick the confirm box to delete this lead');
  }
  await deleteLead(id);
  revalidateLead();
  redirect('/admin/leads?deleted=1');
}
