// src/app/api/admin/educators/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const educators = await prisma.user.findMany({
      where: { role: "educator" },
      include:{
        educator: {
          select: {
            official_email: true,
            education_institute: true,
            _count: {
              select: { modules: true },
            },
          },
        },
      },
      orderBy: {
        created_on: "desc",
      },
    });

    const formatted = educators.map((e) => ({
     ...e,
      official_email: e.educator?.official_email ?? null,
      education_institute: e.educator?.education_institute ?? null,
      module_count: e.educator?._count.modules ?? 0,
    }));

    return NextResponse.json({ educators: formatted });
  } catch (err) {
    console.error("Error fetching educators:", err);
    return NextResponse.json(
      { error: "Failed to fetch educators" },
      { status: 500 }
    );
  }
}
