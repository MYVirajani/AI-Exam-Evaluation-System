"use client";

import React, { useRef, useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Loader2, Calendar, BookOpen, Plus, Sparkles } from "lucide-react";
import { Toaster } from "react-hot-toast";
import EducatorEventCard from "@/components/EducatorEventCard";
import EducatorModuleCard from "./EducatorModuleCard";
import ModuleCreationForm, { ModuleFormData } from "./ModuleCreationForm";
import EventCreationForm, {
  EventFormData,
} from "@/components/EventCreationForm";
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

const FALLBACK_IMAGES = Array.from(
  { length: 13 },
  (_, i) => `/background-images/image${i + 1}.jpg`
);

export default function EducatorHomePage() {
  const moduleScrollRef = useRef<HTMLDivElement>(null);

  const [upcomingEvents, setUpcomingEvents] = useState<any[]>([]);
  const [createdModules, setCreatedModules] = useState<any[]>([]);
  const [isModuleModalOpen, setIsModuleModalOpen] = useState(false);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [educatorId, setEducatorId] = useState<string | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollButtons = () => {
    const el = moduleScrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth);
  };

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

    if (!educatorId) {
      throw new Error("Educator ID is missing. Cannot create module.");
    }

    formData.append("createdBy", educatorId);
    const res = await fetch("/api/educator/modules", {
      method: "POST",
      body: formData,
    });

    const json = await res.json();
    if (!res.ok) throw new Error(json.error || "Failed to create module");

    const newModule = json.module;
    const newCard = {
      id: newModule.module_id,
      title: `${newModule.module_code}: ${newModule.module_name}`,
      image:
        newModule.module_image_url ||
        FALLBACK_IMAGES[createdModules.length % FALLBACK_IMAGES.length],
      enrolled: `0/${newModule.max_enrollments}`,
    };

    setCreatedModules((prev) => [...prev, newCard]);
    setIsModuleModalOpen(false);
    return json;
  };

  const handleCreateEvent = async (data: EventFormData) => {
    if (!educatorId) {
      throw new Error("Educator ID is missing. Cannot create assessment.");
    }

    const form = new FormData();
    form.append("type", data.type);
    form.append("title", data.title);
    form.append("description", data.description || "");
    form.append("deadline", data.deadline);
    form.append("moduleId", data.moduleId);
    form.append("createdBy", educatorId);

    if (data.questionPaper?.length)
      form.append("questionPaper", data.questionPaper[0]);
    if (data.modelAnswerPaper?.length)
      form.append("modelAnswerPaper", data.modelAnswerPaper[0]);
    if (data.markingScheme?.length)
      form.append("markingScheme", data.markingScheme[0]);

    const res = await fetch("/api/educator/assessment", {
      method: "POST",
      body: form,
    });

    const json = await res.json();
    if (!res.ok) throw new Error(json.error || "Failed to create event");

    const newEvent = json.assessment;
    const relatedModule = createdModules.find(
      (m) => m.id === newEvent.module_id
    );

    const newCard = {
      id: newEvent.assessment_id,
      title: newEvent.title,
      module: relatedModule?.title || "",
      uploads: `0/${relatedModule?.max_enrollments || 0}`,
      date: new Date(newEvent.deadline).toLocaleString(),
      label: newEvent.type === "assignment" ? "Due on:" : "Scheduled on:",
    };

    setUpcomingEvents((prev) => [...prev, newCard]);
    setIsEventModalOpen(false);
    return json;
  };

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const userId = user.user_id;
    if (!userId) {
      setError("Educator ID not found. Please login again.");
      setLoading(false);
      return;
    }
    setEducatorId(userId);
  }, []);

  useEffect(() => {
    if (!educatorId) return;

    async function loadData() {
      setLoading(true);
      try {
        const res = await fetch(`/api/educator/${educatorId}/dashboard`);
        if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
        const {
          modules,
          assessments,
        }: { modules: ModuleAPI[]; assessments: AssessmentAPI[] } =
          await res.json();

        const mappedModules = modules.map((m, idx) => ({
          id: m.module_id,
          title: `${m.module_code}: ${m.module_name}`,
          image:
            m.module_image_url || FALLBACK_IMAGES[idx % FALLBACK_IMAGES.length],
          enrolled: `0/${m.max_enrollments}`,
        }));
        setCreatedModules(mappedModules);

        const mappedEvents = assessments.map((a) => {
          const mod = modules.find((m) => m.module_id === a.module_id);
          const moduleTitle = mod
            ? `${mod.module_code} ${mod.module_name}`
            : "";
          const label = a.type === "assignment" ? "Due on:" : "Scheduled on:";

          const formattedDate = new Date(a.deadline).toLocaleString("en-US", {
            year: "numeric",
            month: "numeric",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit",
            second: "2-digit",
            hour12: true,
          });

          return {
            id: a.assessment_id,
            title: a.title,
            module: moduleTitle,
            uploads: `0/${mod?.max_enrollments ?? 0}`,
            date: formattedDate,
            label,
          };
        });

        setUpcomingEvents(mappedEvents);
      } catch (err: any) {
        console.error("Dashboard load error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [educatorId]);

  useEffect(() => {
    updateScrollButtons();
    const el = moduleScrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", updateScrollButtons);
    window.addEventListener("resize", updateScrollButtons);
    return () => {
      el.removeEventListener("scroll", updateScrollButtons);
      window.removeEventListener("resize", updateScrollButtons);
    };
  }, [createdModules]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50">
        <div className="relative">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-500 rounded-full flex items-center justify-center animate-pulse">
            <Loader2 className="w-8 h-8 text-white animate-spin" />
          </div>
          <div className="absolute -top-2 -right-2">
            <Sparkles className="w-6 h-6 text-purple-500 animate-bounce" />
          </div>
        </div>
        <p className="mt-6 text-lg font-medium text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-cyan-500">
          Loading your dashboard...
        </p>
        <p className="text-sm text-gray-600 mt-1">Setting up modules & events</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-red-50 to-orange-50">
        <div className="text-center p-8 bg-white rounded-2xl shadow-xl border border-red-100">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">⚠️</span>
          </div>
          <h3 className="text-lg font-semibold text-red-800 mb-2">Oops! Something went wrong</h3>
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  const scrollLeft = () =>
    moduleScrollRef.current?.scrollBy({ left: -300, behavior: "smooth" });
  const scrollRight = () =>
    moduleScrollRef.current?.scrollBy({ left: 300, behavior: "smooth" });

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-purple-50/30 via-blue-50/20 to-cyan-50/30">
      <div className="max-w-7xl mx-auto space-y-12 px-6 py-8">
        <Toaster position="top-right" />

        {/* Welcome Header */}
        <div className="text-center py-8">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-500 mb-4">
            Welcome to Your Dashboard
          </h1>
          <p className="text-gray-600 text-lg">Manage your modules and track upcoming events</p>
        </div>

        {/* Upcoming Events Section */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-purple-600 to-cyan-500 p-2 rounded-xl">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Upcoming Events</h2>
                <p className="text-sm text-gray-600">Track deadlines and schedules</p>
              </div>
            </div>
            <button
              onClick={() => setIsEventModalOpen(true)}
              className="group bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-500 hover:from-purple-700 hover:via-blue-700 hover:to-cyan-600 text-white px-6 py-3 rounded-2xl font-medium transition-all duration-300 flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <Plus className="w-5 h-5 transition-transform group-hover:rotate-90 duration-300" />
              <span>New Event</span>
            </button>
          </div>

          {upcomingEvents.length === 0 ? (
            <div className="text-center py-16 bg-white/60 backdrop-blur-sm rounded-3xl border border-gray-100">
              <div className="w-20 h-20 bg-gradient-to-r from-purple-100 to-cyan-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">No upcoming events</h3>
              <p className="text-gray-500 mb-6">Create your first event to get started</p>
              <button
                onClick={() => setIsEventModalOpen(true)}
                className="bg-gradient-to-r from-purple-600 to-cyan-500 text-white px-6 py-2 rounded-xl hover:shadow-lg transition-all duration-300"
              >
                Create Event
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-6 overflow-x-auto scrollbar-hide pb-4">
              {upcomingEvents.map((evt) => (
                <EducatorEventCard
                  key={evt.id}
                  title={evt.title}
                  module={evt.module}
                  uploads={evt.uploads}
                  date={evt.date}
                  label={evt.label}
                  assessmentId={evt.id}
                  moduleId={
                    createdModules.find((m) => m.title === evt.module)?.id
                  }
                />
              ))}
            </div>
          )}
        </div>

        {/* Created Modules Section */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-cyan-500 to-purple-600 p-2 rounded-xl">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Created Modules</h2>
                <p className="text-sm text-gray-600">Manage your teaching modules</p>
              </div>
            </div>
            <button
              onClick={() => setIsModuleModalOpen(true)}
              className="group bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 hover:from-cyan-600 hover:via-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-2xl font-medium transition-all duration-300 flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <Plus className="w-5 h-5 transition-transform group-hover:rotate-90 duration-300" />
              <span>New Module</span>
            </button>
          </div>

          {createdModules.length === 0 ? (
            <div className="text-center py-16 bg-white/60 backdrop-blur-sm rounded-3xl border border-gray-100">
              <div className="w-20 h-20 bg-gradient-to-r from-cyan-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">No modules created yet</h3>
              <p className="text-gray-500 mb-6">Start by creating your first teaching module</p>
              <button
                onClick={() => setIsModuleModalOpen(true)}
                className="bg-gradient-to-r from-cyan-500 to-purple-600 text-white px-6 py-2 rounded-xl hover:shadow-lg transition-all duration-300"
              >
                Create Module
              </button>
            </div>
          ) : (
            <div className="relative">
              {canScrollLeft && (
                <button
                  onClick={scrollLeft}
                  className="absolute left-0 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm shadow-xl hover:shadow-2xl rounded-full p-3 z-10 border border-gray-100 transition-all duration-300 hover:bg-white"
                >
                  <ChevronLeft className="w-6 h-6 text-gray-700" />
                </button>
              )}
              
              <div
                ref={moduleScrollRef}
                className="flex space-x-6 overflow-x-auto scrollbar-hide px-4 py-2"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {createdModules.map((mod) => (
                  <Link
                    key={mod.id}
                    href={`/educator/module/${mod.id}`}
                    className="cursor-pointer flex-shrink-0"
                  >
                    <EducatorModuleCard {...mod} />
                  </Link>
                ))}
              </div>
              
              {canScrollRight && (
                <button
                  onClick={scrollRight}
                  className="absolute right-0 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm shadow-xl hover:shadow-2xl rounded-full p-3 z-10 border border-gray-100 transition-all duration-300 hover:bg-white"
                >
                  <ChevronRight className="w-6 h-6 text-gray-700" />
                </button>
              )}
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
        <EventCreationForm
          isOpen={isEventModalOpen}
          onClose={() => setIsEventModalOpen(false)}
          onSubmit={handleCreateEvent}
          modules={createdModules.map((m) => ({ id: m.id, name: m.title }))}
        />
      </div>
    </div>
  );
}