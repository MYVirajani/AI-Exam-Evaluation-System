import React from 'react';
import { FaDownload } from 'react-icons/fa';

export interface Lesson {
  lesson_id: string;
  title: string;
  materials_url?: string | null;
}

interface LessonCardProps {
  lesson: Lesson;
}

export default function LessonCard({ lesson }: LessonCardProps) {
  return (
    <div className="bg-white rounded-lg shadow p-4 space-y-2">
      <p className="font-semibold text-blue-900 break-words">{lesson.title}</p>
      {lesson.materials_url ? (
        <a
          href={lesson.materials_url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center text-sm text-blue-900 hover:underline"
        >
          <FaDownload className="mr-1" /> Download Material
        </a>
      ) : (
        <p className="text-sm text-gray-500">No material uploaded yet.</p>
      )}
    </div>
  );
}
