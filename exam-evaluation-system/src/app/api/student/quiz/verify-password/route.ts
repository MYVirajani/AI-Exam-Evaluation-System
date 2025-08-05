// src/app/api/student/quiz/verify-password/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
  try {
    const { assessmentId, password } = await request.json();

    if (!assessmentId || !password) {
      return NextResponse.json(
        { message: "Assessment ID and password are required" },
        { status: 400 }
      );
    }

    // Fetch the assessment with password
    const assessment = await prisma.assessment.findUnique({
      where: { assessment_id: assessmentId },
      select: {
        assessment_id: true,
        title: true,
        password: true,
        type: true,
      },
    });

    if (!assessment) {
      return NextResponse.json(
        { message: "Assessment not found" },
        { status: 404 }
      );
    }

    if (!assessment.password) {
      return NextResponse.json(
        { message: "This assessment does not require a password" },
        { status: 400 }
      );
    }

    // Verify password using bcrypt
    const isPasswordValid = await bcrypt.compare(password, assessment.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, message: "Incorrect password" },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Password verified successfully",
    });

  } catch (error) {
    console.error("Password verification error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}