"use client";

import { useSearchParams, useParams, useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import {
  Save,
  ArrowLeft,
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle,
  Clock,
  FileText,
  BookOpen,
  Award,
  Settings,
  Shuffle,
  Calendar,
  Users,
  Target,
  Lock,
  Type,
} from "lucide-react";
import Button from "@/components/Button";
import PasswordInput from "@/components/PasswordInput";
import { toast } from "react-hot-toast";
import { formatDuration, formatOpenCloseTime } from "@/utils/date-time";
import QuizSection from "./QuizSection";
import { getAssessmentBreadcrumbs } from "@/utils/breadcrumbs";
import Breadcrumbs from "@/components/Breadcrumbs";

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
  duration?: number;
  total_marks?: number;
  max_marks?: number;
  instructions?: string[];
  questions?: Question[];
  submissions: any[];
  module: {
    module_code: string;
    module_name: string;
  };
  enrollmentCount: number;
  shuffle_questions?: boolean;
  password?: string;
  max_attempts?: number;
  open_at?: string;
  close_at?: string;
  question_count?: number;
  auto_grade?: boolean;
  back_navigation?: boolean;
  case_sensitive_evaluation?: boolean;
}

interface QuizFormData {
  title: string;
  description: string;
  deadline: string;
  duration: number;
  instructions: string[];
  questions: Question[];
  maxMarks: number | null;
  shuffleQuestions: boolean;
  autoGrade: boolean;
  backNavigation: boolean;
  caseSensitive: boolean;
  password?: string;
  openAt: string;
  closeAt: string;
  maxAttempts: number;
}

export default function QuizFormPage() {
  const searchParams = useSearchParams();
  const params = useParams();
  const router = useRouter();

  const moduleId = params.moduleId as string;
  const assessmentId = params.assessmentId as string;
  const educatorId = searchParams.get("educatorId");
  const isEdit = searchParams.get("edit");

  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const actionBarRef = useRef<HTMLDivElement | null>(null);
  const [passwordInput, setPasswordInput] = useState("");

  const [formData, setFormData] = useState<QuizFormData>({
    title: "",
    description: "",
    deadline: "",
    duration: 60,
    instructions: [""],
    questions: [],
    maxMarks: null,
    shuffleQuestions: true,
    autoGrade: false,
    backNavigation: true,
    caseSensitive: false,
    password: "",
    openAt: "",
    closeAt: "",
    maxAttempts: 1,
  });

  // Helper: format DB ISO/offset timestamps into "YYYY-MM-DDTHH:mm" for datetime-local WITHOUT UTC conversion
  const formatDateTimeForInput = (dateString: string | null | undefined) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      const pad = (n: number) => String(n).padStart(2, "0");
      return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
        date.getDate()
      )}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
    } catch {
      return "";
    }
  };

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

        const enrichedAssessment: Assessment = {
          ...data.assessment,
          module: data.module,
          enrollmentCount: data.enrollmentCount,
        };

        setAssessment(enrichedAssessment);

        // Populate form data
        setFormData({
          title: enrichedAssessment.title || "",
          description: enrichedAssessment.description || "",
          deadline: enrichedAssessment.deadline
            ? formatDateTimeForInput(enrichedAssessment.deadline)
            : "",
          duration: enrichedAssessment.duration || 60,
          instructions: enrichedAssessment.instructions?.length
            ? enrichedAssessment.instructions
            : [""],
          questions:
            enrichedAssessment.questions?.map((q) => ({
              ...q,
              mcq_answer_options: q.mcq_answer_options?.length
                ? q.mcq_answer_options
                : ["", "", "", ""],
            })) || [],
          maxMarks: enrichedAssessment.max_marks
            ? Number(enrichedAssessment.max_marks)
            : null,
          autoGrade: enrichedAssessment.auto_grade ?? false,
          backNavigation: enrichedAssessment.back_navigation ?? true,
          caseSensitive: enrichedAssessment.case_sensitive_evaluation ?? false,
          shuffleQuestions: enrichedAssessment.shuffle_questions ?? true,
          password: enrichedAssessment.password || "",
          openAt: formatDateTimeForInput(enrichedAssessment.open_at),
          closeAt: formatDateTimeForInput(enrichedAssessment.close_at),
          maxAttempts: enrichedAssessment.max_attempts || 1,
        });
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

  // Generate breadcrumbs after assessment is loaded
  const breadcrumbs = assessment
    ? getAssessmentBreadcrumbs(
        assessment.module.module_code,
        moduleId,
        `${assessment.title} - Form`,
        assessmentId,
        "educator"
      )
    : [
        { label: "Dashboard", href: "/educator/dashboard" },
        { label: "Loading...", href: "#" },
        { label: "Loading...", href: "#" },
        { label: "Quiz Form", current: true },
      ];

  const handleGoBack = () => {
    router.push(
      `/educator/module/${moduleId}/assessment/${assessmentId}/quiz?educatorId=${educatorId}`
    );
  };

  const addInstruction = () => {
    setFormData((prev) => ({
      ...prev,
      instructions: [...prev.instructions, ""],
    }));
  };

  const updateInstruction = (index: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      instructions: prev.instructions.map((inst, i) =>
        i === index ? value : inst
      ),
    }));
  };

  const removeInstruction = (index: number) => {
    if (formData.instructions.length > 0) {
      setFormData((prev) => ({
        ...prev,
        instructions: prev.instructions.filter((_, i) => i !== index),
      }));
    }
  };

  const addQuestion = () => {
    const newQuestion: Question = {
      question_id: `temp_${Date.now()}`,
      assessment_id: assessmentId,
      type: "MCQ",
      question_number: String(formData.questions.length + 1),
      question: "",
      model_answer: "",
      mcq_answer_options: ["", ""],
      marks_allowed: "1",
    };

    setFormData((prev) => ({
      ...prev,
      questions: [...prev.questions, newQuestion],
    }));
  };

  const updateQuestion = (index: number, field: keyof Question, value: any) => {
    setFormData((prev) => ({
      ...prev,
      questions: prev.questions.map((q, i) => {
        if (i === index) {
          const updatedQuestion = { ...q, [field]: value };

          if (field === "type" && value === "SHORT") {
            updatedQuestion.mcq_answer_options = [];
          } else if (field === "type" && value === "MCQ") {
            updatedQuestion.mcq_answer_options = ["", ""];
          }

          return updatedQuestion;
        }
        return q;
      }),
    }));
  };

  const updateMCQOption = (
    questionIndex: number,
    optionIndex: number,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      questions: prev.questions.map((q, i) => {
        if (i === questionIndex) {
          const newOptions = [...q.mcq_answer_options];
          newOptions[optionIndex] = value;
          return { ...q, mcq_answer_options: newOptions };
        }
        return q;
      }),
    }));
  };

  const addMCQOption = (questionIndex: number) => {
    setFormData((prev) => ({
      ...prev,
      questions: prev.questions.map((q, i) => {
        if (i === questionIndex) {
          return {
            ...q,
            mcq_answer_options: [...q.mcq_answer_options, ""],
          };
        }
        return q;
      }),
    }));
  };

  const removeMCQOption = (questionIndex: number, optionIndex: number) => {
    setFormData((prev) => ({
      ...prev,
      questions: prev.questions.map((q, i) => {
        if (i === questionIndex) {
          const newOptions = q.mcq_answer_options.filter(
            (_, idx) => idx !== optionIndex
          );
          const removedOption = q.mcq_answer_options[optionIndex];
          const newModelAnswer =
            q.model_answer === removedOption ? "" : q.model_answer;

          return {
            ...q,
            mcq_answer_options: newOptions,
            model_answer: newModelAnswer,
          };
        }
        return q;
      }),
    }));
  };

  const removeQuestion = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      questions: prev.questions
        .filter((_, i) => i !== index)
        .map((q, newIndex) => ({
          ...q,
          question_number: String(newIndex + 1),
        })),
    }));
  };

  const calculateTotalMarks = () => {
    const total = formData.questions.reduce(
      (sum, q) => sum + parseFloat(q.marks_allowed || "0"),
      0
    );
    return parseFloat(total.toFixed(2));
  };

  const checkAllQuestionsComplete = (): {
    isComplete: boolean;
    missingAnswers: string[];
  } => {
    const missingAnswers: string[] = [];

    formData.questions.forEach((question, index) => {
      const questionNumber = index + 1;

      if (question.type === "MCQ") {
        const validOptions = question.mcq_answer_options.filter(
          (opt) => opt.trim() !== ""
        );
        if (validOptions.length < 2) {
          missingAnswers.push(
            `Question ${questionNumber}: At least 2 answer options required`
          );
        }

        if (
          !question.model_answer.trim() ||
          !question.mcq_answer_options.some(
            (opt) => opt.trim() === question.model_answer.trim()
          )
        ) {
          missingAnswers.push(
            `Question ${questionNumber}: No correct answer selected`
          );
        }
      } else if (question.type === "SHORT") {
        if (!question.model_answer.trim()) {
          missingAnswers.push(
            `Question ${questionNumber}: Model answer required`
          );
        }
      }

      if (!question.question.trim()) {
        missingAnswers.push(
          `Question ${questionNumber}: Question text required`
        );
      }

      if (!question.marks_allowed || parseFloat(question.marks_allowed) <= 0) {
        missingAnswers.push(`Question ${questionNumber}: Valid marks required`);
      }
    });

    return {
      isComplete: missingAnswers.length === 0,
      missingAnswers,
    };
  };

  const validateForm = () => {
    if (!formData.title.trim()) return "Quiz title is required";

    if (formData.questions.length === 0) {
      return "At least one question is required";
    }

    const { isComplete, missingAnswers } = checkAllQuestionsComplete();
    if (!isComplete) {
      return `Please complete all questions:\n${missingAnswers.join("\n")}`;
    }

    if (formData.maxMarks && formData.maxMarks <= 0)
      return "Max marks must be greater than 0";
    if (formData.maxMarks && formData.maxMarks > calculateTotalMarks())
      return "Max marks cannot exceed total marks from all questions";

    if (formData.password && formData.password.length < 6)
      return "If a password is set, it must be at least 6 characters";

    const { openAt, closeAt, deadline, duration } = formData;
    const hasOpen = !!openAt;
    const hasClose = !!closeAt;
    const hasDeadline = !!deadline;

    if (hasOpen !== hasClose) {
      return "Please provide both 'Opens at' and 'Closes at' times.";
    }

    if (hasOpen && hasClose) {
      const openD = new Date(openAt);
      const closeD = new Date(closeAt);

      if (isNaN(openD.getTime()) || isNaN(closeD.getTime()))
        return "Invalid open/close time.";

      if (openD >= closeD) return "Open time must be before close time.";

      const durMin = Number(duration);
      if (!Number.isFinite(durMin) || durMin <= 0)
        return "Duration must be a positive number of minutes.";
      const diffMs = closeD.getTime() - openD.getTime();
      const minGapMs = durMin * 60 * 1000;
      if (diffMs < minGapMs) {
        return `Open and close times must be at least the quiz duration apart (${durMin} minute${
          durMin === 1 ? "" : "s"
        }).`;
      }

      if (!hasDeadline)
        return "Deadline is required when open/close times are set.";

      const deadlineD = new Date(deadline);
      if (isNaN(deadlineD.getTime())) return "Invalid deadline.";
    }

    return null;
  };

  const isSaveDisabled = (): boolean => {
    if (!formData.title.trim()) return true;
    if (formData.questions.length === 0) return true;

    const { isComplete } = checkAllQuestionsComplete();
    if (!isComplete) return true;

    if (saving) return true;

    return false;
  };

  const handleSave = async () => {
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      toast.error(validationError, { duration: 5000, icon: "⚠️" });
      actionBarRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
      return;
    }

    if (!moduleId || !assessmentId || !educatorId) {
      const msg = "Missing required identifiers";
      setError(msg);
      toast.error(msg);
      actionBarRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
      return;
    }

    setSaving(true);
    setError(null);
    setSaveMessage(null);

    try {
      const sanitizedQuestions = formData.questions.map((question) => ({
        questionId: question.question_id,
        questionType: question.type,
        questionText: question.question,
        options:
          question.type === "MCQ"
            ? question.mcq_answer_options.filter((opt) => opt.trim())
            : [],
        correctAnswerIndex:
          question.type === "MCQ"
            ? question.mcq_answer_options.findIndex(
                (opt) =>
                  opt.trim().toLowerCase() ===
                  question.model_answer.trim().toLowerCase()
              )
            : 0,
        marks: parseFloat(question.marks_allowed) || 0,
        expectedAnswer:
          question.type === "SHORT" ? question.model_answer : undefined,
      }));

      const quiz = {
        moduleId,
        type: "quiz",
        assessmentId,
        title: formData.title.trim(),
        duration: formData.duration,
        description: formData.description.trim(),
        instructions: formData.instructions.filter((inst) => inst.trim()),
        deadline: formData.deadline || null,
        questions: sanitizedQuestions,
        createdBy: educatorId,
        totalQuestions: formData.questions.length,
        password: formData.password?.trim() ? formData.password.trim() : null,
        autoGrade: formData.autoGrade,
        shuffleQuestions: formData.shuffleQuestions,
        backNavigation: formData.backNavigation,
        caseSensitive: formData.caseSensitive,
        maxMarks: formData.maxMarks,
        maxAttempts: formData.maxAttempts,
        openAt: formData.openAt || null,
        closeAt: formData.closeAt || null,
        totalMarks: calculateTotalMarks(),
      };

      const res = await fetch("/api/educator/assessment/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(quiz),
      });

      const result = await res.json();

      if (result.success) {
        setSaveMessage("Quiz updated successfully!");
        toast.success("Quiz updated successfully!");
        setTimeout(() => {
          router.push(
            `/educator/module/${moduleId}/assessment/${assessmentId}/quiz?educatorId=${educatorId}`
          );
        }, 1200);
      } else {
        const msg = `Failed to save quiz: ${result.message}`;
        setError(msg);
        toast.error(msg);
        actionBarRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
    } catch (err) {
      console.error("Error saving quiz:", err);
      const msg =
        "Something went wrong. Please check your connection and try again.";
      setError(msg);
      toast.error(msg);
      actionBarRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="bg-white p-10 rounded-2xl shadow-xl border border-blue-100">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
            <p className="text-lg font-medium text-gray-700">
              Loading quiz data...
            </p>
            <p className="text-sm text-gray-500">
              Please wait while we fetch your assessment
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error && !assessment) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-red-200 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Unable to Load Quiz
            </h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <Button onClick={handleGoBack} className="w-full">
              Return to Assessment
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Breadcrumbs Section - Properly positioned */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <Breadcrumbs items={breadcrumbs} />
        </div>
      </div>

      {/* Header Section */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                onClick={handleGoBack}
                variant="outline"
                className="flex items-center gap-2 hover:bg-gray-50"
              >
                <ArrowLeft className="w-4 h-4" />
                Go Back
              </Button>
              <div className="border-l border-gray-300 pl-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl text-white">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                      {isEdit
                        ? "Edit Your Quiz Assessment"
                        : "Build Your Quiz Assessment"}
                    </h1>
                    <p className="text-sm text-gray-600 mt-1">
                      <span className="font-medium">
                        {assessment?.module.module_code}
                      </span>
                      <span className="mx-2">•</span>
                      <span>{assessment?.module.module_name}</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats Display */}
            <div className="hidden lg:block">
              <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-4 border border-gray-200">
                <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-gray-600">
                      <BookOpen className="w-4 h-4 text-blue-600" />
                      <span className="font-medium">Questions:</span>
                    </div>
                    <span className="font-bold text-gray-900">
                      {formData.questions.length}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Award className="w-4 h-4 text-green-600" />
                      <span className="font-medium">Max Marks:</span>
                    </div>
                    <span className="font-bold text-gray-900">
                      {formData.maxMarks || calculateTotalMarks()}
                      {formData.maxMarks &&
                        formData.maxMarks !== calculateTotalMarks() && (
                          <span className="text-gray-500">
                            /{calculateTotalMarks()}
                          </span>
                        )}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Clock className="w-4 h-4 text-purple-600" />
                      <span className="font-medium">Duration:</span>
                    </div>
                    <span className="font-bold text-gray-900">
                      {formatDuration(formData.duration)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Users className="w-4 h-4 text-indigo-600" />
                      <span className="font-medium">Attempts:</span>
                    </div>
                    <span className="font-bold text-gray-900">
                      {formData.maxAttempts}
                    </span>
                  </div>

                  <div className="col-span-2 flex items-center gap-2 flex-wrap">
                    {formData.autoGrade && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Auto Grade
                      </span>
                    )}
                    {formData.shuffleQuestions && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        <Shuffle className="w-3 h-3 mr-1" />
                        Shuffle
                      </span>
                    )}
                    {!formData.backNavigation && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        <ArrowLeft className="w-3 h-3 mr-1" />
                        No Back Nav
                      </span>
                    )}
                    {formData.caseSensitive && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                        <Type className="w-3 h-3 mr-1" />
                        Case Sensitive
                      </span>
                    )}
                    {formData.password && formData.password.trim() && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                        <Lock className="w-3 h-3 mr-1" />
                        Protected
                      </span>
                    )}
                  </div>

                  {(formData.openAt ||
                    formData.closeAt ||
                    formData.deadline) && (
                    <div className="col-span-2">
                      <span className="text-gray-700">
                        {formatOpenCloseTime(
                          formData.openAt,
                          formData.closeAt,
                          formData.deadline
                        )}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Compact Mobile View */}
            <div className="lg:hidden md:flex items-center space-x-4">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg px-3 py-2 border border-blue-200">
                <div className="flex items-center space-x-4 text-sm">
                  <div className="flex items-center space-x-1">
                    <BookOpen className="w-4 h-4 text-blue-600" />
                    <span className="font-bold">
                      {formData.questions.length}
                    </span>
                  </div>
                  <div className="w-px h-4 bg-gray-300"></div>
                  <div className="flex items-center space-x-1">
                    <Award className="w-4 h-4 text-green-600" />
                    <span className="font-bold">
                      {formData.maxMarks || calculateTotalMarks()}
                    </span>
                  </div>
                  <div className="w-px h-4 bg-gray-300"></div>
                  <div className="flex items-center space-x-1">
                    <Clock className="w-4 h-4 text-purple-600" />
                    <span className="font-bold">{formData.duration}min</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Success message */}
        {saveMessage && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-green-800">Success</h4>
              <p className="text-green-700 text-sm mt-1">{saveMessage}</p>
            </div>
          </div>
        )}

        {/* Quiz Metadata Form */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              Quiz Information
            </h2>
            <p className="text-gray-600 text-sm mt-1">
              Configure basic quiz settings and metadata
            </p>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="lg:col-span-2">
                <label className="block text-sm font-semibold text-gray-800 mb-3">
                  Quiz Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, title: e.target.value }))
                  }
                  className="w-full px-4 py-3 text-gray-900 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 shadow-sm"
                  placeholder="Enter a descriptive title for your quiz"
                />
              </div>

              <div className="lg:col-span-2">
                <label className="block text-sm font-semibold text-gray-800 mb-3">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  rows={4}
                  className="w-full px-4 py-3 text-gray-900 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 shadow-sm resize-none"
                  placeholder="Provide a brief description of what this quiz covers (optional)"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-3">
                  <Clock className="w-4 h-4 inline mr-2 text-gray-600" />
                  Duration (minutes)
                </label>
                <input
                  type="number"
                  value={formData.duration}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      duration: parseInt(e.target.value) || 0,
                    }))
                  }
                  min="1"
                  max="300"
                  className="w-full px-4 py-3 text-gray-900 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 shadow-sm"
                  placeholder="60"
                />
                <p className="text-xs text-gray-500 mt-2">
                  <span className="font-medium">Duration:</span>{" "}
                  {formatDuration(formData.duration)} •
                  <span className="ml-2">
                    Recommended: 1-2 minutes per question
                  </span>
                  {formData.duration > 180 && (
                    <span className="ml-2 text-amber-600 flex items-center mt-1">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      Long duration may affect student focus
                    </span>
                  )}
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-3">
                  <Calendar className="w-4 h-4 inline mr-2 text-gray-600" />
                  Deadline
                </label>
                <input
                  type="datetime-local"
                  value={formData.deadline}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      deadline: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-3 text-gray-900 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 shadow-sm"
                />
                <p className="text-xs text-gray-500 mt-2">
                  Set when the quiz expires or is due
                </p>
              </div>
            </div>

            {/* Instructions Section */}
            <div className="mt-8">
              <div className="mb-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-800">
                    Quiz Instructions
                  </label>
                  <p className="text-xs text-gray-500 mt-1">
                    Add additional instructions to guide students during the
                    quiz (system provides instructions automatically based on
                    quiz settings)
                  </p>
                </div>
              </div>
              <div className="relative">
                <div className="space-y-3">
                  {formData.instructions.map((instruction, index) => (
                    <div key={index} className="flex items-start gap-3 group">
                      <div className="flex-shrink-0 w-8 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-sm font-medium text-gray-600 mt-1">
                        {index + 1}
                      </div>
                      <input
                        type="text"
                        value={instruction}
                        onChange={(e) =>
                          updateInstruction(index, e.target.value)
                        }
                        className="flex-1 px-4 py-3 text-gray-900 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 shadow-sm"
                        placeholder="Enter an instruction for students..."
                      />
                      <Button
                        onClick={() => removeInstruction(index)}
                        variant="outline"
                        size="sm"
                        className="text-red-600 border-red-300 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity mt-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end mt-4">
                  <Button
                    onClick={addInstruction}
                    variant="secondary"
                    size="sm"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Advanced Settings Section */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Settings className="w-5 h-5 text-purple-600" />
              Advanced Quiz Settings
            </h2>
            <p className="text-gray-600 text-sm mt-1">
              Configure advanced options for quiz behavior and availability
            </p>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Auto Grading, Shuffle Questions, Back Navigation, and Case Sensitive Toggles */}
              <div className="lg:col-span-2 grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-4">
                {/* Auto Grading Toggle */}
                <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <div className="p-1.5 bg-green-100 rounded-lg">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      </div>
                      <h3 className="font-semibold text-gray-900 text-sm">
                        Auto Grading
                      </h3>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.autoGrade}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            autoGrade: e.target.checked,
                          }))
                        }
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-4 peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-green-600"></div>
                    </label>
                  </div>
                  <p className="text-xs text-gray-600">
                    Automatically grade and show results to students after quiz
                  </p>
                </div>

                {/* Shuffle Questions Toggle */}
                <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <div className="p-1.5 bg-blue-100 rounded-lg">
                        <Shuffle className="w-4 h-4 text-blue-600" />
                      </div>
                      <h3 className="font-semibold text-gray-900 text-sm">
                        Shuffle Questions
                      </h3>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.shuffleQuestions}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            shuffleQuestions: e.target.checked,
                          }))
                        }
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-4 peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  <p className="text-xs text-gray-600">
                    Randomize the order of questions for each student
                  </p>
                </div>

                {/* Back Navigation Toggle */}
                <div className="p-4 bg-gradient-to-r from-purple-50 to-violet-50 rounded-xl border border-purple-200">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <div className="p-1.5 bg-purple-100 rounded-lg">
                        <ArrowLeft className="w-4 h-4 text-purple-600" />
                      </div>
                      <h3 className="font-semibold text-gray-900 text-sm">
                        Back Navigation
                      </h3>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.backNavigation}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            backNavigation: e.target.checked,
                          }))
                        }
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-4 peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-600"></div>
                    </label>
                  </div>
                  <p className="text-xs text-gray-600">
                    Allow students to navigate back to previous questions
                  </p>
                </div>

                {/* Case Sensitive Toggle */}
                <div className="p-4 bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl border border-orange-200">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <div className="p-1.5 bg-orange-100 rounded-lg">
                        <Type className="w-4 h-4 text-orange-600" />
                      </div>
                      <h3 className="font-semibold text-gray-900 text-sm">
                        Case Sensitive
                      </h3>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.caseSensitive}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            caseSensitive: e.target.checked,
                          }))
                        }
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-4 peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-orange-600"></div>
                    </label>
                  </div>
                  <p className="text-xs text-gray-600">
                    Make text answers case sensitive during evaluation
                  </p>
                </div>
              </div>

              {/* Max Marks */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-3">
                  <Target className="w-4 h-4 inline mr-2 text-gray-600" />
                  Max Marks (Optional)
                </label>
                <input
                  type="number"
                  value={formData.maxMarks || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      maxMarks: e.target.value
                        ? parseInt(e.target.value)
                        : null,
                    }))
                  }
                  min="1"
                  max={calculateTotalMarks()}
                  className="w-full px-4 py-3 text-gray-900 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 shadow-sm"
                  placeholder={`Max ${calculateTotalMarks()}`}
                />
                <p className="text-xs text-gray-500 mt-2">
                  Leave empty to use all marks. Maximum: {calculateTotalMarks()}{" "}
                  marks
                </p>
              </div>

              {/* Max Attempts */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-3">
                  <Users className="w-4 h-4 inline mr-2 text-gray-600" />
                  Max Attempts
                </label>
                <input
                  type="number"
                  value={formData.maxAttempts}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      maxAttempts: parseInt(e.target.value) || 1,
                    }))
                  }
                  min="1"
                  max="10"
                  className="w-full px-4 py-3 text-gray-900 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 shadow-sm"
                  placeholder="1"
                />
                <p className="text-xs text-gray-500 mt-2">
                  Number of attempts allowed per student
                </p>
              </div>

              {/* Open At */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-3">
                  <Calendar className="w-4 h-4 inline mr-2 text-gray-600" />
                  Quiz Opens At (Optional)
                </label>
                <input
                  type="datetime-local"
                  value={formData.openAt}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, openAt: e.target.value }))
                  }
                  className="w-full px-4 py-3 text-gray-900 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 shadow-sm"
                />
                <p className="text-xs text-gray-500 mt-2">
                  When students can start taking the quiz
                </p>
              </div>

              {/* Close At */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-3">
                  <Calendar className="w-4 h-4 inline mr-2 text-gray-600" />
                  Quiz Closes At (Optional)
                </label>
                <input
                  type="datetime-local"
                  value={formData.closeAt}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      closeAt: e.target.value,
                    }))
                  }
                  min={formData.openAt || undefined}
                  className="w-full px-4 py-3 text-gray-900 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 shadow-sm"
                />
                <p className="text-xs text-gray-500 mt-2">
                  After this time, students cannot access the quiz
                </p>
              </div>

              {/* Password Input */}
              <div className="lg:col-span-2">
                <PasswordInput
                  label="Quiz Password (Optional)"
                  value={passwordInput}
                  onChange={(value) => {
                    setPasswordInput(value);
                    setFormData((prev) => ({ ...prev, password: value }));
                  }}
                  placeholder="Leave empty to allow access without a password"
                  required={false}
                  helperText="If set, students must enter this password to start the quiz. You can add or change it anytime."
                  className=""
                  id="quiz-password"
                />
              </div>
            </div>

            {/* Advanced Settings Info Panel */}
            <div className="mt-6 p-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-amber-800 mb-2">
                    Advanced Settings Information
                  </h4>
                  <ul className="text-sm text-amber-700 space-y-1">
                    <li>
                      • <strong>Auto Grading:</strong> Quiz is automatically
                      graded and students see results immediately after
                      completion
                    </li>
                    <li>
                      • <strong>Max Marks:</strong> System will randomly select
                      questions up to this mark limit
                    </li>
                    <li>
                      • <strong>Shuffle Questions:</strong> Each student will
                      see questions in different order
                    </li>
                    <li>
                      • <strong>Back Navigation:</strong> Controls whether
                      students can go back to previous questions
                    </li>
                    <li>
                      • <strong>Case Sensitive:</strong> Text answers will be
                      evaluated with exact case matching
                    </li>
                    <li>
                      • <strong>Open/Close Times:</strong> Control when students
                      can access the quiz
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Questions Section */}
        <QuizSection
          questions={formData.questions}
          onAddQuestion={addQuestion}
          onUpdateQuestion={updateQuestion}
          onUpdateMCQOption={updateMCQOption}
          onAddMCQOption={addMCQOption}
          onRemoveMCQOption={removeMCQOption}
          onRemoveQuestion={removeQuestion}
          assessmentId={assessmentId}
        />

        {/* Action Buttons */}
        <div
          ref={actionBarRef}
          className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6"
        >
          {/* Inline error above quick stats */}
          {error && (
            <div className="mb-6 p-4 rounded-lg border border-red-200 bg-red-50 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0">
                  <AlertCircle className="w-5 h-5 text-red-500" />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-red-800 mb-1">
                    Error
                  </h4>
                  <p className="text-sm text-red-700 whitespace-pre-line">
                    {error}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Warning for incomplete questions */}
          {(() => {
            const { isComplete, missingAnswers } = checkAllQuestionsComplete();
            return (
              !isComplete &&
              formData.questions.length > 0 && (
                <div className="mb-6 p-4 rounded-lg border border-amber-200 bg-amber-50 shadow-sm">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                      <AlertCircle className="w-5 h-5 text-amber-500" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-amber-800 mb-2">
                        Questions Need Completion
                      </h4>
                      <ul className="text-sm text-amber-700 space-y-1">
                        {missingAnswers.slice(0, 5).map((issue, index) => (
                          <li key={index}>• {issue}</li>
                        ))}
                        {missingAnswers.length > 5 && (
                          <li className="italic">
                            ... and {missingAnswers.length - 5} more issues
                          </li>
                        )}
                      </ul>
                    </div>
                  </div>
                </div>
              )
            );
          })()}

          <div className="flex items-center justify-between">
            {/* Quick Stats */}
            <div className="flex items-center space-x-8">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total Questions
                  </p>
                  <p className="text-2xl font-bold text-blue-600">
                    {formData.questions.length}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-green-200 rounded-xl flex items-center justify-center">
                  <Award className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    {formData.maxMarks ? "Max Marks" : "Total Marks"}
                  </p>
                  <p className="text-2xl font-bold text-green-600">
                    {formData.maxMarks || calculateTotalMarks()}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl flex items-center justify-center">
                  <Clock className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Duration</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {formData.duration}min
                  </p>
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex items-center gap-4">
              <Button onClick={handleGoBack} variant="outline">
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={isSaveDisabled()}
                className={`${
                  isSaveDisabled() ? "opacity-50 cursor-not-allowed" : ""
                }`}
                variant="primary"
                title={
                  isSaveDisabled()
                    ? "Please complete all questions before saving"
                    : "Save quiz"
                }
              >
                {saving ? (
                  <div className="flex items-center gap-3">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    <span>Saving Quiz...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Save className="w-5 h-5" />
                    <span>Save Quiz</span>
                  </div>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}