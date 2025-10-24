import Navigation from '@/components/Navigation';
import Hero from '@/components/Hero';
import Link from 'next/link';
import { Plane, Navigation2, Trophy, Shield, MapPin, Camera, Users, Award, Heart } from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-screen">
      <Navigation />
      <Hero />
      
      {/* Mission Statement Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xl text-gray-900 leading-relaxed">
            At Go Fly Texas, we take immense pride in our one-on-one pilot training. We believe that personalized instruction is the key to developing confident, skilled pilots. Our experienced instructors work closely with each student to ensure they receive the individual attention and support they need to succeed in their aviation journey.
          </p>
        </div>
      </section>

      {/* Flight Training Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Flight Training
            </h2>
            <p className="text-xl text-gray-900 max-w-3xl mx-auto">
              Comprehensive pilot training programs designed to take you from first flight to professional pilot.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Link href="/discovery-flight" className="bg-white p-8 rounded-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 block">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-sky-100 rounded-full flex items-center justify-center mx-auto">
                  <Plane className="h-8 w-8 text-sky-600" />
                </div>
                <h3 className="text-xl font-semibold">Discovery Flight</h3>
                <p className="text-gray-900">Experience the joy of flying with an introductory flight lesson</p>
              </div>
            </Link>
            
            <Link href="/private-pilot" className="bg-white p-8 rounded-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 block">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-sky-100 rounded-full flex items-center justify-center mx-auto">
                  <Shield className="h-8 w-8 text-sky-600" />
                </div>
                <h3 className="text-xl font-semibold">Private Pilot</h3>
                <p className="text-gray-900">Your first step to becoming a certified pilot</p>
              </div>
            </Link>
            
            <Link href="/instrument" className="bg-white p-8 rounded-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 block">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-sky-100 rounded-full flex items-center justify-center mx-auto">
                  <Navigation2 className="h-8 w-8 text-sky-600" />
                </div>
                <h3 className="text-xl font-semibold">Instrument</h3>
                <p className="text-gray-900">Master flying in all weather conditions</p>
              </div>
            </Link>
            
            <Link href="/commercial" className="bg-white p-8 rounded-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 block">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-sky-100 rounded-full flex items-center justify-center mx-auto">
                  <Trophy className="h-8 w-8 text-sky-600" />
                </div>
                <h3 className="text-xl font-semibold">Commercial</h3>
                <p className="text-gray-900">Turn your passion into a career</p>
              </div>
            </Link>
            
            <Link href="/bfr-ipc" className="bg-white p-8 rounded-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 block">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-sky-100 rounded-full flex items-center justify-center mx-auto">
                  <Shield className="h-8 w-8 text-sky-600" />
                </div>
                <h3 className="text-xl font-semibold">BFR/IPC</h3>
                <p className="text-gray-900">Stay current and proficient</p>
              </div>
            </Link>
            
            <Link href="/cfi-academy" className="bg-white p-8 rounded-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 block">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-sky-100 rounded-full flex items-center justify-center mx-auto">
                  <Trophy className="h-8 w-8 text-sky-600" />
                </div>
                <h3 className="text-xl font-semibold">CFI Academy</h3>
                <p className="text-gray-900">Become a flight instructor</p>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Our Services Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Our Services
            </h2>
            <p className="text-xl text-gray-900 max-w-3xl mx-auto">
              Beyond flight training, we offer a range of aviation services to meet your needs.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-gray-50 p-8 rounded-lg">
              <div className="space-y-4">
                <div className="w-16 h-16 bg-sky-100 rounded-full flex items-center justify-center">
                  <Plane className="h-8 w-8 text-sky-600" />
                </div>
                <h3 className="text-2xl font-semibold">Aircraft Rental</h3>
                <p className="text-gray-900 leading-relaxed">
                  Elevate your flying experience with our low-cost Cessna 172 rentals! Whether you're a seasoned pilot or building hours, our meticulously maintained aircraft offer the perfect blend of reliability and affordability. Equipped with modern avionics including advanced GPS navigation, our fleet ensures you fly with confidence. Available for local flights, cross-country adventures, or proficiency training. Our competitive hourly rates and flexible scheduling make it easy to take to the skies whenever inspiration strikes. Current fleet: N5217D, N738UY, N737ET - each aircraft maintained to the highest standards for your safety and comfort.
                </p>
              </div>
            </div>
            
            <div className="bg-gray-50 p-8 rounded-lg">
              <div className="space-y-4">
                <div className="w-16 h-16 bg-sky-100 rounded-full flex items-center justify-center">
                  <Camera className="h-8 w-8 text-sky-600" />
                </div>
                <h3 className="text-2xl font-semibold">Aerial Tours</h3>
                <p className="text-gray-900 leading-relaxed">
                  Experience the Dallas-Fort Worth metroplex like never before with our breathtaking aerial tours! Soar above iconic landmarks including the Dallas skyline, AT&T Stadium, Texas Motor Speedway, and beautiful Lake Ray Hubbard. Our experienced pilots provide engaging narration as you capture stunning photographs from unique vantage points. Perfect for special occasions, romantic dates, or simply treating yourself to an unforgettable adventure. Tours can be customized to your interests, whether you want to see downtown architecture, suburban sprawl, or natural landscapes. Gift certificates available - give the gift of flight!
                </p>
              </div>
            </div>
            
            <div className="bg-gray-50 p-8 rounded-lg">
              <div className="space-y-4">
                <div className="w-16 h-16 bg-sky-100 rounded-full flex items-center justify-center">
                  <MapPin className="h-8 w-8 text-sky-600" />
                </div>
                <h3 className="text-2xl font-semibold">Ferry Flights</h3>
                <p className="text-gray-900 leading-relaxed">
                  Need an aircraft delivered safely and efficiently? Our professional ferry flight services connect buyers, sellers, and owners across the continental United States. With extensive experience in aircraft relocation, we handle everything from pre-flight inspections to weather planning and fuel stops. Our pilots are trained in various aircraft types and understand the importance of treating your aircraft with care. Whether you've purchased a plane across the country or need to reposition for maintenance, we provide reliable, insured ferry services with real-time flight tracking for your peace of mind.
                </p>
              </div>
            </div>
            
            <div className="bg-gray-50 p-8 rounded-lg">
              <div className="space-y-4">
                <div className="w-16 h-16 bg-sky-100 rounded-full flex items-center justify-center">
                  <Shield className="h-8 w-8 text-sky-600" />
                </div>
                <h3 className="text-2xl font-semibold">Insurance Checkouts</h3>
                <p className="text-gray-900 leading-relaxed">
                  Transitioning to a new aircraft or need to meet insurance requirements? Our comprehensive insurance checkout program ensures you're fully prepared and compliant. We work directly with all major aviation insurance companies to provide the dual instruction time required for coverage. Our structured approach covers aircraft systems, performance characteristics, emergency procedures, and type-specific handling qualities. Whether stepping up to a complex aircraft or getting back into flying after a break, we'll ensure you meet all insurance prerequisites while building genuine proficiency and confidence.
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
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8 text-center">
              About GoFlyTexas
            </h2>
            <div className="bg-gradient-to-r from-sky-50 to-blue-50 rounded-lg p-8 shadow-lg">
              <p className="text-lg text-gray-900 text-center leading-relaxed">
                At Go Fly Texas, we take immense pride in our one-on-one pilot training, 
                where every student receives personalized instruction tailored to their 
                unique learning style and pace. We believe that aviation is more than just 
                mastering controls—it's about building confidence, skill, and a deep respect 
                for the skies. Our dedicated instructors forge strong connections with each 
                aspiring pilot, creating a supportive environment where questions are encouraged, 
                progress is celebrated, and dreams take flight. With a focus on safety, 
                precision, and passion, Go Fly Texas is committed to shaping confident 
                aviators who are ready to soar with purpose and pride.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose GoFlyTexas */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Why Choose GoFlyTexas
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="w-16 h-16 bg-sky-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-sky-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">One-on-One Training</h3>
              <p className="text-gray-900">Personalized instruction tailored to your learning style and pace</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="w-16 h-16 bg-sky-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-sky-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Safety First</h3>
              <p className="text-gray-900">Impeccable safety record with modern, well-maintained aircraft</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="w-16 h-16 bg-sky-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="h-8 w-8 text-sky-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Experienced Instructors</h3>
              <p className="text-gray-900">Learn from seasoned pilots with thousands of hours experience</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="w-16 h-16 bg-sky-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="h-8 w-8 text-sky-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Passion for Aviation</h3>
              <p className="text-gray-900">We love flying and sharing that passion with our students</p>
            </div>
          </div>
        </div>
      </section>

      {/* Discovery Flight CTA */}
      <section className="py-20 bg-gradient-to-r from-sky-600 to-sky-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Take Off?
          </h2>
          <p className="text-xl text-sky-100 mb-8">
            Your first flight is just a click away. Experience the freedom of flight with our Discovery Flight program.
          </p>
          <div className="space-x-4">
            <Link
              href="/discovery-flight"
              className="inline-flex items-center px-8 py-3 bg-white text-sky-600 font-semibold rounded-full hover:bg-gray-100 transition-colors"
            >
              Book Discovery Flight
            </Link>
            <a
              href="tel:+19409053090"
              className="inline-flex items-center px-8 py-3 bg-sky-500 text-white font-semibold rounded-full hover:bg-sky-400 transition-colors"
            >
              Call (940) 905-3090
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-white font-bold text-xl mb-4">GoFlyTexas</h3>
              <p className="text-sm">Professional flight training in Dallas, Texas. Your aviation journey starts here.</p>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/discovery-flight" className="hover:text-white transition-colors">Discovery Flight</Link></li>
                <li><Link href="/aircraft" className="hover:text-white transition-colors">Our Aircraft</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Contact Info</h4>
              <ul className="space-y-2 text-sm">
                <li>Dallas Executive Airport</li>
                <li>Dallas, TX 75001</li>
                <li><a href="tel:+19409053090" className="hover:text-white transition-colors">(940) 905-3090</a></li>
                <li><a href="mailto:info@goflytexas.com" className="hover:text-white transition-colors">info@goflytexas.com</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
            <p>&copy; {new Date().getFullYear()} GoFlyTexas. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}