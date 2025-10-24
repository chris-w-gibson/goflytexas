import { Metadata } from 'next';
import Navigation from '@/components/Navigation';
import Link from 'next/link';
import { 
  Users,
  Award,
  CheckCircle,
  BookOpen,
  Heart,
  TrendingUp,
  Compass,
  MessageCircle,
  Target
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'CFI/CFII Academy - Become a Flight Instructor',
  description: 'Join our CFI/CFII Academy at GoFlyTexas. Personalized one-on-one training to become a certified flight instructor. Launch your aviation teaching career.',
  openGraph: {
    title: 'CFI/CFII Academy | GoFlyTexas',
    description: 'Become a certified flight instructor with our mentorship program. Build hours and launch your aviation teaching career.',
  },
};

export default function CFIAcademyPage() {
  return (
    <main className="min-h-screen">
      <Navigation />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-sky-50 to-white pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              CFI/CFII Academy
            </h1>
            <h2 className="text-2xl text-sky-600 font-semibold mb-6">
              Become the Instructor Others Dream of Flying With
            </h2>
            <p className="text-lg text-gray-900 mb-6">
              Our Certified Flight Instructor (CFI) course is designed for commercial pilots 
              ready to take the next step in their aviation careers by becoming skilled, 
              confident instructors. This program offers personalized, one-on-one instruction 
              tailored to each candidate's strengths and areas for growth. You'll receive 
              in-depth training on advanced aerodynamics, instructional techniques, flight 
              maneuvers, and FAA regulations—all with the goal of preparing you to teach 
              and inspire the next generation of pilots.
            </p>
            <p className="text-lg text-gray-900 mb-8">
              More than just a certification, this course is a mentorship experience. You'll 
              work closely with experienced instructors who are committed to your success, 
              both as a teacher and a professional aviator. Whether your goal is to build 
              flight hours or launch a long-term career in aviation education, our CFI 
              program provides the knowledge, confidence, and real-world skills to get you there.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="tel:+1234567890"
                className="inline-flex items-center justify-center px-8 py-3 bg-sky-600 text-white font-semibold rounded-full hover:bg-sky-700 transition-colors"
              >
                Start CFI Training
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

      {/* Why Become a CFI */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Why Become a Flight Instructor?
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-orange-50 to-sky-50 p-6 rounded-lg shadow-md">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mr-3">
                  <TrendingUp className="h-6 w-6 text-orange-600" />
                </div>
                <h3 className="text-lg font-semibold">Build Flight Hours</h3>
              </div>
              <p className="text-gray-900">Fastest way to accumulate hours for airline requirements while getting paid</p>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-sky-50 p-6 rounded-lg shadow-md">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mr-3">
                  <Heart className="h-6 w-6 text-orange-600" />
                </div>
                <h3 className="text-lg font-semibold">Share Your Passion</h3>
              </div>
              <p className="text-gray-900">Inspire others to achieve their aviation dreams and be part of their journey</p>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-sky-50 p-6 rounded-lg shadow-md">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mr-3">
                  <Award className="h-6 w-6 text-orange-600" />
                </div>
                <h3 className="text-lg font-semibold">Master Your Craft</h3>
              </div>
              <p className="text-gray-900">Teaching others deepens your own knowledge and flying skills</p>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-sky-50 p-6 rounded-lg shadow-md">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mr-3">
                  <Users className="h-6 w-6 text-orange-600" />
                </div>
                <h3 className="text-lg font-semibold">Career Flexibility</h3>
              </div>
              <p className="text-gray-900">Work full-time, part-time, or freelance with multiple schools</p>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-sky-50 p-6 rounded-lg shadow-md">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mr-3">
                  <Target className="h-6 w-6 text-orange-600" />
                </div>
                <h3 className="text-lg font-semibold">Job Security</h3>
              </div>
              <p className="text-gray-900">High demand for quality instructors in the aviation industry</p>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-sky-50 p-6 rounded-lg shadow-md">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mr-3">
                  <Compass className="h-6 w-6 text-orange-600" />
                </div>
                <h3 className="text-lg font-semibold">Personal Growth</h3>
              </div>
              <p className="text-gray-900">Develop leadership, communication, and mentorship skills</p>
            </div>
          </div>
        </div>
      </section>

      {/* Training Components */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Comprehensive CFI Training Program
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Ground Training */}
            <div className="bg-white rounded-lg p-8 shadow-lg">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <BookOpen className="h-6 w-6 text-orange-600 mr-2" />
                Advanced Ground Instruction
              </h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-sky-600 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-900">Fundamentals of Instruction (FOI)</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-sky-600 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-900">Advanced aerodynamics and systems</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-sky-600 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-900">Teaching techniques and learning psychology</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-sky-600 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-900">Lesson plan development</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-sky-600 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-900">FAA regulations and endorsements</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-sky-600 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-900">Risk management and ADM</span>
                </li>
              </ul>
            </div>

            {/* Flight Training */}
            <div className="bg-white rounded-lg p-8 shadow-lg">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <Award className="h-6 w-6 text-orange-600 mr-2" />
                Flight Instructor Skills
              </h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-sky-600 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-900">Right-seat flying proficiency</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-sky-600 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-900">Demonstration of all maneuvers</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-sky-600 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-900">Common student error recognition</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-sky-600 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-900">Emergency situation management</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-sky-600 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-900">Effective communication techniques</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-sky-600 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-900">Practice teaching with supervision</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Mentorship Focus */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-orange-50 to-sky-50 rounded-lg p-8 shadow-lg">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              Our Mentorship Approach
            </h2>
            <p className="text-lg text-gray-900 mb-6 text-center">
              Unlike traditional CFI programs, we focus on building relationships and providing 
              ongoing support throughout your journey.
            </p>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex items-start">
                <MessageCircle className="h-6 w-6 text-orange-600 mr-3 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">One-on-One Attention</h3>
                  <p className="text-gray-900">Personalized training tailored to your learning style</p>
                </div>
              </div>

              <div className="flex items-start">
                <Heart className="h-6 w-6 text-orange-600 mr-3 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Ongoing Support</h3>
                  <p className="text-gray-900">Mentorship continues even after certification</p>
                </div>
              </div>

              <div className="flex items-start">
                <Target className="h-6 w-6 text-orange-600 mr-3 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Real-World Preparation</h3>
                  <p className="text-gray-900">Practice scenarios you'll actually encounter</p>
                </div>
              </div>

              <div className="flex items-start">
                <Users className="h-6 w-6 text-orange-600 mr-3 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Job Placement Help</h3>
                  <p className="text-gray-900">Assistance finding instructor positions</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CFII Add-On */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Add Your CFII Rating
          </h2>
          
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mr-4">
                <Compass className="h-6 w-6 text-indigo-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Certified Flight Instructor - Instrument</h3>
            </div>
            
            <p className="text-gray-900 mb-6">
              Expand your teaching capabilities and earning potential by adding instrument 
              instruction privileges. The CFII rating allows you to teach instrument flying, 
              making you more valuable to flight schools and students.
            </p>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">CFII Benefits:</h4>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-indigo-600 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-900">Higher earning potential</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-indigo-600 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-900">More teaching opportunities</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-indigo-600 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-900">Stay IFR current while teaching</span>
                  </li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Additional Training:</h4>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-indigo-600 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-900">Instrument teaching techniques</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-indigo-600 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-900">IFR scenario-based training</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-indigo-600 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-900">Approach instruction methods</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Your Journey */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Your CFI Journey
          </h2>
          
          <div className="space-y-6">
            <div className="flex items-center bg-orange-50 p-6 rounded-lg shadow-md">
              <div className="w-12 h-12 bg-orange-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                1
              </div>
              <div className="ml-6">
                <h3 className="text-lg font-semibold text-gray-900">Initial Assessment</h3>
                <p className="text-gray-900">Evaluate your current skills and create a personalized training plan</p>
              </div>
            </div>

            <div className="flex items-center bg-orange-50 p-6 rounded-lg shadow-md">
              <div className="w-12 h-12 bg-orange-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                2
              </div>
              <div className="ml-6">
                <h3 className="text-lg font-semibold text-gray-900">Ground Instruction Mastery</h3>
                <p className="text-gray-900">Deep dive into teaching theory and advanced aviation knowledge</p>
              </div>
            </div>

            <div className="flex items-center bg-orange-50 p-6 rounded-lg shadow-md">
              <div className="w-12 h-12 bg-orange-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                3
              </div>
              <div className="ml-6">
                <h3 className="text-lg font-semibold text-gray-900">Flight Proficiency</h3>
                <p className="text-gray-900">Perfect your demonstration and teaching skills from the right seat</p>
              </div>
            </div>

            <div className="flex items-center bg-orange-50 p-6 rounded-lg shadow-md">
              <div className="w-12 h-12 bg-orange-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                4
              </div>
              <div className="ml-6">
                <h3 className="text-lg font-semibold text-gray-900">Practice Teaching</h3>
                <p className="text-gray-900">Gain confidence with supervised teaching experience</p>
              </div>
            </div>

            <div className="flex items-center bg-orange-50 p-6 rounded-lg shadow-md">
              <div className="w-12 h-12 bg-orange-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                5
              </div>
              <div className="ml-6">
                <h3 className="text-lg font-semibold text-gray-900">CFI Checkride Success</h3>
                <p className="text-gray-900">Ace your exam with thorough preparation and mock checkrides</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-orange-600 to-sky-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-6">
            Ready to Inspire the Next Generation?
          </h2>
          <p className="text-xl mb-8 text-orange-100">
            Join our CFI Academy and transform your passion for flying into a rewarding teaching career.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="tel:+1234567890"
              className="inline-flex items-center justify-center px-8 py-3 bg-white text-orange-600 font-semibold rounded-full hover:bg-gray-100 transition-colors text-lg"
            >
              Call (123) 456-7890
            </a>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center px-8 py-3 bg-orange-500 text-white font-semibold rounded-full hover:bg-orange-400 transition-colors text-lg"
            >
              Apply to CFI Academy
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