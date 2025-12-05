import { useState, useRef, useEffect } from "react";
import Dropdown from "@/components/Dropdown";
import toast from "react-hot-toast";

interface EvaluationModel {
  id: string;
  model_name: string;
  provider: string;
  chat_model?: string;
  temperature?: number;
  description?: string;
}

interface AdvancedAssessmentSettingsProps {
  assessmentId: string;
  moduleId: string;
  currentDeadline: string;
  currentAutoGrade: boolean;
  currentDefaultModelId?: string | null;
  evaluationModels: EvaluationModel[];
  onUpdateSuccess: () => void;
}

export default function AdvancedAssessmentSettings({
  assessmentId,
  moduleId,
  currentDeadline,
  currentAutoGrade,
  currentDefaultModelId,
  evaluationModels,
  onUpdateSuccess,
}: AdvancedAssessmentSettingsProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Helper function to format date for datetime-local input
  const formatDateForInput = (dateString: string) => {
    if (!dateString) return "";
    try {
      // Create date object from the string (handles ISO format and other formats)
      const date = new Date(dateString);
      
      // Check if date is valid
      if (isNaN(date.getTime())) return "";
      
      // Format to YYYY-MM-DDTHH:mm (required format for datetime-local)
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      
      return `${year}-${month}-${day}T${hours}:${minutes}`;
    } catch (error) {
      console.error("Error formatting date:", error);
      return "";
    }
  };

  const [formData, setFormData] = useState({
    deadline: formatDateForInput(currentDeadline),
    autoGrade: currentAutoGrade,
    defaultModelId: currentDefaultModelId || "",
  });

  // Update formData when currentDeadline changes
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      deadline: formatDateForInput(currentDeadline),
    }));
  }, [currentDeadline]);

  const hasChanges = () => {
    return (
      formData.deadline !== formatDateForInput(currentDeadline) ||
      formData.autoGrade !== currentAutoGrade ||
      formData.defaultModelId !== (currentDefaultModelId || "")
    );
  };

  const handleSaveSettings = async () => {
    if (!hasChanges()) {
      alert("No changes to save");
      return;
    }

    setIsSaving(true);

    try {
      const payload: any = {
        auto_grade: formData.autoGrade,
      };

      // Handle deadline - Send as-is for local database
      if (formData.deadline) {
        payload.deadline = formData.deadline;
      } else {
        payload.deadline = null;
      }

      // Handle model_id - Always include in payload
      if (formData.defaultModelId === "" || !formData.defaultModelId) {
        payload.model_id = null;
      } else {
        payload.model_id = formData.defaultModelId;
      }

      console.log("Sending payload:", payload);

      const response = await fetch(
        `/api/educator/module/${moduleId}/assessment/${assessmentId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();
      console.log("Patch response data:", data);

      if (!response.ok) {
        console.error("Patch failed", data);
        alert(data.message || "Failed to update assessment settings");
        setIsSaving(false);
        return;
      }

      toast.success("Assessment settings updated successfully!");
      setIsSaving(false);
      onUpdateSuccess();
    } catch (error) {
      console.error("Error updating settings:", error);
      toast.error("Something went wrong. Please try again.");
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setFormData({
      deadline: formatDateForInput(currentDeadline),
      autoGrade: currentAutoGrade,
      defaultModelId: currentDefaultModelId || "",
    });
  };

  // Prepare dropdown options
  const modelOptions = [
    "No default model",
    ...evaluationModels.map((m) => `${m.model_name} (${m.provider})`),
  ];

  const getSelectedModelDisplay = () => {
    if (!formData.defaultModelId) return "No default model";
    const model = evaluationModels.find(
      (m) => m.id === formData.defaultModelId
    );
    return model
      ? `${model.model_name} (${model.provider})`
      : "No default model";
  };

  const handleModelSelect = (option: string) => {
    console.log("Model selected:", option);
    if (option === "No default model") {
      setFormData((prev) => ({ ...prev, defaultModelId: "" }));
      console.log("Set to no model");
    } else {
      const model = evaluationModels.find(
        (m) => `${m.model_name} (${m.provider})` === option
      );
      console.log("Found model:", model);
      if (model) {
        setFormData((prev) => ({
          ...prev,
          defaultModelId: model.id,
        }));
        console.log("Updated formData with model.id:", model.id);
      }
    }
  };

  // Debug: Log current state
  useEffect(() => {
    console.log("Current formData:", formData);
    console.log("Formatted currentDeadline:", formatDateForInput(currentDeadline));
  }, [formData, currentDeadline]);

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden mb-8">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full bg-gradient-to-r from-purple-50 to-pink-50 px-6 py-4 border-b border-gray-200 flex items-center justify-between hover:from-purple-100 hover:to-pink-100 transition-colors"
      >
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <svg
              className="w-5 h-5 text-purple-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            Advanced Assessment Settings
          </h2>
          <p className="text-gray-600 text-sm mt-1">
            Configure deadline, auto-grading, and default AI model
          </p>
        </div>
        <svg
          className={`w-6 h-6 text-gray-600 transition-transform ${
            isExpanded ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isExpanded && (
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Auto Grade Toggle */}
            <div className="lg:col-span-2">
              <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <div className="p-1.5 bg-green-100 rounded-lg">
                      <svg
                        className="w-4 h-4 text-green-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <h3 className="font-semibold text-gray-900 text-sm">
                      Auto Grading
                    </h3>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.autoGrade}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          autoGrade: e.target.checked,
                        }))
                      }
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-4 peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-green-600"></div>
                  </label>
                </div>
                <p className="text-xs text-gray-600">
                  Automatically grade submissions using AI when they are
                  submitted
                </p>
              </div>
            </div>

            {/* Deadline */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-3">
                <svg
                  className="w-4 h-4 inline mr-2 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                Assessment Deadline
              </label>
              <input
                type="datetime-local"
                value={formData.deadline}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    deadline: e.target.value,
                  }))
                }
                className="w-full px-4 py-3 text-gray-900 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 shadow-sm"
              />
              <p className="text-xs text-gray-500 mt-2">
                Students must submit their work before this time
              </p>
            </div>

            {/* Default AI Model - Using Dropdown */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-3">
                <svg
                  className="w-4 h-4 inline mr-2 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                Default AI Model
              </label>
              <Dropdown
                options={modelOptions}
                selectedOption={getSelectedModelDisplay()}
                onSelect={handleModelSelect}
                direction="bottom"
              />
              <p className="text-xs text-gray-500 mt-2">
                Default model used for auto-grading submissions
              </p>
            </div>
          </div>

          {/* Info Panel */}
          <div className="mt-6 p-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl">
            <div className="flex items-start gap-3">
              <svg
                className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div>
                <h4 className="font-medium text-amber-800 mb-2">
                  Advanced Settings Information
                </h4>
                <ul className="text-sm text-amber-700 space-y-1">
                  <li>
                    • <strong>Auto Grading:</strong> When enabled, submissions
                    are automatically graded using the default AI model upon
                    submission
                  </li>
                  <li>
                    • <strong>Deadline:</strong> Students cannot submit after
                    this time. You can extend it anytime.
                  </li>
                  <li>
                    • <strong>Default AI Model:</strong> This model will be used
                    for auto-grading. You can always manually select a different
                    model later.
                  </li>
                  <li>
                    • <strong>Note:</strong> Changes to auto-grading settings
                    only affect future submissions
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex items-center justify-end gap-3">
            {hasChanges() && (
              <button
                onClick={handleReset}
                disabled={isSaving}
                className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Reset Changes
              </button>
            )}
            <button
              onClick={handleSaveSettings}
              disabled={!hasChanges() || isSaving}
              className="px-6 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              {isSaving ? (
                <span className="flex items-center gap-2">
                  <svg
                    className="animate-spin h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
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
                  Saving...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  Save Settings
                </span>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}