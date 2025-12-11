"use client";

import React, { ReactElement } from "react";
import { useSearchParams, useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  ChevronDown,
  ChevronRight,
  User,
  BookOpen,
  Calendar,
  Clock,
  Monitor,
  CheckCircle,
  XCircle,
  AlertCircle,
  ArrowLeft,
  Award,
} from "lucide-react";
import Button from "@/components/Button";
import Breadcrumbs from "@/components/Breadcrumbs";
import { getAssessmentBreadcrumbs } from "@/utils/breadcrumbs";
import LoadingAnimation from "@/components/LoadingAnimation";

// TypeScript interfaces
interface Question {
  question_id: string;
  question_text: string;
  student_answer: string;
  marks_allowed: number;
  marks_awarded: number | null;
  feedback: string | null;
}

interface AssessmentGrade {
  marks_awarded: number | null;
  max_marks: number | null;
  feedback: string | null;
  graded_at: string | null;
}

interface Submission {
  submission_id: string;
  submission_start_at: string | null;
  submission_end_at: string | null;
  type: string;
  device_info: string;
  assessment_grade: AssessmentGrade;
  questions: Question[];
}

interface StudentSummaryData {
  assessment_title: string;
  assessment_type: string;
  module_code: string;
  module_name: string;
  student_name: string;
  student_registration_number: string;
  student_email: string;
  submissions: Submission[];
}

interface ApiResponse {
  success: boolean;
  count: number;
  data: StudentSummaryData | null;
}

interface ScoreResult {
  awarded: number;
  total: number;
}

const StudentAssessmentSummaryPage: React.FC = () => {
  const searchParams = useSearchParams();
  const params = useParams();
  const router = useRouter();

  // Type-safe parameter extraction
  const moduleId = params.moduleId as string;
  const assessmentId = searchParams.get("assessmentId");
  const studentId = searchParams.get("studentId");
  const educatorId = searchParams.get("educatorId");

  // State with proper TypeScript types
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedSubmissions, setExpandedSubmissions] = useState<Set<string>>(
    new Set()
  );

  useEffect(() => {
    if (!assessmentId || !studentId) {
      setError("Missing required parameters: assessmentId or studentId");
      setLoading(false);
      return;
    }

    const fetchData = async (): Promise<void> => {
      try {
        const response = await fetch(
          `/api/educator/assessment/quiz/results/student?assessmentId=${assessmentId}&studentId=${studentId}`
        );

        if (!response.ok) {
          throw new Error(
            `Failed to fetch student summary: ${response.statusText}`
          );
        }

        const result: ApiResponse = await response.json();
        setData(result);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch student summary"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [assessmentId, studentId]);

  const toggleSubmission = (submissionId: string): void => {
    const newExpanded = new Set(expandedSubmissions);
    if (newExpanded.has(submissionId)) {
      newExpanded.delete(submissionId);
    } else {
      newExpanded.add(submissionId);
    }
    setExpandedSubmissions(newExpanded);
  };

  const formatDate = (dateString: string | null): string => {
    if (!dateString) return "Information not found";
    return new Date(dateString).toLocaleString();
  };

  const calculateSubmissionScore = (submission: Submission): ScoreResult => {
    // Use assessment-level grade if available, otherwise calculate from individual questions
    if (
      submission.assessment_grade.marks_awarded !== null &&
      submission.assessment_grade.max_marks !== null
    ) {
      return {
        awarded: submission.assessment_grade.marks_awarded,
        total: submission.assessment_grade.max_marks,
      };
    }

    // Fallback to question-level calculation
    const totalMarks = submission.questions.reduce(
      (sum, q) => sum + q.marks_allowed,
      0
    );
    const awardedMarks = submission.questions.reduce(
      (sum, q) => sum + (q.marks_awarded || 0),
      0
    );
    return { awarded: awardedMarks, total: totalMarks };
  };

  const getScoreColor = (awarded: number, total: number): string => {
    if (total === 0) return "text-gray-500";
    const percentage = (awarded / total) * 100;
    if (percentage >= 80) return "text-green-600";
    if (percentage >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getSubmissionIcon = (type: string): ReactElement => {
    switch (type.toLowerCase()) {
      case "attempt":
        return <CheckCircle className="w-4 h-4 text-blue-500" />;
      case "retake":
        return <AlertCircle className="w-4 h-4 text-orange-500" />;
      default:
        return <XCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const handleGoBack = (): void => {
    router.push(
      `/educator/module/${moduleId}/assessment/${params.assessmentId}/quiz/results?educatorId=${educatorId}`
    );
  };

  const getGradingStatus = (
    submission: Submission
  ): { status: string; color: string; icon: ReactElement } => {
    if (submission.assessment_grade.graded_at) {
      return {
        status: "Graded",
        color: "text-green-600 bg-green-50 border-green-200",
        icon: <CheckCircle className="w-4 h-4" />,
      };
    } else if (submission.assessment_grade.marks_awarded !== null) {
      return {
        status: "Auto-graded",
        color: "text-blue-600 bg-blue-50 border-blue-200",
        icon: <Award className="w-4 h-4" />,
      };
    } else {
      return {
        status: "Pending",
        color: "text-yellow-600 bg-yellow-50 border-yellow-200",
        icon: <AlertCircle className="w-4 h-4" />,
      };
    }
  };

  // Loading state
  // if (loading) {
  //   return (
  //     <div className="min-h-screen bg-gray-50 flex items-center justify-center">
  //       <div className="bg-white p-8 rounded-lg shadow-sm">
  //         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
  //         <p className="mt-4 text-gray-600">Loading student assessment summary...</p>
  //       </div>
  //     </div>
  //   );
  // }
  if (loading) {
    return (
      <LoadingAnimation
        size="lg"
        variant="wave"
        text="Loading student assessment summary..."
        fullScreen={true}
        color="blue"
      />
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-sm border border-red-200">
          <div className="text-red-600 text-center">
            <XCircle className="w-12 h-12 mx-auto mb-4" />
            <h2 className="text-lg font-semibold mb-2">Error</h2>
            <p className="mb-4">{error}</p>
            <Button onClick={handleGoBack} variant="outline">
              Go Back
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // No data state
  if (!data?.data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-sm">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2 text-center">
            No Data Found
          </h3>
          <p className="text-gray-600 text-center mb-4">
            No assessment data found for this student.
          </p>
          <div className="text-center">
            <Button onClick={handleGoBack} variant="outline">
              Go Back
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const summary = data.data;

  // Generate breadcrumbs
  const breadcrumbs = [
    { label: "Dashboard", href: "/educator/dashboard" },
    { label: summary.module_code, href: `/educator/module/${moduleId}` },
    {
      label: summary.assessment_title,
      href: `/educator/module/${moduleId}/assessment/${params.assessmentId}`,
    },
    {
      label: "Results",
      href: `/educator/module/${moduleId}/assessment/${params.assessmentId}/quiz/results?educatorId=${educatorId}`,
    },
    { label: summary.student_registration_number, current: true },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Breadcrumbs */}
        <div className="mb-6">
          <Breadcrumbs items={breadcrumbs} className="" />
        </div>

        {/* Header Section */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 mb-6 border border-blue-200">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <Button
                  onClick={handleGoBack}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Results
                </Button>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {summary.assessment_title}
              </h1>
              <div className="flex items-center space-x-6 text-sm text-gray-600">
                <div className="flex items-center">
                  <BookOpen className="w-4 h-4 mr-1" />
                  <span>
                    {summary.module_code} - {summary.module_name}
                  </span>
                </div>
                <div className="flex items-center">
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium uppercase">
                    {summary.assessment_type}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Student Info Section */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6 border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
            <User className="w-5 h-5 mr-2" />
            Student Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Name</p>
              <p className="text-sm text-gray-900">{summary.student_name}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">
                Registration Number
              </p>
              <p className="text-sm text-gray-900">
                {summary.student_registration_number}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Email</p>
              <p className="text-sm text-gray-900">{summary.student_email}</p>
            </div>
          </div>
        </div>

        {/* Submissions Summary Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Submission History ({summary.submissions.length} submission
              {summary.submissions.length !== 1 ? "s" : ""})
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Submission
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Start Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Duration
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Device
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Score
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {summary.submissions.map((submission, index) => {
                  const score = calculateSubmissionScore(submission);

                  // Calculate duration only if both timestamps are not null
                  let durationDisplay = "Information not found";
                  if (
                    submission.submission_end_at &&
                    submission.submission_start_at
                  ) {
                    const duration =
                      new Date(submission.submission_end_at).getTime() -
                      new Date(submission.submission_start_at).getTime();
                    const durationMinutes = Math.round(duration / (1000 * 60));
                    durationDisplay = `${durationMinutes} minutes`;
                  }

                  const isExpanded = expandedSubmissions.has(
                    submission.submission_id
                  );
                  const percentage =
                    score.total > 0
                      ? Math.round((score.awarded / score.total) * 100)
                      : 0;
                  const gradingStatus = getGradingStatus(submission);

                  return (
                    <React.Fragment key={submission.submission_id}>
                      <tr className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {getSubmissionIcon(submission.type)}
                            <div className="ml-2">
                              <div className="text-sm font-medium text-gray-900">
                                Submission #{index + 1}
                              </div>
                              <div className="text-xs text-gray-500 capitalize">
                                {submission.type}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center text-sm text-gray-900">
                            <Calendar className="w-4 h-4 mr-1 text-gray-400" />
                            {formatDate(submission.submission_start_at)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center text-sm text-gray-900">
                            <Clock className="w-4 h-4 mr-1 text-gray-400" />
                            {durationDisplay}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center text-sm text-gray-900">
                            <Monitor className="w-4 h-4 mr-1 text-gray-400" />
                            <span
                              className="truncate max-w-32"
                              title={submission.device_info}
                            >
                              {submission.device_info}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div
                            className={`text-sm font-semibold ${getScoreColor(
                              score.awarded,
                              score.total
                            )}`}
                          >
                            {score.awarded}/{score.total} ({percentage}%)
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${gradingStatus.color}`}
                          >
                            {gradingStatus.icon}
                            <span className="ml-1">{gradingStatus.status}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() =>
                              toggleSubmission(submission.submission_id)
                            }
                            className="flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors duration-200"
                            type="button"
                          >
                            {isExpanded ? (
                              <>
                                <ChevronDown className="w-4 h-4 mr-1" />
                                Hide Details
                              </>
                            ) : (
                              <>
                                <ChevronRight className="w-4 h-4 mr-1" />
                                View Details
                              </>
                            )}
                          </button>
                        </td>
                      </tr>

                      {/* Expanded Details */}
                      {isExpanded && (
                        <tr>
                          <td
                            colSpan={7}
                            className="px-6 py-4 bg-gray-50 border-t border-gray-200"
                          >
                            <div className="space-y-6">
                              {/* Assessment Grade Info */}
                              {submission.assessment_grade.graded_at && (
                                <div className="bg-white p-4 rounded-lg border border-gray-200">
                                  <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                                    <Award className="w-5 h-5 mr-2 text-blue-500" />
                                    Assessment Grade Information
                                  </h4>
                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                    <div>
                                      <p className="font-medium text-gray-500">
                                        Total Score
                                      </p>
                                      <p
                                        className={`${getScoreColor(
                                          score.awarded,
                                          score.total
                                        )} font-semibold`}
                                      >
                                        {score.awarded}/{score.total} (
                                        {Math.round(
                                          (score.awarded / score.total) * 100
                                        )}
                                        %)
                                      </p>
                                    </div>
                                    <div>
                                      <p className="font-medium text-gray-500">
                                        Graded At
                                      </p>
                                      <p className="text-gray-900">
                                        {formatDate(
                                          submission.assessment_grade.graded_at
                                        )}
                                      </p>
                                    </div>
                                    <div>
                                      <p className="font-medium text-gray-500">
                                        Overall Feedback
                                      </p>
                                      <p className="text-gray-700">
                                        {submission.assessment_grade.feedback ||
                                          "No feedback provided"}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* Question Details */}
                              <div>
                                <h4 className="font-medium text-gray-900 mb-3">
                                  Question Details
                                </h4>
                                <div className="overflow-x-auto">
                                  <table className="w-full bg-white rounded border">
                                    <thead className="bg-gray-100">
                                      <tr>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase">
                                          Question
                                        </th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase">
                                          Student Answer
                                        </th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase">
                                          Score
                                        </th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase">
                                          Feedback
                                        </th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                      {submission.questions.map((question) => (
                                        <tr
                                          key={question.question_id}
                                          className="hover:bg-gray-50"
                                        >
                                          <td className="px-4 py-3 text-sm">
                                            <div className="max-w-xs">
                                              <p className="text-gray-900 font-medium mb-1">
                                                {question.question_text}
                                              </p>
                                            </div>
                                          </td>
                                          <td className="px-4 py-3 text-sm">
                                            <div className="max-w-xs">
                                              <p className="text-gray-700">
                                                {question.student_answer ||
                                                  "No answer provided"}
                                              </p>
                                            </div>
                                          </td>
                                          <td className="px-4 py-3 text-sm">
                                            <div
                                              className={`font-semibold ${getScoreColor(
                                                question.marks_awarded || 0,
                                                question.marks_allowed
                                              )}`}
                                            >
                                              {question.marks_awarded ?? 0}/
                                              {question.marks_allowed}
                                            </div>
                                          </td>
                                          <td className="px-4 py-3 text-sm">
                                            <div className="max-w-xs">
                                              <p className="text-gray-600 italic">
                                                {question.feedback ||
                                                  "No feedback provided"}
                                              </p>
                                            </div>
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentAssessmentSummaryPage;
