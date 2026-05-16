import { Resend } from 'resend';
import type { Lead } from './db/schema';

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

export async function sendAutoReply(lead: Lead): Promise<void> {
  const html = `
    <div style="font-family:-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif;max-width:600px;margin:auto;color:#1f2937;">
      <h2 style="color:#0c2340;">Thanks for reaching out, ${escape(lead.name)}!</h2>
      <p>We got your message about <strong>${escape(interestLabel(lead.flightInterest))}</strong> and a real human at GoFlyTexas will be in touch within 24 hours.</p>
      <p>If you'd rather not wait, give us a call:</p>
      <p style="font-size:18px;"><strong><a href="tel:+19409053090" style="color:#0c2340;">(940) 905-3090</a></strong> &mdash; open daily 8a&ndash;5p, flights by appointment 24/7.</p>
      <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;" />
      <p style="font-size:13px;color:#6b7280;">Aero Valley Airport (52F) · 104 Boeing Way · Roanoke, TX 76262</p>
      <p style="font-size:11px;color:#9ca3af;">Don't want emails from us? <a href="${unsubLink(lead.unsubscribeToken)}" style="color:#9ca3af;">Unsubscribe</a>.</p>
    </div>
  `;
  const { error } = await getResend().emails.send({
    from: fromAddress(),
    to: lead.email,
    subject: `Thanks for reaching out to GoFlyTexas`,
    html,
    replyTo: adminAddress(),
  });
  throwIfError(error);
}

export async function sendAdminNotification(lead: Lead): Promise<void> {
  const interest = interestLabel(lead.flightInterest);
  const html = `
    <div style="font-family:-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif;max-width:600px;margin:auto;color:#1f2937;">
      <h2 style="color:#0c2340;">New lead: ${escape(lead.name)}</h2>
      <table style="border-collapse:collapse;width:100%;font-size:14px;">
        <tr><td style="padding:6px 0;color:#6b7280;width:140px;">Email</td><td><a href="mailto:${escape(lead.email)}">${escape(lead.email)}</a></td></tr>
        <tr><td style="padding:6px 0;color:#6b7280;">Phone</td><td>${escape(lead.phone ?? '—')}</td></tr>
        <tr><td style="padding:6px 0;color:#6b7280;">Interested in</td><td>${escape(interest)}</td></tr>
        <tr><td style="padding:6px 0;color:#6b7280;">Preferred contact</td><td>${escape(lead.preferredContact ?? 'email')}</td></tr>
        <tr><td style="padding:6px 0;color:#6b7280;vertical-align:top;">Message</td><td style="white-space:pre-wrap;">${escape(lead.message ?? '')}</td></tr>
      </table>
      <p style="margin-top:16px;">Manage this lead in the admin console.</p>
    </div>
  `;
  const { error } = await getResend().emails.send({
    from: fromAddress(),
    to: adminAddress(),
    subject: `[Lead] ${lead.name} — ${interest}`,
    html,
    replyTo: lead.email,
  });
  throwIfError(error);
}

export async function sendWeeklyFollowup(lead: Lead): Promise<void> {
  const html = `
    <div style="font-family:-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif;max-width:600px;margin:auto;color:#1f2937;">
      <h2 style="color:#0c2340;">Still curious about flying, ${escape(lead.name)}?</h2>
      <p>Just a friendly check-in from the GoFlyTexas team. We saw you reached out about <strong>${escape(interestLabel(lead.flightInterest))}</strong> and wanted to make sure you didn't fall through the cracks.</p>
      <p>A few ways to take the next step whenever you're ready:</p>
      <ul>
        <li>Book a <strong>discovery flight</strong> &mdash; the easiest way to see if flying clicks for you.</li>
        <li>Reply to this email with questions and we'll get back same-day.</li>
        <li>Call <a href="tel:+19409053090" style="color:#0c2340;"><strong>(940) 905-3090</strong></a> and talk to a real instructor.</li>
      </ul>
      <p>No pressure either way. Blue skies,<br/>The GoFlyTexas team</p>
      <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;" />
      <p style="font-size:13px;color:#6b7280;">Aero Valley Airport (52F) · 104 Boeing Way · Roanoke, TX 76262</p>
      <p style="font-size:11px;color:#9ca3af;">Don't want these check-ins? <a href="${unsubLink(lead.unsubscribeToken)}" style="color:#9ca3af;">Unsubscribe anytime</a>.</p>
    </div>
  `;
  const { error } = await getResend().emails.send({
    from: fromAddress(),
    to: lead.email,
    subject: `Still thinking about that discovery flight?`,
    html,
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
