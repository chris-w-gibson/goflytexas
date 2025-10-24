import { Metadata } from 'next';
import Navigation from '@/components/Navigation';
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

export const metadata: Metadata = {
  title: 'Our Team - Meet Your Flight Instructors | GoFlyTexas',
  description: 'Meet the experienced flight instructors at GoFlyTexas. Our dedicated team brings decades of aviation experience and a passion for teaching.',
  openGraph: {
    title: 'Our Team | GoFlyTexas Flight School',
    description: 'Meet our experienced flight instructors who are passionate about helping you achieve your aviation dreams.',
  },
};

export default function OurTeamPage() {
  return (
    <main className="min-h-screen">
      <Navigation />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-sky-50 to-white pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Meet Our Team
            </h1>
            <p className="text-xl text-gray-900">
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
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Our Teaching Philosophy
            </h2>
            <p className="text-lg text-gray-900 leading-relaxed mb-8">
              We believe in building lasting relationships with our students. When you train 
              with GoFlyTexas, you're not just another student in a large flight school—you're 
              part of our aviation family. Our instructors take the time to understand your 
              goals, learning style, and pace, creating a customized training experience that 
              sets you up for success.
            </p>
            <div className="grid md:grid-cols-3 gap-6 mt-12">
              <div className="bg-sky-50 p-6 rounded-lg">
                <Users className="h-8 w-8 text-sky-600 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900 mb-2">Personal Mentorship</h3>
                <p className="text-gray-900">One instructor throughout your journey</p>
              </div>
              <div className="bg-sky-50 p-6 rounded-lg">
                <Target className="h-8 w-8 text-sky-600 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900 mb-2">Goal-Oriented</h3>
                <p className="text-gray-900">Training tailored to your aviation dreams</p>
              </div>
              <div className="bg-sky-50 p-6 rounded-lg">
                <Heart className="h-8 w-8 text-sky-600 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900 mb-2">Supportive Environment</h3>
                <p className="text-gray-900">Questions encouraged, progress celebrated</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Lead Instructor Profile */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Your Flight Instructors
          </h2>
          
          {/* Chief Flight Instructor */}
          <div className="max-w-4xl mx-auto mb-12">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-sky-600 to-sky-700 text-white p-6">
                <h3 className="text-2xl font-bold mb-1">Chief Flight Instructor</h3>
                <p className="text-sky-100">CFI, CFII, MEI, ATP</p>
              </div>
              <div className="p-8">
                <div className="grid md:grid-cols-3 gap-6 mb-6">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-sky-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Clock className="h-8 w-8 text-sky-600" />
                    </div>
                    <h4 className="font-semibold text-gray-900">20+ Years Experience</h4>
                    <p className="text-gray-900">Over 10,000 flight hours</p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-sky-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <GraduationCap className="h-8 w-8 text-sky-600" />
                    </div>
                    <h4 className="font-semibold text-gray-900">500+ Students</h4>
                    <p className="text-gray-900">Successfully trained</p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-sky-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Award className="h-8 w-8 text-sky-600" />
                    </div>
                    <h4 className="font-semibold text-gray-900">Gold Seal CFI</h4>
                    <p className="text-gray-900">FAA recognized excellence</p>
                  </div>
                </div>
                
                <p className="text-gray-900 leading-relaxed mb-4">
                  With over two decades of experience in both commercial aviation and flight 
                  instruction, our Chief Flight Instructor brings a wealth of real-world knowledge 
                  to every lesson. Having flown everything from small trainers to corporate jets, 
                  they understand what it takes to succeed in aviation at every level.
                </p>
                
                <p className="text-gray-900 leading-relaxed mb-4">
                  "My greatest satisfaction comes from seeing that moment when everything clicks 
                  for a student—when they realize they're truly flying the airplane, not just 
                  going through the motions. That's what drives my passion for teaching."
                </p>
                
                <div className="border-t pt-4 mt-6">
                  <h4 className="font-semibold text-gray-900 mb-2">Specialties:</h4>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 bg-sky-100 text-sky-700 rounded-full text-sm">Private Pilot</span>
                    <span className="px-3 py-1 bg-sky-100 text-sky-700 rounded-full text-sm">Instrument Rating</span>
                    <span className="px-3 py-1 bg-sky-100 text-sky-700 rounded-full text-sm">Commercial</span>
                    <span className="px-3 py-1 bg-sky-100 text-sky-700 rounded-full text-sm">CFI Training</span>
                    <span className="px-3 py-1 bg-sky-100 text-sky-700 rounded-full text-sm">Multi-Engine</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Instructors */}
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Instructor 2 */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-sky-100 rounded-full flex items-center justify-center mr-4">
                  <Plane className="h-6 w-6 text-sky-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Senior Flight Instructor</h3>
                  <p className="text-gray-900">CFI, CFII</p>
                </div>
              </div>
              
              <div className="space-y-2 mb-4">
                <p className="text-gray-900"><strong>Experience:</strong> 8 years, 3,000+ hours</p>
                <p className="text-gray-900"><strong>Background:</strong> Former military pilot</p>
                <p className="text-gray-900"><strong>Focus:</strong> Instrument training specialist</p>
              </div>
              
              <p className="text-gray-900 text-sm leading-relaxed">
                Bringing military precision to civilian flight training, with a special talent 
                for helping students master instrument flying and develop excellent situational 
                awareness.
              </p>
            </div>

            {/* Instructor 3 */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-sky-100 rounded-full flex items-center justify-center mr-4">
                  <Star className="h-6 w-6 text-sky-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Flight Instructor</h3>
                  <p className="text-gray-900">CFI</p>
                </div>
              </div>
              
              <div className="space-y-2 mb-4">
                <p className="text-gray-900"><strong>Experience:</strong> 5 years, 1,500+ hours</p>
                <p className="text-gray-900"><strong>Background:</strong> Regional airline pilot</p>
                <p className="text-gray-900"><strong>Focus:</strong> Private & Commercial training</p>
              </div>
              
              <p className="text-gray-900 text-sm leading-relaxed">
                Currently flying for the airlines while sharing a passion for aviation through 
                flight instruction. Excellent at preparing students for professional aviation 
                careers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Values */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            What Our Team Stands For
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-sky-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-10 w-10 text-sky-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Safety Excellence</h3>
              <p className="text-gray-900">Zero compromise on safety standards and procedures</p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-sky-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <GraduationCap className="h-10 w-10 text-sky-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Continuous Learning</h3>
              <p className="text-gray-900">Always improving our teaching methods and skills</p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-sky-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="h-10 w-10 text-sky-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Student Success</h3>
              <p className="text-gray-900">Your achievements are our greatest rewards</p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-sky-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="h-10 w-10 text-sky-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Professional Excellence</h3>
              <p className="text-gray-900">Maintaining the highest standards in aviation</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-sky-600 to-blue-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-6">
            Ready to Learn from the Best?
          </h2>
          <p className="text-xl mb-8 text-sky-100">
            Our instructors are ready to guide you on your aviation journey. 
            Let's start with a conversation about your flying goals.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="tel:+19409053090"
              className="inline-flex items-center justify-center px-8 py-3 bg-white text-sky-600 font-semibold rounded-full hover:bg-gray-100 transition-colors text-lg"
            >
              Call (940) 905-3090
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