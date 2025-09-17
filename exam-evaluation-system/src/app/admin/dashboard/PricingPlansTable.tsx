"use client";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  ColumnDef,
} from "@tanstack/react-table";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Button from "@/components/Button";
import ConfirmDialog from "@/components/ConfimDialog";
import AddPricingPlanModal from "./AddPricingPlanModal";
import {RefreshCcw} from 'lucide-react';

interface EvaluationModel {
  model_id: string;
  model_name: string;
  description?: string;
}

interface PricingPlan {
  pricing_plan_id: string;
  name: string;
  billing_period: string;
  price: number;
  description: string;
  features: string[];
  model_id: string;
  evaluation_model: EvaluationModel;
  subscriptionCount: number; // ✅ new field from backend
}

// ✅ Unified labels for all billing period options
const BILLING_PERIOD_LABELS: Record<string, string> = {
  day: "Daily",
  week: "Weekly",
  month: "Monthly",
  year: "Yearly",
  "3_months": "Every 3 months",
  "6_months": "Every 6 months",
  custom: "Custom",
};

export default function PricingPlansTable() {
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState<PricingPlan | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  const fetchPlans = async () => {
    try {
      const res = await fetch("/api/admin/pricing-plans");
      const data = await res.json();
      setPlans(data.plans || []);
    } catch {
      toast.error("Failed to load pricing plans");
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const handleSave = (plan: PricingPlan, isEdit: boolean) => {
    if (isEdit) {
      setPlans((prev) =>
        prev.map((p) => (p.pricing_plan_id === plan.pricing_plan_id ? plan : p))
      );
      toast.success("Plan updated successfully");
    } else {
      setPlans((prev) => [plan, ...prev]);
      toast.success("Plan added successfully");
    }
  };

  const confirmDelete = (id: string) => {
    setDeleteId(id);
    setShowConfirm(true);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const res = await fetch(`/api/admin/pricing-plans/${deleteId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error();
      setPlans((prev) => prev.filter((p) => p.pricing_plan_id !== deleteId));
      toast.success("Deleted successfully");
    } catch {
      toast.error("Failed to delete plan");
    } finally {
      setShowConfirm(false);
      setDeleteId(null);
    }
  };

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      const res = await fetch("/api/admin/pricing-plans/sync", {
        method: "POST",
      });
      if (!res.ok) throw new Error();
      toast.success("Plans synced from Stripe!");
      fetchPlans(); // refresh UI
    } catch {
      toast.error("Failed to sync from Stripe");
    } finally {
      setIsSyncing(false);
    }
  };

  const columns: ColumnDef<PricingPlan>[] = [
    { header: "Name", accessorKey: "name" },
    {
      header: "Billing Period",
      cell: ({ row }) => (
        <span>
          {BILLING_PERIOD_LABELS[row.original.billing_period] ??
            row.original.billing_period}
        </span>
      ),
    },
    { header: "Price (USD)", accessorKey: "price" },
    {
      header: "Evaluation Model",
      cell: ({ row }) => (
        <span
          title={row.original.evaluation_model?.description || ""}
          className="underline decoration-dotted cursor-help"
        >
          {row.original.evaluation_model?.model_name}
        </span>
      ),
    },
    {
      header: "Features",
      cell: ({ row }) =>
        row.original.features?.length ? (
          <ul className="list-disc pl-4">
            {row.original.features.map((f, i) => (
              <li key={i}>{f}</li>
            ))}
          </ul>
        ) : (
          <span className="text-gray-500">No features</span>
        ),
    },
    { header: "Description", accessorKey: "description" },
    {
      header: "Subscriptions",
      accessorKey: "subscriptionCount",
      cell: ({ row }) => <span>{row.original.subscriptionCount ?? 0}</span>,
    },
    {
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex gap-2">
          <button
            onClick={() => {
              setEditingPlan(row.original);
              setShowModal(true);
            }}
            className="text-blue-600"
          >
            Edit
          </button>
          <button
            onClick={() => confirmDelete(row.original.pricing_plan_id)}
            className={`text-red-600 ${
              row.original.subscriptionCount > 0
                ? "opacity-50 cursor-not-allowed"
                : ""
            }`}
            disabled={row.original.subscriptionCount > 0}
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

  const table = useReactTable({
    data: plans,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Pricing Plans</h3>
        <div className="flex gap-2">
          <Button
  variant="secondary"
  onClick={handleSync}
  disabled={isSyncing}
  className="flex items-center gap-2"
>
  <RefreshCcw
    className={`h-4 w-4 ${isSyncing ? "animate-spin" : ""}`}
  />
  {isSyncing ? "Syncing..." : "Sync from Stripe"}
</Button>

          <Button
            variant="primary"
            onClick={() => {
              setEditingPlan(null);
              setShowModal(true);
            }}
          >
            + Add Pricing Plan
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id}>
                {hg.headers.map((h) => (
                  <th key={h.id} className="px-6 py-3 text-left text-xs">
                    {flexRender(h.column.columnDef.header, h.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row, idx) => (
              <tr key={row.id} className={idx % 2 ? "bg-gray-50" : "bg-white"}>
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-6 py-4 text-sm">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {!plans.length && (
          <div className="text-center py-12 text-gray-500">
            No pricing plans found
          </div>
        )}
      </div>

      <AddPricingPlanModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSave={handleSave}
        initialData={editingPlan}
      />

      <ConfirmDialog
        isOpen={showConfirm}
        title="Delete Pricing Plan"
        message="Are you sure you want to delete this pricing plan?"
        onConfirm={handleDelete}
        onCancel={() => setShowConfirm(false)}
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
  );
}
