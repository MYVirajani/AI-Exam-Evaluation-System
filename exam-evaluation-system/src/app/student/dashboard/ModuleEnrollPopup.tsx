"use client";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useEffect, useState } from "react";
import toast from "react-hot-toast";
import Dropdown from "@/components/Dropdown";

interface EnrollModulePopupProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
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
  userId,
  onSuccess,
}) => {
  const [modules, setModules] = useState<ModuleOption[]>([]);
  const [selectedModuleCode, setSelectedModuleCode] = useState<string>("");
  const [enrollmentKey, setEnrollmentKey] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [loadingModules, setLoadingModules] = useState(false);
  const [showKey, setShowKey] = useState(false);

  // Fetch all modules when popup opens
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

  // Reset form when closing
  useEffect(() => {
    if (!isOpen) {
      setSelectedModuleCode("");
      setEnrollmentKey("");
      setShowKey(false);
    }
  }, [isOpen]);

  const handleEnroll = async () => {
    if (!selectedModuleCode || !enrollmentKey.trim()) {
      toast.error("Please select a module and enter the enrollment key");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/student/enroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          module_code: selectedModuleCode,
          enrollment_key: enrollmentKey,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Enrollment failed");

      toast.success("Enrolled successfully!");
      onClose();
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || "Failed to enroll");
    } finally {
      setSubmitting(false);
    }
  };

  // Prepare dropdown options
  const dropdownOptions = [
    "-- Select a Module --",
    ...modules.map((mod) => `${mod.module_code} - ${mod.module_name}`)
  ];

  const handleDropdownSelect = (option: string) => {
    if (option === "-- Select a Module --") {
      setSelectedModuleCode("");
    } else {
      const moduleCode = option.split(" - ")[0];
      setSelectedModuleCode(moduleCode);
    }
  };

  const getDisplayValue = () => {
    if (!selectedModuleCode) return "-- Select a Module --";
    const selectedModule = modules.find(mod => mod.module_code === selectedModuleCode);
    return selectedModule 
      ? `${selectedModule.module_code} - ${selectedModule.module_name}`
      : "-- Select a Module --";
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white shadow-2xl transition-all">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-900 to-blue-800 px-6 py-5">
                  <Dialog.Title className="text-xl font-bold text-white flex items-center">
                    <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    Enroll in a Module
                  </Dialog.Title>
                  <p className="mt-1 text-sm text-blue-100">
                    Select a module and enter the enrollment key provided by your instructor
                  </p>
                </div>

                {/* Content */}
                <div className="px-6 py-6 space-y-5">
                  {/* Module Selection */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                      <svg className="w-4 h-4 mr-2 text-blue-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Select Module
                    </label>
                    {loadingModules ? (
                      <div className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg bg-gray-50 animate-pulse">
                        <div className="flex items-center space-x-2">
                          <div className="w-5 h-5 border-2 border-blue-900 border-t-transparent rounded-full animate-spin"></div>
                          <span className="text-sm text-gray-500">Loading modules...</span>
                        </div>
                      </div>
                    ) : (
                      <Dropdown
                        options={dropdownOptions}
                        selectedOption={getDisplayValue()}
                        onSelect={handleDropdownSelect}
                        direction="bottom"
                      />
                    )}
                  </div>

                  {/* Enrollment Key */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                      <svg className="w-4 h-4 mr-2 text-blue-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                      </svg>
                      Enrollment Key
                    </label>
                    <div className="relative">
                      <input
                        type={showKey ? "text" : "password"}
                        value={enrollmentKey}
                        onChange={(e) => setEnrollmentKey(e.target.value)}
                        placeholder="Enter the enrollment key"
                        className="w-full px-4 py-3 pr-12 border-2 border-gray-300 rounded-lg text-gray-800 placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all"
                        disabled={submitting}
                      />
                      <button
                        type="button"
                        onClick={() => setShowKey(!showKey)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                        disabled={submitting}
                      >
                        {showKey ? (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        )}
                      </button>
                    </div>
                    <p className="mt-2 text-xs text-gray-500 flex items-start">
                      <svg className="w-4 h-4 mr-1 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                      The enrollment key is provided by your module instructor
                    </p>
                  </div>
                </div>

                {/* Footer */}
                <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3 border-t border-gray-200">
                  <button
                    onClick={onClose}
                    className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={submitting}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleEnroll}
                    className="px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-blue-900 to-blue-800 rounded-lg hover:from-blue-800 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                    disabled={submitting || !selectedModuleCode || !enrollmentKey.trim()}
                  >
                    {submitting ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Enrolling...
                      </span>
                    ) : (
                      <span className="flex items-center">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Enroll Now
                      </span>
                    )}
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default EnrollModulePopup;