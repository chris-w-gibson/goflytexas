"use client";

import Navigation from '@/components/Navigation';
import Hero from '@/components/Hero';
import Footer from '@/components/Footer';
import Link from 'next/link';
import Image from 'next/image';
import { Plane, Navigation2, Trophy, Shield, MapPin, Camera, Users, Award, Heart } from 'lucide-react';
import EditableBackground from '@/components/EditableBackground';

export default function Home() {
  return (
    <main className="min-h-screen">
      <Navigation />
      <Hero />

      {/* Mission Statement Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xl text-navy-800 leading-relaxed">
            At GoFlyTexas, we take immense pride in our one-on-one pilot training. We believe that personalized instruction is the key to developing confident, skilled pilots. Our experienced instructors work closely with each student to ensure they receive the individual attention and support they need to succeed in their aviation journey.
          </p>
        </div>
      </section>

      {/* Flight Training Section */}
      <section className="py-20 bg-navy-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Flight Training
            </h2>
            <p className="text-xl text-navy-200 max-w-3xl mx-auto">
              Comprehensive pilot training programs designed to take you from first flight to professional pilot.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Link href="/private-pilot" className="bg-navy-800 p-8 rounded-lg border border-navy-700 hover:border-navy-500 hover:scale-105 transition-all duration-300 block">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-navy-700 rounded-full flex items-center justify-center mx-auto">
                  <Shield className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white">Private Pilot</h3>
                <p className="text-navy-300">Your first step to becoming a certified pilot</p>
              </div>
            </Link>

            <Link href="/instrument" className="bg-navy-800 p-8 rounded-lg border border-navy-700 hover:border-navy-500 hover:scale-105 transition-all duration-300 block">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-navy-700 rounded-full flex items-center justify-center mx-auto">
                  <Navigation2 className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white">Instrument</h3>
                <p className="text-navy-300">Master flying in all weather conditions</p>
              </div>
            </Link>

            <Link href="/commercial" className="bg-navy-800 p-8 rounded-lg border border-navy-700 hover:border-navy-500 hover:scale-105 transition-all duration-300 block">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-navy-700 rounded-full flex items-center justify-center mx-auto">
                  <Trophy className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white">Commercial</h3>
                <p className="text-navy-300">Turn your passion into a career</p>
              </div>
            </Link>

            <Link href="/flight-review" className="bg-navy-800 p-8 rounded-lg border border-navy-700 hover:border-navy-500 hover:scale-105 transition-all duration-300 block">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-navy-700 rounded-full flex items-center justify-center mx-auto">
                  <Shield className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white">BFR/IPC</h3>
                <p className="text-navy-300">Stay current and proficient</p>
              </div>
            </Link>

            <Link href="/cfi-academy" className="bg-navy-800 p-8 rounded-lg border border-navy-700 hover:border-navy-500 hover:scale-105 transition-all duration-300 block">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-navy-700 rounded-full flex items-center justify-center mx-auto">
                  <Trophy className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white">CFI Academy</h3>
                <p className="text-navy-300">Become a flight instructor</p>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Aircraft Fleet Preview */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-navy-900 mb-4">
              Our Aircraft
            </h2>
            <p className="text-xl text-navy-600 max-w-3xl mx-auto">
              Train in our well-maintained fleet of Cessna 172N Skyhawks, equipped with modern avionics.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { reg: "N4501E", desc: "Maroon stripe, proven trainer", img: "/4501E in T Hangar.jpg" },
              { reg: "N5217D", desc: "Brown/copper stripe, GPS equipped", img: "/IMG_4957.jpeg" },
              { reg: "N738UY", desc: "Blue stripe, advanced avionics", img: "/n738uy-ramp-front.jpg" },
              { reg: "N737ET", desc: "Red stripe, dual controls", img: "/IMG_4964.jpeg" },
            ].map((plane) => (
              <Link key={plane.reg} href="/aircraft" className="group bg-navy-50 rounded-lg overflow-hidden hover:shadow-xl transition-all">
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src={plane.img}
                    alt={`${plane.reg} Cessna 172N Skyhawk`}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-6 text-center">
                  <h3 className="text-2xl font-bold text-navy-900 mb-1">{plane.reg}</h3>
                  <p className="text-navy-600 mb-2">Cessna 172N Skyhawk</p>
                  <p className="text-navy-500 text-sm">{plane.desc}</p>
                </div>
              </Link>
            ))}
          </div>

          <div className="text-center mt-8">
            <Link href="/aircraft" className="inline-flex items-center px-6 py-3 bg-navy-900 text-white font-semibold rounded-full hover:bg-navy-800 transition-colors">
              View Full Fleet Details
            </Link>
          </div>
        </div>
      </section>

      {/* Our Services Section */}
      <section className="py-20 bg-navy-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Our Services
            </h2>
            <p className="text-xl text-navy-300 max-w-3xl mx-auto">
              Beyond flight training, we offer a range of aviation services to meet your needs.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-navy-900 p-8 rounded-lg border border-navy-700">
              <div className="space-y-4">
                <div className="w-16 h-16 bg-navy-800 rounded-full flex items-center justify-center">
                  <Plane className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-semibold text-white">Aircraft Rental</h3>
                <p className="text-navy-300 leading-relaxed">
                  Elevate your flying experience with our low-cost Cessna 172 rentals! Whether you're a seasoned pilot or building hours, our meticulously maintained aircraft offer the perfect blend of reliability and affordability. Equipped with modern avionics including advanced GPS navigation, our fleet ensures you fly with confidence. Available for local flights, cross-country adventures, or proficiency training.
                </p>
              </div>
            </div>

            <div className="bg-navy-900 p-8 rounded-lg border border-navy-700">
              <div className="space-y-4">
                <div className="w-16 h-16 bg-navy-800 rounded-full flex items-center justify-center">
                  <Camera className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-semibold text-white">Aerial Tours</h3>
                <p className="text-navy-300 leading-relaxed">
                  Experience the Dallas-Fort Worth metroplex like never before with our breathtaking aerial tours! Soar above iconic landmarks including the Dallas skyline, AT&T Stadium, Texas Motor Speedway, and beautiful Lake Ray Hubbard. Perfect for special occasions, romantic dates, or simply treating yourself to an unforgettable adventure. Gift certificates available!
                </p>
              </div>
            </div>

            <div className="bg-navy-900 p-8 rounded-lg border border-navy-700">
              <div className="space-y-4">
                <div className="w-16 h-16 bg-navy-800 rounded-full flex items-center justify-center">
                  <MapPin className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-semibold text-white">Ferry Flights</h3>
                <p className="text-navy-300 leading-relaxed">
                  Need an aircraft delivered safely and efficiently? Our professional ferry flight services connect buyers, sellers, and owners across the continental United States. With extensive experience in aircraft relocation, we handle everything from pre-flight inspections to weather planning and fuel stops. Reliable, insured ferry services with real-time flight tracking.
                </p>
              </div>
            </div>

            <div className="bg-navy-900 p-8 rounded-lg border border-navy-700">
              <div className="space-y-4">
                <div className="w-16 h-16 bg-navy-800 rounded-full flex items-center justify-center">
                  <Shield className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-semibold text-white">Insurance Checkouts</h3>
                <p className="text-navy-300 leading-relaxed">
                  Transitioning to a new aircraft or need to meet insurance requirements? Our comprehensive insurance checkout program ensures you're fully prepared and compliant. We work directly with all major aviation insurance companies to provide the dual instruction time required for coverage. Structured approach covering aircraft systems, performance, and emergency procedures.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-navy-900 mb-8 text-center">
              About GoFlyTexas
            </h2>
            <div className="bg-navy-50 rounded-lg p-8 border border-navy-100">
              <p className="text-lg text-navy-800 text-center leading-relaxed">
                At GoFlyTexas, we take immense pride in our one-on-one pilot training,
                where every student receives personalized instruction tailored to their
                unique learning style and pace. We believe that aviation is more than just
                mastering controls—it's about building confidence, skill, and a deep respect
                for the skies. Our dedicated instructors forge strong connections with each
                aspiring pilot, creating a supportive environment where questions are encouraged,
                progress is celebrated, and dreams take flight.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose GoFlyTexas */}
      <section className="py-16 bg-navy-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-white mb-12">
            Why Choose GoFlyTexas
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-navy-800 p-6 rounded-lg border border-navy-700 text-center">
              <div className="w-16 h-16 bg-navy-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">One-on-One Training</h3>
              <p className="text-navy-300">Personalized instruction tailored to your learning style and pace</p>
            </div>

            <div className="bg-navy-800 p-6 rounded-lg border border-navy-700 text-center">
              <div className="w-16 h-16 bg-navy-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Safety First</h3>
              <p className="text-navy-300">Impeccable safety record with modern, well-maintained aircraft</p>
            </div>

            <div className="bg-navy-800 p-6 rounded-lg border border-navy-700 text-center">
              <div className="w-16 h-16 bg-navy-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Experienced Instructors</h3>
              <p className="text-navy-300">Learn from seasoned pilots with thousands of hours experience</p>
            </div>

            <div className="bg-navy-800 p-6 rounded-lg border border-navy-700 text-center">
              <div className="w-16 h-16 bg-navy-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Passion for Aviation</h3>
              <p className="text-navy-300">We love flying and sharing that passion with our students</p>
            </div>
          </div>
        </div>
      </section>

      {/* Instagram / Social Feed Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-navy-900 mb-4">Follow Our Journey</h2>
          <p className="text-lg text-navy-600 mb-8">
            See what's happening at GoFlyTexas on Instagram
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <a
                key={i}
                href="https://www.instagram.com/goflytx"
                target="_blank"
                rel="noopener noreferrer"
                className="relative aspect-square overflow-hidden rounded-lg group"
              >
                <Image
                  src={`/instagram-${i}.jpeg`}
                  alt={`GoFlyTexas Instagram post ${i}`}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-navy-900/0 group-hover:bg-navy-900/30 transition-colors" />
              </a>
            ))}
          </div>
          <a
            href="https://www.instagram.com/goflytx"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-6 py-3 bg-navy-900 text-white font-semibold rounded-full hover:bg-navy-800 transition-colors"
          >
            Follow @goflytx on Instagram
          </a>
        </div>
      </section>

      {/* Get In Touch CTA */}
      <EditableBackground
        locationId="home-cta-background"
        className="py-20"
        fallbackClassName="bg-gradient-to-r from-navy-900 to-navy-800"
        overlayClassName="bg-navy-950/70"
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Take Off?
          </h2>
          <p className="text-xl text-navy-200 mb-8">
            Reach out to talk through your goals — training, rentals, or anything aviation.
          </p>
          <div className="space-x-4">
            <Link
              href="/contact"
              className="inline-flex items-center px-8 py-3 bg-white text-navy-900 font-semibold rounded-full hover:bg-navy-100 transition-colors"
            >
              Contact Us
            </Link>
            <a
              href="tel:+19409053090"
              className="inline-flex items-center px-8 py-3 bg-navy-700 text-white font-semibold rounded-full hover:bg-navy-600 transition-colors"
            >
              Call (940) 905-3090
            </a>
          </div>
        </div>
      </EditableBackground>

      <Footer />
    </main>
  );
}
