"use client";

import { useSearchParams, useParams } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { FileIcon, BotIcon } from "@/components/Icons";
import Button from "@/components/Button";
import Dropdown from "@/components/Dropdown";
import { FileUploadSection } from "@/components/Upload/FileUploadSection";
import { MultiFileUploadSection } from "@/components/Upload/MultiFileUploadSection";

interface Assessment {
  assessment_id: string;
  module_id: string;
  created_by: string;
  title: string;
  description?: string;
  module: {
    module_id: string;
    module_name: string;
  };
}

export default function AssessmentPage() {
  const searchParams = useSearchParams();
  const params = useParams();

  const moduleId = params.moduleId as string;
  const assessmentId = params.assessmentId as string;
  const educatorId = searchParams.get("educatorId");

  console.log("moduleId:", moduleId);
  console.log("assessmentId:", assessmentId);
  console.log("educatorId:", educatorId);

  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [uploadedFiles, setUploadedFiles] = useState({
    examPaper: null as File | null,
    answerScripts: [] as File[],
    modelAnswer: null as File | null,
    markingScheme: null as File | null,
  });

  const examPaperInputRef = useRef<HTMLInputElement>(null);
  const answerScriptsInputRef = useRef<HTMLInputElement>(null);
  const modelAnswerInputRef = useRef<HTMLInputElement>(null);
  const markingSchemeInputRef = useRef<HTMLInputElement>(null);

  const [uploadProgress, setUploadProgress] = useState<{
    [key: string]: number;
  }>({});
  const [uploadErrors, setUploadErrors] = useState<{ [key: string]: string }>(
    {}
  );
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
        setAssessment(data);
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

  const handleFileChange = async (
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

      for (const file of newFiles) await uploadFile(file, type);
    } else {
      const file = files[0];
      setUploadedFiles((prev) => ({ ...prev, [type]: file }));
      await uploadFile(file, type);
    }

    e.target.value = "";
  };

  const uploadFile = async (file: File, type: string) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", type);
    if (moduleId) formData.append("moduleId", moduleId);
    if (assessmentId) formData.append("assessmentId", assessmentId);

    try {
      setUploadProgress((prev) => ({ ...prev, [file.name]: 0 }));
      setUploadErrors((prev) => ({ ...prev, [file.name]: "" }));

      const res = await fetch("/api/educator/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error(`Upload failed: ${res.statusText}`);

      setUploadProgress((prev) => ({ ...prev, [file.name]: 100 }));
    } catch (error) {
      console.error(`Upload error for ${file.name}:`, error);
      setUploadErrors((prev) => ({
        ...prev,
        [file.name]: error instanceof Error ? error.message : "Upload failed",
      }));

      if (type === "answerScripts") {
        setUploadedFiles((prev) => ({
          ...prev,
          answerScripts: prev.answerScripts.filter((f) => f.name !== file.name),
        }));
      } else {
        setUploadedFiles((prev) => ({ ...prev, [type]: null }));
      }
    }
  };

  const triggerFileInput = (ref: React.RefObject<HTMLInputElement>) => {
    ref.current?.click();
  };

  const removeAnswerScript = (index: number) => {
    setUploadedFiles((prev) => {
      const updated = [...prev.answerScripts];
      updated.splice(index, 1);
      return { ...prev, answerScripts: updated };
    });
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
        <p className="text-gray-600 mb-6">
          Module: {assessment.module.module_name}
        </p>
        {assessment.description && (
          <p className="text-gray-700 mb-6">{assessment.description}</p>
        )}

        <input
          type="file"
          ref={examPaperInputRef}
          onChange={(e) => handleFileChange(e, "examPaper")}
          className="hidden"
        />
        <input
          type="file"
          ref={answerScriptsInputRef}
          onChange={(e) => handleFileChange(e, "answerScripts")}
          className="hidden"
          multiple
        />
        <input
          type="file"
          ref={modelAnswerInputRef}
          onChange={(e) => handleFileChange(e, "modelAnswer")}
          className="hidden"
        />
        <input
          type="file"
          ref={markingSchemeInputRef}
          onChange={(e) => handleFileChange(e, "markingScheme")}
          className="hidden"
        />

        <div className="space-y-8">
          {/* <FileUploadSection
            title="Exam Paper"
            icon={<FileIcon />}
            acceptedTypes="PDF, DOCX"
            maxSize="10MB"
            uploadedFile={uploadedFiles.examPaper}
            onTriggerUpload={() => triggerFileInput(examPaperInputRef)}
          />
          <MultiFileUploadSection
            title="Student Answer Scripts"
            icon={<FileIcon />}
            acceptedTypes="PDF"
            maxSize="50MB"
            uploadedFiles={uploadedFiles.answerScripts}
            onTriggerUpload={() => triggerFileInput(answerScriptsInputRef)}
            onRemoveFile={removeAnswerScript}
            uploadProgress={uploadProgress}
            uploadErrors={uploadErrors}
          /> */}
          <FileUploadSection
            title="Model Answer"
            icon={<FileIcon />}
            acceptedTypes="PDF, DOCX"
            maxSize="5MB"
            uploadedFile={uploadedFiles.modelAnswer}
            onTriggerUpload={() => triggerFileInput(modelAnswerInputRef)}
          />
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
