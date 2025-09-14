"use client";

import { useEffect, useState } from "react";

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

// ✅ Billing period labels
const BILLING_PERIOD_LABELS: Record<string, string> = {
  day: "Daily",
  week: "Weekly",
  month: "Monthly",
  year: "Yearly",
  "3_months": "Every 3 months",
  "6_months": "Every 6 months",
  custom: "Custom",
};

export default function PricingPlansPage() {
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const res = await fetch("/api/pricing-plans");
        const data = await res.json();
        setPlans(data.plans || []);
      } catch (err) {
        console.error("Failed to load pricing plans:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, []);

  if (loading) {
    return <div className="text-center py-10">Loading pricing plans...</div>;
  }

  if (!plans.length) {
    return (
      <div className="text-center py-10 text-gray-500">
        No pricing plans available
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-center mb-8 text-gray-900">
        Our Pricing Plans
      </h1>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {plans.map((plan) => (
          <div
            key={plan.pricing_plan_id}
            className="border rounded-2xl shadow-md p-6 flex flex-col hover:shadow-lg transition"
          >
            <h2 className="text-xl font-semibold mb-2 text-gray-800">
              {plan.name}
            </h2>
            <p className="text-3xl font-bold text-blue-600">
              ${plan.price}
              <span className="text-base font-normal text-gray-500 ml-1">
                /
                {BILLING_PERIOD_LABELS[plan.billing_period] ??
                  plan.billing_period}
              </span>
            </p>
            {plan.description && (
              <p className="mt-2 text-gray-600 text-sm">{plan.description}</p>
            )}

            {plan.features?.length > 0 && (
              <ul className="mt-4 space-y-2 text-sm text-gray-700">
                {plan.features.map((f, i) => (
                  <li key={i} className="flex items-center">
                    <span className="mr-2 text-green-500">✔</span>
                    {f}
                  </li>
                ))}
              </ul>
            )}

            <div className="mt-auto pt-6">
              <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition">
                Choose Plan
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
