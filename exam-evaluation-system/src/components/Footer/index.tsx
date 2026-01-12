'use client';

import { Brain } from 'lucide-react';
import { siteConfig } from '@/config/site';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-6 sm:py-8 lg:py-10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          
          {/* Brand & Mission */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <Brain className="w-5 h-5 text-blue-400 flex-shrink-0" />
              <span className="font-bold text-lg">{siteConfig.title}</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed max-w-md">
              A smart learning and evaluation platform designed to simplify assessment workflows, 
              enhance transparency, and deliver AI-driven insights for modern education.
            </p>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-semibold mb-3 text-base">Resources</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li>
                <a href="#" className="hover:text-white transition-colors duration-200 inline-block">
                  User Guide
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors duration-200 inline-block">
                  Getting Started
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors duration-200 inline-block">
                  System Overview
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors duration-200 inline-block">
                  FAQs
                </a>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold mb-3 text-base">Support</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li>
                <a href="#" className="hover:text-white transition-colors duration-200 inline-block">
                  Help Center
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors duration-200 inline-block">
                  Contact Support
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors duration-200 inline-block">
                  Submit Feedback
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors duration-200 inline-block">
                  Report an Issue
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold mb-3 text-base">Legal</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li>
                <a href="#" className="hover:text-white transition-colors duration-200 inline-block">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors duration-200 inline-block">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors duration-200 inline-block">
                  Accessibility
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-800 mt-6 sm:mt-8 pt-4 sm:pt-6 text-center text-gray-400 text-xs sm:text-sm">
          <p>&copy; {new Date().getFullYear()} {siteConfig.title}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;