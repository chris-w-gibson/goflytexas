import { Metadata } from 'next';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import Link from 'next/link';
import {
  DollarSign,
  Trophy,
  CheckCircle,
  Briefcase,
  Target,
  TrendingUp,
  Plane,
  Users,
  Award
} from 'lucide-react';

export const metadata: Metadata = {
  alternates: { canonical: '/commercial' },
  title: 'Commercial Pilot License Training - Fly for a Career',
  description: 'Turn your passion into a profession with Commercial Pilot License training at GoFlyTexas. Advanced flight skills and career opportunities in aviation.',
  openGraph: {
    title: 'Commercial Pilot License | GoFlyTexas',
    description: 'Earn your Commercial Pilot License and get paid to fly. Professional training for aviation careers.',
  },
};

export default function CommercialPage() {
  return (
    <main className="min-h-screen">
      <Navigation />

      {/* Hero Section */}
      <section className="bg-navy-900 pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Commercial Pilot License
            </h1>
            <h2 className="text-2xl text-navy-200 font-semibold mb-6">
              Turn your passion for flying into a paid profession—earn your Commercial
              Pilot License and get paid to chase the skies!
            </h2>
            <p className="text-lg text-navy-100 mb-8">
              A Commercial Pilot License (CPL) allows you to be paid for flying and opens
              the door to careers in aviation. Training includes advanced flight skills,
              navigation, and in-depth aviation theory. Earning your CPL is a major step
              toward becoming an airline pilot, flight instructor, or charter pilot.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="tel:+19409053090"
                className="inline-flex items-center justify-center px-8 py-3 bg-sky-600 text-white font-semibold rounded-full hover:bg-sky-700 transition-colors"
              >
                Start Commercial Training
              </a>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center px-8 py-3 bg-transparent text-white font-semibold rounded-full border-2 border-white hover:bg-white/10 transition-colors"
              >
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Career Opportunities */}
      <section className="py-16 bg-navy-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-white mb-12">
            Career Opportunities with Your CPL
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-navy-800 border border-navy-700 p-6 rounded-lg shadow-lg shadow-navy-950/20">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-navy-700 rounded-full flex items-center justify-center mr-3">
                  <Plane className="h-6 w-6 text-sky-400" />
                </div>
                <h3 className="text-lg font-semibold text-white">Airline Pilot</h3>
              </div>
              <p className="text-navy-100">Build hours toward airline transport pilot requirements</p>
            </div>

            <div className="bg-navy-800 border border-navy-700 p-6 rounded-lg shadow-lg shadow-navy-950/20">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-navy-700 rounded-full flex items-center justify-center mr-3">
                  <Users className="h-6 w-6 text-sky-400" />
                </div>
                <h3 className="text-lg font-semibold text-white">Flight Instructor</h3>
              </div>
              <p className="text-navy-100">Teach others to fly while building your experience</p>
            </div>

            <div className="bg-navy-800 border border-navy-700 p-6 rounded-lg shadow-lg shadow-navy-950/20">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-navy-700 rounded-full flex items-center justify-center mr-3">
                  <Briefcase className="h-6 w-6 text-sky-400" />
                </div>
                <h3 className="text-lg font-semibold text-white">Charter Pilot</h3>
              </div>
              <p className="text-navy-100">Fly private charters and business aviation</p>
            </div>

            <div className="bg-navy-800 border border-navy-700 p-6 rounded-lg shadow-lg shadow-navy-950/20">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-navy-700 rounded-full flex items-center justify-center mr-3">
                  <Target className="h-6 w-6 text-sky-400" />
                </div>
                <h3 className="text-lg font-semibold text-white">Aerial Survey</h3>
              </div>
              <p className="text-navy-100">Conduct aerial photography and mapping operations</p>
            </div>

            <div className="bg-navy-800 border border-navy-700 p-6 rounded-lg shadow-lg shadow-navy-950/20">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-navy-700 rounded-full flex items-center justify-center mr-3">
                  <TrendingUp className="h-6 w-6 text-sky-400" />
                </div>
                <h3 className="text-lg font-semibold text-white">Pipeline Patrol</h3>
              </div>
              <p className="text-navy-100">Monitor infrastructure and environmental conditions</p>
            </div>

            <div className="bg-navy-800 border border-navy-700 p-6 rounded-lg shadow-lg shadow-navy-950/20">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-navy-700 rounded-full flex items-center justify-center mr-3">
                  <DollarSign className="h-6 w-6 text-sky-400" />
                </div>
                <h3 className="text-lg font-semibold text-white">Banner Towing</h3>
              </div>
              <p className="text-navy-100">Aerial advertising and promotional flying</p>
            </div>
          </div>
        </div>
      </section>

      {/* Advanced Skills */}
      <section className="py-16 bg-navy-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-white mb-12">
            Advanced Skills You'll Master
          </h2>

          <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
            {/* Flight Skills */}
            <div className="bg-navy-800 rounded-lg p-8 shadow-lg shadow-navy-950/20 border border-navy-700">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                <Trophy className="h-6 w-6 text-sky-400 mr-2" />
                Advanced Flight Skills
              </h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-sky-400 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-navy-100">Complex aircraft operations</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-sky-400 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-navy-100">Advanced maneuvers and precision flying</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-sky-400 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-navy-100">Emergency procedures mastery</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-sky-400 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-navy-100">Night and cross-country operations</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-sky-400 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-navy-100">Maximum performance techniques</span>
                </li>
              </ul>
            </div>

            {/* Professional Skills */}
            <div className="bg-navy-800 rounded-lg p-8 shadow-lg shadow-navy-950/20 border border-navy-700">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                <Award className="h-6 w-6 text-sky-400 mr-2" />
                Professional Development
              </h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-sky-400 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-navy-100">Aviation regulations and commercial operations</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-sky-400 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-navy-100">Weather analysis and decision making</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-sky-400 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-navy-100">Advanced navigation and flight planning</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-sky-400 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-navy-100">Professional pilot responsibilities</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-sky-400 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-navy-100">Customer service and communication</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Requirements */}
      <section className="py-16 bg-navy-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-white mb-12">
            Commercial License Requirements
          </h2>

          <div className="grid md:grid-cols-4 gap-6 max-w-5xl mx-auto">
            <div className="bg-navy-800 p-6 rounded-lg text-center border border-navy-700">
              <div className="w-12 h-12 bg-navy-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trophy className="h-6 w-6 text-sky-400" />
              </div>
              <h3 className="font-semibold text-white mb-2">250 Hours Total Time</h3>
              <p className="text-navy-100 text-sm">Including specific experience requirements</p>
            </div>

            <div className="bg-navy-800 p-6 rounded-lg text-center border border-navy-700">
              <div className="w-12 h-12 bg-navy-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="h-6 w-6 text-sky-400" />
              </div>
              <h3 className="font-semibold text-white mb-2">18+ Years Old</h3>
              <p className="text-navy-100 text-sm">Minimum age requirement</p>
            </div>

            <div className="bg-navy-800 p-6 rounded-lg text-center border border-navy-700">
              <div className="w-12 h-12 bg-navy-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="h-6 w-6 text-sky-400" />
              </div>
              <h3 className="font-semibold text-white mb-2">Written & Practical</h3>
              <p className="text-navy-100 text-sm">Pass FAA exams</p>
            </div>

            <div className="bg-navy-800 p-6 rounded-lg text-center border border-navy-700">
              <div className="w-12 h-12 bg-navy-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-6 w-6 text-sky-400" />
              </div>
              <h3 className="font-semibold text-white mb-2">2nd Class Medical</h3>
              <p className="text-navy-100 text-sm">FAA medical certificate</p>
            </div>
          </div>
        </div>
      </section>

      {/* Training Timeline */}
      <section className="py-16 bg-navy-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-white mb-12">
            Your Path to Commercial Success
          </h2>

          <div className="space-y-6">
            <div className="flex items-center bg-navy-800 p-6 rounded-lg shadow-lg shadow-navy-950/20 border border-navy-700">
              <div className="w-12 h-12 bg-sky-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                1
              </div>
              <div className="ml-6">
                <h3 className="text-lg font-semibold text-white">Build Flight Hours</h3>
                <p className="text-navy-100">Accumulate the required 250 hours through various flying activities</p>
              </div>
            </div>

            <div className="flex items-center bg-navy-800 p-6 rounded-lg shadow-lg shadow-navy-950/20 border border-navy-700">
              <div className="w-12 h-12 bg-sky-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                2
              </div>
              <div className="ml-6">
                <h3 className="text-lg font-semibold text-white">Advanced Ground School</h3>
                <p className="text-navy-100">Master commercial operations, regulations, and advanced theory</p>
              </div>
            </div>

            <div className="flex items-center bg-navy-800 p-6 rounded-lg shadow-lg shadow-navy-950/20 border border-navy-700">
              <div className="w-12 h-12 bg-sky-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                3
              </div>
              <div className="ml-6">
                <h3 className="text-lg font-semibold text-white">Commercial Maneuvers</h3>
                <p className="text-navy-100">Perfect advanced flying techniques and precision maneuvers</p>
              </div>
            </div>

            <div className="flex items-center bg-navy-800 p-6 rounded-lg shadow-lg shadow-navy-950/20 border border-navy-700">
              <div className="w-12 h-12 bg-sky-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                4
              </div>
              <div className="ml-6">
                <h3 className="text-lg font-semibold text-white">Pass Your Checkride</h3>
                <p className="text-navy-100">Demonstrate your skills to an FAA examiner and earn your CPL</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-navy-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-6">
            Ready to Fly for a Living?
          </h2>
          <p className="text-xl mb-8 text-navy-200">
            Take the next step in your aviation journey and turn your passion into a profession.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="tel:+19409053090"
              className="inline-flex items-center justify-center px-8 py-3 bg-white text-navy-900 font-semibold rounded-full hover:bg-navy-700 transition-colors text-lg"
            >
              Call (940) 905-3090
            </a>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center px-8 py-3 bg-sky-600 text-white font-semibold rounded-full hover:bg-sky-500 transition-colors text-lg"
            >
              Start Your Career
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}