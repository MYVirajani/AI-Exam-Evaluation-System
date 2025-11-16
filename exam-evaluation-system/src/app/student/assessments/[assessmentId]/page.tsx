"use client";

import { useSearchParams, useParams } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { FileUploadSection } from "@/components/Upload/FileUploadSection";
import Button from "@/components/Button";
import toast from "react-hot-toast";
import { FileIcon } from "@/components/Icons";
import { FILE_CONFIG, getMaxSizeInBytes } from "@/lib/fileConfig";

interface AssessmentData {
  assessment_id: string;
  type: string;
  title: string;
  description: string;
  deadline: string;
}

interface Paper {
  file_url: string;
  created_on: string;
}

interface Submission {
  submission_id: string;
  file_url: string | null;
  submission_start_at: string;
  submission_end_at: string | null;
  type: string;
  is_graded: boolean;
  grade: Graded | null;
}

interface Graded {
  grade_id: string;
  max_marks: number;
  marks_awarded: number;
  feedback: string;
  graded_at: string;
  auto_graded: boolean;
}

interface AssessmentResponse {
  module_code: string;
  module_name: string;
  assessment_data: AssessmentData;
  question_paper: Paper | null;
  submissions: Submission[];
  attempts_remaining: number | null;
  last_attempt_grade: Graded | null;
}

interface AIGradingResult {
  total_marks: number;
  total_possible: number;
  model: 'gemini' | 'openai';
}

export default function StudentAssessmentPage() {
  const params = useParams();
  const searchParams = useSearchParams();

  const moduleId = searchParams.get("moduleId") ?? "";
  const assessmentId = params.assessmentId as string;
  const studentId = searchParams.get("studentId") ?? "";

  const [assessment, setAssessment] = useState<AssessmentResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [aiResults, setAiResults] = useState<AIGradingResult[]>([]);
  const [loadingAiResults, setLoadingAiResults] = useState(false);

  const [answerScriptFile, setAnswerScriptFile] = useState<File | null>(null);
  const [isHandwritten, setIsHandwritten] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!moduleId || !assessmentId) {
      setError("Missing moduleId or assessmentId");
      setLoading(false);
      return;
    }

    const fetchAssessment = async () => {
      setLoading(true);
      setError(null);
      try {
        const queryParams = new URLSearchParams({ studentId, moduleId });
        const url = `/api/student/enrollments/${moduleId}/assessment/${assessmentId}?${queryParams.toString()}`;

        const res = await fetch(url);
        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.message || "Failed to fetch assessment");
        }

        const data: AssessmentResponse = await res.json();
        setAssessment(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchAssessment();
  }, [moduleId, assessmentId, studentId]);

  // Fetch AI grading results
  useEffect(() => {
    const fetchAIResults = async () => {
      if (!assessment || !studentId) return;

      setLoadingAiResults(true);
      try {
        // First, get student registration number from student_id
        const studentRes = await fetch(`/api/student/${studentId}`);
        if (!studentRes.ok) return;
        
        const studentData = await studentRes.json();
        const registrationNumber = studentData.registration_number;

        const results: AIGradingResult[] = [];

        // Fetch from both Gemini and OpenAI tables
        const models = ['gemini', 'openai'];
        
        for (const model of models) {
          try {
            const response = await fetch(
              `/api/ai-results/${model}?student_index=${registrationNumber}&assessment_id=${assessmentId}`
            );
            
            if (response.ok) {
              const data = await response.json();
              if (data && data.length > 0) {
                // Get the latest result for this model
                const latestResult = data[0];
                results.push({
                  total_marks: latestResult.total_marks,
                  total_possible: latestResult.total_possible,
                  model: model === 'openai' ? 'openai' : 'gemini'
                });
              }
            }
          } catch (error) {
            console.error(`Failed to fetch ${model} results:`, error);
          }
        }

        setAiResults(results);
      } catch (error) {
        console.error('Failed to fetch AI results:', error);
      } finally {
        setLoadingAiResults(false);
      }
    };

    fetchAIResults();
  }, [assessment, studentId, assessmentId]);

  const getBestAIResult = () => {
    if (aiResults.length === 0) return null;
    
    return aiResults.reduce((best, current) => {
      const currentPercentage = (current.total_marks / current.total_possible) * 100;
      const bestPercentage = (best.total_marks / best.total_possible) * 100;
      return currentPercentage > bestPercentage ? current : best;
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Extended file types to include images
    const allowedTypes = [
      ...FILE_CONFIG.ANSWER_SCRIPT.types, // Original types from config
      '.png', '.jpg', '.jpeg', '.PNG', '.JPG', '.JPEG'
    ];
    
    const { maxSizeMB } = FILE_CONFIG.ANSWER_SCRIPT;

    const isValidType = allowedTypes.some((ext) =>
      file.name.toLowerCase().endsWith(ext.toLowerCase())
    );
    
    if (!isValidType) {
      const originalTypes = FILE_CONFIG.ANSWER_SCRIPT.types.join(", ");
      toast.error(`Invalid file type. Allowed types: ${originalTypes}, PNG, JPG, JPEG`);
      return;
    }

    const maxSize = getMaxSizeInBytes(maxSizeMB);
    if (file.size > maxSize) {
      toast.error(`File size exceeds ${maxSizeMB}MB limit.`);
      return;
    }

    setAnswerScriptFile(file);
    e.target.value = "";
  };

  const handleUpload = async () => {
    if (!answerScriptFile) return;

    const toastId = toast.loading("Uploading answer script...");
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", answerScriptFile);
      formData.append("isHandwritten", isHandwritten.toString());

      const uploadUrl = `/api/student/enrollments/${moduleId}/assessment/${assessmentId}/submission/${studentId}`;

      const res = await fetch(uploadUrl, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Upload failed");
      }

      toast.success("Answer script uploaded successfully!", { id: toastId });

      // Refresh assessment data
      const queryParams = new URLSearchParams({ studentId, moduleId });
      const refreshRes = await fetch(
        `/api/student/enrollments/${moduleId}/assessment/${assessmentId}?${queryParams.toString()}`
      );
      const refreshedData: AssessmentResponse = await refreshRes.json();
      setAssessment(refreshedData);
      setAnswerScriptFile(null);
      setIsHandwritten(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed", {
        id: toastId,
      });
    } finally {
      setIsUploading(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const getStatusBadge = (assessment: AssessmentResponse) => {
    const bestAIResult = getBestAIResult();
    const latestSubmission = assessment.submissions && assessment.submissions.length > 0 
      ? assessment.submissions[assessment.submissions.length - 1] 
      : null;
    const isGraded = latestSubmission?.grade || assessment.last_attempt_grade || bestAIResult;
    
    if (isGraded) {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
          Graded
        </span>
      );
    }
    if (latestSubmission) {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          Submitted
        </span>
      );
    }
    const deadline = new Date(assessment.assessment_data.deadline);
    const now = new Date();
    if (now > deadline) {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
          Overdue
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
        Pending
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getGradePercentage = (awarded: number, total: number) => {
    return ((awarded / total) * 100).toFixed(1);
  };

  const getFileIcon = (fileName: string) => {
    const imageExtensions = ['.png', '.jpg', '.jpeg'];
    const isImage = imageExtensions.some(ext => 
      fileName.toLowerCase().endsWith(ext)
    );
    
    if (isImage) {
      return (
        <svg
          className="h-5 w-5 text-green-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      );
    }
    
    return (
      <svg
        className="h-5 w-5 text-gray-600"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span className="text-lg text-gray-600">Loading assessment...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md border border-red-200">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <svg
                className="h-8 w-8 text-red-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-medium text-red-800">
                Error Loading Assessment
              </h3>
              <p className="text-red-600 mt-1">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!assessment) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-700">
            No Assessment Data
          </h2>
          <p className="text-gray-500 mt-2">
            The requested assessment could not be found.
          </p>
        </div>
      </div>
    );
  }

  // Get submission and grading data
  const bestAIResult = getBestAIResult();
  const latestSubmission = assessment.submissions && assessment.submissions.length > 0 
    ? assessment.submissions[assessment.submissions.length - 1] 
    : null;
  const gradeInfo = latestSubmission?.grade || assessment.last_attempt_grade;

  // Create extended accept attribute for file input
  const extendedFileTypes = [
    ...FILE_CONFIG.ANSWER_SCRIPT.types,
    '.png', '.jpg', '.jpeg'
  ].join(',');

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {assessment.module_code} - {assessment.module_name}
              </h1>
              <p className="text-sm text-gray-500">Assessment Details</p>
            </div>
            {getStatusBadge(assessment)}
          </div>
        </div>

        {/* Assessment Information */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="border-b border-gray-200 pb-4 mb-4">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              {assessment.assessment_data.title}
            </h2>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <span className="bg-gray-100 px-2 py-1 rounded">
                {assessment.assessment_data.type}
              </span>
              <span>
                Due: {formatDate(assessment.assessment_data.deadline)}
              </span>
            </div>
          </div>

          {assessment.assessment_data.description && (
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-900 mb-2">
                Description
              </h3>
              <p className="text-gray-700">
                {assessment.assessment_data.description}
              </p>
            </div>
          )}

          {/* Question Paper */}
          {assessment.question_paper && (
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-900 mb-2">
                Question Paper
              </h3>
              <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <svg
                  className="h-5 w-5 text-blue-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <div className="flex-1">
                  <a
                    href={assessment.question_paper.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-blue-700 hover:text-blue-800 underline"
                  >
                    Download Question Paper
                  </a>
                  <p className="text-xs text-gray-500 mt-1">
                    Uploaded: {formatDate(assessment.question_paper.created_on)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Submission Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Answer Submission
          </h3>

          {latestSubmission ? (
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center space-x-3">
                <svg
                  className="h-5 w-5 text-green-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div className="flex-1">
                  <p className="font-medium text-green-800">
                    Submission Completed
                  </p>
                  <p className="text-sm text-green-600 mt-1">
                    Submitted on:{" "}
                    {formatDate(latestSubmission.submission_start_at)}
                  </p>
                  {latestSubmission.file_url && (
                    <a
                      href={latestSubmission.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-sm text-green-700 hover:text-green-800 underline mt-2"
                    >
                      View Your Submission
                      <svg
                        className="ml-1 h-3 w-3"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                        />
                      </svg>
                    </a>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="flex items-center space-x-2">
                  <svg
                    className="h-5 w-5 text-yellow-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                    />
                  </svg>
                  <p className="text-sm font-medium text-yellow-800">
                    No submission uploaded yet
                  </p>
                </div>
                <p className="text-xs text-yellow-600 mt-1 ml-7">
                  Supported formats: Documents, PDFs, and Images (PNG, JPG, JPEG)
                </p>
              </div>

              <FileUploadSection
                title="Upload Answer Script"
                type='ANSWER_SCRIPT'
                icon={<FileIcon />}
                uploadedFile={answerScriptFile}
                onTriggerUpload={triggerFileInput}
              />

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept={extendedFileTypes}
                className="hidden"
              />

              {answerScriptFile && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center space-x-3">
                      {getFileIcon(answerScriptFile.name)}
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {answerScriptFile.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {(answerScriptFile.size / (1024 * 1024)).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Handwritten Checkbox */}
                  <div className="flex items-center space-x-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <input
                      type="checkbox"
                      id="handwritten"
                      checked={isHandwritten}
                      onChange={(e) => setIsHandwritten(e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="handwritten" className="text-sm font-medium text-gray-700 cursor-pointer">
                      This answer script is handwritten
                    </label>
                  </div>

                  <Button
                    onClick={handleUpload}
                    disabled={isUploading}
                    className="w-full"
                  >
                    {isUploading ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Uploading...</span>
                      </div>
                    ) : (
                      "Upload Answer Script"
                    )}
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Grading Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Grading Information
          </h3>

          {gradeInfo || bestAIResult ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-900">
                      {gradeInfo 
                        ? gradeInfo.marks_awarded 
                        : bestAIResult?.total_marks
                      }
                    </p>
                    <p className="text-sm text-blue-600">Marks Awarded</p>
                  </div>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900">
                      {gradeInfo 
                        ? gradeInfo.max_marks 
                        : bestAIResult?.total_possible
                      }
                    </p>
                    <p className="text-sm text-gray-600">Total Marks</p>
                  </div>
                </div>
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-900">
                      {gradeInfo 
                        ? getGradePercentage(gradeInfo.marks_awarded, gradeInfo.max_marks)
                        : getGradePercentage(bestAIResult?.total_marks || 0, bestAIResult?.total_possible || 1)
                      }%
                    </p>
                    <p className="text-sm text-green-600">Percentage</p>
                  </div>
                </div>
              </div>

              {gradeInfo?.feedback && (
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <h4 className="font-medium text-gray-900 mb-2">Feedback</h4>
                  <p className="text-gray-700">{gradeInfo.feedback}</p>
                </div>
              )}

              <div className="flex items-center justify-between text-sm text-gray-600 border-t border-gray-200 pt-4">
                <span>
                  Graded on: {gradeInfo 
                    ? formatDate(gradeInfo.graded_at)
                    : "Recently"
                  }
                </span>
                <span className="px-2 py-1 rounded text-xs bg-green-100 text-green-800">
                  Auto Graded
                </span>
              </div>
            </div>
          ) : (
            <div>
              {loadingAiResults ? (
                <div className="text-center p-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-sm text-gray-500 mt-2">Loading results...</p>
                </div>
              ) : (
                <div className="text-center p-8">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400 mb-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                    />
                  </svg>
                  <p className="text-gray-500 font-medium">
                    Assessment not graded yet
                  </p>
                  <p className="text-sm text-gray-400 mt-1">
                    Your submission will be graded once reviewed by the instructor
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


// "use client";

// import { useSearchParams, useParams } from "next/navigation";
// import { useEffect, useState, useRef } from "react";
// import { FileUploadSection } from "@/components/Upload/FileUploadSection";
// import Button from "@/components/Button";
// import toast from "react-hot-toast";
// import { FileIcon } from "@/components/Icons";
// import { FILE_CONFIG, getMaxSizeInBytes } from "@/lib/fileConfig";

// interface AssessmentData {
//   assessment_id: string;
//   type: string;
//   title: string;
//   description: string;
//   deadline: string;
// }

// interface Paper {
//   file_url: string;
//   created_on: string;
// }

// interface Submission {
//   submission_id: string;
//   file_url: string | null;
//   submission_start_at: string;
//   submission_end_at: string | null;
//   type: string;
//   is_graded: boolean;
//   grade: Graded | null;
// }

// interface Graded {
//   grade_id: string;
//   max_marks: number;
//   marks_awarded: number;
//   feedback: string;
//   graded_at: string;
//   auto_graded: boolean;
// }

// interface AssessmentResponse {
//   module_code: string;
//   module_name: string;
//   assessment_data: AssessmentData;
//   question_paper: Paper | null;
//   submissions: Submission[];
//   attempts_remaining: number | null;
//   last_attempt_grade: Graded | null;
// }

// interface AIGradingResult {
//   total_marks: number;
//   total_possible: number;
//   model: 'gemini' | 'openai';
// }

// export default function StudentAssessmentPage() {
//   const params = useParams();
//   const searchParams = useSearchParams();

//   const moduleId = searchParams.get("moduleId") ?? "";
//   const assessmentId = params.assessmentId as string;
//   const studentId = searchParams.get("studentId") ?? "";

//   const [assessment, setAssessment] = useState<AssessmentResponse | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [aiResults, setAiResults] = useState<AIGradingResult[]>([]);
//   const [loadingAiResults, setLoadingAiResults] = useState(false);

//   const [answerScriptFile, setAnswerScriptFile] = useState<File | null>(null);
//   const [isHandwritten, setIsHandwritten] = useState(false);
//   const [isUploading, setIsUploading] = useState(false);
//   const fileInputRef = useRef<HTMLInputElement>(null);

//   useEffect(() => {
//     if (!moduleId || !assessmentId) {
//       setError("Missing moduleId or assessmentId");
//       setLoading(false);
//       return;
//     }

//     const fetchAssessment = async () => {
//       setLoading(true);
//       setError(null);
//       try {
//         const queryParams = new URLSearchParams({ studentId, moduleId });
//         const url = `/api/student/enrollments/${moduleId}/assessment/${assessmentId}?${queryParams.toString()}`;

//         const res = await fetch(url);
//         if (!res.ok) {
//           const errData = await res.json();
//           throw new Error(errData.message || "Failed to fetch assessment");
//         }

//         const data: AssessmentResponse = await res.json();
//         setAssessment(data);
//       } catch (err) {
//         setError(err instanceof Error ? err.message : "Unknown error");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchAssessment();
//   }, [moduleId, assessmentId, studentId]);

//   // Fetch AI grading results
//   useEffect(() => {
//     const fetchAIResults = async () => {
//       if (!assessment || !studentId) return;

//       setLoadingAiResults(true);
//       try {
//         // First, get student registration number from student_id
//         const studentRes = await fetch(`/api/student/${studentId}`);
//         if (!studentRes.ok) return;
        
//         const studentData = await studentRes.json();
//         const registrationNumber = studentData.registration_number;

//         const results: AIGradingResult[] = [];

//         // Fetch from both Gemini and OpenAI tables
//         const models = ['gemini', 'openai'];
        
//         for (const model of models) {
//           try {
//             const response = await fetch(
//               `/api/ai-results/${model}?student_index=${registrationNumber}&assessment_id=${assessmentId}`
//             );
            
//             if (response.ok) {
//               const data = await response.json();
//               if (data && data.length > 0) {
//                 // Get the latest result for this model
//                 const latestResult = data[0];
//                 results.push({
//                   total_marks: latestResult.total_marks,
//                   total_possible: latestResult.total_possible,
//                   model: model === 'openai' ? 'openai' : 'gemini'
//                 });
//               }
//             }
//           } catch (error) {
//             console.error(`Failed to fetch ${model} results:`, error);
//           }
//         }

//         setAiResults(results);
//       } catch (error) {
//         console.error('Failed to fetch AI results:', error);
//       } finally {
//         setLoadingAiResults(false);
//       }
//     };

//     fetchAIResults();
//   }, [assessment, studentId, assessmentId]);

//   const getBestAIResult = () => {
//     if (aiResults.length === 0) return null;
    
//     return aiResults.reduce((best, current) => {
//       const currentPercentage = (current.total_marks / current.total_possible) * 100;
//       const bestPercentage = (best.total_marks / best.total_possible) * 100;
//       return currentPercentage > bestPercentage ? current : best;
//     });
//   };

//   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (!file) return;

//     // Extended file types to include images
//     const allowedTypes = [
//       ...FILE_CONFIG.ANSWER_SCRIPT.types, // Original types from config
//       '.png', '.jpg', '.jpeg', '.PNG', '.JPG', '.JPEG'
//     ];
    
//     const { maxSizeMB } = FILE_CONFIG.ANSWER_SCRIPT;

//     const isValidType = allowedTypes.some((ext) =>
//       file.name.toLowerCase().endsWith(ext.toLowerCase())
//     );
    
//     if (!isValidType) {
//       const originalTypes = FILE_CONFIG.ANSWER_SCRIPT.types.join(", ");
//       toast.error(`Invalid file type. Allowed types: ${originalTypes}, PNG, JPG, JPEG`);
//       return;
//     }

//     const maxSize = getMaxSizeInBytes(maxSizeMB);
//     if (file.size > maxSize) {
//       toast.error(`File size exceeds ${maxSizeMB}MB limit.`);
//       return;
//     }

//     setAnswerScriptFile(file);
//     e.target.value = "";
//   };

//   const handleUpload = async () => {
//     if (!answerScriptFile) return;

//     const toastId = toast.loading("Uploading answer script...");
//     setIsUploading(true);

//     try {
//       const formData = new FormData();
//       formData.append("file", answerScriptFile);
//       formData.append("isHandwritten", isHandwritten.toString());

//       const uploadUrl = `/api/student/enrollments/${moduleId}/assessment/${assessmentId}/submission/${studentId}`;

//       const res = await fetch(uploadUrl, {
//         method: "POST",
//         body: formData,
//       });

//       if (!res.ok) {
//         const err = await res.json();
//         throw new Error(err.message || "Upload failed");
//       }

//       toast.success("Answer script uploaded successfully!", { id: toastId });

//       // Refresh assessment data
//       const queryParams = new URLSearchParams({ studentId, moduleId });
//       const refreshRes = await fetch(
//         `/api/student/enrollments/${moduleId}/assessment/${assessmentId}?${queryParams.toString()}`
//       );
//       const refreshedData: AssessmentResponse = await refreshRes.json();
//       setAssessment(refreshedData);
//       setAnswerScriptFile(null);
//       setIsHandwritten(false);
//     } catch (error) {
//       toast.error(error instanceof Error ? error.message : "Upload failed", {
//         id: toastId,
//       });
//     } finally {
//       setIsUploading(false);
//     }
//   };

//   const triggerFileInput = () => {
//     fileInputRef.current?.click();
//   };

//   const getStatusBadge = (assessment: AssessmentResponse) => {
//     const bestAIResult = getBestAIResult();
//     const latestSubmission = assessment.submissions && assessment.submissions.length > 0 
//       ? assessment.submissions[assessment.submissions.length - 1] 
//       : null;
//     const isGraded = latestSubmission?.grade || assessment.last_attempt_grade || bestAIResult;
    
//     if (isGraded) {
//       return (
//         <div className="inline-flex items-center px-3 py-1.5 rounded-md text-sm font-medium bg-green-100 text-green-800 border border-green-200">
//           <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
//           Graded
//         </div>
//       );
//     }
//     if (latestSubmission) {
//       return (
//         <div className="inline-flex items-center px-3 py-1.5 rounded-md text-sm font-medium bg-blue-100 text-blue-800 border border-blue-200">
//           <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
//           Submitted
//         </div>
//       );
//     }
//     const deadline = new Date(assessment.assessment_data.deadline);
//     const now = new Date();
//     if (now > deadline) {
//       return (
//         <div className="inline-flex items-center px-3 py-1.5 rounded-md text-sm font-medium bg-red-100 text-red-800 border border-red-200">
//           <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
//           Overdue
//         </div>
//       );
//     }
//     return (
//       <div className="inline-flex items-center px-3 py-1.5 rounded-md text-sm font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
//         <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
//         Pending
//       </div>
//     );
//   };

//   const formatDate = (dateString: string) => {
//     return new Date(dateString).toLocaleDateString("en-US", {
//       year: "numeric",
//       month: "long",
//       day: "numeric",
//       hour: "2-digit",
//       minute: "2-digit",
//     });
//   };

//   const getGradePercentage = (awarded: number, total: number) => {
//     return ((awarded / total) * 100).toFixed(1);
//   };

//   const getFileIcon = (fileName: string) => {
//     const imageExtensions = ['.png', '.jpg', '.jpeg'];
//     const isImage = imageExtensions.some(ext => 
//       fileName.toLowerCase().endsWith(ext)
//     );
    
//     if (isImage) {
//       return (
//         <svg className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
//         </svg>
//       );
//     }
    
//     return (
//       <svg className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
//       </svg>
//     );
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gray-50 flex items-center justify-center">
//         <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
//           <div className="flex flex-col items-center space-y-4">
//             <div className="animate-spin rounded-full h-12 w-12 border-2 border-gray-300 border-t-gray-900"></div>
//             <div className="text-center">
//               <h3 className="text-lg font-semibold text-gray-900 mb-1">Loading Assessment</h3>
//               <p className="text-gray-600">Please wait while we fetch your assessment details</p>
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
//         <div className="bg-white p-8 rounded-lg shadow-sm border border-red-200 max-w-md w-full">
//           <div className="text-center">
//             <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-50 mb-4">
//               <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
//               </svg>
//             </div>
//             <h3 className="text-lg font-semibold text-red-900 mb-2">Error Loading Assessment</h3>
//             <p className="text-red-700 mb-4">{error}</p>
//             <button className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm font-medium">
//               Try Again
//             </button>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   if (!assessment) {
//     return (
//       <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
//         <div className="text-center">
//           <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-gray-100 mb-4">
//             <svg className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
//             </svg>
//           </div>
//           <h2 className="text-xl font-semibold text-gray-900 mb-2">No Assessment Found</h2>
//           <p className="text-gray-600">The requested assessment could not be found.</p>
//         </div>
//       </div>
//     );
//   }

//   // Get submission and grading data
//   const bestAIResult = getBestAIResult();
//   const latestSubmission = assessment.submissions && assessment.submissions.length > 0 
//     ? assessment.submissions[assessment.submissions.length - 1] 
//     : null;
//   const gradeInfo = latestSubmission?.grade || assessment.last_attempt_grade;

//   // Create extended accept attribute for file input
//   const extendedFileTypes = [
//     ...FILE_CONFIG.ANSWER_SCRIPT.types,
//     '.png', '.jpg', '.jpeg'
//   ].join(',');

//   return (
//     <div className="min-h-screen bg-gray-50">
//       <div className="max-w-5xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        
//         {/* Header Section */}
//         <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
//           <div className="px-6 py-5 border-b border-gray-200">
//             <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
//               <div className="mb-4 lg:mb-0">
//                 <h1 className="text-2xl font-bold text-gray-900 mb-1">
//                   {assessment.module_code} • {assessment.module_name}
//                 </h1>
//                 <p className="text-gray-600">Assessment Portal</p>
//               </div>
//               <div className="flex flex-col items-start lg:items-end space-y-2">
//                 {getStatusBadge(assessment)}
//                 <div className="text-right">
//                   <p className="text-sm text-gray-500">Due Date</p>
//                   <p className="font-medium text-gray-900">{formatDate(assessment.assessment_data.deadline)}</p>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Assessment Information */}
//         <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
//           <div className="px-6 py-5 border-b border-gray-200">
//             <div className="flex items-start space-x-4">
//               <div className="flex-shrink-0 mt-1">
//                 <div className="p-2 bg-gray-100 rounded-lg">
//                   <svg className="h-5 w-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
//                   </svg>
//                 </div>
//               </div>
//               <div className="flex-1 min-w-0">
//                 <h2 className="text-xl font-semibold text-gray-900 mb-2">
//                   {assessment.assessment_data.title}
//                 </h2>
//                 <div className="flex items-center space-x-3 mb-3">
//                   <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-800">
//                     {assessment.assessment_data.type}
//                   </span>
//                 </div>
//                 {assessment.assessment_data.description && (
//                   <p className="text-gray-700 leading-relaxed">
//                     {assessment.assessment_data.description}
//                   </p>
//                 )}
//               </div>
//             </div>
//           </div>

//           {/* Question Paper Section */}
//           {assessment.question_paper && (
//             <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
//               <div className="flex items-center justify-between">
//                 <div className="flex items-center space-x-3">
//                   <div className="p-2 bg-white rounded-lg border border-gray-200">
//                     <svg className="h-4 w-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
//                     </svg>
//                   </div>
//                   <div>
//                     <h3 className="font-medium text-gray-900">Question Paper</h3>
//                     <p className="text-sm text-gray-500">
//                       Uploaded: {formatDate(assessment.question_paper.created_on)}
//                     </p>
//                   </div>
//                 </div>
//                 <a
//                   href={assessment.question_paper.file_url}
//                   target="_blank"
//                   rel="noopener noreferrer"
//                   className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
//                 >
//                   Download
//                   <svg className="ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
//                   </svg>
//                 </a>
//               </div>
//             </div>
//           )}
//         </div>

//         {/* Submission Section */}
//         <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
//           <div className="px-6 py-5 border-b border-gray-200">
//             <div className="flex items-center space-x-3">
//               <div className="p-2 bg-gray-100 rounded-lg">
//                 <svg className="h-5 w-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
//                 </svg>
//               </div>
//               <h3 className="text-lg font-semibold text-gray-900">Answer Submission</h3>
//             </div>
//           </div>

//           <div className="px-6 py-5">
//             {latestSubmission ? (
//               <div className="p-4 bg-green-50 rounded-lg border border-green-200">
//                 <div className="flex items-start space-x-3">
//                   <div className="flex-shrink-0 mt-0.5">
//                     <div className="p-1.5 bg-green-100 rounded-full">
//                       <svg className="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
//                       </svg>
//                     </div>
//                   </div>
//                   <div className="flex-1 min-w-0">
//                     <h4 className="font-medium text-green-900 mb-1">
//                       Submission Completed
//                     </h4>
//                     <p className="text-sm text-green-700 mb-3">
//                       Submitted on {formatDate(latestSubmission.submission_start_at)}
//                     </p>
//                     {latestSubmission.file_url && (
//                       <a
//                         href={latestSubmission.file_url}
//                         target="_blank"
//                         rel="noopener noreferrer"
//                         className="inline-flex items-center text-sm font-medium text-green-700 hover:text-green-800"
//                       >
//                         View Submission
//                         <svg className="ml-1 h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
//                         </svg>
//                       </a>
//                     )}
//                   </div>
//                 </div>
//               </div>
//             ) : (
//               <div className="space-y-4">
//                 <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg text-center">
//                   <div className="flex flex-col items-center">
//                     <div className="p-3 bg-gray-100 rounded-full mb-3">
//                       <svg className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
//                       </svg>
//                     </div>
//                     <h4 className="font-medium text-gray-900 mb-1">Upload Answer Script</h4>
//                     <p className="text-sm text-gray-600">
//                       Supported formats: Documents, PDFs, Images (PNG, JPG, JPEG)
//                     </p>
//                   </div>
//                 </div>

//                 <FileUploadSection
//                   title="Select File"
//                   type='ANSWER_SCRIPT'
//                   icon={<FileIcon />}
//                   uploadedFile={answerScriptFile}
//                   onTriggerUpload={triggerFileInput}
//                 />

//                 <input
//                   type="file"
//                   ref={fileInputRef}
//                   onChange={handleFileChange}
//                   accept={extendedFileTypes}
//                   className="hidden"
//                 />

//                 {answerScriptFile && (
//                   <div className="space-y-4">
//                     <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
//                       <div className="flex items-center space-x-3">
//                         {getFileIcon(answerScriptFile.name)}
//                         <div className="flex-1 min-w-0">
//                           <p className="font-medium text-gray-900 truncate">
//                             {answerScriptFile.name}
//                           </p>
//                           <p className="text-sm text-gray-500">
//                             {(answerScriptFile.size / (1024 * 1024)).toFixed(2)} MB
//                           </p>
//                         </div>
//                         <div className="flex-shrink-0">
//                           <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
//                             Ready
//                           </span>
//                         </div>
//                       </div>
//                     </div>

//                     {/* Handwritten Checkbox */}
//                     <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
//                       <label className="flex items-start space-x-3 cursor-pointer">
//                         <div className="flex-shrink-0 mt-0.5">
//                           <input
//                             type="checkbox"
//                             id="handwritten"
//                             checked={isHandwritten}
//                             onChange={(e) => setIsHandwritten(e.target.checked)}
//                             className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
//                           />
//                         </div>
//                         <div className="min-w-0">
//                           <span className="font-medium text-gray-900">Handwritten Script</span>
//                           <p className="text-sm text-gray-600 mt-0.5">
//                             Check this box if your answer script contains handwritten content
//                           </p>
//                         </div>
//                       </label>
//                     </div>

//                     <Button
//                       onClick={handleUpload}
//                       disabled={isUploading}
//                       className="w-full py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
//                     >
//                       {isUploading ? (
//                         <div className="flex items-center justify-center space-x-2">
//                           <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
//                           <span>Uploading...</span>
//                         </div>
//                       ) : (
//                         <div className="flex items-center justify-center space-x-2">
//                           <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
//                           </svg>
//                           <span>Submit Answer Script</span>
//                         </div>
//                       )}
//                     </Button>
//                   </div>
//                 )}
//               </div>
//             )}
//           </div>
//         </div>

//         {/* Grading Section */}
//         <div className="bg-white rounded-lg shadow-sm border border-gray-200">
//           <div className="px-6 py-5 border-b border-gray-200">
//             <div className="flex items-center space-x-3">
//               <div className="p-2 bg-gray-100 rounded-lg">
//                 <svg className="h-5 w-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
//                 </svg>
//               </div>
//               <h3 className="text-lg font-semibold text-gray-900">Assessment Results</h3>
//             </div>
//           </div>

//           <div className="px-6 py-5">
//             {gradeInfo || bestAIResult ? (
//               <div className="space-y-6">
//                 {/* Grade Statistics */}
//                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                   <div className="p-5 border border-gray-200 rounded-lg text-center">
//                     <div className="text-3xl font-bold text-gray-900 mb-2">
//                       {gradeInfo 
//                         ? gradeInfo.marks_awarded 
//                         : bestAIResult?.total_marks
//                       }
//                     </div>
//                     <p className="text-sm font-medium text-gray-600">Marks Earned</p>
//                   </div>
                  
//                   <div className="p-5 border border-gray-200 rounded-lg text-center">
//                     <div className="text-3xl font-bold text-gray-900 mb-2">
//                       {gradeInfo 
//                         ? gradeInfo.max_marks 
//                         : bestAIResult?.total_possible
//                       }
//                     </div>
//                     <p className="text-sm font-medium text-gray-600">Total Marks</p>
//                   </div>
                  
//                   <div className="p-5 border border-gray-200 rounded-lg text-center bg-gray-50">
//                     <div className="text-3xl font-bold text-gray-900 mb-2">
//                       {gradeInfo 
//                         ? getGradePercentage(gradeInfo.marks_awarded, gradeInfo.max_marks)
//                         : getGradePercentage(bestAIResult?.total_marks || 0, bestAIResult?.total_possible || 1)
//                       }%
//                     </div>
//                     <p className="text-sm font-medium text-gray-600">Final Score</p>
//                   </div>
//                 </div>

//                 {/* Feedback Section */}
//                 {gradeInfo?.feedback && (
//                   <div className="p-5 bg-blue-50 rounded-lg border border-blue-200">
//                     <div className="flex items-start space-x-3">
//                       <div className="flex-shrink-0 mt-0.5">
//                         <div className="p-1.5 bg-blue-100 rounded-full">
//                           <svg className="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
//                           </svg>
//                         </div>
//                       </div>
//                       <div className="min-w-0 flex-1">
//                         <h4 className="font-medium text-blue-900 mb-2">Instructor Feedback</h4>
//                         <p className="text-blue-800 leading-relaxed">{gradeInfo.feedback}</p>
//                       </div>
//                     </div>
//                   </div>
//                 )}

//                 {/* Grading Details */}
//                 <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
//                   <div className="flex items-center space-x-2 mb-2 sm:mb-0">
//                     <svg className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
//                     </svg>
//                     <span className="text-sm text-gray-700">
//                       Graded on {gradeInfo 
//                         ? formatDate(gradeInfo.graded_at)
//                         : "Recently"
//                       }
//                     </span>
//                   </div>
//                   <div className="inline-flex items-center px-3 py-1 rounded-md text-xs font-medium bg-green-100 text-green-800 border border-green-200">
//                     <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
//                     Auto Graded
//                   </div>
//                 </div>
//               </div>
//             ) : (
//               <div>
//                 {loadingAiResults ? (
//                   <div className="text-center py-12">
//                     <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-gray-900 mx-auto mb-4"></div>
//                     <h4 className="font-medium text-gray-900 mb-1">Processing Results</h4>
//                     <p className="text-gray-600">Analyzing your submission...</p>
//                   </div>
//                 ) : (
//                   <div className="text-center py-12">
//                     <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-gray-100 mb-4">
//                       <svg className="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
//                       </svg>
//                     </div>
//                     <h4 className="text-lg font-semibold text-gray-900 mb-2">Awaiting Assessment</h4>
//                     <p className="text-gray-600 mb-1">Your submission is currently under review</p>
//                     <p className="text-sm text-gray-500">Results will appear here once grading is complete</p>
//                   </div>
//                 )}
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }