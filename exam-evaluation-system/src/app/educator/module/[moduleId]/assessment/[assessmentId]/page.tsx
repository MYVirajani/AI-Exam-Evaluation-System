"use client";

import { useSearchParams, useParams } from "next/navigation";
import { useState, useEffect, useRef, useMemo } from "react";
import { FileIcon, BotIcon } from "@/components/Icons";
import Button from "@/components/Button";
import Dropdown from "@/components/Dropdown";
import { FileUploadSection } from "@/components/Upload/FileUploadSection";
import Breadcrumbs from "@/components/Breadcrumbs";
import { getAssessmentBreadcrumbs } from "@/utils/breadcrumbs";
import toast from "react-hot-toast";
import { FILE_CONFIG } from "@/lib/fileConfig";
import Link from "next/link";
import LoadingAnimation from "@/components/LoadingAnimation";
import AdvancedAssessmentSettings from "@/components/AdvancedAssessmentSettings";
import ConfirmDialog from "@/components/ConfirmDialog";

interface User {
  first_name: string;
  last_name: string;
  email: string;
}

interface Grade {
  submission_id: string;
  model_id: string;
  score: number;
  max_marks: number;
  updated_on: string;
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
  grades: Grade[]; // Changed from grade?: Grade | null to grades: Grade[]
}

interface EvaluationModel {
  id: string;
  model_name: string;
  provider: string;
  description?: string;
}

interface AssessmentDataFromApi {
  assessment: {
    assessment_id: string;
    type: string;
    title: string;
    description?: string;
    deadline: string;
    created_on: string;
    auto_grade: boolean;
    is_graded: boolean;
    model_id?: string | null;
    model_answer_paper?: {
      id: string;
      file_url: string;
      created_on: string;
      updated_on: string;
    } | null;
    question_paper?: {
      file_url: string;
      created_on: string;
      updated_on: string;
    } | null;
    submissions: Submission[];
  };
  module: {
    module_id: string;
    module_code: string;
    module_name: string;
  };
  enrollmentCount: number;
  evaluation_models: EvaluationModel[];
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
  const [evaluationModels, setEvaluationModels] = useState<EvaluationModel[]>(
    []
  );
  const [selectedModelId, setSelectedModelId] = useState<string>("");
  const [isUploadingModelAnswer, setIsUploadingModelAnswer] = useState(false);
  const [isUploadingQuestionPaper, setIsUploadingQuestionPaper] =
    useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluationStatus, setEvaluationStatus] = useState<string>("");
  const [selectedSubmissions, setSelectedSubmissions] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState("registration_number");
  const [sortDirection, setSortDirection] = useState("asc");
  const [filterStatus, setFilterStatus] = useState("all");
  const [isDeletingModelAnswer, setIsDeletingModelAnswer] = useState(false);
  const [isProcessingModelAnswer, setIsProcessingModelAnswer] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const breadcrumbs = assessment
    ? getAssessmentBreadcrumbs(
        assessment.module.module_code,
        moduleId,
        assessment.title,
        assessmentId,
        "educator"
      )
    : [
        { label: "Dashboard", href: "/educator/dashboard" },
        { label: "Module", href: `/educator/module/${moduleId}` },
        { label: "Assessment", current: true },
      ];

  // Enhanced helper function to get student display name
  const getStudentDisplayName = (student: any) => {
    if (!student?.user) {
      return `Student ${student?.registration_number || "Unknown"}`;
    }

    const { first_name = "", last_name = "", email = "" } = student.user;
    const fullName = `${first_name} ${last_name}`.trim();

    if (fullName) {
      return fullName;
    }

    if (email) {
      return email.split("@")[0];
    }

    return `Student ${student.registration_number}`;
  };

  const getStudentEmail = (student: any) => {
    return student?.user?.email || "";
  };

  const getSubmissionStatus = (
    submission: Submission
  ): "Graded" | "Pending" => {
    // Check if submission has any grade for the selectedModelId
    const gradeForModel = submission.grades.find(
      (grade) => grade.model_id === selectedModelId
    );

    return gradeForModel ? "Graded" : "Pending";
  };

  // 3. Update getAssessmentGradingStats to work with grades array
  const getAssessmentGradingStats = () => {
    if (!assessment || !assessment.model_id) {
      return { graded: 0, pending: 0, percentage: 0 };
    }

    // Count submissions that have a grade for the assessment's default model
    const graded = assessment.submissions.filter((sub) =>
      sub.grades.some((grade) => grade.model_id === assessment.model_id)
    ).length;

    const total = assessment.submissions.length;
    const pending = total - graded;
    const percentage = total > 0 ? Math.round((graded / total) * 100) : 0;

    return { graded, pending, percentage };
  };

  // 2. Update the stats variable to use the assessment stats function
  const assessmentStats = getAssessmentGradingStats();

  // Filter and sort submissions
  const filteredAndSortedSubmissions = useMemo(() => {
    if (!assessment?.submissions) return [];

    let filtered = assessment.submissions.filter((sub) => {
      const studentName = getStudentDisplayName(sub.student);
      const studentEmail = getStudentEmail(sub.student);
      const status = getSubmissionStatus(sub);

      const matchesSearch =
        searchTerm === "" ||
        sub.student.registration_number
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        studentEmail.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesFilter =
        filterStatus === "all" ||
        (filterStatus === "graded" && status === "Graded") ||
        (filterStatus === "ungraded" && status === "Pending");

      return matchesSearch && matchesFilter;
    });

    filtered.sort((a, b) => {
      let aValue, bValue;

      switch (sortField) {
        case "registration_number":
          aValue = a.student.registration_number;
          bValue = b.student.registration_number;
          break;
        case "name":
          aValue = getStudentDisplayName(a.student);
          bValue = getStudentDisplayName(b.student);
          break;
        case "submitted_at":
          aValue = new Date(a.submission_start_at);
          bValue = new Date(b.submission_start_at);
          break;
        case "status":
          aValue = getSubmissionStatus(a);
          bValue = getSubmissionStatus(b);
          break;
        default:
          aValue = a.student.registration_number;
          bValue = b.student.registration_number;
      }

      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [
    assessment?.submissions,
    searchTerm,
    sortField,
    sortDirection,
    filterStatus,
    selectedModelId,
  ]);

  // Pagination
  const totalPages = Math.ceil(
    filteredAndSortedSubmissions.length / itemsPerPage
  );
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedSubmissions = filteredAndSortedSubmissions.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  // Selection handlers
  const handleSelectAll = () => {
    if (selectedSubmissions.length === filteredAndSortedSubmissions.length) {
      setSelectedSubmissions([]);
    } else {
      setSelectedSubmissions(
        filteredAndSortedSubmissions.map((s) => s.submission_id)
      );
    }
  };

  const handleSelectPage = () => {
    const pageSubmissionIds = paginatedSubmissions.map((s) => s.submission_id);
    const allPageSelected = pageSubmissionIds.every((id) =>
      selectedSubmissions.includes(id)
    );

    if (allPageSelected) {
      setSelectedSubmissions((prev) =>
        prev.filter((id) => !pageSubmissionIds.includes(id))
      );
    } else {
      setSelectedSubmissions((prev) => [
        ...new Set([...prev, ...pageSubmissionIds]),
      ]);
    }
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
    setCurrentPage(1);
  };

  const SortIcon = ({ field }: { field: string }) => {
    if (sortField !== field) return <span className="text-gray-400">⇅</span>;
    return sortDirection === "asc" ? (
      <span className="text-blue-600">↑</span>
    ) : (
      <span className="text-blue-600">↓</span>
    );
  };

  const deleteModelAnswer = async () => {
    if (!assessment?.model_answer_paper?.file_url) return;

    setIsDeletingModelAnswer(true);
    const toastId = toast.loading("Deleting model answer...");

    try {
      const res = await fetch(
        `/api/educator/module/${moduleId}/assessment/${assessmentId}/model-paper`,
        { method: "DELETE" }
      );

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Delete failed");
      }

      await refetchAssessment();

      toast.success("Model answer deleted successfully!", { id: toastId });
      setShowDeleteConfirm(false);
    } catch (error) {
      console.error("Error deleting model answer:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to delete model answer",
        { id: toastId }
      );
    } finally {
      setIsDeletingModelAnswer(false);
    }
  };

  const processModelAnswer = async () => {
    if (!assessment?.model_answer_paper?.file_url) {
      toast.error("Please upload a model answer first");
      return;
    }

    if (!selectedModelId || evaluationModels.length === 0) {
      toast.error("Please select an AI model first");
      return;
    }

    setIsProcessingModelAnswer(true);
    const toastId = toast.loading("Processing model answer for grading...");

    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_MODEL_SERVER_URL;

      if (!API_BASE_URL) {
        throw new Error(
          "API base URL is not defined. Add NEXT_PUBLIC_MODEL_SERVER_URL to exam-evaluation-system/.env"
        );
      }

      const response = await fetch(
        `${API_BASE_URL}/model-answer/process-extract-embed`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model_answer_paper_id: assessment.model_answer_paper.id,
            assessment_id: assessmentId,
            model_id: selectedModelId,
            extract_media: true,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Failed to process model answer");
      }

      toast.success("Model answer processed successfully!", { id: toastId });
      await refetchAssessment();
    } catch (error) {
      console.error("Error processing model answer:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to process model answer",
        { id: toastId }
      );
    } finally {
      setIsProcessingModelAnswer(false);
    }
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

        if (data.evaluation_models && data.evaluation_models.length > 0) {
          setEvaluationModels(data.evaluation_models);
          // Set to assessment.model_id if it exists, otherwise use first available model
          setSelectedModelId(
            data.assessment.model_id || data.evaluation_models[0].id
          );
        } else {
          toast.error(
            "No evaluation models available. Please subscribe to a plan."
          );
        }
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
      const updatedData: AssessmentDataFromApi =
        await updatedAssessmentRes.json();
      setAssessment({
        ...updatedData.assessment,
        module: updatedData.module,
        enrollmentCount: updatedData.enrollmentCount,
      });

      if (updatedData.evaluation_models) {
        setEvaluationModels(updatedData.evaluation_models);
      }
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
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to upload model answer",
        { id: toastId }
      );
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
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to upload question paper",
        { id: toastId }
      );
    } finally {
      setIsUploadingQuestionPaper(false);
    }
  };

  const triggerFileInput = (ref: React.RefObject<HTMLInputElement | null>) => {
    ref.current?.click();
  };

  const startEvaluation = async () => {
    setIsEvaluating(true);
    setEvaluationStatus("Starting evaluation...");

    if (!assessment) {
      setEvaluationStatus("❌ Assessment not found");
      setIsEvaluating(false);
      return;
    }

    const validSelectedSubmissions = selectedSubmissions.filter((subId) =>
      assessment.submissions.some((sub) => sub.submission_id === subId)
    );

    if (validSelectedSubmissions.length === 0) {
      setEvaluationStatus("❌ No valid submissions selected");
      setIsEvaluating(false);
      toast.error("Please select valid submissions for evaluation");
      return;
    }

    if (!assessment.model_answer_paper?.id) {
      setEvaluationStatus("❌ Model answer not found");
      setIsEvaluating(false);
      toast.error("Model answer ID not found");
      return;
    }

    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_MODEL_SERVER_URL;

      if (!API_BASE_URL) {
        throw new Error(
          "API base URL is not defined. Add NEXT_PUBLIC_MODEL_SERVER_URL to .env"
        );
      }

      setEvaluationStatus(
        `Grading ${validSelectedSubmissions.length} submissions...`
      );

      const response = await fetch(`${API_BASE_URL}/rag-grader/grade`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model_id: selectedModelId,
          submission_ids: validSelectedSubmissions,
          model_paper_id: assessment.model_answer_paper.id,
          assessment_id: assessmentId,
          lecturer_id: educatorId,
          module_id: moduleId,
          top_k: 5,
          question_numbers: null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Failed to grade submissions");
      }

      const selectedModelName =
        evaluationModels.find((m) => m.id === selectedModelId)?.model_name ||
        "AI";

      let statusMessage = `✅ Successfully graded ${data.count} questions with ${selectedModelName}!`;

      if (data.model_answer_embedded) {
        statusMessage += "\n📝 Model answer was processed and embedded.";
      }

      if (data.student_missing_embeddings_processed?.length > 0) {
        statusMessage += `\n🔄 Processed ${data.student_missing_embeddings_processed.length} student submissions.`;
      }

      setEvaluationStatus(statusMessage);
      toast.success(
        `Evaluation completed successfully!`
      );

      await refetchAssessment();
    } catch (error) {
      console.error("Error during evaluation:", error);
      setEvaluationStatus("❌ Evaluation failed");
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      toast.error(`Failed to complete evaluation: ${errorMessage}`);
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleStartEvaluation = () => {
    if (
      !assessment?.model_answer_paper?.file_url &&
      !uploadedFiles.modelAnswer
    ) {
      toast.error("Please upload a model answer first");
      return;
    }
    if (!assessment?.submissions || assessment.submissions.length === 0) {
      toast.error("No student submissions found for evaluation");
      return;
    }

    const validSelectedSubmissions = selectedSubmissions.filter((id) =>
      assessment.submissions.some((s) => s.submission_id === id)
    );

    if (validSelectedSubmissions.length === 0) {
      toast.error("Please select valid submissions for this assessment");
      return;
    }

    startEvaluation();
  };

  const isEvaluationReady = () => {
    return (
      (assessment?.model_answer_paper?.file_url || uploadedFiles.modelAnswer) &&
      assessment?.submissions &&
      assessment.submissions.length > 0
    );
  };

  if (loading) {
    return (
      <LoadingAnimation
        variant="wave"
        size="lg"
        text="Loading assessment..."
        fullScreen={true}
        color="blue"
      />
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
          <Breadcrumbs items={breadcrumbs} className="" />
        </div>

        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="border-b border-gray-100 pb-4 mb-4">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {assessment.title}
            </h1>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div className="text-sm text-gray-600">
                <span className="font-medium">
                  {assessment.module.module_code}
                </span>
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
            <p className="text-gray-700 leading-relaxed">
              {assessment.description}
            </p>
          )}
        </div>

        {/* Grading Statistics Card - NEW */}
        {/* {selectedModelId && (
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Grading Progress for{" "}
                {evaluationModels.find((m) => m.id === assessment.model_id)
                  ?.model_name || "Selected Model"}
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="text-sm text-gray-600 mb-1">
                  Total Submissions
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {assessment.submissions.length}
                </div>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="text-sm text-gray-600 mb-1">Graded</div>
                <div className="text-2xl font-bold text-green-600">
                  {stats.graded}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {stats.percentage}% complete
                </div>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="text-sm text-gray-600 mb-1">Pending</div>
                <div className="text-2xl font-bold text-orange-600">
                  {stats.pending}
                </div>
              </div>
            </div>
          </div>
        )} */}
        {assessment?.model_id && (
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Grading Progress for{" "}
                {evaluationModels.find((m) => m.id === assessment.model_id)
                  ?.model_name || "Default Model"}
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="text-sm text-gray-600 mb-1">
                  Total Submissions
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {assessment.submissions.length}
                </div>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="text-sm text-gray-600 mb-1">Graded</div>
                <div className="text-2xl font-bold text-green-600">
                  {assessmentStats.graded}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {assessmentStats.percentage}% complete
                </div>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="text-sm text-gray-600 mb-1">Pending</div>
                <div className="text-2xl font-bold text-orange-600">
                  {assessmentStats.pending}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-900 mb-1">
                Assessment Results
              </h3>
              <p className="text-sm text-gray-600">
                View detailed grading results and analytics
              </p>
            </div>
            <Link
              href={`/educator/module/${assessment.module.module_id}/assessment/${assessmentId}/assessment-results`}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
              View Dashboard
            </Link>
          </div>
        </div>

        {/* Advanced Assessment Settings */}
        <AdvancedAssessmentSettings
          assessmentId={assessmentId}
          moduleId={moduleId}
          currentDeadline={assessment.deadline}
          currentAutoGrade={assessment.auto_grade}
          currentDefaultModelId={assessment.model_id}
          evaluationModels={evaluationModels}
          onUpdateSuccess={refetchAssessment}
        />

        {/* File Upload Sections */}
        <div className="space-y-6">
          {/* Question Paper */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Question Paper
              </h2>
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
            {!assessment?.question_paper?.file_url && (
              <FileUploadSection
                title="Upload Question Paper"
                icon={<FileIcon />}
                type="QUESTION_PAPER"
                uploadedFile={uploadedFiles.questionPaper}
                onTriggerUpload={() => triggerFileInput(questionPaperInputRef)}
              />
            )}

            {uploadedFiles.questionPaper && (
              <div className="mt-4 flex justify-end">
                <Button
                  onClick={uploadQuestionPaper}
                  disabled={isUploadingQuestionPaper}
                  className="px-6"
                >
                  {isUploadingQuestionPaper
                    ? "Uploading..."
                    : "Upload Question Paper"}
                </Button>
              </div>
            )}
          </div>

          {/* Model Answer */}
          <>
            <ConfirmDialog
              isOpen={showDeleteConfirm}
              title="Delete Model Answer"
              message="Are you sure you want to delete the model answer? This action cannot be undone and will remove all processed data."
              onConfirm={deleteModelAnswer}
              onCancel={() => setShowDeleteConfirm(false)}
              confirmText="Delete"
              cancelText="Cancel"
              variant="destructive"
              loading={isDeletingModelAnswer}
              icon={
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              }
            />

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  Model Answer
                </h2>
                {assessment.model_answer_paper?.file_url && (
                  <div className="flex items-center gap-3">
                    <a
                      href={assessment.model_answer_paper.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      <FileIcon className="w-4 h-4 mr-2" />
                      View Current Model Answer
                    </a>
                    <button
                      onClick={() => setShowDeleteConfirm(true)}
                      disabled={isDeletingModelAnswer}
                      className="inline-flex items-center text-sm text-red-600 hover:text-red-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      title="Delete model answer"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                )}
              </div>

              <input
                type="file"
                ref={modelAnswerInputRef}
                onChange={(e) => handleFileChange(e, "modelAnswer")}
                className="hidden"
                accept={FILE_CONFIG.MODEL_PAPER.types.join(",")}
              />

              {!assessment?.model_answer_paper?.file_url && (
                <FileUploadSection
                  title="Upload Model Answer"
                  icon={<FileIcon />}
                  type="MODEL_PAPER"
                  uploadedFile={uploadedFiles.modelAnswer}
                  onTriggerUpload={() => triggerFileInput(modelAnswerInputRef)}
                />
              )}

              <div className="mt-4 flex justify-end gap-3">
                {uploadedFiles.modelAnswer && (
                  <Button
                    onClick={uploadModelAnswer}
                    disabled={isUploadingModelAnswer}
                    className="px-6"
                  >
                    {isUploadingModelAnswer
                      ? "Uploading..."
                      : "Upload Model Answer"}
                  </Button>
                )}

                {assessment?.model_answer_paper?.file_url && (
                  <Button
                    onClick={processModelAnswer}
                    disabled={
                      isProcessingModelAnswer ||
                      !selectedModelId ||
                      evaluationModels.length === 0
                    }
                    className="px-6 bg-green-600 hover:bg-green-700"
                  >
                    {isProcessingModelAnswer
                      ? "Processing..."
                      : "Submit for Grading"}
                  </Button>
                )}
              </div>
            </div>
          </>
        </div>

        {/* Enhanced Submissions Selection */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mt-6">
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Select Submissions for Evaluation
              </h2>
              <div className="text-sm text-gray-600 bg-gray-50 px-3 py-1 rounded-full">
                {selectedSubmissions.length} of{" "}
                {filteredAndSortedSubmissions.length} selected
              </div>
            </div>

            {/* Controls */}
            <div className="flex flex-col lg:flex-row gap-4 mb-4">
              <div className="flex-1 max-w-sm">
                <div className="relative">
                  <svg
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
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
                    style={{ color: "#111827" }}
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm("")}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>

              <Dropdown
                options={["All Submissions", "Already Graded", "Not Graded"]}
                selectedOption={
                  filterStatus === "all"
                    ? "All Submissions"
                    : filterStatus === "graded"
                    ? "Already Graded"
                    : "Not Graded"
                }
                onSelect={(option) => {
                  const value =
                    option === "All Submissions"
                      ? "all"
                      : option === "Already Graded"
                      ? "graded"
                      : "ungraded";
                  setFilterStatus(value);
                  setCurrentPage(1);
                }}
                className="w-48"
              />
              <Dropdown
                options={[
                  "10 per page",
                  "20 per page",
                  "50 per page",
                  "100 per page",
                ]}
                selectedOption={`${itemsPerPage} per page`}
                onSelect={(option) => {
                  const value = parseInt(option.split(" ")[0]);
                  setItemsPerPage(value);
                  setCurrentPage(1);
                }}
                className="w-40"
              />
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap gap-2 mb-4">
              <button
                onClick={handleSelectAll}
                className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
              >
                {selectedSubmissions.length ===
                filteredAndSortedSubmissions.length
                  ? "Deselect All"
                  : "Select All Filtered"}
                ({filteredAndSortedSubmissions.length})
              </button>
              <button
                onClick={handleSelectPage}
                className="px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
              >
                {paginatedSubmissions.every((s) =>
                  selectedSubmissions.includes(s.submission_id)
                )
                  ? "Deselect"
                  : "Select"}{" "}
                Current Page ({paginatedSubmissions.length})
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
                      checked={
                        paginatedSubmissions.length > 0 &&
                        paginatedSubmissions.every((s) =>
                          selectedSubmissions.includes(s.submission_id)
                        )
                      }
                      onChange={handleSelectPage}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                    onClick={() => handleSort("registration_number")}
                  >
                    <div className="flex items-center gap-1">
                      Student Index
                      <SortIcon field="registration_number" />
                    </div>
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                    onClick={() => handleSort("name")}
                  >
                    <div className="flex items-center gap-1">
                      Student Name
                      <SortIcon field="name" />
                    </div>
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                    onClick={() => handleSort("submitted_at")}
                  >
                    <div className="flex items-center gap-1">
                      Submitted At
                      <SortIcon field="submitted_at" />
                    </div>
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                    onClick={() => handleSort("status")}
                  >
                    <div className="flex items-center gap-1">
                      Status
                      <SortIcon field="status" />
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Score
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedSubmissions.map((sub) => {
                  const status = getSubmissionStatus(sub);

                  // Find the grade for the selected model
                  const gradeForSelectedModel = sub.grades.find(
                    (grade) => grade.model_id === selectedModelId
                  );

                  return (
                    <tr
                      key={sub.submission_id}
                      className={`hover:bg-gray-50 transition-colors ${
                        selectedSubmissions.includes(sub.submission_id)
                          ? "bg-blue-50 border-blue-200"
                          : ""
                      }`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedSubmissions.includes(
                            sub.submission_id
                          )}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedSubmissions((prev) => [
                                ...prev,
                                sub.submission_id,
                              ]);
                            } else {
                              setSelectedSubmissions((prev) =>
                                prev.filter((id) => id !== sub.submission_id)
                              );
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
                        <div className="text-sm text-gray-500">
                          {getStudentEmail(sub.student)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {new Date(
                            sub.submission_start_at
                          ).toLocaleDateString()}
                        </div>
                        <div className="text-sm text-gray-500">
                          {new Date(
                            sub.submission_start_at
                          ).toLocaleTimeString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            status === "Graded"
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {gradeForSelectedModel ? (
                          <div className="text-sm">
                            <span className="font-semibold text-gray-900">
                              {gradeForSelectedModel.score}
                            </span>
                            <span className="text-gray-500">
                              {" "}
                              / {gradeForSelectedModel.max_marks}
                            </span>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {paginatedSubmissions.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-8 text-center text-gray-500"
                    >
                      <div className="text-sm">
                        {searchTerm || filterStatus !== "all"
                          ? "No submissions match your filters."
                          : "No submissions available."}
                      </div>
                      {(searchTerm || filterStatus !== "all") && (
                        <button
                          onClick={() => {
                            setSearchTerm("");
                            setFilterStatus("all");
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
                Showing {startIndex + 1} to{" "}
                {Math.min(
                  startIndex + itemsPerPage,
                  filteredAndSortedSubmissions.length
                )}{" "}
                of {filteredAndSortedSubmissions.length} submissions
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                  className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>

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
                            ? "bg-blue-600 text-white"
                            : "text-gray-700 bg-white border border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
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
            <p className="text-sm text-blue-800 whitespace-pre-line">
              {evaluationStatus}
            </p>
          </div>
        )}

        {/* Evaluation Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            AI Evaluation
          </h2>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium text-gray-700">
                Select AI Model:
              </label>
              {evaluationModels.length > 0 ? (
                <div className="flex items-center gap-2">
                  <Dropdown
                    options={evaluationModels.map((model) => model.model_name)}
                    selectedOption={
                      evaluationModels.find((m) => m.id === selectedModelId)
                        ?.model_name || ""
                    }
                    onSelect={(modelName) => {
                      const model = evaluationModels.find(
                        (m) => m.model_name === modelName
                      );
                      if (model) {
                        setSelectedModelId(model.id);
                      }
                    }}
                  />
                  {selectedModelId !== assessment?.model_id &&
                    assessment?.model_id && (
                      <span className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-md">
                        Different from default
                      </span>
                    )}
                </div>
              ) : (
                <div className="text-sm text-red-600">
                  No models available. Please subscribe to a plan.
                </div>
              )}
            </div>
            <Button
              disabled={
                !isEvaluationReady() ||
                isEvaluating ||
                selectedSubmissions.length === 0 ||
                !selectedModelId ||
                evaluationModels.length === 0
              }
              onClick={handleStartEvaluation}
              className="px-6 py-2.5"
            >
              <BotIcon className="w-5 h-5 mr-2" />
              {isEvaluating
                ? "Evaluating..."
                : `Start Evaluation (${selectedSubmissions.length} selected)`}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
