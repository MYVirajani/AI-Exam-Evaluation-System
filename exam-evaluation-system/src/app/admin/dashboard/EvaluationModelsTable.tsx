"use client";

import { useState, useEffect } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  ColumnDef,
  getSortedRowModel,
  getFilteredRowModel,
  SortingState,
  ColumnFiltersState,
} from "@tanstack/react-table";
import toast from "react-hot-toast";
import AddModelModal from "./AddModelModal";
import ConfirmDialog from "@/components/ConfirmDialog";
import LoadingAnimation from "@/components/LoadingAnimation";
import {
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Filter,
  Download,
  Plus,
  Layers,
} from "lucide-react";
import {
  getProviderLabel,
  getChatModelLabel,
  getEmbeddingModelLabel,
  type ProviderValue
} from "@/config/models.config";

type PricingPlan = {
  pricing_plan_id: string;
  name: string;
};

type ExamEvaluationModel = {
  model_id: string;
  model_name: string;
  provider: string;
  chat_model: string | null;
  temperature: number;
  embedding_model: string;
  description: string | null;
  pricing_plans: PricingPlan[];
};

export default function ExamEvaluationModelsTable() {
  const [models, setModels] = useState<ExamEvaluationModel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [editingModel, setEditingModel] = useState<ExamEvaluationModel | null>(
    null
  );
  const [showModal, setShowModal] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Table state
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  // Fetch models including pricing plans
  const fetchModels = async () => {
    try {
      const res = await fetch("/api/admin/evaluation-models");
      const data = await res.json();
      setModels(data);
    } catch (err) {
      console.error("Failed to fetch models", err);
      toast.error("Failed to load evaluation models");
    }
  };

  useEffect(() => {
    setIsLoading(true);
    fetchModels().finally(() => {
      setIsLoading(false);
    });
  }, []);

  const confirmDelete = (id: string) => {
    setDeleteId(id);
    setShowConfirm(true);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/evaluation-models/${deleteId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error();
      setModels(models.filter((m) => m.model_id !== deleteId));
      toast.success("Model deleted successfully");
    } catch (err) {
      console.error("Delete failed", err);
      toast.error("Failed to delete model");
    } finally {
      setIsDeleting(false);
      setShowConfirm(false);
      setDeleteId(null);
    }
  };

  const handleSave = async (model: {
    model_name: string;
    provider: string;
    chat_model?: string;
    temperature?: number;
    embedding_model: string;
    description?: string;
  }) => {
    try {
      if (editingModel) {
        // Update existing model
        const res = await fetch(
          `/api/admin/evaluation-models/${editingModel.model_id}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(model),
          }
        );
        const updated = await res.json();
        setModels(
          models.map((m) =>
            m.model_id === editingModel.model_id ? updated : m
          )
        );
        toast.success("Model updated successfully");
      } else {
        // Create new model
        const res = await fetch("/api/admin/evaluation-models", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(model),
        });
        
        if (!res.ok) {
          const error = await res.json();
          throw new Error(error.error || "Failed to create model");
        }
        
        const newModel = await res.json();
        setModels([...models, newModel]);
        toast.success("Model added successfully");
      }
    } catch (err) {
      console.error("Save failed", err);
      toast.error(
        err instanceof Error ? err.message : 
        (editingModel ? "Failed to update model" : "Failed to add model")
      );
    } finally {
      setShowModal(false);
      setEditingModel(null);
    }
  };

  // Export function to convert data to CSV
  const handleExport = async () => {
    try {
      setIsExporting(true);

      const currentData = table
        .getCoreRowModel()
        .rows.map((row) => row.original);

      if (currentData.length === 0) {
        toast.error("No data to export");
        return;
      }

      const headers = [
        "Model Name",
        "Provider",
        "Chat Model",
        "Temperature",
        "Embedding Model",
        "Description",
        "Pricing Plans Count",
        "Pricing Plans",
      ];

      const csvContent = [
        headers.join(","),
        ...currentData.map((model) =>
          [
            `"${model.model_name || ""}"`,
            `"${getProviderLabel(model.provider as ProviderValue) || ""}"`,
            `"${model.chat_model ? getChatModelLabel(model.chat_model) : ""}"`,
            model.temperature,
            `"${getEmbeddingModelLabel(model.embedding_model) || ""}"`,
            `"${model.description || ""}"`,
            model.pricing_plans?.length || 0,
            `"${model.pricing_plans?.map((p) => p.name).join("; ") || ""}"`,
          ].join(",")
        ),
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `evaluation_models_export_${new Date().toISOString().split("T")[0]}.csv`
      );
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success(
        `Exported ${currentData.length} evaluation models successfully`
      );
    } catch (error) {
      console.error("Export failed:", error);
      toast.error("Failed to export data");
    } finally {
      setIsExporting(false);
    }
  };

  const columns: ColumnDef<ExamEvaluationModel>[] = [
    {
      header: "Model Name",
      accessorKey: "model_name",
      cell: ({ getValue }) => (
        <div className="font-semibold text-gray-900">
          {getValue() as string}
        </div>
      ),
    },
    {
      header: "Provider",
      accessorKey: "provider",
      cell: ({ getValue }) => {
        const value = getValue() as ProviderValue;
        return (
          <div className="text-sm text-gray-700">{getProviderLabel(value)}</div>
        );
      },
    },
    {
      header: "Chat Model",
      accessorKey: "chat_model",
      cell: ({ getValue }) => {
        const value = getValue() as string | null;
        return (
          <div className="text-sm text-gray-700">
            {value ? getChatModelLabel(value) : <span className="text-gray-500 italic">Not specified</span>}
          </div>
        );
      },
    },
    {
      header: "Temperature",
      accessorKey: "temperature",
      cell: ({ getValue }) => (
        <div className="text-sm text-gray-700">{getValue() as number}</div>
      ),
    },
    {
      header: "Embedding Model",
      accessorKey: "embedding_model",
      cell: ({ getValue }) => {
        const value = getValue() as string;
        return (
          <div className="text-sm text-gray-700 max-w-xs truncate" title={getEmbeddingModelLabel(value)}>
            {getEmbeddingModelLabel(value)}
          </div>
        );
      },
    },
    {
      header: "Description",
      accessorKey: "description",
      cell: ({ getValue }) => (
        <div className="max-w-xs">
          <span
            className="text-gray-700 text-sm truncate block"
            title={(getValue() as string) || ""}
          >
            {(getValue() as string) || (
              <span className="text-gray-500 italic">No description</span>
            )}
          </span>
        </div>
      ),
    },
    {
      header: "Pricing Plans",
      id: "pricingPlans",
      cell: ({ row }) => {
        const plans = row.original.pricing_plans || [];
        return (
          <div className="max-w-sm">
            {plans.length > 0 ? (
              <div className="space-y-1">
                <div className="text-sm font-medium text-gray-900 mb-2">
                  {plans.length} plan{plans.length !== 1 ? "s" : ""}
                </div>
                <div className="flex flex-wrap gap-1">
                  {plans.map((plan) => (
                    <span
                      key={plan.pricing_plan_id}
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                      title={plan.name}
                    >
                      {plan.name.length > 15
                        ? `${plan.name.substring(0, 15)}...`
                        : plan.name}
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <span className="text-gray-500 italic">No pricing plans</span>
            )}
          </div>
        );
      },
    },
    {
      header: "Actions",
      id: "actions",
      cell: ({ row }) => {
        const hasPlans = row.original.pricing_plans?.length > 0;
        return (
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setEditingModel(row.original);
                setShowModal(true);
              }}
              className="inline-flex items-center px-3 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded-md hover:bg-blue-200 transition-colors"
            >
              Edit
            </button>
            <button
              onClick={() => confirmDelete(row.original.model_id)}
              disabled={hasPlans}
              className={`inline-flex items-center px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                hasPlans
                  ? "text-gray-500 bg-gray-100 cursor-not-allowed opacity-50"
                  : "text-red-700 bg-red-100 hover:bg-red-200"
              }`}
              title={
                hasPlans
                  ? "Cannot delete model with associated pricing plans"
                  : "Delete model"
              }
            >
              Delete
            </button>
          </div>
        );
      },
    },
  ];

  const table = useReactTable({
    data: models,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    state: {
      sorting,
      columnFilters,
      globalFilter,
    },
  });

  if (isLoading) {
    return (
      <LoadingAnimation
        variant="spinner"
        size="md"
        text="Loading evaluation models..."
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
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Exam Evaluation Models
          </h3>
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search evaluation models..."
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
            disabled={isExporting || models.length === 0}
            className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4 mr-2" />
            {isExporting ? "Exporting..." : "Export"}
          </button>
          <button
            onClick={() => {
              setEditingModel(null);
              setShowModal(true);
            }}
            className="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Model
          </button>
        </div>
      </div>

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

        {table.getRowModel().rows.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Layers className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No evaluation models found
            </h3>
            <p className="text-gray-500 mb-4">
              {globalFilter
                ? "Try adjusting your search criteria"
                : "Get started by adding your first evaluation model"}
            </p>
            {!globalFilter && (
              <button
                onClick={() => {
                  setEditingModel(null);
                  setShowModal(true);
                }}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Model
              </button>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between text-sm text-gray-700 bg-gray-50 px-4 py-3 rounded-lg">
        <div>
          Showing {table.getRowModel().rows.length} of {models.length}{" "}
          evaluation models
          {globalFilter && ` (filtered)`}
        </div>
        <div>Total Models: {models.length}</div>
      </div>

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
                model_name: editingModel.model_name,
                provider: editingModel.provider,
                chat_model: editingModel.chat_model || undefined,
                temperature: editingModel.temperature,
                embedding_model: editingModel.embedding_model,
                description: editingModel.description || undefined,
              }
            : undefined
        }
      />

      <ConfirmDialog
        isOpen={showConfirm}
        title="Delete Evaluation Model"
        message="Are you sure you want to delete this evaluation model? This action cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setShowConfirm(false)}
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
        loading={isDeleting}
      />
    </div>
  );
}