"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import toast, { Toaster } from "react-hot-toast";
import { FiUpload } from "react-icons/fi";

interface Lesson {
  id: string;
  title: string;
  materialUrl: string;
}

export interface LessonFormData {
  title: string;
  material: FileList;
}

export default function ModulePage() {
  const { moduleId } = useParams();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [isLessonModalOpen, setIsLessonModalOpen] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<LessonFormData>();

  const createLesson = async (data: LessonFormData) => {
    try {
      const formData = new FormData();
      formData.append("moduleId", moduleId!);
      formData.append("title", data.title);
      if (data.material[0]) formData.append("material", data.material[0]);

      const res = await fetch("/api/lesson", {
        method: "POST",
        body: formData,
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to create lesson");

      // Append new lesson to state
      setLessons((prev) => [
        ...prev,
        {
          id: json.lesson.lessonId,
          title: json.lesson.title,
          materialUrl: json.lesson.materialUrl,
        },
      ]);

      toast.success("Lesson created successfully!");
      reset();
      setIsLessonModalOpen(false);
    } catch (err) {
      console.error("Lesson creation error:", err);
      toast.error("Failed to create lesson");
    }
  };

  return (
    <div className="px-6 py-8">
      <Toaster position="top-right" />

      <h1 className="text-2xl font-bold text-blue-900 mb-6">
        Module: {moduleId}
      </h1>

      <button
        onClick={() => setIsLessonModalOpen(true)}
        className="mb-4 px-4 py-2 bg-blue-900 text-white rounded-md hover:bg-blue-800"
      >
        + New Lesson
      </button>

      <div className="space-y-4">
        {lessons.map((lesson) => (
          <div
            key={lesson.id}
            className="p-4 border border-gray-200 rounded-md flex justify-between items-center"
          >
            <span className="font-medium text-gray-800">{lesson.title}</span>
            <a
              href={lesson.materialUrl}
              target="_blank"
              rel="noreferrer"
              className="text-blue-900 hover:underline"
            >
              Download
            </a>
          </div>
        ))}
      </div>

      {/* Lesson Creation Modal */}
      {isLessonModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-blue-900">Add Lesson</h3>
              <button
                onClick={() => setIsLessonModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
                disabled={isSubmitting}
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={handleSubmit(createLesson)}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Lesson Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  {...register("title", { required: true })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-800"
                  placeholder="Enter lesson title"
                />
                {errors.title && (
                  <p className="text-red-600 text-sm mt-1">
                    Title is required
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Material <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <FiUpload className="absolute left-3 top-3 text-gray-500" />
                  <input
                    type="file"
                    {...register("material", { required: true })}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-gray-800"
                  />
                </div>
                {errors.material && (
                  <p className="text-red-600 text-sm mt-1">
                    Material is required
                  </p>
                )}
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsLessonModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-900 text-white rounded-md flex items-center justify-center hover:bg-blue-800"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                  ) : null}
                  {isSubmitting ? "Saving..." : "Save Lesson"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
