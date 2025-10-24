import Link from 'next/link';
import { ArrowRight, Star, Clock, MapPin } from 'lucide-react';

export default function Hero() {
  return (
    <div className="relative bg-gradient-to-br from-sky-50 to-white pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Text Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-2 text-sky-600">
                <Star className="h-5 w-5 fill-current" />
                <Star className="h-5 w-5 fill-current" />
                <Star className="h-5 w-5 fill-current" />
                <Star className="h-5 w-5 fill-current" />
                <Star className="h-5 w-5 fill-current" />
                <span className="text-sm font-medium">Rated 5/5 by 100+ Students</span>
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900">
                Your Aviation Journey 
                <span className="text-sky-600 block">Starts Here</span>
              </h1>
              
              <p className="text-xl text-gray-600">
                Experience the thrill of flying with our Discovery Flight program. 
                Professional instructors, modern aircraft, and the beautiful Texas sky await.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/discovery-flight"
                className="inline-flex items-center justify-center px-6 py-3 bg-sky-600 text-white font-semibold rounded-full hover:bg-sky-700 transition-colors group"
              >
                Book Discovery Flight
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              
              <Link
                href="/contact"
                className="inline-flex items-center justify-center px-6 py-3 bg-white text-sky-600 font-semibold rounded-full border-2 border-sky-600 hover:bg-sky-50 transition-colors"
              >
                Learn More
              </Link>
            </div>

            <div className="flex flex-col sm:flex-row gap-6 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-sky-600" />
                <span>30-60 min flights</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="h-5 w-5 text-sky-600" />
                <span>Dallas, Texas</span>
              </div>
            </div>
          </div>

          {/* Image/Video Placeholder */}
          <div className="relative">
            <div className="aspect-[4/3] bg-gradient-to-br from-sky-100 to-sky-200 rounded-2xl shadow-2xl overflow-hidden">
              {/* Replace with actual aircraft image */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center space-y-4 p-8">
                  <div className="text-6xl">✈️</div>
                  <p className="text-sky-800 font-medium">Aircraft Image Placeholder</p>
                  <p className="text-sky-700 text-sm">Professional photos of your aircraft fleet</p>
                </div>
              </div>
            </div>
            
            {/* Decorative Elements */}
            <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-sky-200 rounded-full blur-3xl opacity-50"></div>
            <div className="absolute -top-4 -left-4 w-24 h-24 bg-sky-300 rounded-full blur-2xl opacity-40"></div>
          </div>
        </div>
      </div>
    </div>
  );
}