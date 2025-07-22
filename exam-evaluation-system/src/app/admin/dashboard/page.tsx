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

interface User {
  user_id: string;
  first_name: string;
  last_name: string;
  title: string;
  email: string;
  phone_number: string;
  address?: string;
  country?: string;
  city?: string;
  profile_image_url?: string;
  username: string;
  role: string;
}

export default function AdminDashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editedUser, setEditedUser] = useState<Partial<User>>({});
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/users")
      .then((res) => res.json())
      .then((data) => setUsers(data.users || []))
      .catch((err) => {
        console.error("Failed to load users:", err);
        toast.error("Failed to load users");
      });
  }, []);

  const confirmDeleteUser = (userId: string) => {
    setDeleteUserId(userId);
    setShowConfirm(true);
  };

  const handleDelete = async () => {
    if (!deleteUserId) return;

    try {
      const res = await fetch(`/api/admin/users/${deleteUserId}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setUsers((prev) => prev.filter((u) => u.user_id !== deleteUserId));
      toast.success("User deleted successfully");
    } catch (err: any) {
      console.error("Delete error:", err);
      toast.error(err.message || "Failed to delete user");
    } finally {
      setShowConfirm(false);
      setDeleteUserId(null);
    }
  };

  const handleEdit = (user: User) => {
    setEditingId(user.user_id);
    setEditedUser(user);
  };

  const handleSave = async () => {
    try {
      const res = await fetch(`/api/admin/users/${editingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editedUser),
      });

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || "Failed to update user");
      }

      const json = await res.json();
      setUsers((prev) =>
        prev.map((u) => (u.user_id === editingId ? json.user : u))
      );
      toast.success("User updated successfully");
      setEditingId(null);
      setEditedUser({});
    } catch (err: any) {
      console.error("Update error:", err);
      toast.error(err.message || "Failed to update user");
    }
  };

  const columns: ColumnDef<User>[] = [
    {
      header: "",
      accessorKey: "profile_image_url",
      cell: ({ row }) => {
        const imageUrl =
          row.original.profile_image_url || "/images/user_profile.jpg";
        return (
          <div className="flex justify-center">
            <img
              src={imageUrl}
              alt="Profile"
              className="w-10 h-10 rounded-full object-cover"
            />
          </div>
        );
      },
    },

    {
      header: "Role",
      accessorKey: "role",
      cell: ({ row }) => <span>{row.original.role}</span>,
    },
    {
      header: "First Name",
      accessorKey: "first_name",
      cell: ({ row }) =>
        editingId === row.original.user_id ? (
          <input
            value={editedUser.first_name || ""}
            onChange={(e) =>
              setEditedUser((p) => ({ ...p, first_name: e.target.value }))
            }
            className="border px-2 py-1 text-gray-800"
          />
        ) : (
          <span>{row.original.first_name}</span>
        ),
    },
    {
      header: "Last Name",
      accessorKey: "last_name",
      cell: ({ row }) =>
        editingId === row.original.user_id ? (
          <input
            value={editedUser.last_name || ""}
            onChange={(e) =>
              setEditedUser((p) => ({ ...p, last_name: e.target.value }))
            }
            className="border px-2 py-1 text-gray-800"
          />
        ) : (
          <span>{row.original.last_name}</span>
        ),
    },
    {
      header: "Title",
      accessorKey: "title",
      cell: ({ row }) =>
        editingId === row.original.user_id ? (
          <input
            value={editedUser.title || ""}
            onChange={(e) =>
              setEditedUser((p) => ({ ...p, title: e.target.value }))
            }
            className="border px-2 py-1 text-gray-800"
          />
        ) : (
          <span>{row.original.title}</span>
        ),
    },
    {
      header: "Email",
      accessorKey: "email",
      cell: ({ row }) =>
        editingId === row.original.user_id ? (
          <input
            value={editedUser.email || ""}
            onChange={(e) =>
              setEditedUser((p) => ({ ...p, email: e.target.value }))
            }
            className="border px-2 py-1 text-gray-800"
          />
        ) : (
          <span>{row.original.email}</span>
        ),
    },
    {
      header: "Phone Number",
      accessorKey: "phone_number",
      cell: ({ row }) =>
        editingId === row.original.user_id ? (
          <input
            value={editedUser.phone_number || ""}
            onChange={(e) =>
              setEditedUser((p) => ({ ...p, phone_number: e.target.value }))
            }
            className="border px-2 py-1 text-gray-800"
          />
        ) : (
          <span>{row.original.phone_number}</span>
        ),
    },
    {
      header: "Address",
      accessorKey: "address",
      cell: ({ row }) => <span>{row.original.address || "-"}</span>,
    },
    {
      header: "Country",
      accessorKey: "country",
      cell: ({ row }) => <span>{row.original.country || "-"}</span>,
    },
    {
      header: "City",
      accessorKey: "city",
      cell: ({ row }) => <span>{row.original.city || "-"}</span>,
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
              onClick={() => confirmDeleteUser(row.original.user_id)}
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

      <div className="overflow-x-auto">
        <table className="min-w-[1600px] border border-gray-300">
          <thead className="bg-gray-200">
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id}>
                {hg.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-3 py-2 border border-gray-300 text-left text-gray-800"
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
              <tr key={row.id} className="hover:bg-gray-50">
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    className="px-3 py-2 border border-gray-300"
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ConfirmDialog
        isOpen={showConfirm}
        title="Delete User"
        message="Are you sure you want to delete this user?"
        onConfirm={handleDelete}
        onCancel={() => setShowConfirm(false)}
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
  );
}
