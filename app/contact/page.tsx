'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import Navigation from '@/components/Navigation';
import { 
  Phone, 
  Mail, 
  MapPin, 
  Clock,
  Send,
  CheckCircle
} from 'lucide-react';

type FormData = {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  preferredContact: 'email' | 'phone';
  flightInterest: string;
};

export default function ContactPage() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  const { 
    register, 
    handleSubmit, 
    formState: { errors, isSubmitting },
    reset
  } = useForm<FormData>();

  const onSubmit = async (data: FormData) => {
    // In a real app, this would send to your API
    console.log('Form submitted:', data);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setIsSubmitted(true);
    reset();
    
    // Reset success message after 5 seconds
    setTimeout(() => setIsSubmitted(false), 5000);
  };

  return (
    <main className="min-h-screen">
      <Navigation />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-sky-50 to-white pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Get in Touch
            </h1>
            <p className="text-xl text-gray-600">
              Ready to start your aviation journey? Have questions about our programs? 
              We're here to help!
            </p>
          </div>
        </div>
      </section>

      {/* Contact Information */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-8 mb-16">
            {/* Contact Cards */}
            <div className="bg-gray-50 rounded-lg p-6 text-center">
              <div className="w-12 h-12 bg-sky-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone className="h-6 w-6 text-sky-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Call Us</h3>
              <p className="text-gray-600 mb-2">Ready to answer your questions</p>
              <a 
                href="tel:+1234567890" 
                className="text-sky-600 hover:text-sky-700 font-medium"
              >
                (123) 456-7890
              </a>
            </div>

            <div className="bg-gray-50 rounded-lg p-6 text-center">
              <div className="w-12 h-12 bg-sky-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="h-6 w-6 text-sky-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Email Us</h3>
              <p className="text-gray-600 mb-2">We'll respond within 24 hours</p>
              <a 
                href="mailto:info@goflytexas.com" 
                className="text-sky-600 hover:text-sky-700 font-medium"
              >
                info@goflytexas.com
              </a>
            </div>

            <div className="bg-gray-50 rounded-lg p-6 text-center">
              <div className="w-12 h-12 bg-sky-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="h-6 w-6 text-sky-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Visit Us</h3>
              <p className="text-gray-600">
                Dallas Executive Airport<br />
                Dallas, TX 75001
              </p>
            </div>
          </div>

          {/* Contact Form and Info */}
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Form */}
            <div className="lg:col-span-2">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Send Us a Message
              </h2>

              {isSubmitted && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                  <p className="text-green-800">
                    Thank you! We've received your message and will get back to you soon.
                  </p>
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      {...register('name', { required: 'Name is required' })}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 ${
                        errors.name ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      {...register('email', { 
                        required: 'Email is required',
                        pattern: {
                          value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                          message: 'Invalid email address'
                        }
                      })}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 ${
                        errors.email ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      {...register('phone')}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="flightInterest" className="block text-sm font-medium text-gray-700 mb-2">
                      I'm Interested In
                    </label>
                    <select
                      id="flightInterest"
                      {...register('flightInterest')}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                    >
                      <option value="">Select an option</option>
                      <option value="discovery">Discovery Flight</option>
                      <option value="private">Private Pilot License</option>
                      <option value="instrument">Instrument Rating</option>
                      <option value="commercial">Commercial License</option>
                      <option value="rental">Aircraft Rental</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                    Subject
                  </label>
                  <input
                    type="text"
                    id="subject"
                    {...register('subject')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                    Message *
                  </label>
                  <textarea
                    id="message"
                    rows={5}
                    {...register('message', { required: 'Message is required' })}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 ${
                      errors.message ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.message && (
                    <p className="mt-1 text-sm text-red-600">{errors.message.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preferred Contact Method
                  </label>
                  <div className="space-x-6">
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        value="email"
                        {...register('preferredContact')}
                        defaultChecked
                        className="text-sky-600 focus:ring-sky-500"
                      />
                      <span className="ml-2">Email</span>
                    </label>
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        value="phone"
                        {...register('preferredContact')}
                        className="text-sky-600 focus:ring-sky-500"
                      />
                      <span className="ml-2">Phone</span>
                    </label>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center px-6 py-3 bg-sky-600 text-white font-semibold rounded-full hover:bg-sky-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>Sending...</>
                  ) : (
                    <>
                      <Send className="mr-2 h-5 w-5" />
                      Send Message
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Additional Info */}
            <div className="space-y-8">
              <div>
                <h3 className="text-xl font-semibold mb-4 flex items-center">
                  <Clock className="h-5 w-5 text-sky-600 mr-2" />
                  Hours of Operation
                </h3>
                <ul className="space-y-2 text-gray-600">
                  <li>Monday - Friday: 8:00 AM - 6:00 PM</li>
                  <li>Saturday: 8:00 AM - 5:00 PM</li>
                  <li>Sunday: 9:00 AM - 4:00 PM</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-4">Quick Info</h3>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-start">
                    <span className="text-sky-600 mr-2">•</span>
                    Discovery flights available 7 days a week
                  </li>
                  <li className="flex items-start">
                    <span className="text-sky-600 mr-2">•</span>
                    Walk-ins welcome (appointments preferred)
                  </li>
                  <li className="flex items-start">
                    <span className="text-sky-600 mr-2">•</span>
                    Free parking at the airport
                  </li>
                  <li className="flex items-start">
                    <span className="text-sky-600 mr-2">•</span>
                    Gift certificates available
                  </li>
                </ul>
              </div>

              <div className="bg-sky-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-2">Ready to Fly?</h3>
                <p className="text-gray-600 mb-4">
                  The fastest way to get started is to give us a call!
                </p>
                <a
                  href="tel:+1234567890"
                  className="inline-flex items-center text-sky-600 hover:text-sky-700 font-medium"
                >
                  <Phone className="h-5 w-5 mr-2" />
                  (123) 456-7890
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Map Placeholder */}
      <section className="h-96 bg-gray-200 relative">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <MapPin className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">Interactive Map Placeholder</p>
            <p className="text-gray-500">Google Maps integration would go here</p>
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