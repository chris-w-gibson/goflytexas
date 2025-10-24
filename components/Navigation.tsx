"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X, Phone } from 'lucide-react';

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed w-full bg-white/95 backdrop-blur-sm z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-sky-600">GoFlyTexas</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-gray-700 hover:text-sky-600 transition-colors">
              Home
            </Link>
            <Link href="/discovery-flight" className="text-gray-700 hover:text-sky-600 transition-colors">
              Discovery Flight
            </Link>
            <Link href="/aircraft" className="text-gray-700 hover:text-sky-600 transition-colors">
              Our Aircraft
            </Link>
            <Link href="/contact" className="text-gray-700 hover:text-sky-600 transition-colors">
              Contact
            </Link>
            <a
              href="tel:+1234567890"
              className="flex items-center space-x-2 bg-sky-600 text-white px-4 py-2 rounded-full hover:bg-sky-700 transition-colors"
            >
              <Phone className="h-4 w-4" />
              <span>Call Now</span>
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-md text-gray-700 hover:text-sky-600 focus:outline-none"
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-t">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link
              href="/"
              className="block px-3 py-2 rounded-md text-gray-700 hover:text-sky-600 hover:bg-sky-50"
              onClick={() => setIsOpen(false)}
            >
              Home
            </Link>
            <Link
              href="/discovery-flight"
              className="block px-3 py-2 rounded-md text-gray-700 hover:text-sky-600 hover:bg-sky-50"
              onClick={() => setIsOpen(false)}
            >
              Discovery Flight
            </Link>
            <Link
              href="/aircraft"
              className="block px-3 py-2 rounded-md text-gray-700 hover:text-sky-600 hover:bg-sky-50"
              onClick={() => setIsOpen(false)}
            >
              Our Aircraft
            </Link>
            <Link
              href="/contact"
              className="block px-3 py-2 rounded-md text-gray-700 hover:text-sky-600 hover:bg-sky-50"
              onClick={() => setIsOpen(false)}
            >
              Contact
            </Link>
            <a
              href="tel:+1234567890"
              className="block px-3 py-2 rounded-md bg-sky-600 text-white hover:bg-sky-700 text-center"
            >
              Call Now: (123) 456-7890
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}