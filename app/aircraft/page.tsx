import { Metadata } from 'next';
import Navigation from '@/components/Navigation';
import Link from 'next/link';
import { 
  Plane,
  Users,
  Gauge,
  Navigation2,
  Shield,
  Fuel
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Our Aircraft - Modern Fleet for Flight Training',
  description: 'Explore GoFlyTexas fleet of well-maintained training aircraft. Cessna 172s and Piper Warriors equipped with modern avionics for safe, effective flight training.',
  openGraph: {
    title: 'Our Aircraft - Modern Fleet | GoFlyTexas',
    description: 'Explore GoFlyTexas fleet of well-maintained training aircraft. Modern avionics, GPS navigation, and perfect for flight training.',
  },
};

// Aircraft data - Our Cessna 172 N model fleet
const aircraft = [
  {
    id: 1,
    model: "Cessna 172N Skyhawk",
    registration: "N4501E",
    year: null,
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
    year: null,
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
    description: "Identical model ensuring consistent training experience across our fleet."
  },
  {
    id: 3,
    model: "Cessna 172N Skyhawk",
    registration: "N5550J",
    year: null,
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
    description: "Consistent fleet means you can train in any aircraft with minimal differences."
  }
];

export default function AircraftPage() {
  return (
    <main className="min-h-screen">
      <Navigation />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-sky-50 to-white pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Our Aircraft Fleet
            </h1>
            <p className="text-xl text-gray-900 mb-8">
              Train in modern, well-maintained aircraft equipped with the latest avionics. 
              Our diverse fleet ensures you'll find the perfect aircraft for your training needs.
            </p>
          </div>
        </div>
      </section>

      {/* Fleet Overview */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="bg-white p-6 rounded-lg shadow-sm text-center">
              <div className="w-16 h-16 bg-sky-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Plane className="h-8 w-8 text-sky-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Modern Fleet</h3>
              <p className="text-gray-900">All aircraft less than 5 years old with latest equipment</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm text-center">
              <div className="w-16 h-16 bg-sky-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-sky-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">100-Hour Inspections</h3>
              <p className="text-gray-900">Rigorous maintenance program exceeding FAA requirements</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm text-center">
              <div className="w-16 h-16 bg-sky-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Navigation2 className="h-8 w-8 text-sky-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">GPS Equipped</h3>
              <p className="text-gray-900">Advanced navigation systems in every aircraft</p>
            </div>
          </div>

          {/* Aircraft Cards */}
          <div className="space-y-16">
            {aircraft.map((plane) => (
              <div key={plane.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="grid lg:grid-cols-2">
                  {/* Image Placeholder */}
                  <div className="bg-gradient-to-br from-sky-100 to-sky-200 p-12 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-8xl mb-4">✈️</div>
                      <p className="text-sky-800 font-medium text-lg">{plane.model}</p>
                      <p className="text-sky-700">{plane.registration}</p>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-8 lg:p-12">
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">{plane.model}</h2>
                    <p className="text-2xl text-sky-600 font-semibold mb-4">{plane.hourlyRate}/hour</p>
                    <p className="text-gray-900 mb-6">{plane.description}</p>

                    {/* Features */}
                    <div className="mb-6">
                      <h3 className="font-semibold text-gray-900 mb-3">Key Features</h3>
                      <ul className="grid grid-cols-2 gap-2">
                        {plane.features.map((feature, index) => (
                          <li key={index} className="flex items-start">
                            <span className="text-sky-600 mr-2">•</span>
                            <span className="text-gray-900 text-sm">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Specifications */}
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3">Specifications</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center space-x-2">
                          <Gauge className="h-4 w-4 text-sky-600" />
                          <span className="text-sm text-gray-900">Cruise: {plane.specs.cruiseSpeed}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Navigation2 className="h-4 w-4 text-sky-600" />
                          <span className="text-sm text-gray-900">Range: {plane.specs.range}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Plane className="h-4 w-4 text-sky-600" />
                          <span className="text-sm text-gray-900">Ceiling: {plane.specs.ceiling}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Fuel className="h-4 w-4 text-sky-600" />
                          <span className="text-sm text-gray-900">Fuel: {plane.specs.fuelCapacity}</span>
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
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Aircraft Rental Information
          </h2>
          
          <div className="bg-sky-50 rounded-lg p-8 mb-8">
            <h3 className="text-xl font-semibold mb-4">Rental Requirements</h3>
            <ul className="space-y-2">
              <li className="flex items-start">
                <span className="text-sky-600 mr-2">✓</span>
                <span>Valid pilot certificate and medical</span>
              </li>
              <li className="flex items-start">
                <span className="text-sky-600 mr-2">✓</span>
                <span>Checkout with GoFlyTexas instructor</span>
              </li>
              <li className="flex items-start">
                <span className="text-sky-600 mr-2">✓</span>
                <span>Current renter's insurance</span>
              </li>
              <li className="flex items-start">
                <span className="text-sky-600 mr-2">✓</span>
                <span>90-day currency requirement</span>
              </li>
            </ul>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-semibold mb-4">Hourly Rates Include</h3>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <span className="text-sky-600 mr-2">•</span>
                  <span>Fuel costs</span>
                </li>
                <li className="flex items-start">
                  <span className="text-sky-600 mr-2">•</span>
                  <span>Basic insurance coverage</span>
                </li>
                <li className="flex items-start">
                  <span className="text-sky-600 mr-2">•</span>
                  <span>Oil and consumables</span>
                </li>
                <li className="flex items-start">
                  <span className="text-sky-600 mr-2">•</span>
                  <span>GPS database updates</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-4">Block Time Discounts</h3>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <span className="text-sky-600 mr-2">•</span>
                  <span>10 hours: 3% discount</span>
                </li>
                <li className="flex items-start">
                  <span className="text-sky-600 mr-2">•</span>
                  <span>25 hours: 5% discount</span>
                </li>
                <li className="flex items-start">
                  <span className="text-sky-600 mr-2">•</span>
                  <span>50 hours: 8% discount</span>
                </li>
                <li className="flex items-start">
                  <span className="text-sky-600 mr-2">•</span>
                  <span>100 hours: 10% discount</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-sky-600 to-sky-700 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-6">
            Ready to Fly Our Fleet?
          </h2>
          <p className="text-xl mb-8 text-sky-100">
            Schedule a Discovery Flight or start your pilot training today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/discovery-flight"
              className="inline-flex items-center justify-center px-8 py-3 bg-white text-sky-600 font-semibold rounded-full hover:bg-gray-100 transition-colors"
            >
              Book Discovery Flight
            </Link>
            <a
              href="tel:+1234567890"
              className="inline-flex items-center justify-center px-8 py-3 bg-sky-500 text-white font-semibold rounded-full hover:bg-sky-400 transition-colors"
            >
              Call (123) 456-7890
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p>&copy; {new Date().getFullYear()} GoFlyTexas. All rights reserved.</p>
        </div>
      </footer>
    </main>
  );
}