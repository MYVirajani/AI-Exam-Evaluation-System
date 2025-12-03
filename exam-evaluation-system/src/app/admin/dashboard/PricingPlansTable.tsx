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
import ConfirmDialog from "@/components/ConfirmDialog";
import AddPricingPlanModal from "./AddPricingPlanModal";
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
  Plus,
  RefreshCcw,
  DollarSign,
} from "lucide-react";

interface EvaluationModel {
  id: string;
  model_name: string;
  description?: string;
  created_on?: string;
}

interface PricingPlan {
  id: string;
  name: string;
  billing_period: string;
  price: number;
  description: string;
  features: string[];
  model_id: string;
  evaluation_model: EvaluationModel;
  subscriptionCount: number;
  stripe_product_id?: string;
  stripe_price_id?: string;
  created_on?: string;
}

// Unified labels for all billing period options
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

  const fetchPlans = async () => {
    try {
      const res = await fetch("/api/admin/pricing-plans");
      if (!res.ok) throw new Error("Failed to fetch plans");
      const data = await res.json();
      
      // Transform the data to match our interface
      const transformedPlans = (data.plans || []).map((plan: any) => ({
        ...plan,
        subscriptionCount: plan.subscriptionCount ?? 0,
      }));
      
      setPlans(transformedPlans);
    } catch (error) {
      console.error("Error fetching plans:", error);
      toast.error("Failed to load pricing plans");
    }
  };

  useEffect(() => {
    setIsLoading(true);
    fetchPlans().finally(() => {
      setIsLoading(false);
    });
  }, []);

  const handleSave = (plan: PricingPlan, isEdit: boolean) => {
    if (isEdit) {
      setPlans((prev) =>
        prev.map((p) => (p.id === plan.id ? plan : p))
      );
      toast.success("Plan updated successfully");
    } else {
      setPlans((prev) => [plan, ...prev]);
      toast.success("Plan added successfully");
    }
    setShowModal(false);
    setEditingPlan(null);
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
      if (!res.ok) throw new Error("Failed to delete plan");
      setPlans((prev) => prev.filter((p) => p.id !== deleteId));
      toast.success("Deleted successfully");
    } catch (error) {
      console.error("Error deleting plan:", error);
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
      if (!res.ok) throw new Error("Failed to sync");
      toast.success("Plans synced from Stripe!");
      await fetchPlans();
    } catch (error) {
      console.error("Error syncing plans:", error);
      toast.error("Failed to sync from Stripe");
    } finally {
      setIsSyncing(false);
    }
  };

  // Export function to convert data to CSV
  const handleExport = async () => {
    try {
      setIsExporting(true);

      // Get current filtered and sorted data
      const currentData = table
        .getPrePaginationRowModel()
        .rows.map((row) => row.original);

      if (currentData.length === 0) {
        toast.error("No data to export");
        return;
      }

      // Create CSV content
      const headers = [
        "Name",
        "Billing Period",
        "Price (USD)",
        "Evaluation Model",
        "Description",
        "Features",
        "Subscriptions",
      ];

      const csvContent = [
        headers.join(","),
        ...currentData.map((plan) =>
          [
            `"${plan.name || ""}"`,
            `"${
              BILLING_PERIOD_LABELS[plan.billing_period] ?? plan.billing_period
            }"`,
            plan.price || 0,
            `"${plan.evaluation_model?.model_name || ""}"`,
            `"${plan.description || ""}"`,
            `"${plan.features?.join("; ") || ""}"`,
            plan.subscriptionCount || 0,
          ].join(",")
        ),
      ].join("\n");

      // Create and download file
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `pricing_plans_export_${new Date().toISOString().split("T")[0]}.csv`
      );
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success(
        `Exported ${currentData.length} pricing plans successfully`
      );
    } catch (error) {
      console.error("Export failed:", error);
      toast.error("Failed to export data");
    } finally {
      setIsExporting(false);
    }
  };

  const columns: ColumnDef<PricingPlan>[] = [
    {
      header: "Name",
      accessorKey: "name",
      cell: ({ getValue }) => (
        <div className="font-semibold text-gray-900">
          {getValue() as string}
        </div>
      ),
    },
    {
      header: "Billing Period",
      accessorKey: "billing_period",
      cell: ({ row }) => (
        <div className="text-gray-900">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
            {BILLING_PERIOD_LABELS[row.original.billing_period] ??
              row.original.billing_period}
          </span>
        </div>
      ),
    },
    {
      header: "Price (USD)",
      accessorKey: "price",
      cell: ({ getValue }) => (
        <div className="text-gray-900 font-semibold">
          <div className="flex items-center">
            <DollarSign className="w-4 h-4 mr-1 text-green-600" />
            {Number(getValue()).toFixed(2)}
          </div>
        </div>
      ),
    },
    {
      header: "Evaluation Model",
      accessorKey: "evaluation_model.model_name",
      cell: ({ row }) => (
        <div className="text-gray-900">
          <span
            title={row.original.evaluation_model?.description || ""}
            className="text-blue-600 hover:text-blue-800 underline decoration-dotted cursor-help transition-colors font-medium"
          >
            {row.original.evaluation_model?.model_name || "N/A"}
          </span>
        </div>
      ),
    },
    {
      header: "Features",
      cell: ({ row }) => (
        <div className="max-w-xs">
          {row.original.features?.length ? (
            <div className="text-sm">
              <ul className="list-disc list-inside text-gray-700 space-y-1">
                {row.original.features.map((f, i) => (
                  <li key={i} className="break-words" title={f}>
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <span className="text-gray-500 italic">No features</span>
          )}
        </div>
      ),
    },
    {
      header: "Description",
      accessorKey: "description",
      cell: ({ getValue }) => (
        <div className="max-w-xs">
          <span
            className="text-gray-700 text-sm truncate block"
            title={getValue() as string}
          >
            {(getValue() as string) || "No description"}
          </span>
        </div>
      ),
    },
    {
      header: "Subscriptions",
      accessorKey: "subscriptionCount",
      cell: ({ row }) => (
        <div className="text-center">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            {row.original.subscriptionCount ?? 0}
          </span>
        </div>
      ),
    },
    {
      header: "Actions",
      id: "actions",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setEditingPlan(row.original);
              setShowModal(true);
            }}
            className="inline-flex items-center px-3 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded-md hover:bg-blue-200 transition-colors"
          >
            Edit
          </button>
          <button
            onClick={() => confirmDelete(row.original.id)}
            disabled={row.original.subscriptionCount > 0}
            className={`inline-flex items-center px-3 py-1 text-xs font-medium rounded-md transition-colors ${
              row.original.subscriptionCount > 0
                ? "text-gray-500 bg-gray-100 cursor-not-allowed opacity-50"
                : "text-red-700 bg-red-100 hover:bg-red-200"
            }`}
            title={
              row.original.subscriptionCount > 0
                ? "Cannot delete plan with active subscriptions"
                : "Delete plan"
            }
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

  // Show loading animation while data is being fetched
  if (isLoading) {
    return (
      <LoadingAnimation
        variant="spinner"
        size="md"
        text="Loading pricing plans..."
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
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Pricing Plans
          </h3>
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search pricing plans..."
              value={globalFilter ?? ""}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 placeholder-gray-500 bg-white"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </button>
          <button
            onClick={handleExport}
            disabled={isExporting || plans.length === 0}
            className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4 mr-2" />
            {isExporting ? "Exporting..." : "Export"}
          </button>
          <button
            onClick={handleSync}
            disabled={isSyncing}
            className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCcw
              className={`w-4 h-4 mr-2 ${isSyncing ? "animate-spin" : ""}`}
            />
            {isSyncing ? "Syncing..." : "Sync from Stripe"}
          </button>
          <button
            onClick={() => {
              setEditingPlan(null);
              setShowModal(true);
            }}
            className="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Pricing Plan
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
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
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                            {header.column.getCanSort() &&
                              getSortIcon(header.column)}
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
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
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
              <DollarSign className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No pricing plans found
            </h3>
            <p className="text-gray-500 mb-4">
              {globalFilter
                ? "Try adjusting your search criteria"
                : "Get started by adding your first pricing plan"}
            </p>
            {!globalFilter && (
              <button
                onClick={() => {
                  setEditingPlan(null);
                  setShowModal(true);
                }}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Pricing Plan
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
              onChange={(e) => table.setPageSize(Number(e.target.value))}
              className="border border-gray-300 rounded px-3 py-1 text-sm bg-white text-gray-900"
            >
              {[5, 10, 20, 50].map((pageSize) => (
                <option key={pageSize} value={pageSize}>
                  {pageSize}
                </option>
              ))}
            </select>
            <span>entries</span>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-700 font-medium">
            <span>
              Showing{" "}
              {table.getState().pagination.pageIndex *
                table.getState().pagination.pageSize +
                1}{" "}
              to{" "}
              {Math.min(
                (table.getState().pagination.pageIndex + 1) *
                  table.getState().pagination.pageSize,
                table.getPrePaginationRowModel().rows.length
              )}{" "}
              of {table.getPrePaginationRowModel().rows.length} entries
              {globalFilter && ` (filtered from ${plans.length} total entries)`}
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
              {Array.from(
                { length: Math.min(5, table.getPageCount()) },
                (_, i) => {
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
                }
              )}
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

      <AddPricingPlanModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingPlan(null);
        }}
        onSave={handleSave}
        initialData={editingPlan}
      />

      <ConfirmDialog
        isOpen={showConfirm}
        title="Delete Pricing Plan"
        message="Are you sure you want to delete this pricing plan? This action cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setShowConfirm(false)}
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
  );
}