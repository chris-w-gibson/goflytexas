import { Resend } from 'resend';
import type { Lead } from './db/schema';
import { parseEmailList } from './followup';

const FROM_DEFAULT = 'GoFlyTexas <info@goflytexas.com>';
const ADMIN_DEFAULT = 'info@goflytexas.com';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://goflytexas.com';

let _resend: Resend | null = null;
function getResend(): Resend {
  if (!_resend) {
    if (!process.env.RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY is not set');
    }
    _resend = new Resend(process.env.RESEND_API_KEY);
  }
  return _resend;
}

const INTEREST_LABEL: Record<string, string> = {
  private: 'Private Pilot License',
  instrument: 'Instrument Rating',
  commercial: 'Commercial License',
  rental: 'Aircraft Rental',
  tour: 'Aerial Tour',
  ferry: 'Ferry Flight',
  insurance: 'Insurance Checkout',
  biennial: 'Biannual Review (BFR)',
  other: 'Other',
};

function interestLabel(key: string | null | undefined): string {
  if (!key) return 'Not specified';
  return INTEREST_LABEL[key] ?? key;
}

function unsubLink(token: string): string {
  return `${SITE_URL}/unsubscribe?token=${token}`;
}

function fromAddress(): string {
  return process.env.EMAIL_FROM ?? FROM_DEFAULT;
}

function adminAddress(): string {
  return process.env.ADMIN_EMAIL ?? ADMIN_DEFAULT;
}

const PHONE_HTML = `<a href="tel:+19409053090" style="color:#0c2340;"><strong>(940) 905-3090</strong></a>`;
const FOOTER_HTML = `
      <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;" />
      <p style="font-size:13px;color:#6b7280;">Aero Valley Airport (52F) · 104 Boeing Way · Roanoke, TX 76262</p>`;

function firstName(name: string): string {
  return name.trim().split(/\s+/)[0] || name;
}

function wrap(inner: string): string {
  return `<div style="font-family:-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif;max-width:600px;margin:auto;color:#1f2937;line-height:1.5;">${inner}</div>`;
}

/**
 * Instant acknowledgement to the prospect. Jim's rule (8/27): people talk to
 * three other schools if they don't hear back fast, so this promises a quick
 * human follow-up and gives them a way to skip the wait.
 */
export async function sendAutoReply(lead: Lead): Promise<void> {
  const wantsCall = lead.preferredContact === 'phone' && !!lead.phone;
  const interest = interestLabel(lead.flightInterest);
  const isDiscovery = /discovery/i.test(lead.flightInterest ?? '');
  const html = wrap(`
      <h2 style="color:#0c2340;">Got it, ${escape(firstName(lead.name))} &mdash; we're on it.</h2>
      <p>Thanks for reaching out about <strong>${escape(interest)}</strong>.
      ${
        wantsCall
          ? `One of our instructors will <strong>call you at ${escape(lead.phone!)}</strong> shortly &mdash; usually within the hour during the day.`
          : `One of our instructors will <strong>reply to this email</strong> shortly &mdash; usually within the hour during the day.`
      }</p>
      <p>Don't want to wait? Call us now at ${PHONE_HTML}. Open daily 8a&ndash;5p, flights by appointment 24/7.</p>
      ${
        isDiscovery
          ? `<p>Quick preview of what you booked: a <strong>discovery flight</strong> is one hour in the left seat of a Cessna 172 with a certified instructor beside you. You'll taxi, take off and fly the airplane yourself &mdash; no experience needed. We confirm the day and time by phone.</p>`
          : `<p>Not sure where to start? The easiest first step is a <strong>discovery flight</strong> &mdash; one hour flying a Cessna 172 yourself with an instructor beside you. Just reply "discovery flight" and we'll set it up.</p>`
      }
      <p>Blue skies,<br/>The GoFlyTexas team</p>
      ${FOOTER_HTML}
      <p style="font-size:11px;color:#9ca3af;">Don't want emails from us? <a href="${unsubLink(lead.unsubscribeToken)}" style="color:#9ca3af;">Unsubscribe</a>.</p>
  `);
  const { error } = await getResend().emails.send({
    from: fromAddress(),
    to: lead.email,
    subject: wantsCall
      ? `Got it, ${firstName(lead.name)} — GoFlyTexas will call you shortly`
      : `Got your message, ${firstName(lead.name)} — here's what happens next`,
    html,
    replyTo: adminAddress(),
  });
  throwIfError(error);
}

function attributionLabel(attr: unknown): string | null {
  if (!attr || typeof attr !== 'object') return null;
  const a = attr as Record<string, string>;
  if (a.gclid) return 'Google Ads';
  if (a.utm_source) return `${a.utm_source}${a.utm_campaign ? ` / ${a.utm_campaign}` : ''}`;
  return null;
}

/**
 * Owner alert. Goes to ADMIN_EMAIL plus LEAD_NOTIFY_EMAILS. Built to be acted
 * on from a phone: tap-to-call, tap-to-email, and a one-click "I've reached
 * out" button that stamps the first-response time (no login needed).
 */
export async function sendAdminNotification(lead: Lead): Promise<void> {
  const interest = interestLabel(lead.flightInterest);
  const ackUrl = `${SITE_URL}/ack?token=${lead.contactToken}`;
  const adminUrl = `${SITE_URL}/admin/leads/${lead.id}`;
  const source = attributionLabel(lead.attribution);
  const phoneDigits = lead.phone ? lead.phone.replace(/\D/g, '') : '';
  const html = wrap(`
      <p style="margin:0 0 4px;font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#b91c1c;font-weight:700;">New lead &mdash; reply within 10 minutes</p>
      <h2 style="color:#0c2340;margin:0 0 12px;">${escape(lead.name)} &middot; ${escape(interest)}</h2>
      ${
        lead.phone
          ? `<p style="margin:0 0 8px;"><a href="tel:+1${phoneDigits}" style="display:inline-block;background:#0c2340;color:#fff;padding:12px 18px;border-radius:8px;text-decoration:none;font-weight:700;font-size:16px;">&#128222; Call ${escape(lead.phone)}</a></p>`
          : ''
      }
      <p style="margin:0 0 16px;"><a href="mailto:${escape(lead.email)}" style="display:inline-block;border:1px solid #0c2340;color:#0c2340;padding:10px 16px;border-radius:8px;text-decoration:none;font-weight:600;">&#9993; Email ${escape(lead.email)}</a></p>
      <table style="border-collapse:collapse;width:100%;font-size:14px;">
        <tr><td style="padding:4px 0;color:#6b7280;width:140px;">Prefers</td><td>${escape(lead.preferredContact ?? 'email')}</td></tr>
        <tr><td style="padding:4px 0;color:#6b7280;">Came from</td><td>${escape(source ?? 'Direct / organic')}</td></tr>
        <tr><td style="padding:4px 0;color:#6b7280;">Submitted</td><td>${escape(new Date(lead.createdAt).toLocaleString('en-US', { timeZone: 'America/Chicago' }))} CT</td></tr>
        ${lead.message ? `<tr><td style="padding:4px 0;color:#6b7280;vertical-align:top;">Message</td><td style="white-space:pre-wrap;">${escape(lead.message)}</td></tr>` : ''}
      </table>
      <p style="margin:20px 0 6px;"><a href="${ackUrl}" style="display:inline-block;background:#15803d;color:#fff;padding:12px 18px;border-radius:8px;text-decoration:none;font-weight:700;">&#10003; I've reached out</a></p>
      <p style="margin:0;font-size:12px;color:#6b7280;">Tap after you call or email &mdash; it records the response time so we can see how fast leads get handled. Or <a href="${adminUrl}" style="color:#0c2340;">open the lead in admin</a>.</p>
      ${FOOTER_HTML}
  `);
  const recipients = Array.from(
    new Set([adminAddress(), ...parseEmailList(process.env.LEAD_NOTIFY_EMAILS)]),
  );
  const { error } = await getResend().emails.send({
    from: fromAddress(),
    to: recipients,
    subject: `New lead · ${lead.name} · ${lead.phone ?? lead.email} · ${interest}`,
    html,
    replyTo: lead.email,
  });
  throwIfError(error);
}

/**
 * Staggered follow-up drip, one distinct message per step (default day 7 / 14 /
 * 21). Copy per Jim (8/27): curiosity and low-friction next steps rather than a
 * weekly nag; step 3 is a graceful last touch that leaves the door open.
 */
export async function sendFollowup(lead: Lead, step: number): Promise<void> {
  const name = escape(firstName(lead.name));
  const unsub = `<p style="font-size:11px;color:#9ca3af;">Don't want these check-ins? <a href="${unsubLink(lead.unsubscribeToken)}" style="color:#9ca3af;">Unsubscribe anytime</a>.</p>`;
  let subject: string;
  let body: string;

  if (step === 1) {
    subject = `Still curious about flying, ${firstName(lead.name)}?`;
    body = `
      <h2 style="color:#0c2340;">Still curious, ${name}?</h2>
      <p>You reached out to us about <strong>${escape(interestLabel(lead.flightInterest))}</strong> last week and we wanted to make sure a busy week didn't bury it.</p>
      <p>Here's the part most people don't expect: on a <strong>discovery flight</strong> you're not a passenger. You taxi, you take off, and you fly the Cessna 172 yourself for an hour with an instructor right beside you. No experience, no commitment, no paperwork beyond a signature.</p>
      <p>We're at Aero Valley (52F) in Roanoke and can fit you in most days &mdash; you pick the day and time. Just reply with a day that works, or call ${PHONE_HTML}.</p>
      <p>Blue skies,<br/>The GoFlyTexas team</p>`;
  } else if (step === 2) {
    subject = `The first hour changes people`;
    body = `
      <h2 style="color:#0c2340;">Every pilot at 52F started with one hour, ${name}.</h2>
      <p>Private pilots, instrument students, the instructors who teach here &mdash; all of them took that first flight not knowing if it was for them. Nobody comes back from it neutral.</p>
      <p>If something's holding you back, tell us honestly. Reply with one word &mdash; <em>cost</em>, <em>time</em>, <em>nerves</em>, <em>later</em> &mdash; and we'll give you a straight answer, not a pitch. (Cost is the usual one, and the block-time math is friendlier than most people expect.)</p>
      <p>Or skip the questions and just book the hour: call ${PHONE_HTML} or reply to this email.</p>
      <p>Blue skies,<br/>The GoFlyTexas team</p>`;
  } else {
    subject = `Last one from us, ${firstName(lead.name)}`;
    body = `
      <h2 style="color:#0c2340;">We'll stop here, ${name}.</h2>
      <p>This is the last check-in we'll send &mdash; nobody likes an inbox full of follow-ups. The door stays open as long as you like.</p>
      <p>When the timing's right, the fastest way in is a call to ${PHONE_HTML}, or a reply to this email. If "not now, but maybe next month" is closer to the truth, reply with <em>next month</em> and we'll check in once, then.</p>
      <p>Thanks for looking us up. Blue skies,<br/>The GoFlyTexas team</p>`;
  }

  const { error } = await getResend().emails.send({
    from: fromAddress(),
    to: lead.email,
    subject,
    html: wrap(`${body}${FOOTER_HTML}${unsub}`),
    replyTo: adminAddress(),
  });
  throwIfError(error);
}

export async function sendUserInvite(
  toEmail: string,
  toName: string,
  tempPassword: string,
): Promise<void> {
  const html = `
    <div style="font-family:-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif;max-width:600px;margin:auto;color:#1f2937;">
      <h2 style="color:#0c2340;">You've been invited to GoFlyTexas Admin</h2>
      <p>Hi ${escape(toName)} — an account was created for you on the GoFlyTexas admin console.</p>
      <p>Your temporary password is below. You'll be asked to set a new one on first login.</p>
      <div style="background:#f1f5f9;border:1px solid #e2e8f0;border-radius:8px;padding:16px;margin:16px 0;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:16px;letter-spacing:0.5px;">
        ${escape(tempPassword)}
      </div>
      <p>
        <a href="${SITE_URL}/login" style="display:inline-block;background:#0c2340;color:white;padding:10px 18px;border-radius:8px;text-decoration:none;font-weight:600;">Sign in &rarr;</a>
      </p>
      <p style="font-size:13px;color:#6b7280;">Email: ${escape(toEmail)}</p>
      <p style="font-size:13px;color:#6b7280;">If you weren't expecting this, you can ignore the email.</p>
    </div>
  `;
  const { error } = await getResend().emails.send({
    from: fromAddress(),
    to: toEmail,
    subject: `You're invited to GoFlyTexas Admin`,
    html,
    replyTo: adminAddress(),
  });
  throwIfError(error);
}

export async function sendPasswordResetEmail(
  toEmail: string,
  toName: string,
  resetToken: string,
): Promise<void> {
  const link = `${SITE_URL}/login/reset?token=${resetToken}`;
  const html = `
    <div style="font-family:-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif;max-width:600px;margin:auto;color:#1f2937;">
      <h2 style="color:#0c2340;">Reset your GoFlyTexas Admin password</h2>
      <p>Hi ${escape(toName)} — we got a request to reset the password for ${escape(toEmail)}.</p>
      <p>Click the button below to choose a new password. The link expires in <strong>1 hour</strong>.</p>
      <p>
        <a href="${link}" style="display:inline-block;background:#0c2340;color:white;padding:10px 18px;border-radius:8px;text-decoration:none;font-weight:600;">Reset password &rarr;</a>
      </p>
      <p style="font-size:12px;color:#6b7280;word-break:break-all;">Or paste this link: ${link}</p>
      <p style="font-size:13px;color:#6b7280;">If you didn't request this, you can safely ignore this email.</p>
    </div>
  `;
  const { error } = await getResend().emails.send({
    from: fromAddress(),
    to: toEmail,
    subject: `Reset your GoFlyTexas Admin password`,
    html,
    replyTo: adminAddress(),
  });
  throwIfError(error);
}

function throwIfError(error: { name?: string; message?: string } | null): void {
  if (error) {
    const msg = error.message ?? error.name ?? 'Resend send failed';
    throw new Error(`Resend: ${msg}`);
  }
}

function escape(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
