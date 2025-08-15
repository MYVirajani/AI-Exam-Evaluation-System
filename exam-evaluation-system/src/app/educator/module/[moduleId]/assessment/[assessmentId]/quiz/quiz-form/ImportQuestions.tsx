"use client";

import { Upload, FileText, X } from "lucide-react";
import { useState } from "react";
import Button from "@/components/Button";
import Dropdown from "@/components/Dropdown";

interface ImportQuestionsProps {
  onImport: (questions: any[]) => void;
}

const supportedFormats = [
  { label: "Excel (.xlsx, .xls)", value: "excel" },
  { label: "Word Document (.docx)", value: "docx" },
  { label: "Moodle XML", value: "moodle-xml" },
  { label: "WebCT", value: "webct" },
  { label: "XHTML", value: "xhtml" },
];

export default function ImportQuestions({ onImport }: ImportQuestionsProps) {
  const [selectedFormat, setSelectedFormat] = useState<string>("excel");
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleImport = async () => {
    if (!file) {
      setError("Please select a file first");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("format", selectedFormat);

      const response = await fetch("/api/student/assessment/quiz/import-questions", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      const data = await response.json();
      onImport(data.questions);
      setFile(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to import questions");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
      <div className="flex items-center gap-2">
        <Dropdown
          options={supportedFormats.map(f => f.label)}
          selectedOption={supportedFormats.find(f => f.value === selectedFormat)?.label || ""}
          onSelect={(option) => {
            const format = supportedFormats.find(f => f.label === option)?.value || "excel";
            setSelectedFormat(format);
          }}
          className="w-48"
          buttonClassName="text-sm"
        />
        <label className="flex items-center justify-center cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors px-3 py-2 rounded-lg border border-gray-300">
          <Upload className="w-4 h-4 mr-2 text-gray-500" />
          <span className="text-sm text-gray-500">Import</span>
          <input 
            type="file" 
            className="hidden" 
            onChange={handleFileChange}
            accept={selectedFormat === "excel" ? ".xlsx,.xls" : 
                    selectedFormat === "docx" ? ".docx" : 
                    selectedFormat === "moodle-xml" ? ".xml" : 
                    selectedFormat === "webct" ? ".zip" : 
                    ".html,.xhtml"}
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
      {error && (
        <div className="mt-2 p-2 bg-red-50 rounded-lg border border-red-200 text-xs text-red-700">
          {error}
        </div>
      )}
    </div>
  );
}