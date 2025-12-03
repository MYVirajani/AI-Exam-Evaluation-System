import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: { educatorId: string } }
) {
  try {
    const educatorId = params.educatorId;

    if (!educatorId) {
      return NextResponse.json(
        { error: "Educator ID is required" },
        { status: 400 }
      );
    }

    // Fetch all active subscriptions of this educator
    const activeSubscriptions = await prisma.subscription.findMany({
      where: {
        educator_id: educatorId,
        status: "ACTIVE",
      },
      include: {
        pricing_plan: {
          include: {
            evaluation_model: true,
          },
        },
      },
    });

    if (activeSubscriptions.length === 0) {
      return NextResponse.json(
        { error: "No active subscriptions found for this educator" },
        { status: 404 }
      );
    }

    // Extract all evaluation models
    const evaluationModels = activeSubscriptions
      .map((sub) => sub.pricing_plan?.evaluation_model)
      .filter(Boolean);

    if (evaluationModels.length === 0) {
      return NextResponse.json(
        { error: "No evaluation models found for these subscriptions" },
        { status: 404 }
      );
    }

    // 🔥 Console logs for debugging
    console.log("🔥 Active Subscriptions:", activeSubscriptions);
    console.log("🔥 Extracted Evaluation Models:", evaluationModels);

    evaluationModels.forEach((model, index) => {
      console.log(`➡️ Evaluation Model #${index + 1}:`, model);
    });

    return NextResponse.json(
      {
        evaluation_models: evaluationModels,
        subscriptions: activeSubscriptions.map((sub) => ({
          subscription_id: sub.subscription_id,
          status: sub.status,
          start_date: sub.start_date,
          pricing_plan_id: sub.pricing_plan_id,
        })),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching evaluation models:", error);
    return NextResponse.json(
      { error: "Failed to fetch evaluation models" },
      { status: 500 }
    );
  }
}
