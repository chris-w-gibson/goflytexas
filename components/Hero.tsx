"use client";

import Link from 'next/link';
import { ArrowRight, Star, MapPin } from 'lucide-react';
import EditableImage from './EditableImage';

export default function Hero() {
  return (
    <div className="relative bg-navy-950 pt-16 overflow-hidden">
      {/* Transparent logo watermark filling entire hero section */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
        <img
          src="/GFT-logo.png"
          alt=""
          aria-hidden="true"
          className="min-w-[150%] min-h-[150%] object-contain opacity-40"
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Text Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-2 text-white">
                <Star className="h-5 w-5 fill-current" />
                <Star className="h-5 w-5 fill-current" />
                <Star className="h-5 w-5 fill-current" />
                <Star className="h-5 w-5 fill-current" />
                <Star className="h-5 w-5 fill-current" />
                <span className="text-sm font-medium text-navy-200">Rated 5/5 by Students</span>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white">
                Let's Go Fly!
                <span className="text-navy-300 block">Your DFW Flight Training</span>
              </h1>

              <p className="text-xl text-navy-200">
                One-on-one pilot training at Aero Valley Airport.
                Aircraft rentals and flight training for pilots of all levels.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
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

            <div className="flex items-center space-x-2 text-sm text-navy-300">
              <MapPin className="h-5 w-5 text-white" />
              <span>Aero Valley Airport (52F) - Roanoke, TX</span>
            </div>
          </div>

          {/* Hero Image */}
          <div className="relative">
            <div className="rounded-2xl shadow-2xl overflow-hidden border border-navy-700">
              <EditableImage
                locationId="hero-main"
                alt="GoFlyTexas Cessna fleet at Aero Valley Airport"
                className="w-full h-full object-cover"
                aspectRatio="aspect-[4/3]"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
