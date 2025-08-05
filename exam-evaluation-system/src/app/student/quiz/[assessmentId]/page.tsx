"use client";

import React, { useEffect, useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { Clock, BookOpen, User, Calendar, FileText, Play } from "lucide-react";
import LoadingAnimation from "@/components/LoadingAnimation";
import Button from "@/components/Button";
import toast from "react-hot-toast";

interface AssessmentData {
  assessment_id: string;
  type: string;
  title: string;
  description: string;
  deadline: string;
  instructions?: string[];
  duration?: number;
}

interface Submission {
  submission_id: string;
  file_url: string;
  submission_time: string;
}

interface Grade {
  grade_id: string;
  total_marks: number;
  marks_awarded: number;
  feedback: string;
  grading_time: string;
  auto_graded: boolean;
}

interface QuizData {
  module_code: string;
  module_name: string;
  assessment_data: AssessmentData;
  submission: Submission | null;
  graded: Grade | null;
}

const StudentQuizPage: React.FC = () => {
  const router = useRouter();
  const { assessmentId } = useParams();
  const searchParams = useSearchParams();
  const studentId = searchParams.get("studentId");
  const moduleId = searchParams.get("moduleId");

  const [quizData, setQuizData] = useState<QuizData | null>(null);
  const [loading, setLoading] = useState(true);
  const [countdown, setCountdown] = useState<string>("");

  useEffect(() => {
    if (!assessmentId || !studentId || !moduleId) {
      toast.error("Missing required parameters");
      router.back();
      return;
    }

    const fetchQuizData = async () => {
      try {
        const response = await fetch(
          `/api/student/enrollments/${moduleId}/assessment/${assessmentId}?studentId=${studentId}`
        );
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to fetch quiz data");
        }

        const data = await response.json();
        setQuizData(data);
      } catch (error: any) {
        console.error("Error fetching quiz data:", error);
        toast.error(error.message || "Failed to load quiz data");
      } finally {
        setLoading(false);
      }
    };

    fetchQuizData();
  }, [assessmentId, studentId, moduleId, router]);

  // Update countdown timer
  useEffect(() => {
    if (!quizData?.assessment_data.deadline) return;

    const updateCountdown = () => {
      const now = Date.now();
      const deadlineTime = new Date(quizData.assessment_data.deadline).getTime();
      const diff = deadlineTime - now;

      if (diff <= 0) {
        setCountdown("Expired");
      } else {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        const parts = [];
        
        // If more than a day remaining, don't show seconds
        if (days > 0) {
          parts.push(`${days}d`);
          parts.push(`${hours}h`);
          if (minutes > 0) parts.push(`${minutes}m`);
        } else {
          // Less than a day remaining, show seconds
          if (hours > 0) parts.push(`${hours}h`);
          if (minutes > 0 || hours > 0) parts.push(`${minutes}m`);
          parts.push(`${seconds}s`);
        }

        setCountdown(parts.join(" "));
      }
    };

    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);
    return () => clearInterval(timer);
  }, [quizData]);

  const handleAttemptQuiz = () => {
    // Navigate to quiz attempt page (you can implement this route)
    router.push(`/student/quiz/attempt/${assessmentId}?studentId=${studentId}&moduleId=${moduleId}`);
  };

  const handleViewResults = () => {
    // Navigate to results page if already submitted and graded
    router.push(`/student/quiz/results/${assessmentId}?studentId=${studentId}&moduleId=${moduleId}`);
  };

  if (loading) {
    return (
      <LoadingAnimation
        size="lg"
        variant="wave"
        text="Loading quiz details..."
        fullScreen={true}
        color="blue"
      />
    );
  }

  if (!quizData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">Quiz not found</div>
          <Button variant="secondary" onClick={() => router.back()}>
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const isExpired = countdown === "Expired";
  const hasSubmission = quizData.submission !== null;
  const isGraded = quizData.graded !== null;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <div className="flex items-center mb-2">
                <FileText className="w-6 h-6 text-blue-600 mr-2" />
                <span className="text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                  {quizData.assessment_data.type.toUpperCase()}
                </span>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {quizData.assessment_data.title}
              </h1>
              <div className="flex items-center text-gray-600 mb-4">
                <BookOpen className="w-4 h-4 mr-2" />
                <span>{quizData.module_code} - {quizData.module_name}</span>
              </div>
            </div>
            
            {/* Countdown Timer */}
            <div className="text-right">
              <div className="text-sm text-gray-500 mb-1">Time Remaining</div>
              <div className={`text-2xl font-bold ${
                isExpired ? 'text-red-600' : 'text-green-600'
              }`}>
                {countdown}
              </div>
            </div>
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <Calendar className="w-5 h-5 text-gray-400 mr-3" />
              <div>
                <div className="text-sm text-gray-500">Deadline</div>
                <div className="font-medium text-gray-900">
                  {new Date(quizData.assessment_data.deadline).toLocaleString()}
                </div>
              </div>
            </div>
            
            <div className="flex items-center">
              <Clock className="w-5 h-5 text-gray-400 mr-3" />
              <div>
                <div className="text-sm text-gray-500">Status</div>
                <div className={`font-medium ${
                  isExpired ? 'text-red-600' : 
                  hasSubmission ? 'text-green-600' : 'text-yellow-600'
                }`}>
                  {isExpired ? 'Expired' : 
                   hasSubmission ? 'Submitted' : 'Pending'}
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          {quizData.assessment_data.description && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="text-sm font-medium text-blue-900 mb-2">Description</h3>
              <p className="text-blue-800 text-sm leading-relaxed">
                {quizData.assessment_data.description}
              </p>
            </div>
          )}
        </div>

        {/* Action Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          {/* Submission Status */}
          {hasSubmission && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center mb-2">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                <span className="font-medium text-green-800">Quiz Submitted</span>
              </div>
              <p className="text-green-700 text-sm">
                Submitted on: {new Date(quizData.submission.submission_time).toLocaleString()}
              </p>
              {isGraded && (
                <div className="mt-3 p-3 bg-white rounded border border-green-200">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-gray-900">Grade</span>
                    <span className="text-lg font-bold text-green-600">
                      {quizData.graded.marks_awarded}/{quizData.graded.total_marks}
                    </span>
                  </div>
                  {quizData.graded.feedback && (
                    <p className="text-sm text-gray-600 mt-2">
                      <strong>Feedback:</strong> {quizData.graded.feedback}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            {!hasSubmission && !isExpired && (
              <Button
                variant="primary"
                size="lg"
                onClick={handleAttemptQuiz}
                className="flex items-center justify-center"
              >
                <Play className="w-5 h-5 mr-2" />
                Attempt Quiz
              </Button>
            )}
            
            {hasSubmission && isGraded && (
              <Button
                variant="secondary"
                size="lg"
                onClick={handleViewResults}
                className="flex items-center justify-center"
              >
                <FileText className="w-5 h-5 mr-2" />
                View Detailed Results
              </Button>
            )}
            
            {isExpired && !hasSubmission && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-center">
                <p className="text-red-800 font-medium">Quiz Expired</p>
                <p className="text-red-600 text-sm mt-1">
                  This quiz is no longer available for submission.
                </p>
              </div>
            )}
            
            <Button
              variant="outline"
              size="lg"
              onClick={() => router.back()}
              className="flex items-center justify-center"
            >
              Back to Module
            </Button>
          </div>
        </div>

        {/* Instructions (if quiz not attempted yet) */}
        {!hasSubmission && !isExpired && (
          <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quiz Instructions</h3>
            {quizData.assessment_data.instructions && quizData.assessment_data.instructions.length > 0 ? (
              <ul className="space-y-2 text-sm text-gray-600">
                {quizData.assessment_data.instructions.map((instruction, index) => (
                  <li key={index} className="flex items-start">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    {instruction}
                  </li>
                ))}
              </ul>
            ) : (
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Make sure you have a stable internet connection before starting
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Once started, you must complete the quiz in one session
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Submit your answers before the deadline to avoid automatic submission
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Review your answers carefully before final submission
                </li>
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentQuizPage;