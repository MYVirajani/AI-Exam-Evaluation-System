"use client";

import { useState } from "react";
import { X, CreditCard, Lock, CheckCircle } from "lucide-react";

interface EvaluationModel {
  model_id: string;
  model_name: string;
  description?: string;
}

interface PricingPlan {
  pricing_plan_id: string;
  name: string;
  billing_period: string;
  price: number;
  description?: string;
  features: string[];
  evaluation_model: EvaluationModel;
}

const BILLING_PERIOD_LABELS: Record<string, string> = {
  day: "Daily",
  week: "Weekly",
  month: "Monthly",
  year: "Yearly",
  "3_months": "Every 3 months",
  "6_months": "Every 6 months",
  custom: "Custom",
};

// Mock CardElement component for demo
const CardElement = () => (
  <div className="p-4 border rounded-lg bg-gray-50">
    <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
      <CreditCard className="w-4 h-4" />
      Card Information
    </div>
    <input
      type="text"
      placeholder="1234 1234 1234 1234"
      className="w-full p-2 border rounded mb-2 text-sm text-gray-900"
    />
    <div className="flex gap-2">
      <input
        type="text"
        placeholder="MM / YY"
        className="flex-1 p-2 border rounded text-sm text-gray-900"
      />
      <input
        type="text"
        placeholder="CVC"
        className="flex-1 p-2 border rounded text-sm text-gray-900"
      />
    </div>
  </div>
);

interface PaymentModalProps {
  plan: PricingPlan;
  onClose: () => void;
}

export default function PaymentModal({ plan, onClose }: PaymentModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const handlePayment = async () => {
    setLoading(true);
    setError(null);

    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));

      if (Math.random() > 0.3) {
        setPaymentSuccess(true);
        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        setError(
          "Your card was declined. Please try a different payment method."
        );
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (paymentSuccess) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md text-center animate-pulse">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Payment Successful!
          </h2>
          <p className="text-gray-600 mb-4">Welcome to {plan?.name}</p>
          <div className="w-full bg-green-100 rounded-full h-1">
            <div className="bg-green-600 h-1 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl lg:max-w-6xl overflow-hidden">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-blue-600 to-purple-700 px-6 py-4 text-white">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-opacity-20 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-opacity-20 rounded-xl flex items-center justify-center">
              <CreditCard className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Complete Payment</h2>
              <p className="text-blue-100 text-sm">Secure checkout</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="grid lg:grid-cols-2 gap-0">
          {/* Left Column */}
          <div className="p-6 bg-gradient-to-br from-blue-50 to-purple-50">
            <div className="sticky top-0">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Order Summary
              </h3>
              <div className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-semibold text-gray-800">
                      {plan?.name}
                    </h4>
                    <p className="text-sm text-gray-600">{plan?.description}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-gray-800">
                      ${plan?.price}
                    </div>
                    <div className="text-sm text-gray-500">
                      /
                      {BILLING_PERIOD_LABELS[plan?.billing_period] ??
                        plan?.billing_period}
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  {plan?.features?.map((feature, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 text-sm text-gray-600"
                    >
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                      {feature}
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Subtotal</span>
                  <span>${plan?.price}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Tax</span>
                  <span>$0.00</span>
                </div>
                <hr className="my-2" />
                <div className="flex justify-between font-semibold text-gray-800">
                  <span>Total</span>
                  <span>${plan?.price}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Payment Details
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Method
                </label>
                <CardElement />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="your@email.com"
                    className="w-full p-3 border border-gray-500 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black placeholder-gray-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cardholder Name
                  </label>
                  <input
                    type="text"
                    placeholder="John Doe"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black placeholder-gray-400"
                  />
                </div>
              </div>
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 rounded-lg p-3">
                <Lock className="w-4 h-4" />
                <span>Your payment information is encrypted and secure</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t">
          <div className="flex flex-col sm:flex-row gap-3 justify-between items-center">
            <p className="text-xs text-gray-500 order-2 sm:order-1">
              By completing this purchase you agree to our Terms of Service
            </p>
            <div className="flex gap-3 order-1 sm:order-2 w-full sm:w-auto">
              <button
                onClick={onClose}
                className="flex-1 sm:flex-none px-6 py-2 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handlePayment}
                disabled={loading}
                className="flex-1 sm:flex-none px-6 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-700 text-white hover:from-blue-700 hover:to-purple-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    Pay ${plan?.price}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
