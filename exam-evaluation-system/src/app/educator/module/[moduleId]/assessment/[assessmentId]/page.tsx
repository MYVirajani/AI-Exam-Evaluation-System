"use client";

import { useSearchParams, useParams } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { FileIcon, BotIcon } from "@/components/Icons";
import Button from "@/components/Button";
import Dropdown from "@/components/Dropdown";
import { FileUploadSection } from "@/components/Upload/FileUploadSection";
import Breadcrumbs from "@/components/Breadcrumbs";
import { getAssessmentBreadcrumbs } from "@/utils/breadcrumbs"
import toast from "react-hot-toast";
import { FILE_CONFIG } from "@/lib/fileConfig";

interface User {
  first_name: string;
  last_name: string;
  email: string;
}

interface Assessment {
  assessment_id: string;
  type: string;
  title: string;
  description?: string;
  deadline: string;
  model_answer_paper?: {
    file_url: string;
  } | null;
  question_paper?: {
    file_url: string;
  } | null;
  submissions: {
    submission_id: string;
    file_url: string;
    submission_start_at: string;
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
  assessment: {
    assessment_id: string;
    type: string;
    title: string;
    description?: string;
    deadline: string;
    model_answer_paper?: { file_url: string } | null;
    question_paper?: { file_url: string } | null;
    submissions: Submission[];
  };
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

        // ✅ Correct existence check
        if (!data || !data.assessment) {
          throw new Error("Assessment not found");
        }

        // ✅ Correct keys from API
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
        module: updatedData.module,                // ✅ use module
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

    // Start the actual evaluation
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
              disabled={!isEvaluationReady() || isEvaluating}
              onClick={handleStartEvaluation}
              className="px-6 py-2.5"
            >
              <BotIcon className="w-5 h-5 mr-2" />
              {isEvaluating ? 'Evaluating...' : 'Start Evaluation'}
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
              </ul>
            </div>
          )}

          {isEvaluationReady() && !isEvaluating && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
              <p className="text-sm text-green-800">
                <span className="font-medium">Ready for evaluation!</span> All required files are uploaded and {assessment.submissions.length} student submissions are available.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
