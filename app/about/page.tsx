import { Metadata } from 'next';
import Navigation from '@/components/Navigation';
import Link from 'next/link';
import { 
  Award,
  Shield,
  Heart,
  Users,
  Star,
  MapPin,
  Clock,
  CheckCircle
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'About GoFlyTexas - Your Premier Flight School',
  description: 'Learn about GoFlyTexas, our experienced instructors, safety commitment, and passion for aviation training. Discover why we\'re the best choice for your pilot training.',
  openGraph: {
    title: 'About GoFlyTexas | Premier Flight Training',
    description: 'Meet our team, learn our story, and discover why GoFlyTexas is your best choice for pilot training.',
  },
};

export default function AboutPage() {
  return (
    <main className="min-h-screen">
      <Navigation />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-sky-50 to-white pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              About GoFlyTexas
            </h1>
            <p className="text-xl text-gray-900">
              Your journey to the skies begins with the right team. At GoFlyTexas, 
              we combine decades of aviation experience with a passion for teaching 
              to help you achieve your flying dreams.
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-r from-sky-50 to-blue-50 rounded-lg p-8 shadow-lg">
              <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
                Our Mission
              </h2>
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

      {/* Values Section */}
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

      {/* Our Story */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Our Story
          </h2>
          
          <div className="prose prose-lg max-w-none text-gray-900">
            <p className="mb-6">
              GoFlyTexas was founded with a simple belief: learning to fly should be an 
              inspiring, personalized journey. Having witnessed the limitations of large 
              flight schools with packed schedules and rotating instructors, we set out 
              to create something different.
            </p>
            
            <p className="mb-6">
              Our founder, a veteran pilot with over 20 years of experience in both 
              commercial and instructional flying, envisioned a flight school where 
              every student would receive the same quality of instruction he wished 
              he had received when starting out.
            </p>
            
            <p>
              Today, GoFlyTexas continues that tradition of excellence. We've helped 
              hundreds of students achieve their aviation dreams, from first-time 
              discovery flights to advanced commercial ratings. Each success story 
              reinforces our commitment to personalized, high-quality flight training.
            </p>
          </div>
        </div>
      </section>

      {/* What Sets Us Apart */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            What Sets Us Apart
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <div className="bg-white rounded-lg p-8 shadow-lg">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <Star className="h-6 w-6 text-yellow-500 mr-2" />
                Personalized Approach
              </h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-sky-600 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-900">Same instructor throughout your training</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-sky-600 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-900">Flexible scheduling to fit your life</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-sky-600 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-900">Custom lesson plans for your goals</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-sky-600 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-900">Progress tracking and regular feedback</span>
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-lg p-8 shadow-lg">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <Award className="h-6 w-6 text-yellow-500 mr-2" />
                Quality & Safety
              </h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-sky-600 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-900">Modern, well-maintained aircraft fleet</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-sky-600 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-900">Comprehensive pre-flight briefings</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-sky-600 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-900">Weather-conscious decision making</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-sky-600 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-900">Regular safety reviews and updates</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Location & Hours */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Visit Us
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <MapPin className="h-6 w-6 text-sky-600 mr-3" />
                <h3 className="text-xl font-semibold">Location</h3>
              </div>
              <p className="text-gray-900">
                GoFlyTexas Flight School<br />
                Dallas Executive Airport<br />
                Dallas, TX 75237
              </p>
              <Link href="/contact" className="inline-block mt-4 text-sky-600 hover:text-sky-700 font-semibold">
                Get Directions →
              </Link>
            </div>

            <div className="bg-gray-50 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <Clock className="h-6 w-6 text-sky-600 mr-3" />
                <h3 className="text-xl font-semibold">Hours</h3>
              </div>
              <div className="text-gray-900 space-y-1">
                <p><span className="font-semibold">Monday - Friday:</span> 8:00 AM - 6:00 PM</p>
                <p><span className="font-semibold">Saturday:</span> 8:00 AM - 5:00 PM</p>
                <p><span className="font-semibold">Sunday:</span> 9:00 AM - 4:00 PM</p>
              </div>
              <p className="mt-4 text-sm text-gray-900">
                * Flight training available outside regular hours by appointment
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-sky-600 to-blue-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-6">
            Ready to Start Your Aviation Journey?
          </h2>
          <p className="text-xl mb-8 text-sky-100">
            Join the GoFlyTexas family and experience the difference personalized training makes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="tel:+1234567890"
              className="inline-flex items-center justify-center px-8 py-3 bg-white text-sky-600 font-semibold rounded-full hover:bg-gray-100 transition-colors text-lg"
            >
              Call (123) 456-7890
            </a>
            <Link
              href="/discovery-flight"
              className="inline-flex items-center justify-center px-8 py-3 bg-sky-500 text-white font-semibold rounded-full hover:bg-sky-400 transition-colors text-lg"
            >
              Book Discovery Flight
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