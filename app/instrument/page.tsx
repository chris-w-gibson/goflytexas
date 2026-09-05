import { Metadata } from 'next';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import Link from 'next/link';
import {
  Cloud,
  Navigation2,
  CheckCircle,
  BookOpen,
  Eye,
  Gauge,
  Radio,
  Map,
  Shield
} from 'lucide-react';

export const metadata: Metadata = {
  alternates: { canonical: '/instrument' },
  title: 'Instrument Rating (IFR) Training - Fly in All Weather',
  description: 'Master instrument flight rules (IFR) with personalized training at GoFlyTexas. Learn to fly safely in clouds and low visibility conditions.',
  openGraph: {
    title: 'Instrument Rating Training | GoFlyTexas',
    description: 'Professional IFR training to fly in clouds and challenging weather. One-on-one instruction for instrument flight rules mastery.',
  },
};

export default function InstrumentPage() {
  return (
    <main className="min-h-screen">
      <Navigation />

      {/* Hero Section */}
      <section className="bg-navy-900 pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Instrument Rating (IFR) Training
            </h1>
            <h2 className="text-2xl text-navy-200 font-semibold mb-6">
              Master Flying in All Weather Conditions
            </h2>
            <p className="text-lg text-navy-100 mb-8">
              Instrument flight training teaches pilots to fly solely by reference to instruments,
              without outside visual cues. It includes learning procedures for flying in clouds,
              low visibility, and controlled airspace under Instrument Flight Rules (IFR). This
              training is essential for advancing as a pilot and increases safety and flexibility
              in challenging weather conditions.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="tel:+19409053090"
                className="inline-flex items-center justify-center px-8 py-3 bg-sky-600 text-white font-semibold rounded-full hover:bg-sky-700 transition-colors"
              >
                Start IFR Training
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

      {/* Ground School Section */}
      <section className="py-16 bg-navy-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-navy-800 border border-navy-700 rounded-lg p-8 shadow-lg shadow-navy-950/20">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-navy-700 rounded-full flex items-center justify-center mr-4">
                  <BookOpen className="h-6 w-6 text-sky-400" />
                </div>
                <h2 className="text-2xl font-bold text-white">One-on-One IFR Ground School</h2>
              </div>

              <p className="text-navy-100 text-lg leading-relaxed">
                One-on-one IFR ground school offers personalized instruction tailored to your learning
                pace and goals, focusing on instrument procedures and theory. You'll get direct support
                in mastering charts, regulations, navigation systems, and real-world IFR scenarios.
                This individualized approach helps build confidence and prepares you thoroughly for
                both the written exam and in-flight application.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* What You'll Learn */}
      <section className="py-16 bg-navy-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-white mb-12">
            What You'll Master in IFR Training
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-navy-800 p-6 rounded-lg shadow-lg shadow-navy-950/20 border border-navy-700">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-navy-700 rounded-full flex items-center justify-center mr-3">
                  <Cloud className="h-5 w-5 text-sky-400" />
                </div>
                <h3 className="text-lg font-semibold text-white">Cloud Flying</h3>
              </div>
              <p className="text-navy-100">Confidently navigate through clouds and IMC conditions using only instruments</p>
            </div>

            <div className="bg-navy-800 p-6 rounded-lg shadow-lg shadow-navy-950/20 border border-navy-700">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-navy-700 rounded-full flex items-center justify-center mr-3">
                  <Navigation2 className="h-5 w-5 text-sky-400" />
                </div>
                <h3 className="text-lg font-semibold text-white">Precision Navigation</h3>
              </div>
              <p className="text-navy-100">Master GPS, VOR, and ILS approaches for precise navigation</p>
            </div>

            <div className="bg-navy-800 p-6 rounded-lg shadow-lg shadow-navy-950/20 border border-navy-700">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-navy-700 rounded-full flex items-center justify-center mr-3">
                  <Radio className="h-5 w-5 text-sky-400" />
                </div>
                <h3 className="text-lg font-semibold text-white">ATC Communications</h3>
              </div>
              <p className="text-navy-100">Develop professional radio skills for IFR clearances and procedures</p>
            </div>

            <div className="bg-navy-800 p-6 rounded-lg shadow-lg shadow-navy-950/20 border border-navy-700">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-navy-700 rounded-full flex items-center justify-center mr-3">
                  <Map className="h-5 w-5 text-sky-400" />
                </div>
                <h3 className="text-lg font-semibold text-white">Chart Reading</h3>
              </div>
              <p className="text-navy-100">Interpret approach plates, enroute charts, and weather reports</p>
            </div>

            <div className="bg-navy-800 p-6 rounded-lg shadow-lg shadow-navy-950/20 border border-navy-700">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-navy-700 rounded-full flex items-center justify-center mr-3">
                  <Eye className="h-5 w-5 text-sky-400" />
                </div>
                <h3 className="text-lg font-semibold text-white">Low Visibility Ops</h3>
              </div>
              <p className="text-navy-100">Safely operate in reduced visibility and challenging weather</p>
            </div>

            <div className="bg-navy-800 p-6 rounded-lg shadow-lg shadow-navy-950/20 border border-navy-700">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-navy-700 rounded-full flex items-center justify-center mr-3">
                  <Shield className="h-5 w-5 text-sky-400" />
                </div>
                <h3 className="text-lg font-semibold text-white">Emergency Procedures</h3>
              </div>
              <p className="text-navy-100">Handle instrument failures and emergency situations with confidence</p>
            </div>
          </div>
        </div>
      </section>

      {/* Training Components */}
      <section className="py-16 bg-navy-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-white mb-12">
            Your IFR Training Path
          </h2>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Ground Training */}
            <div className="bg-navy-800 rounded-lg p-8 border border-navy-700">
              <h3 className="text-xl font-bold text-white mb-4">Ground Training Includes:</h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-sky-400 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-navy-100">IFR regulations and procedures</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-sky-400 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-navy-100">Weather theory and interpretation</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-sky-400 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-navy-100">Navigation systems (GPS, VOR, ILS)</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-sky-400 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-navy-100">Approach procedures and minimums</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-sky-400 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-navy-100">IFR flight planning</span>
                </li>
              </ul>
            </div>

            {/* Flight Training */}
            <div className="bg-navy-800 rounded-lg p-8 border border-navy-700">
              <h3 className="text-xl font-bold text-white mb-4">Flight Training Includes:</h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-sky-400 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-navy-100">Basic instrument maneuvers</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-sky-400 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-navy-100">Holding patterns and procedures</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-sky-400 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-navy-100">Precision and non-precision approaches</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-sky-400 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-navy-100">Cross-country IFR flights</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-sky-400 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-navy-100">Partial panel operations</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Requirements */}
      <section className="py-16 bg-navy-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-white mb-12">
            Instrument Rating Requirements
          </h2>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="bg-navy-800 p-6 rounded-lg shadow-lg shadow-navy-950/20 text-center border border-navy-700">
              <div className="w-12 h-12 bg-navy-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <Gauge className="h-6 w-6 text-sky-400" />
              </div>
              <h3 className="font-semibold text-white mb-2">40 Hours Instrument Time</h3>
              <p className="text-navy-100 text-sm">Including 15 hours with instructor</p>
            </div>

            <div className="bg-navy-800 p-6 rounded-lg shadow-lg shadow-navy-950/20 text-center border border-navy-700">
              <div className="w-12 h-12 bg-navy-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="h-6 w-6 text-sky-400" />
              </div>
              <h3 className="font-semibold text-white mb-2">Written Exam</h3>
              <p className="text-navy-100 text-sm">Pass FAA IFR knowledge test</p>
            </div>

            <div className="bg-navy-800 p-6 rounded-lg shadow-lg shadow-navy-950/20 text-center border border-navy-700">
              <div className="w-12 h-12 bg-navy-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-6 w-6 text-sky-400" />
              </div>
              <h3 className="font-semibold text-white mb-2">Practical Test</h3>
              <p className="text-navy-100 text-sm">Oral exam and flight test</p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-navy-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-white mb-12">
            Benefits of Your Instrument Rating
          </h2>

          <div className="space-y-4">
            <div className="flex items-start bg-navy-800/50 p-4 rounded-lg border border-navy-700">
              <CheckCircle className="h-6 w-6 text-sky-400 mr-3 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-white mb-1">Enhanced Safety</h3>
                <p className="text-navy-100">Confidently handle weather and low visibility situations</p>
              </div>
            </div>

            <div className="flex items-start bg-navy-800/50 p-4 rounded-lg border border-navy-700">
              <CheckCircle className="h-6 w-6 text-sky-400 mr-3 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-white mb-1">Greater Flexibility</h3>
                <p className="text-navy-100">Fly more often by not being limited to perfect weather days</p>
              </div>
            </div>

            <div className="flex items-start bg-navy-800/50 p-4 rounded-lg border border-navy-700">
              <CheckCircle className="h-6 w-6 text-sky-400 mr-3 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-white mb-1">Professional Development</h3>
                <p className="text-navy-100">Essential rating for commercial aviation careers</p>
              </div>
            </div>

            <div className="flex items-start bg-navy-800/50 p-4 rounded-lg border border-navy-700">
              <CheckCircle className="h-6 w-6 text-sky-400 mr-3 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-white mb-1">Increased Confidence</h3>
                <p className="text-navy-100">Become a more skilled and capable pilot overall</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-navy-800 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-6">
            Ready to Fly in Any Weather?
          </h2>
          <p className="text-xl mb-8 text-navy-200">
            Start your instrument rating training and expand your flying capabilities.
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
              Schedule Consultation
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}