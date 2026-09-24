// The leads list's query-string contract (Jim 2026-09-24, GFT Hub):
//   ?status=new|contacted|converted   pipeline stage
//   ?q=jack                          name / email / phone search
//   ?view=archived                    settled contacts (hidden by default)
//   ?subscribed=no                    unsubscribed, whatever their stage
// Old links with ?status=unsubscribed keep working: they mean ?subscribed=no.

export const PIPELINE_STATUSES = ['new', 'contacted', 'converted'] as const;
export type PipelineStatus = (typeof PIPELINE_STATUSES)[number];

export type LeadListParams = {
  status?: PipelineStatus;
  q?: string;
  view: 'active' | 'archived';
  subscribed?: boolean;
};

type RawParams = Record<string, string | string[] | undefined> | undefined;

function first(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v;
}

export function parseLeadListParams(raw: RawParams): LeadListParams {
  const status = first(raw?.status);
  const q = (first(raw?.q) ?? '').trim().slice(0, 80);
  const view = first(raw?.view) === 'archived' ? 'archived' : 'active';
  const sub = first(raw?.subscribed);
  const out: LeadListParams = { view };
  if (status && (PIPELINE_STATUSES as readonly string[]).includes(status)) {
    out.status = status as PipelineStatus;
  } else if (status === 'unsubscribed') {
    out.subscribed = false;
  }
  if (q) out.q = q;
  if (sub === 'no') out.subscribed = false;
  if (sub === 'yes') out.subscribed = true;
  return out;
}

/** Build the href for a filter link, keeping the other filters as they are. */
export function leadListHref(params: LeadListParams): string {
  const qs = new URLSearchParams();
  if (params.status) qs.set('status', params.status);
  if (params.q) qs.set('q', params.q);
  if (params.view === 'archived') qs.set('view', 'archived');
  if (params.subscribed === false) qs.set('subscribed', 'no');
  if (params.subscribed === true) qs.set('subscribed', 'yes');
  const s = qs.toString();
  return s ? `/admin/leads?${s}` : '/admin/leads';
}

export function subscriptionLabel(lead: { unsubscribed: boolean }): 'Subscribed' | 'Unsubscribed' {
  return lead.unsubscribed ? 'Unsubscribed' : 'Subscribed';
}

export function isArchived(lead: { archivedAt: Date | null }): boolean {
  return lead.archivedAt !== null && lead.archivedAt !== undefined;
}
