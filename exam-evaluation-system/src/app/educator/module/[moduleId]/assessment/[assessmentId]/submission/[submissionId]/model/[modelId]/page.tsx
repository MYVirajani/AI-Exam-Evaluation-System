"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Save, FileText, Image, Video, Edit2, X, Check, Eye, Download, ArrowLeft } from 'lucide-react';

// Define types for the data structure
interface User {
  title: string;
  first_name: string;
  last_name: string;
  email: string;
  profile_image_url?: string;
}

interface Student {
  registration_number: string;
  education_institute: string;
  user: User;
}

interface Media {
  id: string;
  media_url: string;
}

interface Question {
  question_text: string;
  max_marks: number;
  answer_text?: string;
  guideline_text?: string;
  media: Media[];
}

interface StudentAnswer {
  id: string;
  answer_text: string;
  score: number | null;
  feedback: string;
  question_number: number;
  graded_at?: string;
  media: Media[];
  question: Question;
}

interface Submission {
  student: Student;
  file_url?: string;
  media_extracted_file_url?: string;
  handwritten_file_url?: string;
}

interface Module {
  module_code: string;
  module_name: string;
}

interface Assessment {
  assessment_name: string;
  assessment_type: string;
  deadline: string;
}

interface EvaluationModel {
  model_name: string;
  provider: string;
  chat_model: string;
  temperature: number;
  embedding_model?: string;
  description?: string;
}

interface SubmissionData {
  submission: Submission;
  module: Module;
  assessment: Assessment;
  student_answers: StudentAnswer[];
  evaluation_model?: EvaluationModel;
}

const SubmissionReviewPage = () => {
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
  const [editedFeedback, setEditedFeedback] = useState('');
  const [editedScore, setEditedScore] = useState('');
  const [viewingFile, setViewingFile] = useState<{url: string, type: string} | null>(null);

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
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToResults = () => {
    if (moduleId && assessmentId) {
      router.push(`/educator/module/${moduleId}/assessment/${assessmentId}/results`);
    }
  };

  const startEditing = (answer: StudentAnswer) => {
    setEditingAnswer(answer.id);
    setEditedFeedback(answer.feedback || '');
    setEditedScore(answer.score?.toString() || '');
  };

  const cancelEditing = () => {
    setEditingAnswer(null);
    setEditedFeedback('');
    setEditedScore('');
  };

  const saveChanges = async (answerId: string) => {
    try {
      setSaving(true);
      const response = await fetch(`/api/educator/student-answer/${answerId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          feedback: editedFeedback,
          score: editedScore ? parseFloat(editedScore) : null
        })
      });

      if (response.ok) {
        setData(prev => {
          if (!prev) return null;
          return {
            ...prev,
            student_answers: prev.student_answers.map(ans =>
              ans.id === answerId
                ? { 
                    ...ans, 
                    feedback: editedFeedback, 
                    score: editedScore ? parseFloat(editedScore) : null 
                  }
                : ans
            )
          };
        });
        cancelEditing();
      } else {
        throw new Error('Failed to save changes');
      }
    } catch (error) {
      console.error('Error saving changes:', error);
      alert('Failed to save changes. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const FileViewer = ({ url, type, onClose }: { 
    url: string; 
    type: string; 
    onClose: () => void 
  }) => (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="font-semibold text-lg">File Preview</h3>
          <div className="flex gap-2">
            <a
              href={url}
              download
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 hover:bg-gray-100 rounded"
            >
              <Download className="w-5 h-5" />
            </a>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-auto p-4">
          {type === 'pdf' ? (
            <iframe src={url} className="w-full h-full min-h-[600px]" title="PDF Viewer" />
          ) : type === 'image' ? (
            <img src={url} alt="Submission" className="max-w-full h-auto mx-auto" />
          ) : type === 'video' ? (
            <video controls className="max-w-full h-auto mx-auto">
              <source src={url} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          ) : (
            <div className="text-center p-8">
              <p>Preview not available. <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Download file</a></p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading submission...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center text-red-600">
          <p>Error loading submission data</p>
          <button 
            onClick={() => router.back()} 
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // FIXED: Properly calculate totalScore and maxScore by ensuring we're working with numbers
  const totalScore = data.student_answers.reduce((sum, ans) => {
    // Convert score to number and handle null/undefined cases
    const score = ans.score !== null && ans.score !== undefined ? Number(ans.score) : 0;
    return sum + score;
  }, 0);

  const maxScore = data.student_answers.reduce((sum, ans) => {
    // Convert max_marks to number and handle undefined cases
    const maxMarks = ans.question?.max_marks !== undefined ? Number(ans.question.max_marks) : 0;
    return sum + maxMarks;
  }, 0);

  // Format the scores to show only necessary decimal places
  const formatScore = (score: number) => {
    // If the score is an integer, don't show decimal places
    if (Number.isInteger(score)) {
      return score.toString();
    }
    // Otherwise, show up to 2 decimal places
    return score.toFixed(2);
  };

  return (
    <div className="min-h-screen bg-gray-50">
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
          className="mb-4 flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors px-4 py-2 rounded-lg hover:bg-gray-100"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Results</span>
        </button>

        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {data.assessment.assessment_name}
              </h1>
              <p className="text-gray-600">
                {data.module.module_code} - {data.module.module_name}
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-blue-600">
                {formatScore(totalScore)} / {formatScore(maxScore)}
              </div>
              <p className="text-sm text-gray-600">Total Score</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
            <div>
              <p className="text-sm text-gray-600">Assessment Type</p>
              <p className="font-medium">{data.assessment.assessment_type}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Deadline</p>
              <p className="font-medium">{new Date(data.assessment.deadline).toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        {/* Student Info */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Student Information</h2>
          <div className="flex items-start gap-4">
            {data.submission.student.user.profile_image_url && (
              <img
                src={data.submission.student.user.profile_image_url}
                alt="Student"
                className="w-16 h-16 rounded-full object-cover"
              />
            )}
            <div className="flex-1 grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Name</p>
                <p className="font-medium">
                  {data.submission.student.user.title} {data.submission.student.user.first_name}{' '}
                  {data.submission.student.user.last_name}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Registration Number</p>
                <p className="font-medium">{data.submission.student.registration_number}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-medium">{data.submission.student.user.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Institute</p>
                <p className="font-medium">{data.submission.student.education_institute}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Submission Files */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Submission Files</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {data.submission.file_url && (
              <button
                onClick={() => setViewingFile({ url: data.submission.file_url!, type: 'pdf' })}
                className="flex items-center gap-3 p-4 border rounded-lg hover:bg-gray-50 transition"
              >
                <FileText className="w-8 h-8 text-blue-600" />
                <div className="text-left">
                  <p className="font-medium">Original Submission</p>
                  <p className="text-sm text-gray-600">View File</p>
                </div>
                <Eye className="w-5 h-5 ml-auto text-gray-400" />
              </button>
            )}
            {data.submission.media_extracted_file_url && (
              <button
                onClick={() => setViewingFile({ url: data.submission.media_extracted_file_url!, type: 'pdf' })}
                className="flex items-center gap-3 p-4 border rounded-lg hover:bg-gray-50 transition"
              >
                <Image className="w-8 h-8 text-green-600" />
                <div className="text-left">
                  <p className="font-medium">Media Extracted</p>
                  <p className="text-sm text-gray-600">View File</p>
                </div>
                <Eye className="w-5 h-5 ml-auto text-gray-400" />
              </button>
            )}
            {data.submission.handwritten_file_url && (
              <button
                onClick={() => setViewingFile({ url: data.submission.handwritten_file_url!, type: 'pdf' })}
                className="flex items-center gap-3 p-4 border rounded-lg hover:bg-gray-50 transition"
              >
                <Edit2 className="w-8 h-8 text-purple-600" />
                <div className="text-left">
                  <p className="font-medium">Handwritten</p>
                  <p className="text-sm text-gray-600">View File</p>
                </div>
                <Eye className="w-5 h-5 ml-auto text-gray-400" />
              </button>
            )}
          </div>
        </div>

        {/* Evaluation Model Tab */}
        {data.evaluation_model && (
          <div className="bg-white rounded-lg shadow-sm mb-6 overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                <h2 className="text-white font-semibold text-lg">
                  Evaluation Model: {data.evaluation_model.model_name}
                </h2>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Provider</p>
                  <p className="font-medium">{data.evaluation_model.provider}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Chat Model</p>
                  <p className="font-medium">{data.evaluation_model.chat_model}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Temperature</p>
                  <p className="font-medium">{data.evaluation_model.temperature}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Embedding Model</p>
                  <p className="font-medium">{data.evaluation_model.embedding_model || 'N/A'}</p>
                </div>
              </div>
              {data.evaluation_model.description && (
                <div className="mt-4 pt-4 border-t">
                  <p className="text-sm text-gray-600 mb-1">Description</p>
                  <p className="text-gray-700">{data.evaluation_model.description}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Questions and Answers */}
        <div className="space-y-6">
          {data.student_answers.map((answer, index) => (
            <div key={answer.id} className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-bold">
                  Question {answer.question_number}
                </h3>
                <div className="flex items-center gap-2">
                  {editingAnswer === answer.id ? (
                    <>
                      <button
                        onClick={cancelEditing}
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded"
                        disabled={saving}
                      >
                        <X className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => saveChanges(answer.id)}
                        className="p-2 text-green-600 hover:bg-green-50 rounded"
                        disabled={saving}
                      >
                        <Check className="w-5 h-5" />
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => startEditing(answer)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                    >
                      <Edit2 className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>

              {answer.question && (
                <>
                  <div className="mb-4 p-4 bg-gray-50 rounded">
                    <p className="font-medium text-gray-900 mb-2">Question:</p>
                    <p className="text-gray-700 whitespace-pre-wrap">{answer.question.question_text}</p>
                    {answer.question.media && answer.question.media.length > 0 && (
                      <div className="mt-2 flex gap-2">
                        {answer.question.media.map(m => (
                          <button
                            key={m.id}
                            onClick={() => setViewingFile({ url: m.media_url, type: 'image' })}
                            className="text-sm text-blue-600 hover:underline"
                          >
                            View Media
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {answer.question.answer_text && (
                    <div className="mb-4 p-4 bg-green-50 rounded">
                      <p className="font-medium text-green-900 mb-2">Model Answer:</p>
                      <p className="text-gray-700 whitespace-pre-wrap">{answer.question.answer_text}</p>
                    </div>
                  )}

                  {answer.question.guideline_text && (
                    <div className="mb-4 p-4 bg-blue-50 rounded">
                      <p className="font-medium text-blue-900 mb-2">Grading Guidelines:</p>
                      <p className="text-gray-700 whitespace-pre-wrap">{answer.question.guideline_text}</p>
                    </div>
                  )}
                </>
              )}

              <div className="mb-4 p-4 bg-purple-50 rounded">
                <p className="font-medium text-purple-900 mb-2">Student Answer:</p>
                <p className="text-gray-700 whitespace-pre-wrap">{answer.answer_text || 'No answer provided'}</p>
                {answer.media && answer.media.length > 0 && (
                  <div className="mt-2 flex gap-2">
                    {answer.media.map(m => (
                      <button
                        key={m.id}
                        onClick={() => setViewingFile({ url: m.media_url, type: 'image' })}
                        className="text-sm text-purple-600 hover:underline"
                      >
                        View Media
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
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
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <div className="text-2xl font-bold text-blue-600">
                      {answer.score !== null ? formatScore(Number(answer.score)) : '-'} / {answer.question?.max_marks || 0}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Feedback
                  </label>
                  {editingAnswer === answer.id ? (
                    <textarea
                      value={editedFeedback}
                      onChange={(e) => setEditedFeedback(e.target.value)}
                      rows={4}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter feedback for the student..."
                    />
                  ) : (
                    <div className="p-3 bg-gray-50 rounded-lg min-h-[100px]">
                      <p className="text-gray-700 whitespace-pre-wrap">
                        {answer.feedback || 'No feedback provided'}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {answer.graded_at && (
                <p className="text-sm text-gray-500 mt-4">
                  Graded on: {new Date(answer.graded_at).toLocaleString()}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SubmissionReviewPage;