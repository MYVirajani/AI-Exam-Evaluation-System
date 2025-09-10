import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const plans = await prisma.pricing_Plan.findMany({
      orderBy: { created_on: "desc" },
    });

    return NextResponse.json({ plans });
  } catch (err) {
    console.error("Error fetching pricing plans:", err);
    return NextResponse.json(
      { error: "Failed to fetch pricing plans" },
      { status: 500 }
    );
  }
}
