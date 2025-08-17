"use client";

import { Upload, FileText, X } from "lucide-react";
import { useState } from "react";
import Button from "@/components/Button";
import { FILE_CONFIG, getMaxSizeInBytes, getAcceptedExtensions, getMaxSizeLabel } from "@/lib/fileConfig";
import toast from "react-hot-toast";


interface ImportQuestionsProps {
  onImport: (questions: any[]) => void;
  assessmentId: string;
}

export default function ImportQuestions({ onImport, assessmentId }: ImportQuestionsProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const qParserConfig = FILE_CONFIG.Q_PARSER;
  const maxSizeBytes = getMaxSizeInBytes(qParserConfig.maxSizeMB);
  const acceptedExtensions = getAcceptedExtensions(qParserConfig.types);
  const acceptedTypes = qParserConfig.types.join(",");

  const validateFile = (selectedFile: File): string | null => {
    // Check file size
    if (selectedFile.size > maxSizeBytes) {
      return `File size must be less than ${getMaxSizeLabel(qParserConfig.maxSizeMB)}`;
    }

    // Check file type
    const fileExtension = '.' + selectedFile.name.split('.').pop()?.toLowerCase();
    if (!qParserConfig.types.includes(fileExtension)) {
      return `File type not supported. Accepted formats: ${acceptedExtensions}`;
    }

    return null;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      const validationError = validateFile(selectedFile);
      
      if (validationError) {
        setError(validationError);
        setFile(null);
        return;
      }

      setFile(selectedFile);
      setError(null);
    }
  };

  const handleImport = async () => {
  if (!file) {
    toast.error("Please select a file first");
    return;
  }

  const validationError = validateFile(file);
  if (validationError) {
    toast.error(validationError);
    return;
  }

  setIsLoading(true);

  try {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(
      `/api/educator/assessment/${assessmentId}/q-parser`,
      {
        method: "POST",
        body: formData,
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to import questions");
    }

    // Show success toast
    toast.success("Questions imported successfully!");

    // Pass questions to parent component
    onImport(data.questions || []);
    setFile(null);

  } catch (err) {
    // Show error toast
    toast.error(err instanceof Error ? err.message : "Something went wrong");
  } finally {
    setIsLoading(false);
  }
};


  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
      <div className="flex items-center gap-2">
        <label className="flex items-center justify-center cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors px-3 py-2 rounded-lg border border-gray-300">
          <Upload className="w-4 h-4 mr-2 text-gray-500" />
          <span className="text-sm text-gray-500">Import Questions</span>
          <input 
            type="file" 
            className="hidden" 
            onChange={handleFileChange}
            accept={acceptedTypes}
          />
        </label>
        
        {file && (
          <div className="flex items-center gap-2 bg-blue-50 rounded-lg px-3 py-1.5 border border-blue-200">
            <FileText className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-gray-900 truncate max-w-xs">
              {file.name}
            </span>
            <button 
              onClick={() => setFile(null)}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
        
        {file && (
          <Button
            onClick={handleImport}
            disabled={isLoading}
            size="sm"
            variant="primary"
          >
            {isLoading ? "Importing..." : "Import"}
          </Button>
        )}
      </div>
      
      <div className="mt-2 text-xs text-gray-500">
        Supported formats: {acceptedExtensions} (Max: {getMaxSizeLabel(qParserConfig.maxSizeMB)})
      </div>
      
      {error && (
        <div className="mt-2 p-2 bg-red-50 rounded-lg border border-red-200 text-xs text-red-700">
          {error}
        </div>
      )}
    </div>
  );
}