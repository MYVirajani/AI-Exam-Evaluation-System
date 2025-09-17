"use client";

import { useState, useEffect } from "react";

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

  // Reset values when opened/closed
  useEffect(() => {
    setName(initialData?.name || "");
    setDescription(initialData?.description || "");
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ name, description });
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-lg">
        <h4 className="text-lg font-semibold mb-4">
          {initialData ? "Edit Model" : "Add New Model"}
        </h4>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Model Name"
            required
            className="w-full px-3 py-2 border rounded"
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description"
            // required
            className="w-full px-3 py-2 border rounded"
          />
          <div className="flex justify-end gap-2">
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded"
            >
              Save
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-500 text-white rounded"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
