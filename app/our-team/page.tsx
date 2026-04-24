"use client";

import Image from 'next/image';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import FadeInSection from '@/components/FadeInSection';
import Link from 'next/link';
import {
  Award,
  Clock,
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
    photo: "/team/jim-lewis.jpg",
    isChief: true,
  },
  {
    name: "Kristin Mader",
    title: "Flight Instructor",
    certs: "CFI, CFII",
    photo: "/team/kristin-mader.jpg",
  },
  {
    name: "Austin McDonald",
    title: "Flight Instructor",
    certs: "CFI, CFII",
    photo: "/team/austin-mcdonald.jpg",
  },
  {
    name: "Samuel Baeza",
    title: "Flight Instructor",
    certs: "CFI, CFII",
    photo: "/team/samuel-baeza.jpg",
  },
  {
    name: "Trent Wilcox",
    title: "Flight Instructor",
    certs: "CFI, CFII",
    photo: "/team/trent-wilcox.jpg",
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
      <FadeInSection><section className="py-16 bg-navy-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-white mb-12">
            Your Flight Instructors
          </h2>

          {/* Chief Pilot - Jim Lewis */}
          <div className="max-w-5xl mx-auto mb-12">
            <div className="bg-navy-800 rounded-lg shadow-lg overflow-hidden border border-navy-700">
              <div className="grid md:grid-cols-2">
                <div className="relative aspect-square md:aspect-auto md:min-h-[420px] bg-navy-900">
                  <Image
                    src="/team/jim-lewis.jpg"
                    alt="Jim Lewis, Chief Pilot at GoFlyTexas"
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover"
                    priority
                  />
                </div>
                <div className="p-8 flex flex-col">
                  <div className="bg-gradient-to-r from-navy-700 to-navy-600 -mx-8 -mt-8 px-8 py-6 mb-6">
                    <h3 className="text-2xl font-bold text-white mb-1">Jim Lewis</h3>
                    <p className="text-navy-200">Chief Pilot / CFI, CFII</p>
                  </div>

                  <div className="grid grid-cols-3 gap-3 mb-6">
                    <div className="text-center">
                      <div className="w-12 h-12 bg-navy-700 rounded-full flex items-center justify-center mx-auto mb-2">
                        <Clock className="h-6 w-6 text-white" />
                      </div>
                      <p className="text-xs text-navy-300">Experienced Leader</p>
                    </div>
                    <div className="text-center">
                      <div className="w-12 h-12 bg-navy-700 rounded-full flex items-center justify-center mx-auto mb-2">
                        <GraduationCap className="h-6 w-6 text-white" />
                      </div>
                      <p className="text-xs text-navy-300">Chief Pilot</p>
                    </div>
                    <div className="text-center">
                      <div className="w-12 h-12 bg-navy-700 rounded-full flex items-center justify-center mx-auto mb-2">
                        <Award className="h-6 w-6 text-white" />
                      </div>
                      <p className="text-xs text-navy-300">CFI &amp; CFII</p>
                    </div>
                  </div>

                  <p className="text-navy-200 leading-relaxed mb-4">
                    As Chief Pilot, Jim leads GoFlyTexas with a dedication to personalized,
                    safety-focused flight training. His passion for aviation and commitment
                    to student success drives everything we do at GoFlyTexas.
                  </p>

                  <div className="border-t border-navy-600 pt-4 mt-auto">
                    <h4 className="font-semibold text-white mb-2 text-sm">Specialties:</h4>
                    <div className="flex flex-wrap gap-2">
                      <span className="px-3 py-1 bg-navy-700 text-navy-200 rounded-full text-xs">Private Pilot</span>
                      <span className="px-3 py-1 bg-navy-700 text-navy-200 rounded-full text-xs">Instrument Rating</span>
                      <span className="px-3 py-1 bg-navy-700 text-navy-200 rounded-full text-xs">Commercial</span>
                      <span className="px-3 py-1 bg-navy-700 text-navy-200 rounded-full text-xs">CFI Training</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Other Instructors */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {instructors.filter(i => !i.isChief).map((instructor) => (
              <div key={instructor.name} className="bg-navy-800 rounded-lg shadow-lg overflow-hidden border border-navy-700 group">
                <div className="relative aspect-[4/5] bg-navy-900 overflow-hidden">
                  <Image
                    src={instructor.photo}
                    alt={`${instructor.name}, ${instructor.title} at GoFlyTexas`}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="p-5">
                  <h3 className="text-lg font-bold text-white">{instructor.name}</h3>
                  <p className="text-navy-300 text-sm">{instructor.certs}</p>
                  <p className="text-navy-200 text-sm leading-relaxed mt-3">
                    {instructor.title} dedicated to one-on-one instruction and helping students
                    reach their aviation goals.
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section></FadeInSection>

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
