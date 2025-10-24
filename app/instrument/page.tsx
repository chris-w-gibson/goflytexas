import { Metadata } from 'next';
import Navigation from '@/components/Navigation';
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
      <section className="bg-gradient-to-br from-sky-50 to-white pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Instrument Rating (IFR) Training
            </h1>
            <h2 className="text-2xl text-sky-600 font-semibold mb-6">
              Master Flying in All Weather Conditions
            </h2>
            <p className="text-lg text-gray-900 mb-8">
              Instrument flight training teaches pilots to fly solely by reference to instruments, 
              without outside visual cues. It includes learning procedures for flying in clouds, 
              low visibility, and controlled airspace under Instrument Flight Rules (IFR). This 
              training is essential for advancing as a pilot and increases safety and flexibility 
              in challenging weather conditions.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="tel:+1234567890"
                className="inline-flex items-center justify-center px-8 py-3 bg-sky-600 text-white font-semibold rounded-full hover:bg-sky-700 transition-colors"
              >
                Start IFR Training
              </a>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center px-8 py-3 bg-white text-sky-600 font-semibold rounded-full border-2 border-sky-600 hover:bg-sky-50 transition-colors"
              >
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Ground School Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-r from-indigo-50 to-sky-50 rounded-lg p-8 shadow-lg">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mr-4">
                  <BookOpen className="h-6 w-6 text-indigo-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">One-on-One IFR Ground School</h2>
              </div>
              
              <p className="text-gray-900 text-lg leading-relaxed">
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
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            What You'll Master in IFR Training
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-sky-100 rounded-full flex items-center justify-center mr-3">
                  <Cloud className="h-5 w-5 text-sky-600" />
                </div>
                <h3 className="text-lg font-semibold">Cloud Flying</h3>
              </div>
              <p className="text-gray-900">Confidently navigate through clouds and IMC conditions using only instruments</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-sky-100 rounded-full flex items-center justify-center mr-3">
                  <Navigation2 className="h-5 w-5 text-sky-600" />
                </div>
                <h3 className="text-lg font-semibold">Precision Navigation</h3>
              </div>
              <p className="text-gray-900">Master GPS, VOR, and ILS approaches for precise navigation</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-sky-100 rounded-full flex items-center justify-center mr-3">
                  <Radio className="h-5 w-5 text-sky-600" />
                </div>
                <h3 className="text-lg font-semibold">ATC Communications</h3>
              </div>
              <p className="text-gray-900">Develop professional radio skills for IFR clearances and procedures</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-sky-100 rounded-full flex items-center justify-center mr-3">
                  <Map className="h-5 w-5 text-sky-600" />
                </div>
                <h3 className="text-lg font-semibold">Chart Reading</h3>
              </div>
              <p className="text-gray-900">Interpret approach plates, enroute charts, and weather reports</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-sky-100 rounded-full flex items-center justify-center mr-3">
                  <Eye className="h-5 w-5 text-sky-600" />
                </div>
                <h3 className="text-lg font-semibold">Low Visibility Ops</h3>
              </div>
              <p className="text-gray-900">Safely operate in reduced visibility and challenging weather</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-sky-100 rounded-full flex items-center justify-center mr-3">
                  <Shield className="h-5 w-5 text-sky-600" />
                </div>
                <h3 className="text-lg font-semibold">Emergency Procedures</h3>
              </div>
              <p className="text-gray-900">Handle instrument failures and emergency situations with confidence</p>
            </div>
          </div>
        </div>
      </section>

      {/* Training Components */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Your IFR Training Path
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Ground Training */}
            <div className="bg-gray-50 rounded-lg p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Ground Training Includes:</h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-sky-600 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-900">IFR regulations and procedures</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-sky-600 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-900">Weather theory and interpretation</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-sky-600 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-900">Navigation systems (GPS, VOR, ILS)</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-sky-600 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-900">Approach procedures and minimums</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-sky-600 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-900">IFR flight planning</span>
                </li>
              </ul>
            </div>

            {/* Flight Training */}
            <div className="bg-gray-50 rounded-lg p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Flight Training Includes:</h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-sky-600 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-900">Basic instrument maneuvers</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-sky-600 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-900">Holding patterns and procedures</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-sky-600 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-900">Precision and non-precision approaches</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-sky-600 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-900">Cross-country IFR flights</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-sky-600 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-900">Partial panel operations</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Requirements */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Instrument Rating Requirements
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="bg-white p-6 rounded-lg shadow-sm text-center">
              <div className="w-12 h-12 bg-sky-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Gauge className="h-6 w-6 text-sky-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">40 Hours Instrument Time</h3>
              <p className="text-gray-900 text-sm">Including 15 hours with instructor</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm text-center">
              <div className="w-12 h-12 bg-sky-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="h-6 w-6 text-sky-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Written Exam</h3>
              <p className="text-gray-900 text-sm">Pass FAA IFR knowledge test</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm text-center">
              <div className="w-12 h-12 bg-sky-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-6 w-6 text-sky-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Practical Test</h3>
              <p className="text-gray-900 text-sm">Oral exam and flight test</p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Benefits of Your Instrument Rating
          </h2>
          
          <div className="space-y-4">
            <div className="flex items-start bg-sky-50 p-4 rounded-lg">
              <CheckCircle className="h-6 w-6 text-sky-600 mr-3 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Enhanced Safety</h3>
                <p className="text-gray-900">Confidently handle weather and low visibility situations</p>
              </div>
            </div>
            
            <div className="flex items-start bg-sky-50 p-4 rounded-lg">
              <CheckCircle className="h-6 w-6 text-sky-600 mr-3 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Greater Flexibility</h3>
                <p className="text-gray-900">Fly more often by not being limited to perfect weather days</p>
              </div>
            </div>
            
            <div className="flex items-start bg-sky-50 p-4 rounded-lg">
              <CheckCircle className="h-6 w-6 text-sky-600 mr-3 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Professional Development</h3>
                <p className="text-gray-900">Essential rating for commercial aviation careers</p>
              </div>
            </div>
            
            <div className="flex items-start bg-sky-50 p-4 rounded-lg">
              <CheckCircle className="h-6 w-6 text-sky-600 mr-3 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Increased Confidence</h3>
                <p className="text-gray-900">Become a more skilled and capable pilot overall</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-indigo-600 to-sky-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-6">
            Ready to Fly in Any Weather?
          </h2>
          <p className="text-xl mb-8 text-indigo-100">
            Start your instrument rating training and expand your flying capabilities.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="tel:+1234567890"
              className="inline-flex items-center justify-center px-8 py-3 bg-white text-indigo-600 font-semibold rounded-full hover:bg-gray-100 transition-colors text-lg"
            >
              Call (123) 456-7890
            </a>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center px-8 py-3 bg-indigo-500 text-white font-semibold rounded-full hover:bg-indigo-400 transition-colors text-lg"
            >
              Schedule Consultation
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