// src/app/api/sidebar/educator/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "Invalid educator id" }, { status: 400 });
    }

    // Include assessments with their type
    const modules = await prisma.module.findMany({
      where: { created_by: userId },
      include: { assessments: true }, 
    });

    console.log("modules: ", modules);

    return NextResponse.json({ modules });
  } catch (err) {
    console.error("Error fetching educator sidebar data:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
