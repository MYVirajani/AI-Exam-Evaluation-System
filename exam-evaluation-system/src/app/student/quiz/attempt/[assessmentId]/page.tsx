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
  duration: number | null; // minutes; if null/0 => no time limit
  module_code: string;
  module_name: string;
  started_at: string; // ISO string
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
    const start = new Date(quizData.started_at).getTime(); // treat as absolute instant from server
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

  // auto-submit when time hits zero
  useEffect(() => {
    if (remainingMs === 0 && !submitLockRef.current) {
      submitLockRef.current = true;
      toast("Time is up! Submitting your quiz…");
      // small timeout to let the toast render
      setTimeout(() => {
        handleSubmit(true).catch(() => {
          // even if submit fails, don't allow multiple attempts
        });
      }, 300);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remainingMs]);

  const handleAnswerChange = (questionId: string, answer: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }));
  };

  const autoSave = async (questionId: string, answer: string) => {
    if (!submissionId) return;
    try {
      await fetch("/api/student/quiz/auto-save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ submissionId, questionId, studentAnswer: answer }),
      });
    } catch (e) {
      // non-blocking
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

  const handleSubmit = async (isAuto = false) => {
    if (!studentId || !submissionId || !quizData) {
      toast.error("Missing student or submission ID");
      return;
    }
    if (submitLockRef.current) return;
    submitLockRef.current = true;

    const currentQuestion = quizData.questions[currentIndex];
    if (currentQuestion) {
      const latestAnswer = answers[currentQuestion.question_id] || "";
      await autoSave(currentQuestion.question_id, latestAnswer);
    }

    try {
      const formattedAnswers = Object.entries(answers).map(
        ([question_id, student_answer]) => ({ question_id, student_answer })
      );

      const res = await fetch(`/api/student/quiz/${assessmentId}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ submissionId, studentId, answers: formattedAnswers }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Submission failed");

      toast.success(isAuto ? "Submitted automatically. Time up!" : "Quiz submitted successfully!");
      router.push(`/student/quiz/${assessmentId}?studentId=${studentId}&moduleId=${moduleId}`);
    } catch (error: any) {
      toast.error(error.message || "Failed to submit quiz");
    }
  };

  if (loading) return <div className="p-8 text-center">Loading quiz...</div>;
  if (!quizData) return <div className="p-8 text-center">Quiz not found.</div>;

  const currentQuestion = quizData.questions[currentIndex];
  const timeLimited = !!endAtMs;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 bg-white text-gray-900 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">{quizData.title}</h1>
            <p className="text-gray-700 text-base">
              {quizData.module_code} - {quizData.module_name}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Question {currentIndex + 1} of {quizData.questions.length}
            </p>
          </div>

          {/* Timer */}
          <div className="text-right">
            {timeLimited ? (
              <>
                <div className="text-xs text-gray-500">Time remaining</div>
                <div
                  className={`font-mono text-xl ${
                    (remainingMs ?? 0) <= 60_000 ? "text-red-600" : "text-gray-900"
                  }`}
                  aria-live="polite"
                >
                  {formatRemaining(remainingMs ?? 0)}
                </div>
              </>
            ) : (
              <div className="text-sm text-gray-500">No time limit</div>
            )}
          </div>
        </div>

        {/* Progress bar (only if time-limited) */}
        {timeLimited && (
          <div className="mt-4">
            <div className="h-2 w-full bg-gray-200 rounded">
              <div
                className="h-2 bg-blue-500 rounded"
                style={{ width: `${progressPercent ?? 0}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Started: {new Date(quizData.started_at).toLocaleString()}</span>
              <span>Ends: {new Date(endAtMs!).toLocaleString()}</span>
            </div>
          </div>
        )}
      </div>

      {/* Question */}
      <div className="bg-gray-50 shadow rounded-lg p-6 mb-6 border border-gray-200">
        <h2 className="font-semibold text-lg text-gray-800 mb-4">
          {currentQuestion.question_number}. {currentQuestion.question}
        </h2>

        {currentQuestion.type === "MCQ" ? (
          <div className="space-y-2 text-gray-700">
            {(currentQuestion.mcq_answer_options || []).map((option, idx) => (
              <label key={idx} className="block cursor-pointer">
                <input
                  type="radio"
                  name={`question-${currentQuestion.question_id}`}
                  value={option}
                  checked={answers[currentQuestion.question_id] === option}
                  onChange={() =>
                    handleAnswerChange(currentQuestion.question_id, option)
                  }
                  className="mr-2"
                />
                {option}
              </label>
            ))}
          </div>
        ) : (
          <textarea
            rows={6}
            className="w-full mt-2 border border-gray-300 rounded-md p-3 text-gray-900"
            placeholder="Type your answer here..."
            value={answers[currentQuestion.question_id] || ""}
            onChange={(e) =>
              handleAnswerChange(currentQuestion.question_id, e.target.value)
            }
          />
        )}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between gap-4">
        <Button variant="outline" disabled={currentIndex === 0} onClick={handlePrevious}>
          Previous
        </Button>

        {currentIndex === quizData.questions.length - 1 ? (
          <Button
            variant="primary"
            onClick={() => handleSubmit(false)}
            disabled={timeLimited && (remainingMs ?? 0) <= 0}
          >
            Submit Quiz
          </Button>
        ) : (
          <Button
            variant="primary"
            onClick={handleNext}
            disabled={timeLimited && (remainingMs ?? 0) <= 0}
          >
            Next
          </Button>
        )}
      </div>
    </div>
  );
};

export default QuizAttemptPage;
