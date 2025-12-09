import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; 
export async function GET() {
  try {
    const plans = await prisma.pricing_Plan.findMany({
      orderBy: { created_on: "desc" },
      include: {
        evaluation_model: { 
          select: {
            id: true,
            model_name: true,
            description: true,
            created_on: true,
          },
        },
      },
    });

    console.log("plans: ", plans);
    return NextResponse.json({ plans });
  } catch (error: any) {
    console.error("Error fetching pricing plans:", error);
    return NextResponse.json(
      { error: "Failed to fetch pricing plans" },
      { status: 500 }
    );
  }
}
