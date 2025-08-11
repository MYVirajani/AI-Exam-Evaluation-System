"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import Button from "@/components/Button";
import toast from "react-hot-toast";

interface Question {
  question_id: string;
  type: "MCQ" | "SHORT";
  question_number: string;
  question: string;
  mcq_answer_options: string[];
  marks_allowed: number;
}

interface QuizData {
  assessmentId: string;
  title: string;
  duration: number | null;
  module_code: string;
  module_name: string;
  started_at: string;
  questions: Question[];
}

const ONE_SEC = 1000;

function formatRemaining(ms: number): string {
  if (ms <= 0) return "00:00";
  const totalSec = Math.floor(ms / 1000);
  const hrs = Math.floor(totalSec / 3600);
  const mins = Math.floor((totalSec % 3600) / 60);
  const secs = totalSec % 60;

  const pad = (n: number) => n.toString().padStart(2, "0");
  return hrs > 0 ? `${pad(hrs)}:${pad(mins)}:${pad(secs)}` : `${pad(mins)}:${pad(secs)}`;
}

const QuizAttemptPage = () => {
  const router = useRouter();
  const { assessmentId } = useParams();
  const searchParams = useSearchParams();

  const studentId = searchParams.get("studentId");
  const moduleId = searchParams.get("moduleId");
  const submissionId = searchParams.get("submissionId");

  const [quizData, setQuizData] = useState<QuizData | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  // countdown
  const [now, setNow] = useState<number>(Date.now());
  const submitLockRef = useRef(false);

  useEffect(() => {
    const fetchQuiz = async () => {
      if (!assessmentId || !submissionId) {
        toast.error("Missing assessment or submission ID");
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(
          `/api/student/quiz/${assessmentId}/questions?submissionId=${submissionId}`
        );
        const data: QuizData = await res.json();
        if (!res.ok) throw new Error((data as any).message || "Failed to load quiz");
        setQuizData(data);
      } catch (error: any) {
        toast.error(error.message || "Failed to load quiz");
      } finally {
        setLoading(false);
      }
    };
    fetchQuiz();
  }, [assessmentId, submissionId]);

  // compute deadline/end timestamp (ms since epoch)
  const endAtMs = useMemo(() => {
    if (!quizData || !quizData.duration || quizData.duration <= 0) return null;
    const start = new Date(quizData.started_at).getTime(); // absolute instant from server
    return start + quizData.duration * 60 * 1000;
  }, [quizData]);

  // tick timer every second
  useEffect(() => {
    if (!endAtMs) return; // no timer if no duration
    const t = setInterval(() => setNow(Date.now()), ONE_SEC);
    return () => clearInterval(t);
  }, [endAtMs]);

  const remainingMs = useMemo(() => {
    if (!endAtMs) return null;
    return Math.max(0, endAtMs - now);
  }, [endAtMs, now]);

  const progressPercent = useMemo(() => {
    if (!quizData || !endAtMs) return null;
    const startMs = new Date(quizData.started_at).getTime();
    const totalMs = endAtMs - startMs;
    const elapsed = Math.min(totalMs, Math.max(0, now - startMs));
    return Math.min(100, Math.max(0, (elapsed / totalMs) * 100));
  }, [quizData, endAtMs, now]);

  // === auto-submit when time hits zero ===
  useEffect(() => {
    if (remainingMs === 0 && !submitLockRef.current) {
      submitLockRef.current = true;
      toast("Time is up! Submitting your quiz…");
      // allow the toast to render
      setTimeout(() => {
        handleSubmit(true).catch(() => {
          /* prevent multiple attempts even on failure */
        });
      }, 300);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remainingMs]);

  const handleAnswerChange = (questionId: string, answer: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }));
  };

  /**
   * Auto-save ONLY if there's a marked/typed answer.
   * - For MCQ: a selected option (non-empty string)
   * - For SHORT: non-empty non-whitespace
   */
  const autoSave = async (questionId: string, answer: string) => {
    if (!submissionId) return;

    // skip empty/whitespace answers
    if (typeof answer !== "string") return;
    if (answer.trim().length === 0) return;

    try {
      await fetch("/api/student/quiz/auto-save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ submissionId, questionId, studentAnswer: answer }),
      });
    } catch (e) {
      // non-blocking; do not block submit
      console.error("Auto-save failed:", e);
    }
  };

  const handleNext = async () => {
    const currentQuestion = quizData?.questions[currentIndex];
    if (!currentQuestion) return;
    await autoSave(currentQuestion.question_id, answers[currentQuestion.question_id] || "");
    if (currentIndex < (quizData?.questions.length || 0) - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrevious = async () => {
    const currentQuestion = quizData?.questions[currentIndex];
    if (!currentQuestion) return;
    await autoSave(currentQuestion.question_id, answers[currentQuestion.question_id] || "");
    if (currentIndex > 0) setCurrentIndex((prev) => prev - 1);
  };

  /**
   * handleSubmit
   * - If isAuto === true (time up): first await autoSave for the *current* question
   *   but only if it has a marked answer (autoSave skips empty).
   * - Then submit all collected answers (only those the student interacted with).
   */
  const handleSubmit = async (isAuto = false) => {
    if (!studentId || !submissionId || !quizData) {
      toast.error("Missing student or submission ID");
      return;
    }
    if (submitLockRef.current) return;
    submitLockRef.current = true;

    // 1) Try autosaving the *current* answer first, but only if it's actually filled
    const currentQuestion = quizData.questions[currentIndex];
    if (currentQuestion) {
      const latestAnswer = answers[currentQuestion.question_id] || "";
      await autoSave(currentQuestion.question_id, latestAnswer);
    }

    try {
      // 2) Submit all answers we have (keys present in state)
      const formattedAnswers = Object.entries(answers)
        .filter(([, v]) => typeof v === "string") // sanity
        .map(([question_id, student_answer]) => ({ question_id, student_answer }));

      const res = await fetch(`/api/student/quiz/${assessmentId}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ submissionId, studentId, answers: formattedAnswers }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Submission failed");

      toast.success(isAuto ? "Submitted automatically. Time up!" : "Quiz submitted successfully!");
      // 3) Navigate to results/summary page
      router.push(
        `/student/quiz/${assessmentId}?studentId=${studentId}&moduleId=${moduleId}`
      );
    } catch (error: any) {
      toast.error(error.message || "Failed to submit quiz");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
          <p className="text-lg font-medium text-slate-600">Loading quiz...</p>
        </div>
      </div>
    );
  }

  if (!quizData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center space-y-4 p-8">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-slate-700">Quiz not found</h2>
          <p className="text-slate-500">The quiz you're looking for doesn't exist or has been removed.</p>
        </div>
      </div>
    );
  }

  const currentQuestion = quizData.questions[currentIndex];
  const timeLimited = !!endAtMs;
  const answered = Object.keys(answers).length;
  const totalQuestions = quizData.questions.length;
  const questionProgress = ((currentIndex + 1) / totalQuestions) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Fixed Header */}
      <div className="bg-white/80 backdrop-blur-md shadow-sm border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Quiz Info */}
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-slate-800 leading-tight">{quizData.title}</h1>
              <div className="flex items-center gap-4 mt-1">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {quizData.module_code}
                </span>
                <span className="text-sm text-slate-600">{quizData.module_name}</span>
              </div>
            </div>

            {/* Timer Card */}
            {timeLimited && (
              <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-4 min-w-[200px]">
                <div className="text-center">
                  <div className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">
                    Time Remaining
                  </div>
                  <div
                    className={`font-mono text-2xl font-bold ${
                      (remainingMs ?? 0) <= 60_000 
                        ? "text-red-500" 
                        : (remainingMs ?? 0) <= 300_000 
                        ? "text-amber-500" 
                        : "text-slate-700"
                    }`}
                    aria-live="polite"
                  >
                    {formatRemaining(remainingMs ?? 0)}
                  </div>
                  {(remainingMs ?? 0) <= 60_000 && (
                    <div className="text-xs text-red-500 font-medium mt-1 animate-pulse">
                      ⚠ Final minute!
                    </div>
                  )}
                </div>
              </div>
            )}

            {!timeLimited && (
              <div className="bg-green-50 rounded-xl border border-green-200 p-4">
                <div className="text-center">
                  <div className="text-xs font-medium text-green-600 uppercase tracking-wide">
                    No Time Limit
                  </div>
                  <div className="text-sm text-green-700 mt-1">Take your time</div>
                </div>
              </div>
            )}
          </div>

          {/* Progress Bars */}
          <div className="mt-4 space-y-3">
            {/* Question Progress */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-slate-600">
                  Question {currentIndex + 1} of {totalQuestions}
                </span>
                <span className="text-sm text-slate-500">
                  {answered} answered
                </span>
              </div>
              <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-300 ease-out"
                  style={{ width: `${questionProgress}%` }}
                />
              </div>
            </div>

            {/* Time Progress */}
            {timeLimited && (
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs text-slate-500">
                    Started: {new Date(quizData.started_at).toLocaleTimeString()}
                  </span>
                  <span className="text-xs text-slate-500">
                    Ends: {new Date(endAtMs!).toLocaleTimeString()}
                  </span>
                </div>
                <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-1000 ease-linear ${
                      (remainingMs ?? 0) <= 60_000 
                        ? "bg-gradient-to-r from-red-400 to-red-500" 
                        : (remainingMs ?? 0) <= 300_000 
                        ? "bg-gradient-to-r from-amber-400 to-amber-500"
                        : "bg-gradient-to-r from-green-400 to-green-500"
                    }`}
                    style={{ width: `${100 - (progressPercent ?? 0)}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Question Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
          {/* Question Header */}
          <div className="bg-gradient-to-r from-slate-50 to-blue-50 px-8 py-6 border-b border-slate-200">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-700 text-sm font-semibold">
                    {currentIndex + 1}
                  </span>
                  <span className="text-sm font-medium text-slate-500">
                    Question {currentQuestion.question_number}
                  </span>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                    {currentQuestion.marks_allowed} {currentQuestion.marks_allowed === 1 ? 'mark' : 'marks'}
                  </span>
                </div>
                <h2 className="text-xl font-semibold text-slate-800 leading-relaxed">
                  {currentQuestion.question}
                </h2>
              </div>
              
              <div className="ml-4">
                <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium ${
                  currentQuestion.type === 'MCQ' 
                    ? 'bg-purple-100 text-purple-700' 
                    : 'bg-emerald-100 text-emerald-700'
                }`}>
                  {currentQuestion.type === 'MCQ' ? 'Multiple Choice' : 'Short Answer'}
                </span>
              </div>
            </div>
          </div>

          {/* Answer Section */}
          <div className="p-8">
            {currentQuestion.type === "MCQ" ? (
              <div className="space-y-3">
                {(currentQuestion.mcq_answer_options || []).map((option, idx) => {
                  const isSelected = answers[currentQuestion.question_id] === option;
                  return (
                    <label 
                      key={idx} 
                      className={`flex items-start p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:shadow-md ${
                        isSelected
                          ? 'border-blue-300 bg-blue-50 shadow-sm'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name={`question-${currentQuestion.question_id}`}
                        value={option}
                        checked={isSelected}
                        onChange={() =>
                          handleAnswerChange(currentQuestion.question_id, option)
                        }
                        className="w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500 focus:ring-2 mt-1"
                      />
                      <span className={`ml-3 text-base leading-relaxed ${
                        isSelected ? 'text-blue-900 font-medium' : 'text-slate-700'
                      }`}>
                        {option}
                      </span>
                    </label>
                  );
                })}
              </div>
            ) : (
              <div>
                <textarea
                  rows={8}
                  className="w-full border-2 border-slate-200 rounded-xl p-4 text-slate-700 text-base leading-relaxed placeholder-slate-400 focus:border-blue-300 focus:ring-4 focus:ring-blue-100 focus:outline-none transition-all duration-200 resize-none"
                  placeholder="Type your answer here... Take your time to provide a detailed response."
                  value={answers[currentQuestion.question_id] || ""}
                  onChange={(e) =>
                    handleAnswerChange(currentQuestion.question_id, e.target.value)
                  }
                />
                <div className="flex justify-between items-center mt-2 text-xs text-slate-500">
                  <span>Your answer will be auto-saved as you type</span>
                  <span>
                    {(answers[currentQuestion.question_id] || "").length} characters
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8">
          <Button 
            variant="outline" 
            disabled={currentIndex === 0} 
            onClick={handlePrevious}
            className="flex items-center gap-2 px-6 py-3"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Previous
          </Button>

          <div className="flex items-center gap-4">
            {/* Answer Status Indicator */}
            <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-slate-200">
              <div className={`w-2 h-2 rounded-full ${
                answers[currentQuestion.question_id] 
                  ? 'bg-green-400' 
                  : 'bg-slate-300'
              }`} />
              <span className="text-sm text-slate-600">
                {answers[currentQuestion.question_id] ? 'Answered' : 'Not answered'}
              </span>
            </div>

            {currentIndex === quizData.questions.length - 1 ? (
              <Button
                variant="primary"
                onClick={() => handleSubmit(false)}
                disabled={timeLimited && (remainingMs ?? 0) <= 0}
                className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Submit Quiz
              </Button>
            ) : (
              <Button
                variant="primary"
                onClick={handleNext}
                disabled={timeLimited && (remainingMs ?? 0) <= 0}
                className="flex items-center gap-2 px-6 py-3"
              >
                Next
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Button>
            )}
          </div>
        </div>

        {/* Question Navigator */}
        <div className="mt-8 bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-sm font-medium text-slate-700 mb-4">Question Navigator</h3>
          <div className="grid grid-cols-10 sm:grid-cols-15 lg:grid-cols-20 gap-2">
            {quizData.questions.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`w-10 h-10 rounded-lg text-sm font-medium transition-all duration-200 ${
                  idx === currentIndex
                    ? 'bg-blue-600 text-white shadow-md'
                    : answers[quizData.questions[idx].question_id]
                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {idx + 1}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-6 mt-4 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-600 rounded"></div>
              <span>Current</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-100 rounded border border-green-200"></div>
              <span>Answered</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-slate-100 rounded border border-slate-200"></div>
              <span>Not answered</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizAttemptPage;