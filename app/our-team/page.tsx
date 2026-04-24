"use client";

import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import Link from 'next/link';
import {
  Award,
  Clock,
  Star,
  Plane,
  GraduationCap,
  Users,
  Target,
  Heart,
  Shield
} from 'lucide-react';

const instructors = [
  {
    name: "Jim Lewis",
    title: "Chief Pilot",
    certs: "CFI, CFII",
    isChief: true,
  },
  {
    name: "Kristin Mader",
    title: "Flight Instructor",
    certs: "CFI, CFII",
  },
  {
    name: "Austin McDonald",
    title: "Flight Instructor",
    certs: "CFI, CFII",
  },
  {
    name: "Samuel Baeza",
    title: "Flight Instructor",
    certs: "CFI, CFII",
  },
  {
    name: "Trent Wilcox",
    title: "Flight Instructor",
    certs: "CFI, CFII",
  },
];

export default function OurTeamPage() {
  return (
    <main className="min-h-screen">
      <Navigation />

      {/* Hero Section */}
      <section className="bg-navy-950 pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Meet Our Team
            </h1>
            <p className="text-xl text-navy-200">
              At GoFlyTexas, our instructors are more than just teachers—they're mentors,
              aviators, and passionate advocates for your success in the skies.
            </p>
          </div>
        </div>
      </section>

      {/* Our Philosophy */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-navy-900 mb-6">
              Our Teaching Philosophy
            </h2>
            <p className="text-lg text-navy-700 leading-relaxed mb-8">
              We believe in building lasting relationships with our students. When you train
              with GoFlyTexas, you're not just another student in a large flight school—you're
              part of our aviation family. Our instructors take the time to understand your
              goals, learning style, and pace, creating a customized training experience that
              sets you up for success.
            </p>
            <div className="grid md:grid-cols-3 gap-6 mt-12">
              <div className="bg-navy-50 p-6 rounded-lg border border-navy-100">
                <Users className="h-8 w-8 text-navy-900 mx-auto mb-3" />
                <h3 className="font-semibold text-navy-900 mb-2">Personal Mentorship</h3>
                <p className="text-navy-600">One instructor throughout your journey</p>
              </div>
              <div className="bg-navy-50 p-6 rounded-lg border border-navy-100">
                <Target className="h-8 w-8 text-navy-900 mx-auto mb-3" />
                <h3 className="font-semibold text-navy-900 mb-2">Goal-Oriented</h3>
                <p className="text-navy-600">Training tailored to your aviation dreams</p>
              </div>
              <div className="bg-navy-50 p-6 rounded-lg border border-navy-100">
                <Heart className="h-8 w-8 text-navy-900 mx-auto mb-3" />
                <h3 className="font-semibold text-navy-900 mb-2">Supportive Environment</h3>
                <p className="text-navy-600">Questions encouraged, progress celebrated</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Instructors */}
      <section className="py-16 bg-navy-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-white mb-12">
            Your Flight Instructors
          </h2>

          {/* Chief Pilot - Jim Lewis */}
          <div className="max-w-4xl mx-auto mb-12">
            <div className="bg-navy-800 rounded-lg shadow-lg overflow-hidden border border-navy-700">
              <div className="bg-gradient-to-r from-navy-700 to-navy-600 text-white p-6">
                <h3 className="text-2xl font-bold mb-1">Jim Lewis</h3>
                <p className="text-navy-200">Chief Pilot / CFI, CFII</p>
              </div>
              <div className="p-8">
                <div className="grid md:grid-cols-3 gap-6 mb-6">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-navy-700 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Clock className="h-8 w-8 text-white" />
                    </div>
                    <h4 className="font-semibold text-white">Experienced Leader</h4>
                    <p className="text-navy-300">Thousands of flight hours</p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-navy-700 rounded-full flex items-center justify-center mx-auto mb-3">
                      <GraduationCap className="h-8 w-8 text-white" />
                    </div>
                    <h4 className="font-semibold text-white">Chief Pilot</h4>
                    <p className="text-navy-300">Leading GoFlyTexas operations</p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-navy-700 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Award className="h-8 w-8 text-white" />
                    </div>
                    <h4 className="font-semibold text-white">CFI & CFII</h4>
                    <p className="text-navy-300">Certified Flight & Instrument Instructor</p>
                  </div>
                </div>

                <p className="text-navy-200 leading-relaxed mb-4">
                  As Chief Pilot, Jim leads GoFlyTexas with a dedication to
                  personalized, safety-focused flight training. His passion for aviation
                  and commitment to student success drives everything we do at GoFlyTexas.
                </p>

                <div className="border-t border-navy-600 pt-4 mt-6">
                  <h4 className="font-semibold text-white mb-2">Specialties:</h4>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 bg-navy-700 text-navy-200 rounded-full text-sm">Private Pilot</span>
                    <span className="px-3 py-1 bg-navy-700 text-navy-200 rounded-full text-sm">Instrument Rating</span>
                    <span className="px-3 py-1 bg-navy-700 text-navy-200 rounded-full text-sm">Commercial</span>
                    <span className="px-3 py-1 bg-navy-700 text-navy-200 rounded-full text-sm">CFI Training</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Other Instructors */}
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {instructors.filter(i => !i.isChief).map((instructor) => (
              <div key={instructor.name} className="bg-navy-800 rounded-lg shadow-lg p-6 border border-navy-700">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-navy-700 rounded-full flex items-center justify-center mr-4">
                    <Plane className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">{instructor.name}</h3>
                    <p className="text-navy-300">{instructor.certs}</p>
                  </div>
                </div>

                <p className="text-navy-200 text-sm leading-relaxed">
                  {instructor.title} dedicated to providing one-on-one instruction and
                  helping students achieve their aviation goals with confidence and skill.
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Values */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-navy-900 mb-12">
            What Our Team Stands For
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            <div className="text-center">
              <div className="w-20 h-20 bg-navy-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-navy-100">
                <Shield className="h-10 w-10 text-navy-900" />
              </div>
              <h3 className="text-lg font-semibold text-navy-900 mb-2">Safety Excellence</h3>
              <p className="text-navy-600">Zero compromise on safety standards and procedures</p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-navy-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-navy-100">
                <GraduationCap className="h-10 w-10 text-navy-900" />
              </div>
              <h3 className="text-lg font-semibold text-navy-900 mb-2">Continuous Learning</h3>
              <p className="text-navy-600">Always improving our teaching methods and skills</p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-navy-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-navy-100">
                <Heart className="h-10 w-10 text-navy-900" />
              </div>
              <h3 className="text-lg font-semibold text-navy-900 mb-2">Student Success</h3>
              <p className="text-navy-600">Your achievements are our greatest rewards</p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-navy-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-navy-100">
                <Award className="h-10 w-10 text-navy-900" />
              </div>
              <h3 className="text-lg font-semibold text-navy-900 mb-2">Professional Excellence</h3>
              <p className="text-navy-600">Maintaining the highest standards in aviation</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-navy-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-6">
            Ready to Learn from the Best?
          </h2>
          <p className="text-xl mb-8 text-navy-200">
            Our instructors are ready to guide you on your aviation journey.
            Let's start with a conversation about your flying goals.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="tel:+19409053090"
              className="inline-flex items-center justify-center px-8 py-3 bg-white text-navy-900 font-semibold rounded-full hover:bg-navy-100 transition-colors text-lg"
            >
              Call (940) 905-3090
            </a>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center px-8 py-3 bg-navy-700 text-white font-semibold rounded-full hover:bg-navy-600 transition-colors text-lg"
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
