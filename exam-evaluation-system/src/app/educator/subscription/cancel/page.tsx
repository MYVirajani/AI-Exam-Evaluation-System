// app/educator/subscription/cancel/page.tsx
"use client";

import { useRouter } from "next/navigation";
import { XCircle } from "lucide-react";

export default function SubscriptionCancelPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white shadow-xl rounded-2xl p-8 text-center">
        <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />

        <h1 className="text-2xl font-semibold text-gray-800">
          Payment Cancelled
        </h1>

        <p className="text-gray-600 mt-3">
          Your payment was not completed.
          <br />
          No charges were made.
        </p>

        <button
          onClick={() => router.push("/educator/pricing")}
          className="mt-6 w-full bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 transition"
        >
          Try Again
        </button>

        <button
          onClick={() => router.push("/educator/dashboard")}
          className="mt-3 w-full text-gray-500 hover:text-gray-700 text-sm"
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );
}
