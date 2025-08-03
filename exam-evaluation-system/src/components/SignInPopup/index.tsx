"use client";

import { Dialog } from "@headlessui/react";
import { useState } from "react";
import toast from "react-hot-toast";
import { FaUser, FaLock } from "react-icons/fa";
import { siteConfig } from "@/config/site";
import { useRouter } from "next/navigation";


interface SignInPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToSignUp: () => void;
}

export default function SignInPopup({ isOpen, onClose,onSwitchToSignUp }: SignInPopupProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
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
        console.log('user: ',user);

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

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-4xl bg-white rounded-lg shadow-lg flex overflow-hidden">
          {/* Left Section */}
          <div className="bg-blue-900 text-white w-1/2 p-8 hidden md:block">
            <h2 className="text-3xl font-bold mb-4">WELCOME BACK</h2>
            <p className="text-sm">Log in to {siteConfig.title}</p>
            <p className="mt-4 text-sm opacity-90">
              Continue your journey with {siteConfig.title} — the platform that
              makes exam evaluation smarter, faster, and more accurate.
            </p>
          </div>

          {/* Right Section */}
          <div className="w-full md:w-1/2 p-8">
            <Dialog.Title className="text-2xl font-bold text-blue-900 mb-6">
              Sign in
            </Dialog.Title>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <FaUser className="absolute left-3 top-3 text-gray-500" />
                <input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  type="text"
                  placeholder="Username"
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-gray-800"
                  disabled={submitting}
                />
              </div>

              <div className="relative">
                <FaLock className="absolute left-3 top-3 text-gray-500" />
                <input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type="password"
                  placeholder="Password"
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-gray-800"
                  disabled={submitting}
                />
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="text-gray-800">
                  <input type="checkbox" className="mr-1" disabled={submitting}/>
                  Remember me
                </label>
                <a href="#" className="text-blue-900 hover:underline">
                  Forgot Password?
                </a>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full px-4 py-2 bg-blue-900 text-white rounded-md hover:bg-blue-800 disabled:opacity-50"
              >
                {submitting ? "Signing in…" : "Sign in"}
              </button>

              <div className="text-center text-gray-500 my-2">OR</div>

              <button
                type="button"
                className="w-full px-4 py-2 border border-blue-900 text-blue-900 rounded-md hover:bg-blue-50"
                disabled={submitting}
              >
                Sign in with other
              </button>
            </form>

            <p className="mt-4 text-sm text-center text-gray-600">
              Don’t have an account?{" "}
              <button
                 onClick={() => {
                      onClose();
                      onSwitchToSignUp();
                    }}
                className="text-blue-900 hover:underline"
                disabled={submitting}
              >
                Sign up
              </button>
            </p>

            <button
              onClick={onClose}
              className="mt-6 block text-sm text-blue-900 text-center hover:underline"
              disabled={submitting}
            >
              Close
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
