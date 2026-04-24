"use client";

import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import Link from 'next/link';
import {
  Plane,
  Gauge,
  Navigation2,
  Shield,
  Fuel
} from 'lucide-react';
import ImageCarousel from '@/components/ImageCarousel';

const aircraft = [
  {
    id: 1,
    model: "Cessna 172N Skyhawk",
    registration: "N4501E",
    image: "/4501E in T Hangar.jpg",
    features: [
      "Proven Training Platform",
      "GPS Navigation",
      "4-Seat Configuration",
      "Dual Controls",
      "High Wing Design",
      "Excellent Visibility"
    ],
    specs: {
      cruiseSpeed: "122 knots",
      range: "640 nm",
      ceiling: "13,500 ft",
      fuelCapacity: "40 gal"
    },
    hourlyRate: "Competitive Rates",
    description: "Reliable and proven trainer, perfect for all stages of flight training."
  },
  {
    id: 2,
    model: "Cessna 172N Skyhawk",
    registration: "N5217D",
    image: "/IMG_4957.jpeg",
    features: [
      "Proven Training Platform",
      "GPS Navigation",
      "4-Seat Configuration",
      "Dual Controls",
      "High Wing Design",
      "Excellent Visibility"
    ],
    specs: {
      cruiseSpeed: "122 knots",
      range: "640 nm",
      ceiling: "13,500 ft",
      fuelCapacity: "40 gal"
    },
    hourlyRate: "Competitive Rates",
    description: "Brown/copper stripe. Reliable trainer with modern GPS navigation, perfect for all stages of flight training."
  },
  {
    id: 3,
    model: "Cessna 172N Skyhawk",
    registration: "N737ET",
    image: "/N737ET-hangar.jpg",
    features: [
      "Proven Training Platform",
      "GPS Navigation",
      "4-Seat Configuration",
      "Dual Controls",
      "High Wing Design",
      "Excellent Visibility"
    ],
    specs: {
      cruiseSpeed: "122 knots",
      range: "640 nm",
      ceiling: "13,500 ft",
      fuelCapacity: "40 gal"
    },
    hourlyRate: "Competitive Rates",
    description: "Red stripe. Well-equipped trainer maintained to the highest standards for safety and comfort."
  },
  {
    id: 4,
    model: "Cessna 172N Skyhawk",
    registration: "N738UY",
    image: "/IMG_4954.jpeg",
    features: [
      "Proven Training Platform",
      "GPS Navigation",
      "4-Seat Configuration",
      "Dual Controls",
      "High Wing Design",
      "Excellent Visibility"
    ],
    specs: {
      cruiseSpeed: "122 knots",
      range: "640 nm",
      ceiling: "13,500 ft",
      fuelCapacity: "40 gal"
    },
    hourlyRate: "Competitive Rates",
    description: "Blue stripe. Advanced avionics suite ensuring a consistent, modern training experience."
  }
];

export default function AircraftPage() {
  return (
    <main className="min-h-screen">
      <Navigation />

      {/* Hero Section */}
      <section className="bg-navy-950 pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Our Aircraft Fleet
            </h1>
            <p className="text-xl text-navy-200 mb-8">
              Train in modern, well-maintained Cessna 172N Skyhawks equipped with GPS navigation.
              Our fleet of four aircraft ensures availability for your training schedule.
            </p>
          </div>
        </div>
      </section>

      {/* Fleet Overview */}
      <section className="py-16 bg-navy-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="bg-navy-800 p-6 rounded-lg border border-navy-700 text-center">
              <div className="w-16 h-16 bg-navy-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <Plane className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Consistent Fleet</h3>
              <p className="text-navy-300">All Cessna 172N — train in any aircraft with minimal differences</p>
            </div>

            <div className="bg-navy-800 p-6 rounded-lg border border-navy-700 text-center">
              <div className="w-16 h-16 bg-navy-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">100-Hour Inspections</h3>
              <p className="text-navy-300">Rigorous maintenance program exceeding FAA requirements</p>
            </div>

            <div className="bg-navy-800 p-6 rounded-lg border border-navy-700 text-center">
              <div className="w-16 h-16 bg-navy-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <Navigation2 className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">GPS Equipped</h3>
              <p className="text-navy-300">Advanced navigation systems in every aircraft</p>
            </div>
          </div>

          {/* Aircraft Cards */}
          <div className="space-y-16">
            {aircraft.map((plane) => (
              <div key={plane.id} className="bg-navy-800 rounded-lg shadow-lg overflow-hidden border border-navy-700">
                <div className="grid lg:grid-cols-2">
                  {/* Aircraft Image Carousel */}
                  <div className="p-4 lg:p-6">
                    <ImageCarousel
                      locationPrefix={`aircraft-${plane.registration.toLowerCase()}`}
                      imageCount={5}
                    />
                  </div>

                  {/* Content */}
                  <div className="p-8 lg:p-12">
                    <h2 className="text-3xl font-bold text-white mb-1">{plane.registration}</h2>
                    <p className="text-lg text-navy-300 mb-2">{plane.model}</p>
                    <p className="text-navy-200 mb-6">{plane.description}</p>

                    {/* Features */}
                    <div className="mb-6">
                      <h3 className="font-semibold text-white mb-3">Key Features</h3>
                      <ul className="grid grid-cols-2 gap-2">
                        {plane.features.map((feature, index) => (
                          <li key={index} className="flex items-start">
                            <span className="text-navy-400 mr-2">•</span>
                            <span className="text-navy-200 text-sm">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Specifications */}
                    <div>
                      <h3 className="font-semibold text-white mb-3">Specifications</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center space-x-2">
                          <Gauge className="h-4 w-4 text-navy-400" />
                          <span className="text-sm text-navy-200">Cruise: {plane.specs.cruiseSpeed}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Navigation2 className="h-4 w-4 text-navy-400" />
                          <span className="text-sm text-navy-200">Range: {plane.specs.range}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Plane className="h-4 w-4 text-navy-400" />
                          <span className="text-sm text-navy-200">Ceiling: {plane.specs.ceiling}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Fuel className="h-4 w-4 text-navy-400" />
                          <span className="text-sm text-navy-200">Fuel: {plane.specs.fuelCapacity}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Rental Information */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-navy-900 mb-12">
            Aircraft Rental Information
          </h2>

          <div className="bg-navy-50 rounded-lg p-8 mb-8 border border-navy-100">
            <h3 className="text-xl font-semibold text-navy-900 mb-4">Rental Requirements</h3>
            <ul className="space-y-2">
              <li className="flex items-start">
                <span className="text-navy-600 mr-2">✓</span>
                <span className="text-navy-800">Valid pilot certificate and medical</span>
              </li>
              <li className="flex items-start">
                <span className="text-navy-600 mr-2">✓</span>
                <span className="text-navy-800">Checkout with GoFlyTexas instructor</span>
              </li>
              <li className="flex items-start">
                <span className="text-navy-600 mr-2">✓</span>
                <span className="text-navy-800">Current renter's insurance</span>
              </li>
              <li className="flex items-start">
                <span className="text-navy-600 mr-2">✓</span>
                <span className="text-navy-800">90-day currency requirement</span>
              </li>
            </ul>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-semibold text-navy-900 mb-4">Hourly Rates Include</h3>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <span className="text-navy-600 mr-2">•</span>
                  <span className="text-navy-700">Fuel costs</span>
                </li>
                <li className="flex items-start">
                  <span className="text-navy-600 mr-2">•</span>
                  <span className="text-navy-700">Oil and consumables</span>
                </li>
                <li className="flex items-start">
                  <span className="text-navy-600 mr-2">•</span>
                  <span className="text-navy-700">GPS database updates</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-navy-900 mb-4">Block Time Discounts</h3>
              <p className="text-navy-700 leading-relaxed">
                Discounted hourly rates are available with the purchase of block time, sold in
                <span className="font-semibold"> 10, 25, and 50 hour</span> blocks.
                The more you buy, the more you save. Contact us for current pricing.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-navy-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-6">
            Ready to Fly Our Fleet?
          </h2>
          <p className="text-xl mb-8 text-navy-200">
            Get in touch to talk rentals, training, or a checkout.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center px-8 py-3 bg-white text-navy-900 font-semibold rounded-full hover:bg-navy-100 transition-colors"
            >
              Contact Us
            </Link>
            <a
              href="tel:+19409053090"
              className="inline-flex items-center justify-center px-8 py-3 bg-navy-700 text-white font-semibold rounded-full hover:bg-navy-600 transition-colors"
            >
              Call (940) 905-3090
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
