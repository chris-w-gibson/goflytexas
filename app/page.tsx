import Navigation from '@/components/Navigation';
import Hero from '@/components/Hero';
import Link from 'next/link';
import { CheckCircle, Users, Award, Calendar } from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-screen">
      <Navigation />
      <Hero />
      
      {/* Why Choose Us Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose GoFlyTexas
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              With decades of experience and a passion for aviation, we're committed to making your flying dreams a reality.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-sky-100 rounded-full flex items-center justify-center mx-auto">
                <Users className="h-8 w-8 text-sky-600" />
              </div>
              <h3 className="text-xl font-semibold">Expert Instructors</h3>
              <p className="text-gray-600">FAA-certified instructors with thousands of flight hours</p>
            </div>
            
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-sky-100 rounded-full flex items-center justify-center mx-auto">
                <Award className="h-8 w-8 text-sky-600" />
              </div>
              <h3 className="text-xl font-semibold">Modern Fleet</h3>
              <p className="text-gray-600">Well-maintained aircraft with latest avionics</p>
            </div>
            
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-sky-100 rounded-full flex items-center justify-center mx-auto">
                <Calendar className="h-8 w-8 text-sky-600" />
              </div>
              <h3 className="text-xl font-semibold">Flexible Scheduling</h3>
              <p className="text-gray-600">Book flights that fit your busy schedule</p>
            </div>
            
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-sky-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="h-8 w-8 text-sky-600" />
              </div>
              <h3 className="text-xl font-semibold">Proven Success</h3>
              <p className="text-gray-600">High pass rate for pilot certification exams</p>
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
              href="tel:+1234567890"
              className="inline-flex items-center px-8 py-3 bg-sky-500 text-white font-semibold rounded-full hover:bg-sky-400 transition-colors"
            >
              Call (123) 456-7890
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
                <li><a href="tel:+1234567890" className="hover:text-white transition-colors">(123) 456-7890</a></li>
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