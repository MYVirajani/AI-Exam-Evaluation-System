"use client";

import React, { useState, useEffect } from "react";
import Button from "@/components/Button";

interface PricingPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (plan: any) => void;
}

interface EvaluationModel {
  model_id: string;
  model_name: string;
}

export default function AddPricingPlanModal({
  isOpen,
  onClose,
  onAdd,
}: PricingPlanModalProps) {
  const [name, setName] = useState("");
  const [duration, setDuration] = useState<number>(0);
  const [price, setPrice] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [description, setDescription] = useState("");
  const [features, setFeatures] = useState<string[]>([]);
  const [newFeature, setNewFeature] = useState("");

  const [models, setModels] = useState<EvaluationModel[]>([]);
  const [selectedModelId, setSelectedModelId] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ Fetch models for dropdown
  useEffect(() => {
    if (!isOpen) return;
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
  }, [isOpen]);

  const handleAddFeature = () => {
    if (newFeature.trim() === "") return;
    setFeatures((prev) => [...prev, newFeature.trim()]);
    setNewFeature("");
  };

  const handleRemoveFeature = (index: number) => {
    setFeatures((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!selectedModelId) {
      alert("Please select a model");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/admin/pricing-plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          duration,
          price,
          payment_method: paymentMethod,
          description,
          features,
          model_id: selectedModelId,
        }),
      });
      if (!res.ok) throw new Error("Failed to add pricing plan");
      const data = await res.json();
      onAdd(data.plan);
      onClose();

      // Reset form
      setName("");
      setDuration(0);
      setPrice(0);
      setPaymentMethod("");
      setDescription("");
      setFeatures([]);
      setSelectedModelId("");
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Failed to add plan");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-medium mb-4">Add Pricing Plan</h3>

        <div className="flex flex-col gap-3">
          {/* Name */}
          <input
            className="border p-2 rounded"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          {/* Duration */}
          <input
            className="border p-2 rounded"
            type="number"
            placeholder="Duration (days)"
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
          />

          {/* Price */}
          <input
            className="border p-2 rounded"
            type="number"
            placeholder="Price"
            value={price}
            onChange={(e) => setPrice(Number(e.target.value))}
          />

          {/* Payment Method */}
          <input
            className="border p-2 rounded"
            placeholder="Payment Method"
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
          />

          {/* Description */}
          <textarea
            className="border p-2 rounded"
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          {/* ✅ Model Dropdown */}
          <select
            className="border p-2 rounded"
            value={selectedModelId}
            onChange={(e) => setSelectedModelId(e.target.value)}
          >
            <option value="">Select Model</option>
            {models.map((model) => (
              <option key={model.model_id} value={model.model_id}>
                {model.model_name}
              </option>
            ))}
          </select>

          {/* ✅ Features List */}
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
              {features.map((feature, index) => (
                <li key={index} className="flex justify-between items-center">
                  <span>{feature}</span>
                  <button
                    className="text-red-500 text-sm"
                    onClick={() => handleRemoveFeature(index)}
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" loading={loading} onClick={handleSubmit}>
            Add
          </Button>
        </div>
      </div>
    </div>
  );
}
