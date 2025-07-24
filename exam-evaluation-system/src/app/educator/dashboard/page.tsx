"use client";

import React, { useRef, useState, useEffect } from "react";
import { FiChevronLeft, FiChevronRight, FiLoader } from "react-icons/fi";
import { Toaster } from "react-hot-toast";
import EducatorEventCard from "./EducatorEventCard";
import EducatorModuleCard from "./EducatorModuleCard";
import ModuleCreationForm, { ModuleFormData } from "./ModuleCreationForm";
import EventCreationPopup, { EventFormData } from "./EventCreationForm";
import Link from "next/link";

interface ModuleAPI {
  module_id: string;
  module_code: string;
  module_name: string;
  education_institute: string;
  max_enrollments: number;
  module_image_url?: string;
}

interface AssessmentAPI {
  assessment_id: string;
  type: "assignment" | "quiz" | "endExam" | "midExam";
  title: string;
  deadline: string;
  module_id: string;
}

// point this at an actual image you have under public/background-images
const FALLBACK_IMAGES = Array.from(
  { length: 13 },
  (_, i) => `/background-images/image${i + 1}.jpg`
);

export default function EducatorHomePage() {
  const moduleScrollRef = useRef<HTMLDivElement>(null);

  const [upcomingEvents, setUpcomingEvents] = useState<
    {
      id: string;
      title: string;
      module: string;
      uploads: string;
      date: string;
      label: string;
    }[]
  >([]);

  const [createdModules, setCreatedModules] = useState<
    {
      id: string;
      title: string;
      image: string;
      enrolled: string;
    }[]
  >([]);

  const [isModuleModalOpen, setIsModuleModalOpen] = useState(false);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleCreateModule = async (moduleData: ModuleFormData) => {
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

    const res = await fetch("/api/educator", {
      method: "POST",
      body: formData,
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || "Failed to create module");
    return json;
  };

  const handleCreateEvent = async (data: EventFormData) => {
    const form = new FormData();
    form.append("type", data.type);
    form.append("title", data.title);
    form.append("description", data.description || "");
    form.append("deadline", data.deadline);
    form.append("moduleId", data.moduleId);
    if (data.questionPaper?.length)
      form.append("questionPaper", data.questionPaper[0]);

    const res = await fetch("/api/educator/assessment", {
      method: "POST",
      body: form,
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || "Failed to create event");
    return json;
  };

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch("/api/educator/12345/dashboard");
        if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
        const {
          modules,
          assessments,
        }: { modules: ModuleAPI[]; assessments: AssessmentAPI[] } =
          await res.json();

        // Map modules → card data, using a real fallback
        const mappedModules = modules.map((m, idx) => ({
          id: m.module_id,
          title: `${m.module_code}: ${m.module_name}`,
          // use uploaded image if present, otherwise pick one fallback by index
          image:
            m.module_image_url || FALLBACK_IMAGES[idx % FALLBACK_IMAGES.length],
          enrolled: `0/${m.max_enrollments}`,
        }));
        setCreatedModules(mappedModules);

        // Map assessments → event cards
        const mappedEvents = assessments.map((a) => {
          const mod = modules.find((m) => m.module_id === a.module_id);
          const moduleTitle = mod
            ? `${mod.module_code} ${mod.module_name}`
            : "";
          const label = a.type === "assignment" ? "Due on:" : "Scheduled on:";
          return {
            id: a.assessment_id,
            title: a.title,
            module: moduleTitle,
            uploads: `0/${mod?.max_enrollments ?? 0}`,
            date: a.deadline,
            label,
          };
        });

        setCreatedModules(mappedModules);
        setUpcomingEvents(mappedEvents);
      } catch (err: any) {
        console.error("Dashboard load error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <FiLoader className="animate-spin text-4xl text-blue-900" />
        <span className="ml-2 text-lg text-blue-900">
          Loading modules & events…
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-red-600">Error: {error}</p>
      </div>
    );
  }

  const scrollLeft = () =>
    moduleScrollRef.current?.scrollBy({ left: -300, behavior: "smooth" });
  const scrollRight = () =>
    moduleScrollRef.current?.scrollBy({ left: 300, behavior: "smooth" });

  return (
    <div className="w-full min-h-screen space-y-12 px-4 py-6">
      <Toaster position="top-right" />

      {/* Upcoming Events */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-blue-900">Upcoming Events</h2>
          <button
            onClick={() => setIsEventModalOpen(true)}
            className="bg-blue-900 text-white text-sm px-4 py-2 rounded-md"
          >
            + New Event
          </button>
        </div>
        {upcomingEvents.length === 0 ? (
          <p className="text-gray-600">No upcoming events yet.</p>
        ) : (
          <div className="flex items-center space-x-4 overflow-x-auto scrollbar-hide">
            {upcomingEvents.map((evt) => (
              <EducatorEventCard key={evt.id} {...evt} />
            ))}
            <FiChevronRight className="text-2xl text-black cursor-pointer" />
          </div>
        )}
      </div>

      {/* Created Modules */}
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
        {createdModules.length === 0 ? (
          <p className="text-gray-600">You have not created any modules yet.</p>
        ) : (
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
                <Link
                  key={mod.id}
                  href={`/educator/module/${mod.id}`}
                  className="cursor-pointer"
                >
                  <EducatorModuleCard {...mod} />
                </Link>
              ))}
            </div>
            <button
              onClick={scrollRight}
              className="absolute right-0 top-1/2 -translate-y-1/2 bg-white shadow-md rounded-full p-2 z-10"
            >
              <FiChevronRight className="text-2xl text-black" />
            </button>
          </div>
        )}
      </div>

      {/* Module Creation Modal */}
      <ModuleCreationForm
        isOpen={isModuleModalOpen}
        onClose={() => setIsModuleModalOpen(false)}
        onSubmit={handleCreateModule}
      />

      {/* Event Creation Modal */}
      <EventCreationPopup
        isOpen={isEventModalOpen}
        onClose={() => setIsEventModalOpen(false)}
        onSubmit={handleCreateEvent}
        modules={createdModules.map((m) => ({ id: m.id, name: m.title }))}
      />
    </div>
  );
}
