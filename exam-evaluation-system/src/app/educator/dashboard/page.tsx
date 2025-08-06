"use client";

import React, { useRef, useState, useEffect } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { Toaster } from "react-hot-toast";
import EducatorEventCard from "@/components/EducatorEventCard";
import EducatorModuleCard from "./EducatorModuleCard";
import ModuleCreationForm, { ModuleFormData } from "./ModuleCreationForm";
import EventCreationForm, {
  EventFormData,
} from "@/components/EventCreationForm";
import Link from "next/link";
import Button from "@/components/Button";
import LoadingAnimation from "@/components/LoadingAnimation";

interface ModuleAPI {
  module_id: string;
  module_code: string;
  module_name: string;
  education_institute: string;
  max_enrollments: number;
  module_image_url?: string;
  number_of_enrollments: number;
}

interface AssessmentAPI {
  assessment_id: string;
  type: "assignment" | "quiz" | "endExam" | "midExam";
  title: string;
  deadline: string;
  module_id: string;
  number_of_submissions: number;
}

export default function EducatorHomePage() {
  const moduleScrollRef = useRef<HTMLDivElement>(null);
  const eventScrollRef = useRef<HTMLDivElement>(null);

  const [upcomingEvents, setUpcomingEvents] = useState<any[]>([]);
  const [createdModules, setCreatedModules] = useState<any[]>([]);
  const [isModuleModalOpen, setIsModuleModalOpen] = useState(false);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [educatorId, setEducatorId] = useState<string | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [canScrollEventLeft, setCanScrollEventLeft] = useState(false);
  const [canScrollEventRight, setCanScrollEventRight] = useState(false);

  const updateScrollButtons = () => {
    const moduleEl = moduleScrollRef.current;
    const eventEl = eventScrollRef.current;
    
    if (moduleEl) {
      setCanScrollLeft(moduleEl.scrollLeft > 10);
      setCanScrollRight(moduleEl.scrollLeft + moduleEl.clientWidth < moduleEl.scrollWidth - 10);
    }
    
    if (eventEl) {
      setCanScrollEventLeft(eventEl.scrollLeft > 10);
      setCanScrollEventRight(eventEl.scrollLeft + eventEl.clientWidth < eventEl.scrollWidth - 10);
    }
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
    const res = await fetch("/api/educator/module", {
      method: "POST",
      body: formData,
    });

    const json = await res.json();
    if (!res.ok) throw new Error(json.error || "Failed to create module");

    const newModule = json.module;
    const newCard = {
      id: newModule.module_id,
      title: `${newModule.module_code}: ${newModule.module_name}`,
      image: newModule.module_image_url || null,
      enrolled: `0/${newModule.max_enrollments}`,
      maxEnrollments: newModule.max_enrollments,
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
      uploads: `0/${relatedModule?.maxEnrollments || 0}`,
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

        const mappedModules = modules.map((m) => ({
          id: m.module_id,
          title: `${m.module_code}: ${m.module_name}`,
          image: m.module_image_url || null,
          enrolled: `${m.number_of_enrollments}/${m.max_enrollments}`,
          number_of_enrollments: m.number_of_enrollments,
          maxEnrollments: m.max_enrollments,
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
            uploads: `${a.number_of_submissions}/${
              mod?.number_of_enrollments ?? 0
            }`,
            date: formattedDate,
            label,
            moduleId: mod?.module_id || "",
            assessmentType: a.type
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
    const moduleEl = moduleScrollRef.current;
    const eventEl = eventScrollRef.current;
    
    const handleScroll = () => updateScrollButtons();
    const handleResize = () => updateScrollButtons();
    
    if (moduleEl) moduleEl.addEventListener("scroll", handleScroll);
    if (eventEl) eventEl.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", handleResize);
    
    return () => {
      if (moduleEl) moduleEl.removeEventListener("scroll", handleScroll);
      if (eventEl) eventEl.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
    };
  }, [createdModules, upcomingEvents]);

  if (loading) {
    return (
      <LoadingAnimation
        size="lg"
        variant="wave"
        text="Loading modules & events..."
        fullScreen={true}
        color="blue"
      />
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen space-y-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-red-800">Error Loading Dashboard</h3>
              <p className="text-red-600 mt-1">{error}</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="mt-4 border-red-300 text-red-700 hover:bg-red-50"
            onClick={() => window.location.reload()}
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  const scrollModuleLeft = () => {
    moduleScrollRef.current?.scrollBy({ 
      left: -400, 
      behavior: "smooth" 
    });
  };
  
  const scrollModuleRight = () => {
    moduleScrollRef.current?.scrollBy({ 
      left: 400, 
      behavior: "smooth" 
    });
  };

  const scrollEventLeft = () => {
    eventScrollRef.current?.scrollBy({ 
      left: -350, 
      behavior: "smooth" 
    });
  };
  
  const scrollEventRight = () => {
    eventScrollRef.current?.scrollBy({ 
      left: 350, 
      behavior: "smooth" 
    });
  };

  return (
    <div className="w-full min-h-screen space-y-12 px-4 py-6">
      <style jsx global>{`
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
      
      <Toaster position="top-right" />

      {/* Page Header with Welcome Message */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
        <h1 className="text-2xl font-bold text-blue-900 mb-2">Welcome to Your Dashboard</h1>
        <p className="text-blue-700">Manage your modules and track upcoming assessments</p>
      </div>

      {/* Upcoming Events */}
      <div>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-blue-900">Upcoming Events</h2>
            <p className="text-gray-600 mt-1">Track your upcoming assessments and deadlines</p>
          </div>
          <Button
            variant="primary"
            size="md"
            onClick={() => setIsEventModalOpen(true)}
            className="shadow-lg"
          >
            + New Event
          </Button>
        </div>
        {upcomingEvents.length === 0 ? (
          <div className="bg-gray-50 rounded-xl p-8 text-center border border-gray-200">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No upcoming events</h3>
            <p className="text-gray-600">Create your first assessment to get started</p>
          </div>
        ) : (
          <div className="relative">
            {canScrollEventLeft && (
              <button
                onClick={scrollEventLeft}
                className="absolute left-0 top-1/2 -translate-y-1/2 bg-white shadow-lg rounded-full p-3 z-20 border border-gray-200 hover:shadow-xl transition-all duration-200 hover:scale-110 hover:bg-gray-50"
              >
                <FiChevronLeft className="text-xl text-gray-700" />
              </button>
            )}
            <div
              ref={eventScrollRef}
              className="flex items-center space-x-4 overflow-x-auto hide-scrollbar px-8 py-2"
            >
              {upcomingEvents.map((evt) => (
                <EducatorEventCard
                  key={evt.id}
                  title={evt.title}
                  module={evt.module}
                  uploads={evt.uploads}
                  date={evt.date}
                  label={evt.label}
                  assessmentId={evt.id}
                  moduleId={evt.moduleId}
                  assessmentType={evt.assessmentType}
                />
              ))}
            </div>
            {canScrollEventRight && (
              <button
                onClick={scrollEventRight}
                className="absolute right-0 top-1/2 -translate-y-1/2 bg-white shadow-lg rounded-full p-3 z-20 border border-gray-200 hover:shadow-xl transition-all duration-200 hover:scale-110 hover:bg-gray-50"
              >
                <FiChevronRight className="text-xl text-gray-700" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Created Modules */}
      <div>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-blue-900">Created Modules</h2>
            <p className="text-gray-600 mt-1">Manage your educational modules and enrollments</p>
          </div>
          <Button
            variant="primary"
            size="md"
            onClick={() => setIsModuleModalOpen(true)}
            className="shadow-lg"
          >
            + New Module
          </Button>
        </div>
        {createdModules.length === 0 ? (
          <div className="bg-gray-50 rounded-xl p-8 text-center border border-gray-200">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No modules created</h3>
            <p className="text-gray-600">Create your first module to start teaching</p>
          </div>
        ) : (
          <div className="relative">
            {canScrollLeft && (
              <button
                onClick={scrollModuleLeft}
                className="absolute left-0 top-1/2 -translate-y-1/2 bg-white shadow-lg rounded-full p-3 z-20 border border-gray-200 hover:shadow-xl transition-all duration-200 hover:scale-110 hover:bg-gray-50"
              >
                <FiChevronLeft className="text-xl text-gray-700" />
              </button>
            )}
            <div
              ref={moduleScrollRef}
              className="flex space-x-6 overflow-x-auto hide-scrollbar px-8 py-2"
            >
              {createdModules.map((mod) => (
                <Link
                  key={mod.id}
                  href={`/educator/module/${mod.id}`}
                  className="cursor-pointer transform hover:scale-105 transition-transform duration-200"
                >
                  <EducatorModuleCard
                    title={mod.title}
                    image={mod.image}
                    enrolled={mod.enrolled}
                    maxEnrollments={mod.maxEnrollments}
                  />
                </Link>
              ))}
            </div>
            {canScrollRight && (
              <button
                onClick={scrollModuleRight}
                className="absolute right-0 top-1/2 -translate-y-1/2 bg-white shadow-lg rounded-full p-3 z-20 border border-gray-200 hover:shadow-xl transition-all duration-200 hover:scale-110 hover:bg-gray-50"
              >
                <FiChevronRight className="text-xl text-gray-700" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-6 border border-gray-200">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Quick Actions</h3>
            <p className="text-gray-600">Access additional features and reports</p>
          </div>
          <Link href="/educator/dashboard/results-dashboard">
            <Button variant="secondary" size="md" className="shadow-lg">
              View Student Results
            </Button>
          </Link>
        </div>
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
  );
}