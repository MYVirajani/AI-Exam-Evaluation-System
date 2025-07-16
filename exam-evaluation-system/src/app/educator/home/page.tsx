"use client";
import React, { useRef, useState } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import EducatorEventCard from "./EducatorEventCard";
import EducatorModuleCard from "./EducatorModuleCard";
import ModuleCreationForm, { ModuleFormData } from "./ModuleCreationForm";
import { Toaster } from "react-hot-toast";

const upcomingEvents = [
  {
    id: 1,
    title: "Assignment 1",
    module: "EE 7260 Advanced Artificial Intelligence",
    uploads: "03/211",
    date: "1st of June 2025 11.59 PM",
    label: "Due on:",
  },
  {
    id: 2,
    title: "Quiz 2",
    module: "EE6350 Artificial Intelligence",
    uploads: "00/140",
    date: "10th of June 2025 8.30 PM",
    label: "Scheduled on:",
  },
  {
    id: 3,
    title: "Mid Exam",
    module: "EE6350 Artificial Intelligence",
    uploads: "00/140",
    date: "04th of July 2025 8.30 PM",
    label: "Scheduled on:",
  },
];

const createdModules = [
  {
    id: 1,
    title: "EE 7260 Advanced Artificial Intelligence",
    image: "/images/adv_ai.jpeg",
    enrolled: "211/250",
  },
  {
    id: 2,
    title: "EE5235 Machine Learning",
    image: "/images/ml.png",
    enrolled: "11/150",
  },
  {
    id: 3,
    title: "EE 6301 Artificial Intelligence",
    image: "/images/ai_2.jpeg",
    enrolled: "41/100",
  },
  {
    id: 4,
    title: "EE 6350 Artificial Intelligence",
    image: "/images/download.png",
    enrolled: "140/150",
  },
];

const handleCreateModule = async (moduleData: ModuleFormData) => {
  try {
    const formData = new FormData();

    formData.append("moduleCode", moduleData.moduleCode);
    formData.append("moduleName", moduleData.moduleName);
    formData.append("educationInstitute", moduleData.educationInstitute);
    if (typeof moduleData.maxStudents === "number") {
      formData.append("maxStudents", moduleData.maxStudents.toString());
    }

    if (moduleData.semester) formData.append("semester", moduleData.semester);
    if (moduleData.learningOutcomes)
      formData.append("learningOutcomes", moduleData.learningOutcomes);
    if (moduleData.enrollmentKey)
      formData.append("enrollmentKey", moduleData.enrollmentKey);
    if (moduleData.moduleImage)
      formData.append("moduleImage", moduleData.moduleImage);

    const response = await fetch("/api/educator", {
      method: "POST",
      body: formData,
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "Failed to create module");
    }

    // toast.success('Module created successfully!');
    // Here you would typically refresh the module list
    return result;
  } catch (error) {
    console.error("Module creation error:", error);
    throw error;
  }
};

const EducatorHomePage: React.FC = () => {
  const moduleScrollRef = useRef<HTMLDivElement>(null);
  const [isModuleModalOpen, setIsModuleModalOpen] = useState(false);

  const scrollLeft = () => {
    moduleScrollRef.current?.scrollBy({ left: -300, behavior: "smooth" });
  };

  const scrollRight = () => {
    moduleScrollRef.current?.scrollBy({ left: 300, behavior: "smooth" });
  };

  // const handleCreateModule = async (moduleData: ModuleFormData) => {
  //   // Simulate API call
  //   return new Promise<void>((resolve) => {
  //     setTimeout(() => {
  //       console.log('Creating module with data:', moduleData);
  //       // Here you would typically:
  //       // 1. Send data to your API
  //       // 2. Update local state if successful
  //       resolve();
  //     }, 1500);
  //   });
  // };

  return (
    <div className="w-full min-h-screen space-y-12 px-4 py-6">
      <Toaster position="top-right" />
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-blue-900">Upcoming Events</h2>
          <button className="bg-blue-900 text-white text-sm px-4 py-2 rounded-md flex items-center gap-1">
            + New Event
          </button>
        </div>
        <div className="flex items-center space-x-4 overflow-x-auto scrollbar-hide">
          {upcomingEvents.map((event) => (
            <EducatorEventCard key={event.id} {...event} />
          ))}
          <FiChevronRight className="text-2xl text-black cursor-pointer" />
        </div>
      </div>

      {/* Created Modules Section */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-blue-900">Created Modules</h2>
          <button
            onClick={() => setIsModuleModalOpen(true)}
            className="bg-blue-900 text-white text-sm px-4 py-2 rounded-md"
          >
            + New Module
          </button>
        </div>

        <div className="relative">
          <button
            onClick={scrollLeft}
            className="absolute left-0 top-1/2 -translate-y-1/2 bg-white shadow-md rounded-full p-2 z-10"
          >
            <FiChevronLeft className="text-2xl text-black" />
          </button>

          <div
            ref={moduleScrollRef}
            className="flex space-x-4 overflow-x-auto scrollbar-hide px-8"
          >
            {createdModules.map((mod) => (
              <EducatorModuleCard key={mod.id} {...mod} />
            ))}
          </div>

          <button
            onClick={scrollRight}
            className="absolute right-0 top-1/2 -translate-y-1/2 bg-white shadow-md rounded-full p-2 z-10"
          >
            <FiChevronRight className="text-2xl text-black" />
          </button>
        </div>
      </div>
      <ModuleCreationForm
        isOpen={isModuleModalOpen}
        onClose={() => setIsModuleModalOpen(false)}
        onSubmit={handleCreateModule}
      />
    </div>
  );
};

export default EducatorHomePage;
