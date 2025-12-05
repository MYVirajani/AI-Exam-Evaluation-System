"use client";

import { useSearchParams, useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  FileText,
  Plus,
  Edit,
  BarChart3,
  Shield,
  Shuffle,
  Zap,
  ArrowLeft,
  Type,
  Download,
} from "lucide-react";
import Button from "@/components/Button";
import Breadcrumbs from "@/components/Breadcrumbs";
import Dropdown from "@/components/Dropdown";
import { getAssessmentBreadcrumbs } from "@/utils/breadcrumbs";
import { formatOpenCloseTime, formatDuration } from "@/utils/date-time";
import { downloadQuestionPaper } from "@/utils/questionPaperExport";
import LoadingAnimation from "@/components/LoadingAnimation";

interface User {
  first_name: string;
  last_name: string;
  email: string;
}

interface Question {
  question_id: string;
  assessment_id: string;
  type: "MCQ" | "SHORT";
  question_number: string;
  question: string;
  model_answer: string;
  mcq_answer_options: string[];
  marks_allowed: string;
}

interface Assessment {
  assessment_id: string;
  type: string;
  title: string;
  description?: string;
  deadline: string;
  open_at?: string;
  close_at?: string;
  duration?: number;
  total_marks?: number;
  max_marks?: number;
  instructions?: string[];
  questions?: Question[];
  auto_grade?: boolean;
  shuffle_questions?: boolean;
  back_navigation?: boolean;
  case_sensitive_evaluation?: boolean;
  password?: string | null;
  submissions: {
    submission_id: string;
    file_url: string;
    submission_time: string;
    student: {
      student_id: string;
      registration_number: string;
      user: User;
    };
    assessment_grade?: {
      marks_awarded: number;
      total_marks: number;
    } | null;
    question_grades: any[];
  }[];
  module: {
    module_code: string;
    module_name: string;
  };
  enrollmentCount: number;
}

export default function QuizAssessmentPage() {
  const searchParams = useSearchParams();
  const params = useParams();
  const router = useRouter();

  const moduleId = params.moduleId as string;
  const assessmentId = params.assessmentId as string;
  const educatorId = searchParams.get("educatorId");

  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDownloadFormat, setSelectedDownloadFormat] = useState("PDF");
  const [isDownloading, setIsDownloading] = useState(false);

  const downloadOptions = ["PDF", "Excel"];

  useEffect(() => {
    if (!moduleId || !assessmentId || !educatorId) {
      setError("Missing required parameters");
      setLoading(false);
      return;
    }

    const fetchAssessment = async () => {
      try {
        const res = await fetch(
          `/api/educator/module/${moduleId}/assessment/${assessmentId}?educatorId=${educatorId}`
        );
        if (!res.ok) throw new Error("Failed to fetch assessment");

        const data = await res.json();

        if (!data || !data.assessment) {
          throw new Error("Assessment not found");
        }

        const enrichedAssessment = {
          ...data.assessment,
          module: data.module,
          enrollmentCount: data.enrollmentCount,
        };

        setAssessment(enrichedAssessment);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch assessment"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAssessment();
  }, [moduleId, assessmentId, educatorId]);

  const handleCreateQuiz = () => {
    router.push(
      `/educator/module/${moduleId}/assessment/${assessmentId}/quiz/quiz-form?educatorId=${educatorId}`
    );
  };

  const handleEditQuiz = () => {
    router.push(
      `/educator/module/${moduleId}/assessment/${assessmentId}/quiz/quiz-form?edit=true&educatorId=${educatorId}`
    );
  };

  const handleViewResults = () => {
    router.push(
      `/educator/module/${moduleId}/assessment/${assessmentId}/quiz/results?educatorId=${educatorId}`
    );
  };

  const handleDownloadQuestionPaper = async () => {
    if (!assessment?.questions || assessment.questions.length === 0) {
      alert("No questions available to download");
      return;
    }

    setIsDownloading(true);
    try {
      await downloadQuestionPaper(
        assessment,
        selectedDownloadFormat.toLowerCase() as "pdf" | "docx" | "excel"
      );
    } catch (error) {
      console.error("Download failed:", error);
      alert("Failed to download question paper. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  const calculateTotalMarks = () => {
    return (
      assessment?.total_marks ??
      assessment?.questions?.reduce(
        (total, q) => total + parseInt(q.marks_allowed || "0"),
        0
      ) ??
      0
    );
  };

  const getMaxMarks = () => {
    return assessment?.max_marks ?? calculateTotalMarks();
  };

  const getMCQCount = () => {
    if (!assessment?.questions) return 0;
    return assessment.questions.filter((q) => q.type === "MCQ").length;
  };

  const getShortAnswerCount = () => {
    if (!assessment?.questions) return 0;
    return assessment.questions.filter((q) => q.type === "SHORT").length;
  };

  const getCorrectAnswerIndex = (question: Question) => {
    if (question.type === "MCQ" && question.mcq_answer_options.length > 0) {
      return question.mcq_answer_options.findIndex(
        (option) =>
          option.trim().toLowerCase() ===
          question.model_answer.trim().toLowerCase()
      );
    }
    return -1;
  };

  const formatInstructions = (instructions: string[] | undefined) => {
    if (!instructions) return null;
    return instructions.map((instruction, index) => (
      <li key={index} className="text-gray-700 text-sm">
        {instruction.replace(/^\d+\.\s*/, "")}
      </li>
    ));
  };

  if (loading) {
    return (
      <LoadingAnimation
        size="lg"
        variant="wave"
        text="Loading quiz assessment..."
        fullScreen={true}
        color="blue"
      />
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-sm border border-red-200">
          <div className="text-red-600 text-center">
            <h2 className="text-lg font-semibold mb-2">Error</h2>
            <p>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!assessment) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-sm">
          <p className="text-gray-600">Quiz assessment not found</p>
        </div>
      </div>
    );
  }

  const totalMarks = calculateTotalMarks();
  const maxMarks = getMaxMarks();
  const mcqCount = getMCQCount();
  const shortAnswerCount = getShortAnswerCount();
  const hasSubmissions =
    assessment.submissions && assessment.submissions.length > 0;
  const hasQuestions = assessment.questions && assessment.questions.length > 0;

  // Generate breadcrumbs
  const breadcrumbs = assessment
    ? getAssessmentBreadcrumbs(
        assessment.module.module_code,
        moduleId,
        assessment.title,
        assessmentId,
        "educator"
      )
    : [
        { label: "Dashboard", href: "/educator/dashboard" },
        { label: "Module", href: `/educator/module/${moduleId}` },
        { label: "Assessment", current: true },
      ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Breadcrumbs */}
        <div className="mb-6">
          <Breadcrumbs items={breadcrumbs} className="" />
        </div>
        {/* Header Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="border-b border-gray-100 pb-4 mb-4">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {assessment.title}
                <span className="ml-3 text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-medium">
                  Quiz
                </span>
              </h1>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div className="text-sm text-gray-600">
                <span className="font-medium">
                  {assessment.module.module_code}
                </span>
                <span className="mx-2">•</span>
                <span>{assessment.module.module_name}</span>
              </div>
              <div className="text-sm text-gray-600">
                <span className="font-medium">Submissions: </span>
                <span className="text-blue-600">
                  {
                    new Set(
                      assessment.submissions?.map(
                        (sub) => sub.student.student_id
                      )
                    ).size
                  }
                </span>
                <span className="mx-1">/</span>
                <span>{assessment.enrollmentCount ?? 0} enrolled</span>
              </div>
            </div>
          </div>

          {assessment.description && (
            <p className="text-gray-700 leading-relaxed mb-4">
              {assessment.description}
            </p>
          )}

          {/* Quiz Details */}
          {assessment.open_at && assessment.close_at && (
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-sm mb-4">
              <div>
                <span className="font-medium text-gray-800">
                  {formatOpenCloseTime(assessment.open_at, assessment.close_at)}
                </span>
              </div>
              {assessment.duration && (
                <div className="flex-shrink-0">
                  <span className="font-medium text-gray-700">Duration:</span>
                  <span className="ml-2 text-gray-600">
                    {formatDuration(assessment.duration)}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Assessment Features */}
          <div className="mt-4 flex flex-wrap gap-2">
            {assessment.auto_grade && (
              <div className="flex items-center gap-1 bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium">
                <Zap className="w-3 h-3" />
                Auto Grade
              </div>
            )}
            {assessment.shuffle_questions && (
              <div className="flex items-center gap-1 bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-xs font-medium">
                <Shuffle className="w-3 h-3" />
                Shuffle Questions
              </div>
            )}
            {!assessment.back_navigation && (
              <div className="flex items-center gap-1 bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-xs font-medium">
                <ArrowLeft className="w-3 h-3" />
                No Back Nav
              </div>
            )}
            {assessment.case_sensitive_evaluation && (
              <div className="flex items-center gap-1 bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-xs font-medium">
                <Type className="w-3 h-3" />
                Case Sensitive
              </div>
            )}
            {assessment.password && (
              <div className="flex items-center gap-1 bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-xs font-medium">
                <Shield className="w-3 h-3" />
                Protected
              </div>
            )}
          </div>
        </div>

        {/* Quiz Content Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Quiz Questions
            </h2>
            <div className="flex flex-wrap gap-3 items-center">
              {/* Download Question Paper Section */}
              {hasQuestions && (
                <div className="flex items-center gap-2">
                  <Dropdown
                    options={downloadOptions}
                    selectedOption={selectedDownloadFormat}
                    onSelect={setSelectedDownloadFormat}
                    className="w-20"
                  />
                  <Button
                    onClick={handleDownloadQuestionPaper}
                    variant="outline"
                    className="flex items-center gap-2 whitespace-nowrap"
                    disabled={isDownloading}
                  >
                    <Download className="w-4 h-4" />
                    {isDownloading ? "Downloading..." : "Download"}
                  </Button>
                </div>
              )}

              {hasSubmissions && (
                <Button
                  onClick={handleViewResults}
                  variant="primary"
                  className="flex items-center gap-2"
                >
                  <BarChart3 className="w-4 h-4" />
                  View Results
                </Button>
              )}

              {hasQuestions && (
                <Button
                  onClick={handleEditQuiz}
                  variant="primary"
                  className="flex items-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                  Edit Quiz
                </Button>
              )}
            </div>
          </div>

          {hasQuestions ? (
            <div className="space-y-6">
              {/* Quiz Statistics */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-100">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {assessment.questions.length}
                    </div>
                    <div className="text-gray-600 font-medium">
                      Total Questions
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {mcqCount}
                    </div>
                    <div className="text-gray-600 font-medium">
                      MCQ Questions
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {shortAnswerCount}
                    </div>
                    <div className="text-gray-600 font-medium">
                      Short Answer
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      {maxMarks}
                      {maxMarks !== totalMarks && (
                        <span className="text-lg text-gray-500">
                          /{totalMarks}
                        </span>
                      )}
                    </div>
                    <div className="text-gray-600 font-medium">
                      {maxMarks !== totalMarks
                        ? "Max/Total Marks"
                        : "Total Marks"}
                    </div>
                  </div>
                </div>
              </div>

              {/* Instructions */}
              {assessment.instructions &&
                assessment.instructions.length > 0 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="font-semibold text-blue-800 mb-3 flex items-center">
                      <span className="w-5 h-5 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs mr-2">
                        !
                      </span>
                      Instructions
                    </h3>
                    <ul className="space-y-1 list-decimal list-inside">
                      {formatInstructions(assessment.instructions)}
                    </ul>
                  </div>
                )}

              {/* Questions Preview */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-4 text-lg">
                  Questions Preview
                </h3>
                <div className="space-y-6">
                  {assessment.questions
                    .sort(
                      (a, b) =>
                        parseInt(a.question_number) -
                        parseInt(b.question_number)
                    )
                    .map((question, index) => {
                      const correctAnswerIndex =
                        getCorrectAnswerIndex(question);

                      return (
                        <div
                          key={question.question_id}
                          className="border border-gray-200 rounded-lg overflow-hidden"
                        >
                          {/* Question Header */}
                          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                                  Q{question.question_number}
                                </span>
                                <span
                                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                                    question.type === "MCQ"
                                      ? "bg-green-100 text-green-800"
                                      : "bg-purple-100 text-purple-800"
                                  }`}
                                >
                                  {question.type === "MCQ"
                                    ? "Multiple Choice"
                                    : "Short Answer"}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-600">
                                  Marks:
                                </span>
                                <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-sm font-semibold">
                                  {question.marks_allowed}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Question Content */}
                          <div className="p-6">
                            <p className="text-gray-900 text-lg mb-4 leading-relaxed">
                              {question.question}
                            </p>

                            {question.type === "MCQ" &&
                              question.mcq_answer_options.length > 0 && (
                                <div className="space-y-3">
                                  <h4 className="font-medium text-gray-700 mb-3">
                                    Answer Options:
                                  </h4>
                                  <div className="grid gap-2">
                                    {question.mcq_answer_options.map(
                                      (option, optIndex) => {
                                        const isCorrect =
                                          optIndex === correctAnswerIndex;
                                        return (
                                          option.trim() && (
                                            <div
                                              key={`option-${question.question_id}-${optIndex}`}
                                              className={`flex items-center p-3 rounded-lg border transition-colors ${
                                                isCorrect
                                                  ? "bg-green-50 border-green-200 shadow-sm"
                                                  : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                                              }`}
                                            >
                                              <span
                                                className={`font-semibold mr-3 w-6 h-6 rounded-full flex items-center justify-center text-sm ${
                                                  isCorrect
                                                    ? "bg-green-500 text-white"
                                                    : "bg-gray-300 text-gray-700"
                                                }`}
                                              >
                                                {String.fromCharCode(
                                                  65 + optIndex
                                                )}
                                              </span>
                                              <span
                                                className={`flex-1 ${
                                                  isCorrect
                                                    ? "text-green-800 font-medium"
                                                    : "text-gray-700"
                                                }`}
                                              >
                                                {option.trim()}
                                              </span>
                                              {isCorrect && (
                                                <span className="flex items-center gap-1 text-green-600 text-sm font-medium">
                                                  <svg
                                                    className="w-4 h-4"
                                                    fill="currentColor"
                                                    viewBox="0 0 20 20"
                                                  >
                                                    <path
                                                      fillRule="evenodd"
                                                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                      clipRule="evenodd"
                                                    />
                                                  </svg>
                                                  Correct Answer
                                                </span>
                                              )}
                                            </div>
                                          )
                                        );
                                      }
                                    )}
                                  </div>
                                </div>
                              )}

                            {question.type === "SHORT" && (
                              <div className="mt-4">
                                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                  <div className="flex items-start gap-2">
                                    <svg
                                      className="w-5 h-5 text-green-600 mt-0.5"
                                      fill="currentColor"
                                      viewBox="0 0 20 20"
                                    >
                                      <path
                                        fillRule="evenodd"
                                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                                        clipRule="evenodd"
                                      />
                                    </svg>
                                    <div>
                                      <span className="text-sm font-semibold text-green-800">
                                        Correct Answer:
                                      </span>
                                      <p className="text-sm text-green-700 mt-1 font-medium">
                                        {question.model_answer}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <FileText className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No Questions Created Yet
              </h3>
              <p className="text-gray-600 mb-6">
                Create your quiz with MCQ and short answer questions to get
                started.
              </p>
              <Button
                onClick={handleCreateQuiz}
                className="flex items-center gap-2 mx-auto"
              >
                <Plus className="w-4 h-4" />
                Create Quiz Now
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
