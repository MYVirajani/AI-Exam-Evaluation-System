"use client";

import { useSearchParams, useParams } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { FileIcon, BotIcon } from "@/components/Icons";
import Button from "@/components/Button";
import Dropdown from "@/components/Dropdown";
import { FileUploadSection } from "@/components/Upload/FileUploadSection";
import toast from "react-hot-toast";

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
    examPaper: null as File | null,
    questionPaper: null as File | null,
    answerScripts: [] as File[],
    modelAnswer: null as File | null,
    markingScheme: null as File | null,
  });

  const modelAnswerInputRef = useRef<HTMLInputElement>(null);
  const questionPaperInputRef = useRef<HTMLInputElement>(null);

  const [selectedModel, setSelectedModel] = useState("ChatGPT");
  const [isUploadingModelAnswer, setIsUploadingModelAnswer] = useState(false);
  const [isUploadingQuestionPaper, setIsUploadingQuestionPaper] = useState(false);

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

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: keyof typeof uploadedFiles
  ) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (type === "answerScripts") {
      const newFiles = Array.from(files).filter(
        (file) => file.type === "application/pdf" || file.name.endsWith(".pdf")
      );
      setUploadedFiles((prev) => ({
        ...prev,
        [type]: [...prev.answerScripts, ...newFiles],
      }));
    } else {
      const file = files[0];
      setUploadedFiles((prev) => ({ ...prev, [type]: file }));
    }

    e.target.value = "";
  };

  const uploadModelAnswer = async () => {
    if (!uploadedFiles.modelAnswer) return;

    setIsUploadingModelAnswer(true);
    const toastId = toast.loading("Uploading model answer...");

    try {
      const formData = new FormData();
      formData.append("file", uploadedFiles.modelAnswer);
      console.log('uploadedFiles.modelAnswer: ',uploadedFiles.modelAnswer)

      const res = await fetch(
        `/api/educator/module/${moduleId}/assessment/${assessmentId}/model-paper`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Upload failed");
      }

      const data = await res.json();

      const updatedAssessment = await fetch(
        `/api/educator/module/${moduleId}/assessment/${assessmentId}?educatorId=${educatorId}`
      ).then((res) => res.json());

      setAssessment({
        ...updatedAssessment.assessments[0],
        module: updatedAssessment.module,
        enrollmentCount: updatedAssessment.enrollmentCount,
      });

      toast.success("Model answer uploaded successfully!", { id: toastId });
      setUploadedFiles((prev) => ({ ...prev, modelAnswer: null }));
    } catch (error) {
      console.error("Error uploading model answer:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to upload model answer",
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
        
        {
          method: "POST",
          body: formData,
        }
      );

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Upload failed");
      }

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

  const triggerFileInput = (ref: React.RefObject<HTMLInputElement>) => {
    ref.current?.click();
  };

  if (loading) return <div className="p-8">Loading...</div>;
  if (error) return <div className="p-8 text-red-600">Error: {error}</div>;
  if (!assessment) return <div className="p-8">Assessment not found</div>;

  return (
    <main className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          {assessment.title}
        </h1>
        <p className="text-gray-600 mb-1">
          Module: {assessment.module.module_code} - {assessment.module.module_name}
        </p>
        <p className="text-gray-600 mb-6">
          Uploads: {assessment.submissions?.length ?? 0} /{" "}
          {assessment.enrollmentCount ?? 0} Enrollments
        </p>

        {assessment.description && (
          <p className="text-gray-700 mb-6">{assessment.description}</p>
        )}

        
        {assessment.question_paper?.file_url && (
          <p className="text-sm mb-4">
            📘{" "}
            <a
              href={assessment.question_paper.file_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline"
            >
              View Uploaded Question Paper
            </a>
          </p>
        )}

        <input
          type="file"
          ref={modelAnswerInputRef}
          onChange={(e) => handleFileChange(e, "modelAnswer")}
          className="hidden"
          accept=".pdf,.docx"
        />

        <input
          type="file"
          ref={questionPaperInputRef}
          onChange={(e) => handleFileChange(e, "questionPaper")}
          className="hidden"
          accept=".pdf,.docx"
        />

        <div className="space-y-8">
         
          <FileUploadSection
            title="Question Paper"
            icon={<FileIcon />}
            acceptedTypes="PDF, DOCX"
            maxSize="5MB"
            uploadedFile={uploadedFiles.questionPaper}
            onTriggerUpload={() => triggerFileInput(questionPaperInputRef)}
          />
          <div className="mt-6 flex gap-4 justify-end">
        

          <Button
            onClick={uploadQuestionPaper}
            disabled={!uploadedFiles.questionPaper || isUploadingQuestionPaper}
          >
            {isUploadingQuestionPaper ? "Uploading..." : "Upload Question Paper"}
          </Button>
          
        </div>
        {assessment.model_answer_paper?.file_url && (
          <p className="text-sm mb-4">
            📘{" "}
            <a
              href={assessment.model_answer_paper.file_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline"
            >
              View Uploaded Model Answer
            </a>
          </p>
        )}
           <FileUploadSection
            title="Model Answer"
            icon={<FileIcon />}
            acceptedTypes="PDF, DOCX"
            maxSize="5MB"
            uploadedFile={uploadedFiles.modelAnswer}
            onTriggerUpload={() => triggerFileInput(modelAnswerInputRef)}
            
          />
          <div className="mt-6 flex gap-4 justify-end">
          <Button
            onClick={uploadModelAnswer}
            disabled={!uploadedFiles.modelAnswer || isUploadingModelAnswer}
          >
            {isUploadingModelAnswer ? "Uploading..." : "Upload Model Answer"}
          </Button>

        
        </div>

        </div>
        

        

        <div className="mt-10 flex justify-end items-center gap-4">
          <Dropdown
            options={models}
            selectedOption={selectedModel}
            onSelect={setSelectedModel}
          />
          <Button
            disabled={
              !uploadedFiles.examPaper ||
              uploadedFiles.answerScripts.length === 0
            }
            onClick={() => console.log("Evaluating with model:", selectedModel)}
          >
            <BotIcon className="w-5 h-5" />
            Start Evaluation
          </Button>
        </div>
      </div>
    </main>
  );
}
