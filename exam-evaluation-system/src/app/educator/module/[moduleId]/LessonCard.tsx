"use client";

import React, { useState } from "react";
import Link from "next/link";
import { FiEdit, FiTrash2, FiFile, FiFileText } from "react-icons/fi";
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
}

const LessonCard: React.FC<LessonCardProps> = ({
  user_id,
  lesson_id,
  module_id,
  title,
  materials = [],
  onEdit,
  onDelete,
}) => {
  const [confirmOpen, setConfirmOpen] = useState(false);

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
    } catch (err: any) {
      console.error("Lesson deletion failed:", err);
      toast.error("Error deleting lesson: " + err.message);
    } finally {
      setConfirmOpen(false);
    }
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
              {materials.length} material{materials.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex space-x-2 ml-4">
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

      {/* Materials Section */}
      <div className="border-t border-gray-100 pt-4">
        {materials.length > 0 ? (
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">
              Course Materials
            </h4>
            {materials.map((mat, index) => {
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
            <p className="text-gray-500 text-sm">
              No materials available for this lesson
            </p>
            <p className="text-gray-400 text-xs mt-1">
              Add materials to help students learn
            </p>
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