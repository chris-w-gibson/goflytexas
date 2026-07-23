// Google Ads conversion helpers.
// The base gtag.js tag (AW-986774654) is loaded in app/layout.tsx.
// Conversion "send_to" values are created in the Google Ads account and supplied
// via env vars so the site code and the Ads-side setup stay decoupled — set a
// var and the event fires; leave it unset and the call is a safe no-op.

type GtagFn = (
  command: 'event' | 'config' | 'js' | 'set',
  action: string,
  params?: Record<string, unknown>,
) => void;

declare global {
  interface Window {
    gtag?: GtagFn;
    dataLayer?: unknown[];
  }
}

function fireConversion(sendTo: string | undefined, extra?: Record<string, unknown>) {
  if (typeof window === 'undefined' || !window.gtag || !sendTo) return;
  window.gtag('event', 'conversion', { send_to: sendTo, ...extra });
}

/** Fire when a visitor submits the contact form or the chat lead form. */
export function reportLead() {
  fireConversion(process.env.NEXT_PUBLIC_GADS_CONV_LEAD);
}

/** Fire when a visitor clicks a tel: link (click-to-call). */
export function reportCall() {
  fireConversion(process.env.NEXT_PUBLIC_GADS_CONV_CALL);
}
