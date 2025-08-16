"use client";

import React, { useEffect, useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { 
  Clock, 
  BookOpen, 
  FileText, 
  Play, 
  CheckCircle, 
  AlertTriangle,
  Info,
  Trophy,
  RotateCcw,
  Eye,
  Timer,
  Users
} from "lucide-react";
import LoadingAnimation from "@/components/LoadingAnimation";
import Button from "@/components/Button";
import toast from "react-hot-toast";
import QuizPasswordPopup from "@/components/QuizPasswordPopup";

interface AssessmentData {
  assessment_id: string;
  type: string;
  title: string;
  description: string;
  deadline: string;
  instructions?: string[]; 
  duration?: number | null; 
  open_at?: string | null; 
  close_at?: string | null; 
  shuffle_questions: boolean; 
  max_attempts?: number | null; 
  auto_grade: boolean; 
  has_password?: boolean | false; 
  has_questions?: boolean | false; 
  total_marks?: number | null;
  max_marks?: number | null; 
  back_navigation?: boolean;
  case_sensitive_evaluation?: boolean;
}

interface Grade {
  grade_id: string;
  max_marks: number;
  marks_awarded: number;
  feedback?: string | null; 
  graded_at: string;
  auto_graded: boolean;
}

interface Submission {
  submission_id: string;
  type: string;
  submission_start_at: string;
  submission_end_at?: string | null; 
  file_url?: string | null; 
  ip_address?: string | null; 
  device_info?: string | null; 
  is_graded: boolean;
  grade?: Grade | null;
}

interface QuizData {
  module_code: string;
  module_name: string;
  assessment_data: AssessmentData;
  question_paper?: {
    file_url: string;
    created_on: string;
  } | null; 
  submissions: Submission[];
  attempts_remaining: number | null; 
  last_attempt_grade?: Grade | null; 
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
  const [showPasswordPopup, setShowPasswordPopup] = useState(false);

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


  useEffect(() => {
    if (!quizData?.assessment_data) return;

    const updateCountdown = () => {
      const now = Date.now();
      const openAt = quizData.assessment_data.open_at ? new Date(quizData.assessment_data.open_at).getTime() : null;
      const closeAt = quizData.assessment_data.close_at ? new Date(quizData.assessment_data.close_at).getTime() : null;
      const deadline = new Date(quizData.assessment_data.deadline).getTime();

      // Determine which time to count down to
      let targetTime: number;
      let countdownLabel: string;

      if (openAt) {
        // If open_at exists, use it for countdown
        targetTime = openAt;
        countdownLabel = "Opens in";
        
        // If we've passed the open time but there's a close time, count down to close time
        if (now >= openAt && closeAt) {
          targetTime = closeAt;
          countdownLabel = "Closes in";
        }
      } else {
        // If no open_at, use deadline
        targetTime = deadline;
        countdownLabel = "Time Remaining";
      }

      const diff = targetTime - now;

      // Only show "Expired" if close_at has passed (when it exists) or deadline has passed (when close_at doesn't exist)
      const shouldShowExpired = closeAt ? now > closeAt : now > deadline;

      if (shouldShowExpired) {
        setCountdown("Expired");
      } else if (diff <= 0) {
        // If we're past the current target but not expired, recalculate
        if (openAt && now >= openAt && closeAt && now < closeAt) {
          // We're between open and close time
          const closeCountdown = closeAt - now;
          setCountdown(formatCountdown(closeCountdown));
        } else {
          setCountdown("Available");
        }
      } else {
        setCountdown(formatCountdown(diff));
      }
    };

    const formatCountdown = (diff: number) => {
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      const parts = [];
      
      if (days > 0) {
        parts.push(`${days}d`);
        parts.push(`${hours}h`);
        if (minutes > 0) parts.push(`${minutes}m`);
      } else {
        if (hours > 0) parts.push(`${hours}h`);
        if (minutes > 0 || hours > 0) parts.push(`${minutes}m`);
        parts.push(`${seconds}s`);
      }

      return parts.join(" ");
    };

    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);
    return () => clearInterval(timer);
  }, [quizData]);

  const handleAttemptQuiz = async () => {
    // Check if quiz has password protection
    if (quizData?.assessment_data.has_password) {
      setShowPasswordPopup(true);
    } else {
      // Create submission without password verification
      try {
        const response = await fetch('/api/student/quiz/create-submission', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            assessmentId: assessmentId,
            studentId: studentId,
            moduleId: moduleId,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to create submission');
        }

        const data = await response.json();
        
        // Navigate to attempt page with submission ID
        router.push(
          `/student/quiz/attempt/${assessmentId}?studentId=${studentId}&moduleId=${moduleId}&submissionId=${data.submissionId}`
        );
      } catch (error: any) {
        console.error('Error creating submission:', error);
        toast.error(error.message || 'Failed to start quiz');
      }
    }
  };

  const handlePasswordSuccess = (submissionId: string) => {
    router.push(
      `/student/quiz/attempt/${assessmentId}?studentId=${studentId}&moduleId=${moduleId}&submissionId=${submissionId}`
    );
  };

  const handleViewResults = () => {
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 bg-white rounded-xl shadow-sm border">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <div className="text-red-600 text-xl font-semibold mb-2">Assessment Not Found</div>
          <div className="text-gray-600 mb-6">The requested assessment could not be loaded.</div>
          <Button variant="secondary" onClick={() => router.back()}>
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  // Updated expired logic - only expired if close_at has passed (when it exists) or deadline has passed (when close_at doesn't exist)
  const now = new Date();
  const closeAt = quizData.assessment_data.close_at ? new Date(quizData.assessment_data.close_at) : null;
  const deadline = new Date(quizData.assessment_data.deadline);
  const isExpired = closeAt ? now > closeAt : now > deadline;

  const hasSubmissions = quizData.submissions && quizData.submissions.length > 0;
  const isGraded = quizData.last_attempt_grade !== null && quizData.last_attempt_grade !== undefined;
  
  // Check if quiz is within the open/close window
  const openAt = quizData.assessment_data.open_at ? new Date(quizData.assessment_data.open_at) : null;
  
  const isBeforeOpenTime = openAt && now < openAt;
  const isAfterCloseTime = closeAt && now > closeAt;
  const isWithinTimeWindow = !isBeforeOpenTime && !isAfterCloseTime;
  
  // Fixed: Use the correct property name from the API response
  const hasQuestions = quizData.assessment_data.has_questions;
  const canAttempt = !isExpired && hasQuestions && isWithinTimeWindow && (quizData.attempts_remaining === null || quizData.attempts_remaining > 0);
  const isUnlimitedAttempts = quizData.assessment_data.max_attempts === null || quizData.assessment_data.max_attempts === undefined;
  
  // Calculate best score if multiple attempts - handle null grades properly
  const bestScore = quizData.submissions?.reduce((best, submission) => {
    if (submission.grade && 
        submission.grade.marks_awarded !== null && 
        submission.grade.marks_awarded !== undefined && 
        submission.grade.marks_awarded > (best?.marks_awarded || 0)) {
      return submission.grade;
    }
    return best;
  }, null as Grade | null) || null;

  const formatDuration = (minutes: number | null) => {
    if (!minutes || minutes === 0) return "No Time Limit";
    
    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
    }
    return `${minutes} minutes`;
  };

  const getStatusInfo = () => {
    if (!hasQuestions) {
      return {
        status: "No Questions Available",
        color: "red",
        icon: AlertTriangle,
        description: "Questions are not available for this quiz"
      };
    }
    
    if (isBeforeOpenTime) {
      return {
        status: "Not Yet Available",
        color: "yellow",
        icon: Clock,
        description: `Opens ${openAt?.toLocaleString()}`
      };
    }
    
    if (isAfterCloseTime) {
      return {
        status: "Closed",
        color: "red",
        icon: AlertTriangle,
        description: `Closed on ${closeAt?.toLocaleString()}`
      };
    }
    
    if (isExpired) {
      return {
        status: "Expired",
        color: "red",
        icon: AlertTriangle,
        description: "This assessment is no longer available"
      };
    }
    
    if (!hasSubmissions) {
      return {
        status: "Not Attempted",
        color: "yellow",
        icon: Clock,
        description: "Ready to start your first attempt"
      };
    }
    
    if (canAttempt) {
      return {
        status: "In Progress",
        color: "blue",
        icon: RotateCcw,
        description: `${quizData.submissions?.length || 0} attempt${(quizData.submissions?.length || 0) > 1 ? 's' : ''} completed`
      };
    }
    
    return {
      status: "Completed",
      color: "green",
      icon: CheckCircle,
      description: "All attempts used"
    };
  };

  const statusInfo = getStatusInfo();
  const StatusIcon = statusInfo.icon;

  // Get countdown label based on current state
  const getCountdownLabel = () => {
    if (countdown === "Expired") return "Status";
    if (countdown === "Available") return "Status";
    
    const openTime = quizData.assessment_data.open_at ? new Date(quizData.assessment_data.open_at) : null;
    const closeTime = quizData.assessment_data.close_at ? new Date(quizData.assessment_data.close_at) : null;
    
    if (openTime && now < openTime) {
      return "Opens In";
    } else if (openTime && closeTime && now >= openTime && now < closeTime) {
      return "Closes In";
    } else {
      return "Time Remaining";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
                <span className="text-sm font-semibold text-blue-600 bg-blue-50 px-4 py-2 rounded-full border border-blue-200">
                  {quizData.assessment_data.type.toUpperCase()}
                </span>
                {quizData.assessment_data.auto_grade && (
                  <span className="text-xs font-medium text-green-600 bg-green-50 px-3 py-1 rounded-full border border-green-200">
                    AUTO-GRADED
                  </span>
                )}
              </div>
              
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-3">
                {quizData.assessment_data.title}
              </h1>
              
              <div className="flex items-center text-gray-600 mb-4">
                <BookOpen className="w-5 h-5 mr-2" />
                <span className="font-medium">{quizData.module_code}</span>
                <span className="mx-2">•</span>
                <span>{quizData.module_name}</span>
              </div>

              {/* Status Badge */}
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border ${
                statusInfo.color === 'red' ? 'bg-red-50 text-red-700 border-red-200' :
                statusInfo.color === 'yellow' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                statusInfo.color === 'blue' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                'bg-green-50 text-green-700 border-green-200'
              }`}>
                <StatusIcon className="w-4 h-4" />
                <span>{statusInfo.status}</span>
              </div>
            </div>
            
            {/* Countdown Timer */}
            <div className="text-center lg:text-right bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-100">
              <div className="text-sm font-medium text-blue-600 mb-2">{getCountdownLabel()}</div>
              <div className={`text-3xl font-bold ${
                countdown === "Expired" ? 'text-red-600' : 
                countdown === "Available" ? 'text-green-600' : 'text-blue-700'
              }`}>
                {countdown}
              </div>
              <div className="text-xs text-blue-500 mt-1">
                {countdown === "Expired" ? "Assessment has ended" :
                 countdown === "Available" ? "Ready to attempt" :
                 `Until ${getCountdownLabel().includes('Opens') ? 
                   (openAt?.toLocaleDateString() || 'opens') :
                   getCountdownLabel().includes('Closes') ?
                   (closeAt?.toLocaleDateString() || 'closes') :
                   new Date(quizData.assessment_data.deadline).toLocaleDateString()}`}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {quizData.submissions?.length || 0}
                </div>
                <div className="text-sm text-gray-500">Attempts Made</div>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {isUnlimitedAttempts ? "∞" : (quizData.assessment_data.max_attempts || "1")}
                </div>
                <div className="text-sm text-gray-500">
                  {isUnlimitedAttempts ? "Unlimited" : "Max Attempts"}
                </div>
              </div>
              <RotateCcw className="w-8 h-8 text-green-500" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {isUnlimitedAttempts ? "∞" : (quizData.attempts_remaining !== null ? quizData.attempts_remaining : 0)}
                </div>
                <div className="text-sm text-gray-500">Remaining</div>
              </div>
              <Timer className="w-8 h-8 text-orange-500" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {formatDuration(quizData.assessment_data.duration)}
                </div>
                <div className="text-sm text-gray-500">Duration</div>
              </div>
              <Clock className="w-8 h-8 text-purple-500" />
            </div>
          </div>
        </div>

        {/* No Questions Available Alert */}
        {!hasQuestions && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <div className="flex items-center text-red-700 font-medium mb-3">
                <AlertTriangle className="w-6 h-6 mr-3" />
                Questions Not Available
              </div>
              <p className="text-red-600 text-lg">
                Questions are not available for this quiz. Please try again later.
              </p>
              <p className="text-red-500 text-sm mt-2">
                Contact your instructor if this issue persists.
              </p>
            </div>
          </div>
        )}

        {/* Quiz Not Yet Available Alert */}
        {isBeforeOpenTime && hasQuestions && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <div className="flex items-center text-yellow-700 font-medium mb-3">
                <Clock className="w-6 h-6 mr-3" />
                Quiz Not Yet Available
              </div>
              <p className="text-yellow-600 text-lg">
                This quiz will be available starting {openAt?.toLocaleString()}.
              </p>
              <p className="text-yellow-500 text-sm mt-2">
                Please check back after the opening time.
              </p>
            </div>
          </div>
        )}

        {/* Quiz Closed Alert */}
        {isAfterCloseTime && hasQuestions && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <div className="flex items-center text-red-700 font-medium mb-3">
                <AlertTriangle className="w-6 h-6 mr-3" />
                Quiz Closed
              </div>
              <p className="text-red-600 text-lg">
                This quiz was closed on {closeAt?.toLocaleString()}.
              </p>
              <p className="text-red-500 text-sm mt-2">
                No new attempts are allowed after the closing time.
              </p>
            </div>
          </div>
        )}

        {/* Description */}
        {quizData.assessment_data.description && quizData.assessment_data.description.trim() && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
              <Info className="w-5 h-5 mr-2 text-blue-500" />
              Description
            </h3>
            <p className="text-gray-700 leading-relaxed">
              {quizData.assessment_data.description}
            </p>
          </div>
        )}

        {/* Submission History */}
        {hasSubmissions && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Trophy className="w-5 h-5 mr-2 text-yellow-500" />
              Attempt History
            </h3>
            
            {bestScore && (
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-green-800">Best Score</div>
                    <div className="text-2xl font-bold text-green-900">
                      {bestScore.marks_awarded}/{bestScore.max_marks}
                    </div>
                    <div className="text-sm text-green-700">
                      {Math.round((bestScore.marks_awarded / bestScore.max_marks) * 100)}%
                    </div>
                  </div>
                  <Trophy className="w-10 h-10 text-yellow-500" />
                </div>
              </div>
            )}

            <div className="space-y-3">
              {quizData.submissions?.map((submission, index) => (
                <div key={submission.submission_id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
                  <div className="flex items-center gap-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      submission.grade ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">
                        Attempt {index + 1}
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(submission.submission_start_at).toLocaleString()}
                      </div>
                      {submission.submission_end_at && (
                        <div className="text-xs text-gray-400">
                          Ended: {new Date(submission.submission_end_at).toLocaleString()}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-right">
                    {submission.grade ? (
                      <div>
                        <div className="font-bold text-gray-900">
                          {submission.grade.marks_awarded}/{submission.grade.max_marks}
                        </div>
                        <div className="text-sm text-gray-500">
                          {Math.round((submission.grade.marks_awarded / submission.grade.max_marks) * 100)}%
                        </div>
                        {submission.grade.auto_graded && (
                          <div className="text-xs text-blue-600 mt-1">Auto-graded</div>
                        )}
                      </div>
                    ) : (
                      <div>
                        <div className="text-sm text-yellow-600 font-medium">
                          {submission.is_graded ? 'Graded' : 'Pending'}
                        </div>
                        {!submission.submission_end_at && (
                          <div className="text-xs text-red-500">In Progress</div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )) || []}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {canAttempt && (
              <Button
                variant="primary"
                onClick={handleAttemptQuiz}
                className="flex items-center justify-center bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <Play className="w-5 h-5 mr-2" />
                {hasSubmissions ? 'Attempt Again' : 'Start Quiz'}
              </Button>
            )}
            
            {hasSubmissions && isGraded && (
              <Button
                variant="secondary"
                onClick={handleViewResults}
                className="flex items-center justify-center"
              >
                <Eye className="w-5 h-5 mr-2" />
                View Results
              </Button>
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

          {/* Status Messages */}
          <div className="mt-6 p-4 rounded-lg border-l-4 bg-gray-50">
            {!hasQuestions ? (
              <div className="border-red-500">
                <div className="flex items-center text-red-700 font-medium mb-1">
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Questions Not Available
                </div>
                <p className="text-red-600 text-sm">
                  Questions are not available for this quiz. Please try again later or contact your instructor.
                </p>
              </div>
            ) : isBeforeOpenTime ? (
              <div className="border-yellow-500">
                <div className="flex items-center text-yellow-700 font-medium mb-1">
                  <Clock className="w-4 h-4 mr-2" />
                  Quiz Not Yet Available
                </div>
                <p className="text-yellow-600 text-sm">
                  This quiz will be available starting {openAt?.toLocaleString()}.
                </p>
              </div>
            ) : isAfterCloseTime ? (
              <div className="border-red-500">
                <div className="flex items-center text-red-700 font-medium mb-1">
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Quiz Closed
                </div>
                <p className="text-red-600 text-sm">
                  This quiz was closed on {closeAt?.toLocaleString()}. No new attempts are allowed.
                </p>
              </div>
            ) : isExpired && !hasSubmissions ? (
              <div className="border-red-500">
                <div className="flex items-center text-red-700 font-medium mb-1">
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Assessment Expired
                </div>
                <p className="text-red-600 text-sm">
                  This assessment is no longer available for submission.
                </p>
              </div>
            ) : !canAttempt && hasSubmissions && hasQuestions && isWithinTimeWindow ? (
              <div className="border-blue-500">
                <div className="flex items-center text-blue-700 font-medium mb-1">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  All Attempts Used
                </div>
                <p className="text-blue-600 text-sm">
                  You have used all your available attempts for this assessment.
                </p>
              </div>
            ) : canAttempt ? (
              <div className="border-green-500">
                <div className="flex items-center text-green-700 font-medium mb-1">
                  <Play className="w-4 h-4 mr-2" />
                  Ready to Attempt
                </div>
                <p className="text-green-600 text-sm">
                  {isUnlimitedAttempts 
                    ? "You have unlimited attempts for this assessment."
                    : `You have ${quizData.attempts_remaining || 0} attempt${(quizData.attempts_remaining || 0) === 1 ? '' : 's'} remaining.`
                  }
                  {openAt && <span className="block mt-1">Available from: {openAt.toLocaleString()}</span>}
                  {closeAt && <span className="block">Available until: {closeAt.toLocaleString()}</span>}
                </p>
              </div>
            ) : null}
          </div>
        </div>

        {/* Instructions */}
        {!hasSubmissions && !isExpired && hasQuestions && isWithinTimeWindow && (
          <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Info className="w-5 h-5 mr-2 text-blue-500" />
              Important Instructions
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span className="text-sm text-gray-700">Ensure stable internet connection before starting</span>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span className="text-sm text-gray-700">Complete the quiz in one continuous session</span>
                </div>
                {quizData.assessment_data.duration && (
                  <div className="flex items-start">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span className="text-sm text-gray-700">Time limit: {formatDuration(quizData.assessment_data.duration)}</span>
                  </div>
                )}
               
                {openAt && (
                  <div className="flex items-start">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span className="text-sm text-gray-700">Available from: {openAt.toLocaleString()}</span>
                  </div>
                )}
              </div>
              
              <div className="space-y-3">
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span className="text-sm text-gray-700">Submit before the deadline to avoid auto-submission</span>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span className="text-sm text-gray-700">Review your answers before final submission</span>
                </div>
                {quizData.assessment_data.shuffle_questions && (
                  <div className="flex items-start">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span className="text-sm text-gray-700">Questions will be shuffled for each attempt</span>
                  </div>
                )}
                {(quizData.assessment_data.total_marks || quizData.assessment_data.max_marks) && (
                  <div className="flex items-start">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span className="text-sm text-gray-700">
                      Total marks: {quizData.assessment_data.total_marks || quizData.assessment_data.max_marks}
                    </span>
                  </div>
                )}
                {closeAt && (
                  <div className="flex items-start">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span className="text-sm text-red-700">Available until: {closeAt.toLocaleString()}</span>
                  </div>
                )}
              </div>
            </div>

            {quizData.assessment_data.instructions && quizData.assessment_data.instructions.length > 0 && (
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Additional Instructions</h4>
                <ul className="space-y-1">
                  {quizData.assessment_data.instructions.map((instruction, index) => (
                    <li key={index} className="text-sm text-blue-800 flex items-start">
                      <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                      {instruction}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Password Popup */}
      <QuizPasswordPopup
        isOpen={showPasswordPopup}
        onClose={() => setShowPasswordPopup(false)}
        onSuccess={handlePasswordSuccess}
        assessmentId={assessmentId as string}
        studentId={studentId as string}
        quizTitle={quizData?.assessment_data.title || "Quiz"}
      />
    </div>
  );
};

export default StudentQuizPage;