'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
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
    console.log('Form submitted:', data);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSubmitted(true);
    reset();
  };

  return (
    <main className="min-h-screen">
      <Navigation />

      {/* Hero Section */}
      <section className="bg-navy-950 pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Get in Touch
            </h1>
            <p className="text-xl text-navy-200">
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
            <div className="bg-navy-50 rounded-lg p-6 text-center border border-navy-100">
              <div className="w-12 h-12 bg-navy-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-navy-900">Call Us</h3>
              <p className="text-navy-600 mb-2">Ready to answer your questions</p>
              <a
                href="tel:+19409053090"
                className="text-navy-900 hover:text-navy-700 font-medium"
              >
                (940) 905-3090
              </a>
            </div>

            <div className="bg-navy-50 rounded-lg p-6 text-center border border-navy-100">
              <div className="w-12 h-12 bg-navy-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-navy-900">Email Us</h3>
              <p className="text-navy-600 mb-2">We'll respond within 24 hours</p>
              <a
                href="mailto:info@goflytexas.com"
                className="text-navy-900 hover:text-navy-700 font-medium"
              >
                info@goflytexas.com
              </a>
            </div>

            <div className="bg-navy-50 rounded-lg p-6 text-center border border-navy-100">
              <div className="w-12 h-12 bg-navy-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-navy-900">Visit Us</h3>
              <p className="text-navy-700">
                Aero Valley Airport (52F)<br />
                104 Boeing Way<br />
                Roanoke, TX 76272
              </p>
            </div>
          </div>

          {/* Contact Form and Info */}
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Form */}
            <div className="lg:col-span-2">
              <h2 className="text-2xl font-bold text-navy-900 mb-6">
                Send Us a Message
              </h2>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-navy-900 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      {...register('name', { required: 'Name is required' })}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-navy-500 text-navy-900 ${
                        errors.name ? 'border-red-500' : 'border-navy-200'
                      }`}
                    />
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-navy-900 mb-2">
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
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-navy-500 text-navy-900 ${
                        errors.email ? 'border-red-500' : 'border-navy-200'
                      }`}
                    />
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-navy-900 mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      {...register('phone', { required: 'Phone number is required' })}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-navy-500 text-navy-900 ${
                        errors.phone ? 'border-red-500' : 'border-navy-200'
                      }`}
                    />
                    {errors.phone && (
                      <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="flightInterest" className="block text-sm font-medium text-navy-900 mb-2">
                      I'm Interested In
                    </label>
                    <select
                      id="flightInterest"
                      {...register('flightInterest')}
                      className="w-full px-4 py-2 border border-navy-200 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-navy-500 text-navy-900"
                    >
                      <option value="">Select an option</option>
                      <option value="private">Private Pilot License</option>
                      <option value="instrument">Instrument Rating</option>
                      <option value="commercial">Commercial License</option>
                      <option value="rental">Aircraft Rental</option>
                      <option value="tour">Aerial Tour</option>
                      <option value="ferry">Ferry Flight</option>
                      <option value="insurance">Insurance Checkout</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-navy-900 mb-2">
                    Message *
                  </label>
                  <textarea
                    id="message"
                    rows={5}
                    {...register('message', { required: 'Message is required' })}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-navy-500 text-navy-900 ${
                      errors.message ? 'border-red-500' : 'border-navy-200'
                    }`}
                  />
                  {errors.message && (
                    <p className="mt-1 text-sm text-red-600">{errors.message.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-navy-900 mb-2">
                    Preferred Contact Method
                  </label>
                  <div className="space-x-6">
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        value="email"
                        {...register('preferredContact')}
                        defaultChecked
                        className="text-navy-900 focus:ring-navy-500"
                      />
                      <span className="ml-2 text-navy-800">Email</span>
                    </label>
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        value="phone"
                        {...register('preferredContact')}
                        className="text-navy-900 focus:ring-navy-500"
                      />
                      <span className="ml-2 text-navy-800">Phone</span>
                    </label>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center px-6 py-3 bg-navy-900 text-white font-semibold rounded-full hover:bg-navy-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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

                {isSubmitted && (
                  <div
                    role="status"
                    aria-live="polite"
                    className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4 flex items-center"
                  >
                    <CheckCircle className="h-5 w-5 text-green-600 mr-2 flex-shrink-0" />
                    <p className="text-green-800">
                      Thank you! We've received your message and will get back to you soon.
                    </p>
                  </div>
                )}
              </form>
            </div>

            {/* Additional Info */}
            <div className="space-y-8">
              <div>
                <h3 className="text-xl font-semibold mb-4 flex items-center text-navy-900">
                  <Clock className="h-5 w-5 text-navy-700 mr-2" />
                  Hours of Operation
                </h3>
                <ul className="space-y-2 text-navy-700">
                  <li>Open daily: 8:00 AM - 5:00 PM</li>
                  <li className="text-sm text-navy-500">Flights available 24/7 by appointment</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-4 text-navy-900">Quick Info</h3>
                <ul className="space-y-2 text-navy-700">
                  <li className="flex items-start">
                    <span className="text-navy-500 mr-2">•</span>
                    Walk-ins welcome (appointments preferred)
                  </li>
                  <li className="flex items-start">
                    <span className="text-navy-500 mr-2">•</span>
                    Free parking at the airport
                  </li>
                  <li className="flex items-start">
                    <span className="text-navy-500 mr-2">•</span>
                    Gift certificates available
                  </li>
                </ul>
              </div>

              <div className="bg-navy-900 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-2 text-white">Ready to Fly?</h3>
                <p className="text-navy-200 mb-4">
                  The fastest way to get started is to give us a call!
                </p>
                <a
                  href="tel:+19409053090"
                  className="inline-flex items-center text-white hover:text-navy-200 font-medium"
                >
                  <Phone className="h-5 w-5 mr-2" />
                  (940) 905-3090
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="bg-navy-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-semibold text-navy-900 flex items-center justify-center">
              <MapPin className="h-6 w-6 text-navy-700 mr-2" />
              Find Us at Aero Valley Airport (52F)
            </h2>
            <p className="text-navy-600 mt-1">104 Boeing Way, Roanoke, TX 76272</p>
          </div>
          <div className="rounded-lg overflow-hidden shadow-lg border border-navy-200">
            <iframe
              title="Map to Aero Valley Airport (52F)"
              src="https://www.google.com/maps?q=104+Boeing+Way+Roanoke+TX+76272&output=embed"
              width="100%"
              height="450"
              style={{ border: 0 }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
