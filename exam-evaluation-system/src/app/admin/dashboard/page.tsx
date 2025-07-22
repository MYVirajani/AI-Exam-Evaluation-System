"use client";

import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  ColumnDef,
} from "@tanstack/react-table";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

interface User {
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  username: string;
  role: string;
}

export default function AdminDashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editedUser, setEditedUser] = useState<Partial<User>>({});

  useEffect(() => {
    fetch("/api/admin/users")
      .then((res) => res.json())
      .then((data) => setUsers(data.users || []))
      .catch((err) => {
        console.error("Failed to load users:", err);
        toast.error("Failed to load users");
      });
  }, []);

  const handleDelete = async (userId: string) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setUsers((prev) => prev.filter((u) => u.user_id !== userId));
      toast.success("User deleted successfully");
    } catch (err: any) {
      toast.error(err.message || "Failed to delete user");
    }
  };

  const handleEdit = (user: User) => {
    setEditingId(user.user_id);
    setEditedUser(user);
  };

  const handleSave = async () => {
    try {
      const res = await fetch(`/api/admin/users/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editedUser),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setUsers((prev) =>
        prev.map((u) => (u.user_id === editingId ? json.user : u))
      );
      toast.success("User updated successfully");
      setEditingId(null);
      setEditedUser({});
    } catch (err: any) {
      toast.error(err.message || "Failed to update user");
    }
  };

  const columns: ColumnDef<User>[] = [
    {
      header: "First Name",
      accessorKey: "first_name",
      cell: ({ row }) =>
        editingId === row.original.user_id ? (
          <input
            value={editedUser.first_name || ""}
            onChange={(e) => setEditedUser((p) => ({ ...p, first_name: e.target.value }))}
            className="border px-2 py-1 text-gray-800"
          />
        ) : (
          <span className="text-gray-900">{row.original.first_name}</span>
        ),
    },
    {
      header: "Last Name",
      accessorKey: "last_name",
      cell: ({ row }) =>
        editingId === row.original.user_id ? (
          <input
            value={editedUser.last_name || ""}
            onChange={(e) => setEditedUser((p) => ({ ...p, last_name: e.target.value }))}
            className="border px-2 py-1 text-gray-800"
          />
        ) : (
          <span className="text-gray-900">{row.original.last_name}</span>
        ),
    },
    {
      header: "Username",
      accessorKey: "username",
      cell: ({ row }) => <span className="text-gray-900">{row.original.username}</span>,
    },
    {
      header: "Email",
      accessorKey: "email",
      cell: ({ row }) =>
        editingId === row.original.user_id ? (
          <input
            value={editedUser.email || ""}
            onChange={(e) => setEditedUser((p) => ({ ...p, email: e.target.value }))}
            className="border px-2 py-1 text-gray-800"
          />
        ) : (
          <span className="text-gray-900">{row.original.email}</span>
        ),
    },
    {
      header: "Role",
      accessorKey: "role",
      cell: ({ row }) => <span className="text-gray-900">{row.original.role}</span>,
    },
    {
      header: "Actions",
      cell: ({ row }) => {
        const isEditing = row.original.user_id === editingId;
        return (
          <div className="flex gap-2">
            {isEditing ? (
              <>
                <button
                  className="text-green-600 hover:underline"
                  onClick={handleSave}
                >
                  Save
                </button>
                <button
                  className="text-gray-600 hover:underline"
                  onClick={() => setEditingId(null)}
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                className="text-blue-600 hover:underline"
                onClick={() => handleEdit(row.original)}
              >
                Edit
              </button>
            )}
            <button
              className="text-red-600 hover:underline"
              onClick={() => handleDelete(row.original.user_id)}
            >
              Delete
            </button>
          </div>
        );
      },
    },
  ];

  const table = useReactTable({
    data: users,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="p-4 bg-white text-gray-900 min-h-screen">
      <h2 className="text-2xl font-bold mb-4">User Management</h2>
      <table className="w-full border border-gray-300">
        <thead className="bg-gray-200">
          {table.getHeaderGroups().map((hg) => (
            <tr key={hg.id}>
              {hg.headers.map((header) => (
                <th
                  key={header.id}
                  className="px-3 py-2 border border-gray-300 text-left text-gray-800"
                >
                  {flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id} className="hover:bg-gray-50">
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="px-3 py-2 border border-gray-300">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
