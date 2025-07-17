'use client'

import { useState } from 'react';
import { siteConfig } from '@/config/site';
import SignInPopup from '@/components/SignInPopup';
import SignupPopup from '@/components/SignupPopup';

export default function Home() {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isSignupOpen, setIsSignupOpen] = useState(false);

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">
          Welcome to {siteConfig.title}
        </h2>
        <div className="space-x-3">
          <button
            onClick={() => setIsLoginOpen(true)}
            className="px-4 py-2 bg-blue-900 text-white rounded-md hover:bg-blue-800"
          >
            Login
          </button>
          <button
            onClick={() => setIsSignupOpen(true)}
            className="px-4 py-2 border border-blue-900 text-blue-900 rounded-md hover:bg-blue-50"
          >
            Sign Up
          </button>
        </div>
      </div>

      <p className="text-gray-600">
        This is the home page of our exam evaluation system.
      </p>

      <SignInPopup isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
      <SignupPopup isOpen={isSignupOpen} onClose={() => setIsSignupOpen(false)} />
    </>
  );
}
