import { Metadata } from 'next';
import Navigation from '@/components/Navigation';
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

export const metadata: Metadata = {
  title: 'Flight Training Programs - All Pilot Certifications',
  description: 'Comprehensive flight training programs at GoFlyTexas. From discovery flights to CFI certification, we offer personalized instruction for every level.',
  openGraph: {
    title: 'Flight Training Programs | GoFlyTexas',
    description: 'Complete flight training from Private Pilot to CFI. One-on-one instruction tailored to your learning style.',
  },
};

const trainingPrograms = [
  {
    title: "Discovery Flight",
    description: "Your first step into aviation. Experience the thrill of flying with a certified instructor and log your first flight hour.",
    icon: Plane,
    href: "/discovery-flight",
    highlights: ["30-60 minute flight", "Hands-on experience", "Counts toward license"],
    color: "from-sky-400 to-sky-600"
  },
  {
    title: "Private Pilot",
    description: "The foundation of your aviation journey. Learn to fly and earn your private pilot certificate with personalized instruction.",
    icon: GraduationCap,
    href: "/private-pilot",
    highlights: ["Ground school included", "40+ flight hours", "FAA certification"],
    color: "from-blue-400 to-blue-600"
  },
  {
    title: "Instrument Rating (IFR)",
    description: "Master flying in clouds and poor weather conditions. Essential for serious pilots who want to fly in all conditions.",
    icon: Navigation2,
    href: "/instrument",
    highlights: ["Weather flying", "Advanced navigation", "Enhanced safety"],
    color: "from-indigo-400 to-indigo-600"
  },
  {
    title: "Commercial Pilot",
    description: "Turn your passion into a profession. Earn the certification needed to fly for compensation or hire.",
    icon: Trophy,
    href: "/commercial",
    highlights: ["Career opportunities", "Advanced maneuvers", "250+ hours required"],
    color: "from-purple-400 to-purple-600"
  },
  {
    title: "Flight Review (BFR/IPC)",
    description: "Stay current and proficient with regular flight reviews and instrument proficiency checks.",
    icon: Shield,
    href: "/flight-review",
    highlights: ["Stay current", "Refresh skills", "Meet FAA requirements"],
    color: "from-green-400 to-green-600"
  },
  {
    title: "CFI Academy",
    description: "Become a certified flight instructor and share your passion for aviation with the next generation of pilots.",
    icon: Users,
    href: "/cfi-academy",
    highlights: ["Teach others", "Build hours", "Aviation career"],
    color: "from-orange-400 to-orange-600"
  }
];

export default function FlightTrainingPage() {
  return (
    <main className="min-h-screen">
      <Navigation />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-sky-50 to-white pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Flight Training Programs
            </h1>
            <p className="text-xl text-gray-900 mb-4">
              From your first discovery flight to advanced certifications, we offer comprehensive 
              training tailored to your goals and learning style.
            </p>
            <p className="text-lg text-sky-600 font-semibold">
              One-on-one instruction • Modern aircraft • Flexible scheduling
            </p>
          </div>
        </div>
      </section>

      {/* Mission Statement */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <p className="text-lg text-gray-900 leading-relaxed text-center">
              At Go Fly Texas, we take immense pride in our one-on-one pilot training, where every 
              student receives personalized instruction tailored to their unique learning style and pace. 
              We believe that aviation is more than just mastering controls—it's about building confidence, 
              skill, and a deep respect for the skies.
            </p>
          </div>
        </div>
      </section>

      {/* Training Programs Grid */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {trainingPrograms.map((program, index) => {
              const Icon = program.icon;
              return (
                <Link
                  key={index}
                  href={program.href}
                  className="group bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 hover:scale-105"
                >
                  <div className={`h-2 bg-gradient-to-r ${program.color}`}></div>
                  <div className="p-6">
                    <div className="flex items-center mb-4">
                      <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${program.color} flex items-center justify-center text-white`}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 ml-4">{program.title}</h3>
                    </div>
                    
                    <p className="text-gray-900 mb-4 h-20">
                      {program.description}
                    </p>
                    
                    <ul className="space-y-2 mb-4">
                      {program.highlights.map((highlight, idx) => (
                        <li key={idx} className="flex items-start">
                          <span className="text-sky-600 mr-2">•</span>
                          <span className="text-gray-900 text-sm">{highlight}</span>
                        </li>
                      ))}
                    </ul>
                    
                    <div className="flex items-center text-sky-600 group-hover:text-sky-700 font-semibold">
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
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Why Choose Go Fly Texas
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-sky-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-10 w-10 text-sky-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">One-on-One Instruction</h3>
              <p className="text-gray-900">Personalized training tailored to your learning style and pace</p>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 bg-sky-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Plane className="h-10 w-10 text-sky-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Modern Fleet</h3>
              <p className="text-gray-900">Well-maintained Cessna 172N aircraft with updated avionics</p>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 bg-sky-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trophy className="h-10 w-10 text-sky-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Proven Success</h3>
              <p className="text-gray-900">High pass rate with students achieving their aviation goals</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-sky-600 to-sky-700 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-6">
            Start Your Aviation Journey Today
          </h2>
          <p className="text-xl mb-8 text-sky-100">
            Whether you're taking your first flight or advancing your ratings, we're here to help you succeed.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/discovery-flight"
              className="inline-flex items-center justify-center px-8 py-3 bg-white text-sky-600 font-semibold rounded-full hover:bg-gray-100 transition-colors text-lg"
            >
              Book Discovery Flight
            </Link>
            <a
              href="tel:+19409053090"
              className="inline-flex items-center justify-center px-8 py-3 bg-sky-500 text-white font-semibold rounded-full hover:bg-sky-400 transition-colors text-lg"
            >
              Call (940) 905-3090
            </a>
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