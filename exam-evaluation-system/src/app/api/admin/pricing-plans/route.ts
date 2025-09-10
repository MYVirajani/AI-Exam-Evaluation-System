// src/app/api/admin/pricing-plans/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET all pricing plans
export async function GET() {
  try {
    const plans = await prisma.pricing_Plan.findMany({
      orderBy: { created_on: "desc" },
    });
    return NextResponse.json({ plans });
  } catch (err) {
    console.error("Error fetching pricing plans:", err);
    return NextResponse.json({ error: "Failed to fetch pricing plans" }, { status: 500 });
  }
}

// POST create a new pricing plan
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, duration, price, description, payment_method } = body;

    if (!name || !duration || !price || !description || !payment_method) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    const plan = await prisma.pricing_Plan.create({
      data: {
        name,
        duration: Number(duration),
        price: price,
        description,
        payment_method,
      },
    });

    return NextResponse.json({ plan }, { status: 201 });
  } catch (err) {
    console.error("Error creating pricing plan:", err);
    return NextResponse.json({ error: "Failed to create pricing plan" }, { status: 500 });
  }
}
