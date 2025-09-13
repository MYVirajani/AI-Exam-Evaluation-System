"use client";
import React, { useState, useEffect } from "react";
import Button from "@/components/Button";

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

export default function AddPricingPlanModal({
  isOpen,
  onClose,
  onSave,
  initialData,
}: PricingPlanModalProps) {
  const isEdit = Boolean(initialData);

  const [name, setName] = useState("");
  const [billingPeriod, setBillingPeriod] = useState("month");
  const [price, setPrice] = useState<number>(0);
  const [description, setDescription] = useState("");
  const [features, setFeatures] = useState<string[]>([]);
  const [newFeature, setNewFeature] = useState("");
  const [models, setModels] = useState<EvaluationModel[]>([]);
  const [selectedModelId, setSelectedModelId] = useState("");
  const [loading, setLoading] = useState(false);

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
        setBillingPeriod(initialData.billing_period);
        setPrice(initialData.price);
        setDescription(initialData.description);
        setFeatures(initialData.features || []);
        setSelectedModelId(initialData.model_id);
      } else {
        setName("");
        setBillingPeriod("month");
        setPrice(0);
        setDescription("");
        setFeatures([]);
        setSelectedModelId("");
      }
    }
  }, [isOpen, initialData]);

  const handleAddFeature = () => {
    if (newFeature.trim() === "") return;
    setFeatures((prev) => [...prev, newFeature.trim()]);
    setNewFeature("");
  };

  const handleRemoveFeature = (idx: number) =>
    setFeatures((prev) => prev.filter((_, i) => i !== idx));

  const handleSubmit = async () => {
    if (!selectedModelId || !name || price <0) {
      alert("Fill all required fields");
      return;
    }
    setLoading(true);
    try {
      const method = isEdit ? "PATCH" : "POST";
      const url = isEdit
        ? `/api/admin/pricing-plans/${initialData?.pricing_plan_id}`
        : "/api/admin/pricing-plans";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          billing_period: billingPeriod,
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
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Failed to save plan");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-medium mb-4">
          {isEdit ? "Edit Pricing Plan" : "Add Pricing Plan"}
        </h3>
        <div className="flex flex-col gap-3">
          <input
            className="border p-2 rounded"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            className="border p-2 rounded"
            type="number"
            placeholder="Price (USD)"
            value={price}
            onChange={(e) => setPrice(Number(e.target.value))}
          />
          <select
            className="border p-2 rounded"
            value={billingPeriod}
            onChange={(e) => setBillingPeriod(e.target.value)}
          >
            <option value="month">Monthly</option>
            <option value="year">Yearly</option>
          </select>
          <textarea
            className="border p-2 rounded"
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <select
            className="border p-2 rounded"
            value={selectedModelId}
            onChange={(e) => setSelectedModelId(e.target.value)}
          >
            <option value="">Select Evaluation Model</option>
            {models.map((m) => (
              <option key={m.model_id} value={m.model_id}>
                {m.model_name}
              </option>
            ))}
          </select>
          <div>
            <div className="flex gap-2 mb-2">
              <input
                className="border p-2 rounded flex-1"
                placeholder="Add feature"
                value={newFeature}
                onChange={(e) => setNewFeature(e.target.value)}
              />
              <Button variant="primary" onClick={handleAddFeature}>
                Add
              </Button>
            </div>
            <ul className="list-disc pl-5 space-y-1">
              {features.map((f, idx) => (
                <li key={idx} className="flex justify-between">
                  {f}
                  <button
                    className="text-red-500 text-sm"
                    onClick={() => handleRemoveFeature(idx)}
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" loading={loading} onClick={handleSubmit}>
            {isEdit ? "Save Changes" : "Add"}
          </Button>
        </div>
      </div>
    </div>
  );
}
