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

interface Student {
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  registration_number: string;
  education_institute: string;
  enrollment_count: number;
}

export default function StudentsTable() {
  const [students, setStudents] = useState<Student[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editedStudent, setEditedStudent] = useState<Partial<Student>>({});
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/students")
      .then(res => res.json())
      .then(data => setStudents(data.students || []))
      .catch(err => {
        console.error(err);
        toast.error("Failed to load students");
      });
  }, []);

  const confirmDelete = (id: string) => {
    setDeleteId(id);
    setShowConfirm(true);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const res = await fetch(`/api/admin/students/${deleteId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete student");
      setStudents(prev => prev.filter(s => s.user_id !== deleteId));
      toast.success("Student deleted");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to delete student");
    } finally {
      setShowConfirm(false);
      setDeleteId(null);
    }
  };

  const handleEdit = (student: Student) => {
    setEditingId(student.user_id);
    setEditedStudent(student);
  };

  const handleSave = async () => {
    try {
      const res = await fetch(`/api/admin/students/${editingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editedStudent),
      });
      if (!res.ok) throw new Error("Failed to update student");
      const updated = await res.json();
      setStudents(prev => prev.map(s => s.user_id === editingId ? updated.student : s));
      setEditingId(null);
      setEditedStudent({});
      toast.success("Student updated");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to update student");
    }
  };

  const columns: ColumnDef<Student>[] = [
    { header: "Reg. No.", accessorKey: "registration_number" },
    { header: "First Name", accessorKey: "first_name" },
    { header: "Last Name", accessorKey: "last_name" },
    { header: "Email", accessorKey: "email" },
    { header: "Phone", accessorKey: "phone_number" },
    { header: "Institute", accessorKey: "education_institute" },
    { header: "Enrollments", accessorKey: "enrollment_count" },
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

  const table = useReactTable({ data: students, columns, getCoreRowModel: getCoreRowModel() });

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            {table.getHeaderGroups().map(hg => (
              <tr key={hg.id}>
                {hg.headers.map(h => (
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
                {row.getVisibleCells().map(cell => (
                  <td key={cell.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {students.length === 0 && <div className="text-center py-12 text-gray-500">No students found</div>}
      </div>

      <ConfirmDialog isOpen={showConfirm} title="Delete Student" message="Are you sure?" onConfirm={handleDelete} onCancel={() => setShowConfirm(false)} confirmText="Delete" cancelText="Cancel" />
    </div>
  );
}
