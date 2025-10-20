import { NextResponse } from "next/server";
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const modules = await prisma.module.findMany({
      select: {
        module_id: true,
        module_code: true,
        module_name: true,
      },
      orderBy: {
        module_code: "asc",
      },
    });

    return NextResponse.json({ modules }, { status: 200 });
  } catch (error) {
    console.error("Error loading modules:", error);
    return NextResponse.json(
      { error: "Failed to fetch modules" },
      { status: 500 }
    );
  }
}
