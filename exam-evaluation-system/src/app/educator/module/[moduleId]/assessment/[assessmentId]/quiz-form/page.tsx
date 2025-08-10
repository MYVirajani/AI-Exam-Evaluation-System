"use client";

import { useSearchParams, useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
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
} from "lucide-react";
import Button from "@/components/Button";
import PasswordInput from "@/components/PasswordInput";

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
}

interface QuizFormData {
  title: string;
  description: string;
  deadline: string;
  duration: number;
  instructions: string[];
  questions: Question[];
  maxMarks: number | null;
  maxQuestions: number | null;
  shuffleQuestions: boolean;
  autoGrade: boolean;
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

  const [formData, setFormData] = useState<QuizFormData>({
    title: "",
    description: "",
    deadline: "",
    duration: 60,
    instructions: [""],
    questions: [],
    maxMarks: null,
    maxQuestions: null,
    shuffleQuestions: true,
    autoGrade: false,
    password: "",
    openAt: "",
    closeAt: "",
    maxAttempts: 1,
  });

  // Helper function to format datetime for input
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
        console.log("assessment: ", data.assessment);

        if (!data || !data.assessment) {
          throw new Error("Assessment not found");
        }

        const enrichedAssessment = {
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
          maxQuestions: enrichedAssessment.question_count || null,
          autoGrade: enrichedAssessment.auto_grade ?? false,
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
    if (formData.instructions.length > 1) {
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
      mcq_answer_options: ["", "", "", ""],
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

          // If changing to SHORT type, clear MCQ options
          if (field === "type" && value === "SHORT") {
            updatedQuestion.mcq_answer_options = [];
          }
          // If changing to MCQ type, ensure 4 options
          else if (field === "type" && value === "MCQ") {
            updatedQuestion.mcq_answer_options = ["", "", "", ""];
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
      (total, q) => total + parseFloat(q.marks_allowed || "0"),
      0
    );
    return parseFloat(total.toFixed(2));
  };

  const validateForm = () => {
    if (!formData.title.trim()) return "Quiz title is required";
    if (formData.questions.length === 0)
      return "At least one question is required";

    // Validate max marks
    if (formData.maxMarks && formData.maxMarks <= 0) {
      return "Max marks must be greater than 0";
    }

    if (formData.maxMarks && formData.maxMarks > calculateTotalMarks()) {
      return "Max marks cannot exceed total marks from all questions";
    }

    // Validate max questions
    if (formData.maxQuestions && formData.maxQuestions <= 0) {
      return "Max questions must be greater than 0";
    }
    if (formData.password && formData.password.length < 6) {
      return "If a password is set, it must be at least 6 characters";
    }

    if (
      formData.maxQuestions &&
      formData.maxQuestions > formData.questions.length
    ) {
      return "Max questions cannot exceed total created questions";
    }

    // Validate dates
    if (formData.openAt && formData.closeAt) {
      const openDate = new Date(formData.openAt);
      const closeDate = new Date(formData.closeAt);
      if (openDate >= closeDate) {
        return "Open time must be before close time";
      }
    }

    for (let i = 0; i < formData.questions.length; i++) {
      const q = formData.questions[i];
      if (!q.question.trim()) return `Question ${i + 1} text is required`;
      if (!q.marks_allowed || parseInt(q.marks_allowed) <= 0)
        return `Question ${i + 1} must have valid marks`;

      if (q.type === "MCQ") {
        const validOptions = q.mcq_answer_options.filter((opt) => opt.trim());
        if (validOptions.length < 2)
          return `Question ${i + 1} must have at least 2 answer options`;
        if (!q.model_answer.trim())
          return `Question ${i + 1} must have a correct answer selected`;
      } else if (q.type === "SHORT") {
        if (!q.model_answer.trim())
          return `Question ${i + 1} must have a model answer`;
      }
    }

    return null;
  };

  const handleSave = async () => {
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    if (!moduleId || !assessmentId || !educatorId) {
      setError("Missing required identifiers");
      return;
    }

    setSaving(true);
    setError(null);
    setSaveMessage(null);

    try {
      // Transform questions to match the API format expected by QuizBuilderPage
      const sanitizedQuestions = formData.questions.map((question) => ({
        questionType: question.type, // MCQ or SHORT
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
        deadline: formData.deadline ? new Date(formData.deadline).toISOString()
          : null,
        questions: sanitizedQuestions,
        createdBy: educatorId,
        totalQuestions: formData.questions.length,
        password: formData.password?.trim() ? formData.password.trim() : null,
        autoGrade: formData.autoGrade,
        shuffleQuestions: formData.shuffleQuestions,
        maxMarks: formData.maxMarks,
        maxAttempts: formData.maxAttempts,
        questionCount: formData.maxQuestions,
        openAt: formData.openAt
          ? new Date(formData.openAt).toISOString()
          : null,
        closeAt: formData.closeAt
          ? new Date(formData.closeAt).toISOString()
          : null,
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
        setTimeout(() => {
          router.push(
            `/educator/module/${moduleId}/assessment/${assessmentId}/quiz?educatorId=${educatorId}`
          );
        }, 1500);
      } else {
        setError(`Failed to save quiz: ${result.message}`);
      }
    } catch (err) {
      console.error("Error saving quiz:", err);
      setError(
        "Something went wrong. Please check your connection and try again."
      );
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

            {/* Structured Quick Stats */}
            <div className="hidden lg:block">
              <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-4 border border-gray-200">
                <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                  {/* Row 1: Questions and Marks */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-gray-600">
                      <BookOpen className="w-4 h-4 text-blue-600" />
                      <span className="font-medium">Questions:</span>
                    </div>
                    <span className="font-bold text-gray-900">
                      {formData.maxQuestions &&
                      formData.maxQuestions !== formData.questions.length
                        ? `${formData.maxQuestions}/${formData.questions.length}`
                        : formData.questions.length}
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

                  {/* Row 2: Duration and Attempts */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Clock className="w-4 h-4 text-purple-600" />
                      <span className="font-medium">Duration:</span>
                    </div>
                    <span className="font-bold text-gray-900">
                      {formData.duration} min
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

                  {/* Row 3: Status Indicators */}
                  <div className="flex items-center justify-between">
                    {/* <div className="flex items-center space-x-2 text-gray-600">
                      <Settings className="w-4 h-4 text-gray-500" />
                      <span className="font-medium">Settings:</span>
                    </div> */}
                    <div className="flex items-center space-x-3">
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
                      {formData.password && formData.password.trim() && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                          <Lock className="w-3 h-3 mr-1" />
                          Protected
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Row 4: Time Window (if exists) */}
                  {(formData.openAt ||
                    formData.closeAt ||
                    formData.deadline) && (
                    <div className="col-span-2">
                       <span className="text-gray-700">
                    {(() => {
                      const dateOpts: Intl.DateTimeFormatOptions = {
                        year: "numeric",
                        month: "short",
                        day: "2-digit",
                      };
                      const timeOpts: Intl.DateTimeFormatOptions = {
                        hour: "2-digit",
                        minute: "2-digit",
                      };

                      const hasOpen = !!formData.openAt;
                      const hasClose = !!formData.closeAt;
                      const hasDeadline = !!formData.deadline;

                      const openD = hasOpen ? new Date(formData.openAt!) : null;
                      const closeD = hasClose
                        ? new Date(formData.closeAt!)
                        : null;
                      const deadlineD = hasDeadline
                        ? new Date(formData.deadline!)
                        : null;

                      const sameDay =
                        hasOpen &&
                        hasClose &&
                        openD!.toDateString() === closeD!.toDateString();

                      const parts: string[] = [];

                      if (hasOpen && hasClose) {
                        if (sameDay) {
                          parts.push(
                            `Opens at ${openD!.toLocaleTimeString(
                              [],
                              timeOpts
                            )} and closes at ${closeD!.toLocaleTimeString(
                              [],
                              timeOpts
                            )} on ${openD!.toLocaleDateString([], dateOpts)}`
                          );
                        } else {
                          parts.push(
                            `Opens at ${openD!.toLocaleTimeString(
                              [],
                              timeOpts
                            )} on ${openD!.toLocaleDateString(
                              [],
                              dateOpts
                            )} and closes at ${closeD!.toLocaleTimeString(
                              [],
                              timeOpts
                            )} on ${closeD!.toLocaleDateString([], dateOpts)}`
                          );
                        }
                      } else if (hasOpen) {
                        parts.push(
                          `Opens at ${openD!.toLocaleTimeString(
                            [],
                            timeOpts
                          )} on ${openD!.toLocaleDateString([], dateOpts)}`
                        );
                      } else if (hasClose) {
                        parts.push(
                          `Closes at ${closeD!.toLocaleTimeString(
                            [],
                            timeOpts
                          )} on ${closeD!.toLocaleDateString([], dateOpts)}`
                        );
                      }

                      // if (hasDeadline) {
                      //   parts.push(
                      //     `Deadline: ${deadlineD!.toLocaleDateString(
                      //       [],
                      //       dateOpts
                      //     )}`
                      //   );
                      // }

                      return parts.join(" · ") + ".";
                    })()}
                  </span>

                      </div>)}
                 
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
                      {formData.maxQuestions &&
                      formData.maxQuestions !== formData.questions.length
                        ? `${formData.maxQuestions}/${formData.questions.length}`
                        : formData.questions.length}
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
        {/* Status Messages */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-red-800">Validation Error</h4>
              <p className="text-red-700 text-sm mt-1">{error}</p>
            </div>
          </div>
        )}

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
                  Recommended: 1-2 minutes per question
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
              {/* 
              <div className="lg:col-span-2">
                <label className="block text-sm font-semibold text-gray-800 mb-3">
                  <Award className="w-4 h-4 inline mr-2 text-gray-600" />
                  Total Marks
                </label>
                <div className="px-4 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl text-blue-800 font-bold text-lg">
                  {calculateTotalMarks()} marks
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Automatically calculated from questions
                </p>
              </div> */}
            </div>

            {/* Instructions Section */}
            <div className="mt-8">
              <div className="mb-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-800">
                    Quiz Instructions
                  </label>
                  <p className="text-xs text-gray-500 mt-1">
                    Add instructions to guide students during the quiz
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
                      {formData.instructions.length > 1 && (
                        <Button
                          onClick={() => removeInstruction(index)}
                          variant="outline"
                          size="sm"
                          className="text-red-600 border-red-300 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity mt-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>

                {/* Plus button positioned at bottom right */}
                <div className="flex justify-end mt-4">
                  <Button
                    onClick={addInstruction}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2 text-blue-600 border-blue-300 bg-indigo-50 hover:bg-indigo-100"
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
              {/* Auto Grading and Shuffle Questions Toggles */}
              <div className="lg:col-span-2 grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Auto Grading Toggle */}
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        Auto Grading
                      </h3>
                      <p className="text-sm text-gray-600">
                        Automatically grade and show results after quiz
                      </p>
                    </div>
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
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                  </label>
                </div>

                {/* Shuffle Questions Toggle */}
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Shuffle className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        Shuffle Questions
                      </h3>
                      <p className="text-sm text-gray-600">
                        Randomize the order of questions for each student
                      </p>
                    </div>
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
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
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

              {/* Max Questions */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-3">
                  <BookOpen className="w-4 h-4 inline mr-2 text-gray-600" />
                  Max Questions (Optional)
                </label>
                <input
                  type="number"
                  value={formData.maxQuestions || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      maxQuestions: e.target.value
                        ? parseInt(e.target.value)
                        : null,
                    }))
                  }
                  min="1"
                  max={formData.questions.length}
                  className="w-full px-4 py-3 text-gray-900 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 shadow-sm"
                  placeholder={`Max ${formData.questions.length}`}
                />
                <p className="text-xs text-gray-500 mt-2">
                  Leave empty to show all questions. System will randomly select
                  questions.
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

              {/* Password (Optional) */}
              <div>
                <PasswordInput
                  label=" Quiz Password (Optional)"
                  value={formData.password ?? ""}
                  onChange={(value) =>
                    setFormData((prev) => ({ ...prev, password: value }))
                  }
                  placeholder="Leave empty to allow access without a password"
                  required={false}
                  helperText="If set, students must enter this password to start the quiz. You can add or change it anytime."
                  className=""
                  id="quiz-password"
                />
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
                      • <strong>Max Questions:</strong> System will show only
                      this many questions per student
                    </li>
                    <li>
                      • <strong>Shuffle Questions:</strong> Each student will
                      see questions in different order
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
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-indigo-600" />
                  Quiz Questions ({formData.questions.length})
                </h2>
                <p className="text-gray-600 text-sm mt-1">
                  Create and manage your quiz questions
                </p>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="space-y-8">
              {formData.questions.map((question, questionIndex) => (
                <div
                  key={question.question_id}
                  className="border-2 border-gray-200 rounded-2xl overflow-hidden hover:border-blue-300 transition-colors"
                >
                  {/* Question Header */}
                  <div className="bg-gradient-to-r from-gray-50 to-blue-50 px-6 py-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl flex items-center justify-center font-bold text-lg">
                          {questionIndex + 1}
                        </div>
                        <div>
                          <select
                            value={question.type}
                            onChange={(e) =>
                              updateQuestion(
                                questionIndex,
                                "type",
                                e.target.value
                              )
                            }
                            className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                          >
                            <option value="MCQ">
                              Multiple Choice Question
                            </option>
                            <option value="SHORT">Short Answer Question</option>
                          </select>
                          <p className="text-xs text-gray-500 mt-1">
                            Choose the question type
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Marks
                          </label>
                          <input
                            type="number"
                            value={question.marks_allowed}
                            onChange={(e) =>
                              updateQuestion(
                                questionIndex,
                                "marks_allowed",
                                e.target.value
                              )
                            }
                            min="0.00"
                            step="0.5"
                            className="w-20 px-3 py-2 text-center bg-white border border-gray-300 rounded-lg font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                          />
                        </div>
                        <Button
                          onClick={() => removeQuestion(questionIndex)}
                          variant="outline"
                          size="sm"
                          className="text-red-600 border-red-300 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="p-6">
                    {/* Question Text */}
                    <div className="mb-6">
                      <label className="block text-sm font-semibold text-gray-800 mb-3">
                        Question Text <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        value={question.question}
                        onChange={(e) =>
                          updateQuestion(
                            questionIndex,
                            "question",
                            e.target.value
                          )
                        }
                        rows={3}
                        className="w-full px-4 py-3 text-gray-900 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 shadow-sm resize-none"
                        placeholder="Enter your question here. Be clear and specific..."
                      />
                    </div>

                    {/* MCQ Options */}
                    {question.type === "MCQ" && (
                      <div className="mb-6">
                        <label className="block text-sm font-semibold text-gray-800 mb-4">
                          Answer Options <span className="text-red-500">*</span>
                        </label>
                        <div className="space-y-4">
                          {question.mcq_answer_options.map(
                            (option, optionIndex) => (
                              <div
                                key={optionIndex}
                                className="flex items-center gap-4 group"
                              >
                                <div className="flex items-center">
                                  <input
                                    type="radio"
                                    name={`correct_answer_${questionIndex}`}
                                    checked={
                                      question.model_answer === option &&
                                      option.trim() !== ""
                                    }
                                    onChange={() =>
                                      updateQuestion(
                                        questionIndex,
                                        "model_answer",
                                        option
                                      )
                                    }
                                    className="w-5 h-5 text-green-600 focus:ring-green-500 focus:ring-2"
                                    disabled={option.trim() === ""}
                                  />
                                  <span className="ml-3 w-8 h-8 bg-blue-100 text-blue-700 rounded-lg flex items-center justify-center font-bold text-sm">
                                    {String.fromCharCode(65 + optionIndex)}
                                  </span>
                                </div>
                                <input
                                  type="text"
                                  value={option}
                                  onChange={(e) =>
                                    updateMCQOption(
                                      questionIndex,
                                      optionIndex,
                                      e.target.value
                                    )
                                  }
                                  className="flex-1 px-4 py-3 text-gray-900 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 shadow-sm"
                                  placeholder={`Enter option ${String.fromCharCode(
                                    65 + optionIndex
                                  )}...`}
                                />
                              </div>
                            )
                          )}
                        </div>
                        <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                          <p className="text-xs text-amber-800 flex items-center gap-2">
                            <AlertCircle className="w-4 h-4" />
                            Select the radio button next to the correct answer.
                            Students will see these options in random order.
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Short Answer Model Answer */}
                    {question.type === "SHORT" && (
                      <div className="mb-6">
                        <label className="block text-sm font-semibold text-gray-800 mb-3">
                          Model Answer <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          value={question.model_answer}
                          onChange={(e) =>
                            updateQuestion(
                              questionIndex,
                              "model_answer",
                              e.target.value
                            )
                          }
                          rows={3}
                          className="w-full px-4 py-3 text-gray-900 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 shadow-sm resize-none"
                          placeholder="Enter the expected answer or key points that should be included..."
                        />
                        <p className="text-xs text-gray-500 mt-2">
                          This will be used as a reference for manual grading.
                          Include key points or the exact answer expected.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {formData.questions.length === 0 && (
                <div className="text-center py-16">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <BookOpen className="w-10 h-10 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    No Questions Added Yet
                  </h3>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    Start building your quiz by adding your first question. You
                    can create multiple choice or short answer questions.
                  </p>
                  <Button
                    onClick={addQuestion}
                    className="flex items-center gap-2 mx-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                  >
                    <Plus className="w-5 h-5" />
                    Add Your First Question
                  </Button>
                </div>
              )}
            </div>

            {/* Add Question Button - Bottom Right */}
            {formData.questions.length > 0 && (
              <div className="flex justify-end mt-6">
                <Button
                  onClick={addQuestion}
                  className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                >
                  <Plus className="w-4 h-4" />
                  Add Question
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
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

              {formData.maxQuestions && (
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-orange-200 rounded-xl flex items-center justify-center">
                    <Target className="w-6 h-6 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Shown Questions
                    </p>
                    <p className="text-2xl font-bold text-orange-600">
                      {formData.maxQuestions}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-4">
              <Button
                onClick={handleGoBack}
                variant="outline"
                className="px-6 py-3 border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={saving}
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
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
