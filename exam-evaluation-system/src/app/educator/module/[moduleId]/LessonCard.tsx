"use client";

import React, { useState } from "react";
import Link from "next/link";
import { FiEdit, FiTrash2 } from "react-icons/fi";
import ConfirmDialog from "@/components/ConfimDialog";
import toast from "react-hot-toast";

interface Material {
  material_id: string;
  file_url: string;
  description: string;
}

interface LessonCardProps {
  lesson_id: string;
  module_id: string;
  title: string;
  materials?: Material[];
  onEdit: () => void;
  onDelete: (lessonId: string) => void;
}

const LessonCard: React.FC<LessonCardProps> = ({
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
      const userId = localStorage.getItem("userId");
      console.log('userId: ', userId);
      console.log('module_id: ', module_id);
      console.log('lesson_id: ', lesson_id);
      if (!userId) throw new Error("User not authenticated");

      const res = await fetch(
        `/api/educator/module/${module_id}/lesson/${lesson_id}`,
        {
          method: "DELETE",
          headers: {
            "x-user-id": userId,
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
    <div className="bg-gray-200 rounded-lg p-4 mb-4 relative">
      <h3 className="text-lg font-semibold text-blue-800 mb-2">{title}</h3>
      {materials.length > 0 ? (
        <ul className="list-disc list-inside">
          {materials.map((mat) => (
            <li key={mat.material_id}>
              <Link
                href={mat.file_url}
                className="text-blue-700 underline hover:text-blue-900"
              >
                {mat.description || mat.file_url.split("/").pop()}
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-600 italic">
          No materials available for this lesson.
        </p>
      )}

      <div className="absolute bottom-2 right-2 flex space-x-2">
        <button
          className="text-blue-700 hover:text-blue-900"
          onClick={onEdit}
          title="Edit Lesson"
        >
          <FiEdit />
        </button>
        <button
          className="text-red-600 hover:text-red-800"
          onClick={() => setConfirmOpen(true)}
          title="Delete Lesson"
        >
          <FiTrash2 />
        </button>
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
