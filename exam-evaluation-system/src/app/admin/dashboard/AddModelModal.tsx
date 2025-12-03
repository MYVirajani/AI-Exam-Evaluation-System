"use client";

import { useState, useEffect } from "react";
import { X, Save, FileText, Type, Server, Thermometer, Database } from "lucide-react";
import Dropdown from "@/components/Dropdown";
import {
  PROVIDERS,
  CHAT_MODELS,
  EMBEDDING_MODELS,
  getProviderLabel,
  getProviderValue,
  getChatModelsByProvider,
  getEmbeddingModelsByProvider,
  getChatModelLabel,
  getEmbeddingModelLabel,
  getChatModelValue,
  getEmbeddingModelValue,
  type ProviderValue
} from "@/config/models.config";

type AddModelModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    model_name: string;
    provider: string;
    chat_model?: string;
    temperature?: number;
    embedding_model: string;
    description?: string;
  }) => void;
  initialData?: {
    model_name: string;
    provider: string;
    chat_model?: string;
    temperature?: number;
    embedding_model: string;
    description?: string;
  };
};

export default function AddModelModal({
  isOpen,
  onClose,
  onSave,
  initialData,
}: AddModelModalProps) {
  const [modelName, setModelName] = useState(initialData?.model_name || "");
  const [selectedProvider, setSelectedProvider] = useState(
    initialData?.provider ? getProviderLabel(initialData.provider as ProviderValue) : ""
  );
  const [selectedChatModel, setSelectedChatModel] = useState(
    initialData?.chat_model ? getChatModelLabel(initialData.chat_model) : ""
  );
  const [temperature, setTemperature] = useState(
    initialData?.temperature?.toString() || "0.0"
  );
  const [selectedEmbeddingModel, setSelectedEmbeddingModel] = useState(
    initialData?.embedding_model ? getEmbeddingModelLabel(initialData.embedding_model) : ""
  );
  const [description, setDescription] = useState(
    initialData?.description || ""
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{
    model_name?: string;
    provider?: string;
    embedding_model?: string;
    temperature?: string;
  }>({});

  // Get filtered options based on selected provider
  const providerOptions = PROVIDERS.map(p => p.label);
  const chatModelOptions = selectedProvider
    ? getChatModelsByProvider(getProviderValue(selectedProvider)!).map(m => m.label)
    : [];
  const embeddingModelOptions = selectedProvider
    ? getEmbeddingModelsByProvider(getProviderValue(selectedProvider)!).map(m => m.label)
    : [];

  useEffect(() => {
    setModelName(initialData?.model_name || "");
    setSelectedProvider(
      initialData?.provider ? getProviderLabel(initialData.provider as ProviderValue) : ""
    );
    setSelectedChatModel(
      initialData?.chat_model ? getChatModelLabel(initialData.chat_model) : ""
    );
    setTemperature(initialData?.temperature?.toString() || "0.0");
    setSelectedEmbeddingModel(
      initialData?.embedding_model ? getEmbeddingModelLabel(initialData.embedding_model) : ""
    );
    setDescription(initialData?.description || "");
    setErrors({});
    setIsSubmitting(false);
  }, [initialData, isOpen]);

  // Reset chat and embedding models when provider changes
  useEffect(() => {
    if (!initialData) {
      setSelectedChatModel("");
      setSelectedEmbeddingModel("");
    }
  }, [selectedProvider, initialData]);

  if (!isOpen) return null;

  const validateForm = () => {
    const newErrors: {
      model_name?: string;
      provider?: string;
      embedding_model?: string;
      temperature?: string;
    } = {};

    if (!modelName.trim()) {
      newErrors.model_name = "Model name is required";
    } else if (modelName.trim().length < 3) {
      newErrors.model_name = "Model name must be at least 3 characters";
    }

    if (!selectedProvider) {
      newErrors.provider = "Provider is required";
    }

    if (!selectedEmbeddingModel) {
      newErrors.embedding_model = "Embedding model is required";
    }

    const tempNum = parseFloat(temperature);
    if (isNaN(tempNum) || tempNum < 0 || tempNum > 2) {
      newErrors.temperature = "Temperature must be between 0 and 2";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      
      const providerValue = getProviderValue(selectedProvider);
      const chatModelValue = selectedChatModel ? getChatModelValue(selectedChatModel) : undefined;
      const embeddingModelValue = getEmbeddingModelValue(selectedEmbeddingModel);
      
      onSave({
        model_name: modelName.trim(),
        provider: providerValue!,
        chat_model: chatModelValue,
        temperature: parseFloat(temperature),
        embedding_model: embeddingModelValue!,
        description: description.trim() || undefined,
      });
      onClose();
    } catch (error) {
      console.error("Error saving model:", error);
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
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl border border-gray-200 overflow-hidden transform transition-all max-h-[90vh] overflow-y-auto scrollbar-hide">
        <style jsx>{`
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
          .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
        `}</style>
        <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 sticky top-0 z-10">
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
                  {initialData
                    ? "Update model details"
                    : "Create a new evaluation model"}
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

        <div className="p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Type className="w-4 h-4" />
                Model Name
                <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={modelName}
                onChange={(e) => {
                  setModelName(e.target.value);
                  if (errors.model_name)
                    setErrors((prev) => ({ ...prev, model_name: undefined }));
                }}
                placeholder="e.g., GPT-4 Evaluation"
                className={`w-full px-4 py-3 border-2 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-gray-900 placeholder:text-gray-500 ${
                  errors.model_name
                    ? "border-red-300 bg-red-50 focus:border-red-500"
                    : "border-gray-300 focus:border-blue-500 bg-white"
                }`}
                disabled={isSubmitting}
              />
              {errors.model_name && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <span className="w-4 h-4 text-red-500">⚠</span>
                  {errors.model_name}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Server className="w-4 h-4" />
                Provider
                <span className="text-red-500">*</span>
              </label>
              <Dropdown
                options={providerOptions}
                selectedOption={selectedProvider || "Select Provider"}
                onSelect={(option) => {
                  setSelectedProvider(option);
                  if (errors.provider)
                    setErrors((prev) => ({ ...prev, provider: undefined }));
                }}
                className="w-full"
              />
              {errors.provider && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <span className="w-4 h-4 text-red-500">⚠</span>
                  {errors.provider}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Database className="w-4 h-4" />
                Chat Model
              </label>
              <Dropdown
                options={chatModelOptions.length > 0 ? chatModelOptions : ["Select provider first"]}
                selectedOption={selectedChatModel || "Select Chat Model"}
                onSelect={(option) => {
                  if (chatModelOptions.includes(option)) {
                    setSelectedChatModel(option);
                  }
                }}
                className="w-full"
              />
              <p className="text-xs text-gray-500">Optional chat model identifier</p>
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Thermometer className="w-4 h-4" />
                Temperature
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="2"
                value={temperature}
                onChange={(e) => {
                  setTemperature(e.target.value);
                  if (errors.temperature)
                    setErrors((prev) => ({ ...prev, temperature: undefined }));
                }}
                placeholder="0.0"
                className={`w-full px-4 py-3 border-2 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-gray-900 placeholder:text-gray-500 ${
                  errors.temperature
                    ? "border-red-300 bg-red-50 focus:border-red-500"
                    : "border-gray-300 focus:border-blue-500 bg-white"
                }`}
                disabled={isSubmitting}
              />
              {errors.temperature && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <span className="w-4 h-4 text-red-500">⚠</span>
                  {errors.temperature}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <Database className="w-4 h-4" />
              Embedding Model
              <span className="text-red-500">*</span>
            </label>
            <Dropdown
              options={embeddingModelOptions.length > 0 ? embeddingModelOptions : ["Select provider first"]}
              selectedOption={selectedEmbeddingModel || "Select Embedding Model"}
              onSelect={(option) => {
                if (embeddingModelOptions.includes(option)) {
                  setSelectedEmbeddingModel(option);
                  if (errors.embedding_model)
                    setErrors((prev) => ({
                      ...prev,
                      embedding_model: undefined,
                    }));
                }
              }}
              className="w-full"
            />
            {errors.embedding_model && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <span className="w-4 h-4 text-red-500">⚠</span>
                {errors.embedding_model}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <FileText className="w-4 h-4" />
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the model's capabilities, use cases, and key features..."
              rows={4}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none text-gray-900 placeholder:text-gray-500 bg-white"
              disabled={isSubmitting}
            />
            <p className="text-xs text-gray-500">
              {description.length}/500 characters (optional)
            </p>
          </div>

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
              onClick={handleSubmit}
              disabled={isSubmitting || !modelName.trim() || !selectedProvider || !selectedEmbeddingModel}
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
        </div>

        {isSubmitting && (
          <div className="absolute inset-x-0 bottom-0 h-1 bg-gray-200">
            <div className="h-full bg-gradient-to-r from-blue-500 to-blue-600 animate-pulse"></div>
          </div>
        )}
      </div>
    </div>
  );
}