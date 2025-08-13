import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  try {
    const { assessmentId, studentId, password } = await request.json();
    console.log(
      "Received request with assessmentId:",
      assessmentId,
      "studentId:",
      studentId
    );

    if (!assessmentId || !password || !studentId) {
      return NextResponse.json(
        { message: "Assessment ID, student ID, and password are required" },
        { status: 400 }
      );
    }

    // Fetch assessment details including password and max_attempts
    const assessment = await prisma.assessment.findUnique({
      where: { assessment_id: assessmentId },
      select: {
        assessment_id: true,
        password: true,
        module_id: true,
        max_attempts: true,
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

    // Check max attempts if applicable
    if (assessment.max_attempts !== null) {
      const existingAttempts = await prisma.submission.count({
        where: {
          assessment_id: assessmentId,
          student_id: studentId,
        },
      });

      if (existingAttempts >= assessment.max_attempts) {
        return NextResponse.json(
          { message: "You have reached the maximum number of attempts." },
          { status: 403 }
        );
      }
    }

    // Password verification
    const isPasswordValid = await bcrypt.compare(password, assessment.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, message: "Incorrect password" },
        { status: 401 }
      );
    }

    // Create new submission
    const newSubmission = await prisma.submission.create({
      data: {
        submission_id:uuidv4(),
        assessment_id: assessmentId,
        student_id: studentId,
        submission_start_at: new Date(),
        type:'ONLINE',
        is_graded: false,
      },
    });

    const responsePayload = {
      success: true,
      message: "Password verified and submission started",
      assessmentId: assessment.assessment_id,
      moduleId: assessment.module_id,
      submissionId: newSubmission.submission_id,
    };

    // Log the response object
    console.log("Response:", responsePayload);

    return NextResponse.json(responsePayload);
  } catch (error) {
    console.error("Password verification error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
