"use client";

import React, { useEffect, useState, useRef } from "react";
import EducatorEventCard from "@/components/EducatorEventCard";
import Button from "@/components/Button";
import EventCreationForm, {
  EventFormData,
} from "@/components/EventCreationForm";
import LessonCreationForm from "./LessonCreationForm";
import LessonCard from "./LessonCard";
import LoadingAnimation from "@/components/LoadingAnimation";
import Breadcrumbs from "@/components/Breadcrumbs";
import { getModuleBreadcrumbs } from "@/utils/breadcrumbs";
import { useRouter } from "next/navigation";

interface Material {
  material_id: string;
  file_url: string;
  description: string;
}

interface Lesson {
  lesson_id: string;
  title: string;
  materials: Material[];
}

interface Assessment {
  assessment_id: string;
  title: string;
  description: string;
  deadline: string;
  openAt: string;
  closeAt: string;
  type: string;
  submissionsCount: number;
}

interface ModuleData {
  moduleId: string;
  moduleName: string;
  moduleCode?: string;
  lessons: Lesson[];
  assessments: Assessment[];
  enrollmentsCount: number;
}

interface ModulePageProps {
  params: Promise<{ moduleId: string }>;
}

interface EvaluationModel {
  id: string;
  model_name: string;
  provider: string;
  chat_model?: string;
  temperature: number;
  embedding_model: string;
  description?: string;
  created_on: string;
}

interface EmbeddingResponse {
  status: string;
  lesson_ids: string[];
  model_ids: string[];
  message: string;
}

export default function ModulePage({ params }: ModulePageProps) {
  const [moduleId, setModuleId] = useState<string | null>(null);
  const [moduleData, setModuleData] = useState<ModuleData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [educatorId, setEducatorId] = useState<string | null>(null);
  const [isLessonModalOpen, setIsLessonModalOpen] = useState(false);
  const [creatingEvent, setCreatingEvent] = useState(false);
  const [showScrollButtons, setShowScrollButtons] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [updatingKnowledgeBase, setUpdatingKnowledgeBase] = useState(false);
  const [knowledgeBaseStatus, setKnowledgeBaseStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });
  const [evaluationModels, setEvaluationModels] = useState<EvaluationModel[]>([]);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const checkScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } =
        scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
      setShowScrollButtons(scrollWidth > clientWidth);
    }
  };

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -300, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 300, behavior: "smooth" });
    }
  };

  useEffect(() => {
    (async () => {
      const resolvedParams = await params;
      setModuleId(resolvedParams.moduleId);
    })();
  }, [params]);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const userId = user?.user_id;
    if (!userId) {
      setError("Educator ID not found. Please login again.");
      setLoading(false);
      return;
    }
    setEducatorId(userId);
  }, []);

  useEffect(() => {
    if (!educatorId) return;

    const fetchEvaluationModels = async () => {
      try {
        const res = await fetch(`/api/educator/${educatorId}/evaluation-model`);
        if (!res.ok) {
          console.error("Failed to fetch evaluation models");
          return;
        }

        const data = await res.json();
        setEvaluationModels(data.evaluation_models || []);
      } catch (err) {
        console.error("Error fetching evaluation models:", err);
      }
    };

    fetchEvaluationModels();
  }, [educatorId]);

  useEffect(() => {
    if (!moduleId) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/educator/module/${moduleId}`);
        if (!res.ok) throw new Error("Failed to fetch module data");

        const data = await res.json();

        const mappedData: ModuleData = {
          moduleId: data.moduleId,
          moduleName: data.moduleName,
          moduleCode: data.moduleCode,
          lessons: data.lessons || [],
          enrollmentsCount: Number(data.enrollmentsCount) || 0,
          assessments: (data.assessments || []).map((a: any) => ({
            assessment_id: a.assessment_id,
            title: a.title,
            description: a.description,
            deadline: a.deadline,
            openAt: a.open_at,
            closeAt: a.close_at,
            type: a.type,
            submissionsCount: Number(a.submissionsCount) || 0,
          })),
        };

        setModuleData(mappedData);
      } catch (err) {
        console.error("[getModuleData_ERROR]", err);
        setModuleData(null);
        setError("Failed to load module data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [moduleId]);

  useEffect(() => {
    if (moduleData?.assessments) {
      setTimeout(checkScroll, 100);
      window.addEventListener("resize", checkScroll);
      return () => window.removeEventListener("resize", checkScroll);
    }
  }, [moduleData?.assessments]);

  const handleCreateEvent = async (data: EventFormData) => {
    if (!educatorId) {
      setError("Cannot create event. Educator ID not found.");
      return;
    }

    try {
      setCreatingEvent(true);
      setError(null);

      const form = new FormData();
      form.append("type", data.type);
      form.append("title", data.title);
      form.append("description", data.description || "");
      form.append("deadline", data.deadline);
      form.append("moduleId", moduleData?.moduleId || data.moduleId);
      form.append("createdBy", educatorId);

      if (data.questionPaper?.length)
        form.append("questionPaper", data.questionPaper[0]);
      if (data.modelAnswerPaper?.length)
        form.append("modelAnswerPaper", data.modelAnswerPaper[0]);

      const res = await fetch("/api/educator/assessment", {
        method: "POST",
        body: form,
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || "Failed to create event");
      }

      const newAssessment = {
        ...json.assessment,
        submissionsCount: 0,
        openAt: json.assessment.open_at || json.assessment.openAt || "",
        closeAt: json.assessment.close_at || json.assessment.closeAt || "",
      };

      setModuleData((prev) =>
        prev
          ? {
              ...prev,
              assessments: [...prev.assessments, newAssessment],
            }
          : prev
      );

      setIsEventModalOpen(false);
    } catch (err: any) {
      console.error("Create Event Error:", err.message);
      setError(err.message);
    } finally {
      setCreatingEvent(false);
    }
  };

  const handleDeleteLesson = (lessonId: string) => {
    setModuleData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        lessons: prev.lessons.filter((lesson) => lesson.lesson_id !== lessonId),
      };
    });
  };

  const handleUpdateKnowledgeBase = async () => {
    if (!moduleData?.lessons || moduleData.lessons.length === 0) {
      setKnowledgeBaseStatus({
        type: "error",
        message: "No lecture materials available to process.",
      });
      setTimeout(() => {
        setKnowledgeBaseStatus({ type: null, message: "" });
      }, 5000);
      return;
    }

    if (evaluationModels.length === 0) {
      setKnowledgeBaseStatus({
        type: "error",
        message: "No evaluation models found. Please ensure you have an active subscription.",
      });
      setTimeout(() => {
        setKnowledgeBaseStatus({ type: null, message: "" });
      }, 5000);
      return;
    }

    try {
      setUpdatingKnowledgeBase(true);
      setKnowledgeBaseStatus({ type: null, message: "" });

      const lesson_ids: string[] = moduleData.lessons.map(lesson => lesson.lesson_id);
      const model_ids: string[] = evaluationModels.map(model => model.id);

      const requestBody = {
        lesson_ids: lesson_ids,
        model_ids: model_ids,
      };

      const response = await fetch(
        "http://localhost:8000/lecture-material/process-extract-embed",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.detail || `Server responded with status: ${response.status}`
        );
      }

      const result = (await response.json()) as EmbeddingResponse;

      setKnowledgeBaseStatus({
        type: "success",
        message: `Successfully updated knowledge base for ${lesson_ids.length} lesson${
          lesson_ids.length !== 1 ? "s" : ""
        } across ${model_ids.length} model${
          model_ids.length !== 1 ? "s" : ""
        }. Embeddings created and stored.`,
      });

      setTimeout(() => {
        setKnowledgeBaseStatus({ type: null, message: "" });
      }, 7000);
    } catch (err: any) {
      console.error("❌ Knowledge Base Update Error:", err);
      setKnowledgeBaseStatus({
        type: "error",
        message:
          err.message || "An unexpected error occurred while updating knowledge base.",
      });
      setTimeout(() => {
        setKnowledgeBaseStatus({ type: null, message: "" });
      }, 7000);
    } finally {
      setUpdatingKnowledgeBase(false);
    }
  };

  const breadcrumbs = moduleData
    ? getModuleBreadcrumbs(
        moduleData.moduleCode,
        moduleData.moduleId,
        "educator"
      )
    : [
        { label: "Dashboard", href: "/educator/dashboard" },
        { label: "Module", current: true },
      ];

  if (loading) {
    return (
      <LoadingAnimation
        variant="wave"
        size="lg"
        text="Loading module information..."
        fullScreen={true}
        color="blue"
      />
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-12 px-4">
        <div className="max-w-lg mx-auto">
          <div className="bg-white rounded-2xl shadow-xl border border-red-100 p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Error Loading Module
            </h3>
            <p className="text-gray-600 mb-6">{error}</p>
            <Button
              onClick={() => window.location.reload()}
              variant="primary"
              size="sm"
            >
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!moduleData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-12 px-4">
        <div className="max-w-lg mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Module Not Found
            </h3>
            <p className="text-gray-600 mb-6">
              The requested module could not be found or you don't have access to it.
            </p>
            <Button onClick={() => router.back()} variant="secondary" size="sm">
              Go Back
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const { moduleName, moduleCode, lessons, assessments } = moduleData;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      {creatingEvent && (
        <LoadingAnimation
          variant="spinner"
          size="lg"
          text="Creating event..."
          fullScreen={true}
          color="blue"
        />
      )}

      {updatingKnowledgeBase && (
        <LoadingAnimation
          variant="spinner"
          size="lg"
          text="Updating knowledge base... This may take a few moments."
          fullScreen={true}
          color="blue"
        />
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Breadcrumbs */}
        <div className="mb-6 relative z-0">
          <Breadcrumbs items={breadcrumbs} />
        </div>

        {/* Header Section - Enhanced */}
        <div className="mb-10 relative z-0">
          <div className="relative overflow-hidden">
            <div className="bg-white rounded-3xl p-8 md:p-12 shadow-xl border border-gray-100 relative">
              <div className="relative z-10">
                <div className="flex items-center justify-between">
                  <div className="space-y-4 flex-1">
                    <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full text-sm font-medium text-white shadow-lg">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                      {moduleCode}
                    </div>
                    <h1 className="text-3xl md:text-5xl font-bold leading-tight bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-700 bg-clip-text text-transparent">
                      {moduleName}
                    </h1>
                    <div className="flex flex-wrap gap-4 items-center text-base md:text-lg">
                      <div className="flex items-center gap-2 bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 px-3 py-1.5 rounded-lg border border-indigo-100">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <span className="font-medium">{moduleData.enrollmentsCount} Students</span>
                      </div>
                      <div className="flex items-center gap-2 bg-gradient-to-r from-purple-50 to-pink-50 text-purple-700 px-3 py-1.5 rounded-lg border border-purple-100">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span className="font-medium">{lessons.length} Lessons</span>
                      </div>
                      <div className="flex items-center gap-2 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 px-3 py-1.5 rounded-lg border border-blue-100">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        <span className="font-medium">{assessments.length} Events</span>
                      </div>
                    </div>
                  </div>
                  <div className="hidden lg:block ml-8">
                    <div className="w-32 h-32 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center shadow-inner">
                      <svg className="w-16 h-16 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Decorative Elements */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-50 to-transparent rounded-full -translate-y-32 translate-x-32"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-purple-50 to-transparent rounded-full translate-y-24 -translate-x-24"></div>
            </div>
          </div>
        </div>

        {/* Assessments Section - Enhanced */}
        <div className="mb-12 relative z-0">
          <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Upcoming Events</h2>
              </div>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsEventModalOpen(true)}
                disabled={creatingEvent}
                className="w-full sm:w-auto shadow-lg hover:shadow-xl transition-all"
              >
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  New Event
                </span>
              </Button>
            </div>

            {assessments.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-gray-500 text-lg font-medium">No events scheduled yet</p>
                <p className="text-gray-400 text-sm mt-1">Create your first event to get started</p>
              </div>
            ) : (
              <div className="relative">
                {showScrollButtons && (
                  <>
                    <button
                      onClick={scrollLeft}
                      disabled={!canScrollLeft}
                      className={`absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-12 h-12 rounded-full bg-white shadow-2xl border border-gray-200 flex items-center justify-center transition-all duration-200 ${
                        canScrollLeft
                          ? "text-blue-600 hover:bg-blue-50 hover:scale-110"
                          : "text-gray-300 cursor-not-allowed opacity-50"
                      }`}
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>

                    <button
                      onClick={scrollRight}
                      disabled={!canScrollRight}
                      className={`absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-12 h-12 rounded-full bg-white shadow-2xl border border-gray-200 flex items-center justify-center transition-all duration-200 ${
                        canScrollRight
                          ? "text-blue-600 hover:bg-blue-50 hover:scale-110"
                          : "text-gray-300 cursor-not-allowed opacity-50"
                      }`}
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </>
                )}

                <div
                  ref={scrollContainerRef}
                  className="flex gap-4 overflow-x-auto scrollbar-hide pb-4"
                  onScroll={checkScroll}
                  style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                >
                  {assessments.map((assess) => (
                    <div key={assess.assessment_id} className="flex-shrink-0 w-80 sm:w-72">
                      <EducatorEventCard
                        title={assess.title}
                        module={moduleName}
                        uploads={`${assess.submissionsCount}/${moduleData.enrollmentsCount}`}
                        deadline={assess.deadline}
                        openAt={assess.openAt}
                        closeAt={assess.closeAt}
                        assessmentId={assess.assessment_id}
                        moduleId={moduleData.moduleId}
                        assessmentType={assess.type}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Lessons Section - Enhanced */}
        <div className="mb-8 relative z-0">
          <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Lecture Materials</h2>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleUpdateKnowledgeBase}
                  disabled={updatingKnowledgeBase || lessons.length === 0 || evaluationModels.length === 0}
                  className="w-full sm:w-auto shadow hover:shadow-lg transition-all"
                  title={
                    lessons.length === 0
                      ? "No lecture materials to process"
                      : evaluationModels.length === 0
                      ? "No evaluation models available"
                      : "Update RAG system with lecture materials"
                  }
                >
                  <span className="flex items-center gap-2">
                    <span className="text-lg">🧠</span>
                    Update Knowledge Base
                  </span>
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setIsLessonModalOpen(true)}
                  disabled={creatingEvent}
                  className="w-full sm:w-auto shadow-lg hover:shadow-xl transition-all"
                >
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add Materials
                  </span>
                </Button>
              </div>
            </div>

            {knowledgeBaseStatus.type && (
              <div
                className={`mb-6 p-4 rounded-xl border-2 ${
                  knowledgeBaseStatus.type === "success"
                    ? "bg-green-50 border-green-200"
                    : "bg-red-50 border-red-200"
                }`}
              >
                <div className="flex items-start gap-3">
                  {knowledgeBaseStatus.type === "success" ? (
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  ) : (
                    <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                  <div className="flex-1">
                    <p className={`font-semibold text-sm ${
                      knowledgeBaseStatus.type === "success" ? "text-green-800" : "text-red-800"
                    }`}>
                      {knowledgeBaseStatus.type === "success" ? "Success!" : "Error"}
                    </p>
                    <p className={`text-sm mt-1 ${
                      knowledgeBaseStatus.type === "success" ? "text-green-700" : "text-red-700"
                    }`}>
                      {knowledgeBaseStatus.message}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {lessons.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <p className="text-gray-500 text-lg font-medium">No lecture materials yet</p>
                <p className="text-gray-400 text-sm mt-1">Add your first lecture material to get started</p>
              </div>
            ) : educatorId ? (
              <div className="space-y-4">
                {lessons.map((lesson, index) => (
                  <div 
                    key={lesson.lesson_id}
                    className="transform transition-all duration-200 hover:scale-[1.01]"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <LessonCard
                      user_id={educatorId}
                      lesson_id={lesson.lesson_id}
                      module_id={moduleData.moduleId}
                      title={lesson.title}
                      materials={lesson.materials}
                      onEdit={() => {
                        alert(`Edit lesson ${lesson.lesson_id}`);
                      }}
                      onDelete={handleDeleteLesson}
                    />
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {/* Modals */}
      <EventCreationForm
        isOpen={isEventModalOpen}
        onClose={() => setIsEventModalOpen(false)}
        onSubmit={handleCreateEvent}
        modules={[
          {
            id: moduleData.moduleId,
            name: `${moduleData.moduleCode || ""} ${moduleData.moduleName}`,
          },
        ]}
        disableModuleSelection={true}
        defaultModuleId={moduleData.moduleId}
      />

      <LessonCreationForm
        isOpen={isLessonModalOpen}
        onClose={() => setIsLessonModalOpen(false)}
        moduleId={moduleData.moduleId}
        onLessonCreated={(newLesson) => {
          setModuleData((prev) =>
            prev ? { ...prev, lessons: [...prev.lessons, newLesson] } : prev
          );
        }}
      />

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .space-y-4 > * {
          animation: fadeIn 0.3s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  );
}