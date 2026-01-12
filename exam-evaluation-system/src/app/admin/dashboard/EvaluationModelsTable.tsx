"use client";

import { useState, useEffect } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  ColumnDef,
} from "@tanstack/react-table";
import AddModelModal from "./AddModelModal";

type PricingPlan = {
  pricing_plan_id: string;
  name: string;
};

type ExamEvaluationModel = {
  model_id: string;
  model_name: string;
  description: string | null;
  pricing_plans: PricingPlan[];
};

export default function ExamEvaluationModelsTable() {
  const [models, setModels] = useState<ExamEvaluationModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingModel, setEditingModel] = useState<ExamEvaluationModel | null>(
    null
  );
  const [showModal, setShowModal] = useState(false);

  // ✅ Fetch models including pricing plans
  useEffect(() => {
    const fetchModels = async () => {
      try {
        const res = await fetch("/api/admin/evaluation-models");
        const data = await res.json();
        setModels(data);
      } catch (err) {
        console.error("Failed to fetch models", err);
      } finally {
        setLoading(false);
      }
    };
    fetchModels();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this model?")) return;
    try {
      await fetch(`/api/admin/evaluation-models/${id}`, { method: "DELETE" });
      setModels(models.filter((m) => m.model_id !== id));
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  const handleSave = async (model: { name: string; description: string }) => {
    try {
      if (editingModel) {
        // Update existing model
        const res = await fetch(
          `/api/admin/evaluation-models/${editingModel.model_id}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              model_name: model.name,
              description: model.description,
            }),
          }
        );
        const updated = await res.json();
        setModels(
          models.map((m) => (m.model_id === editingModel.model_id ? updated : m))
        );
      } else {
        // Create new model
        const res = await fetch("/api/admin/evaluation-models", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model_name: model.name,
            description: model.description,
          }),
        });
        const newModel = await res.json();
        setModels([...models, newModel]);
      }
    } catch (err) {
      console.error("Save failed", err);
    } finally {
      setShowModal(false);
      setEditingModel(null);
    }
  };

  const columns: ColumnDef<ExamEvaluationModel>[] = [
    { accessorKey: "model_name", header: "Name" },
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }) =>
        row.original.description || (
          <span className="text-gray-400 italic">No description</span>
        ),
    },
    {
      id: "pricingPlans",
      header: "Pricing Plans",
      cell: ({ row }) => {
        const plans = row.original.pricing_plans || [];
        return plans.length > 0 ? (
          <ul className="list-disc pl-5">
            {plans.map((plan) => (
              <li key={plan.pricing_plan_id}>{plan.name}</li>
            ))}
          </ul>
        ) : (
          <span className="text-gray-400 italic">No Plans</span>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex gap-2">
          <button
            onClick={() => {
              setEditingModel(row.original);
              setShowModal(true);
            }}
            className="px-2 py-1 text-sm bg-yellow-500 text-white rounded"
          >
            Edit
          </button>
          <button
            onClick={() => handleDelete(row.original.model_id)}
            className="px-2 py-1 text-sm bg-red-500 text-white rounded"
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

  const table = useReactTable({
    data: models,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (loading) return <p>Loading exam models...</p>;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold">Exam Evaluation Models</h3>
        <button
          onClick={() => {
            setEditingModel(null);
            setShowModal(true);
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          + Add Model
        </button>
      </div>

      <table className="min-w-full border border-gray-200">
        <thead className="bg-gray-100">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className="px-4 py-2 border text-left text-sm font-medium"
                >
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext()
                  )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id} className="border-t">
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="px-4 py-2 border text-sm">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      <AddModelModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingModel(null);
        }}
        onSave={handleSave}
        initialData={
          editingModel
            ? {
                name: editingModel.model_name,
                description: editingModel.description || "",
              }
            : undefined
        }
      />
    </div>
  );
}
