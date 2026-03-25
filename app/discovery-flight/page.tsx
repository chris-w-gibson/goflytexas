"use client";

import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import Link from 'next/link';
import {
  Clock,
  DollarSign,
  CheckCircle,
  Calendar,
  Shield,
  Heart,
  Star,
  MapPin,
  Gift
} from 'lucide-react';
import EditableImage from '@/components/EditableImage';
import EditableBackground from '@/components/EditableBackground';

// Note: Metadata moved to layout for client components
const pageMetadata = {
  title: 'Discovery Flight - Experience Flying in Dallas',
  description: 'Take the controls on a Discovery Flight with GoFlyTexas. Professional instructors, modern aircraft, and unforgettable views of Dallas. Book your $99 intro flight today!',
  openGraph: {
    title: 'Discovery Flight - Experience Flying in Dallas | GoFlyTexas',
    description: 'Take the controls on a Discovery Flight with GoFlyTexas. Professional instructors, modern aircraft, and unforgettable views of Dallas.',
  },
};

export default function DiscoveryFlightPage() {
  return (
    <main className="min-h-screen">
      <Navigation />

      {/* Hero Section */}
      <section className="bg-navy-900 pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero Image */}
          <div className="max-w-4xl mx-auto mb-12 rounded-2xl overflow-hidden shadow-xl">
            <EditableImage
              locationId="discovery-hero"
              alt="Cockpit view approaching runway - Discovery Flight experience"
              className="w-full object-cover"
              aspectRatio="aspect-[21/9]"
            />
          </div>
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Discovery Flight
            </h1>
            <h2 className="text-2xl text-navy-200 font-semibold mb-6">
              You have dreamed of flying, here is your chance!
            </h2>
            <p className="text-lg text-navy-100 mb-8 text-left">
              Taking a discovery flight in one our Cessna 172N is an unforgettable introduction to the world of aviation.
              The Cessna 172N, known for its reliability and forgiving flight characteristics, is a popular choice for
              flight training and a perfect aircraft for first-time flyers. On a discovery flight, you'll typically start
              with a pre-flight briefing where your instructor explains the basic flight controls and safety procedures.
              Then, once airborne, you'll get hands-on experience as you take the yoke and feel what it's like to fly.
              The instructor guides you through gentle turns, climbs, and descents, giving you a real taste of pilot
              life—all while soaking in the scenic views from above. It's an exciting and empowering experience as well
              as a logged hour towards your certificate.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="tel:+19409053090"
                className="inline-flex items-center justify-center px-8 py-3 bg-sky-600 text-white font-semibold rounded-full hover:bg-sky-700 transition-colors"
              >
                Book Discovery Flight
              </a>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center px-8 py-3 bg-transparent text-white font-semibold rounded-full border-2 border-white hover:bg-white/10 transition-colors"
              >
                Ask Questions
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* What's Included */}
      <section className="py-16 bg-navy-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-white mb-12">
            What's Included in Your Discovery Flight
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-navy-700 rounded-full flex items-center justify-center">
                  <Clock className="h-6 w-6 text-sky-400" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">30-60 Minute Flight</h3>
                <p className="text-navy-100">Plenty of time to experience the joy of flying and take the controls yourself</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-navy-700 rounded-full flex items-center justify-center">
                  <Shield className="h-6 w-6 text-sky-400" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Certified Instructor</h3>
                <p className="text-navy-100">Fly with FAA-certified instructors with thousands of hours experience</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-navy-700 rounded-full flex items-center justify-center">
                  <Heart className="h-6 w-6 text-sky-400" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Pre-Flight Briefing</h3>
                <p className="text-navy-100">Learn the basics of aircraft operation and safety procedures</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-navy-700 rounded-full flex items-center justify-center">
                  <MapPin className="h-6 w-6 text-sky-400" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Scenic Route</h3>
                <p className="text-navy-100">Fly over Dallas landmarks and enjoy breathtaking aerial views</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-navy-700 rounded-full flex items-center justify-center">
                  <Gift className="h-6 w-6 text-sky-400" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Logbook Entry</h3>
                <p className="text-navy-100">Receive your first official logbook entry - counts toward pilot license</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-navy-700 rounded-full flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-sky-400" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Competitive Rates</h3>
                <p className="text-navy-100">Our rates include everything - aircraft, fuel, instructor, and insurance</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-navy-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-white mb-12">
            How Your Discovery Flight Works
          </h2>

          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-sky-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                1
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Book Your Flight</h3>
              <p className="text-navy-100">Call us or book online. We'll schedule at your convenience</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-sky-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                2
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Ground Briefing</h3>
              <p className="text-navy-100">Learn basic controls and safety procedures (15 mins)</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-sky-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                3
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Take Flight!</h3>
              <p className="text-navy-100">You'll actually fly the airplane with instructor guidance</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-sky-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                4
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Debrief & Next Steps</h3>
              <p className="text-navy-100">Discuss your experience and pilot training options</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-navy-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-white mb-12">
            Frequently Asked Questions
          </h2>

          <div className="space-y-8">
            <div>
              <h3 className="text-xl font-semibold text-white mb-3">Do I need any experience?</h3>
              <p className="text-navy-100">
                No experience necessary! Discovery flights are designed for complete beginners.
                Your instructor will guide you through everything.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-white mb-3">What should I bring?</h3>
              <p className="text-navy-100">
                Just bring yourself and a photo ID. Wear comfortable clothes and shoes.
                We provide headsets and all necessary equipment.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-white mb-3">Can I bring a friend or family member?</h3>
              <p className="text-navy-100">
                Yes! Most of our aircraft can accommodate one passenger in addition to you
                and the instructor. They fly free!
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-white mb-3">What if the weather is bad?</h3>
              <p className="text-navy-100">
                Safety is our top priority. If weather conditions aren't suitable, we'll
                reschedule your flight at no charge.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-white mb-3">Is this a real flight or just a ride?</h3>
              <p className="text-navy-100">
                This is real flying! You'll be at the controls for most of the flight.
                Your instructor handles takeoff and landing, but you fly in between.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-navy-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">
            What Our Students Say
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <div className="flex items-center mb-4">
                <Star className="h-5 w-5 fill-current" />
                <Star className="h-5 w-5 fill-current" />
                <Star className="h-5 w-5 fill-current" />
                <Star className="h-5 w-5 fill-current" />
                <Star className="h-5 w-5 fill-current" />
              </div>
              <p className="text-navy-100 mb-4">
                "Amazing experience! The instructor made me feel safe and confident.
                I'm hooked and starting my pilot license next month!"
              </p>
              <p className="font-semibold text-white">- Sarah M.</p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <div className="flex items-center mb-4">
                <Star className="h-5 w-5 fill-current" />
                <Star className="h-5 w-5 fill-current" />
                <Star className="h-5 w-5 fill-current" />
                <Star className="h-5 w-5 fill-current" />
                <Star className="h-5 w-5 fill-current" />
              </div>
              <p className="text-navy-100 mb-4">
                "Best birthday gift ever! The views of Dallas were incredible and I
                actually flew the plane. Can't wait to go again!"
              </p>
              <p className="font-semibold text-white">- Michael R.</p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <div className="flex items-center mb-4">
                <Star className="h-5 w-5 fill-current" />
                <Star className="h-5 w-5 fill-current" />
                <Star className="h-5 w-5 fill-current" />
                <Star className="h-5 w-5 fill-current" />
                <Star className="h-5 w-5 fill-current" />
              </div>
              <p className="text-navy-100 mb-4">
                "Professional, safe, and fun! The instructor was patient and knowledgeable.
                Great value for the experience."
              </p>
              <p className="font-semibold text-white">- Jennifer K.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 bg-navy-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            Ready to Experience the Freedom of Flight?
          </h2>
          <p className="text-xl text-navy-100 mb-8">
            Book your Discovery Flight today and take the first step toward becoming a pilot.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="tel:+19409053090"
              className="inline-flex items-center justify-center px-8 py-3 bg-sky-600 text-white font-semibold rounded-full hover:bg-sky-700 transition-colors text-lg"
            >
              Call (940) 905-3090
            </a>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center px-8 py-3 bg-transparent text-white font-semibold rounded-full border-2 border-white hover:bg-white/10 transition-colors text-lg"
            >
              Email Us
            </Link>
          </div>
          <p className="mt-6 text-navy-100">
            Or visit us at Dallas Executive Airport
          </p>
        </div>
      </section>

      <Footer />
    </main>
  );
}