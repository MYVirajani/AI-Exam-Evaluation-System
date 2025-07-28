// LessonCard.tsx
"use client";

import React from "react";
import Link from "next/link";
import { FiEdit, FiTrash2 } from "react-icons/fi";

interface Material {
  material_id: string;
  file_url: string;
  description: string;
}

interface LessonCardProps {
  lesson_id: string;
  title: string;
  materials: Material[];
  onEdit: () => void;
  onDelete: () => void;
}

const LessonCard: React.FC<LessonCardProps> = ({
  lesson_id,
  title,
  materials,
  onEdit,
  onDelete,
}) => {
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
          onClick={onDelete}
          title="Delete Lesson"
        >
          <FiTrash2 />
        </button>
      </div>
    </div>
  );
};

export default LessonCard;
