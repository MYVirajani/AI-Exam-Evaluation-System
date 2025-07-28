"use client";

import React, { useRef, useState } from "react";
import Button from "@/components/Button";
import { FiPaperclip } from "react-icons/fi";
import { IoClose } from "react-icons/io5";

interface LectureMaterialInput {
  file_url: string;
  description?: string;
}

interface LessonCreationFormProps {
  isOpen: boolean;
  onClose: () => void;
  moduleId: string;
  onLessonCreated: (lesson: any) => void;
}

const LessonCreationForm: React.FC<LessonCreationFormProps> = ({
  isOpen,
  onClose,
  moduleId,
  onLessonCreated,
}) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleIconClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles(e.target.files);
    }
  };

  const clearSelectedFiles = () => {
    setSelectedFiles(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeFile = (index: number) => {
    if (!selectedFiles) return;

    const newFiles = Array.from(selectedFiles).filter((_, i) => i !== index);

    // Create a new DataTransfer object to simulate a FileList
    const dataTransfer = new DataTransfer();
    newFiles.forEach((file) => dataTransfer.items.add(file));

    setSelectedFiles(dataTransfer.files);

    // If all files are removed, clear the input
    if (newFiles.length === 0) {
      clearSelectedFiles();
    }
  };

 const handleSubmit = async () => {
  setLoading(true);
  setUploading(true);

  try {
    const lecture_materials: LectureMaterialInput[] = [];

    if (selectedFiles) {
      for (const file of Array.from(selectedFiles)) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("moduleId", moduleId);
        formData.append("type", "lectureMaterial");

        const res = await fetch(`/api/educator/upload`, {
          method: "POST",
          body: formData,
        });

        const data = await res.json();
        console.log("Upload response:", data);
        if (!res.ok) throw new Error(data.error || "Upload failed");

        lecture_materials.push({ file_url: data.filePath, description });
      }
    }

    const res = await fetch(`/api/educator/module/${moduleId}/lesson`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        moduleId,
        title,
        lecture_materials,
      }),
    });

    const json = await res.json();
    console.log("Lesson creation response:", json);

    if (!res.ok) throw new Error(json.error || "Failed to create lesson");

    // Reformat lesson to include materials array from lecture_materials
    const newLesson = {
      ...json.lesson,
      materials: lecture_materials,
    };

    console.log("Formatted lesson for UI:", newLesson);

    onLessonCreated(newLesson); // Add to previous list

    // Reset form
    setTitle("");
    setDescription("");
    clearSelectedFiles();
    onClose();
  } catch (err: any) {
    console.error("Lesson creation failed:", err);
    alert("Error: " + err.message);
  } finally {
    setUploading(false);
    setLoading(false);
  }
};

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white text-gray-900 rounded-xl shadow-xl w-full max-w-xl p-6 relative">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          Create New Lesson
        </h2>

        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-600 hover:text-gray-900 text-2xl"
        >
          &times;
        </button>

        <div className="space-y-4">
          {/* Title Input */}
          <div>
            <label className="block text-gray-800 font-medium mb-1">
              Lesson Title
            </label>
            <input
              className="w-full border border-gray-300 text-gray-900 placeholder-gray-400 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter lesson title"
            />
          </div>

          {/* File Attachment */}
          <div>
            <label className="block text-gray-800 font-medium mb-1">
              Upload Material
            </label>
            <div className="flex items-center gap-3 border border-gray-300 rounded px-3 py-2">
              <div className="flex-1 text-sm text-gray-700">
                {selectedFiles && selectedFiles.length > 0 ? (
                  <div className="space-y-1">
                    {Array.from(selectedFiles).map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between"
                      >
                        <span className="truncate flex-1">{file.name}</span>
                        <button
                          onClick={() => removeFile(index)}
                          className="text-gray-500 hover:text-red-600 ml-2"
                          title="Remove file"
                        >
                          <IoClose />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  "No file selected"
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleIconClick}
                  className="text-gray-600 hover:text-gray-800 text-xl"
                  title="Attach Files"
                >
                  <FiPaperclip />
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  multiple
                  onChange={handleFileChange}
                />
                {/* {selectedFiles && selectedFiles.length > 0 && (
                  <button
                    onClick={clearSelectedFiles}
                    className="text-gray-500 hover:text-red-600 text-lg"
                    title="Remove all files"
                  >
                    <IoClose />
                  </button>
                )} */}
              </div>
            </div>

            <input
              type="text"
              className="w-full border border-gray-300 text-gray-900 placeholder-gray-400 px-3 py-2 mt-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add file description"
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <Button
              variant="primary"
              onClick={handleSubmit}
              disabled={loading || uploading || !title.trim()}
            >
              {loading ? "Creating..." : "Create Lesson"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LessonCreationForm;
