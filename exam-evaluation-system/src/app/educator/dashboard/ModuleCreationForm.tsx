"use client";
import React, { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import Image from "next/image";

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
  } = useForm<ModuleFormData>({
    mode: "onChange",
  });

  const watchedFields = watch([
    "moduleCode",
    "moduleName",
    "educationInstitute",
    // "maxStudents",
  ]);

  const isRequiredFieldsFilled = watchedFields.every((field) =>
    typeof field === "number" ? field > 0 : field && field.trim() !== ""
  );

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-blue-900">Create New Module</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            disabled={isSubmitting}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Module Code <span className="text-red-500">*</span>
              </label>
              <input
                {...register("moduleCode", {
                  required: "Please enter a module code",
                  pattern: {
                    value: /^[A-Za-z]{2,3} \d{4}$/,
                    message: 'Format: e.g., "CS 1010"',
                  },
                })}
                className={`w-full px-3 py-2 border rounded-md text-gray-800 ${
                  errors.moduleCode ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="e.g., CS 1010"
              />
              {errors.moduleCode && (
                <p
                  className={`mt-1 text-sm italic ${
                    errors.moduleCode.type === "required"
                      ? "text-red-600"
                      : "text-blue-900"
                  }`}
                >
                  {errors.moduleCode.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Module Name <span className="text-red-500">*</span>
              </label>
              <input
                {...register("moduleName", {
                  required: "Please enter the module name",
                  minLength: {
                    value: 5,
                    message: "At least 5 characters expected",
                  },
                })}
                className={`w-full px-3 py-2 border rounded-md text-gray-800 ${
                  errors.moduleName ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.moduleName && (
                <p
                  className={`mt-1 text-sm italic ${
                    errors.moduleName.type === "required"
                      ? "text-red-600"
                      : "text-blue-600"
                  }`}
                >
                  {errors.moduleName.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Semester
              </label>
              <input
                {...register("semester")}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-800"
                placeholder="e.g., Semester 1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Education Institute <span className="text-red-500">*</span>
              </label>
              <input
                {...register("educationInstitute", {
                  required: "Please specify the institute name",
                })}
                className={`w-full px-3 py-2 border rounded-md text-gray-800 ${
                  errors.educationInstitute
                    ? "border-red-500"
                    : "border-gray-300"
                }`}
              />
              {errors.educationInstitute && (
                <p className="mt-1 text-sm italic text-red-600">
                  {errors.educationInstitute.message}
                </p>
              )}
            </div>

           
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Maximum Students
              </label>
              <input
                type="number"
                {...register("maxStudents", {
                  min: {
                    value: 0,
                    message: "Please enter valid number",
                  },
                  validate: (value) =>
                    Number.isInteger(value) || "Only whole numbers allowed",
                  valueAsNumber: true,
                })}
                defaultValue={0}
                className={`w-full px-3 py-2 border rounded-md text-gray-800 ${
                  errors.maxStudents ? "border-red-500" : "border-gray-300"
                }`}
              />
              
              {errors.maxStudents && (
                <p className={`mt-1 text-sm italic text-blue-600`}>
                  {errors.maxStudents.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Enrollment Key
              </label>
              <input
                type="password"
                {...register("enrollmentKey", {
                  minLength: {
                    value: 6,
                    message: "At least 6 characters recommended",
                  },
                })}
                className={`w-full px-3 py-2 border rounded-md text-gray-800 ${
                  errors.enrollmentKey ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Leave blank for open enrollment"
              />
              {errors.enrollmentKey && (
                <p className="mt-1 text-sm italic text-blue-600">
                  {errors.enrollmentKey.message}
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Learning Outcomes
            </label>
            <textarea
              {...register("learningOutcomes")}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-800"
              placeholder="Describe what students will learn in this module"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Module Image
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              ref={fileInputRef}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-800"
            />

            {errors.moduleImage && (
              <p className="mt-1 text-sm italic text-blue-600">
                {errors.moduleImage.message}
              </p>
            )}

            {imagePreview && (
              <div className="mt-4 relative">
                <div className="w-40 h-40 relative border rounded-md overflow-hidden">
                  <Image
                    src={imagePreview}
                    alt="Module preview"
                    fill
                    className="object-cover"
                  />
                </div>
                <button
                  type="button"
                  onClick={removeImage}
                  className="mt-2 text-sm text-red-600 hover:text-red-800"
                >
                  Remove Image
                </button>
              </div>
            )}
          </div>

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
              className={`px-4 py-2 bg-blue-900 text-white rounded-md flex items-center justify-center ${
                !isRequiredFieldsFilled || isSubmitting
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }`}
              disabled={!isRequiredFieldsFilled || isSubmitting}
            >
              {isSubmitting ? (
                <>
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
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Creating...
                </>
              ) : (
                "Create Module"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModuleCreationForm;
