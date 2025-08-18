"use client";

import React, { useRef, useState } from "react";
import Button from "@/components/Button";
import LoadingAnimation from "@/components/LoadingAnimation";
import { 
  FiPaperclip, 
  FiUpload, 
  FiFile, 
  FiFileText, 
  FiImage, 
  FiVideo,
  FiMusic,
  FiArchive
} from "react-icons/fi";
import { IoClose } from "react-icons/io5";

interface LectureMaterialInput {
  file_url: string;
  description?: string;
  file_name?: string;
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
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase() || '';
    
    if (['pdf'].includes(extension)) return <FiFile className="text-red-500" />;
    if (['doc', 'docx', 'txt', 'rtf'].includes(extension)) return <FiFileText className="text-blue-500" />;
    if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(extension)) return <FiImage className="text-green-500" />;
    if (['mp4', 'avi', 'mov', 'wmv', 'flv'].includes(extension)) return <FiVideo className="text-purple-500" />;
    if (['mp3', 'wav', 'flac', 'aac'].includes(extension)) return <FiMusic className="text-orange-500" />;
    if (['zip', 'rar', '7z', 'tar', 'gz'].includes(extension)) return <FiArchive className="text-yellow-500" />;
    
    return <FiFile className="text-gray-500" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleIconClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles(e.target.files);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      setSelectedFiles(files);
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

    const dataTransfer = new DataTransfer();
    newFiles.forEach((file) => dataTransfer.items.add(file));

    setSelectedFiles(dataTransfer.files);

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

          const res = await fetch(`/api/educator/module/${moduleId}/lesson/lecture-material`, {
            method: "POST",
            body: formData,
          });

          const data = await res.json();
          console.log("Upload response:", data);
          if (!res.ok) throw new Error(data.error || "Upload failed");

          lecture_materials.push({ 
            file_url: data.filePath, 
            description, 
            file_name: data.fileName 
          });
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

      const newLesson = {
        ...json.lesson,
        materials: lecture_materials,
      };

      console.log("Formatted lesson for UI:", newLesson);

      onLessonCreated(newLesson);

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
    <>
      {/* Loading Overlay */}
      {loading && (
        <LoadingAnimation 
          variant="spinner" 
          size="lg" 
          text={uploading ? "Uploading materials..." : "Creating lesson..."} 
          fullScreen={true}
          color="blue"
        />
      )}

      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
        
        <style jsx>{`
          .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
        `}</style>
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] flex flex-col">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-t-2xl relative">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-transparent bg-opacity-20 rounded-lg">
                <FiUpload className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Create Lecture Materials</h2>
                <p className="text-blue-100 text-sm">Upload resources for your lesson</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-white hover:text-gray-200 transition-colors p-2 rounded-full hover:bg-white hover:bg-opacity-20"
              disabled={loading}
            >
              <IoClose className="w-6 h-6" />
            </button>
          </div>

          <div className="flex-1 p-6 space-y-6 overflow-y-auto scrollbar-hide">
            {/* Lesson Title */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Lesson Title *
              </label>
              <input
                className="w-full border-2 border-gray-200 text-gray-900 placeholder-gray-400 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter a descriptive lesson title..."
                disabled={loading}
              />
              {title.trim() && (
                <p className="text-xs text-green-600 flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  Title looks good!
                </p>
              )}
            </div>

            {/* File Upload Area */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Lecture Materials
              </label>
              
              {/* Drag & Drop Zone */}
              <div 
                className={`relative border-2 border-dashed rounded-xl p-8 transition-all duration-300 ${
                  dragOver 
                    ? 'border-blue-500 bg-blue-50' 
                    : selectedFiles && selectedFiles.length > 0
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                {selectedFiles && selectedFiles.length > 0 ? (
                  <div className="space-y-3">
                    <div className="text-center mb-4">
                      <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                        {selectedFiles.length} file{selectedFiles.length > 1 ? 's' : ''} selected
                      </div>
                    </div>
                    
                    <div className="space-y-2 max-h-32 overflow-y-auto scrollbar-hide">
                      {Array.from(selectedFiles).map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className="flex-shrink-0">
                              {getFileIcon(file.name)}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {file.name}
                              </p>
                              <p className="text-xs text-gray-500">
                                {formatFileSize(file.size)}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => removeFile(index)}
                            className="flex-shrink-0 text-gray-400 hover:text-red-500 transition-colors p-1 rounded-full hover:bg-red-50"
                            title="Remove file"
                            disabled={loading}
                          >
                            <IoClose className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="mb-4">
                      <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                        <FiPaperclip className="w-8 h-8 text-blue-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-700 mb-2">
                        Upload Lecture Materials
                      </h3>
                      <p className="text-gray-500 text-sm mb-4">
                        Drag and drop files here, or click to browse
                      </p>
                    </div>
                  </div>
                )}

                {/* Browse Button */}
                <div className="text-center">
                  <button
                    type="button"
                    onClick={handleIconClick}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 font-medium"
                    disabled={loading}
                  >
                    <FiUpload className="w-4 h-4" />
                    Choose Files
                  </button>
                  
                  {selectedFiles && selectedFiles.length > 0 && (
                    <button
                      onClick={clearSelectedFiles}
                      className="ml-3 inline-flex items-center gap-2 px-4 py-3 text-gray-500 hover:text-red-600 transition-colors font-medium"
                      disabled={loading}
                    >
                      <IoClose className="w-4 h-4" />
                      Clear All
                    </button>
                  )}
                </div>

                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  multiple
                  onChange={handleFileChange}
                  disabled={loading}
                />
              </div>

              <p className="text-xs text-gray-500 flex items-start gap-1">
                <span className="text-blue-500 font-medium">💡</span>
                Supported formats: PDF, DOC, PPT, images, videos, and more. Maximum 10MB per file.
              </p>
            </div>

            {/* Material Description */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Material Description
                <span className="text-gray-400 font-normal ml-1">(Optional)</span>
              </label>
              <textarea
                className="w-full border-2 border-gray-200 text-gray-900 placeholder-gray-400 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white resize-none"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add a brief description of the lecture materials..."
                disabled={loading}
              />
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4 rounded-b-2xl border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">
                {selectedFiles && selectedFiles.length > 0 ? (
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    Ready to upload {selectedFiles.length} file{selectedFiles.length > 1 ? 's' : ''}
                  </span>
                ) : (
                  "Add materials to create your lesson"
                )}
              </div>
              
              <div className="flex items-center gap-3">
                <Button
                  variant="secondary"
                  onClick={onClose}
                  disabled={loading}
                  className="px-6"
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={handleSubmit}
                  disabled={loading || !title.trim()}
                  className="px-6 flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Creating...
                    </>
                  ) : (
                    <>
                      <FiUpload className="w-4 h-4" />
                      Create Lesson
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default LessonCreationForm;