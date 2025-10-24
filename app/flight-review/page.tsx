import { Metadata } from 'next';
import Navigation from '@/components/Navigation';
import Link from 'next/link';
import { 
  Shield,
  RefreshCw,
  CheckCircle,
  Clock,
  FileCheck,
  Navigation2,
  AlertCircle,
  Award
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'BFR & IPC - Flight Review & Instrument Proficiency Check',
  description: 'Stay current with Biennial Flight Reviews and Instrument Proficiency Checks at GoFlyTexas. Personalized sessions to refresh skills and ensure safety.',
  openGraph: {
    title: 'BFR & IPC Training | GoFlyTexas',
    description: 'Biennial Flight Reviews and Instrument Proficiency Checks. Stay current, confident, and safe.',
  },
};

export default function FlightReviewPage() {
  return (
    <main className="min-h-screen">
      <Navigation />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-sky-50 to-white pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Bi-Annual Flight Review (BFR) & <br/>
              Instrument Proficiency Check (IPC)
            </h1>
            <p className="text-xl text-gray-900 mb-8">
              Stay current and confident with our Bi-Annual Flight Reviews (BFRs) and 
              Instrument Proficiency Checks (IPCs). We tailor each session to your 
              experience level, helping you refresh skills, review regulations, and 
              sharpen safety awareness. Whether VFR or IFR, our experienced instructors 
              ensure you're ready for anything the skies throw your way.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="tel:+1234567890"
                className="inline-flex items-center justify-center px-8 py-3 bg-sky-600 text-white font-semibold rounded-full hover:bg-sky-700 transition-colors"
              >
                Schedule Your Review
              </a>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center px-8 py-3 bg-white text-sky-600 font-semibold rounded-full border-2 border-sky-600 hover:bg-sky-50 transition-colors"
              >
                Get More Info
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Two Services */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8">
            
            {/* BFR Section */}
            <div className="bg-gradient-to-br from-green-50 to-sky-50 rounded-lg p-8 shadow-lg">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                  <RefreshCw className="h-6 w-6 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Biennial Flight Review</h2>
              </div>
              
              <p className="text-gray-900 mb-6">
                Required every 24 calendar months to exercise pilot privileges. Our BFR 
                sessions are designed to be both educational and confidence-building.
              </p>

              <h3 className="font-semibold text-gray-900 mb-3">BFR Includes:</h3>
              <ul className="space-y-2 mb-6">
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-900">1+ hour ground review of regulations</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-900">1+ hour flight covering maneuvers</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-900">Emergency procedures review</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-900">Airspace and weather refresher</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-900">Logbook endorsement</span>
                </li>
              </ul>

              <div className="bg-green-100 p-4 rounded-lg">
                <p className="text-green-800 font-medium">
                  FAA Requirement: Complete a BFR to maintain flying privileges
                </p>
              </div>
            </div>

            {/* IPC Section */}
            <div className="bg-gradient-to-br from-indigo-50 to-sky-50 rounded-lg p-8 shadow-lg">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mr-4">
                  <Navigation2 className="h-6 w-6 text-indigo-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Instrument Proficiency Check</h2>
              </div>
              
              <p className="text-gray-900 mb-6">
                If you haven't met IFR currency requirements in the past 6 months, 
                an IPC gets you back to flying in the clouds safely and legally.
              </p>

              <h3 className="font-semibold text-gray-900 mb-3">IPC Includes:</h3>
              <ul className="space-y-2 mb-6">
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-indigo-600 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-900">Ground review of IFR procedures</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-indigo-600 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-900">Multiple instrument approaches</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-indigo-600 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-900">Holding patterns and procedures</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-indigo-600 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-900">Emergency procedures under IFR</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-indigo-600 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-900">IFR currency restoration</span>
                </li>
              </ul>

              <div className="bg-indigo-100 p-4 rounded-lg">
                <p className="text-indigo-800 font-medium">
                  Get Current: Restore your IFR privileges with an IPC
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Stay Current */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Why Regular Reviews Matter
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="w-16 h-16 bg-sky-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-sky-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Enhanced Safety</h3>
              <p className="text-gray-900">Refresh critical skills and stay sharp on emergency procedures</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="w-16 h-16 bg-sky-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileCheck className="h-8 w-8 text-sky-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Regulatory Compliance</h3>
              <p className="text-gray-900">Meet FAA requirements and maintain legal flying status</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="w-16 h-16 bg-sky-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="h-8 w-8 text-sky-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Confidence Building</h3>
              <p className="text-gray-900">Feel assured in your abilities with regular practice</p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Approach */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Our Personalized Review Approach
          </h2>
          
          <div className="space-y-6">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-sky-600 text-white rounded-full flex items-center justify-center font-bold">
                  1
                </div>
              </div>
              <div className="ml-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Pre-Review Assessment</h3>
                <p className="text-gray-900">We discuss your experience level, recent flying, and areas you'd like to focus on</p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-sky-600 text-white rounded-full flex items-center justify-center font-bold">
                  2
                </div>
              </div>
              <div className="ml-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Tailored Ground Session</h3>
                <p className="text-gray-900">Review regulations, weather, and procedures relevant to your flying</p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-sky-600 text-white rounded-full flex items-center justify-center font-bold">
                  3
                </div>
              </div>
              <div className="ml-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Practical Flight Review</h3>
                <p className="text-gray-900">Practice maneuvers and procedures in a supportive environment</p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-sky-600 text-white rounded-full flex items-center justify-center font-bold">
                  4
                </div>
              </div>
              <div className="ml-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Debrief & Endorsement</h3>
                <p className="text-gray-900">Receive feedback, tips for improvement, and your logbook endorsement</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Scheduling Info */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              When to Schedule Your Review
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex items-start">
                <Clock className="h-6 w-6 text-sky-600 mr-3 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">BFR Timing</h3>
                  <p className="text-gray-900">Every 24 calendar months from your last review</p>
                </div>
              </div>

              <div className="flex items-start">
                <AlertCircle className="h-6 w-6 text-indigo-600 mr-3 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">IPC Timing</h3>
                  <p className="text-gray-900">When IFR currency lapses beyond 6 months</p>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-sky-50 rounded-lg">
              <p className="text-sky-900 text-center font-medium">
                Pro Tip: Schedule your review before it expires to avoid any gaps in flying!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-green-600 to-sky-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-6">
            Stay Current, Stay Safe
          </h2>
          <p className="text-xl mb-8 text-green-100">
            Don't let your currency lapse. Schedule your BFR or IPC today and fly with confidence.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="tel:+1234567890"
              className="inline-flex items-center justify-center px-8 py-3 bg-white text-green-600 font-semibold rounded-full hover:bg-gray-100 transition-colors text-lg"
            >
              Call (123) 456-7890
            </a>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center px-8 py-3 bg-green-500 text-white font-semibold rounded-full hover:bg-green-400 transition-colors text-lg"
            >
              Book Your Review
            </Link>
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