"use client";

import Image from 'next/image';
import { ExternalLink, MapPin } from 'lucide-react';

interface LocationMapProps {
  imageSrc?: string | null;
  alt?: string;
  directionsUrl?: string;
}

export default function LocationMap({
  imageSrc = null,
  alt = 'Map showing GoFlyTexas at Aero Valley Airport',
  directionsUrl = 'https://www.google.com/maps/dir/?api=1&destination=104+Boeing+Way+Roanoke+TX+76272',
}: LocationMapProps) {
  return (
    <a
      href={directionsUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="relative block w-full h-[450px] group"
      aria-label="Open directions to GoFlyTexas in Google Maps"
    >
      {imageSrc ? (
        <Image
          src={imageSrc}
          alt={alt}
          fill
          className="object-cover"
          sizes="(max-width: 1280px) 100vw, 1280px"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-navy-100 via-navy-200 to-navy-300 flex items-center justify-center">
          <div className="text-center px-4">
            <MapPin className="h-12 w-12 text-navy-700 mx-auto mb-3" />
            <p className="text-navy-900 font-semibold text-lg">GoFlyTexas</p>
            <p className="text-navy-700 text-sm">104 Boeing Way, Roanoke, TX 76272</p>
            <p className="text-navy-600 text-xs mt-2">Aero Valley Airport (52F)</p>
          </div>
        </div>
      )}
      <div className="absolute top-4 left-4 inline-flex items-center gap-2 bg-white/95 backdrop-blur-sm text-navy-900 px-4 py-2 rounded-lg shadow-md text-sm font-medium group-hover:bg-white transition-colors">
        <ExternalLink className="h-4 w-4" />
        Get Directions
      </div>
    </a>
  );
}
