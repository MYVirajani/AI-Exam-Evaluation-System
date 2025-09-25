-- CreateEnum
CREATE TYPE "Role" AS ENUM ('admin', 'educator', 'student');

-- CreateEnum
CREATE TYPE "AvailabilityStatus" AS ENUM ('draft', 'active', 'expired', 'archived');

-- CreateEnum
CREATE TYPE "assessmentType" AS ENUM ('endExam', 'midExam', 'assignment', 'quiz');

-- CreateEnum
CREATE TYPE "QuestionType" AS ENUM ('MCQ', 'SHORT', 'ESSAY');

-- CreateEnum
CREATE TYPE "SubmissionType" AS ENUM ('DOCUMENT', 'ONLINE');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('ACTIVE', 'CANCELED', 'PAST_DUE', 'INCOMPLETE', 'TRIALING', 'FAILED');

-- CreateTable
CREATE TABLE "User" (
    "user_id" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "address" TEXT,
    "phone_number" TEXT NOT NULL,
    "country" TEXT,
    "city" TEXT,
    "profile_image_url" TEXT,
    "created_on" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "Educator" (
    "user_id" TEXT NOT NULL,
    "official_email" TEXT NOT NULL,
    "education_institute" TEXT NOT NULL,

    CONSTRAINT "Educator_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "Student" (
    "user_id" TEXT NOT NULL,
    "registration_number" TEXT NOT NULL,
    "education_institute" TEXT NOT NULL,

    CONSTRAINT "Student_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "Module" (
    "module_id" TEXT NOT NULL,
    "module_code" TEXT NOT NULL,
    "module_name" TEXT NOT NULL,
    "semester" TEXT NOT NULL,
    "education_institute" TEXT NOT NULL,
    "max_enrollments" INTEGER NOT NULL,
    "learning_outcomes" TEXT,
    "enrollment_key" TEXT,
    "module_image_url" TEXT,
    "created_by" TEXT NOT NULL,
    "created_on" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "AvailabilityStatus" NOT NULL DEFAULT 'active',

    CONSTRAINT "Module_pkey" PRIMARY KEY ("module_id")
);

-- CreateTable
CREATE TABLE "Enrollment" (
    "enrollment_id" TEXT NOT NULL,
    "registration_number" TEXT NOT NULL,
    "module_id" TEXT NOT NULL,
    "enrolled_on" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Enrollment_pkey" PRIMARY KEY ("enrollment_id")
);

-- CreateTable
CREATE TABLE "Lesson" (
    "lesson_id" TEXT NOT NULL,
    "module_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "created_on" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Lesson_pkey" PRIMARY KEY ("lesson_id")
);

-- CreateTable
CREATE TABLE "LectureMaterial" (
    "material_id" TEXT NOT NULL,
    "lesson_id" TEXT NOT NULL,
    "file_name" TEXT,
    "file_url" TEXT NOT NULL,
    "uploaded_on" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "description" TEXT,

    CONSTRAINT "LectureMaterial_pkey" PRIMARY KEY ("material_id")
);

-- CreateTable
CREATE TABLE "Assessment" (
    "assessment_id" TEXT NOT NULL,
    "module_id" TEXT NOT NULL,
    "created_by" TEXT NOT NULL,
    "created_on" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "type" "assessmentType" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "instructions" TEXT[],
    "duration" INTEGER,
    "deadline" TIMESTAMPTZ(6) NOT NULL,
    "open_at" TIMESTAMPTZ(6),
    "close_at" TIMESTAMPTZ(6),
    "total_marks" DECIMAL(5,2),
    "max_marks" DECIMAL(5,2),
    "password" TEXT,
    "shuffle_questions" BOOLEAN NOT NULL DEFAULT false,
    "max_attempts" INTEGER,
    "auto_grade" BOOLEAN NOT NULL DEFAULT false,
    "back_navigation" BOOLEAN NOT NULL DEFAULT true,
    "case_sensitive_evaluation" BOOLEAN NOT NULL DEFAULT false,
    "status" "AvailabilityStatus" NOT NULL DEFAULT 'active',

    CONSTRAINT "Assessment_pkey" PRIMARY KEY ("assessment_id")
);

-- CreateTable
CREATE TABLE "Question_Paper" (
    "question_paper_id" TEXT NOT NULL,
    "assessment_id" TEXT NOT NULL,
    "file_url" TEXT NOT NULL,
    "created_on" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Question_Paper_pkey" PRIMARY KEY ("question_paper_id")
);

-- CreateTable
CREATE TABLE "Model_Answer_Paper" (
    "model_answer_paper_id" TEXT NOT NULL,
    "assessment_id" TEXT NOT NULL,
    "file_url" TEXT NOT NULL,
    "created_on" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Model_Answer_Paper_pkey" PRIMARY KEY ("model_answer_paper_id")
);

-- CreateTable
CREATE TABLE "Marking_Scheme" (
    "marking_scheme_id" TEXT NOT NULL,
    "assessment_id" TEXT NOT NULL,
    "file_url" TEXT NOT NULL,
    "created_on" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Marking_Scheme_pkey" PRIMARY KEY ("marking_scheme_id")
);

-- CreateTable
CREATE TABLE "Question" (
    "question_id" TEXT NOT NULL,
    "assessment_id" TEXT NOT NULL,
    "type" "QuestionType" NOT NULL,
    "created_on" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "question_number" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "model_answer" TEXT NOT NULL,
    "mcq_answer_options" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "marks_allowed" DECIMAL(5,2) NOT NULL,

    CONSTRAINT "Question_pkey" PRIMARY KEY ("question_id")
);

-- CreateTable
CREATE TABLE "Submission" (
    "submission_id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "assessment_id" TEXT NOT NULL,
    "type" "SubmissionType" NOT NULL,
    "submission_start_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "submission_end_at" TIMESTAMPTZ(6),
    "file_url" TEXT,
    "ip_address" TEXT,
    "device_info" TEXT,
    "is_graded" BOOLEAN NOT NULL DEFAULT false,
    "is_handwritten" BOOLEAN NOT NULL DEFAULT false,
    "handwritten_file_url" TEXT,

    CONSTRAINT "Submission_pkey" PRIMARY KEY ("submission_id")
);

-- CreateTable
CREATE TABLE "Student_Answer" (
    "submission_id" TEXT NOT NULL,
    "question_id" TEXT NOT NULL,
    "student_answer" TEXT NOT NULL,
    "submitted_on" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_correct" BOOLEAN,
    "marks_awarded" DECIMAL(5,2),
    "graded_at" TIMESTAMPTZ(6),
    "feedback" TEXT,

    CONSTRAINT "Student_Answer_pkey" PRIMARY KEY ("submission_id","question_id")
);

-- CreateTable
CREATE TABLE "Question_Grade" (
    "question_id" TEXT NOT NULL,
    "submission_id" TEXT NOT NULL,
    "marks_awarded" DECIMAL(5,2) NOT NULL,
    "max_marks" DECIMAL(5,2) NOT NULL,
    "graded_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "grading_duration" DECIMAL(6,2) NOT NULL,
    "auto_graded" BOOLEAN NOT NULL,
    "feedback" TEXT,
    "educator_id" TEXT,
    "model_id" TEXT,

    CONSTRAINT "Question_Grade_pkey" PRIMARY KEY ("submission_id","question_id")
);

-- CreateTable
CREATE TABLE "Assessment_Grade" (
    "grade_id" TEXT NOT NULL,
    "submission_id" TEXT NOT NULL,
    "max_marks" DECIMAL(5,2) NOT NULL,
    "marks_awarded" DECIMAL(5,2) NOT NULL,
    "feedback" TEXT NOT NULL,
    "graded_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "auto_graded" BOOLEAN NOT NULL,
    "educator_id" TEXT,
    "model_id" TEXT,

    CONSTRAINT "Assessment_Grade_pkey" PRIMARY KEY ("grade_id")
);

-- CreateTable
CREATE TABLE "Evaluation_Model" (
    "model_id" TEXT NOT NULL,
    "model_name" TEXT NOT NULL,
    "description" TEXT,
    "created_on" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Evaluation_Model_pkey" PRIMARY KEY ("model_id")
);

-- CreateTable
CREATE TABLE "Pricing_Plan" (
    "pricing_plan_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "billing_period" TEXT NOT NULL,
    "price" DECIMAL(9,2) NOT NULL,
    "description" TEXT,
    "features" TEXT[],
    "stripe_price_id" TEXT NOT NULL,
    "stripe_product_id" TEXT NOT NULL,
    "created_on" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "model_id" TEXT NOT NULL,

    CONSTRAINT "Pricing_Plan_pkey" PRIMARY KEY ("pricing_plan_id")
);

-- CreateTable
CREATE TABLE "Subscription" (
    "subscription_id" TEXT NOT NULL,
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'INCOMPLETE',
    "start_date" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "end_date" TIMESTAMP(3),
    "stripe_customer_id" TEXT,
    "stripe_subscription_id" TEXT,
    "pricing_plan_id" TEXT NOT NULL,
    "educator_id" TEXT NOT NULL,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("subscription_id")
);

-- CreateTable
CREATE TABLE "student_answers_openai" (
    "student_index" TEXT NOT NULL,
    "module_code" TEXT NOT NULL,
    "exam_year" INTEGER NOT NULL,
    "exam_month" TEXT NOT NULL,
    "answers" JSONB NOT NULL,
    "assessment_id" TEXT NOT NULL,
    "submission_id" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "student_answers_openai_pkey" PRIMARY KEY ("assessment_id","student_index","module_code","exam_year","exam_month")
);

-- CreateTable
CREATE TABLE "student_paper_results_openai" (
    "id" SERIAL NOT NULL,
    "student_index" TEXT NOT NULL,
    "module_code" TEXT NOT NULL,
    "exam_year" INTEGER NOT NULL,
    "exam_month" TEXT NOT NULL,
    "total_marks" DOUBLE PRECISION NOT NULL,
    "total_possible" DOUBLE PRECISION NOT NULL,
    "graded_at" TIMESTAMPTZ NOT NULL,
    "assessment_id" TEXT NOT NULL,

    CONSTRAINT "student_paper_results_openai_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "graded_student_answers_openai" (
    "id" SERIAL NOT NULL,
    "student_index" TEXT NOT NULL,
    "module_code" TEXT NOT NULL,
    "exam_year" INTEGER NOT NULL,
    "exam_month" TEXT NOT NULL,
    "full_question_id" TEXT NOT NULL,
    "mark" DOUBLE PRECISION NOT NULL,
    "max_marks" DOUBLE PRECISION NOT NULL,
    "reason" TEXT NOT NULL,
    "graded_at" TIMESTAMPTZ NOT NULL,
    "is_null_answer" BOOLEAN NOT NULL,
    "assessment_id" TEXT NOT NULL,
    "submission_id" TEXT,

    CONSTRAINT "graded_student_answers_openai_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "student_answers_gemini" (
    "student_index" TEXT NOT NULL,
    "module_code" TEXT NOT NULL,
    "exam_year" INTEGER NOT NULL,
    "exam_month" TEXT NOT NULL,
    "answers" JSONB NOT NULL,
    "assessment_id" TEXT NOT NULL,
    "submission_id" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "student_answers_gemini_pkey" PRIMARY KEY ("assessment_id","student_index","module_code","exam_year","exam_month")
);

-- CreateTable
CREATE TABLE "student_paper_results_gemini" (
    "id" SERIAL NOT NULL,
    "student_index" TEXT NOT NULL,
    "module_code" TEXT NOT NULL,
    "exam_year" INTEGER NOT NULL,
    "exam_month" TEXT NOT NULL,
    "total_marks" DOUBLE PRECISION NOT NULL,
    "total_possible" DOUBLE PRECISION NOT NULL,
    "graded_at" TIMESTAMPTZ NOT NULL,
    "assessment_id" TEXT NOT NULL,

    CONSTRAINT "student_paper_results_gemini_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "graded_student_answers_gemini" (
    "id" SERIAL NOT NULL,
    "student_index" TEXT NOT NULL,
    "module_code" TEXT NOT NULL,
    "exam_year" INTEGER NOT NULL,
    "exam_month" TEXT NOT NULL,
    "full_question_id" TEXT NOT NULL,
    "mark" DOUBLE PRECISION NOT NULL,
    "max_marks" DOUBLE PRECISION NOT NULL,
    "reason" TEXT NOT NULL,
    "graded_at" TIMESTAMPTZ NOT NULL,
    "is_null_answer" BOOLEAN NOT NULL,
    "assessment_id" TEXT NOT NULL,
    "submission_id" TEXT,

    CONSTRAINT "graded_student_answers_gemini_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Educator_official_email_key" ON "Educator"("official_email");

-- CreateIndex
CREATE UNIQUE INDEX "Student_registration_number_key" ON "Student"("registration_number");

-- CreateIndex
CREATE UNIQUE INDEX "Enrollment_registration_number_module_id_key" ON "Enrollment"("registration_number", "module_id");

-- CreateIndex
CREATE UNIQUE INDEX "Question_Paper_assessment_id_key" ON "Question_Paper"("assessment_id");

-- CreateIndex
CREATE UNIQUE INDEX "Model_Answer_Paper_assessment_id_key" ON "Model_Answer_Paper"("assessment_id");

-- CreateIndex
CREATE UNIQUE INDEX "Marking_Scheme_assessment_id_key" ON "Marking_Scheme"("assessment_id");

-- CreateIndex
CREATE INDEX "Question_assessment_id_idx" ON "Question"("assessment_id");

-- CreateIndex
CREATE INDEX "Submission_assessment_id_idx" ON "Submission"("assessment_id");

-- CreateIndex
CREATE INDEX "Submission_student_id_idx" ON "Submission"("student_id");

-- CreateIndex
CREATE INDEX "Student_Answer_submission_id_idx" ON "Student_Answer"("submission_id");

-- CreateIndex
CREATE INDEX "Student_Answer_question_id_idx" ON "Student_Answer"("question_id");

-- CreateIndex
CREATE INDEX "Question_Grade_educator_id_idx" ON "Question_Grade"("educator_id");

-- CreateIndex
CREATE INDEX "Question_Grade_model_id_idx" ON "Question_Grade"("model_id");

-- CreateIndex
CREATE UNIQUE INDEX "Assessment_Grade_submission_id_key" ON "Assessment_Grade"("submission_id");

-- CreateIndex
CREATE UNIQUE INDEX "Evaluation_Model_model_name_key" ON "Evaluation_Model"("model_name");

-- CreateIndex
CREATE UNIQUE INDEX "Pricing_Plan_stripe_price_id_key" ON "Pricing_Plan"("stripe_price_id");

-- CreateIndex
CREATE UNIQUE INDEX "student_paper_results_openai_student_index_module_code_exam_key" ON "student_paper_results_openai"("student_index", "module_code", "exam_year", "exam_month", "assessment_id");

-- CreateIndex
CREATE UNIQUE INDEX "graded_student_answers_openai_student_index_module_code_exa_key" ON "graded_student_answers_openai"("student_index", "module_code", "exam_year", "exam_month", "full_question_id", "assessment_id");

-- CreateIndex
CREATE UNIQUE INDEX "student_paper_results_gemini_student_index_module_code_exam_key" ON "student_paper_results_gemini"("student_index", "module_code", "exam_year", "exam_month", "assessment_id");

-- CreateIndex
CREATE UNIQUE INDEX "graded_student_answers_gemini_student_index_module_code_exa_key" ON "graded_student_answers_gemini"("student_index", "module_code", "exam_year", "exam_month", "full_question_id", "assessment_id");

-- AddForeignKey
ALTER TABLE "Educator" ADD CONSTRAINT "Educator_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Module" ADD CONSTRAINT "Module_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "Educator"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Enrollment" ADD CONSTRAINT "Enrollment_registration_number_fkey" FOREIGN KEY ("registration_number") REFERENCES "Student"("registration_number") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Enrollment" ADD CONSTRAINT "Enrollment_module_id_fkey" FOREIGN KEY ("module_id") REFERENCES "Module"("module_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lesson" ADD CONSTRAINT "Lesson_module_id_fkey" FOREIGN KEY ("module_id") REFERENCES "Module"("module_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LectureMaterial" ADD CONSTRAINT "LectureMaterial_lesson_id_fkey" FOREIGN KEY ("lesson_id") REFERENCES "Lesson"("lesson_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Assessment" ADD CONSTRAINT "Assessment_module_id_fkey" FOREIGN KEY ("module_id") REFERENCES "Module"("module_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Assessment" ADD CONSTRAINT "Assessment_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "Educator"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Question_Paper" ADD CONSTRAINT "Question_Paper_assessment_id_fkey" FOREIGN KEY ("assessment_id") REFERENCES "Assessment"("assessment_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Model_Answer_Paper" ADD CONSTRAINT "Model_Answer_Paper_assessment_id_fkey" FOREIGN KEY ("assessment_id") REFERENCES "Assessment"("assessment_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Marking_Scheme" ADD CONSTRAINT "Marking_Scheme_assessment_id_fkey" FOREIGN KEY ("assessment_id") REFERENCES "Assessment"("assessment_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_assessment_id_fkey" FOREIGN KEY ("assessment_id") REFERENCES "Assessment"("assessment_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Submission" ADD CONSTRAINT "Submission_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "Student"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Submission" ADD CONSTRAINT "Submission_assessment_id_fkey" FOREIGN KEY ("assessment_id") REFERENCES "Assessment"("assessment_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Student_Answer" ADD CONSTRAINT "Student_Answer_submission_id_fkey" FOREIGN KEY ("submission_id") REFERENCES "Submission"("submission_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Student_Answer" ADD CONSTRAINT "Student_Answer_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "Question"("question_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Question_Grade" ADD CONSTRAINT "Question_Grade_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "Question"("question_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Question_Grade" ADD CONSTRAINT "Question_Grade_submission_id_fkey" FOREIGN KEY ("submission_id") REFERENCES "Submission"("submission_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Question_Grade" ADD CONSTRAINT "Question_Grade_educator_id_fkey" FOREIGN KEY ("educator_id") REFERENCES "Educator"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Question_Grade" ADD CONSTRAINT "Question_Grade_model_id_fkey" FOREIGN KEY ("model_id") REFERENCES "Evaluation_Model"("model_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Assessment_Grade" ADD CONSTRAINT "Assessment_Grade_submission_id_fkey" FOREIGN KEY ("submission_id") REFERENCES "Submission"("submission_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Assessment_Grade" ADD CONSTRAINT "Assessment_Grade_educator_id_fkey" FOREIGN KEY ("educator_id") REFERENCES "Educator"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Assessment_Grade" ADD CONSTRAINT "Assessment_Grade_model_id_fkey" FOREIGN KEY ("model_id") REFERENCES "Evaluation_Model"("model_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pricing_Plan" ADD CONSTRAINT "Pricing_Plan_model_id_fkey" FOREIGN KEY ("model_id") REFERENCES "Evaluation_Model"("model_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_pricing_plan_id_fkey" FOREIGN KEY ("pricing_plan_id") REFERENCES "Pricing_Plan"("pricing_plan_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_educator_id_fkey" FOREIGN KEY ("educator_id") REFERENCES "Educator"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;
