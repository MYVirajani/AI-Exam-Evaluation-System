import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // 🔐 Authenticate
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = verifyToken(token) as { id: string } | null;
    if (!decoded) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 👤 Validate educator
    const user = await prisma.user.findUnique({
      where: { user_id: decoded.id },
      select: { user_id: true, role: true },
    });

    if (!user || user.role !== "educator") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // 📌 Fetch ALL ACTIVE subscriptions
    const activeSubscriptions = await prisma.subscription.findMany({
      where: {
        educator_id: user.user_id,
        status: "ACTIVE",
      },
      select: {
        pricing_plan_id: true,
      },
    });

    // 🧠 Convert subscribed plan IDs into a Set (fast lookup)
    const subscribedPlanIds = new Set(
      activeSubscriptions.map((sub) => sub.pricing_plan_id)
    );

    // 📦 Fetch ALL pricing plan data
    const plans = await prisma.pricing_Plan.findMany({
      orderBy: { created_on: "desc" },
      include: {
        evaluation_model: true,
      },
    });

    // ✅ Attach subscription status correctly
    const plansWithStatus = plans.map((plan) => ({
      ...plan,
      isSubscribed: subscribedPlanIds.has(plan.pricing_plan_id),
    }));

    // 🪵 LOG ENDPOINT OUTPUT (Terminal)
    console.log("📤 [GET /pricing-plans] Response:");
    console.log({
      educatorId: user.user_id,
      activeSubscriptionsCount: activeSubscriptions.length,
      subscribedPlanIds: Array.from(subscribedPlanIds),
      totalPlans: plansWithStatus.length,
      plans: plansWithStatus,
    });

    return NextResponse.json({ plans: plansWithStatus });
  } catch (error) {
    console.error("❌ Error fetching pricing plans:", error);
    return NextResponse.json(
      { error: "Failed to fetch pricing plans" },
      { status: 500 }
    );
  }
}
