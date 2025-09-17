"use client";

import { useSearchParams, useParams } from "next/navigation";
import { useState, useEffect, useRef, useMemo } from "react";
import { FileIcon, BotIcon } from "@/components/Icons";
import Button from "@/components/Button";
import Dropdown from "@/components/Dropdown";
import { FileUploadSection } from "@/components/Upload/FileUploadSection";
import Breadcrumbs from "@/components/Breadcrumbs";
import { getAssessmentBreadcrumbs } from "@/utils/breadcrumbs"
import toast from "react-hot-toast";
import { FILE_CONFIG } from "@/lib/fileConfig";
import Link from "next/link";

interface User {
  first_name: string;
  last_name: string;
  email: string;
}

interface Submission {
  submission_id: string;
  file_url: string;
  submission_start_at: string;
  student: {
    user_id: string;
    registration_number: string;
    user: User;
  };
  assessment_grade?: {
    marks_awarded: number;
    max_marks: number;
  } | null;
  // Add latest grade from results tables
  latest_ai_grade?: {
    marks_awarded: number;
    max_marks: number;
    model_used: string;
    graded_at: string;
  } | null;
}

interface AssessmentDataFromApi {
  assessment: {
    assessment_id: string;
    type: string;
    title: string;
    description?: string;
    deadline: string;
    created_on: string;
    model_answer_paper?: {
      file_url: string;
    } | null;
    question_paper?: {
      file_url: string;
    } | null;
    submissions: Submission[];
  };
  module: {
    module_code: string;
    module_name: string;
  };
  enrollmentCount: number;
}

type Assessment = AssessmentDataFromApi["assessment"] & {
  module: AssessmentDataFromApi["module"];
  enrollmentCount: number;
};

export default function AssessmentPage() {
  const searchParams = useSearchParams();
  const params = useParams();

  const moduleId = params.moduleId as string;
  const assessmentId = params.assessmentId as string;
  const educatorId = searchParams.get("educatorId");

  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [uploadedFiles, setUploadedFiles] = useState({
    questionPaper: null as File | null,
    modelAnswer: null as File | null,
  });

  const modelAnswerInputRef = useRef<HTMLInputElement>(null);
  const questionPaperInputRef = useRef<HTMLInputElement>(null);

  const [selectedModel, setSelectedModel] = useState("ChatGPT");
  const [isUploadingModelAnswer, setIsUploadingModelAnswer] = useState(false);
  const [isUploadingQuestionPaper, setIsUploadingQuestionPaper] = useState(false);
  
  // State for evaluation
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluationStatus, setEvaluationStatus] = useState<string>('');
  const [selectedSubmissions, setSelectedSubmissions] = useState<string[]>([]);

  // New state for enhanced submissions selection
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('registration_number');
  const [sortDirection, setSortDirection] = useState('asc');
  const [filterStatus, setFilterStatus] = useState('all'); // all, graded, ungraded

  const models = ["ChatGPT", "Deepseek", "Gemini", "Llama"];
  
  // Generate breadcrumbs
  const breadcrumbs = assessment 
    ? getAssessmentBreadcrumbs(
        assessment.module.module_code, 
        moduleId, 
        assessment.title, 
        assessmentId, 
        'educator'
      )
    : [
        { label: 'Dashboard', href: '/educator/dashboard' }, 
        { label: 'Module', href: `/educator/module/${moduleId}` }, 
        { label: 'Assessment', current: true }
      ];

  // Enhanced helper function to get student display name
  const getStudentDisplayName = (student: any) => {
    if (!student?.user) {
      return `Student ${student?.registration_number || 'Unknown'}`;
    }
    
    const { first_name = '', last_name = '', email = '' } = student.user;
    const fullName = `${first_name} ${last_name}`.trim();
    
    if (fullName) {
      return fullName;
    }
    
    if (email) {
      return email.split('@')[0]; // Use email username as fallback
    }
    
    return `Student ${student.registration_number}`;
  };

  // Helper function to get student email
  const getStudentEmail = (student: any) => {
    return student?.user?.email || 'No email available';
  };

  // Helper function to get the best grade (latest AI grade or assessment grade)
  const getBestGrade = (submission: Submission) => {
    // Check if there's a latest AI grade
    if (submission.latest_ai_grade) {
      return {
        marks_awarded: submission.latest_ai_grade.marks_awarded,
        max_marks: submission.latest_ai_grade.max_marks,
        source: `AI (${submission.latest_ai_grade.model_used})`,
        graded_at: submission.latest_ai_grade.graded_at,
        isAI: true
      };
    }
    
    // Fallback to assessment grade
    if (submission.assessment_grade) {
      return {
        marks_awarded: submission.assessment_grade.marks_awarded,
        max_marks: submission.assessment_grade.max_marks,
        source: 'Manual',
        graded_at: null,
        isAI: false
      };
    }
    
    return null;
  };

  // Filter and sort submissions
  const filteredAndSortedSubmissions = useMemo(() => {
    if (!assessment?.submissions) return [];
    
    let filtered = assessment.submissions.filter(sub => {
      const studentName = getStudentDisplayName(sub.student);
      const studentEmail = getStudentEmail(sub.student);
      
      const matchesSearch = searchTerm === '' || 
        sub.student.registration_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        studentEmail.toLowerCase().includes(searchTerm.toLowerCase());
      
      const bestGrade = getBestGrade(sub);
      const isGraded = bestGrade !== null;
      
      const matchesFilter = filterStatus === 'all' || 
        (filterStatus === 'graded' && isGraded) ||
        (filterStatus === 'ungraded' && !isGraded);
      
      return matchesSearch && matchesFilter;
    });

    // Sort submissions
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortField) {
        case 'registration_number':
          aValue = a.student.registration_number;
          bValue = b.student.registration_number;
          break;
        case 'name':
          aValue = getStudentDisplayName(a.student);
          bValue = getStudentDisplayName(b.student);
          break;
        case 'submitted_at':
          aValue = new Date(a.submission_start_at);
          bValue = new Date(b.submission_start_at);
          break;
        case 'grade':
          const gradeA = getBestGrade(a);
          const gradeB = getBestGrade(b);
          aValue = gradeA?.marks_awarded || 0;
          bValue = gradeB?.marks_awarded || 0;
          break;
        default:
          aValue = a.student.registration_number;
          bValue = b.student.registration_number;
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [assessment?.submissions, searchTerm, sortField, sortDirection, filterStatus]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedSubmissions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedSubmissions = filteredAndSortedSubmissions.slice(startIndex, startIndex + itemsPerPage);

  // Selection handlers
  const handleSelectAll = () => {
    if (selectedSubmissions.length === filteredAndSortedSubmissions.length) {
      setSelectedSubmissions([]);
    } else {
      setSelectedSubmissions(filteredAndSortedSubmissions.map(s => s.submission_id));
    }
  };

  const handleSelectPage = () => {
    const pageSubmissionIds = paginatedSubmissions.map(s => s.submission_id);
    const allPageSelected = pageSubmissionIds.every(id => selectedSubmissions.includes(id));
    
    if (allPageSelected) {
      setSelectedSubmissions(prev => prev.filter(id => !pageSubmissionIds.includes(id)));
    } else {
      setSelectedSubmissions(prev => [...new Set([...prev, ...pageSubmissionIds])]);
    }
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    setCurrentPage(1);
  };

  const SortIcon = ({ field }: { field: string }) => {
    if (sortField !== field) return <span className="text-gray-400">⇅</span>;
    return sortDirection === 'asc' ? <span className="text-blue-600">↑</span> : <span className="text-blue-600">↓</span>;
  };

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

        const data: AssessmentDataFromApi = await res.json();

        if (!data || !data.assessment) {
          throw new Error("Assessment not found");
        }

        const enrichedAssessment: Assessment = {
          ...data.assessment,
          module: data.module,
          enrollmentCount: data.enrollmentCount,
        };

        setAssessment(enrichedAssessment);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch assessment");
      } finally {
        setLoading(false);
      }
    };

    fetchAssessment();
  }, [moduleId, assessmentId, educatorId]);

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: keyof typeof uploadedFiles
  ) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    setUploadedFiles((prev) => ({ ...prev, [type]: file }));

    e.target.value = "";
  };

  const refetchAssessment = async () => {
    const updatedAssessmentRes = await fetch(
      `/api/educator/module/${moduleId}/assessment/${assessmentId}?educatorId=${educatorId}`
    );
    if (updatedAssessmentRes.ok) {
      const updatedData: AssessmentDataFromApi = await updatedAssessmentRes.json();
      setAssessment({
        ...updatedData.assessment,
        module: updatedData.module,
        enrollmentCount: updatedData.enrollmentCount,
      });
    }
  };

  const uploadModelAnswer = async () => {
    if (!uploadedFiles.modelAnswer) return;

    setIsUploadingModelAnswer(true);
    const toastId = toast.loading("Uploading model answer...");

    try {
      const formData = new FormData();
      formData.append("file", uploadedFiles.modelAnswer);

      const res = await fetch(
        `/api/educator/module/${moduleId}/assessment/${assessmentId}/model-paper`,
        { method: "POST", body: formData }
      );

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Upload failed");
      }

      await refetchAssessment();

      toast.success("Model answer uploaded successfully!", { id: toastId });
      setUploadedFiles((prev) => ({ ...prev, modelAnswer: null }));
    } catch (error) {
      console.error("Error uploading model answer:", error);
      toast.error(error instanceof Error ? error.message : "Failed to upload model answer", { id: toastId });
    } finally {
      setIsUploadingModelAnswer(false);
    }
  };

  const uploadQuestionPaper = async () => {
    if (!uploadedFiles.questionPaper) return;

    setIsUploadingQuestionPaper(true);
    const toastId = toast.loading("Uploading question paper...");

    try {
      const formData = new FormData();
      formData.append("file", uploadedFiles.questionPaper);

      const res = await fetch(
        `/api/educator/module/${moduleId}/assessment/${assessmentId}/question-paper`,
        { method: "POST", body: formData }
      );

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Upload failed");
      }

      await refetchAssessment();

      toast.success("Question paper uploaded successfully!", { id: toastId });
      setUploadedFiles((prev) => ({ ...prev, questionPaper: null }));
    } catch (error) {
      console.error("Error uploading question paper:", error);
      toast.error(error instanceof Error ? error.message : "Failed to upload question paper", { id: toastId });
    } finally {
      setIsUploadingQuestionPaper(false);
    }
  };

  const triggerFileInput = (ref: React.RefObject<HTMLInputElement>) => {
    ref.current?.click();
  };

  const startEvaluation = async () => {
    setIsEvaluating(true);
    setEvaluationStatus('Starting evaluation...');

    // Filter selected submissions to only those in this assessment
    const validSelectedSubmissions = selectedSubmissions.filter(subId =>
      assessment.submissions.some(sub => sub.submission_id === subId)
    );

    // Get year/month from assessment creation date
    const createdDate = new Date(assessment.created_on);
    const year = createdDate.getFullYear();
    const month = createdDate.toLocaleString('default', { month: 'long' });

    try {
      const response = await fetch('/api/educator/start-evaluation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          selectedModel,
          moduleId,
          assessmentId,
          selectedSubmissions: validSelectedSubmissions,
          parameters: {
            year,
            month,
          },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to start evaluation');
      }

      if (data.success) {
        setEvaluationStatus(`✅ Evaluation completed successfully!`);
        console.log('Evaluation results:', data.results);
        toast.success(`Evaluation completed successfully with ${selectedModel}!`);
        
        // Refetch assessment to update grades
        await refetchAssessment();
      } else {
        setEvaluationStatus(`⚠️ Evaluation completed with some issues`);
        console.warn('Evaluation issues:', data.results);
        toast.warning(`Evaluation completed with some issues using ${selectedModel}`);
      }

    } catch (error) {
      console.error('Error starting evaluation:', error);
      setEvaluationStatus('❌ Evaluation failed');
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`Failed to start evaluation: ${errorMessage}`);
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleStartEvaluation = () => {
    if (!assessment?.question_paper?.file_url && !uploadedFiles.questionPaper) {
      toast.error("Please upload a question paper first");
      return;
    }
    if (!assessment?.model_answer_paper?.file_url && !uploadedFiles.modelAnswer) {
      toast.error("Please upload a model answer first");
      return;
    }
    if (!assessment?.submissions || assessment.submissions.length === 0) {
      toast.error("No student submissions found for evaluation");
      return;
    }

    // Only allow submissions from current assessment
    const validSelectedSubmissions = selectedSubmissions.filter(id =>
      assessment.submissions.some(s => s.submission_id === id)
    );

    if (validSelectedSubmissions.length === 0) {
      toast.error("Please select valid submissions for this assessment");
      return;
    }

    // Start evaluation with filtered submissions
    startEvaluation();
  };

  const isEvaluationReady = () => {
    return (
      (assessment?.question_paper?.file_url || uploadedFiles.questionPaper) &&
      (assessment?.model_answer_paper?.file_url || uploadedFiles.modelAnswer) &&
      assessment?.submissions &&
      assessment.submissions.length > 0
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-sm">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading assessment...</p>
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
          <p className="text-gray-600">Assessment not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-6 py-8">
         {/* Breadcrumbs */}
        <div className="mb-6">
          <Breadcrumbs 
            items={breadcrumbs} 
            className=""
          />
        </div>
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="border-b border-gray-100 pb-4 mb-4">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {assessment.title}
            </h1>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div className="text-sm text-gray-600">
                <span className="font-medium">{assessment.module.module_code}</span>
                <span className="mx-2">•</span>
                <span>{assessment.module.module_name}</span>
              </div>
              <div className="text-sm text-gray-600">
                <span className="font-medium">Submissions: </span>
                <span className="text-blue-600">{assessment.submissions?.length ?? 0}</span>
                <span className="mx-1">/</span>
                <span>{assessment.enrollmentCount ?? 0} enrolled</span>
              </div>
            </div>
          </div>
          {assessment.description && (
            <p className="text-gray-700 leading-relaxed">{assessment.description}</p>
          )}
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 mb-6">
  <div className="flex items-center justify-between">
    <div>
      <h3 className="font-medium text-gray-900 mb-1">Assessment Results</h3>
      <p className="text-sm text-gray-600">View detailed grading results and analytics</p>
    </div>
    <Link
      href={`/educator/dashboard/results-dashboard?assessmentId=${assessmentId}&title=${encodeURIComponent(assessment.title)}&module=${encodeURIComponent(assessment.module.module_name)}`}
      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
      View Dashboard
    </Link>
  </div>
</div>

        {/* File Upload Sections */}
        <div className="space-y-6">
          {/* Question Paper */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Question Paper</h2>
              {assessment.question_paper?.file_url && (
                <a
                  href={assessment.question_paper.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  <FileIcon className="w-4 h-4 mr-2" />
                  View Current Question Paper
                </a>
              )}
            </div>

            <input
              type="file"
              ref={questionPaperInputRef}
              onChange={(e) => handleFileChange(e, "questionPaper")}
              className="hidden"
              accept={FILE_CONFIG.QUESTION_PAPER.types.join(",")}
            />

            <FileUploadSection
              title="Upload Question Paper"
              icon={<FileIcon />}
              type="QUESTION_PAPER"
              uploadedFile={uploadedFiles.questionPaper}
              onTriggerUpload={() => triggerFileInput(questionPaperInputRef)}
            />

            {uploadedFiles.questionPaper && (
              <div className="mt-4 flex justify-end">
                <Button onClick={uploadQuestionPaper} disabled={isUploadingQuestionPaper} className="px-6">
                  {isUploadingQuestionPaper ? "Uploading..." : "Upload Question Paper"}
                </Button>
              </div>
            )}
          </div>

          {/* Model Answer */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Model Answer</h2>
              {assessment.model_answer_paper?.file_url && (
                <a
                  href={assessment.model_answer_paper.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  <FileIcon className="w-4 h-4 mr-2" />
                  View Current Model Answer
                </a>
              )}
            </div>

            <input
              type="file"
              ref={modelAnswerInputRef}
              onChange={(e) => handleFileChange(e, "modelAnswer")}
              className="hidden"
              accept={FILE_CONFIG.MODEL_PAPER.types.join(",")}
            />

            <FileUploadSection
              title="Upload Model Answer"
              icon={<FileIcon />}
              type="MODEL_PAPER"
              uploadedFile={uploadedFiles.modelAnswer}
              onTriggerUpload={() => triggerFileInput(modelAnswerInputRef)}
            />

            {uploadedFiles.modelAnswer && (
              <div className="mt-4 flex justify-end">
                <Button onClick={uploadModelAnswer} disabled={isUploadingModelAnswer} className="px-6">
                  {isUploadingModelAnswer ? "Uploading..." : "Upload Model Answer"}
                </Button>
              </div>
            )}
          </div>
        </div>

        

        {/* Enhanced Submissions Selection */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mt-6">
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Select Submissions for Evaluation</h2>
              <div className="text-sm text-gray-600 bg-gray-50 px-3 py-1 rounded-full">
                {selectedSubmissions.length} of {filteredAndSortedSubmissions.length} selected
              </div>
            </div>
            
            {/* Controls */}
            <div className="flex flex-col lg:flex-row gap-4 mb-4">
              {/* Search - Fixed text visibility */}
              <div className="flex-1 max-w-sm">
                <div className="relative">
                  <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search by name or registration number..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                    style={{ color: '#111827' }} // Ensure dark text
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>
              
              {/* Filter */}
              <select
                value={filterStatus}
                onChange={(e) => {
                  setFilterStatus(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
              >
                <option value="all">All Submissions</option>
                <option value="graded">Already Graded</option>
                <option value="ungraded">Not Graded</option>
              </select>
              
              {/* Items per page */}
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
              >
                <option value={10}>10 per page</option>
                <option value={20}>20 per page</option>
                <option value={50}>50 per page</option>
                <option value={100}>100 per page</option>
              </select>
            </div>
            
            {/* Quick Actions */}
            <div className="flex flex-wrap gap-2 mb-4">
              <button
                onClick={handleSelectAll}
                className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
              >
                {selectedSubmissions.length === filteredAndSortedSubmissions.length ? 'Deselect All' : 'Select All Filtered'}
                ({filteredAndSortedSubmissions.length})
              </button>
              <button
                onClick={handleSelectPage}
                className="px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
              >
                {paginatedSubmissions.every(s => selectedSubmissions.includes(s.submission_id)) ? 'Deselect' : 'Select'} Current Page
                ({paginatedSubmissions.length})
              </button>
              {selectedSubmissions.length > 0 && (
                <button
                  onClick={() => setSelectedSubmissions([])}
                  className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                >
                  Clear Selection
                </button>
              )}
            </div>
          </div>
          
          {/* Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={paginatedSubmissions.length > 0 && paginatedSubmissions.every(s => selectedSubmissions.includes(s.submission_id))}
                      onChange={handleSelectPage}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                    onClick={() => handleSort('registration_number')}
                  >
                    <div className="flex items-center gap-1">
                      Student Index
                      <SortIcon field="registration_number" />
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                    onClick={() => handleSort('name')}
                  >
                    <div className="flex items-center gap-1">
                      Student Name
                      <SortIcon field="name" />
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                    onClick={() => handleSort('submitted_at')}
                  >
                    <div className="flex items-center gap-1">
                      Submitted At
                      <SortIcon field="submitted_at" />
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                    onClick={() => handleSort('grade')}
                  >
                    <div className="flex items-center gap-1">
                      Current Grade
                      <SortIcon field="grade" />
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedSubmissions.map((sub) => {
                  const bestGrade = getBestGrade(sub);
                  return (
                    <tr 
                      key={sub.submission_id} 
                      className={`hover:bg-gray-50 transition-colors ${
                        selectedSubmissions.includes(sub.submission_id) ? 'bg-blue-50 border-blue-200' : ''
                      }`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedSubmissions.includes(sub.submission_id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedSubmissions(prev => [...prev, sub.submission_id]);
                            } else {
                              setSelectedSubmissions(prev => prev.filter(id => id !== sub.submission_id));
                            }
                          }}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {sub.student.registration_number}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {getStudentDisplayName(sub.student)}
                        </div>
                        <div className="text-sm text-gray-500">{getStudentEmail(sub.student)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {new Date(sub.submission_start_at).toLocaleDateString()}
                        </div>
                        <div className="text-sm text-gray-500">
                          {new Date(sub.submission_start_at).toLocaleTimeString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {bestGrade ? (
                          <div className="text-sm">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-gray-900">
                                {bestGrade.marks_awarded}
                              </span>
                              <span className="text-gray-500">
                                /{bestGrade.max_marks}
                              </span>
                              {bestGrade.isAI && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                                  {bestGrade.source}
                                </span>
                              )}
                            </div>
                            {bestGrade.graded_at && (
                              <div className="text-xs text-gray-400 mt-1">
                                {new Date(bestGrade.graded_at).toLocaleDateString()}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">Not graded</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col gap-1">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            bestGrade 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {bestGrade ? 'Graded' : 'Pending'}
                          </span>
                          {bestGrade && (
                            <span className="text-xs text-gray-500">
                              Can re-evaluate
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {paginatedSubmissions.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                      <div className="text-sm">
                        {searchTerm || filterStatus !== 'all' 
                          ? 'No submissions match your filters.' 
                          : 'No submissions available.'}
                      </div>
                      {(searchTerm || filterStatus !== 'all') && (
                        <button
                          onClick={() => {
                            setSearchTerm('');
                            setFilterStatus('all');
                            setCurrentPage(1);
                          }}
                          className="mt-2 text-sm text-blue-600 hover:text-blue-700"
                        >
                          Clear filters
                        </button>
                      )}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredAndSortedSubmissions.length)} of{' '}
                {filteredAndSortedSubmissions.length} submissions
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                
                {/* Page numbers */}
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 7) {
                      pageNum = i + 1;
                    } else if (currentPage <= 4) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 3) {
                      pageNum = totalPages - 6 + i;
                    } else {
                      pageNum = currentPage - 3 + i;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`px-3 py-2 text-sm font-medium rounded-md ${
                          currentPage === pageNum
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Evaluation Status */}
        {evaluationStatus && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
            <p className="text-sm text-blue-800">{evaluationStatus}</p>
          </div>
        )}

        {/* Evaluation Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">AI Evaluation</h2>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium text-gray-700">Select AI Model:</label>
              <Dropdown options={models} selectedOption={selectedModel} onSelect={setSelectedModel} />
            </div>
            <Button
              disabled={!isEvaluationReady() || isEvaluating || selectedSubmissions.length === 0}
              onClick={handleStartEvaluation}
              className="px-6 py-2.5"
            >
              <BotIcon className="w-5 h-5 mr-2" />
              {isEvaluating ? 'Evaluating...' : `Start Evaluation (${selectedSubmissions.length} selected)`}
            </Button>
          </div>

          {!isEvaluationReady() && (
            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-md">
              <p className="text-sm text-amber-800">
                <span className="font-medium">Requirements for evaluation:</span>
              </p>
              <ul className="text-sm text-amber-700 mt-2 space-y-1">
                {(!assessment?.question_paper?.file_url && !uploadedFiles.questionPaper) && <li>• Question paper needs to be uploaded</li>}
                {(!assessment?.model_answer_paper?.file_url && !uploadedFiles.modelAnswer) && <li>• Model answer needs to be uploaded</li>}
                {(!assessment?.submissions || assessment.submissions.length === 0) && <li>• No student submissions available</li>}
                {selectedSubmissions.length === 0 && <li>• Select at least one submission for evaluation</li>}
              </ul>
            </div>
          )}

          {isEvaluationReady() && selectedSubmissions.length === 0 && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-sm text-blue-800">
                <span className="font-medium">Select submissions:</span> Please select at least one submission from the table above to start evaluation.
              </p>
            </div>
          )}

          {isEvaluationReady() && selectedSubmissions.length > 0 && !isEvaluating && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
              <p className="text-sm text-green-800">
                <span className="font-medium">Ready for evaluation!</span> All required files are uploaded and {selectedSubmissions.length} student submissions are selected for evaluation with {selectedModel}.
                {selectedSubmissions.some(id => {
                  const sub = assessment.submissions.find(s => s.submission_id === id);
                  return sub && getBestGrade(sub) !== null;
                }) && (
                  <span className="block mt-1 text-green-700">
                    Note: Some selected submissions are already graded and will be re-evaluated.
                  </span>
                )}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}