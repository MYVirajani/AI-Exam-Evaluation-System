import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  try {
    const { assessmentId, studentId, moduleId } = await request.json();
    console.log(
      "Received request with assessmentId:",
      assessmentId,
      "studentId:",
      studentId,
       "moduleId:",
      moduleId
    );

    if (!assessmentId ||  !studentId || !moduleId) {
      return NextResponse.json(
        { message: "Assessment ID, Module Id and student ID are required" },
        { status: 400 }
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
      assessmentId: assessmentId,
      moduleId: moduleId,
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
