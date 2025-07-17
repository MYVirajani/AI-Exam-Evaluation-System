// src/components/EventCreationForm.tsx
"use client";

import React from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { FaTag, FaClock } from "react-icons/fa";
import { siteConfig } from "@/config/site";

export interface EventFormData {
  type: "assignment" | "quiz" | "exam";
  moduleId: string;
  title: string;
  description?: string;
  deadline: string; // ISO string from datetime-local input
  questionPaper?: FileList;
  modelAnswerPaper?: FileList;
  markingScheme?: FileList;
}

interface EventCreationFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: EventFormData) => Promise<void>;
  modules: { id: string; name: string }[];
}

export default function EventCreationForm({
  isOpen,
  onClose,
  onSubmit,
  modules,
}: EventCreationFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<EventFormData>();

  const submit = async (data: EventFormData) => {
    try {
      await onSubmit(data);
      toast.success("Event created successfully!");
      reset();
      onClose();
    } catch {
      toast.error("Failed to create event");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-blue-900">Create New Event</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            disabled={isSubmitting}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit(submit)} className="space-y-4">
          {/* core fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type <span className="text-red-500">*</span>
              </label>
              <select
                {...register("type", { required: true })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-800"
              >
                <option value="">Select event type</option>
                {siteConfig.enums.assessmentType.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              {errors.type && (
                <p className="text-red-600 text-sm mt-1">Type is required</p>
              )}
            </div>

            {/* Module */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Module <span className="text-red-500">*</span>
              </label>
              <select
                {...register("moduleId", { required: true })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-800"
              >
                <option value="">Select module</option>
                {modules.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
              {errors.moduleId && (
                <p className="text-red-600 text-sm mt-1">Module is required</p>
              )}
            </div>

            {/* Title */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <FaTag className="absolute left-3 top-3 text-gray-500" />
                <input
                  {...register("title", { required: true })}
                  placeholder="Event title"
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-gray-800"
                />
              </div>
              {errors.title && (
                <p className="text-red-600 text-sm mt-1">Title is required</p>
              )}
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                {...register("description")}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-800"
                placeholder="Optional description"
              />
            </div>

            {/* Deadline */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Deadline <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <FaClock className="absolute left-3 top-3 text-gray-500" />
                <input
                  type="datetime-local"
                  {...register("deadline", { required: true })}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-gray-800"
                />
              </div>
              {errors.deadline && (
                <p className="text-red-600 text-sm mt-1">
                  Deadline is required
                </p>
              )}
            </div>
          </div>

          {/* optional file uploads */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Question Paper (optional)
              </label>
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                {...register("questionPaper")}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-800"
              />
            </div>

            {/* <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Model Answer Paper (optional)
              </label>
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                {...register("modelAnswerPaper")}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-800"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Marking Scheme (optional)
              </label>
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                {...register("markingScheme")}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-800"
              />
            </div> */}
          </div>

          {/* action buttons */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-800"
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
              {isSubmitting ? "Creating..." : "Create Event"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
