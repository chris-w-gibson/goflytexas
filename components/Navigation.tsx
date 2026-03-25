"use client";

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X, Phone } from 'lucide-react';

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed w-full bg-navy-900/95 backdrop-blur-sm z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 hover:opacity-90 transition-opacity">
            <Image src="/GFT-logo.png" alt="Go Fly Texas" width={40} height={40} className="h-10 w-auto" />
            <span className="text-xl font-bold text-white">Go Fly Texas</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-navy-200 hover:text-white transition-colors">
              Home
            </Link>
            <Link href="/flight-training" className="text-navy-200 hover:text-white transition-colors">
              Flight Training
            </Link>
            <Link href="/aircraft" className="text-navy-200 hover:text-white transition-colors">
              Our Aircraft
            </Link>
            <Link href="/our-team" className="text-navy-200 hover:text-white transition-colors">
              Our Team
            </Link>
            <Link href="/contact" className="text-navy-200 hover:text-white transition-colors">
              Contact
            </Link>
            <a
              href="tel:+19409053090"
              className="flex items-center space-x-2 bg-white text-navy-900 px-4 py-2 rounded-full hover:bg-navy-100 transition-colors font-semibold"
            >
              <Phone className="h-4 w-4" />
              <span>Call Now</span>
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-md text-white hover:text-navy-200 focus:outline-none"
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-navy-900 border-t border-navy-700">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link
              href="/"
              className="block px-3 py-2 rounded-md text-navy-200 hover:text-white hover:bg-navy-800"
              onClick={() => setIsOpen(false)}
            >
              Home
            </Link>
            <Link
              href="/flight-training"
              className="block px-3 py-2 rounded-md text-navy-200 hover:text-white hover:bg-navy-800"
              onClick={() => setIsOpen(false)}
            >
              Flight Training
            </Link>
            <Link
              href="/aircraft"
              className="block px-3 py-2 rounded-md text-navy-200 hover:text-white hover:bg-navy-800"
              onClick={() => setIsOpen(false)}
            >
              Our Aircraft
            </Link>
            <Link
              href="/our-team"
              className="block px-3 py-2 rounded-md text-navy-200 hover:text-white hover:bg-navy-800"
              onClick={() => setIsOpen(false)}
            >
              Our Team
            </Link>
            <Link
              href="/contact"
              className="block px-3 py-2 rounded-md text-navy-200 hover:text-white hover:bg-navy-800"
              onClick={() => setIsOpen(false)}
            >
              Contact
            </Link>
            <a
              href="tel:+19409053090"
              className="block px-3 py-2 rounded-md bg-white text-navy-900 hover:bg-navy-100 text-center font-semibold"
            >
              Call Now: (940) 905-3090
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}
