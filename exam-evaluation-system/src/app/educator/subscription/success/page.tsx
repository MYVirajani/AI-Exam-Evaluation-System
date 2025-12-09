// app/educator/subscription/success/page.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2 } from "lucide-react";

export default function SubscriptionSuccessPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect after webhook finishes processing
    const timer = setTimeout(() => {
      router.push("/educator/dashboard");
    }, 4000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white shadow-xl rounded-2xl p-8 text-center">
        <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />

        <h1 className="text-2xl font-semibold text-gray-800">
          Subscription Activated 🎉
        </h1>

        <p className="text-gray-600 mt-3">
          Your payment was successful.
          <br />
          We’re activating your subscription now.
        </p>

        <p className="text-sm text-gray-400 mt-6">
          Redirecting to your dashboard...
        </p>
      </div>
    </div>
  );
}
