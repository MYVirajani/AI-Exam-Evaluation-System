"use client";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  ColumnDef,
} from "@tanstack/react-table";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import ConfirmDialog from "@/components/ConfimDialog";
import Button from "@/components/Button";
import AddPricingPlanModal from "./AddPricingPlanModal";

interface PricingPlan {
  pricing_plan_id: string;
  name: string;
  billing_period: string;
  price: number;
  description: string;
  stripe_price_id: string;
}

export default function PricingPlansTable() {
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editedPlan, setEditedPlan] = useState<Partial<PricingPlan>>({});
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const fetchPlans = async () => {
    try {
      const res = await fetch("/api/admin/pricing-plans");
      const data = await res.json();
      setPlans(data.plans || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load pricing plans");
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const syncPlans = async () => {
    try {
      await fetch("/api/admin/pricing-plans/sync", { method: "POST" });
      toast.success("Plans synced from Stripe");
      fetchPlans();
    } catch (err) {
      console.error(err);
      toast.error("Failed to sync plans");
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
      if (!res.ok) throw new Error("Failed to delete pricing plan");
      setPlans((prev) => prev.filter((p) => p.pricing_plan_id !== deleteId));
      toast.success("Pricing plan deleted");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to delete pricing plan");
    } finally {
      setShowConfirm(false);
      setDeleteId(null);
    }
  };

  const handleEdit = (plan: PricingPlan) => {
    setEditingId(plan.pricing_plan_id);
    setEditedPlan(plan);
  };

  const handleSave = async () => {
    try {
      const res = await fetch(`/api/admin/pricing-plans/${editingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editedPlan),
      });
      if (!res.ok) throw new Error("Failed to update pricing plan");
      const updated = await res.json();
      setPlans((prev) =>
        prev.map((p) => (p.pricing_plan_id === editingId ? updated.plan : p))
      );
      setEditingId(null);
      setEditedPlan({});
      toast.success("Pricing plan updated");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to update pricing plan");
    }
  };

  const handleAddPlan = (plan: PricingPlan) => {
    setPlans((prev) => [plan, ...prev]);
  };

  const columns: ColumnDef<PricingPlan>[] = [
    { header: "Name", accessorKey: "name" },
    { header: "Billing Period", accessorKey: "billing_period" },
    { header: "Price(USD)", accessorKey: "price" },
    { header: "Description", accessorKey: "description" },
    {
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex gap-2">
          {editingId === row.original.pricing_plan_id ? (
            <>
              <button onClick={handleSave} className="text-green-600">Save</button>
              <button onClick={() => setEditingId(null)} className="text-gray-600">Cancel</button>
            </>
          ) : (
            <>
              <button onClick={() => handleEdit(row.original)} className="text-blue-600">Edit</button>
              <button onClick={() => confirmDelete(row.original.pricing_plan_id)} className="text-red-600">Delete</button>
            </>
          )}
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
        <h3 className="text-lg font-medium text-gray-900">Pricing Plans</h3>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={syncPlans}>
            Sync from Stripe
          </Button>
          <Button variant="primary" onClick={() => setShowAddModal(true)}>
            + Add Pricing Plan
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id}>
                {hg.headers.map((h) => (
                  <th
                    key={h.id}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {flexRender(h.column.columnDef.header, h.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {table.getRowModel().rows.map((row, idx) => (
              <tr key={row.id} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {plans.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No pricing plans found
          </div>
        )}
      </div>

      <AddPricingPlanModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddPlan}
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
