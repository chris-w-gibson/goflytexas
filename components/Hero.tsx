"use client";

import Link from 'next/link';
import { useRef, useEffect } from 'react';
import { ArrowRight, Star, MapPin } from 'lucide-react';

const LOOP_START_SECONDS = 5;
const CROSSFADE_LEAD_MS = 700;
const CROSSFADE_DURATION_MS = 800;

export default function Hero() {
  const aRef = useRef<HTMLVideoElement | null>(null);
  const bRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const a = aRef.current;
    const b = bRef.current;
    if (!a || !b) return;

    let activeIsA = true;
    let swapTimer: ReturnType<typeof setTimeout> | null = null;
    let pauseTimer: ReturnType<typeof setTimeout> | null = null;
    let cancelled = false;

    const primeLoopFrame = (v: HTMLVideoElement) => {
      const seek = () => {
        try { v.currentTime = LOOP_START_SECONDS; } catch { /* noop */ }
      };
      if (v.readyState >= 1) seek();
      else v.addEventListener('loadedmetadata', seek, { once: true });
    };

    const scheduleSwap = () => {
      const active = activeIsA ? a : b;
      const next = activeIsA ? b : a;
      const dur = active.duration;
      if (!dur || !isFinite(dur)) {
        active.addEventListener('loadedmetadata', scheduleSwap, { once: true });
        return;
      }
      const remainingMs = Math.max(
        0,
        (dur - active.currentTime) * 1000 - CROSSFADE_LEAD_MS,
      );
      if (swapTimer) clearTimeout(swapTimer);
      swapTimer = setTimeout(() => {
        if (cancelled) return;
        try { next.currentTime = LOOP_START_SECONDS; } catch { /* noop */ }
        const playPromise = next.play();
        if (playPromise && typeof playPromise.then === 'function') {
          void playPromise.catch(() => {});
        }
        next.style.opacity = '1';
        active.style.opacity = '0';
        activeIsA = !activeIsA;
        if (pauseTimer) clearTimeout(pauseTimer);
        pauseTimer = setTimeout(() => {
          if (cancelled) return;
          active.pause();
          primeLoopFrame(active);
        }, CROSSFADE_DURATION_MS + 100);
        scheduleSwap();
      }, remainingMs);
    };

    const start = () => {
      if (cancelled) return;
      a.style.opacity = '1';
      b.style.opacity = '0';
      try { a.currentTime = 0; } catch { /* noop */ }
      void a.play();
      primeLoopFrame(b);
      scheduleSwap();
    };

    if (a.readyState >= 1) start();
    else a.addEventListener('loadedmetadata', start, { once: true });

    return () => {
      cancelled = true;
      if (swapTimer) clearTimeout(swapTimer);
      if (pauseTimer) clearTimeout(pauseTimer);
    };
  }, []);

  return (
    <div className="relative bg-navy-950 pt-16 overflow-hidden min-h-[80vh] flex items-center">
      <video
        ref={aRef}
        className="absolute inset-0 w-full h-full object-cover transition-opacity duration-[800ms] ease-in-out"
        style={{ opacity: 1 }}
        muted
        playsInline
        preload="auto"
        poster="/IMG_4239.JPG"
        aria-hidden="true"
      >
        <source src="/hero-loop.mp4" type="video/mp4" />
      </video>
      <video
        ref={bRef}
        className="absolute inset-0 w-full h-full object-cover transition-opacity duration-[800ms] ease-in-out"
        style={{ opacity: 0 }}
        muted
        playsInline
        preload="auto"
        aria-hidden="true"
      >
        <source src="/hero-loop.mp4" type="video/mp4" />
      </video>

      <div className="absolute inset-0 bg-navy-950/60" aria-hidden="true" />

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 text-center">
        <div className="space-y-8 animate-[fadeIn_1s_ease-out]">
          <div className="flex items-center justify-center space-x-2 text-white">
            <Star className="h-5 w-5 fill-current" />
            <Star className="h-5 w-5 fill-current" />
            <Star className="h-5 w-5 fill-current" />
            <Star className="h-5 w-5 fill-current" />
            <Star className="h-5 w-5 fill-current" />
            <span className="text-sm font-medium text-navy-100">Rated 5/5 by Students</span>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white drop-shadow-lg">
            Let&apos;s Go Fly!
            <span className="text-navy-100 block mt-2">Your DFW Flight Training</span>
          </h1>

          <p className="text-xl text-navy-100 max-w-2xl mx-auto drop-shadow">
            One-on-one pilot training at Aero Valley Airport.
            Aircraft rentals and flight training for pilots of all levels.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center px-6 py-3 bg-white text-navy-900 font-semibold rounded-full hover:bg-navy-100 transition-colors group"
            >
              Get in Touch
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>

            <a
              href="tel:+19409053090"
              className="inline-flex items-center justify-center px-6 py-3 bg-transparent text-white font-semibold rounded-full border-2 border-white hover:bg-white/10 transition-colors"
            >
              Call (940) 905-3090
            </a>
          </div>

          <div className="flex items-center justify-center space-x-2 text-sm text-navy-100">
            <MapPin className="h-5 w-5 text-white" />
            <span>Aero Valley Airport (52F) — Roanoke, TX</span>
          </div>
        </div>
      </div>
    </div>
  );
}
