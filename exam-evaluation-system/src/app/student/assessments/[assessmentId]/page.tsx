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
  file_url: string;
  submission_time: string;
}

interface Graded {
  grade_id: string;
  total_marks: number;
  marks_awarded: number;
  feedback: string;
  grading_time: string;
  auto_graded: boolean;
}

interface AssessmentResponse {
  module_code: string;
  module_name: string;
  assessment_data: AssessmentData;
  question_paper: Paper | null;
  submission: Submission | null;
  graded: Graded | null;
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

  const [answerScriptFile, setAnswerScriptFile] = useState<File | null>(null);
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const { types, maxSizeMB } = FILE_CONFIG.ANSWER_SCRIPT;

    const isValidType = types.some((ext) =>
      file.name.toLowerCase().endsWith(ext)
    );
    if (!isValidType) {
      toast.error(`Invalid file type. Allowed types: ${types.join(", ")}`);
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
    if (assessment.graded) {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
          Graded
        </span>
      );
    }
    if (assessment.submission) {
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

          {assessment.submission ? (
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
                    {formatDate(assessment.submission.submission_time)}
                  </p>
                  <a
                    href={assessment.submission.file_url}
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
              </div>

              <FileUploadSection
                title="Upload Answer Script"
                acceptedTypes={FILE_CONFIG.ANSWER_SCRIPT.types
                  .map((ext) => ext.toUpperCase().replace(".", ""))
                  .join(", ")}
                maxSize={`${FILE_CONFIG.ANSWER_SCRIPT.maxSizeMB}MB`}
                icon={<FileIcon />}
                uploadedFile={answerScriptFile}
                onTriggerUpload={triggerFileInput}
              />

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept={FILE_CONFIG.ANSWER_SCRIPT.types.join(",")}
                className="hidden"
              />

              {answerScriptFile && (
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center space-x-3">
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
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {answerScriptFile.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {(answerScriptFile.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={handleUpload}
                    disabled={isUploading}
                    className="ml-4"
                  >
                    {isUploading ? (
                      <div className="flex items-center space-x-2">
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

          {assessment.graded ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-900">
                      {assessment.graded.marks_awarded}
                    </p>
                    <p className="text-sm text-blue-600">Marks Awarded</p>
                  </div>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900">
                      {assessment.graded.total_marks}
                    </p>
                    <p className="text-sm text-gray-600">Total Marks</p>
                  </div>
                </div>
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-900">
                      {getGradePercentage(
                        assessment.graded.marks_awarded,
                        assessment.graded.total_marks
                      )}
                      %
                    </p>
                    <p className="text-sm text-green-600">Percentage</p>
                  </div>
                </div>
              </div>

              {assessment.graded.feedback && (
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <h4 className="font-medium text-gray-900 mb-2">Feedback</h4>
                  <p className="text-gray-700">{assessment.graded.feedback}</p>
                </div>
              )}

              <div className="flex items-center justify-between text-sm text-gray-600 border-t border-gray-200 pt-4">
                <span>
                  Graded on: {formatDate(assessment.graded.grading_time)}
                </span>
                <span
                  className={`px-2 py-1 rounded text-xs ${
                    assessment.graded.auto_graded
                      ? "bg-purple-100 text-purple-800"
                      : "bg-blue-100 text-blue-800"
                  }`}
                >
                  {assessment.graded.auto_graded
                    ? "Auto Graded"
                    : "Manually Graded"}
                </span>
              </div>
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
      </div>
    </div>
  );
}
