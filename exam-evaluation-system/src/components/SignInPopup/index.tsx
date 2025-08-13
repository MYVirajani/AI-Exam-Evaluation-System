"use client";

import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { useState } from "react";
import toast from "react-hot-toast";
import { FaLock, FaEye, FaEyeSlash, FaRobot, FaBrain, FaChartLine } from "react-icons/fa";
import { siteConfig } from "@/config/site";
import { useRouter } from "next/navigation";
import { FiX } from "react-icons/fi";

interface SignInPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToSignUp: () => void;
}

export default function SignInPopup({ isOpen, onClose, onSwitchToSignUp }: SignInPopupProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // simple client-side validation
    if (!username.trim() || !password) {
      toast.error("Please enter both username and password.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error || "Sign in failed");
      } else {
        toast.success("Signed in successfully!");
        const user = json.user;

        // ✅ store user data 
        localStorage.setItem("user", JSON.stringify(user));
        console.log('user: ', user);

        // ✅ navigate based on role
        if (user.role === "admin") {
          router.push("/admin/dashboard");
        } else if (user.role === "educator") {
          router.push("/educator/dashboard");
        } else if (user.role === "student") {
          router.push("/student/dashboard");
        } else {
          toast.error("Unknown user role");
        }

        // onClose();
        // TODO: store session/token, redirect, etc.
      }
    } catch (err: any) {
      console.error("Signin error:", err);
      toast.error(err.message || "Failed to sign in");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSwitchToSignUp = () => {
    onClose();
    onSwitchToSignUp();
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      {/* Backdrop with blur effect */}
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="relative w-full max-w-5xl bg-white rounded-2xl shadow-2xl flex overflow-hidden transform transition-all">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-6 right-6 z-10 text-gray-400 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-full p-1 transition-colors"
            disabled={submitting}
            aria-label="Close"
          >
            <FiX className="w-6 h-6" />
          </button>

          {/* Left Section - Enhanced Design with Animation */}
          <div className="relative bg-gradient-to-br from-blue-900 via-purple-800 to-indigo-900 text-white w-1/2 p-12 hidden md:flex flex-col justify-center overflow-hidden">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-20 left-10 w-32 h-32 bg-purple-200 rounded-full blur-3xl animate-pulse"></div>
              <div className="absolute bottom-20 right-10 w-24 h-24 bg-blue-300 rounded-full blur-2xl animate-ping"></div>
              <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-indigo-300 rounded-full blur-xl animate-bounce"></div>
            </div>
            
            {/* Floating AI Icons Animation */}
            <div className="absolute inset-0">
              <FaRobot className="absolute top-16 right-20 w-6 h-6 text-purple-300/30 animate-bounce" />
              <FaBrain className="absolute top-32 left-16 w-5 h-5 text-blue-300/40 animate-pulse" />
              <FaChartLine className="absolute bottom-24 left-20 w-4 h-4 text-indigo-300/30 animate-ping" />
            </div>
            
            <div className="relative z-10">
              <div className="mb-8">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500/30 to-blue-500/30 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-sm border border-purple-400/20 animate-pulse">
                  <FaRobot className="w-8 h-8 text-purple-200 animate-bounce" />
                </div>
                <h2 className="text-4xl font-bold mb-4 leading-tight transform transition-all duration-1000 translate-x-0 opacity-100">
                  Welcome Back
                </h2>
                <p className="text-purple-100 text-lg font-medium transform transition-all duration-1000 delay-300 translate-y-0 opacity-100">
                  Access your AI-powered learning hub
                </p>
              </div>
              
              <div className="space-y-4 transform transition-all duration-1000 delay-500 translate-y-0 opacity-100">
                <p className="text-purple-100/90 leading-relaxed">
                  Experience smart exam evaluation with AI-driven analytics and instant results.
                </p>
                
                <div className="flex items-center space-x-4 pt-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                    <span className="text-sm text-purple-100">AI Evaluation</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse delay-75"></div>
                    <span className="text-sm text-purple-100">Smart Analytics</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Section - Enhanced Form */}
          <div className="w-full md:w-1/2 p-12 flex flex-col justify-center">
            <div className="max-w-sm mx-auto w-full">
              <DialogTitle className="text-3xl font-bold text-gray-900 mb-2 text-center">
                Sign In
              </DialogTitle>
              <p className="text-gray-600 text-center mb-8">
                Enter your credentials to access your account
              </p>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Username Field */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 block">
                    Username
                  </label>
                  <div className="relative">
                    <input
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      type="text"
                      placeholder="Enter your username"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
                      disabled={submitting}
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 block">
                    Password
                  </label>
                  <div className="relative">
                    <FaLock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-xl text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
                      disabled={submitting}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      disabled={submitting}
                    >
                      {showPassword ? <FaEyeSlash className="w-4 h-4" /> : <FaEye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Remember me & Forgot password */}
                <div className="flex items-center justify-between">
                  <label className="flex items-center text-sm text-gray-600 cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500 mr-2" 
                      disabled={submitting}
                    />
                    Remember me
                  </label>
                  <a href="#" className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors">
                    Forgot Password?
                  </a>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-700 text-white font-medium rounded-xl hover:from-purple-700 hover:via-blue-700 hover:to-indigo-800 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg"
                >
                  {submitting ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Signing in...
                    </span>
                  ) : (
                    "Sign In"
                  )}
                </button>
              </form>

              {/* Sign up link */}
              <div className="mt-8 text-center">
                <p className="text-gray-600">
                  Don't have an account?{" "}
                  <button
                    onClick={handleSwitchToSignUp}
                    className="text-blue-600 hover:text-blue-800 font-medium transition-colors hover:underline focus:outline-none focus:ring-2 focus:ring-purple-500 rounded px-1"
                    disabled={submitting}
                  >
                    Create Account
                  </button>
                </p>
              </div>
            </div>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
}