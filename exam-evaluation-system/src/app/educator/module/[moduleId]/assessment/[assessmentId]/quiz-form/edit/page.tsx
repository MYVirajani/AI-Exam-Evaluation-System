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
  Hash,
  FileText,
  HelpCircle,
} from "lucide-react";
import Button from "@/components/Button";
import Dropdown from "@/components/Dropdown";
import PasswordInput from "@/components/PasswordInput";

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
  duration?: number;
  total_marks?: number;
  instructions?: string[];
  questions?: Question[];
  submissions: any[];
  module: {
    module_code: string;
    module_name: string;
  };
  enrollmentCount: number;
}

interface QuizFormData {
  title: string;
  description: string;
  duration: number;
  instructions: string[];
  questions: Question[];
  password: string;
}

export default function EditQuizFormPage() {
  const searchParams = useSearchParams();
  const params = useParams();
  const router = useRouter();

  const moduleId = params.moduleId as string;
  const assessmentId = params.assessmentId as string;
  const educatorId = searchParams.get("educatorId");

  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const [formData, setFormData] = useState<QuizFormData>({
    title: "",
    description: "",
    duration: 60,
    instructions: [""],
    questions: [],
    password: "",
  });

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

        if (!data || !data.assessments || data.assessments.length === 0) {
          throw new Error("Assessment not found");
        }

        const enrichedAssessment = {
          ...data.assessments[0],
          module: data.moduleData,
          enrollmentCount: data.enrollmentCount,
        };

        setAssessment(enrichedAssessment);

        // Populate form data
        setFormData({
          title: enrichedAssessment.title || "",
          description: enrichedAssessment.description || "",
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
          password: enrichedAssessment.password || "",
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
    return formData.questions.reduce((total, q) => {
      const marks = parseFloat(q.marks_allowed || "0");
      return total + (isNaN(marks) ? 0 : marks);
    }, 0);
  };

  const validateForm = () => {
    if (!formData.title.trim()) return "Title is required";
    if (!formData.password.trim()) return "Password is required";
    if (formData.questions.length === 0)
      return "At least one question is required";

    for (let i = 0; i < formData.questions.length; i++) {
      const q = formData.questions[i];
      if (!q.question.trim()) return `Question ${i + 1} text is required`;

      const marks = parseFloat(q.marks_allowed || "0");
      if (isNaN(marks) || marks < 0)
        return `Question ${i + 1} must have valid marks (≥ 0)`;

      if (q.type === "MCQ") {
        const validOptions = q.mcq_answer_options.filter((opt) => opt.trim());
        if (validOptions.length < 2)
          return `Question ${i + 1} must have at least 2 options`;
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
        deadline: assessment?.deadline || new Date().toISOString(), // Use existing deadline or current time
        questions: sanitizedQuestions,
        createdBy: educatorId,
        totalQuestions: formData.questions.length,
        password: formData.password.trim(),
        shuffleQuestions: assessment?.shuffle_questions ?? true, // Use existing shuffle setting or default
      };

      const res = await fetch("/api/educator/assessment/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(quiz),
      });

      const result = await res.json();

      if (result.success) {
        setSaveMessage("Quiz saved successfully!");
        setTimeout(() => {
          router.push(
            `/educator/module/${moduleId}/assessment/${assessmentId}?educatorId=${educatorId}`
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow-lg border border-slate-200">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600 font-medium">
            Loading quiz data...
          </p>
        </div>
      </div>
    );
  }

  if (error && !assessment) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow-lg border border-red-200">
          <div className="text-red-600 text-center">
            <AlertCircle className="w-12 h-12 mx-auto mb-4" />
            <h2 className="text-lg font-semibold mb-2">Error</h2>
            <p className="text-slate-600 mb-6">{error}</p>
            <Button
              onClick={handleGoBack}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Go Back
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <Button
              onClick={handleGoBack}
              variant="outline"
              className="flex items-center gap-2 bg-white border-slate-300 hover:bg-slate-50 shadow-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Quiz
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Edit Quiz</h1>
              <div className="flex items-center gap-2 mt-2">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                  {assessment?.module.module_code}
                </span>
                <span className="text-slate-600">•</span>
                <span className="text-slate-600 font-medium">
                  {assessment?.module.module_name}
                </span>
              </div>
            </div>
          </div>

          {/* Status Messages */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4 flex items-center gap-3 shadow-sm">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              <span className="text-red-700 font-medium">{error}</span>
            </div>
          )}

          {saveMessage && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4 flex items-center gap-3 shadow-sm">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
              <span className="text-green-700 font-medium">{saveMessage}</span>
            </div>
          )}
        </div>

        {/* Quiz Metadata Form */}
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Quiz Details</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-3">
                Quiz Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, title: e.target.value }))
                }
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white text-slate-900 placeholder-slate-400"
                placeholder="Enter quiz title"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-3">
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
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white text-slate-900 placeholder-slate-400 resize-none"
                placeholder="Enter quiz description (optional)"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-3">
                <Clock className="w-4 h-4" />
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
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white text-slate-900"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-3">
                <Hash className="w-4 h-4" />
                Total Marks
              </label>
              <div className="px-4 py-3 bg-slate-50 border border-slate-300 rounded-lg">
                <span className="text-slate-900 text-sm">
                  {calculateTotalMarks().toFixed(1)}
                </span>
                <span className="text-slate-900 text-sm ml-1">marks</span>
              </div>
            </div>

            {/* Quiz Password */}
            <div className="md:col-span-2">
              <PasswordInput
                label="Quiz Access Password"
                value={formData.password}
                onChange={(value) =>
                  setFormData((prev) => ({ ...prev, password: value }))
                }
                placeholder="Enter or generate a password for quiz access"
                required={true}
                helperText="Students will need this password to access the quiz. You can generate a secure password or create your own."
                className="w-full"
                id="quiz-password"
              />
            </div>
          </div>

          {/* Instructions */}
          <div className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                <HelpCircle className="w-4 h-4" />
                Instructions
              </label>
              <Button
                onClick={addInstruction}
                variant="outline"
                size="sm"
                className="flex items-center gap-2 bg-white border-slate-300 hover:bg-slate-50"
              >
                <Plus className="w-4 h-4" />
                Add Instruction
              </Button>
            </div>
            <div className="space-y-3">
              {formData.instructions.map((instruction, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full text-sm font-semibold flex-shrink-0">
                    {index + 1}
                  </div>
                  <input
                    type="text"
                    value={instruction}
                    onChange={(e) => updateInstruction(index, e.target.value)}
                    className="flex-1 px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white text-slate-900 placeholder-slate-400"
                    placeholder="Enter instruction"
                  />
                  {formData.instructions.length > 1 && (
                    <Button
                      onClick={() => removeInstruction(index)}
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-300"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Questions Form */}
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-8 mb-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <HelpCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">Questions</h2>
                <p className="text-slate-500 text-sm">
                  {formData.questions.length} question
                  {formData.questions.length !== 1 ? "s" : ""} added
                </p>
              </div>
            </div>
            <Button
              onClick={addQuestion}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 shadow-lg"
            >
              <Plus className="w-4 h-4" />
              Add Question
            </Button>
          </div>

          <div className="space-y-6">
            {formData.questions.map((question, questionIndex) => (
              <div
                key={question.question_id}
                className="border border-slate-200 rounded-xl p-6 bg-slate-50/50"
              >
                {/* Question Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-10 h-10 bg-blue-600 text-white rounded-full font-bold">
                      {questionIndex + 1}
                    </div>
                    <div className="w-48">
                      <Dropdown
                        options={["Multiple Choice", "Short Answer"]}
                        selectedOption={
                          question.type === "MCQ"
                            ? "Multiple Choice"
                            : "Short Answer"
                        }
                        onSelect={(option) => {
                          const type =
                            option === "Multiple Choice" ? "MCQ" : "SHORT";
                          updateQuestion(questionIndex, "type", type);
                        }}
                        className="text-sm"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <label className="text-sm font-medium text-slate-600">
                        Marks:
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
                        min="0"
                        step="0.1"
                        className="w-20 px-3 py-2 border border-slate-300 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-900"
                      />
                    </div>
                    <Button
                      onClick={() => removeQuestion(questionIndex)}
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-300"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Question Text */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-slate-700 mb-3">
                    Question Text <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={question.question}
                    onChange={(e) =>
                      updateQuestion(questionIndex, "question", e.target.value)
                    }
                    rows={3}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white text-slate-900 placeholder-slate-400 resize-none"
                    placeholder="Enter your question here"
                  />
                </div>

                {/* MCQ Options */}
                {question.type === "MCQ" && (
                  <div className="mb-6">
                    <label className="block text-sm font-semibold text-slate-700 mb-4">
                      Answer Options <span className="text-red-500">*</span>
                    </label>
                    <div className="space-y-3">
                      {question.mcq_answer_options.map(
                        (option, optionIndex) => (
                          <div
                            key={optionIndex}
                            className="flex items-center gap-4 p-3 bg-white rounded-lg border border-slate-200"
                          >
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
                              className="text-blue-600 focus:ring-blue-500 w-4 h-4"
                              disabled={option.trim() === ""}
                            />
                            <div className="flex items-center justify-center w-8 h-8 bg-slate-100 text-slate-700 rounded-full font-semibold text-sm">
                              {String.fromCharCode(65 + optionIndex)}
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
                              className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white text-slate-900 placeholder-slate-400"
                              placeholder={`Option ${String.fromCharCode(
                                65 + optionIndex
                              )}`}
                            />
                          </div>
                        )
                      )}
                    </div>
                    <div className="text-xs text-slate-500 mt-3 flex items-center gap-1">
                      <div className="w-3 h-3 border-2 border-blue-500 rounded-full flex-shrink-0"></div>
                      Select the radio button next to the correct answer
                    </div>
                  </div>
                )}

                {/* Short Answer Model Answer */}
                {question.type === "SHORT" && (
                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-slate-700 mb-3">
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
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white text-slate-900 placeholder-slate-400 resize-none"
                      placeholder="Enter the expected answer"
                    />
                  </div>
                )}
              </div>
            ))}

            {formData.questions.length === 0 && (
              <div className="text-center py-16 border-2 border-dashed border-slate-300 rounded-xl">
                <HelpCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-500 text-lg mb-6">
                  No questions added yet
                </p>
                <Button
                  onClick={addQuestion}
                  className="flex items-center gap-2 mx-auto bg-blue-600 hover:bg-blue-700 shadow-lg"
                >
                  <Plus className="w-4 h-4" />
                  Add Your First Question
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Save Button */}
        <div className="flex items-center justify-end gap-4">
          <Button
            onClick={handleGoBack}
            variant="outline"
            className="px-6 py-3 bg-white border-slate-300 hover:bg-slate-50"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 shadow-lg"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Quiz
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
