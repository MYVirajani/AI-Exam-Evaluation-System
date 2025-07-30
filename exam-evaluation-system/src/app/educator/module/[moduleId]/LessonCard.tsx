"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import { FiEdit, FiTrash2, FiFile, FiFileText, FiPlus, FiUpload } from "react-icons/fi";
import ConfirmDialog from "@/components/ConfimDialog";
import toast from "react-hot-toast";

interface Material {
  material_id?: string;
  file_name?: string;
  file_url: string | null;
  description?: string | null;
}

interface LessonCardProps {
  user_id: string;
  lesson_id: string;
  module_id: string;
  title: string;
  materials?: Material[];
  onEdit: () => void;
  onDelete: (lessonId: string) => void;
  onMaterialsUpdate?: (lessonId: string, materials: Material[]) => void;
}

const LessonCard: React.FC<LessonCardProps> = ({
  user_id,
  lesson_id,
  module_id,
  title,
  materials = [],
  onEdit,
  onDelete,
  onMaterialsUpdate,
}) => {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [localMaterials, setLocalMaterials] = useState<Material[]>(materials);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDelete = async () => {
    try {
      const userId = user_id;
      console.log('userId: ', userId);
      if (!userId) throw new Error("User not authenticated");

      const res = await fetch(
        `/api/educator/module/${module_id}/lesson/${lesson_id}`,
        {
          method: "DELETE",
          headers: {
            "userId": userId,
          },
        }
      );

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed to delete lesson");

      onDelete(lesson_id);
      toast.success("Lesson deleted successfully!");
    } catch (err: any) {
      console.error("Lesson deletion failed:", err);
      toast.error("Error deleting lesson: " + err.message);
    } finally {
      setConfirmOpen(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    
    try {
      const formData = new FormData();
      
      // Append all selected files
      Array.from(files).forEach((file) => {
        formData.append('files', file);
      });
      
      formData.append('lessonId', lesson_id);
      formData.append('moduleId', module_id);
      formData.append('userId', user_id);

      const res = await fetch(`/api/educator/module/${module_id}/lesson/${lesson_id}/materials`, {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to upload materials');
      }

      // Update local materials state
      const newMaterials = [...localMaterials, ...data.materials];
      setLocalMaterials(newMaterials);
      
      // Notify parent component if callback is provided
      if (onMaterialsUpdate) {
        onMaterialsUpdate(lesson_id, newMaterials);
      }

      toast.success(`${files.length} material${files.length > 1 ? 's' : ''} uploaded successfully!`);
    } catch (err: any) {
      console.error('Material upload failed:', err);
      toast.error('Error uploading materials: ' + err.message);
    } finally {
      setUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 mb-6 w-full max-w-2xl mx-auto">
      {/* Header Section */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-800 mb-1 leading-tight">
            {title}
          </h3>
          <div className="flex items-center text-sm text-gray-500">
            <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-full text-xs font-medium">
              {localMaterials.length} material{localMaterials.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex space-x-2 ml-4">
          <button
            className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleUploadClick}
            disabled={uploading}
            title="Upload Materials"
          >
            {uploading ? (
              <div className="animate-spin w-[18px] h-[18px] border-2 border-green-600 border-t-transparent rounded-full"></div>
            ) : (
              <FiUpload size={18} />
            )}
          </button>
          <button
            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
            onClick={onEdit}
            title="Edit Lesson"
          >
            <FiEdit size={18} />
          </button>
          <button
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
            onClick={() => setConfirmOpen(true)}
            title="Delete Lesson"
          >
            <FiTrash2 size={18} />
          </button>
        </div>
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.jpg,.jpeg,.png,.mp4,.mp3"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Materials Section */}
      <div className="border-t border-gray-100 pt-4">
        {localMaterials.length > 0 ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold text-gray-700">
                Course Materials
              </h4>
              <button
                onClick={handleUploadClick}
                disabled={uploading}
                className="inline-flex items-center px-3 py-1 text-xs font-medium text-green-600 bg-green-50 rounded-full hover:bg-green-100 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploading ? (
                  <>
                    <div className="animate-spin w-3 h-3 border border-green-600 border-t-transparent rounded-full mr-1"></div>
                    Uploading...
                  </>
                ) : (
                  <>
                    <FiPlus size={12} className="mr-1" />
                    Add More
                  </>
                )}
              </button>
            </div>
            {localMaterials.map((mat, index) => {
              const fileUrl = mat.file_url || "#";
              const fileName = mat.file_name?.trim() || "Lecture note";
              const key = mat.material_id || `${fileUrl}-${index}`;

              return (
                <div key={key} className="bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition-colors duration-200">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-1">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <FiFileText className="text-blue-600" size={16} />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <Link
                        href={fileUrl}
                        className={`block font-medium text-sm transition-colors duration-200 ${
                          fileUrl === "#" 
                            ? "text-gray-400 cursor-not-allowed" 
                            : "text-gray-700 hover:text-blue-600"
                        }`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {fileName}
                      </Link>
                      {mat.description && (
                        <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                          {mat.description}
                        </p>
                      )}
                    </div>
                    {fileUrl !== "#" && (
                      <div className="flex-shrink-0">
                        <Link
                          href={fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-3 py-1 text-xs font-medium text-blue-600 bg-blue-50 rounded-full hover:bg-blue-100 transition-colors duration-200"
                        >
                          Open
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <FiFile className="text-gray-400" size={24} />
            </div>
            <p className="text-gray-500 text-sm mb-3">
              No materials available for this lesson
            </p>
            <button
              onClick={handleUploadClick}
              disabled={uploading}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? (
                <>
                  <div className="animate-spin w-4 h-4 border border-blue-600 border-t-transparent rounded-full mr-2"></div>
                  Uploading...
                </>
              ) : (
                <>
                  <FiUpload size={16} className="mr-2" />
                  Upload Materials
                </>
              )}
            </button>
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={confirmOpen}
        title="Delete Lesson"
        message="Are you sure you want to delete this lesson? This action cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setConfirmOpen(false)}
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
  );
};

export default LessonCard;