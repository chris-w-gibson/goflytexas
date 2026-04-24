"use client";

import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import Link from 'next/link';
import {
  Plane,
  GraduationCap,
  Navigation2,
  Trophy,
  Shield,
  Users,
  ArrowRight
} from 'lucide-react';

const trainingPrograms = [
  {
    title: "Private Pilot",
    description: "The foundation of your aviation journey. Learn to fly and earn your private pilot certificate with personalized instruction.",
    icon: GraduationCap,
    href: "/private-pilot",
    highlights: ["Ground school included", "40+ flight hours", "FAA certification"],
    color: "from-navy-700 to-navy-900"
  },
  {
    title: "Instrument Rating (IFR)",
    description: "Master flying in clouds and poor weather conditions. Essential for serious pilots who want to fly in all conditions.",
    icon: Navigation2,
    href: "/instrument",
    highlights: ["Weather flying", "Advanced navigation", "Enhanced safety"],
    color: "from-navy-600 to-navy-800"
  },
  {
    title: "Commercial Pilot",
    description: "Turn your passion into a profession. Earn the certification needed to fly for compensation or hire.",
    icon: Trophy,
    href: "/commercial",
    highlights: ["Career opportunities", "Advanced maneuvers", "250+ hours required"],
    color: "from-navy-700 to-navy-900"
  },
  {
    title: "Flight Review (BFR/IPC)",
    description: "Stay current and proficient with regular flight reviews and instrument proficiency checks.",
    icon: Shield,
    href: "/flight-review",
    highlights: ["Stay current", "Refresh skills", "Meet FAA requirements"],
    color: "from-navy-600 to-navy-800"
  },
  {
    title: "CFI Academy",
    description: "Become a certified flight instructor and share your passion for aviation with the next generation of pilots.",
    icon: Users,
    href: "/cfi-academy",
    highlights: ["Teach others", "Build hours", "Aviation career"],
    color: "from-navy-700 to-navy-900"
  }
];

export default function FlightTrainingPage() {
  return (
    <main className="min-h-screen">
      <Navigation />

      {/* Hero Section */}
      <section className="bg-navy-950 pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Flight Training Programs
            </h1>
            <p className="text-xl text-navy-200 mb-4">
              From your first lesson to advanced certifications, we offer comprehensive
              training tailored to your goals and learning style.
            </p>
            <p className="text-lg text-white font-semibold">
              One-on-one instruction • Modern aircraft • Flexible scheduling
            </p>
          </div>
        </div>
      </section>

      {/* Mission Statement */}
      <section className="py-12 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-navy-50 rounded-lg border border-navy-100 p-8">
            <p className="text-lg text-navy-800 leading-relaxed text-center">
              At GoFlyTexas, we take immense pride in our one-on-one pilot training, where every
              student receives personalized instruction tailored to their unique learning style and pace.
              We believe that aviation is more than just mastering controls—it's about building confidence,
              skill, and a deep respect for the skies.
            </p>
          </div>
        </div>
      </section>

      {/* Training Programs Grid */}
      <section className="py-16 bg-navy-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center gap-8">
            {trainingPrograms.map((program, index) => {
              const Icon = program.icon;
              return (
                <Link
                  key={index}
                  href={program.href}
                  className="w-full md:w-[calc(50%-1rem)] lg:w-[calc(33.333%-1.334rem)] group bg-navy-800 rounded-lg overflow-hidden border border-navy-700 hover:border-navy-500 transition-all duration-300 hover:scale-105"
                >
                  <div className={`h-2 bg-gradient-to-r ${program.color}`}></div>
                  <div className="p-6">
                    <div className="flex items-center mb-4">
                      <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${program.color} flex items-center justify-center text-white`}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <h3 className="text-xl font-bold text-white ml-4">{program.title}</h3>
                    </div>

                    <p className="text-navy-300 mb-4 h-20">
                      {program.description}
                    </p>

                    <ul className="space-y-2 mb-4">
                      {program.highlights.map((highlight, idx) => (
                        <li key={idx} className="flex items-start">
                          <span className="text-navy-400 mr-2">•</span>
                          <span className="text-navy-200 text-sm">{highlight}</span>
                        </li>
                      ))}
                    </ul>

                    <div className="flex items-center text-white group-hover:text-navy-200 font-semibold">
                      Learn More
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Why Choose Our Training */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-navy-900 mb-12">
            Why Choose GoFlyTexas
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-navy-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-navy-100">
                <Users className="h-10 w-10 text-navy-900" />
              </div>
              <h3 className="text-xl font-semibold text-navy-900 mb-3">One-on-One Instruction</h3>
              <p className="text-navy-600">Personalized training tailored to your learning style and pace</p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-navy-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-navy-100">
                <Plane className="h-10 w-10 text-navy-900" />
              </div>
              <h3 className="text-xl font-semibold text-navy-900 mb-3">Modernized Fleet</h3>
              <p className="text-navy-600">Well-maintained Cessna 172N aircraft with updated avionics</p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-navy-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-navy-100">
                <Trophy className="h-10 w-10 text-navy-900" />
              </div>
              <h3 className="text-xl font-semibold text-navy-900 mb-3">Proven Success</h3>
              <p className="text-navy-600">High pass rate with students achieving their aviation goals</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-navy-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-6">
            Start Your Aviation Journey Today
          </h2>
          <p className="text-xl mb-8 text-navy-200">
            Whether you're taking your first flight or advancing your ratings, we're here to help you succeed.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center px-8 py-3 bg-white text-navy-900 font-semibold rounded-full hover:bg-navy-100 transition-colors text-lg"
            >
              Contact Us
            </Link>
            <a
              href="tel:+19409053090"
              className="inline-flex items-center justify-center px-8 py-3 bg-navy-700 text-white font-semibold rounded-full hover:bg-navy-600 transition-colors text-lg"
            >
              Call (940) 905-3090
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
