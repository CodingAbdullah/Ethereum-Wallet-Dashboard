"use client";

import Link from 'next/link';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Links } from '../utils/constants/Links';

// Navbar Custom Component
export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <nav className="bg-gray-900 text-gray-300 border-b border-gray-800">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-gray-200 to-gray-400 hover:from-gray-100 hover:to-gray-300 transition-all duration-300">
            ΞTHERΞUM DASHBOARD
          </Link>
          <div className="hidden lg:block">
            <div className="ml-10 flex items-baseline">
                {
                    Links.filter((_, index) => index > 8).map((link) => (
                        <Link
                            key={link.name}
                            href={link.href}
                            className="text-gray-400 hover:text-gray-100 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-300"
                            >
                            {link.name}
                        </Link>
                ))}
            </div>
          </div>
          <div className="lg:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white"
            >
              <span className="sr-only">Open main menu</span>
              {
                isOpen ? (
                    <X className="block h-6 w-6" aria-hidden="true" />
                ) : (
                    <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
        </div>
        {
            isOpen && (
                <div className="lg:hidden">
                    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                    {
                        Links.filter((_, index) => index > 8).map((link) => (
                            <Link
                                key={link.name}
                                href={link.href}
                                className="text-gray-400 hover:text-gray-100 block px-3 py-2 rounded-md text-base font-medium transition-colors duration-300"
                                onClick={() => setIsOpen(false)}
                            >
                                {link.name}
                            </Link>
                    ))}
                    </div>
                </div>
        )}
    </nav>
  )
}