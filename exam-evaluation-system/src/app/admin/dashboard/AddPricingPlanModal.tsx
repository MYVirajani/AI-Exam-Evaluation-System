"use client";
import React, { useState, useEffect } from "react";
import Button from "@/components/Button";
import { X, Plus, Trash2, DollarSign, Tag, FileText, Calendar, Layers } from "lucide-react";
import Dropdown from "@/components/Dropdown"; 

interface PricingPlan {
  pricing_plan_id?: string;
  name: string;
  billing_period: string;
  price: number;
  description: string;
  features: string[];
  model_id: string;
}

interface EvaluationModel {
  model_id: string;
  model_name: string;
  description: string;
}

interface PricingPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (plan: PricingPlan, isEdit: boolean) => void;
  initialData?: PricingPlan | null;
}

const BILLING_PERIOD_OPTIONS = [
  "Daily",
  "Weekly",
  "Monthly",
  "Yearly",
  "Every 3 months",
  "Every 6 months",
  "Custom",
];

const BILLING_PERIOD_VALUES = [
  "day",
  "week",
  "month",
  "year",
  "3_months",
  "6_months",
  "custom",
];

export default function AddPricingPlanModal({
  isOpen,
  onClose,
  onSave,
  initialData,
}: PricingPlanModalProps) {
  const isEdit = Boolean(initialData);

  const [name, setName] = useState("");
  const [billingPeriod, setBillingPeriod] = useState("Monthly");
  const [price, setPrice] = useState<number>(0);
  const [description, setDescription] = useState("");
  const [features, setFeatures] = useState<string[]>([]);
  const [newFeature, setNewFeature] = useState("");
  const [models, setModels] = useState<EvaluationModel[]>([]);
  const [selectedModelId, setSelectedModelId] = useState("");
  const [selectedModelName, setSelectedModelName] = useState("Select an evaluation model");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      const fetchModels = async () => {
        try {
          const res = await fetch("/api/admin/evaluation-models");
          if (!res.ok) throw new Error("Failed to fetch models");
          const data = await res.json();
          setModels(data);
        } catch (err) {
          console.error("Error loading models:", err);
        }
      };
      fetchModels();

      // Pre-fill fields if editing
      if (initialData) {
        setName(initialData.name);
        // Convert billing period value to display label
        const billingIndex = BILLING_PERIOD_VALUES.indexOf(initialData.billing_period);
        setBillingPeriod(billingIndex !== -1 ? BILLING_PERIOD_OPTIONS[billingIndex] : "Monthly");
        setPrice(initialData.price);
        setDescription(initialData.description);
        setFeatures(initialData.features || []);
        setSelectedModelId(initialData.model_id);
        
        // Find the model name for the selected model ID
        const selectedModel = models.find(model => model.model_id === initialData.model_id);
        if (selectedModel) {
          setSelectedModelName(selectedModel.model_name);
        }
      } else {
        resetForm();
      }
      setErrors({});
    }
  }, [isOpen, initialData, models]);

  const resetForm = () => {
    setName("");
    setBillingPeriod("Monthly");
    setPrice(0);
    setDescription("");
    setFeatures([]);
    setSelectedModelId("");
    setSelectedModelName("Select an evaluation model");
    setNewFeature("");
    setErrors({});
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) newErrors.name = "Plan name is required";
    if (!selectedModelId) newErrors.model = "Please select an evaluation model";
    if (price < 0) newErrors.price = "Price cannot be negative";
    if (price === 0) newErrors.price = "Price must be greater than 0";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddFeature = () => {
    if (newFeature.trim() === "") return;
    if (features.includes(newFeature.trim())) {
      alert("Feature already exists");
      return;
    }
    setFeatures((prev) => [...prev, newFeature.trim()]);
    setNewFeature("");
  };

  const handleRemoveFeature = (idx: number) =>
    setFeatures((prev) => prev.filter((_, i) => i !== idx));

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddFeature();
    }
  };

  const handleModelSelect = (modelName: string) => {
    const selectedModel = models.find(model => model.model_name === modelName);
    if (selectedModel) {
      setSelectedModelId(selectedModel.model_id);
      setSelectedModelName(modelName);
      if (errors.model) setErrors(prev => ({ ...prev, model: "" }));
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      // Convert billing period display label back to value
      const billingIndex = BILLING_PERIOD_OPTIONS.indexOf(billingPeriod);
      const billingPeriodValue = billingIndex !== -1 ? BILLING_PERIOD_VALUES[billingIndex] : "month";
      
      const method = isEdit ? "PATCH" : "POST";
      const url = isEdit
        ? `/api/admin/pricing-plans/${initialData?.pricing_plan_id}`
        : "/api/admin/pricing-plans";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          billing_period: billingPeriodValue,
          price,
          description,
          features,
          model_id: selectedModelId,
        }),
      });
      if (!res.ok) throw new Error("Failed to save pricing plan");
      const data = await res.json();
      onSave(data.plan, isEdit);
      onClose();
      resetForm();
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Failed to save plan");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-2xl flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900">
                {isEdit ? "Edit Pricing Plan" : "Create New Pricing Plan"}
              </h3>
              <p className="text-sm text-gray-600">
                {isEdit ? "Update your pricing plan details" : "Set up a new pricing plan for your service"}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Plan Name */}
          <div className="space-y-2">
            <label className="flex items-center text-sm font-medium text-gray-700">
              <Tag className="w-4 h-4 mr-2 text-gray-500" />
              Plan Name *
            </label>
            <input
              type="text"
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 placeholder-gray-500 ${
                errors.name ? "border-red-300 bg-red-50" : "border-gray-300 bg-white"
              }`}
              placeholder="Enter plan name (e.g., Basic Plan, Pro Plan)"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name) setErrors(prev => ({ ...prev, name: "" }));
              }}
            />
            {errors.name && (
              <p className="text-sm text-red-600 flex items-center">
                <span className="w-1 h-1 bg-red-600 rounded-full mr-2"></span>
                {errors.name}
              </p>
            )}
          </div>

          {/* Price and Billing Period */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="flex items-center text-sm font-medium text-gray-700">
                <DollarSign className="w-4 h-4 mr-2 text-gray-500" />
                Price (USD) *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  className={`w-full pl-8 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 placeholder-gray-500 ${
                    errors.price ? "border-red-300 bg-red-50" : "border-gray-300 bg-white"
                  } ${isEdit ? "bg-gray-100 text-gray-700 cursor-not-allowed" : ""}`}
                  placeholder="0.00"
                  value={price}
                  onChange={(e) => {
                    setPrice(Number(e.target.value));
                    if (errors.price) setErrors(prev => ({ ...prev, price: "" }));
                  }}
                  disabled={isEdit}
                />
              </div>
              {isEdit && (
                <p className="text-xs text-gray-500">Price cannot be changed when editing</p>
              )}
              {errors.price && (
                <p className="text-sm text-red-600 flex items-center">
                  <span className="w-1 h-1 bg-red-600 rounded-full mr-2"></span>
                  {errors.price}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="flex items-center text-sm font-medium text-gray-700">
                <Calendar className="w-4 h-4 mr-2 text-gray-500" />
                Billing Period
              </label>
              <Dropdown
                options={BILLING_PERIOD_OPTIONS}
                selectedOption={billingPeriod}
                onSelect={setBillingPeriod}
                className="w-full"
              />
            </div>
          </div>

          {/* Evaluation Model */}
          <div className="space-y-2">
            <label className="flex items-center text-sm font-medium text-gray-700">
              <Layers className="w-4 h-4 mr-2 text-gray-500" />
              Evaluation Model *
            </label>
            <Dropdown
              options={models.map(model => model.model_name)}
              selectedOption={selectedModelName}
              onSelect={handleModelSelect}
              className={`w-full ${errors.model ? "border-red-300 bg-red-50" : ""}`}
            />
            {errors.model && (
              <p className="text-sm text-red-600 flex items-center">
                <span className="w-1 h-1 bg-red-600 rounded-full mr-2"></span>
                {errors.model}
              </p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="flex items-center text-sm font-medium text-gray-700">
              <FileText className="w-4 h-4 mr-2 text-gray-500" />
              Description
              <span className="ml-2 text-xs text-gray-500 font-normal">(Optional)</span>
            </label>
            <textarea
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none bg-white text-gray-900 placeholder-gray-500"
              placeholder="Describe what this pricing plan offers... (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Features */}
          <div className="space-y-3">
            <label className="flex items-center text-sm font-medium text-gray-700">
              <Plus className="w-4 h-4 mr-2 text-gray-500" />
              Features
            </label>
            
            {/* Add Feature Input */}
            <div className="flex gap-3">
              <input
                type="text"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white text-gray-900 placeholder-gray-500"
                placeholder="Add a feature (e.g., Unlimited storage, 24/7 support)"
                value={newFeature}
                onChange={(e) => setNewFeature(e.target.value)}
                onKeyPress={handleKeyPress}
              />
              <button
                type="button"
                onClick={handleAddFeature}
                disabled={!newFeature.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add</span>
              </button>
            </div>

            {/* Features List */}
            {features.length > 0 && (
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {features.map((feature, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <span className="text-sm text-gray-800 flex-1 font-medium">{feature}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveFeature(idx)}
                      className="ml-3 p-1 text-red-500 hover:bg-red-100 rounded transition-colors"
                      title="Remove feature"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {features.length === 0 && (
              <div className="text-center py-6 text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <Plus className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm">No features added yet</p>
                <p className="text-xs text-gray-400">Add features to highlight what this plan includes</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer - Always Visible */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl flex-shrink-0">
          <Button 
            variant="secondary" 
            onClick={handleClose}
            disabled={loading}
            className="px-6 py-2"
          >
            Cancel
          </Button>
          <Button 
            variant="primary" 
            loading={loading} 
            onClick={handleSubmit}
            className="px-6 py-2"
          >
            {loading ? (
              isEdit ? "Saving Changes..." : "Creating Plan..."
            ) : (
              isEdit ? "Save Changes" : "Create Plan"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}