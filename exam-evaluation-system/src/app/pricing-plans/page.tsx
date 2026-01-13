"use client";

import { useEffect, useState } from "react";
import SignInPopup from "@/components/SignInPopup";
import PricingPlanCard from "@/components/PricingPlanCard";
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

const BILLING_PERIOD_LABELS: Record<string, string> = {
  DAILY: "Daily",
  WEEKLY: "Weekly",
  MONTHLY: "Monthly",
  YEARLY: "Yearly",
  "3_MONTHS": "Every 3 months",
  "6_MONTHS": "Every 6 months",
  CUSTOM: "Custom",
};

export default function PricingPlansPage() {
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [educatorId, setEducatorId] = useState<string | null>(null);
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  // ✅ Fetch current session to get educatorId
  useEffect(() => {
    const fetchSession = async () => {
      try {
        const res = await fetch("/api/auth/session");
        if (!res.ok) return setEducatorId(null);
        const session = await res.json();
        console.log("session:", session);
        setEducatorId(session?.user?.user_id ?? null);
      } catch {
        setEducatorId(null);
      }
    };

    fetchSession();
  }, []);

  // ✅ Fetch pricing plans
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

  // ✅ Handle Subscribe button
  const handleSubscribe = async (plan: PricingPlan) => {
    // If user is not logged in, show login popup
    if (!educatorId) {
      setIsLoginOpen(true);
      return;
    }

    // If already subscribed, do nothing
    if (plan.isSubscribed) {
      return;
    }

    try {
      const res = await fetch("/api/stripe/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pricing_plan_id: plan.pricing_plan_id,
          educator_id: educatorId,
        }),
      });

      const data = await res.json();

      if (data?.url) {
        // ✅ Redirect to Stripe Checkout
        window.location.href = data.url;
      } else {
        console.error("No checkout session URL returned", data);
      }
    } catch (error) {
      console.error("Failed to create checkout session:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingAnimation 
          size="lg" 
          variant="dots" 
          text="Loading pricing plans..." 
          color="blue" 
        />
      </div>
    );
  }

  if (!plans.length) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center py-10 text-gray-500">
          No pricing plans available
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-center mb-8 text-gray-900">
        Our Pricing Plans
      </h1>

      <div className="overflow-x-auto scrollbar-hide -mx-4 px-4">
        <div className="flex gap-6 pb-4 min-w-max">
          {plans.map((plan, index) => (
            <div 
              key={plan.pricing_plan_id} 
              className="w-80 flex-shrink-0 animate-scale-in transition-all duration-300 ease-out hover:scale-105 hover:-translate-y-2 hover:shadow-2xl cursor-pointer flex"
              style={{ 
                animationDelay: `${index * 100}ms`,
                animationFillMode: 'backwards'
              }}
            >
              <PricingPlanCard
                plan={plan}
                billingPeriodLabels={BILLING_PERIOD_LABELS}
                educatorId={educatorId}
                onSubscribe={handleSubscribe}
              />
            </div>
          ))}
        </div>
      </div>

      {/* ✅ Login popup */}
      <SignInPopup
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onSwitchToSignUp={() => {
          setIsLoginOpen(false);
          // Optionally open signup popup
        }}
      />
    </div>
  );
}