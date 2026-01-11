// src/components/EventCreationForm.tsx
"use client";

import React from "react";
import { useForm, watch } from "react-hook-form";
import toast from "react-hot-toast";
import { FaTag, FaClock, FaFileUpload, FaTimes, FaCalendarAlt, FaGraduationCap } from "react-icons/fa";
import { siteConfig } from "@/config/site";

export interface EventFormData {
  type: "assignment" | "quiz" | "exam" | "bubbleSheet";
  moduleId: string;
  title: string;
  description?: string;
  deadline: string;
  questionPaper?: FileList;
  modelAnswerPaper?: FileList;
  // markingScheme?: FileList;
}

interface EventCreationFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: EventFormData) => Promise<void>;
  modules: { id: string; name: string }[];
  disableModuleSelection?: boolean;
  defaultModuleId?: string;
}

export default function EventCreationForm({
  isOpen,
  onClose,
  onSubmit,
  modules,
  disableModuleSelection = false,
  defaultModuleId = "",
}: EventCreationFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
  } = useForm<EventFormData>({
    defaultValues: {
      moduleId: defaultModuleId,
    },
  });

  // Watch required fields to enable/disable submit button
  const watchedFields = watch(['type', 'moduleId', 'title', 'deadline']);
  const [type, moduleId, title, deadline] = watchedFields;
  
  // Check if all required fields are filled
  const isFormValid = type && 
    (disableModuleSelection || moduleId) && 
    title?.trim() && 
    deadline;

  const submit = async (data: EventFormData) => {
    try {
      await onSubmit(data);
      toast.success("Assessment event created successfully!");
      reset();
      onClose();
    } catch {
      toast.error("Failed to create assessment event");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl h-[95vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-white/20 p-2 rounded-lg">
                <FaGraduationCap className="text-white text-xl" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Create Assessment Event</h2>
                <p className="text-blue-100 text-sm">Design a new learning assessment for your students</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="bg-white/20 hover:bg-white/30 p-2 rounded-lg transition-colors duration-200"
              disabled={isSubmitting}
            >
              <FaTimes className="text-white text-lg" />
            </button>
          </div>
        </div>

        {/* Form Content */}
        <div className="flex-1 p-8 overflow-y-auto scrollbar-hide">
          <style jsx>{`
            .scrollbar-hide {
              -ms-overflow-style: none;
              scrollbar-width: none;
            }
            .scrollbar-hide::-webkit-scrollbar {
              display: none;
            }
          `}</style>
          <form onSubmit={handleSubmit(submit)} className="space-y-8">
            {/* Core Information Section */}
            <div className="space-y-6">
              <div className="border-l-4 border-purple-500 pl-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-1">Assessment Details</h3>
                <p className="text-gray-600 text-sm">Configure the basic information for your assessment</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Assessment Type */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Assessment Type <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      {...register("type", { required: "Please select an assessment type" })}
                      className="w-full pl-4 pr-10 py-3 border-2 border-gray-200 rounded-xl text-gray-800 bg-white focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all duration-200 appearance-none"
                    >
                      <option value="">Choose assessment type</option>
                      {siteConfig.enums.assessmentType.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                  {errors.type && (
                    <p className="text-red-500 text-sm flex items-center mt-1">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {errors.type.message}
                    </p>
                  )}
                </div>

                {/* Module Selection */}
                {!disableModuleSelection && (
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Module <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <select
                        {...register("moduleId", { required: "Please select a module" })}
                        className="w-full pl-4 pr-10 py-3 border-2 border-gray-200 rounded-xl text-gray-800 bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 appearance-none"
                      >
                        <option value="">Choose module</option>
                        {modules.map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.name}
                          </option>
                        ))}
                      </select>
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                    {errors.moduleId && (
                      <p className="text-red-500 text-sm flex items-center mt-1">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {errors.moduleId.message}
                      </p>
                    )}
                  </div>
                )}

                {/* Title */}
                <div className="lg:col-span-2 space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Assessment Title <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <FaTag className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      {...register("title", { required: "Please enter an assessment title" })}
                      placeholder="Enter a descriptive title for your assessment"
                      className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl text-gray-800 bg-white focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all duration-200"
                    />
                  </div>
                  {errors.title && (
                    <p className="text-red-500 text-sm flex items-center mt-1">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {errors.title.message}
                    </p>
                  )}
                </div>

                {/* Description */}
                <div className="lg:col-span-2 space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Description
                  </label>
                  <textarea
                    {...register("description")}
                    rows={4}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-800 bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 resize-none"
                    placeholder="Provide additional context, instructions, or details about this assessment..."
                  />
                </div>

                {/* Deadline */}
                <div className="lg:col-span-2 space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Submission Deadline <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <FaCalendarAlt className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="datetime-local"
                      {...register("deadline", { required: "Please set a submission deadline" })}
                      className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl text-gray-800 bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200"
                    />
                  </div>
                  {errors.deadline && (
                    <p className="text-red-500 text-sm flex items-center mt-1">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {errors.deadline.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* File Upload Section */}
            <div className="space-y-6">
              <div className="border-l-4 border-blue-500 pl-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-1">Supporting Materials</h3>
                <p className="text-gray-600 text-sm">Upload optional files to support your assessment</p>
              </div>

              <div className="space-y-6">
                {/* Question Paper */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Question Paper
                    <span className="text-gray-500 font-normal ml-1">(Optional)</span>
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      {...register("questionPaper")}
                      className="hidden"
                      id="questionPaper"
                    />
                    <label
                      htmlFor="questionPaper"
                      className="w-full flex items-center justify-center px-4 py-6 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 bg-gray-50 hover:bg-gray-100 hover:border-purple-400 transition-all duration-200 cursor-pointer"
                    >
                      <FaFileUpload className="mr-3 text-purple-500" />
                      <span>Click to upload question paper (PDF, DOC, DOCX)</span>
                    </label>
                  </div>
                </div>

                {/* Model Answer Paper - Currently commented out */}
                {/* 
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Model Answer Paper
                    <span className="text-gray-500 font-normal ml-1">(Optional)</span>
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      {...register("modelAnswerPaper")}
                      className="hidden"
                      id="modelAnswerPaper"
                    />
                    <label
                      htmlFor="modelAnswerPaper"
                      className="w-full flex items-center justify-center px-4 py-6 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 bg-gray-50 hover:bg-gray-100 hover:border-blue-400 transition-all duration-200 cursor-pointer"
                    >
                      <FaFileUpload className="mr-3 text-blue-500" />
                      <span>Click to upload model answer (PDF, DOC, DOCX)</span>
                    </label>
                  </div>
                </div>
                */}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 border-2 border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
                disabled={isSubmitting}
              >
                Cancel
              </button>

              <div className="relative group">
                <button
                  type="submit"
                  className={`px-8 py-3 font-semibold rounded-xl focus:ring-4 focus:ring-purple-200 transition-all duration-200 flex items-center justify-center shadow-lg min-w-[160px] ${
                    isFormValid && !isSubmitting
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 cursor-pointer'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                  disabled={!isFormValid || isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
                      Creating...
                    </>
                  ) : (
                    "Create Assessment"
                  )}
                </button>

                {/* Tooltip for disabled button */}
                {!isFormValid && !isSubmitting && (
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Fill the required fields
                    </div>
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-800 rotate-45"></div>
                  </div>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}