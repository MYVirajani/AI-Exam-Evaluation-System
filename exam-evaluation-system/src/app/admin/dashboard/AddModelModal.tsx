"use client";

import { useState, useEffect } from "react";
import { X, Save, FileText, Type } from "lucide-react";

type AddModelModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { name: string; description: string }) => void;
  initialData?: { name: string; description: string };
};

export default function AddModelModal({
  isOpen,
  onClose,
  onSave,
  initialData,
}: AddModelModalProps) {
  const [name, setName] = useState(initialData?.name || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; description?: string }>({});

  // Reset values when opened/closed
  useEffect(() => {
    setName(initialData?.name || "");
    setDescription(initialData?.description || "");
    setErrors({});
    setIsSubmitting(false);
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const validateForm = () => {
    const newErrors: { name?: string; description?: string } = {};
    
    if (!name.trim()) {
      newErrors.name = "Model name is required";
    } else if (name.trim().length < 3) {
      newErrors.name = "Model name must be at least 3 characters";
    }
    
    // Description is optional, no validation needed
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API call
      onSave({ name: name.trim(), description: description.trim() });
      onClose();
    } catch (error) {
      console.error('Error saving model:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-gray-200 overflow-hidden transform transition-all">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {initialData ? "Edit Model" : "Add New Model"}
                </h3>
                <p className="text-sm text-gray-600">
                  {initialData ? "Update model details" : "Create a new evaluation model"}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white/80 rounded-lg transition-all"
              disabled={isSubmitting}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Model Name Field */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <Type className="w-4 h-4" />
              Model Name
              <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name) setErrors(prev => ({ ...prev, name: undefined }));
              }}
              placeholder="Enter model name (e.g., GPT-4 Evaluation)"
              className={`w-full px-4 py-3 border-2 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-gray-900 placeholder:text-gray-500 ${
                errors.name 
                  ? "border-red-300 bg-red-50 focus:border-red-500" 
                  : "border-gray-300 focus:border-blue-500 bg-white focus:bg-white"
              }`}
              disabled={isSubmitting}
            />
            {errors.name && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <span className="w-4 h-4 text-red-500">⚠</span>
                {errors.name}
              </p>
            )}
          </div>

          {/* Description Field */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <FileText className="w-4 h-4" />
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                if (errors.description) setErrors(prev => ({ ...prev, description: undefined }));
              }}
              placeholder="Describe the model's capabilities, use cases, and key features..."
              rows={4}
              className={`w-full px-4 py-3 border-2 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none text-gray-900 placeholder:text-gray-500 ${
                errors.description 
                  ? "border-red-300 bg-red-50 focus:border-red-500" 
                  : "border-gray-300 focus:border-blue-500 bg-white focus:bg-white"
              }`}
              disabled={isSubmitting}
            />
            {errors.description && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <span className="w-4 h-4 text-red-500">⚠</span>
                {errors.description}
              </p>
            )}
            <p className="text-xs text-gray-500">
              {description.length}/500 characters (optional)
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !name.trim()}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  {initialData ? "Update Model" : "Create Model"}
                </>
              )}
            </button>
          </div>
        </form>

        {/* Progress Indicator */}
        {isSubmitting && (
          <div className="absolute inset-x-0 bottom-0 h-1 bg-gray-200">
            <div className="h-full bg-gradient-to-r from-blue-500 to-blue-600 animate-pulse"></div>
          </div>
        )}
      </div>
    </div>
  );
}