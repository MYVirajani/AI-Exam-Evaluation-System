"use client";
import React, { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import Image from "next/image";
import {
  FaCode,
  FaGraduationCap,
  FaBuilding,
  FaUsers,
  FaImage,
  FaTimes,
  FaBookOpen,
} from "react-icons/fa";
import {
  FILE_CONFIG,
  getMaxSizeInBytes,
  getAcceptedExtensions,
  getMaxSizeLabel,
} from "@/lib/fileConfig";
import { Controller } from "react-hook-form";
import EnrollmentKeyInput from "@/components/EnrollementKeyInput";

interface ModuleCreationFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (moduleData: ModuleFormData) => Promise<void>;
}

export interface ModuleFormData {
  moduleCode: string;
  moduleName: string;
  semester?: string;
  educationInstitute: string;
  maxStudents?: number;
  learningOutcomes?: string;
  enrollmentKey?: string;
  moduleImage?: File | null;
}

const ModuleCreationForm: React.FC<ModuleCreationFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
    setValue,
    trigger,
    watch,
    control,
  } = useForm<ModuleFormData>({
    mode: "onChange",
  });

  const watchedFields = watch([
    "moduleCode",
    "moduleName",
    "educationInstitute",
  ]);

  const isFormValid = watchedFields.every((field) =>
    typeof field === "number" ? field > 0 : field && field.trim() !== ""
  );

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const fileExtension = "." + file.name.split(".").pop()?.toLowerCase();
      if (!FILE_CONFIG.IMAGE.types.includes(fileExtension)) {
        toast.error(
          `Invalid file type. Please upload ${getAcceptedExtensions(
            FILE_CONFIG.IMAGE.types
          )} files only.`
        );
        return;
      }

      // Validate file size
      if (file.size > getMaxSizeInBytes(FILE_CONFIG.IMAGE.maxSizeMB)) {
        toast.error(
          `File size too large. Maximum size is ${getMaxSizeLabel(
            FILE_CONFIG.IMAGE.maxSizeMB
          )}.`
        );
        return;
      }

      setValue("moduleImage", file);
      trigger("moduleImage");

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setValue("moduleImage", null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const onFormSubmit = async (data: ModuleFormData) => {
    try {
      await onSubmit(data);
      toast.success("Module created successfully!");
      reset();
      setImagePreview(null);
      onClose();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to create module"
      );
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl h-[95vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-white/20 p-2 rounded-lg">
                <FaBookOpen className="text-white text-xl" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">
                  Create New Module
                </h2>
                <p className="text-blue-100 text-sm">
                  Set up a new learning module for your students
                </p>
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

          <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-8">
            {/* Basic Information Section */}
            <div className="space-y-6">
              <div className="border-l-4 border-purple-500 pl-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-1">
                  Module Information
                </h3>
                <p className="text-gray-600 text-sm">
                  Configure the basic details for your module
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Module Code */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Module Code <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <FaCode className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      {...register("moduleCode", {
                        required: "Please enter a module code",
                        pattern: {
                          value: /^[A-Za-z]{2,3} \d{4}$/,
                          message: 'Format: e.g., "CS 1010"',
                        },
                      })}
                      placeholder="e.g., CS 1010"
                      className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl text-gray-800 bg-white focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all duration-200"
                    />
                  </div>
                  {errors.moduleCode && (
                    <p
                      className={`text-sm flex items-center mt-1 ${
                        errors.moduleCode.type === "required"
                          ? "text-red-500"
                          : "text-blue-600"
                      }`}
                    >
                      <svg
                        className="w-4 h-4 mr-1"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {errors.moduleCode.message}
                    </p>
                  )}
                </div>

                {/* Module Name */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Module Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <FaGraduationCap className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      {...register("moduleName", {
                        required: "Please enter the module name",
                        minLength: {
                          value: 5,
                          message: "At least 5 characters expected",
                        },
                      })}
                      placeholder="Enter module name"
                      className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl text-gray-800 bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200"
                    />
                  </div>
                  {errors.moduleName && (
                    <p
                      className={`text-sm flex items-center mt-1 ${
                        errors.moduleName.type === "required"
                          ? "text-red-500"
                          : "text-blue-600"
                      }`}
                    >
                      <svg
                        className="w-4 h-4 mr-1"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {errors.moduleName.message}
                    </p>
                  )}
                </div>

                {/* Semester */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Semester
                  </label>
                  <input
                    {...register("semester")}
                    placeholder="e.g., Semester 1"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-800 bg-white focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all duration-200"
                  />
                </div>

                {/* Education Institute */}
                {/* <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Education Institute <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <FaBuilding className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      {...register("educationInstitute", {
                        required: "Please specify the institute name",
                      })}
                      placeholder="Enter institute name"
                      className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl text-gray-800 bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200"
                    />
                  </div>
                  {errors.educationInstitute && (
                    <p className="text-red-500 text-sm flex items-center mt-1">
                      <svg
                        className="w-4 h-4 mr-1"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {errors.educationInstitute.message}
                    </p>
                  )}
                </div> */}

                {/* Maximum Students */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Maximum Students
                  </label>
                  <div className="relative">
                    <FaUsers className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="number"
                      {...register("maxStudents", {
                        min: {
                          value: 0,
                          message: "Please enter valid number",
                        },
                        validate: (value) =>
                          Number.isInteger(value) ||
                          "Only whole numbers allowed",
                        valueAsNumber: true,
                      })}
                      defaultValue={0}
                      placeholder="0 for unlimited"
                      className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl text-gray-800 bg-white focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all duration-200"
                    />
                  </div>
                  {errors.maxStudents && (
                    <p className="text-blue-600 text-sm flex items-center mt-1">
                      <svg
                        className="w-4 h-4 mr-1"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {errors.maxStudents.message}
                    </p>
                  )}
                </div>

                {/* Enrollment Key */}
                <div className="space-y-2">
                  <Controller
                    name="enrollmentKey"
                    control={control} 
                    rules={{
                      minLength: {
                        value: 6,
                        message: "At least 6 characters recommended",
                      },
                    }}
                    render={({ field, fieldState }) => (
                      <>
                        <EnrollmentKeyInput
                          label="Enrollment Key"
                          value={field.value ?? ""} 
                          onChange={field.onChange}
                          placeholder="Leave blank or generate"
                          required={false}
                          helperText="You can generate a shareable key like ABCD-12EF-34GH."
                          groups={3}
                          groupSize={4}
                          allowLowercase={false}
                          allowUppercase={true}
                          allowNumbers={true}
                        />
                        {fieldState.error && (
                          <p className="text-blue-600 text-sm mt-1 flex items-center">
                            {/* ...icon... */}
                            {fieldState.error.message}
                          </p>
                        )}
                      </>
                    )}
                  />
                </div>
              </div>
            </div>

            {/* Additional Information Section */}
            <div className="space-y-6">
              <div className="border-l-4 border-blue-500 pl-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-1">
                  Additional Details
                </h3>
                <p className="text-gray-600 text-sm">
                  Optional information to enhance your module
                </p>
              </div>

              <div className="space-y-6">
                {/* Learning Outcomes */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Learning Outcomes
                  </label>
                  <textarea
                    {...register("learningOutcomes")}
                    rows={4}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-800 bg-white focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all duration-200 resize-none"
                    placeholder="Describe what students will learn in this module..."
                  />
                </div>

                {/* Module Image */}
                <div className="space-y-4">
                  <label className="block text-sm font-semibold text-gray-700">
                    Module Image
                  </label>

                  {!imagePreview ? (
                    <div className="relative">
                      <input
                        type="file"
                        accept={FILE_CONFIG.IMAGE.types.join(",")}
                        onChange={handleImageChange}
                        ref={fileInputRef}
                        className="hidden"
                        id="moduleImage"
                      />
                      <label
                        htmlFor="moduleImage"
                        className="w-full flex items-center justify-center px-4 py-8 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 bg-gray-50 hover:bg-gray-100 hover:border-blue-400 transition-all duration-200 cursor-pointer"
                      >
                        <div className="text-center">
                          <FaImage className="mx-auto text-3xl text-blue-500 mb-3" />
                          <span className="block text-lg font-medium">
                            Click to upload module image
                          </span>
                          <span className="block text-sm text-gray-500 mt-1">
                            {getAcceptedExtensions(FILE_CONFIG.IMAGE.types)} up
                            to {getMaxSizeLabel(FILE_CONFIG.IMAGE.maxSizeMB)}
                          </span>
                        </div>
                      </label>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Module Card Preview */}
                      <div className="bg-gray-50 p-4 rounded-xl">
                        <p className="text-sm font-medium text-gray-700 mb-3">
                          Preview:
                        </p>
                        <div className="max-w-sm mx-auto bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                          {/* Image Preview matching EducatorModuleCard */}
                          <div className="relative w-full h-36 overflow-hidden">
                            <Image
                              src={imagePreview}
                              alt="Module preview"
                              fill
                              className="object-cover object-center"
                            />
                            {/* Remove button - cross icon on top right */}
                            <button
                              type="button"
                              onClick={removeImage}
                              className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 shadow-lg transition-colors duration-200 z-10"
                              title="Remove image"
                            >
                              <FaTimes className="w-3 h-3" />
                            </button>
                          </div>

                          {/* Card Content Preview */}
                          <div className="p-4">
                            <h3 className="text-sm font-semibold text-gray-800 leading-tight mb-2 line-clamp-2">
                              {watch("moduleName") || "Module Name"}
                            </h3>
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-gray-500">
                                Total enrolled
                              </span>
                              <span className="text-blue-600 font-semibold bg-blue-50 px-2 py-1 rounded-md">
                                0
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {errors.moduleImage && (
                    <p className="text-blue-600 text-sm flex items-center">
                      <svg
                        className="w-4 h-4 mr-1"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {errors.moduleImage.message}
                    </p>
                  )}
                </div>
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
                      ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 cursor-pointer"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
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
                    "Create Module"
                  )}
                </button>

                {/* Tooltip for disabled button */}
                {!isFormValid && !isSubmitting && (
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
                    <div className="flex items-center">
                      <svg
                        className="w-4 h-4 mr-2"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Fill the required fields
                    </div>
                    {/* Tooltip arrow */}
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
};

export default ModuleCreationForm;
