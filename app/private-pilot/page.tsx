import { Metadata } from 'next';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import Link from 'next/link';
import {
  BookOpen,
  Plane,
  CheckCircle,
  Clock,
  Award,
  FileText,
  Users,
  Calendar
} from 'lucide-react';

export const metadata: Metadata = {
  alternates: { canonical: '/private-pilot' },
  title: 'Private Pilot Training - Start Your Aviation Journey',
  description: 'Complete private pilot training at GoFlyTexas. One-on-one ground instruction and flight lessons in modern Cessna 172N aircraft. Begin your pilot journey today.',
  openGraph: {
    title: 'Private Pilot Training | GoFlyTexas',
    description: 'Complete private pilot training with personalized instruction. Ground school and flight lessons to earn your private pilot license.',
  },
};

export default function PrivatePilotPage() {
  return (
    <main className="min-h-screen">
      <Navigation />

      {/* Hero Section */}
      <section className="bg-navy-900 pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Private Pilot Training
            </h1>
            <p className="text-xl text-navy-100 mb-8">
              Your journey to becoming a licensed pilot starts here. Comprehensive training
              with personalized instruction tailored to your learning style and pace.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="tel:+19409053090"
                className="inline-flex items-center justify-center px-8 py-3 bg-sky-600 text-white font-semibold rounded-full hover:bg-sky-700 transition-colors"
              >
                Start Training Today
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

      {/* Two Main Components */}
      <section className="py-16 bg-navy-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12">

            {/* Ground Instruction */}
            <div className="bg-navy-800 rounded-lg p-8 border border-navy-700">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-navy-700 rounded-full flex items-center justify-center mr-4">
                  <BookOpen className="h-6 w-6 text-sky-400" />
                </div>
                <h2 className="text-2xl font-bold text-white">Ground Instruction</h2>
              </div>

              <p className="text-navy-100 mb-6 leading-relaxed">
                Private pilot ground school provides the essential theoretical foundation every aspiring
                pilot needs before taking to the skies. Students learn about aerodynamics, weather,
                airspace, navigation, and FAA regulations one on one with an instructor, textbooks,
                and online resources. This knowledge prepares them for the FAA written exam and ensures
                they understand the principles behind safe and effective flight operations.
              </p>

              <div className="space-y-4">
                <h3 className="font-semibold text-white">Topics Covered:</h3>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-sky-400 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-navy-100">Aerodynamics and aircraft systems</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-sky-400 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-navy-100">Weather theory and interpretation</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-sky-400 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-navy-100">Navigation and flight planning</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-sky-400 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-navy-100">Federal Aviation Regulations</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-sky-400 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-navy-100">Airport operations and airspace</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Flight Lessons */}
            <div className="bg-navy-800 rounded-lg p-8 border border-navy-700">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-navy-700 rounded-full flex items-center justify-center mr-4">
                  <Plane className="h-6 w-6 text-sky-400" />
                </div>
                <h2 className="text-2xl font-bold text-white">Flight Lessons</h2>
              </div>

              <p className="text-navy-100 mb-6 leading-relaxed">
                Flight lessons teach you how to operate an aircraft safely and confidently under
                the guidance of a certified instructor. You'll learn everything from basic maneuvers
                and navigation to emergency procedures and airspace rules. With consistent training,
                you can work toward earning your private pilot license and explore the skies on your own.
              </p>

              <div className="space-y-4">
                <h3 className="font-semibold text-white">Skills You'll Master:</h3>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-sky-400 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-navy-100">Takeoffs and landings</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-sky-400 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-navy-100">Navigation and cross-country flying</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-sky-400 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-navy-100">Emergency procedures</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-sky-400 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-navy-100">Radio communications</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-sky-400 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-navy-100">Night flying operations</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Requirements Section */}
      <section className="py-16 bg-navy-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-white mb-12">
            Private Pilot License Requirements
          </h2>

          <div className="grid md:grid-cols-4 gap-6">
            <div className="bg-navy-800 p-6 rounded-lg shadow-lg shadow-navy-950/20 text-center border border-navy-700">
              <div className="w-12 h-12 bg-navy-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="h-6 w-6 text-sky-400" />
              </div>
              <h3 className="font-semibold text-white mb-2">40 Hours Minimum</h3>
              <p className="text-navy-100 text-sm">Flight time including solo and dual instruction</p>
            </div>

            <div className="bg-navy-800 p-6 rounded-lg shadow-lg shadow-navy-950/20 text-center border border-navy-700">
              <div className="w-12 h-12 bg-navy-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="h-6 w-6 text-sky-400" />
              </div>
              <h3 className="font-semibold text-white mb-2">Written Exam</h3>
              <p className="text-navy-100 text-sm">Pass FAA knowledge test with 70% or higher</p>
            </div>

            <div className="bg-navy-800 p-6 rounded-lg shadow-lg shadow-navy-950/20 text-center border border-navy-700">
              <div className="w-12 h-12 bg-navy-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-6 w-6 text-sky-400" />
              </div>
              <h3 className="font-semibold text-white mb-2">Checkride</h3>
              <p className="text-navy-100 text-sm">Oral and practical test with FAA examiner</p>
            </div>

            <div className="bg-navy-800 p-6 rounded-lg shadow-lg shadow-navy-950/20 text-center border border-navy-700">
              <div className="w-12 h-12 bg-navy-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="h-6 w-6 text-sky-400" />
              </div>
              <h3 className="font-semibold text-white mb-2">Medical Certificate</h3>
              <p className="text-navy-100 text-sm">Third-class medical from FAA physician</p>
            </div>
          </div>
        </div>
      </section>

      {/* Training Timeline */}
      <section className="py-16 bg-navy-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-white mb-12">
            Your Training Journey
          </h2>

          <div className="space-y-8">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-sky-600 text-white rounded-full flex items-center justify-center font-bold">
                  1
                </div>
              </div>
              <div className="ml-6">
                <h3 className="text-xl font-semibold text-white mb-2">Ground School</h3>
                <p className="text-navy-100">Master aviation theory and prepare for written exam</p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-sky-600 text-white rounded-full flex items-center justify-center font-bold">
                  2
                </div>
              </div>
              <div className="ml-6">
                <h3 className="text-xl font-semibold text-white mb-2">Flight Training</h3>
                <p className="text-navy-100">Develop flying skills with dual and solo flights</p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-sky-600 text-white rounded-full flex items-center justify-center font-bold">
                  3
                </div>
              </div>
              <div className="ml-6">
                <h3 className="text-xl font-semibold text-white mb-2">Checkride Prep</h3>
                <p className="text-navy-100">Polish skills and prepare for FAA practical test</p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-sky-600 text-white rounded-full flex items-center justify-center font-bold">
                  4
                </div>
              </div>
              <div className="ml-6">
                <h3 className="text-xl font-semibold text-white mb-2">License in Hand!</h3>
                <p className="text-navy-100">Pass your checkride and start flying as pilot in command</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-navy-800 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-6">
            Ready to Become a Pilot?
          </h2>
          <p className="text-xl mb-8 text-navy-200">
            Take the first step toward your private pilot license. Our instructors are ready to help you achieve your aviation dreams.
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
              Contact Us
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}