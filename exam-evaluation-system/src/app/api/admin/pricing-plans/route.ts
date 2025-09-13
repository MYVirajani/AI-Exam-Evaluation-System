import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // adjust import for your Prisma client

// GET /api/admin/pricing-plans → Fetch pricing plans from DB
export async function GET() {
  try {
    const plans = await prisma.pricing_Plan.findMany({
      orderBy: { created_on: "desc" },
    });
    console.log('plans: ', plans);
    return NextResponse.json({ plans });
  } catch (error: any) {
    console.error("Error fetching pricing plans:", error);
    return NextResponse.json(
      { error: "Failed to fetch pricing plans" },
      { status: 500 }
    );
  }
}
