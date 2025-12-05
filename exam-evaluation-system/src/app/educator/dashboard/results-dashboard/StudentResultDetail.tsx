// export default StudentResultDetail;

'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save, FileText, Edit2, X, Check, User, BookOpen, Calendar, Clock } from 'lucide-react';
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

  const getGradeLevel = (percentage: number) => {
    if (percentage >= 90) return 'Excellent';
    if (percentage >= 80) return 'Very Good';
    if (percentage >= 70) return 'Good';
    if (percentage >= 60) return 'Satisfactory';
    return 'Needs Improvement';
  };

  const getScoreColor = (percentage: number) => {
    if (percentage >= 90) return 'text-emerald-700';
    if (percentage >= 80) return 'text-green-700';
    if (percentage >= 70) return 'text-blue-700';
    if (percentage >= 60) return 'text-amber-700';
    return 'text-red-700';
  };

  const getScoreBgColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-emerald-50 border-emerald-200';
    if (percentage >= 80) return 'bg-green-50 border-green-200';
    if (percentage >= 70) return 'bg-blue-50 border-blue-200';
    if (percentage >= 60) return 'bg-amber-50 border-amber-200';
    return 'bg-red-50 border-red-200';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-slate-300 border-t-slate-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading student details...</p>
        </div>
      </div>
    );
  }

  if (error || !submission) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-slate-500 text-lg mb-4">{error || 'No data found'}</div>
          <button
            onClick={() => router.back()}
            className="inline-flex items-center px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const totalMarks = gradedAnswers.reduce((sum, answer) => sum + answer.mark, 0);
  const totalPossible = gradedAnswers.reduce((sum, answer) => sum + answer.max_marks, 0);
  const overallPercentage = totalPossible > 0 ? ((totalMarks / totalPossible) * 100).toFixed(1) : '0.0';

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Header Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center px-4 py-2 text-slate-600 hover:text-slate-800 hover:bg-white rounded-lg transition-all duration-200 shadow-sm hover:shadow-md border border-slate-200"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Results
          </button>
          <div className="flex items-center space-x-2 text-sm text-slate-600 bg-white px-3 py-2 rounded-lg shadow-sm border border-slate-200">
            <FileText className="w-4 h-4" />
            <span>{submission.isHandwritten ? 'Handwritten' : 'Digital'} Submission</span>
          </div>
        </div>

        {/* Student Information Card */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-5 bg-slate-800 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-slate-700 rounded-lg flex items-center justify-center">
                  <User className="w-6 h-6 text-slate-200" />
                </div>
                <div>
                  <h1 className="text-2xl font-semibold text-white">{submission.studentName}</h1>
                  <p className="text-slate-300">{submission.studentIndex}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-white">{overallPercentage}%</div>
                <div className="text-sm text-slate-300">{getGradeLevel(parseFloat(overallPercentage))}</div>
              </div>
            </div>
          </div>
          
          <div className="px-6 py-5 bg-slate-50">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-slate-600" />
                  </div>
                  <div>
                    <div className="text-sm text-slate-500 font-medium">Module</div>
                    <div className="font-semibold text-slate-800">{submission.moduleCode}</div>
                    <div className="text-sm text-slate-600">{submission.moduleName}</div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                    <FileText className="w-5 h-5 text-slate-600" />
                  </div>
                  <div>
                    <div className="text-sm text-slate-500 font-medium">Assessment</div>
                    <div className="font-semibold text-slate-800">{submission.assessmentTitle}</div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                    <Clock className="w-5 h-5 text-slate-600" />
                  </div>
                  <div>
                    <div className="text-sm text-slate-500 font-medium">Submitted</div>
                    <div className="font-semibold text-slate-800">
                      {new Date(submission.submittedAt).toLocaleDateString()}
                    </div>
                    <div className="text-sm text-slate-600">
                      {new Date(submission.submittedAt).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Performance Summary */}
            <div className="mt-6 pt-6 border-t border-slate-200">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-slate-700">Overall Performance</span>
                <span className="text-sm font-medium text-slate-600">
                  {totalMarks.toFixed(1)} / {totalPossible.toFixed(1)} marks
                </span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-3">
                <div
                  className="bg-slate-600 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${overallPercentage}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Answer Script Viewer */}
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 bg-slate-700 border-b">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-slate-600 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-slate-200" />
                </div>
                <h2 className="text-lg font-semibold text-white">Answer Script</h2>
              </div>
            </div>
            <div className="p-6 bg-slate-50">
              {submission.fileUrl ? (
                <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
                  <DocumentViewer fileUrl={submission.fileUrl} />
                </div>
              ) : (
                <div className="text-center py-12 bg-white rounded-lg border border-slate-200">
                  <FileText className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                  <p className="text-slate-500">No answer script available</p>
                </div>
              )}
            </div>
          </div>

          {/* Question-wise Results */}
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 bg-slate-700 border-b">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-slate-600 rounded-lg flex items-center justify-center">
                  <Edit2 className="w-5 h-5 text-slate-200" />
                </div>
                <h2 className="text-lg font-semibold text-white">Question-wise Results</h2>
              </div>
            </div>
            <div className="overflow-auto bg-slate-50" style={{ maxHeight: '600px' }}>
              {gradedAnswers.length > 0 ? (
                <div className="divide-y divide-slate-200">
                  {gradedAnswers.map((answer) => {
                    const percentage = parseFloat(getPercentage(answer.mark, answer.max_marks));
                    const isEditing = editing.questionId === answer.full_question_id;

                    return (
                      <div key={answer.full_question_id} className={`p-6 transition-all duration-300 ${
                        isEditing 
                          ? 'bg-blue-50 border-l-4 border-l-blue-500' 
                          : 'hover:bg-white bg-white'
                      } ${!isEditing && getScoreBgColor(percentage)} border-l-4 ml-4 mr-4 my-3 rounded-lg shadow-sm`}>
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold transition-colors ${
                              isEditing 
                                ? 'bg-blue-100 text-blue-800' 
                                : percentage >= 80 
                                  ? 'bg-emerald-100 text-emerald-800' 
                                  : percentage >= 60 
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'bg-red-100 text-red-800'
                            }`}>
                              {formatQuestionId(answer.full_question_id)}
                            </div>
                            {answer.is_null_answer && (
                              <span className="px-3 py-1 bg-red-100 text-red-700 text-xs rounded-full font-medium border border-red-200">
                                No Answer
                              </span>
                            )}
                            {isEditing && (
                              <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium border border-blue-200">
                                Editing
                              </span>
                            )}
                          </div>
                          
                          <div className="flex items-center space-x-4">
                            <div className="text-right">
                              {isEditing ? (
                                <input
                                  type="number"
                                  step="0.1"
                                  min="0"
                                  max={answer.max_marks}
                                  value={editing.mark}
                                  onChange={(e) => setEditing(prev => ({ ...prev, mark: e.target.value }))}
                                  className="w-20 px-3 py-2 border-2 border-blue-300 bg-white rounded-lg text-center text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                                />
                              ) : (
                                <span className={`text-xl font-bold ${getScoreColor(percentage)}`}>
                                  {answer.mark.toFixed(1)}
                                </span>
                              )}
                              <span className="text-slate-500 text-sm ml-1">/ {answer.max_marks.toFixed(1)}</span>
                            </div>
                            
                            <div className="text-right">
                              <div className={`text-lg font-bold px-2 py-1 rounded-lg ${
                                percentage >= 80 
                                  ? 'bg-emerald-100 text-emerald-800' 
                                  : percentage >= 60 
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'bg-red-100 text-red-800'
                              }`}>
                                {percentage.toFixed(1)}%
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              {isEditing ? (
                                <>
                                  <button
                                    onClick={() => saveEdit(answer)}
                                    disabled={saving}
                                    className="p-2 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors border border-emerald-200"
                                    title="Save"
                                  >
                                    <Check className="w-5 h-5" />
                                  </button>
                                  <button
                                    onClick={cancelEditing}
                                    className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors border border-red-200"
                                    title="Cancel"
                                  >
                                    <X className="w-5 h-5" />
                                  </button>
                                </>
                              ) : (
                                <button
                                  onClick={() => startEditing(answer)}
                                  className="p-2 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
                                  title="Edit"
                                >
                                  <Edit2 className="w-5 h-5" />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <div className={`text-sm mb-3 font-semibold transition-colors ${
                            isEditing ? 'text-blue-700' : 'text-slate-600'
                          }`}>
                            Feedback
                          </div>
                          {isEditing ? (
                            <textarea
                              value={editing.reason}
                              onChange={(e) => setEditing(prev => ({ ...prev, reason: e.target.value }))}
                              className="w-full px-4 py-3 border-2 border-blue-300 bg-white rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 text-slate-800 placeholder-slate-400"
                              rows={4}
                              placeholder="Enter detailed feedback..."
                            />
                          ) : (
                            <div className="bg-white p-4 rounded-lg border border-slate-200">
                              <p className="text-slate-700 text-sm leading-relaxed">
                                {answer.reason || 'No feedback provided'}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-slate-500">No graded answers found</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentResultDetail;