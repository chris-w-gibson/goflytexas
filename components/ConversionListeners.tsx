'use client';

import { useEffect } from 'react';
import { reportCall } from '@/lib/gtag';

/**
 * Global click listener for tel: links so every "call" CTA across the site
 * (Hero, contact page, footer, chat) reports a click-to-call conversion
 * without wiring each link individually. Mounted once in the root layout.
 */
export function ConversionListeners() {
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      const link = target?.closest?.('a[href^="tel:"]');
      if (link) reportCall();
    };
    document.addEventListener('click', onClick, { capture: true });
    return () => document.removeEventListener('click', onClick, { capture: true });
  }, []);
  return null;
}
