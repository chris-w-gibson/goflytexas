"use client";

import Link from 'next/link';
import { useRef } from 'react';
import { ArrowRight, Star, MapPin } from 'lucide-react';

const LOOP_START_SECONDS = 5;

export default function Hero() {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const handleEnded = () => {
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = LOOP_START_SECONDS;
    void v.play();
  };

  return (
    <div className="relative bg-navy-950 pt-16 overflow-hidden min-h-[80vh] flex items-center">
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover"
        autoPlay
        muted
        playsInline
        preload="metadata"
        poster="/IMG_4239.JPG"
        aria-hidden="true"
        onEnded={handleEnded}
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
