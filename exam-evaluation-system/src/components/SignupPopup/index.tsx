"use client";

import { Dialog,DialogPanel,DialogTitle } from "@headlessui/react";
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
} from "react-icons/fa";
import { siteConfig } from "@/config/site";
import { FiX } from "react-icons/fi";

interface SignupPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToSignIn: () => void;
}

export default function SignupPopup({ isOpen, onClose,onSwitchToSignIn }: SignupPopupProps) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [title, setTitle] = useState("");
  const [role, setRole] = useState<"student" | "educator" | "admin">("student");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [institute, setInstitute] = useState("");
  const [officialEmail, setOfficialEmail] = useState("");
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [submitting, setSubmitting] = useState(false);

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

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="relative w-full max-w-4xl bg-white rounded-lg shadow-lg flex overflow-hidden">
          {/* Close button in top-right */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 focus:outline-none"
            disabled={submitting}
            aria-label="Close"
          >
            <FiX className="w-6 h-6" />
          </button>
          
          {/* Left Section */}
          <div className="bg-blue-900 text-white w-1/3 p-8 hidden md:block">
            <h2 className="text-3xl font-bold mb-4">WELCOME TO AUTOEVAL360</h2>
            <p className="text-sm">Your Smart Exam Partner</p>
            <p className="mt-4 text-sm opacity-90">
              Join {siteConfig.title} to streamline your exam creation,
              delivery, and grading. Experience intelligent automation,
              real-time insights, and seamless results — all in one place.
            </p>
          </div>

          {/* Right Section */}
          <div className="w-full md:w-2/3 p-8 overflow-y-auto max-h-[90vh]">
            <DialogTitle className="text-2xl font-bold text-blue-900 mb-6">
              Sign Up
            </DialogTitle>

            <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
              {/* First & Last Name */}
              <div className="relative">
                <FaUser className="absolute left-3 top-3 text-gray-500" />
                <input
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  type="text"
                  placeholder="First Name *"
                  className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-md text-gray-800"
                  disabled={submitting}
                />
              </div>
              <div className="relative">
                <FaUser className="absolute left-3 top-3 text-gray-500" />
                <input
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  type="text"
                  placeholder="Last Name *"
                  className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-md text-gray-800"
                  disabled={submitting}
                />
              </div>

              {/* Username */}
              <div className="relative col-span-2">
                <FaIdBadge className="absolute left-3 top-3 text-gray-500" />
                <input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  type="text"
                  placeholder="Username *"
                  className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-md text-gray-800"
                  disabled={submitting}
                />
              </div>

              {/* Email */}
              <div className="relative">
                <FaEnvelope className="absolute left-3 top-3 text-gray-500" />
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  placeholder="Email *"
                  className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-md text-gray-800"
                  disabled={submitting}
                />
              </div>

              {/* Password with validation */}
              <div className="relative">
                <FaLock className="absolute left-3 top-3 text-gray-500" />
                <input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type="password"
                  placeholder="Password *"
                  className={`w-full px-3 py-2 pl-10 rounded-md text-gray-800 border ${
                    password && !passwordIsValid
                      ? "border-red-500 focus:border-red-500"
                      : "border-gray-300"
                  }`}
                  disabled={submitting}
                />
                {password && !passwordIsValid && (
                  <p className="text-red-600 text-sm mt-1">
                    Password must be at least 6 characters.
                  </p>
                )}
              </div>

              {/* Title */}
              <div className="relative">
                <FaIdBadge className="absolute left-3 top-3 text-gray-500" />
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  type="text"
                  placeholder="Title (e.g., Mr, Ms, Dr) *"
                  className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-md text-gray-800"
                  disabled={submitting}
                />
              </div>

              {/* Role selector */}
              <div className="col-span-2 mt-2">
                <span className="text-gray-700 text-sm">Register as: *</span>
                <div className="mt-1 flex space-x-2">
                  {(["student", "educator", "admin"] as const).map((opt) => (
                    <label
                      key={opt}
                      className={`px-4 py-2 border rounded-md cursor-pointer ${
                        role === opt
                          ? "bg-blue-900 text-white"
                          : "border-gray-300 text-gray-800"
                      }`}
                      onClick={() => !submitting && setRole(opt)}
                    >
                      {opt.charAt(0).toUpperCase() + opt.slice(1)}
                    </label>
                  ))}
                </div>
              </div>

              {/* Phone & Address */}
              <div className="relative">
                <FaPhone className="absolute left-3 top-3 text-gray-500" />
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  type="text"
                  placeholder="Phone Number *"
                  className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-md text-gray-800"
                  disabled={submitting}
                />
              </div>
              <div className="relative">
                <FaGlobe className="absolute left-3 top-3 text-gray-500" />
                <input
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  type="text"
                  placeholder="Address"
                  className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-md text-gray-800"
                  disabled={submitting}
                />
              </div>

              {/* City & Country */}
              <div className="relative">
                <FaCity className="absolute left-3 top-3 text-gray-500" />
                <input
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  type="text"
                  placeholder="City"
                  className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-md text-gray-800"
                  disabled={submitting}
                />
              </div>
              <div className="relative">
                <FaGlobe className="absolute left-3 top-3 text-gray-500" />
                <input
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  type="text"
                  placeholder="Country"
                  className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-md text-gray-800"
                  disabled={submitting}
                />
              </div>

              {/* Educator extras */}
              {role === "educator" && (
                <>
                  <div className="col-span-2">
                    <label className="block text-sm text-gray-700">
                      Official Email *
                    </label>
                    <input
                      value={officialEmail}
                      onChange={(e) => setOfficialEmail(e.target.value)}
                      type="email"
                      placeholder="Institutional Email"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-800"
                      disabled={submitting}
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm text-gray-700">
                      Education Institute *
                    </label>
                    <input
                      value={institute}
                      onChange={(e) => setInstitute(e.target.value)}
                      type="text"
                      placeholder="Institute Name"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-800"
                      disabled={submitting}
                    />
                  </div>
                </>
              )}

              {/* Student extras */}
              {role === "student" && (
                <div className="col-span-2">
                  <label className="block text-sm text-gray-700">
                    Registration Number *
                  </label>
                  <input
                    value={registrationNumber}
                    onChange={(e) => setRegistrationNumber(e.target.value)}
                    type="text"
                    placeholder="Reg. Number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-800"
                    disabled={submitting}
                  />
                </div>
              )}

              {/* Submit */}
              <div className="col-span-2 flex flex-col space-y-3">
                <button
                  type="submit"
                  disabled={submitting || !passwordIsValid}
                  className="w-full px-4 py-2 bg-blue-900 text-white rounded-md hover:bg-blue-800 disabled:opacity-50"
                >
                  {submitting ? "Creating…" : "Create Account"}
                </button>
              </div>

              {/* Footer */}
              <div className="col-span-2 text-center">
                <p className="text-sm text-gray-600">
                  Already have an account?{" "}
                  <button
                    type="button"
                    className="text-blue-900 hover:underline"
                     onClick={() => {
                      onClose();
                      onSwitchToSignIn();
                    }}
                    disabled={submitting}
                  >
                    Sign In
                  </button>
                </p>
              </div>
            </form>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
}
