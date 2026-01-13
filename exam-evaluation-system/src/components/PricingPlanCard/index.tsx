// components/PricingPlanCard.tsx
"use client";

import { useState } from "react";
import LoadingAnimation from "@/components/LoadingAnimation";

interface EvaluationModel {
  id: string;
  model_name: string;
  description?: string;
}

interface PricingPlan {
  pricing_plan_id: string;
  name: string;
  billing_period: string;
  price: string;
  description?: string;
  features: string[];
  stripe_price_id?: string;
  stripe_product_id?: string;
  created_on: string;
  model_id: string;
  evaluation_model: EvaluationModel;
  isSubscribed: boolean;
}

interface PricingPlanCardProps {
  plan: PricingPlan;
  billingPeriodLabels: Record<string, string>;
  educatorId: string | null;
  onSubscribe: (plan: PricingPlan) => void;
}

export default function PricingPlanCard({
  plan,
  billingPeriodLabels,
  educatorId,
  onSubscribe,
}: PricingPlanCardProps) {
  const [processing, setProcessing] = useState(false);

  const handleClick = async () => {
    // Don't allow clicking if already subscribed
    if (plan.isSubscribed) {
      return;
    }

    if (!educatorId) {
      // This will trigger the login popup in the parent component
      onSubscribe(plan);
      return;
    }

    setProcessing(true);
    try {
      await onSubscribe(plan);
    } finally {
      setProcessing(false);
    }
  };

  // Format price for display
  const formattedPrice = parseFloat(plan.price).toFixed(2);

  return (
    <div className={`border rounded-2xl shadow-md p-6 flex flex-col hover:shadow-lg transition relative h-full w-full ${
      plan.isSubscribed ? 'border-green-500 border-2' : ''
    }`}>
      {processing && (
        <div className="absolute inset-0 bg-white bg-opacity-80 flex items-center justify-center rounded-2xl z-10">
          <LoadingAnimation 
            size="md" 
            variant="spinner" 
            text="Redirecting..." 
            color="blue" 
          />
        </div>
      )}

      {/* Subscribed Badge */}
      {plan.isSubscribed && (
        <div className="absolute -top-3 -right-3 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
          Current Plan
        </div>
      )}
      
      <h2 className="text-xl font-semibold mb-2 text-gray-800">
        {plan.name}
      </h2>
      <p className="text-3xl font-bold text-blue-600">
        ${formattedPrice}
        <span className="text-base font-normal text-gray-500 ml-1">
          /{billingPeriodLabels[plan.billing_period] ?? plan.billing_period}
        </span>
      </p>
      {plan.description && (
        <p className="mt-2 text-gray-600 text-sm">{plan.description}</p>
      )}

      {plan.features?.length > 0 && (
        <ul className="mt-4 space-y-2 text-sm text-gray-700 flex-grow">
          {plan.features.map((f, i) => (
            <li key={i} className="flex items-center">
              <span className="mr-2 text-green-500">✔</span>
              {f}
            </li>
          ))}
        </ul>
      )}

      <div className="mt-auto pt-6">
        <button
          onClick={handleClick}
          disabled={processing || plan.isSubscribed}
          className={`w-full py-2 px-4 rounded-lg transition ${
            plan.isSubscribed
              ? 'bg-green-500 text-white cursor-not-allowed opacity-75'
              : 'bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50'
          }`}
        >
          {processing
            ? "Redirecting..."
            : plan.isSubscribed
            ? "✓ Subscribed"
            : "Subscribe"}
        </button>
      </div>
    </div>
  );
}