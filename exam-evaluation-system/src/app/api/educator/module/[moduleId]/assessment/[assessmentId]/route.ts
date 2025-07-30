import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import * as path from 'path';
import * as fs from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';

export async function GET(
  req: NextRequest,
  {
    params,
  }: {
    params: {
      moduleId: string;
      assessmentId: string;
    };
  }
) {
  const { moduleId, assessmentId } = params;
  const educatorId = req.nextUrl.searchParams.get("educatorId");

  if (!educatorId) {
    return NextResponse.json(
      { success: false, message: "Missing educatorId" },
      { status: 400 }
    );
  }

  try {
    // Fetch module details
    const moduleData = await prisma.module.findUnique({
      where: {
        module_id: moduleId,
      },
      select: {
        module_code: true,
        module_name: true,
      },
    });

    if (!module) {
      return NextResponse.json(
        { success: false, message: "Module not found" },
        { status: 404 }
      );
    }

    // Count enrollments
    const enrollmentCount = await prisma.enrollment.count({
      where: {
        module_id: moduleId,
      },
    });

    // Fetch assessment by ID, module, and educator
    const assessment = await prisma.assessment.findFirst({
      where: {
        assessment_id: assessmentId,
        module_id: moduleId,
        created_by: educatorId,
      },
      include: {
        model_answer_paper: {
          select: {
            file_url: true,
          },
        },
        submissions: {
          include: {
            student: {
              select: {
                registration_number: true,
                user_id: true,
              },
            },
            assessment_grade: {
              select: {
                marks_awarded: true,
                total_marks: true,
              },
            },
            question_grades: true,
          },
        },
      },
    });

    if (!assessment) {
      return NextResponse.json(
        { success: false, message: "Assessment not found or access denied" },
        { status: 404 }
      );
    }

    // Build response
    const responseData = {
      moduleData,
      enrollmentCount,
      assessments: [
        {
          assessment_id: assessment.assessment_id,
          type: assessment.type,
          title: assessment.title,
          description: assessment.description,
          deadline: assessment.deadline,
          model_answer_paper: assessment.model_answer_paper || null,
          submissions: assessment.submissions.map((sub) => ({
            submission_id: sub.submission_id,
            student: {
              student_id: sub.student.user_id,
              registration_number: sub.student.registration_number,
            },
            file_url: sub.file_url,
            submission_time: sub.submission_time,
            assessment_grade: sub.assessment_grade || null,
            question_grades: sub.question_grades,
          })),
        },
      ],
    };
    console.log("Assessment response data:", JSON.stringify(responseData, null, 2));

    return NextResponse.json(responseData);
  } catch (err) {
    console.error("[GET educator/module/[moduleId]/assessment/[assessmentId]]", err);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: { moduleId: string; assessmentId: string } }
) {
  try {
    // const session = await getServerSession(authOptions);
    // if (!session || !session.user) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    const {  assessmentId } = params;
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Only PDF and DOCX files are allowed' },
        { status: 400 }
      );
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size must be less than 5MB' },
        { status: 400 }
      );
    }

    // Create upload directory if it doesn't exist
    const projectRoot = process.cwd();
    const parentDir = path.dirname(projectRoot);
    const baseDir = path.join(parentDir, 'data');
    const uploadDir = path.join(baseDir, 'Model_Answers');

    try {
      await fs.access(uploadDir);
    } catch {
      await fs.mkdir(uploadDir, { recursive: true });
    }

    // Generate unique filename
    const fileExtension = path.extname(file.name);
    const fileName = `${uuidv4()}${fileExtension}`;
    const filePath = path.join(uploadDir, fileName);
    const relativeFilePath = path.join('data', 'Model_Answers', fileName);

    // Convert file to buffer and save to disk
    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(filePath, buffer);

    // Save to database
    const existingModelAnswer = await prisma.model_Answer_Paper.findUnique({
      where: { assessment_id: assessmentId },
    });

    let modelAnswer;
    if (existingModelAnswer) {
      // Delete old file if exists
      try {
        const oldFilePath = path.join(baseDir, existingModelAnswer.file_url.replace('data/', ''));
        await fs.unlink(oldFilePath);
      } catch (error) {
        console.error('Error deleting old file:', error);
      }

      // Update existing record
      modelAnswer = await prisma.model_Answer_Paper.update({
        where: { model_answer_paper_id: existingModelAnswer.model_answer_paper_id },
        data: {
          file_url: relativeFilePath,
          created_on: new Date(),
        },
      });
    } else {
      // Create new record
      modelAnswer = await prisma.model_Answer_Paper.create({
        data: {
          model_answer_paper_id: uuidv4(),
          assessment_id: assessmentId,
          file_url: relativeFilePath,
          created_on: new Date(),
        },
      });
    }

    return NextResponse.json({
      success: true,
      file_url: relativeFilePath,
      model_answer_paper_id: modelAnswer.model_answer_paper_id,
    });
  } catch (error) {
    console.error('Error uploading model answer:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
