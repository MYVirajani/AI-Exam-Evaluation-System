"use client";

import { useSearchParams, useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { FileIcon, BotIcon, PlusIcon, EditIcon } from "@/components/Icons";
import Button from "@/components/Button";
import Dropdown from "@/components/Dropdown";
import toast from "react-hot-toast";

interface User {
  first_name: string;
  last_name: string;
  email: string;
}

interface Question {
  id: string;
  questionType: 'mcq' | 'short_answer';
  questionText: string;
  options: string[];
  correctAnswerIndex: number;
  marks: number;
  expectedAnswer?: string;
}

interface Assessment {
  assessment_id: string;
  type: string;
  title: string;
  description?: string;
  deadline: string;
  duration?: string;
  totalMarks?: string;
  instructions?: string;
  questions?: Question[];
  submissions: {
    submission_id: string;
    file_url: string;
    submission_time: string;
    student: {
      student_id: string;
      registration_number: string;
      user: User;
    };
    assessment_grade?: {
      marks_awarded: number;
      total_marks: number;
    } | null;
    question_grades: any[];
  }[];
  module: {
    module_code: string;
    module_name: string;
  };
  enrollmentCount: number;
}

export default function QuizAssessmentPage() {
  const searchParams = useSearchParams();
  const params = useParams();
  const router = useRouter();

  const moduleId = params.moduleId as string;
  const assessmentId = params.assessmentId as string;
  const educatorId = searchParams.get("educatorId");

  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState("ChatGPT");

  const models = ["ChatGPT", "Deepseek", "Gemini", "Llama"];

  useEffect(() => {
    if (!moduleId || !assessmentId || !educatorId) {
      setError("Missing required parameters");
      setLoading(false);
      return;
    }

    const fetchAssessment = async () => {
      try {
        const res = await fetch(
          `/api/educator/module/${moduleId}/assessment/${assessmentId}?educatorId=${educatorId}`
        );
        if (!res.ok) throw new Error("Failed to fetch assessment");
        const data = await res.json();

        if (!data || !data.assessments || data.assessments.length === 0) {
          throw new Error("Assessment not found");
        }

        const enrichedAssessment = {
          ...data.assessments[0],
          module: data.moduleData,
          enrollmentCount: data.enrollmentCount,
        };

        setAssessment(enrichedAssessment);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch assessment"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAssessment();
  }, [moduleId, assessmentId, educatorId]);

  const handleCreateQuiz = () => {
    router.push(`/educator/module/${moduleId}/assessment/${assessmentId}/quiz-form`);
  };

  const handleEditQuiz = () => {
    router.push(`/educator/module/${moduleId}/assessment/${assessmentId}/quiz-form?edit=true`);
  };

  const handleStartEvaluation = () => {
    if (!assessment?.questions || assessment.questions.length === 0) {
      toast.error("Please create a quiz first");
      return;
    }

    if (!assessment?.submissions || assessment.submissions.length === 0) {
      toast.error("No student submissions found for evaluation");
      return;
    }

    console.log("Starting quiz evaluation with model:", selectedModel);
    toast.success(`Starting quiz evaluation with ${selectedModel}...`);
  };

  const isEvaluationReady = () => {
    return (
      assessment?.questions &&
      assessment.questions.length > 0 &&
      assessment?.submissions &&
      assessment.submissions.length > 0
    );
  };

  const calculateTotalMarks = () => {
    if (!assessment?.questions) return 0;
    return assessment.questions.reduce((total, q) => total + (q.marks || 0), 0).toFixed(1);
  };

  const getMCQCount = () => {
    if (!assessment?.questions) return 0;
    return assessment.questions.filter(q => q.questionType === 'mcq').length;
  };

  const getShortAnswerCount = () => {
    if (!assessment?.questions) return 0;
    return assessment.questions.filter(q => q.questionType === 'short_answer').length;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-sm">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading quiz assessment...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-sm border border-red-200">
          <div className="text-red-600 text-center">
            <h2 className="text-lg font-semibold mb-2">Error</h2>
            <p>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!assessment) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-sm">
          <p className="text-gray-600">Quiz assessment not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Header Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="border-b border-gray-100 pb-4 mb-4">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {assessment.title}
                <span className="ml-3 text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-medium">
                  Quiz
                </span>
              </h1>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div className="text-sm text-gray-600">
                <span className="font-medium">{assessment.module.module_code}</span>
                <span className="mx-2">•</span>
                <span>{assessment.module.module_name}</span>
              </div>
              <div className="text-sm text-gray-600">
                <span className="font-medium">Submissions: </span>
                <span className="text-blue-600">
                  {assessment.submissions?.length ?? 0}
                </span>
                <span className="mx-1">/</span>
                <span>{assessment.enrollmentCount ?? 0} enrolled</span>
              </div>
            </div>
          </div>
          
          {assessment.description && (
            <p className="text-gray-700 leading-relaxed mb-4">{assessment.description}</p>
          )}

          {/* Quiz Details */}
          {(assessment.duration || assessment.totalMarks || assessment.instructions) && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              {assessment.duration && (
                <div>
                  <span className="font-medium text-gray-700">Duration:</span>
                  <span className="ml-2 text-gray-600">{assessment.duration} minutes</span>
                </div>
              )}
              {assessment.totalMarks && (
                <div>
                  <span className="font-medium text-gray-700">Total Marks:</span>
                  <span className="ml-2 text-gray-600">{assessment.totalMarks}</span>
                </div>
              )}
              {assessment.questions && assessment.questions.length > 0 && (
                <div>
                  <span className="font-medium text-gray-700">Calculated Marks:</span>
                  <span className="ml-2 text-gray-600">{calculateTotalMarks()}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Quiz Content Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Quiz Questions</h2>
            <div className="flex gap-3">
              {assessment.questions && assessment.questions.length > 0 ? (
                <Button
                  onClick={handleEditQuiz}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <EditIcon className="w-4 h-4" />
                  Edit Quiz
                </Button>
              ) : (
                <Button
                  onClick={handleCreateQuiz}
                  className="flex items-center gap-2"
                >
                  <PlusIcon className="w-4 h-4" />
                  Create Quiz
                </Button>
              )}
            </div>
          </div>

          {assessment.questions && assessment.questions.length > 0 ? (
            <div className="space-y-6">
              {/* Quiz Statistics */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Total Questions:</span>
                    <span className="ml-2 text-gray-900">{assessment.questions.length}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">MCQ Questions:</span>
                    <span className="ml-2 text-gray-900">{getMCQCount()}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Short Answer:</span>
                    <span className="ml-2 text-gray-900">{getShortAnswerCount()}</span>
                  </div>
                </div>
              </div>

              {/* Instructions */}
              {assessment.instructions && (
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Instructions:</h3>
                  <p className="text-gray-700 text-sm leading-relaxed bg-blue-50 p-3 rounded-lg">
                    {assessment.instructions}
                  </p>
                </div>
              )}

              {/* Questions Preview */}
              <div>
                <h3 className="font-medium text-gray-900 mb-4">Questions Preview:</h3>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {assessment.questions.map((question, index) => (
                    <div key={question.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900">
                          Question {index + 1}
                          <span className="ml-2 text-sm text-gray-600">
                            ({question.questionType === 'mcq' ? 'MCQ' : 'Short Answer'})
                          </span>
                        </h4>
                        <span className="text-sm text-gray-600 font-medium">
                          {question.marks} marks
                        </span>
                      </div>
                      <p className="text-gray-800 mb-3">{question.questionText}</p>
                      
                      {question.questionType === 'mcq' && question.options.length > 0 && (
                        <div className="space-y-1">
                          {question.options.map((option, optIndex) => (
                            option.trim() && (
                              <div key={optIndex} className="flex items-center text-sm">
                                <span className={`font-medium mr-2 ${
                                  question.correctAnswerIndex === optIndex 
                                    ? 'text-green-600' 
                                    : 'text-gray-500'
                                }`}>
                                  {String.fromCharCode(97 + optIndex)})
                                </span>
                                <span className={
                                  question.correctAnswerIndex === optIndex 
                                    ? 'text-green-700 font-medium' 
                                    : 'text-gray-700'
                                }>
                                  {option}
                                </span>
                                {question.correctAnswerIndex === optIndex && (
                                  <span className="ml-2 text-green-600 text-xs">✓ Correct</span>
                                )}
                              </div>
                            )
                          ))}
                        </div>
                      )}

                      {question.questionType === 'short_answer' && question.expectedAnswer && (
                        <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
                          <span className="text-xs font-medium text-yellow-800">Expected Answer:</span>
                          <p className="text-sm text-yellow-700 mt-1">{question.expectedAnswer}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <FileIcon className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Quiz Created Yet</h3>
              <p className="text-gray-600 mb-6">
                Create your quiz with MCQ and short answer questions to get started.
              </p>
              <Button
                onClick={handleCreateQuiz}
                className="flex items-center gap-2 mx-auto"
              >
                <PlusIcon className="w-4 h-4" />
                Create Quiz Now
              </Button>
            </div>
          )}
        </div>

        {/* Evaluation Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">AI Evaluation</h2>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium text-gray-700">
                Select AI Model:
              </label>
              <Dropdown
                options={models}
                selectedOption={selectedModel}
                onSelect={setSelectedModel}
              />
            </div>
            <Button
              disabled={!isEvaluationReady()}
              onClick={handleStartEvaluation}
              className="px-6 py-2.5"
            >
              <BotIcon className="w-5 h-5 mr-2" />
              Start Quiz Evaluation
            </Button>
          </div>
          
          {/* Status Messages */}
          {!isEvaluationReady() && (
            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-md">
              <p className="text-sm text-amber-800">
                <span className="font-medium">Requirements for evaluation:</span>
              </p>
              <ul className="text-sm text-amber-700 mt-2 space-y-1">
                {(!assessment?.questions || assessment.questions.length === 0) && (
                  <li>• Quiz questions need to be created</li>
                )}
                {(!assessment?.submissions || assessment.submissions.length === 0) && (
                  <li>• No student submissions available</li>
                )}
              </ul>
            </div>
          )}

          {isEvaluationReady() && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
              <p className="text-sm text-green-800">
                <span className="font-medium">Ready for evaluation!</span> Quiz has {assessment.questions?.length} questions and {assessment.submissions.length} student submissions are available.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}