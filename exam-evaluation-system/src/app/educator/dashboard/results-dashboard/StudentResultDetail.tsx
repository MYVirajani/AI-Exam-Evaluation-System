'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save, FileText, Edit2, X, Check } from 'lucide-react';
import { useRouter } from 'next/navigation';
import DocumentViewer from './DocumentViewer';

interface GradedAnswer {
  id: number;
  full_question_id: string;
  mark: number;
  max_marks: number;
  reason: string;
  is_null_answer: boolean;
  graded_at: string;
  model_type: 'openai' | 'gemini';
}

interface SubmissionDetails {
  id: string;
  studentName: string;
  studentIndex: string;
  moduleCode: string;
  moduleName: string;
  assessmentTitle: string;
  fileUrl: string;
  submittedAt: string;
  isHandwritten: boolean;
}

interface StudentResultDetailProps {
  resultId: string;
  searchParams: {
    studentIndex?: string;
    moduleCode?: string;
    examYear?: string;
    examMonth?: string;
    assessmentId?: string;
  };
}

interface EditingState {
  questionId: string | null;
  mark: string;
  reason: string;
}

const StudentResultDetail: React.FC<StudentResultDetailProps> = ({ 
  resultId, 
  searchParams 
}) => {
  const router = useRouter();
  const [submission, setSubmission] = useState<SubmissionDetails | null>(null);
  const [gradedAnswers, setGradedAnswers] = useState<GradedAnswer[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<EditingState>({ questionId: null, mark: '', reason: '' });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStudentDetails();
  }, []);

  const fetchStudentDetails = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        studentIndex: searchParams.studentIndex || '',
        moduleCode: searchParams.moduleCode || '',
        examYear: searchParams.examYear || '',
        examMonth: searchParams.examMonth || '',
        assessmentId: searchParams.assessmentId || ''
      });

      const response = await fetch(`/api/student-results/${resultId}?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch student details');
      }

      const data = await response.json();
      setSubmission(data.submission);
      setGradedAnswers(data.gradedAnswers);
    } catch (error) {
      console.error('Error fetching student details:', error);
      setError('Failed to load student details');
    } finally {
      setLoading(false);
    }
  };

  const startEditing = (answer: GradedAnswer) => {
    setEditing({
      questionId: answer.full_question_id,
      mark: answer.mark.toString(),
      reason: answer.reason
    });
  };

  const cancelEditing = () => {
    setEditing({ questionId: null, mark: '', reason: '' });
  };

  const saveEdit = async (answer: GradedAnswer) => {
    try {
      setSaving(true);
      
      const response = await fetch(`/api/student-results/${resultId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          updates: [{
            questionId: answer.full_question_id,
            mark: editing.mark,
            reason: editing.reason,
            modelType: answer.model_type
          }],
          studentIndex: searchParams.studentIndex,
          moduleCode: searchParams.moduleCode,
          examYear: searchParams.examYear,
          examMonth: searchParams.examMonth,
          assessmentId: searchParams.assessmentId
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update grade');
      }

      // Update local state
      setGradedAnswers(prev => prev.map(item => 
        item.full_question_id === answer.full_question_id 
          ? { ...item, mark: parseFloat(editing.mark), reason: editing.reason }
          : item
      ));

      cancelEditing();
    } catch (error) {
      console.error('Error saving changes:', error);
      alert('Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  const formatQuestionId = (questionId: string) => {
    // Convert Q1_i to Q1(i), Q1_a to Q1(a), etc.
    const parts = questionId.split('_');
    if (parts.length === 2) {
      return `${parts[0]}(${parts[1]})`;
    }
    return questionId;
  };

  const getPercentage = (mark: number, maxMark: number) => {
    return ((mark / maxMark) * 100).toFixed(1);
  };

  const getGradeColor = (percentage: number) => {
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 80) return 'text-blue-600';
    if (percentage >= 70) return 'text-yellow-600';
    if (percentage >= 60) return 'text-orange-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error || !submission) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 text-lg">{error || 'No data found'}</div>
        <button
          onClick={() => router.back()}
          className="mt-4 inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Go Back
        </button>
      </div>
    );
  }

  const totalMarks = gradedAnswers.reduce((sum, answer) => sum + answer.mark, 0);
  const totalPossible = gradedAnswers.reduce((sum, answer) => sum + answer.max_marks, 0);
  const overallPercentage = totalPossible > 0 ? ((totalMarks / totalPossible) * 100).toFixed(1) : '0.0';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Results
          </button>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <FileText className="w-4 h-4" />
            <span>{submission.isHandwritten ? 'Handwritten Submission' : 'Digital Submission'}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {submission.studentName}
            </h1>
            <div className="space-y-2 text-sm text-gray-600">
              <div><strong>Student Index:</strong> {submission.studentIndex}</div>
              <div><strong>Module:</strong> {submission.moduleCode} - {submission.moduleName}</div>
              <div><strong>Assessment:</strong> {submission.assessmentTitle}</div>
              <div><strong>Submitted:</strong> {new Date(submission.submittedAt).toLocaleString()}</div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Overall Performance</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Marks:</span>
                <span className="font-bold text-blue-600">{totalMarks.toFixed(1)} / {totalPossible.toFixed(1)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Percentage:</span>
                <span className={`font-bold text-lg ${getGradeColor(parseFloat(overallPercentage))}`}>
                  {overallPercentage}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${overallPercentage}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Answer Script Viewer */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="p-4 bg-gradient-to-r from-slate-800 to-slate-700 text-white rounded-t-lg">
            <h3 className="text-lg font-semibold">Answer Script</h3>
          </div>
          <div className="p-4">
            {submission.fileUrl ? (
              <DocumentViewer fileUrl={submission.fileUrl} />
            ) : (
              <div className="text-center py-12 text-gray-500">
                <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p>No answer script available</p>
              </div>
            )}
          </div>
        </div>

        {/* Graded Results Table */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="p-4 bg-gradient-to-r from-slate-800 to-slate-700 text-white rounded-t-lg">
            <h3 className="text-lg font-semibold">Question-wise Results</h3>
          </div>
          <div className="overflow-auto max-h-96">
            <table className="w-full border-collapse">
              <thead className="sticky top-0 bg-gray-50">
                <tr className="text-sm text-gray-700">
                  <th className="border p-3 text-left">Question</th>
                  <th className="border p-3 text-center">Marks</th>
                  <th className="border p-3 text-center">%</th>
                  <th className="border p-3 text-left">Feedback</th>
                  <th className="border p-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {gradedAnswers.map((answer) => {
                  const percentage = parseFloat(getPercentage(answer.mark, answer.max_marks));
                  const isEditing = editing.questionId === answer.full_question_id;

                  return (
                    <tr key={answer.full_question_id} className="hover:bg-gray-50">
                      <td className="border p-3 font-medium text-gray-900">
                        {formatQuestionId(answer.full_question_id)}
                        {answer.is_null_answer && (
                          <span className="ml-2 px-2 py-1 bg-red-100 text-red-700 text-xs rounded">
                            No Answer
                          </span>
                        )}
                      </td>
                      <td className="border p-3 text-center">
                        {isEditing ? (
                          <input
                            type="number"
                            step="0.1"
                            min="0"
                            max={answer.max_marks}
                            value={editing.mark}
                            onChange={(e) => setEditing(prev => ({ ...prev, mark: e.target.value }))}
                            className="w-20 px-2 py-1 border border-gray-300 rounded text-center text-sm"
                          />
                        ) : (
                          <span className="font-bold text-blue-600">
                            {answer.mark.toFixed(1)}
                          </span>
                        )}
                        <span className="text-gray-500 text-sm"> / {answer.max_marks.toFixed(1)}</span>
                      </td>
                      <td className={`border p-3 text-center font-bold ${getGradeColor(percentage)}`}>
                        {percentage.toFixed(1)}%
                      </td>
                      <td className="border p-3 text-sm">
                        {isEditing ? (
                          <textarea
                            value={editing.reason}
                            onChange={(e) => setEditing(prev => ({ ...prev, reason: e.target.value }))}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm resize-none"
                            rows={2}
                          />
                        ) : (
                          <div className="text-gray-700 max-w-xs overflow-hidden">
                            {answer.reason}
                          </div>
                        )}
                      </td>
                      <td className="border p-3 text-center">
                        {isEditing ? (
                          <div className="flex items-center justify-center space-x-1">
                            <button
                              onClick={() => saveEdit(answer)}
                              disabled={saving}
                              className="p-1 text-green-600 hover:bg-green-50 rounded"
                              title="Save"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={cancelEditing}
                              className="p-1 text-red-600 hover:bg-red-50 rounded"
                              title="Cancel"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => startEditing(answer)}
                            className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          {gradedAnswers.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <p>No graded answers found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentResultDetail;