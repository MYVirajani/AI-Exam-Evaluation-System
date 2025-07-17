"use client";
import { Dialog } from "@headlessui/react";
import { useState } from "react";
import { FaUser, FaEnvelope, FaLock, FaPhone, FaGlobe, FaCity, FaIdBadge } from "react-icons/fa";
import { siteConfig } from '@/config/site';

interface SignupPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SignupPopup({ isOpen, onClose }: SignupPopupProps) {
  const [role, setRole] = useState<string>("");

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-4xl bg-white rounded-lg shadow-lg flex overflow-hidden">
          {/* Left Section */}
          <div className="bg-blue-900 text-white w-1/3 p-8 hidden md:block">
            <h2 className="text-3xl font-bold mb-4">WELCOME TO AUTOEVAL360</h2>
            <p className="text-sm">Your Smart Exam Partner</p>
            <p className="mt-4 text-sm opacity-90">
              Join {siteConfig.title} to streamline your exam creation, delivery, and
              grading. Experience intelligent automation, real-time insights,
              and seamless results — all in one place.
            </p>
          </div>

          {/* Right Section */}
          <div className="w-full md:w-2/3 p-8 overflow-y-auto max-h-[90vh]">
            <Dialog.Title className="text-2xl font-bold text-blue-900 mb-6">
              Sign Up
            </Dialog.Title>
            <form className="grid grid-cols-2 gap-4">
              {/* First & Last Name */}
              <div className="relative">
                <FaUser className="absolute left-3 top-3 text-gray-500" />
                <input
                  type="text"
                  placeholder="First Name"
                  className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-md text-gray-800"
                />
              </div>
              <div className="relative">
                <FaUser className="absolute left-3 top-3 text-gray-500" />
                <input
                  type="text"
                  placeholder="Last Name"
                  className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-md text-gray-800"
                />
              </div>

              {/* Username */}
              <div className="relative col-span-2">
                <FaIdBadge className="absolute left-3 top-3 text-gray-500" />
                <input
                  type="text"
                  placeholder="Username"
                  className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-md text-gray-800"
                />
              </div>

              {/* Email & Password */}
              <div className="relative">
                <FaEnvelope className="absolute left-3 top-3 text-gray-500" />
                <input
                  type="email"
                  placeholder="Email"
                  className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-md text-gray-800"
                />
              </div>
              <div className="relative">
                <FaLock className="absolute left-3 top-3 text-gray-500" />
                <input
                  type="password"
                  placeholder="Password"
                  className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-md text-gray-800"
                />
              </div>

              {/* Title & Register As */}
              <div className="relative">
                <FaIdBadge className="absolute left-3 top-3 text-gray-500" />
                <input
                  type="text"
                  placeholder="Title (e.g., Mr, Ms, Dr)"
                  className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-md text-gray-800"
                />
              </div>
              <div className="col-span-2 mt-2">
                <span className="text-gray-700 text-sm">Register as:</span>
                <div className="mt-1 flex space-x-2">
                  {['student', 'educator', 'admin'].map(opt => (
                    <label
                      key={opt}
                      className={`px-4 py-2 border rounded-md cursor-pointer ${role === opt ? 'bg-blue-900 text-white' : 'border-gray-300 text-gray-800'}`} 
                      onClick={() => setRole(opt)}
                    >
                      {opt.charAt(0).toUpperCase() + opt.slice(1)}
                      <input type="radio" name="role" value={opt} className="sr-only" checked={role === opt} readOnly />
                    </label>
                  ))}
                </div>
              </div>

              {/* Phone & Address */}
              <div className="relative">
                <FaPhone className="absolute left-3 top-3 text-gray-500" />
                <input
                  type="text"
                  placeholder="Phone Number"
                  className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-md text-gray-800"
                />
              </div>
              <div className="relative">
                <FaGlobe className="absolute left-3 top-3 text-gray-500" />
                <input
                  type="text"
                  placeholder="Address (optional)"
                  className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-md text-gray-800"
                />
              </div>

              {/* City & Country */}
              <div className="relative">
                <FaCity className="absolute left-3 top-3 text-gray-500" />
                <input
                  type="text"
                  placeholder="City (optional)"
                  className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-md text-gray-800"
                />
              </div>
              <div className="relative">
                <FaGlobe className="absolute left-3 top-3 text-gray-500" />
                <input
                  type="text"
                  placeholder="Country (optional)"
                  className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-md text-gray-800"
                />
              </div>

              {/* Submit Buttons */}
              <div className="col-span-2 flex flex-col space-y-3">
                <button
                  type="submit"
                  className="w-full px-4 py-2 bg-blue-900 text-white rounded-md hover:bg-blue-800"
                >
                  Create Account
                </button>
                <div className="text-center text-gray-500">OR</div>
                <button
                  type="button"
                  className="w-full px-4 py-2 border border-blue-900 text-blue-900 rounded-md hover:bg-blue-50"
                >
                  Continue with other
                </button>
              </div>

              {/* Footer Links */}
              <div className="col-span-2 text-center">
                <p className="text-sm text-gray-600">
                  Already have an account?{' '}
                  <button
                    type="button"
                    className="text-blue-900 hover:underline"
                    onClick={() => {
                      onClose();
                    }}
                  >
                    Sign In
                  </button>
                </p>
                <button
                  onClick={onClose}
                  className="mt-2 text-sm text-blue-900 hover:underline"
                >
                  Close
                </button>
              </div>
            </form>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
