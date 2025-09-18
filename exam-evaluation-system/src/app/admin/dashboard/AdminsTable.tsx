"use client";

import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  ColumnDef,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  SortingState,
  ColumnFiltersState,
} from "@tanstack/react-table";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import ConfirmDialog from "@/components/ConfimDialog";
import LoadingAnimation from "@/components/LoadingAnimation";
import { 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Filter,
  Download,
  UserPlus,
  MoreHorizontal
} from "lucide-react";

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
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  
  // Table state
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  useEffect(() => {
    setIsLoading(true);
    fetch("/api/admin/admins")
      .then((res) => res.json())
      .then((data) => setAdmins(data.admins || []))
      .catch((err) => {
        console.error(err);
        toast.error("Failed to load admins");
      }).finally(() => {
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

  const handleInputChange = (key: keyof Admin, value: string) => {
    setEditedAdmin(prev => ({ ...prev, [key]: value }));
  };

  // Export function to convert data to CSV
  const handleExport = async () => {
    try {
      setIsExporting(true);
      
      // Get current filtered and sorted data
      const currentData = table.getPrePaginationRowModel().rows.map(row => row.original);
      
      if (currentData.length === 0) {
        toast.error("No data to export");
        return;
      }

      // Create CSV content
      const headers = [
        "First Name",
        "Last Name", 
        "Title",
        "Email",
        "Phone Number"
      ];
      
      const csvContent = [
        headers.join(","),
        ...currentData.map(admin => [
          `"${admin.first_name || ''}"`,
          `"${admin.last_name || ''}"`,
          `"${admin.title || ''}"`,
          `"${admin.email || ''}"`,
          `"${admin.phone_number || ''}"`
        ].join(","))
      ].join("\n");

      // Create and download file
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `admins_export_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success(`Exported ${currentData.length} admins successfully`);
    } catch (error) {
      console.error("Export failed:", error);
      toast.error("Failed to export data");
    } finally {
      setIsExporting(false);
    }
  };

  const columns: ColumnDef<Admin>[] = [
    { 
      header: "First Name", 
      accessorKey: "first_name",
      cell: ({ row, getValue }) => (
        <div className="text-gray-900">
          {editingId === row.original.user_id ? (
            <input
              type="text"
              value={editedAdmin.first_name || ""}
              onChange={(e) => handleInputChange("first_name", e.target.value)}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
            />
          ) : (
            <span className="text-gray-900 font-medium">{getValue() as string}</span>
          )}
        </div>
      ),
    },
    { 
      header: "Last Name", 
      accessorKey: "last_name",
      cell: ({ row, getValue }) => (
        <div className="text-gray-900">
          {editingId === row.original.user_id ? (
            <input
              type="text"
              value={editedAdmin.last_name || ""}
              onChange={(e) => handleInputChange("last_name", e.target.value)}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
            />
          ) : (
            <span className="text-gray-900 font-medium">{getValue() as string}</span>
          )}
        </div>
      ),
    },
    { 
      header: "Title", 
      accessorKey: "title",
      cell: ({ row, getValue }) => (
        <div className="text-gray-900">
          {editingId === row.original.user_id ? (
            <input
              type="text"
              value={editedAdmin.title || ""}
              onChange={(e) => handleInputChange("title", e.target.value)}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
            />
          ) : (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
              {getValue() as string}
            </span>
          )}
        </div>
      ),
    },
    { 
      header: "Email", 
      accessorKey: "email",
      cell: ({ row, getValue }) => (
        <div className="text-gray-800">
          {editingId === row.original.user_id ? (
            <input
              type="email"
              value={editedAdmin.email || ""}
              onChange={(e) => handleInputChange("email", e.target.value)}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
            />
          ) : (
            <a href={`mailto:${getValue()}`} className="text-blue-600 hover:text-blue-800 transition-colors font-medium">
              {getValue() as string}
            </a>
          )}
        </div>
      ),
    },
    { 
      header: "Phone", 
      accessorKey: "phone_number",
      cell: ({ row, getValue }) => (
        <div className="text-gray-900">
          {editingId === row.original.user_id ? (
            <input
              type="tel"
              value={editedAdmin.phone_number || ""}
              onChange={(e) => handleInputChange("phone_number", e.target.value)}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
            />
          ) : (
            <span className="text-gray-900 font-medium">{getValue() as string}</span>
          )}
        </div>
      ),
    },
    // {
    //   header: "Actions",
    //   id: "actions",
    //   cell: ({ row }) => (
    //     <div className="flex items-center gap-2">
    //       {editingId === row.original.user_id ? (
    //         <>
    //           <button 
    //             onClick={handleSave} 
    //             className="inline-flex items-center px-3 py-1 text-xs font-medium text-white bg-green-600 rounded-md hover:bg-green-700 transition-colors"
    //           >
    //             Save
    //           </button>
    //           <button 
    //             onClick={() => {
    //               setEditingId(null);
    //               setEditedAdmin({});
    //             }} 
    //             className="inline-flex items-center px-3 py-1 text-xs font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
    //           >
    //             Cancel
    //           </button>
    //         </>
    //       ) : (
    //         <>
    //           <button 
    //             onClick={() => handleEdit(row.original)} 
    //             className="inline-flex items-center px-3 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded-md hover:bg-blue-200 transition-colors"
    //           >
    //             Edit
    //           </button>
    //           <button 
    //             onClick={() => confirmDelete(row.original.user_id)} 
    //             className="inline-flex items-center px-3 py-1 text-xs font-medium text-red-700 bg-red-100 rounded-md hover:bg-red-200 transition-colors"
    //           >
    //             Delete
    //           </button>
    //         </>
    //       )}
    //     </div>
    //   ),
    // },
  ];

  const table = useReactTable({ 
    data: admins, 
    columns, 
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    state: {
      sorting,
      columnFilters,
      globalFilter,
      pagination,
    },
  });

  if (isLoading) {
    return (
      <LoadingAnimation
        variant="spinner"
        size="lg"
        text="Loading admins..."
        color="blue"
        fullScreen={false}
        className="py-12"
      />
    );
  }

  const getSortIcon = (column: any) => {
    const sortDirection = column.getIsSorted();
    if (sortDirection === "asc") {
      return <ArrowUp className="w-4 h-4" />;
    } else if (sortDirection === "desc") {
      return <ArrowDown className="w-4 h-4" />;
    }
    return <ArrowUpDown className="w-4 h-4 opacity-50" />;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header with Search and Actions */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search admins..."
            value={globalFilter ?? ""}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 placeholder-gray-500 bg-white"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <button className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </button>
          <button 
            onClick={handleExport}
            disabled={isExporting || admins.length === 0}
            className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4 mr-2" />
            {isExporting ? "Exporting..." : "Export"}
          </button>
          {/* <button className="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
            <UserPlus className="w-4 h-4 mr-2" />
            Add Admin
          </button> */}
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <th 
                      key={header.id} 
                      className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider"
                    >
                      {header.isPlaceholder ? null : (
                        <div className="flex items-center gap-2">
                          <button
                            className={`flex items-center gap-1 hover:text-gray-900 transition-colors font-semibold ${
                              header.column.getCanSort() ? "cursor-pointer" : ""
                            }`}
                            onClick={header.column.getToggleSortingHandler()}
                          >
                            {flexRender(header.column.columnDef.header, header.getContext())}
                            {header.column.getCanSort() && getSortIcon(header.column)}
                          </button>
                        </div>
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                  {row.getVisibleCells().map(cell => (
                    <td key={cell.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {table.getRowModel().rows.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No admins found</h3>
            <p className="text-gray-500 mb-4">
              {globalFilter ? "Try adjusting your search criteria" : "Get started by adding your first admin"}
            </p>
            {!globalFilter && (
              <button className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
                <UserPlus className="w-4 h-4 mr-2" />
                Add Admin
              </button>
            )}
          </div>
        )}
      </div>

      {/* Pagination */}
      {table.getRowModel().rows.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2 py-4 bg-gray-50 border-t border-gray-200">
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <span>Show</span>
            <select
              value={table.getState().pagination.pageSize}
              onChange={e => table.setPageSize(Number(e.target.value))}
              className="border border-gray-300 rounded px-3 py-1 text-sm bg-white text-gray-900"
            >
              {[5, 10, 20, 50].map(pageSize => (
                <option key={pageSize} value={pageSize}>
                  {pageSize}
                </option>
              ))}
            </select>
            <span>entries</span>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-700 font-medium">
            <span>
              Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to{" "}
              {Math.min(
                (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
                table.getPrePaginationRowModel().rows.length
              )}{" "}
              of {table.getPrePaginationRowModel().rows.length} entries
              {globalFilter && ` (filtered from ${admins.length} total entries)`}
            </span>
          </div>

          
          <div className="flex items-center gap-2">
            <button
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
              className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors bg-white text-gray-700"
              title="First page"
            >
              <ChevronsLeft className="w-4 h-4" />
              <span className="hidden sm:inline">First</span>
            </button>
            <button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors bg-white text-gray-700"
              title="Previous page"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Previous</span>
            </button>
            
            <div className="flex items-center gap-1 mx-2">
              {Array.from({ length: Math.min(5, table.getPageCount()) }, (_, i) => {
                const pageIndex = table.getState().pagination.pageIndex;
                const totalPages = table.getPageCount();
                let displayPage: number;
                
                if (totalPages <= 5) {
                  displayPage = i;
                } else if (pageIndex < 3) {
                  displayPage = i;
                } else if (pageIndex > totalPages - 4) {
                  displayPage = totalPages - 5 + i;
                } else {
                  displayPage = pageIndex - 2 + i;
                }
                
                return (
                  <button
                    key={i}
                    onClick={() => table.setPageIndex(displayPage)}
                    className={`px-4 py-2 text-sm rounded-lg transition-colors font-medium min-w-[40px] ${
                      pageIndex === displayPage
                        ? "bg-blue-600 text-white shadow-sm ring-1 ring-blue-600"
                        : "text-gray-700 hover:bg-gray-100 bg-white border border-gray-300 hover:border-gray-400"
                    }`}
                    title={`Go to page ${displayPage + 1}`}
                  >
                    {displayPage + 1}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors bg-white text-gray-700"
              title="Next page"
            >
              <span className="hidden sm:inline">Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
              className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors bg-white text-gray-700"
              title="Last page"
            >
              <span className="hidden sm:inline">Last</span>
              <ChevronsRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={showConfirm}
        title="Delete Admin"
        message="Are you sure you want to delete this admin? This action cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setShowConfirm(false)}
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
  );
}