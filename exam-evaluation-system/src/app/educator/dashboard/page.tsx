"use client";

import React, { useRef, useState, useEffect } from "react";
import {
  FiChevronLeft,
  FiChevronRight,
  FiCalendar,
  FiBook,
  FiTrendingUp,
  FiPlus,
  FiFileText,
} from "react-icons/fi";
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

interface Module {
  module_id: string;
  module_code: string;
  module_name: string;
  education_institute: string;
  max_enrollments: number;
  module_image_url?: string;
  number_of_enrollments: number;
}

interface Assessment {
  assessment_id: string;
  type: "assignment" | "quiz" | "endExam" | "midExam";
  title: string;
  deadline: string;
  open_at: string | null;
  close_at: string | null;
  module_id: string;
  number_of_submissions: number;
}

interface ModuleCard {
  id: string;
  title: string;
  image: string | null;
  enrolled: string;
  number_of_enrollments: number;
  maxEnrollments: number;
}

interface EventCard {
  id: string;
  title: string;
  module: string;
  uploads: string;
  deadline: string;
  openAt?: string;
  closeAt?: string;
  moduleId: string;
  assessmentType: string;
}

export default function EducatorHomePage() {
  const moduleScrollRef = useRef<HTMLDivElement>(null);
  const eventScrollRef = useRef<HTMLDivElement>(null);

  const [upcomingEvents, setUpcomingEvents] = useState<EventCard[]>([]);
  const [createdModules, setCreatedModules] = useState<ModuleCard[]>([]);

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
      setCanScrollRight(
        moduleEl.scrollLeft + moduleEl.clientWidth < moduleEl.scrollWidth - 10
      );
    }

    if (eventEl) {
      setCanScrollEventLeft(eventEl.scrollLeft > 10);
      setCanScrollEventRight(
        eventEl.scrollLeft + eventEl.clientWidth < eventEl.scrollWidth - 10
      );
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
      enrolled: `${newModule.number_of_enrollments ?? 0}/${
        newModule.max_enrollments
      }`,
      number_of_enrollments: newModule.number_of_enrollments ?? 0,
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
    // if (data.markingScheme?.length)
    //   form.append("markingScheme", data.markingScheme[0]);

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
      uploads: `0/${relatedModule?.number_of_enrollments || 0}`,
      deadline: newEvent.deadline,
      openAt: newEvent.open_at,
      closeAt: newEvent.close_at,
      moduleId: newEvent.module_id,
      assessmentType: newEvent.type,
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
        }: { modules: Module[]; assessments: Assessment[] } =
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

          return {
            id: a.assessment_id,
            title: a.title,
            module: moduleTitle,
            uploads: `${a.number_of_submissions}/${
              mod?.number_of_enrollments ?? 0
            }`,
            deadline: a.deadline,
            openAt: a.open_at || undefined, // Convert null to undefined for consistency
            closeAt: a.close_at || undefined, // Convert null to undefined for consistency
            moduleId: mod?.module_id || "",
            assessmentType: a.type,
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
              <svg
                className="w-4 h-4 text-red-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-red-800">
                Error Loading Dashboard
              </h3>
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
      behavior: "smooth",
    });
  };

  const scrollModuleRight = () => {
    moduleScrollRef.current?.scrollBy({
      left: 400,
      behavior: "smooth",
    });
  };

  const scrollEventLeft = () => {
    eventScrollRef.current?.scrollBy({
      left: -350,
      behavior: "smooth",
    });
  };

  const scrollEventRight = () => {
    eventScrollRef.current?.scrollBy({
      left: 350,
      behavior: "smooth",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
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

      {/* Main Content Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Hero Section */}
        <div className="relative overflow-hidden">
          <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-700 rounded-3xl p-8 md:p-12 text-white relative">
            <div className="absolute inset-0 bg-black/10 rounded-3xl"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between">
                <div className="space-y-4">
                  <div className="inline-flex items-center px-4 py-2 bg-white/20 rounded-full text-sm font-medium backdrop-blur-sm">
                    <FiTrendingUp className="w-4 h-4 mr-2" />
                    Educator Dashboard
                  </div>
                  <h1 className="text-4xl md:text-5xl font-bold leading-tight">
                    Welcome to Your Dashboard
                  </h1>
                  <p className="text-blue-100 text-lg md:text-xl max-w-2xl">
                    Manage your educational modules, track student progress, and
                    create engaging assessments.
                  </p>
                </div>
                <div className="hidden lg:block">
                  <div className="w-32 h-32 bg-white/10 rounded-full backdrop-blur-sm flex items-center justify-center">
                    <FiBook className="w-16 h-16 text-white/80" />
                  </div>
                </div>
              </div>
            </div>

            {/* Decorative Elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-white/10 to-transparent rounded-full -translate-y-32 translate-x-32"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-white/5 to-transparent rounded-full translate-y-24 -translate-x-24"></div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Created Modules
                </p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {createdModules.length}
                </p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <FiBook className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>
          {/*           
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Students</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{totalStudents}</p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-xl flex items-center justify-center">
                <FiUsers className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>
           */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Upcoming Events
                </p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {upcomingEvents.length}
                </p>
              </div>
              <div className="h-12 w-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <FiCalendar className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>

          {/* <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Capacity Used</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {totalCapacity > 0 ? Math.round((totalStudents / totalCapacity) * 100) : 0}%
                </p>
              </div>
              <div className="h-12 w-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <FiTrendingUp className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div> */}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <button
            onClick={() => setIsModuleModalOpen(true)}
            className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow text-left group"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Create New Module
                </h3>
                <p className="text-gray-600 text-sm">
                  Set up a new course module for your students
                </p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-xl flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                <FiPlus className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </button>

          <button
            onClick={() => setIsEventModalOpen(true)}
            className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow text-left group"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Create Assessment
                </h3>
                <p className="text-gray-600 text-sm">
                  Add a new assignment, quiz, or exam
                </p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-xl flex items-center justify-center group-hover:bg-green-200 transition-colors">
                <FiCalendar className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </button>

          <Link href="/educator/dashboard/results-dashboard" className="block">
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow text-left group h-full">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    View Results
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Check student performance and analytics
                  </p>
                </div>
                <div className="h-12 w-12 bg-purple-100 rounded-xl flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                  <FiFileText className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* Upcoming Events Section */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
          <div className="px-6 py-5 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Upcoming Events
                </h2>
                <p className="text-gray-600 mt-1">
                  Track your upcoming assessments and deadlines
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  {canScrollEventLeft && (
                    <button
                      onClick={scrollEventLeft}
                      className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
                    >
                      <FiChevronLeft className="w-5 h-5 text-gray-600" />
                    </button>
                  )}
                  {canScrollEventRight && (
                    <button
                      onClick={scrollEventRight}
                      className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
                    >
                      <FiChevronRight className="w-5 h-5 text-gray-600" />
                    </button>
                  )}
                </div>
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => setIsEventModalOpen(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  + New Event
                </Button>
              </div>
            </div>
          </div>

          <div className="p-6">
            {upcomingEvents.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FiCalendar className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No upcoming events
                </h3>
                <p className="text-gray-600 max-w-sm mx-auto mb-6">
                  Create your first assessment to get started with tracking
                  student progress.
                </p>
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => setIsEventModalOpen(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  Create Your First Assessment
                </Button>
              </div>
            ) : (
              <div
                ref={eventScrollRef}
                className="flex space-x-4 overflow-x-auto hide-scrollbar pb-2"
              >
                {upcomingEvents.map((evt) => (
                  <EducatorEventCard
                    key={evt.id}
                    title={evt.title}
                    module={evt.module}
                    uploads={evt.uploads}
                    deadline={evt.deadline}
                    openAt={evt.openAt}
                    closeAt={evt.closeAt}
                    assessmentId={evt.id}
                    assessmentType={evt.assessmentType}
                    moduleId={evt.moduleId}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Created Modules Section */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
          <div className="px-6 py-5 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Created Modules
                </h2>
                <p className="text-gray-600 mt-1">
                  Manage your educational modules and enrollments
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  {canScrollLeft && (
                    <button
                      onClick={scrollModuleLeft}
                      className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
                    >
                      <FiChevronLeft className="w-5 h-5 text-gray-600" />
                    </button>
                  )}
                  {canScrollRight && (
                    <button
                      onClick={scrollModuleRight}
                      className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
                    >
                      <FiChevronRight className="w-5 h-5 text-gray-600" />
                    </button>
                  )}
                </div>
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => setIsModuleModalOpen(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  + New Module
                </Button>
              </div>
            </div>
          </div>

          <div className="p-6">
            {createdModules.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FiBook className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No modules created
                </h3>
                <p className="text-gray-600 max-w-sm mx-auto mb-6">
                  Create your first module to start building your educational
                  content and engaging with students.
                </p>
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => setIsModuleModalOpen(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  Create Your First Module
                </Button>
              </div>
            ) : (
              <div
                ref={moduleScrollRef}
                className="flex space-x-4 overflow-x-auto hide-scrollbar pb-2"
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
            )}
          </div>
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