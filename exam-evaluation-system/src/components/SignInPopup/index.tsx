"use client";
import { Dialog } from "@headlessui/react";
import { FaUser, FaLock } from "react-icons/fa";
import { siteConfig } from '@/config/site';

interface SignInPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SignInPopup({ isOpen, onClose }: SignInPopupProps) {
  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-4xl bg-white rounded-lg shadow-lg flex overflow-hidden">
          {/* Left Section */}
          <div className="bg-blue-900 text-white w-1/2 p-8 hidden md:block">
            <h2 className="text-3xl font-bold mb-4">WELCOME BACK</h2>
            <p className="text-sm">Log in to AutoEval360</p>
            <p className="mt-4 text-sm opacity-90">
              Continue your journey with {siteConfig.title} — the platform that makes
              exam evaluation smarter, faster, and more accurate. Let's get you
              back to what matters most.
            </p>
          </div>

          {/* Right Section */}
          <div className="w-full md:w-1/2 p-8">
            <Dialog.Title className="text-2xl font-bold text-blue-900 mb-6">
              Sign in
            </Dialog.Title>
            <form className="space-y-4">
              <div className="relative">
                <FaUser className="absolute left-3 top-3 text-gray-500" />
                <input
                  type="text"
                  placeholder="User Name"
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-gray-800"
                />
              </div>

              <div className="relative">
                <FaLock className="absolute left-3 top-3 text-gray-500" />
                <input
                  type="password"
                  placeholder="Password"
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-gray-800"
                />
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="text-gray-800">
                  <input type="checkbox" className="mr-1" />
                  Remember me
                </label>
                <a href="#" className="text-blue-900 hover:underline">
                  Forgot Password?
                </a>
              </div>

              <button
                type="submit"
                className="w-full px-4 py-2 bg-blue-900 text-white rounded-md hover:bg-blue-800"
              >
                Sign in
              </button>

              <div className="text-center text-gray-500 my-2">OR</div>

              <button
                type="button"
                className="w-full px-4 py-2 border border-blue-900 text-blue-900 rounded-md hover:bg-blue-50"
              >
                Sign in with other
              </button>
            </form>

            <p className="mt-4 text-sm text-center text-gray-600">
              Don’t have an account?{" "}
              <button className="text-blue-900 hover:underline">Sign up</button>
            </p>

            <button
              onClick={onClose}
              className="mt-6 block text-sm text-blue-900 text-center hover:underline"
            >
              Close
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
