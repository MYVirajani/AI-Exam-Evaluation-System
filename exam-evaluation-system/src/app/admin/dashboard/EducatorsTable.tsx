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
import LoadingAnimation from "@/components/LoadingAnimation";

interface Educator {
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  official_email: string;
  education_institute: string;
  module_count: number;
}

export default function EducatorsTable() {
  const [educators, setEducators] = useState<Educator[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editedEducator, setEditedEducator] = useState<Partial<Educator>>({});
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    fetch("/api/admin/educators")
      .then((res) => res.json())
      .then((data) => setEducators(data.educators || []))
      .catch((err) => {
        console.error(err);
        toast.error("Failed to load educators");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const confirmDelete = (id: string) => {
    setDeleteId(id);
    setShowConfirm(true);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const res = await fetch(`/api/admin/educators/${deleteId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete educator");
      setEducators((prev) => prev.filter((e) => e.user_id !== deleteId));
      toast.success("Educator deleted");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to delete educator");
    } finally {
      setShowConfirm(false);
      setDeleteId(null);
    }
  };

  const handleEdit = (educator: Educator) => {
    setEditingId(educator.user_id);
    setEditedEducator(educator);
  };

  const handleSave = async () => {
    try {
      const res = await fetch(`/api/admin/educators/${editingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editedEducator),
      });
      if (!res.ok) throw new Error("Failed to update educator");
      const updated = await res.json();
      setEducators((prev) =>
        prev.map((e) => (e.user_id === editingId ? updated.educator : e))
      );
      setEditingId(null);
      setEditedEducator({});
      toast.success("Educator updated");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to update educator");
    }
  };

  const columns: ColumnDef<Educator>[] = [
    { header: "First Name", accessorKey: "first_name" },
    { header: "Last Name", accessorKey: "last_name" },
    { header: "Email", accessorKey: "email" },
    { header: "Phone", accessorKey: "phone_number" },
    { header: "Official Email", accessorKey: "official_email" },
    { header: "Institute", accessorKey: "education_institute" },
    { header: "Modules", accessorKey: "module_count" },
    {
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex gap-2">
          {editingId === row.original.user_id ? (
            <>
              <button onClick={handleSave} className="text-green-600">Save</button>
              <button onClick={() => setEditingId(null)} className="text-gray-600">Cancel</button>
            </>
          ) : (
            <>
              <button onClick={() => handleEdit(row.original)} className="text-blue-600">Edit</button>
              <button onClick={() => confirmDelete(row.original.user_id)} className="text-red-600">Delete</button>
            </>
          )}
        </div>
      ),
    },
  ];

  const table = useReactTable({
    data: educators,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  // Show loading animation while data is being fetched
  if (isLoading) {
    return (
      <LoadingAnimation
        variant="spinner"
        size="lg"
        text="Loading educators..."
        color="blue"
        fullScreen={false}
        className="py-12"
      />
    );
  }

  return (
    <div>
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
                  <td key={cell.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {educators.length === 0 && <div className="text-center py-12 text-gray-500">No educators found</div>}
      </div>

      <ConfirmDialog
        isOpen={showConfirm}
        title="Delete Educator"
        message="Are you sure you want to delete this educator?"
        onConfirm={handleDelete}
        onCancel={() => setShowConfirm(false)}
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
  );
}