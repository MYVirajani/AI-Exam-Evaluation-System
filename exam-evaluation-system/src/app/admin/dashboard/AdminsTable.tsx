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

interface Admin {
  user_id: string;
  first_name: string;
  last_name: string;
  title: string;
  email: string;
  phone_number: string;
}

export default function AdminsTable() {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editedAdmin, setEditedAdmin] = useState<Partial<Admin>>({});
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/admins")
      .then((res) => res.json())
      .then((data) => setAdmins(data.admins || []))
      .catch((err) => {
        console.error(err);
        toast.error("Failed to load admins");
      });
  }, []);

  const confirmDelete = (id: string) => {
    setDeleteId(id);
    setShowConfirm(true);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const res = await fetch(`/api/admin/admins/${deleteId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete admin");
      setAdmins((prev) => prev.filter((a) => a.user_id !== deleteId));
      toast.success("Admin deleted");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to delete admin");
    } finally {
      setShowConfirm(false);
      setDeleteId(null);
    }
  };

  const handleEdit = (admin: Admin) => {
    setEditingId(admin.user_id);
    setEditedAdmin(admin);
  };

  const handleSave = async () => {
    try {
      const res = await fetch(`/api/admin/admins/${editingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editedAdmin),
      });
      if (!res.ok) throw new Error("Failed to update admin");
      const updated = await res.json();
      setAdmins((prev) => prev.map((a) => (a.user_id === editingId ? updated.admin : a)));
      setEditingId(null);
      setEditedAdmin({});
      toast.success("Admin updated");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to update admin");
    }
  };

  const columns: ColumnDef<Admin>[] = [
    { header: "First Name", accessorKey: "first_name" },
    { header: "Last Name", accessorKey: "last_name" },
    { header: "Title", accessorKey: "title" },
    { header: "Email", accessorKey: "email" },
    { header: "Phone", accessorKey: "phone_number" },
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

  const table = useReactTable({ data: admins, columns, getCoreRowModel: getCoreRowModel() });

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id}>
                {hg.headers.map((h) => (
                  <th key={h.id} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
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
        {admins.length === 0 && <div className="text-center py-12 text-gray-500">No admins found</div>}
      </div>

      <ConfirmDialog
        isOpen={showConfirm}
        title="Delete Admin"
        message="Are you sure you want to delete this admin?"
        onConfirm={handleDelete}
        onCancel={() => setShowConfirm(false)}
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
  );
}
