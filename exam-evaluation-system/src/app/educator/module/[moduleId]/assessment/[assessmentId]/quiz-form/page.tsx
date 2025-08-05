"use client";

import React, { useEffect, useState, useRef } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import Button from "@/components/Button";
import QuizForm from "@/components/QuizForm";
import AutoResizeTextarea from "@/components/AutoResizeTextarea";
import PasswordInput from "@/components/PasswordInput";
import Dropdown from "@/components/ui/Dropdown";
import {
  FiBook,
  FiClock,
  FiFileText,
  FiSave,
  FiX,
  FiCheckCircle,
  FiInfo,
  FiCalendar,
  FiList,
  FiHash,
  FiShuffle,
} from "react-icons/fi";

interface Question {
  id: string;
  questionType: "MCQ" | "SHORT";
  questionText: string;
  options: string[];
  correctAnswerIndex: number;
  marks: number;
  expectedAnswer?: string;
}

const shuffleOptions = [
  { label: "Shuffle questions for each student", value: "true" },
  { label: "Keep questions in same order", value: "false" },
];

export default function QuizBuilderPage() {
  const { moduleId, assessmentId } = useParams();
  const searchParams = useSearchParams();
  const educatorId = searchParams.get("educatorId");

  const router = useRouter();

  // Assessment metadata state
  const [title, setTitle] = useState("");
  const [duration, setDuration] = useState("");
  const [description, setDescription] = useState("");
  const [instructions, setInstructions] = useState("");
  const [deadline, setDeadline] = useState("");
  const [password, setPassword] = useState("");
  const [shuffleQuestions, setShuffleQuestions] = useState(true);

  // Other states
  const [totalMarks, setTotalMarks] = useState("");
  const [questions, setQuestions] = useState<Question[]>([
    {
      id: Date.now().toString(),
      questionType: "MCQ",
      questionText: "",
      options: ["", "", "", ""],
      correctAnswerIndex: 0,
      marks: 0.5,
    },
  ]);
  const [moduleCode, setModuleCode] = useState("");
  const [moduleName, setModuleName] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  // Refs for textareas
  const descriptionRef = useRef<HTMLTextAreaElement>(null);
  const instructionsRef = useRef<HTMLTextAreaElement>(null);

  // Instructions formatting functions
  const addBulletPoints = () => {
    const textarea = document.getElementById(
      "instructions"
    ) as HTMLTextAreaElement;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = instructions.substring(start, end);

    if (selectedText) {
      // Add bullets to selected lines
      const bulletedText = selectedText
        .split("\n")
        .map((line) =>
          line.trim() ? `• ${line.replace(/^[•\-\*]\s*/, "")}` : line
        )
        .join("\n");

      const newInstructions =
        instructions.substring(0, start) +
        bulletedText +
        instructions.substring(end);
      setInstructions(newInstructions);
    } else {
      // Add bullet to current line or new line
      const lines = instructions.split("\n");
      const currentLineIndex =
        instructions.substring(0, start).split("\n").length - 1;
      const currentLine = lines[currentLineIndex] || "";

      if (currentLine.trim() === "") {
        lines[currentLineIndex] = "• ";
      } else if (!currentLine.trim().startsWith("•")) {
        lines[currentLineIndex] = `• ${currentLine.replace(/^[•\-\*]\s*/, "")}`;
      }

      setInstructions(lines.join("\n"));
    }
  };

  const addNumberedList = () => {
    const textarea = document.getElementById(
      "instructions"
    ) as HTMLTextAreaElement;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = instructions.substring(start, end);

    if (selectedText) {
      // Add numbers to selected lines
      const numberedText = selectedText
        .split("\n")
        .map((line, index) => {
          if (line.trim()) {
            return `${index + 1}. ${line
              .replace(/^\d+\.\s*/, "")
              .replace(/^[•\-\*]\s*/, "")}`;
          }
          return line;
        })
        .join("\n");

      const newInstructions =
        instructions.substring(0, start) +
        numberedText +
        instructions.substring(end);
      setInstructions(newInstructions);
    } else {
      // Add number to current line or new line
      const lines = instructions.split("\n");
      const currentLineIndex =
        instructions.substring(0, start).split("\n").length - 1;
      const currentLine = lines[currentLineIndex] || "";

      // Count existing numbered items to determine next number
      const numberedLines = lines.filter((line) =>
        /^\d+\.\s/.test(line.trim())
      );
      const nextNumber = numberedLines.length + 1;

      if (currentLine.trim() === "") {
        lines[currentLineIndex] = `${nextNumber}. `;
      } else if (!/^\d+\.\s/.test(currentLine.trim())) {
        lines[currentLineIndex] = `${nextNumber}. ${currentLine
          .replace(/^\d+\.\s*/, "")
          .replace(/^[•\-\*]\s*/, "")}`;
      }

      setInstructions(lines.join("\n"));
    }
  };

  const clearFormatting = () => {
    const cleanInstructions = instructions
      .split("\n")
      .map((line) => line.replace(/^[•\-\*]\s*/, "").replace(/^\d+\.\s*/, ""))
      .join("\n");
    setInstructions(cleanInstructions);
  };

  useEffect(() => {
    async function fetchAssessment() {
      if (!moduleId || !assessmentId || !educatorId) return;

      try {
        setLoading(true);
        const res = await fetch(
          `/api/educator/module/${moduleId}/assessment/${assessmentId}?educatorId=${educatorId}`
        );
        const data = await res.json();

        if (data.success === false) {
          toast.error("Failed to load assessment data");
          return;
        }

        const assessment = data.assessments[0];

        // Populate form fields with existing data
        setTitle(assessment.title || "");
        setDuration(assessment.duration?.toString() || "");
        setDescription(assessment.description || "");
        setInstructions(
          Array.isArray(assessment.instructions)
            ? assessment.instructions.join("\n")
            : assessment.instructions || ""
        );

        // Format deadline for datetime-local input
        if (assessment.deadline) {
          const deadlineDate = new Date(assessment.deadline);
          const formattedDeadline = deadlineDate.toISOString().slice(0, 16);
          setDeadline(formattedDeadline);
        }

        // Set password and shuffle settings if available
        setPassword(assessment.password || "");
        setShuffleQuestions(assessment.shuffle_questions ?? true);

        // Set module info
        if (data.moduleData) {
          setModuleCode(data.moduleData.module_code || "");
          setModuleName(data.moduleData.module_name || "");
        }

        // Set questions if available
        if (assessment.questions && assessment.questions.length > 0) {
          const questionsWithIds = assessment.questions.map(
            (q: any, index: number) => ({
              ...q,
              id: `${Date.now()}-${index}`,
            })
          );
          setQuestions(questionsWithIds);
        }

        // toast.success("Assessment data loaded successfully");
      } catch (err) {
        console.error("Failed to load assessment data:", err);
        toast.error("Failed to load assessment data. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    fetchAssessment();
  }, [moduleId, assessmentId, educatorId]);

  const calculateTotalMarks = () => {
    return questions.reduce((total, q) => total + (q.marks || 0), 0).toFixed(1);
  };

  const handleSubmit = async () => {
    if (!moduleId || !assessmentId || !educatorId) {
      toast.error("Missing required identifiers");
      return;
    }

    // Validation with improved toast messages
    if (!title.trim()) {
      toast.error("Please enter a title for the assessment", {
        icon: "📝",
      });
      return;
    }

    if (!duration || parseInt(duration) <= 0) {
      toast.error("Please enter a valid duration", {
        icon: "⏰",
      });
      return;
    }

    if (!deadline) {
      toast.error("Please select a deadline", {
        icon: "📅",
      });
      return;
    }

    if (!password.trim()) {
      toast.error("Please enter a password for the assessment", {
        icon: "🔒",
      });
      return;
    }

    // Show loading toast
    const loadingToast = toast.loading("Saving assessment...");
    setIsSaving(true);
    
    // Transform questions to match database schema
    const sanitizedQuestions = questions.map(({ id, ...rest }) => {
      return {
        ...rest,
        // Map questionType to the correct database enum values
        questionType: rest.questionType === "MCQ" ? "MCQ" : "SHORT"
      };
    });

    const totalQuestions = questions.length;

    const quiz = {
      moduleId,
      type: "quiz",
      assessmentId,
      title: title.trim(),
      duration: parseInt(duration, 10),
      description: description.trim(),
      instructions: instructions
        .trim()
        .split("\n")
        .filter((line) => line.trim() !== ""),
      deadline: new Date(deadline).toISOString(),
      questions: sanitizedQuestions,
      createdBy: educatorId,
      totalQuestions,
      password: password.trim(),
      shuffleQuestions,
    };

    try {
      const res = await fetch("/api/educator/assessment/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(quiz),
      });

      const result = await res.json();
      
      // Dismiss loading toast
      toast.dismiss(loadingToast);

      if (result.success) {
        toast.success("Assessment saved successfully!", {
          duration: 4000,
        });
        
        // Small delay before navigation to show success message
        setTimeout(() => {
          router.push(`/educator/module/${moduleId}/assessment/${assessmentId}/quiz?educatorId=${educatorId}`);
        }, 1000);
      } else {
        toast.error(`Failed to save assessment: ${result.message}`, {
          duration: 5000,
        });
      }
    } catch (err) {
      console.error("Error submitting quiz:", err);
      toast.dismiss(loadingToast);
      toast.error("Something went wrong. Please check your connection and try again.", {
        icon: "⚠️",
        duration: 5000,
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full mx-4">
          <div className="flex items-center justify-center space-x-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="text-lg font-medium text-gray-700">
              Loading assessment...
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-100 rounded-xl">
                <FiFileText className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Assessment Builder
                </h1>
                <p className="text-gray-600 mt-1">
                  Create and manage quiz assessments
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                onClick={() => router.back()}
                className="flex items-center space-x-2"
                disabled={isSaving}
              >
                <FiX className="h-4 w-4" />
                <span>Cancel</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Module Information Card */}
        {moduleCode && moduleName && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FiBook className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-gray-600 mt-1">
                  <span className="text-lg font-semibold text-blue-600">
                    {moduleCode} — {moduleName}
                  </span>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Assessment Metadata Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8">
          <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-green-50 to-blue-50">
            <div className="flex items-center space-x-3">
              <FiInfo className="h-6 w-6 text-green-600" />
              <div>
                <h3 className="text-xl font-semibold text-gray-900">
                  Assessment Details
                </h3>
                <p className="text-gray-600">
                  Configure basic assessment information
                </p>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Title */}
              <div className="lg:col-span-2">
                <label
                  htmlFor="title"
                  className="block text-sm font-semibold text-gray-800 mb-2"
                >
                  Assessment Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter assessment title"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-gray-900 bg-white"
                  required
                />
              </div>

              {/* Duration */}
              <div>
                <label
                  htmlFor="duration"
                  className="block text-sm font-semibold text-gray-800 mb-2"
                >
                  <div className="flex items-center space-x-2">
                    <FiClock className="h-4 w-4 text-gray-600" />
                    <span>
                      Duration (minutes) <span className="text-red-500">*</span>
                    </span>
                  </div>
                </label>
                <input
                  type="number"
                  id="duration"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="60"
                  min="1"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-gray-900 bg-white"
                  required
                />
              </div>

              {/* Deadline */}
              <div>
                <label
                  htmlFor="deadline"
                  className="block text-sm font-semibold text-gray-800 mb-2"
                >
                  <div className="flex items-center space-x-2">
                    <FiCalendar className="h-4 w-4 text-gray-600" />
                    <span>
                      Scheduled At <span className="text-red-500">*</span>
                    </span>
                  </div>
                </label>
                <input
                  type="datetime-local"
                  id="deadline"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-gray-900 bg-white"
                  required
                />
              </div>

              {/* Description */}
              <div className="lg:col-span-2">
                <label
                  htmlFor="description"
                  className="block text-sm font-semibold text-gray-800 mb-2"
                >
                  Description
                </label>
                <AutoResizeTextarea
                  ref={descriptionRef}
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter assessment description..."
                  minHeight={80}
                />
              </div>

              {/* Instructions */}
              <div className="lg:col-span-2">
                <label
                  htmlFor="instructions"
                  className="block text-sm font-semibold text-gray-800 mb-2"
                >
                  Instructions
                  <span className="text-gray-600 text-xs ml-2 font-normal">
                    (Each line will be a separate instruction)
                  </span>
                </label>

                {/* Formatting Toolbar */}
                <div className="flex items-center space-x-2 mb-3 p-3 bg-gray-50 rounded-lg border">
                  <span className="text-sm font-semibold text-gray-700">
                    Format:
                  </span>
                  <button
                    type="button"
                    onClick={addBulletPoints}
                    className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 hover:text-gray-900 transition-colors shadow-sm"
                    title="Add bullet points"
                  >
                    <FiList className="h-4 w-4" />
                    <span>• Bullets</span>
                  </button>
                  <button
                    type="button"
                    onClick={addNumberedList}
                    className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 hover:text-gray-900 transition-colors shadow-sm"
                    title="Add numbered list"
                  >
                    <FiHash className="h-4 w-4" />
                    <span>1. Numbers</span>
                  </button>
                  <button
                    type="button"
                    onClick={clearFormatting}
                    className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-red-600 bg-white border border-gray-300 rounded-md hover:bg-red-50 hover:text-red-700 transition-colors shadow-sm"
                    title="Clear formatting"
                  >
                    <FiX className="h-4 w-4" />
                    <span>Clear</span>
                  </button>
                </div>

                <AutoResizeTextarea
                  ref={instructionsRef}
                  id="instructions"
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  placeholder="Enter instructions (one per line)&#10;• Read all questions carefully&#10;• Answer all questions&#10;• Submit before the deadline&#10;&#10;Or use numbered format:&#10;1. Read all questions carefully&#10;2. Answer all questions&#10;3. Submit before the deadline"
                  minHeight={80}
                />

                {/* Instructions Preview */}
                {instructions.trim() && (
                  <div className="mt-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm font-semibold text-blue-800 mb-3">
                      Preview:
                    </p>
                    <div className="space-y-2">
                      {instructions
                        .split("\n")
                        .filter((line) => line.trim())
                        .map((line, index) => (
                          <p
                            key={index}
                            className="text-sm text-blue-800 leading-relaxed"
                          >
                            {line}
                          </p>
                        ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Password Input Component */}
              <div>
                <PasswordInput
                  label="Assessment Password"
                  value={password}
                  onChange={setPassword}
                  placeholder="Enter assessment password"
                  required={true}
                  helperText="Students will need this password to access the assessment"
                  id="assessmentPassword"
                />
              </div>

              {/* Shuffle Questions */}
              <div>
                <Dropdown
                  label={
                    <div className="flex items-center space-x-2">
                      <FiShuffle className="h-4 w-4 text-gray-600" />
                      <span>Question Order</span>
                    </div>
                  }
                  options={shuffleOptions}
                  value={shuffleQuestions ? "true" : "false"}
                  onChange={(value) => setShuffleQuestions(value === "true")}
                  arrowPosition="right"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Shuffling helps prevent cheating by randomizing question order
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quiz Form Container */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Quiz Questions
            </h3>
            <p className="text-gray-600">
              Add and configure your assessment questions
            </p>
          </div>

          <div className="p-6">
            <QuizForm
              questions={questions}
              setQuestions={setQuestions}
              onSubmit={handleSubmit}
            />
          </div>
        </div>

        {/* Footer Stats & Actions */}
        <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-8">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <FiCheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Total Questions
                  </p>
                  <p className="text-2xl font-bold text-green-600">
                    {questions.length}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FiClock className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Total Marks
                  </p>
                  <p className="text-2xl font-bold text-blue-600">
                    {calculateTotalMarks()}
                  </p>
                </div>
              </div>

              {duration && (
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <FiClock className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Duration
                    </p>
                    <p className="text-2xl font-bold text-purple-600">
                      {duration}m
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                onClick={() => router.back()}
                className="flex items-center space-x-2"
                disabled={isSaving}
              >
                <FiX className="h-4 w-4" />
                <span>Cancel</span>
              </Button>
              <Button
                onClick={handleSubmit}
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 px-8"
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Saving Quiz...</span>
                  </>
                ) : (
                  <>
                    <FiSave className="h-4 w-4" />
                    <span>Save Quiz</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}