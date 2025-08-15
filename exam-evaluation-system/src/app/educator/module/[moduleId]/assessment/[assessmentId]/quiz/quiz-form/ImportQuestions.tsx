"use client";

import { Upload, FileText, X } from "lucide-react";
import { useState, useRef, useEffect } from "react";
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
  const containerRef = useRef<HTMLDivElement>(null);
  const [dropdownDirection, setDropdownDirection] = useState<"top" | "bottom">("bottom");

  useEffect(() => {
    const checkSpace = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const spaceBelow = window.innerHeight - rect.bottom;
        const spaceAbove = rect.top;
        setDropdownDirection(spaceBelow < 200 && spaceAbove > spaceBelow ? "top" : "bottom");
      }
    };

    checkSpace();
    window.addEventListener("resize", checkSpace);
    return () => window.removeEventListener("resize", checkSpace);
  }, []);

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
    // Simulate API delay for realistic behavior
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock response data
    const mockResponse = {
      questions: [
        {
          "type": "MCQ",
          "question": "What is the capital of France?",
          "correctAnswer": "Paris",
          "options": ["London", "Paris", "Berlin", "Madrid"],
          "marks": 1
        },
        {
          "type": "SHORT",
          "question": "Name the largest ocean on Earth",
          "correctAnswer": "Pacific Ocean",
          "options": [],
          "marks": 2
        }
      ]
    };
console.log('mockResponse.questions: ', mockResponse.questions);
    // Pass the mock data to the onImport callback
    onImport(mockResponse.questions);
    setFile(null);
    
  } catch (err) {
    setError(err instanceof Error ? err.message : "Failed to import questions");
  } finally {
    setIsLoading(false);
  }
};

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm" ref={containerRef}>
      <div className="flex items-center gap-2">
        <Dropdown
          options={supportedFormats.map(f => f.label)}
          selectedOption={supportedFormats.find(f => f.value === selectedFormat)?.label || ""}
          onSelect={(option) => {
            const format = supportedFormats.find(f => f.label === option)?.value || "excel";
            setSelectedFormat(format);
          }}
          className="w-48"
          direction={dropdownDirection}
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