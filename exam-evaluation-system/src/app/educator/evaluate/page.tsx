"use client";
import { useSearchParams } from "next/navigation";
import { useState, useRef } from "react";
import {
  UploadIcon,
  FileIcon,
  CheckIcon,
  BotIcon,
  XIcon,
} from "@/components/Icons";
import Button from "@/components/Button";
import Dropdown from "@/components/Dropdown";

export default function UploadPage() {
  const searchParams = useSearchParams();
  const moduleId = searchParams.get("moduleId");

  // State for tracking uploaded files
  const [uploadedFiles, setUploadedFiles] = useState({
    examPaper: null as File | null,
    answerScripts: [] as File[],
    modelAnswer: null as File | null,
    markingScheme: null as File | null,
  });

  // Refs for hidden file inputs
  const examPaperInputRef = useRef<HTMLInputElement>(null);
  const answerScriptsInputRef = useRef<HTMLInputElement>(null);
  const modelAnswerInputRef = useRef<HTMLInputElement>(null);
  const markingSchemeInputRef = useRef<HTMLInputElement>(null);

  // Upload progress state
  const [uploadProgress, setUploadProgress] = useState<{
    [key: string]: number;
  }>({});
  const [uploadErrors, setUploadErrors] = useState<{ [key: string]: string }>(
    {}
  );
  const [selectedModel, setSelectedModel] = useState("ChatGPT");
  const models = ["ChatGPT", "Deepseek", "Gemini", "Llama"];

  const handleFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: keyof typeof uploadedFiles
  ) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (type === "answerScripts") {
      // Filter for PDFs only
      const newFiles = Array.from(files).filter(
        (file) => file.type === "application/pdf" || file.name.endsWith(".pdf")
      );

      // Add new files to state
      setUploadedFiles((prev) => ({
        ...prev,
        [type]: [...prev.answerScripts, ...newFiles],
      }));

      // Upload each file
      for (const file of newFiles) {
        await uploadFile(file, type);
      }
    } else {
      // Handle single file upload for other types
      const file = files[0];
      setUploadedFiles((prev) => ({ ...prev, [type]: file }));
      await uploadFile(file, type);
    }

    // Reset file input to allow selecting same files again
    e.target.value = "";
  };

  const uploadFile = async (file: File, type: string) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", type);
    if (moduleId) formData.append("moduleId", moduleId);

    try {
      setUploadProgress((prev) => ({ ...prev, [file.name]: 0 }));
      setUploadErrors((prev) => ({ ...prev, [file.name]: "" }));

      const response = await fetch("/api/educator", {
        method: "POST",
        body: formData,
        // You could add progress tracking here with axios or fetch polyfill
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      console.log(`${file.name} uploaded successfully`);
      setUploadProgress((prev) => ({ ...prev, [file.name]: 100 }));
    } catch (error) {
      console.error(`Error uploading ${file.name}:`, error);
      setUploadErrors((prev) => ({
        ...prev,
        [file.name]: error instanceof Error ? error.message : "Upload failed",
      }));

      // Remove failed upload from state
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
      const updatedScripts = [...prev.answerScripts];
      updatedScripts.splice(index, 1);
      return { ...prev, answerScripts: updatedScripts };
    });
  };

  return (
    <main className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">
          Exam Paper Evaluation {moduleId ? `- ${moduleId}` : ""}
        </h1>

        {/* Hidden file inputs */}
        <input
          type="file"
          ref={examPaperInputRef}
          onChange={(e) => handleFileChange(e, "examPaper")}
          accept=".pdf,.docx"
          className="hidden"
        />
        <input
          type="file"
          ref={answerScriptsInputRef}
          onChange={(e) => handleFileChange(e, "answerScripts")}
          accept=".pdf"
          multiple
          className="hidden"
        />
        <input
          type="file"
          ref={modelAnswerInputRef}
          onChange={(e) => handleFileChange(e, "modelAnswer")}
          accept=".pdf,.docx"
          className="hidden"
        />
        <input
          type="file"
          ref={markingSchemeInputRef}
          onChange={(e) => handleFileChange(e, "markingScheme")}
          accept=".pdf,.xlsx"
          className="hidden"
        />

        {/* Upload Sections */}
        <div className="space-y-8">
          {/* Exam Paper Upload */}
          <section className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <FileIcon className="w-5 h-5 text-blue-600" />
                Exam Paper
              </h2>
              <span className="text-sm text-gray-500">
                PDF, DOCX (Max 10MB)
              </span>
            </div>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <UploadIcon className="w-10 h-10 mx-auto text-gray-400 mb-2" />
              <p className="text-gray-500 mb-2">
                Drag and drop your exam paper here
              </p>
              <p className="text-gray-400 text-sm mb-4">or</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => triggerFileInput(examPaperInputRef)}
              >
                Browse Files
              </Button>
            </div>
            {uploadedFiles.examPaper && (
              <div className="mt-4 flex items-center gap-2 text-sm text-green-600">
                <CheckIcon className="w-4 h-4" />
                <span>{uploadedFiles.examPaper.name}</span>
              </div>
            )}
          </section>

          {/* Answer Scripts Upload */}
          <section className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <FileIcon className="w-5 h-5 text-blue-600" />
                Student Answer Scripts
              </h2>
              <span className="text-sm text-gray-500">
                PDF (Multiple allowed, Max 50MB each)
              </span>
            </div>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <UploadIcon className="w-10 h-10 mx-auto text-gray-400 mb-2" />
              <p className="text-gray-500 mb-2">
                Drag and drop answer scripts here
              </p>
              <p className="text-gray-400 text-sm mb-4">or</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => triggerFileInput(answerScriptsInputRef)}
              >
                Browse Files
              </Button>
            </div>

            {/* Uploaded files list */}
            {uploadedFiles.answerScripts.length > 0 && (
              <div className="mt-4 space-y-2">
                {uploadedFiles.answerScripts.map((file, index) => (
                  <div
                    key={`${file.name}-${index}`}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded border border-gray-200"
                  >
                    <div className="flex items-center gap-3">
                      <FileIcon className="w-4 h-4 text-blue-500" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">
                          {file.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {(file.size / (1024 * 1024)).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {uploadProgress[file.name] === 100 ? (
                        <CheckIcon className="w-4 h-4 text-green-500" />
                      ) : uploadErrors[file.name] ? (
                        <span className="text-xs text-red-500">Error</span>
                      ) : (
                        <div className="h-2 w-12 bg-gray-200 rounded-full">
                          <div
                            className="h-full bg-blue-500 rounded-full"
                            style={{
                              width: `${uploadProgress[file.name] || 0}%`,
                            }}
                          />
                        </div>
                      )}
                      <button
                        onClick={() => removeAnswerScript(index)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                        aria-label="Remove file"
                      >
                        <XIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Model Answer Sheet Upload */}
          <section className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <FileIcon className="w-5 h-5 text-blue-600" />
                Model Answer Sheet
              </h2>
              <span className="text-sm text-gray-500">PDF, DOCX (Max 5MB)</span>
            </div>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <UploadIcon className="w-10 h-10 mx-auto text-gray-400 mb-2" />
              <p className="text-gray-500 mb-2">
                Drag and drop model answer sheet here
              </p>
              <p className="text-gray-400 text-sm mb-4">or</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => triggerFileInput(modelAnswerInputRef)}
              >
                Browse Files
              </Button>
            </div>
            {uploadedFiles.modelAnswer && (
              <div className="mt-4 flex items-center gap-2 text-sm text-green-600">
                <CheckIcon className="w-4 h-4" />
                <span>{uploadedFiles.modelAnswer.name}</span>
              </div>
            )}
          </section>

          {/* Start Evaluation Button */}
          <div className="flex flex-col sm:flex-row justify-end items-end sm:items-center gap-4 mt-8">
            <div className="w-full sm:w-48">
              <label
                htmlFor="model-select"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Evaluation Model
              </label>
              <Dropdown
                options={models}
                selectedOption={selectedModel}
                onSelect={setSelectedModel}
                direction="top" // This makes it open upwards
                className="w-full sm:w-48"
              />
            </div>

            <Button
              variant="primary"
              size="lg"
              className="flex items-center gap-2 w-full sm:w-auto mt-4 sm:mt-0"
              disabled={
                !uploadedFiles.examPaper ||
                uploadedFiles.answerScripts.length === 0
              }
              onClick={() => {
                console.log(`Starting evaluation with model: ${selectedModel}`);
                // Add your evaluation logic here
              }}
            >
              <BotIcon className="w-5 h-5" />
              Start Evaluation
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}
