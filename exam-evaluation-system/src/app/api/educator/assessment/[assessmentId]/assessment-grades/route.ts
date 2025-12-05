//exam-evaluation-system\src\app\api\educator\assessment\[assessmentId]\assessment-grades\route.ts
import { Router, Request, Response } from "express";
import { prisma } from "@/lib/prisma";

const router = Router();

/**
 * GET /assessment-grade?assessmentId=xxxx
 * Returns:
 *  - assessment details (title, type, deadline, module code, module name)
 *  - submissions list with student & user data
 *  - unique evaluation models used for grading
 */
router.get("/", async (req: Request, res: Response) => {
  const { assessmentId } = req.query;

  if (!assessmentId || typeof assessmentId !== "string") {
    return res.status(400).json({
      message: "assessmentId query parameter is required",
    });
  }

  try {
    // ------------------------------------------------
    // 1. Fetch Assessment + Module Data
    // ------------------------------------------------
    const assessment = await prisma.assessment.findUnique({
      where: { assessment_id: assessmentId },
      select: {
        assessment_id: true,
        title: true,
        type: true,
        deadline: true,
        module: {
          select: {
            module_code: true,
            module_name: true,
          },
        },
      },
    });

    if (!assessment) {
      return res.status(404).json({
        message: "Assessment not found",
      });
    }

    // ------------------------------------------------
    // 2. Fetch Submissions WITH Student + User
    // ------------------------------------------------
    const submissions = await prisma.submission.findMany({
      where: { assessment_id: assessmentId },
      select: {
        submission_id: true,
        student_id: true,
        assessment_id: true,
        type: true,
        submission_start_at: true,
        submission_end_at: true,
        file_url: true,
        media_extracted_file_url: true,
        ip_address: true,
        device_info: true,
        student_score: true,
        is_graded: true,
        is_handwritten: true,
        handwritten_file_url: true,

        // Student → User
        student: {
          select: {
            user_id: true,
            registration_number: true,
            education_institute: true,
            user: {
              select: {
                first_name: true,
                last_name: true,
                title: true,
                email: true,
                phone_number: true,
                profile_image_url: true,
              },
            },
          },
        },
      },
    });

    if (submissions.length === 0) {
      return res.status(404).json({
        message: "No submissions found for this assessment",
      });
    }

    const submissionIds = submissions.map((s) => s.submission_id);

    // ------------------------------------------------
    // 3. Fetch Evaluation Models via Assessment_Grading
    // ------------------------------------------------
    const assessmentGrades = await prisma.assessment_Grade.findMany({
      where: {
        submission_id: { in: submissionIds },
      },
      include: {
        evaluation_model: true,
      },
    });

    // Extract unique evaluation models
    const evaluationModelsMap = new Map();
    assessmentGrades.forEach((g) => {
      if (g.evaluation_model) {
        evaluationModelsMap.set(g.evaluation_model.id, g.evaluation_model);
      }
    });

    const evaluationModels = Array.from(evaluationModelsMap.values());

    // ------------------------------------------------
    // Final Response
    // ------------------------------------------------
    return res.json({
      assessment,
      submissions,
      evaluation_models: evaluationModels,
    });

  } catch (error) {
    console.error("Error fetching assessment grade data:", error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
});

export default router;
