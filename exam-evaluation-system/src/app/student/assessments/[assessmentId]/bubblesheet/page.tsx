// src/app/student/assessments/[assessmentId]/bubblesheet/page.tsx
"use client";

import { useSearchParams, useParams } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import toast from "react-hot-toast";
import { 
  FiFileText, 
  FiCheckCircle, 
  FiClock, 
  FiAlertCircle,
  FiUpload,
  FiX,
  FiImage,
  FiDownload
} from "react-icons/fi";

interface AssessmentData {
  assessment_id: string;
  type: string;
  title: string;
  description: string;
  deadline: string;
}

interface BubbleSheetResult {
  total_questions: number;
  correct_answers: number;
  incorrect_answers: number;
  unanswered: number;
  total_marks: number;
  percentage: number;
  evaluated_on: string;
}

interface AssessmentResponse {
  module_code: string;
  module_name: string;
  assessment_data: AssessmentData;
  question_paper: { file_url: string } | null;
  bubblesheet_result: BubbleSheetResult | null;
  has_submitted: boolean;
}

export default function StudentBubbleSheetPage() {
  const params = useParams();
  const searchParams = useSearchParams();

  const moduleId = searchParams.get("moduleId") ?? "";
  const assessmentId = params.assessmentId as string;
  const studentId = searchParams.get("studentId") ?? "";

  const [assessment, setAssessment] = useState<AssessmentResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [answerSheetFile, setAnswerSheetFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  console.log("🎯 BUBBLE SHEET PAGE LOADED");
  console.log("Student ID:", studentId);
  console.log("Assessment ID:", assessmentId);
  console.log("Module ID:", moduleId);

  useEffect(() => {
    if (!moduleId || !assessmentId || !studentId) {
      setError("Missing required parameters");
      setLoading(false);
      return;
    }
    fetchAssessment();
  }, [moduleId, assessmentId, studentId]);

  const fetchAssessment = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/student/enrollments/${moduleId}/assessment/${assessmentId}/bubblesheet?studentId=${studentId}`
      );
      
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedExtensions = ['.png', '.jpg', '.jpeg'];
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    
    if (!allowedExtensions.includes(fileExtension)) {
      toast.error("Invalid file type. Please upload PNG, JPG, or JPEG image only.");
      return;
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      toast.error("File size exceeds 10MB limit");
      return;
    }

    setAnswerSheetFile(file);
    e.target.value = "";
  };

  const handleUpload = async () => {
    if (!answerSheetFile) {
      toast.error("Please select a file first");
      return;
    }

    console.log("🎯 STARTING BUBBLE SHEET UPLOAD");
    console.log("File:", answerSheetFile.name);
    console.log("File type:", answerSheetFile.type);
    console.log("File size:", answerSheetFile.size);

    const toastId = toast.loading("Processing bubble sheet...");
    setIsUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append("file", answerSheetFile);

      const uploadUrl = `/api/student/bubblesheet/upload?studentId=${studentId}&assessmentId=${assessmentId}&moduleId=${moduleId}`;
      
      console.log("🎯 Upload URL:", uploadUrl);
      console.log("🎯 Calling BUBBLE SHEET API (NOT submission API)");
      console.log("🎯 This should call Flask on port 7000");

      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const res = await fetch(uploadUrl, {
        method: "POST",
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      console.log("Response status:", res.status);

      if (!res.ok) {
        const err = await res.json();
        console.error("Upload error:", err);
        throw new Error(err.error || err.details || "Upload failed");
      }

      const result = await res.json();
      console.log("✅ Upload successful:", result);
      
      toast.success(
        `Bubble sheet processed! Detected ${result.answers_count} answers.`,
        { id: toastId }
      );

      await fetchAssessment();
      setAnswerSheetFile(null);
      setUploadProgress(0);
    } catch (error) {
      console.error("❌ Upload error:", error);
      toast.error(
        error instanceof Error ? error.message : "Upload failed",
        { id: toastId }
      );
      setUploadProgress(0);
    } finally {
      setIsUploading(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
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

  const getStatusBadge = () => {
    if (assessment?.bubblesheet_result) {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <FiCheckCircle className="mr-1.5 h-3.5 w-3.5" />
          Evaluated
        </span>
      );
    }
    if (assessment?.has_submitted) {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          <FiClock className="mr-1.5 h-3.5 w-3.5" />
          Submitted
        </span>
      );
    }
    const deadline = new Date(assessment?.assessment_data.deadline || "");
    const now = new Date();
    if (now > deadline) {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <FiAlertCircle className="mr-1.5 h-3.5 w-3.5" />
          Overdue
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
        <FiClock className="mr-1.5 h-3.5 w-3.5" />
        Pending
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="text-lg font-medium text-gray-600">Loading assessment...</span>
        </div>
      </div>
    );
  }

  if (error || !assessment) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-xl shadow-sm border border-red-200 max-w-md w-full">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <FiAlertCircle className="h-6 w-6 text-red-500" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-red-900">Error Loading Assessment</h3>
              <p className="text-sm text-red-600 mt-1">{error || "Assessment not found"}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-sm font-medium text-gray-500">
                  {assessment.module_code}
                </span>
                <span className="text-gray-300">•</span>
                <span className="text-sm text-gray-500">{assessment.module_name}</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-1">
                {assessment.assessment_data.title}
              </h1>
              <p className="text-sm text-gray-600">Bubble Sheet Assessment</p>
            </div>
            {getStatusBadge()}
          </div>

          <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-gray-100">
            <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium bg-purple-100 text-purple-800">
              Multiple Choice Questions
            </span>
            <div className="flex items-center text-sm text-gray-600">
              <FiClock className="mr-1.5 h-4 w-4" />
              Due: {formatDate(assessment.assessment_data.deadline)}
            </div>
          </div>
        </div>

        {/* Description Card */}
        {assessment.assessment_data.description && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-sm font-semibold text-gray-900 mb-3">Description</h2>
            <p className="text-gray-700 leading-relaxed">{assessment.assessment_data.description}</p>
          </div>
        )}

        {/* Question Paper Card */}
        {assessment.question_paper && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-sm font-semibold text-gray-900 mb-4">Question Paper</h2>
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FiFileText className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Question Paper</p>
                  <p className="text-xs text-gray-500">PDF Document</p>
                </div>
              </div>
              <a
                href={assessment.question_paper.file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                <FiDownload className="mr-2 h-4 w-4" />
                Download
              </a>
            </div>
          </div>
        )}

        {/* Upload Section Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Answer Sheet Submission
          </h2>

          {assessment.has_submitted && !assessment.bubblesheet_result ? (
            <div className="p-5 bg-blue-50 rounded-xl border border-blue-200">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <FiClock className="h-5 w-5 text-blue-600 mt-0.5" />
                </div>
                <div>
                  <p className="font-semibold text-blue-900">Submitted - Awaiting Evaluation</p>
                  <p className="text-sm text-blue-700 mt-1">
                    Your answer sheet has been submitted successfully. Results will appear here once the evaluation is complete.
                  </p>
                </div>
              </div>
            </div>
          ) : assessment.bubblesheet_result ? (
            <div className="p-5 bg-green-50 rounded-xl border border-green-200">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <FiCheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                </div>
                <div>
                  <p className="font-semibold text-green-900">Submission Completed & Evaluated</p>
                  <p className="text-sm text-green-700 mt-1">
                    Your bubble sheet has been evaluated. View your results below.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Instructions */}
              <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <FiAlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-amber-900 mb-2">
                      Upload Instructions
                    </p>
                    <ul className="text-xs text-amber-800 space-y-1.5 list-disc list-inside">
                      <li>Upload a clear, high-quality image of your filled bubble sheet</li>
                      <li>Supported formats: PNG, JPG, JPEG (Maximum 10MB)</li>
                      <li>Ensure all marked bubbles are clearly visible and legible</li>
                      <li>Avoid shadows, glare, or blurry images for accurate processing</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Hidden File Input */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".png,.jpg,.jpeg"
                className="hidden"
              />

              {/* File Upload Area */}
              {!answerSheetFile ? (
                <button
                  onClick={triggerFileInput}
                  className="w-full border-2 border-dashed border-gray-300 rounded-xl p-10 text-center hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 group"
                >
                  <div className="flex flex-col items-center">
                    <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-blue-100 transition-colors">
                      <FiImage className="h-8 w-8 text-gray-400 group-hover:text-blue-500 transition-colors" />
                    </div>
                    <p className="text-base font-semibold text-gray-700 mb-1">
                      Click to upload bubble sheet
                    </p>
                    <p className="text-sm text-gray-500">
                      PNG, JPG or JPEG (max. 10MB)
                    </p>
                  </div>
                </button>
              ) : (
                <div className="space-y-4">
                  {/* Selected File Preview */}
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3 flex-1 min-w-0">
                        <div className="flex-shrink-0 h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                          <FiFileText className="h-6 w-6 text-green-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {answerSheetFile.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {(answerSheetFile.size / (1024 * 1024)).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => setAnswerSheetFile(null)}
                        className="flex-shrink-0 ml-3 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        disabled={isUploading}
                      >
                        <FiX className="h-5 w-5" />
                      </button>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  {isUploading && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium text-gray-700">Processing bubble sheet...</span>
                        <span className="font-semibold text-blue-600">{uploadProgress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-blue-600 h-2.5 rounded-full transition-all duration-300 ease-out"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Upload Button */}
                  <button
                    onClick={handleUpload}
                    disabled={isUploading}
                    className={`w-full py-3.5 px-6 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center ${
                      isUploading
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg"
                    }`}
                  >
                    {isUploading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                        Processing...
                      </>
                    ) : (
                      <>
                        <FiUpload className="mr-2 h-5 w-5" />
                        Upload & Process Bubble Sheet
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Results Section */}
        {assessment.bubblesheet_result && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Your Results</h2>
              <span className="text-xs text-gray-500">
                Evaluated on: {formatDate(assessment.bubblesheet_result.evaluated_on)}
              </span>
            </div>

            {/* Question Statistics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="p-5 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200">
                <div className="text-center">
                  <p className="text-3xl font-bold text-green-900 mb-1">
                    {assessment.bubblesheet_result.correct_answers}
                  </p>
                  <p className="text-xs font-medium text-green-700 uppercase tracking-wide">Correct</p>
                </div>
              </div>
              
              <div className="p-5 bg-gradient-to-br from-red-50 to-rose-50 rounded-xl border border-red-200">
                <div className="text-center">
                  <p className="text-3xl font-bold text-red-900 mb-1">
                    {assessment.bubblesheet_result.incorrect_answers}
                  </p>
                  <p className="text-xs font-medium text-red-700 uppercase tracking-wide">Incorrect</p>
                </div>
              </div>
              
              <div className="p-5 bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl border border-gray-200">
                <div className="text-center">
                  <p className="text-3xl font-bold text-gray-900 mb-1">
                    {assessment.bubblesheet_result.unanswered}
                  </p>
                  <p className="text-xs font-medium text-gray-700 uppercase tracking-wide">Unanswered</p>
                </div>
              </div>
              
              <div className="p-5 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border border-blue-200">
                <div className="text-center">
                  <p className="text-3xl font-bold text-blue-900 mb-1">
                    {assessment.bubblesheet_result.total_questions}
                  </p>
                  <p className="text-xs font-medium text-blue-700 uppercase tracking-wide">Total</p>
                </div>
              </div>
            </div>

            {/* Score Summary Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-6 bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl border border-purple-200">
                <div className="text-center">
                  <p className="text-4xl font-bold text-purple-900 mb-2">
                    {assessment.bubblesheet_result.total_marks}
                  </p>
                  <p className="text-sm font-semibold text-purple-700 uppercase tracking-wide">Total Marks</p>
                </div>
              </div>
              
              <div className="p-6 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl border border-indigo-200">
                <div className="text-center">
                  <p className="text-4xl font-bold text-indigo-900 mb-2">
                    {assessment.bubblesheet_result.percentage.toFixed(1)}%
                  </p>
                  <p className="text-sm font-semibold text-indigo-700 uppercase tracking-wide">Percentage</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}