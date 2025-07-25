"use client";
import { Dialog } from "@headlessui/react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

interface EnrollModulePopupProps {
  isOpen: boolean;
  onClose: () => void;
  registrationNumber: string;
  onSuccess: () => void;
}

interface ModuleOption {
  module_id: string;
  module_code: string;
  module_name: string;
}

const EnrollModulePopup: React.FC<EnrollModulePopupProps> = ({
  isOpen,
  onClose,
  registrationNumber,
  onSuccess,
}) => {
  const [modules, setModules] = useState<ModuleOption[]>([]);
  const [selectedModuleId, setSelectedModuleId] = useState<string>("");
  const [enrollmentKey, setEnrollmentKey] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [loadingModules, setLoadingModules] = useState(false);

  // Fetch all modules
  useEffect(() => {
    if (!isOpen) return;

    const fetchModules = async () => {
      setLoadingModules(true);
      try {
        const res = await fetch("/api/student/modules");
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to load modules");
        setModules(data.modules || []);
      } catch (error: any) {
        console.error("Module fetch error:", error);
        toast.error(error.message || "Could not fetch modules");
      } finally {
        setLoadingModules(false);
      }
    };

    fetchModules();
  }, [isOpen]);

  const handleEnroll = async () => {
    if (!selectedModuleId || !enrollmentKey.trim()) {
      toast.error("Please select a module and enter the enrollment key");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/student/enroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          registration_number: registrationNumber,
          module_id: selectedModuleId,
          enrollment_key: enrollmentKey,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Enrollment failed");

      toast.success("Enrolled successfully!");
      onClose();
      setEnrollmentKey("");
      setSelectedModuleId("");
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || "Failed to enroll");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/40" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="bg-white p-6 rounded-lg w-full max-w-md">
          <Dialog.Title className="text-lg font-semibold text-blue-900 mb-4">
            Enroll in a Module
          </Dialog.Title>

          <label className="block text-sm text-gray-700 mb-1">Select Module</label>
          <select
            value={selectedModuleId}
            onChange={(e) => setSelectedModuleId(e.target.value)}
            disabled={submitting || loadingModules}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-800 mb-4"
          >
            <option value="">-- Select a Module --</option>
            {modules.map((mod) => (
              <option key={mod.module_id} value={mod.module_id}>
                {mod.module_code} - {mod.module_name}
              </option>
            ))}
          </select>

          <label className="block text-sm text-gray-700 mb-1">Enrollment Key</label>
          <input
            type="text"
            value={enrollmentKey}
            onChange={(e) => setEnrollmentKey(e.target.value)}
            placeholder="Enter enrollment key"
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-800 mb-4"
            disabled={submitting}
          />

          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:underline"
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              onClick={handleEnroll}
              className="px-4 py-2 bg-blue-900 text-white rounded-md disabled:opacity-50"
              disabled={submitting}
            >
              {submitting ? "Enrolling..." : "Enroll"}
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default EnrollModulePopup;
