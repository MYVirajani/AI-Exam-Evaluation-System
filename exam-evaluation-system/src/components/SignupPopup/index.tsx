"use client";

import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { useState } from "react";
import toast from "react-hot-toast";
import {
  FaUser,
  FaEnvelope,
  FaLock,
  FaPhone,
  FaGlobe,
  FaCity,
  FaIdBadge,
  FaRobot,
  FaBrain,
  FaChartLine,
  FaEye,
  FaEyeSlash,
  FaGraduationCap,
  FaBuilding,
  FaChevronDown,
} from "react-icons/fa";
import { FiX } from "react-icons/fi";

interface SignupPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToSignIn: () => void;
}

export default function SignupPopup({ isOpen, onClose, onSwitchToSignIn }: SignupPopupProps) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [title, setTitle] = useState("");
  const [role, setRole] = useState<"student" | "educator" | "admin">("student");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [institute, setInstitute] = useState("");
  const [officialEmail, setOfficialEmail] = useState("");
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showScrollHint, setShowScrollHint] = useState(true);

  // password validation
  const passwordIsValid = password.length >= 6;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // client-side checks
    if (
      !firstName ||
      !lastName ||
      !title ||
      !username ||
      !password ||
      !email ||
      !phone
    ) {
      toast.error("Please fill in all required fields.");
      return;
    }
    if (!passwordIsValid) {
      toast.error("Password must be at least 6 characters.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          first_name: firstName,
          last_name: lastName,
          title,
          role,
          username,
          password,
          email,
          phone_number: phone,
          address: address || undefined,
          city: city || undefined,
          country: country || undefined,
          official_email: officialEmail || undefined,
          education_institute: institute || undefined,
          registration_number: registrationNumber || undefined,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        toast.error(json.error || "Signup failed");
      } else if ((json as any).existing) {
        toast("You already have an account — please sign in.", {
          icon: "ℹ️",
        });
        onClose();
        onSwitchToSignIn();
      } else {
        toast.success("Account created successfully!");
        onClose();
        onSwitchToSignIn();
      }
    } catch (err: any) {
      console.error("Signup error:", err);
      toast.error(err.message || "Failed to sign up");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSwitchToSignIn = () => {
    onClose();
    onSwitchToSignIn();
  };

  // Handle scroll to hide the scroll hint
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const element = e.currentTarget;
    if (element.scrollTop > 50) {
      setShowScrollHint(false);
    } else if (element.scrollTop === 0) {
      setShowScrollHint(true);
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      {/* Backdrop with blur effect */}
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="relative w-full max-w-6xl bg-white rounded-2xl shadow-2xl flex overflow-hidden transform transition-all max-h-[95vh]">
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
          <div className="relative bg-gradient-to-br from-indigo-900 via-purple-800 to-blue-900 text-white w-1/3 p-10 hidden md:flex flex-col justify-center overflow-hidden">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-16 left-8 w-28 h-28 bg-purple-200 rounded-full blur-3xl animate-pulse"></div>
              <div className="absolute bottom-16 right-8 w-20 h-20 bg-blue-300 rounded-full blur-2xl animate-ping"></div>
              <div className="absolute top-1/3 right-1/4 w-14 h-14 bg-indigo-300 rounded-full blur-xl animate-bounce"></div>
            </div>
            
            {/* Floating AI Icons Animation */}
            <div className="absolute inset-0">
              <FaRobot className="absolute top-12 right-16 w-5 h-5 text-purple-300/30 animate-bounce" />
              <FaBrain className="absolute top-28 left-12 w-4 h-4 text-blue-300/40 animate-pulse" />
              <FaChartLine className="absolute bottom-20 left-16 w-4 h-4 text-indigo-300/30 animate-ping" />
              <FaGraduationCap className="absolute bottom-32 right-12 w-5 h-5 text-purple-300/25 animate-pulse" />
            </div>
            
            <div className="relative z-10">
              <div className="mb-6">
                <div className="w-14 h-14 bg-gradient-to-r from-purple-500/30 to-blue-500/30 rounded-xl flex items-center justify-center mb-5 backdrop-blur-sm border border-purple-400/20 animate-pulse">
                  <FaRobot className="w-7 h-7 text-purple-200 animate-bounce" />
                </div>
                <h2 className="text-3xl font-bold mb-3 leading-tight transform transition-all duration-1000 translate-x-0 opacity-100">
                  Join AutoEval360°
                </h2>
                <p className="text-purple-100 text-lg font-medium transform transition-all duration-1000 delay-300 translate-y-0 opacity-100">
                  Your Smart Exam Partner
                </p>
              </div>
              
              <div className="space-y-4 transform transition-all duration-1000 delay-500 translate-y-0 opacity-100">
                <p className="text-purple-100/90 leading-relaxed text-sm">
                  Experience intelligent exam automation with AI-powered evaluation, real-time insights, and seamless results management.
                </p>
                
                <div className="space-y-2 pt-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                    <span className="text-xs text-purple-100">AI-Powered Grading</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse delay-75"></div>
                    <span className="text-xs text-purple-100">Real-time Analytics</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse delay-150"></div>
                    <span className="text-xs text-purple-100">Seamless Integration</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Section - Enhanced Form */}
          <div 
            className="w-full md:w-2/3 p-8 overflow-y-auto scrollbar-hide relative" 
            onScroll={handleScroll}
          >
            {/* Scroll hint indicator */}
            {showScrollHint && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20 pointer-events-none">
                <div className="flex flex-col items-center space-y-1 opacity-60">
                  <span className="text-xs text-gray-500 font-medium">Scroll for more</span>
                  <FaChevronDown className="w-4 h-4 text-gray-500 animate-bounce" />
                </div>
              </div>
            )}
            
            <div className="max-w-2xl mx-auto">
              <DialogTitle className="text-3xl font-bold text-gray-900 mb-2 text-center">
                Create Account
              </DialogTitle>
              <p className="text-gray-600 text-center mb-6">
                Join the future of intelligent exam evaluation
              </p>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Personal Information Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">Personal Information</h3>
                  
                  {/* First & Last Name */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 block">First Name *</label>
                      <div className="relative">
                        <FaUser className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          type="text"
                          placeholder="Enter your first name"
                          className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
                          disabled={submitting}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 block">Last Name *</label>
                      <div className="relative">
                        <FaUser className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          type="text"
                          placeholder="Enter your last name"
                          className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
                          disabled={submitting}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Title & Role */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 block">Title *</label>
                      <div className="relative">
                        <FaIdBadge className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          type="text"
                          placeholder="Mr, Ms, Dr, etc."
                          className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
                          disabled={submitting}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 block">Register as *</label>
                      <div className="flex space-x-1">
                        {(["student", "educator", "admin"] as const).map((opt) => (
                          <button
                            key={opt}
                            type="button"
                            className={`flex-1 px-3 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                              role === opt
                                ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-md"
                                : "border border-gray-300 text-gray-700 hover:bg-gray-50"
                            }`}
                            onClick={() => !submitting && setRole(opt)}
                            disabled={submitting}
                          >
                            {opt.charAt(0).toUpperCase() + opt.slice(1)}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Account Information Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">Account Information</h3>
                  
                  {/* Username */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 block">Username *</label>
                    <div className="relative">
                      <input
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        type="text"
                        placeholder="Choose a unique username"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
                        disabled={submitting}
                      />
                    </div>
                  </div>

                  {/* Email & Password */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 block">Email *</label>
                      <div className="relative">
                        <FaEnvelope className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          type="email"
                          placeholder="Enter your email"
                          className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
                          disabled={submitting}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 block">Password *</label>
                      <div className="relative">
                        <FaLock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          type={showPassword ? "text" : "password"}
                          placeholder="Create password"
                          className={`w-full pl-12 pr-12 py-3 rounded-xl text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white border ${
                            password && !passwordIsValid
                              ? "border-red-500 focus:ring-red-500"
                              : "border-gray-300 focus:ring-purple-500"
                          }`}
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
                      {password && !passwordIsValid && (
                        <p className="text-red-600 text-sm mt-1">
                          Password must be at least 6 characters.
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Contact Information Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">Contact Information</h3>
                  
                  {/* Phone & Address */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 block">Phone Number *</label>
                      <div className="relative">
                        <FaPhone className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          type="text"
                          placeholder="Enter phone number"
                          className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
                          disabled={submitting}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 block">Address</label>
                      <div className="relative">
                        <FaGlobe className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          type="text"
                          placeholder="Enter address"
                          className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
                          disabled={submitting}
                        />
                      </div>
                    </div>
                  </div>

                  {/* City & Country */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 block">City</label>
                      <div className="relative">
                        <FaCity className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          type="text"
                          placeholder="Enter city"
                          className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
                          disabled={submitting}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 block">Country</label>
                      <div className="relative">
                        <FaGlobe className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                          value={country}
                          onChange={(e) => setCountry(e.target.value)}
                          type="text"
                          placeholder="Enter country"
                          className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
                          disabled={submitting}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Role-specific fields */}
                {role === "educator" && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">Educator Information</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 block">Official Email *</label>
                        <div className="relative">
                          <FaEnvelope className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                          <input
                            value={officialEmail}
                            onChange={(e) => setOfficialEmail(e.target.value)}
                            type="email"
                            placeholder="Institutional email"
                            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
                            disabled={submitting}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 block">Education Institute *</label>
                        <div className="relative">
                          <FaBuilding className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                          <input
                            value={institute}
                            onChange={(e) => setInstitute(e.target.value)}
                            type="text"
                            placeholder="Institute name"
                            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
                            disabled={submitting}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {role === "student" && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">Student Information</h3>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 block">Registration Number *</label>
                      <div className="relative">
                        <FaGraduationCap className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                          value={registrationNumber}
                          onChange={(e) => setRegistrationNumber(e.target.value)}
                          type="text"
                          placeholder="Enter registration number"
                          className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
                          disabled={submitting}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={submitting || !passwordIsValid}
                  className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-700 text-white font-medium rounded-xl hover:from-purple-700 hover:via-blue-700 hover:to-indigo-800 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg"
                >
                  {submitting ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creating Account...
                    </span>
                  ) : (
                    "Create Account"
                  )}
                </button>

                {/* Sign in link */}
                <div className="text-center">
                  <p className="text-gray-600">
                    Already have an account?{" "}
                    <button
                      type="button"
                      onClick={handleSwitchToSignIn}
                      className="text-blue-600 hover:text-blue-800 font-medium transition-colors hover:underline focus:outline-none focus:ring-2 focus:ring-purple-500 rounded px-1"
                      disabled={submitting}
                    >
                      Sign In
                    </button>
                  </p>
                </div>
              </form>
            </div>
          </div>
        </DialogPanel>
      </div>
      
      {/* Custom CSS to hide scrollbar */}
      <style jsx>{`
        .scrollbar-hide {
          scrollbar-width: none; /* Firefox */
          -ms-overflow-style: none; /* Internet Explorer 10+ */
        }
        
        .scrollbar-hide::-webkit-scrollbar {
          width: 0px;
          background: transparent; /* Chrome/Safari/Webkit */
        }
      `}</style>
    </Dialog>
  );
}