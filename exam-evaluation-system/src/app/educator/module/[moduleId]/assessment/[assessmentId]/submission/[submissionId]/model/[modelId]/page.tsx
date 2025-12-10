"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Save,
  FileText,
  Image,
  Video,
  Edit2,
  X,
  Check,
  Eye,
  Download,
  ArrowLeft,
  Cpu,
} from "lucide-react";
import LoadingAnimation from "@/components/LoadingAnimation";

// Define types for the data structure
interface User {
  user_id: string;
  title: string | null;
  first_name: string;
  last_name: string;
  username: string;
  email: string;
  phone_number: string | null;
  country: string | null;
  city: string | null;
  profile_image_url: string | null;
}

interface Student {
  registration_number: string;
  education_institute: string;
  user: User;
}

interface Media {
  id: string;
  media_url: string;
  media_summary?: string;
}

interface Question {
  id: string;
  question_number: number;
  question_text: string;
  answer_text: string;
  guideline_text: string | null;
  mcq_answer_options: string[];
  max_marks: number;
  type: string;
  media: Media[];
}

interface StudentAnswer {
  id: string;
  question_number: number;
  answer_text: string;
  score: number | null;
  feedback: string | null;
  graded_at: string;
  media: Media[];
  evaluation_model: {
    id: string;
    model_name: string;
    provider: string;
  };
  question: Question;
}

interface Submission {
  submission_id: string;
  file_url: string | null;
  media_extracted_file_url: string | null;
  is_handwritten: boolean;
  handwritten_file_url: string | null;
  is_graded: boolean;
  student: Student;
}

interface Module {
  module_id: string;
  module_code: string;
  module_name: string;
}

interface Assessment {
  assessment_id: string;
  assessment_name: string;
  assessment_type: string;
  deadline: string;
  model_id: string;
}

interface EvaluationModel {
  id: string;
  model_name: string;
  provider: string;
  chat_model: string;
  temperature: number;
  embedding_model: string;
  description: string | null;
}

interface SubmissionData {
  submission: Submission;
  module: Module;
  assessment: Assessment;
  student_answers: StudentAnswer[];
  evaluation_model: EvaluationModel;
}

export default function SubmissionReviewPage() {
  const params = useParams();
  const router = useRouter();

  // Extract params with null checks
  const moduleId = params?.moduleId as string;
  const assessmentId = params?.assessmentId as string;
  const submissionId = params?.submissionId as string;
  const modelId = params?.modelId as string;

  const [data, setData] = useState<SubmissionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingAnswer, setEditingAnswer] = useState<string | null>(null);
  const [editedFeedback, setEditedFeedback] = useState("");
  const [editedScore, setEditedScore] = useState("");
  const [viewingFile, setViewingFile] = useState<{
    url: string;
    type: string;
  } | null>(null);

  useEffect(() => {
    if (moduleId && assessmentId && submissionId && modelId) {
      fetchSubmissionData();
    }
  }, [moduleId, assessmentId, submissionId, modelId]);

  const fetchSubmissionData = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/educator/module/${moduleId}/assessment/${assessmentId}/submission/${submissionId}/model/${modelId}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToResults = () => {
    if (moduleId && assessmentId) {
      router.push(
        `/educator/module/${moduleId}/assessment/${assessmentId}/assessment-results`
      );
    }
  };

  const startEditing = (answer: StudentAnswer) => {
    setEditingAnswer(answer.id);
    setEditedFeedback(answer.feedback || "");
    setEditedScore(answer.score?.toString() || "");
  };

  const cancelEditing = () => {
    setEditingAnswer(null);
    setEditedFeedback("");
    setEditedScore("");
  };

  const saveChanges = async (answerId: string) => {
    try {
      setSaving(true);

      const response = await fetch(
        `/api/educator/submission/${submissionId}/${answerId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            feedback: editedFeedback,
            score: editedScore ? parseFloat(editedScore) : null,
          }),
        }
      );

      if (response.ok) {
        const result = await response.json();

        setData((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            student_answers: prev.student_answers.map((ans) =>
              ans.id === answerId
                ? {
                    ...ans,
                    feedback: editedFeedback,
                    score: editedScore ? parseFloat(editedScore) : null,
                  }
                : ans
            ),
          };
        });
        cancelEditing();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save changes");
      }
    } catch (error) {
      console.error("Error saving changes:", error);
      alert(
        `Failed to save changes. ${
          error instanceof Error ? error.message : "Please try again."
        }`
      );
    } finally {
      setSaving(false);
    }
  };

  const FileViewer = ({
    url,
    type,
    onClose,
  }: {
    url: string;
    type: string;
    onClose: () => void;
  }) => (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-6xl w-full max-h-[90vh] flex flex-col shadow-2xl">
        <div className="flex justify-between items-center p-6 border-b bg-gradient-to-r from-slate-50 to-slate-100">
          <h3 className="font-semibold text-xl text-slate-800">File Preview</h3>
          <div className="flex gap-2">
            <a
              href={url}
              download
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 hover:bg-slate-200 rounded-lg transition-colors"
              title="Download"
            >
              <Download className="w-5 h-5 text-slate-700" />
            </a>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-200 rounded-lg transition-colors"
              title="Close"
            >
              <X className="w-5 h-5 text-slate-700" />
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-auto p-6 bg-slate-50">
          {type === "pdf" ? (
            <iframe
              src={url}
              className="w-full h-full min-h-[600px] rounded-lg"
              title="PDF Viewer"
            />
          ) : type === "image" ? (
            <img
              src={url}
              alt="Submission"
              className="max-w-full h-auto mx-auto rounded-lg shadow-md"
            />
          ) : type === "video" ? (
            <video
              controls
              className="max-w-full h-auto mx-auto rounded-lg shadow-md"
            >
              <source src={url} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          ) : (
            <div className="text-center p-8">
              <p className="text-slate-700">
                Preview not available.{" "}
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700 underline font-medium"
                >
                  Download file
                </a>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <LoadingAnimation
        size="lg"
        variant="wave"
        text="Loading submission..."
        fullScreen={true}
        color="blue"
      />
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center bg-white p-8 rounded-xl shadow-lg">
          <div className="text-red-600 mb-4">
            <X className="w-16 h-16 mx-auto mb-2" />
            <p className="text-lg font-semibold">
              Error loading submission data
            </p>
          </div>
          <button
            onClick={() => router.back()}
            className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const totalScore = data.student_answers.reduce((sum, ans) => {
    const score =
      ans.score !== null && ans.score !== undefined ? Number(ans.score) : 0;
    return sum + score;
  }, 0);

  const maxScore = data.student_answers.reduce((sum, ans) => {
    const maxMarks =
      ans.question?.max_marks !== undefined
        ? Number(ans.question.max_marks)
        : 0;
    return sum + maxMarks;
  }, 0);

  const formatScore = (score: number) => {
    if (Number.isInteger(score)) {
      return score.toString();
    }
    return score.toFixed(2);
  };

  const percentage = maxScore > 0 ? (totalScore / maxScore) * 100 : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      {viewingFile && (
        <FileViewer
          url={viewingFile.url}
          type={viewingFile.type}
          onClose={() => setViewingFile(null)}
        />
      )}

      <div className="max-w-7xl mx-auto p-6">
        {/* Back Button */}
        <button
          onClick={handleBackToResults}
          className="mb-6 flex items-center gap-2 text-slate-700 hover:text-slate-900 transition-colors px-4 py-2.5 rounded-lg hover:bg-white shadow-sm bg-white/70 backdrop-blur-sm font-medium"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Results</span>
        </button>

        {/* Header */}
        <div className="bg-white rounded-xl shadow-md p-8 mb-6 border border-slate-200">
          <div className="flex justify-between items-start mb-6">
            <div className="flex-1 pr-6">
              <h1 className="text-4xl font-bold text-slate-900 mb-3">
                {data.assessment.assessment_name}
              </h1>
              <p className="text-slate-600 text-lg font-medium mb-3">
                {data.module.module_code} - {data.module.module_name}
              </p>

              {/* Display Model Name */}
              {data.evaluation_model && (
                <div className="mt-3 flex items-center gap-3 flex-wrap">
                  <div className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-semibold bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-900 border border-indigo-200 shadow-sm">
                    <Cpu className="w-4 h-4 mr-2" />
                    <span className="mr-2">Model:</span>
                    <span className="font-bold">
                      {data.evaluation_model.model_name}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="text-right bg-gradient-to-br from-blue-50 to-indigo-50 px-8 py-6 rounded-xl border-2 border-blue-200 flex-shrink-0">
              <div className="text-4xl font-bold text-blue-700 mb-1">
                {formatScore(totalScore)} / {formatScore(maxScore)}
              </div>
              <p className="text-sm text-slate-600 font-medium mb-2">
                Total Score
              </p>
              <div className="text-lg font-semibold text-indigo-600">
                {formatScore(percentage)}%
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 pt-6 border-t border-slate-200">
            <div>
              <p className="text-sm text-slate-500 font-medium mb-1">
                Assessment Type
              </p>
              <p className="font-semibold text-slate-800 text-lg">
                {data.assessment.assessment_type}
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-500 font-medium mb-1">
                Deadline
              </p>
              <p className="font-semibold text-slate-800 text-lg">
                {new Date(data.assessment.deadline).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        {/* Student Info */}
        <div className="bg-white rounded-xl shadow-md p-8 mb-6 border border-slate-200">
          <h2 className="text-2xl font-bold mb-6 text-slate-900">
            Student Information
          </h2>
          <div className="flex items-start gap-6">
            {data.submission.student.user.profile_image_url && (
              <img
                src={data.submission.student.user.profile_image_url}
                alt="Student"
                className="w-20 h-20 rounded-full object-cover border-4 border-blue-100 shadow-md"
              />
            )}
            <div className="flex-1 grid grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-slate-500 font-medium mb-1">Name</p>
                <p className="font-semibold text-slate-800 text-lg">
                  {data.submission.student.user.title}{" "}
                  {data.submission.student.user.first_name}{" "}
                  {data.submission.student.user.last_name}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-500 font-medium mb-1">
                  Registration Number
                </p>
                <p className="font-semibold text-slate-800 text-lg">
                  {data.submission.student.registration_number}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-500 font-medium mb-1">Email</p>
                <p className="font-medium text-blue-600 text-base">
                  {data.submission.student.user.email}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-500 font-medium mb-1">
                  Institute
                </p>
                <p className="font-semibold text-slate-800 text-lg">
                  {data.submission.student.education_institute}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Submission Files */}
        <div className="bg-white rounded-xl shadow-md p-8 mb-6 border border-slate-200">
          <h2 className="text-2xl font-bold mb-6 text-slate-900">
            Submission Files
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {data.submission.file_url && (
              <button
                onClick={() =>
                  setViewingFile({
                    url: data.submission.file_url!,
                    type: "pdf",
                  })
                }
                className="flex items-center gap-4 p-5 border-2 border-blue-200 rounded-xl hover:bg-blue-50 transition-all hover:shadow-md group"
              >
                <div className="p-3 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                  <FileText className="w-8 h-8 text-blue-700" />
                </div>
                <div className="text-left flex-1">
                  <p className="font-semibold text-slate-800 text-base">
                    Original Submission
                  </p>
                  <p className="text-sm text-slate-600">View File</p>
                </div>
                <Eye className="w-5 h-5 text-slate-400 group-hover:text-blue-600 transition-colors" />
              </button>
            )}
            {data.submission.media_extracted_file_url && (
              <button
                onClick={() =>
                  setViewingFile({
                    url: data.submission.media_extracted_file_url!,
                    type: "pdf",
                  })
                }
                className="flex items-center gap-4 p-5 border-2 border-green-200 rounded-xl hover:bg-green-50 transition-all hover:shadow-md group"
              >
                <div className="p-3 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                  <Image className="w-8 h-8 text-green-700" />
                </div>
                <div className="text-left flex-1">
                  <p className="font-semibold text-slate-800 text-base">
                    Media Extracted
                  </p>
                  <p className="text-sm text-slate-600">View File</p>
                </div>
                <Eye className="w-5 h-5 text-slate-400 group-hover:text-green-600 transition-colors" />
              </button>
            )}
            {data.submission.handwritten_file_url && (
              <button
                onClick={() =>
                  setViewingFile({
                    url: data.submission.handwritten_file_url!,
                    type: "pdf",
                  })
                }
                className="flex items-center gap-4 p-5 border-2 border-purple-200 rounded-xl hover:bg-purple-50 transition-all hover:shadow-md group"
              >
                <div className="p-3 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                  <Edit2 className="w-8 h-8 text-purple-700" />
                </div>
                <div className="text-left flex-1">
                  <p className="font-semibold text-slate-800 text-base">
                    Handwritten
                  </p>
                  <p className="text-sm text-slate-600">View File</p>
                </div>
                <Eye className="w-5 h-5 text-slate-400 group-hover:text-purple-600 transition-colors" />
              </button>
            )}
          </div>
        </div>

        {/* Questions and Answers */}
        <div className="space-y-6">
          {data.student_answers.map((answer, index) => (
            <div
              key={answer.id}
              className="bg-white rounded-xl shadow-md p-8 border border-slate-200"
            >
              <div className="flex justify-between items-start mb-6">
                <h3 className="text-2xl font-bold text-slate-900">
                  Question {answer.question_number}
                </h3>
                <div className="flex items-center gap-2">
                  {editingAnswer === answer.id ? (
                    <>
                      <button
                        onClick={cancelEditing}
                        className="p-2.5 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                        disabled={saving}
                        title="Cancel"
                      >
                        <X className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => saveChanges(answer.id)}
                        className="p-2.5 text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={saving}
                        title="Save"
                      >
                        {saving ? (
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Check className="w-5 h-5" />
                        )}
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => startEditing(answer)}
                      className="p-2.5 text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm"
                      title="Edit"
                    >
                      <Edit2 className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>

              {answer.question && (
                <>
                  <div className="mb-5 p-5 bg-slate-50 rounded-lg border border-slate-200">
                    <p className="font-semibold text-slate-900 mb-3 text-base">
                      Question:
                    </p>
                    <p className="text-slate-800 whitespace-pre-wrap leading-relaxed">
                      {answer.question.question_text}
                    </p>
                    {answer.question.media &&
                      answer.question.media.length > 0 && (
                        <div className="mt-3 flex gap-2">
                          {answer.question.media.map((m) => (
                            <button
                              key={m.id}
                              onClick={() =>
                                setViewingFile({
                                  url: m.media_url,
                                  type: "image",
                                })
                              }
                              className="text-sm text-blue-600 hover:text-blue-700 hover:underline font-medium"
                            >
                              View Media
                            </button>
                          ))}
                        </div>
                      )}
                  </div>

                  {answer.question.answer_text && (
                    <div className="mb-5 p-5 bg-green-50 rounded-lg border border-green-200">
                      <p className="font-semibold text-green-900 mb-3 text-base">
                        Model Answer:
                      </p>
                      <p className="text-slate-800 whitespace-pre-wrap leading-relaxed">
                        {answer.question.answer_text}
                      </p>
                    </div>
                  )}

                  {answer.question.guideline_text && (
                    <div className="mb-5 p-5 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="font-semibold text-blue-900 mb-3 text-base">
                        Grading Guidelines:
                      </p>
                      <p className="text-slate-800 whitespace-pre-wrap leading-relaxed">
                        {answer.question.guideline_text}
                      </p>
                    </div>
                  )}
                </>
              )}

              <div className="mb-6 p-5 bg-purple-50 rounded-lg border border-purple-200">
                <p className="font-semibold text-purple-900 mb-3 text-base">
                  Student Answer:
                </p>
                <p className="text-slate-800 whitespace-pre-wrap leading-relaxed">
                  {answer.answer_text || "No answer provided"}
                </p>
                {answer.media && answer.media.length > 0 && (
                  <div className="mt-3 flex gap-2">
                    {answer.media.map((m) => (
                      <button
                        key={m.id}
                        onClick={() =>
                          setViewingFile({ url: m.media_url, type: "image" })
                        }
                        className="text-sm text-purple-600 hover:text-purple-700 hover:underline font-medium"
                      >
                        View Media
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-3">
                    Score (Max: {answer.question?.max_marks || 0})
                  </label>
                  {editingAnswer === answer.id ? (
                    <input
                      type="number"
                      value={editedScore}
                      onChange={(e) => setEditedScore(e.target.value)}
                      max={answer.question?.max_marks || 0}
                      min="0"
                      step="0.5"
                      className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-800 font-medium"
                    />
                  ) : (
                    <div className="text-3xl font-bold text-blue-700 bg-blue-50 px-4 py-3 rounded-lg border-2 border-blue-200">
                      {answer.score !== null
                        ? formatScore(Number(answer.score))
                        : "-"}{" "}
                      / {answer.question?.max_marks || 0}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-3">
                    Feedback
                  </label>
                  {editingAnswer === answer.id ? (
                    <textarea
                      value={editedFeedback}
                      onChange={(e) => setEditedFeedback(e.target.value)}
                      rows={4}
                      className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-800"
                      placeholder="Enter feedback for the student..."
                    />
                  ) : (
                    <div className="p-4 bg-slate-50 rounded-lg min-h-[120px] border border-slate-200">
                      <p className="text-slate-800 whitespace-pre-wrap leading-relaxed">
                        {answer.feedback || "No feedback provided"}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {answer.graded_at && (
                <p className="text-sm text-slate-500 mt-6 pt-4 border-t border-slate-200 font-medium">
                  Graded on: {new Date(answer.graded_at).toLocaleString()}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}