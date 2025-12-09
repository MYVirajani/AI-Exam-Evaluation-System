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

    try {
      const res = await fetch("/api/stripe/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pricing_plan_id: plan.pricing_plan_id,
          educator_id: educatorId, // ✅ use ID from session
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

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {plans.map((plan) => (
          <PricingPlanCard
            key={plan.pricing_plan_id}
            plan={plan}
            billingPeriodLabels={BILLING_PERIOD_LABELS}
            educatorId={educatorId}
            onSubscribe={handleSubscribe}
          />
        ))}
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