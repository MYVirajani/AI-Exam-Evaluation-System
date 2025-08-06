"use client";

import React, { useEffect, useState } from "react";
import EducatorEventCard from "@/components/EducatorEventCard";
import Button from "@/components/Button";
import EventCreationForm, {
  EventFormData,
} from "@/components/EventCreationForm";
import LessonCreationForm from "./LessonCreationForm";
import LessonCard from "./LessonCard";
import LoadingAnimation from "@/components/LoadingAnimation";
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

export default function ModulePage({ params }: ModulePageProps) {
  const [moduleId, setModuleId] = useState<string | null>(null);
  const [moduleData, setModuleData] = useState<ModuleData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [educatorId, setEducatorId] = useState<string | null>(null);
  const [isLessonModalOpen, setIsLessonModalOpen] = useState(false);
  const [creatingEvent, setCreatingEvent] = useState(false); // New loading state for event creation
  const router = useRouter();

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
    if (!moduleId) return;

    const fetchData = async () => {
      try {
        setLoading(true); // Ensure loading is true when fetching starts
        const res = await fetch(`/api/educator/module/${moduleId}`);
        if (!res.ok) throw new Error("Failed to fetch module data");

        const data = await res.json();

        // ✅ Map assessments and ensure numbers are valid
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

  const handleCreateEvent = async (data: EventFormData) => {
    if (!educatorId) {
      setError("Cannot create event. Educator ID not found.");
      return;
    }

    try {
      setCreatingEvent(true); // Start loading for event creation
      setError(null); // Clear any previous errors

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
      if (data.markingScheme?.length)
        form.append("markingScheme", data.markingScheme[0]);

      const res = await fetch("/api/educator/assessment", {
        method: "POST",
        body: form,
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || "Failed to create event");
      }

      setModuleData((prev) =>
        prev
          ? {
              ...prev,
              assessments: [...prev.assessments, json.assessment],
            }
          : prev
      );

      setIsEventModalOpen(false);
    } catch (err: any) {
      console.error("Create Event Error:", err.message);
      setError(err.message);
    } finally {
      setCreatingEvent(false); // End loading for event creation
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

  // Show loading animation while initial data is being fetched
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

  // Show error state
  if (error) {
    return (
      <div className="p-6 text-center">
        <div className="max-w-md mx-auto bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="text-red-600 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Module</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <Button 
            onClick={() => window.location.reload()} 
            variant="primary"
            size="sm"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  // Show error if no module data
  if (!moduleData) {
    return (
      <div className="p-6 text-center">
        <div className="max-w-md mx-auto bg-gray-50 border border-gray-200 rounded-lg p-6">
          <div className="text-gray-400 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Module Not Found</h3>
          <p className="text-gray-600 mb-4">The requested module could not be found or you don't have access to it.</p>
          <Button 
            onClick={() => router.back()} 
            variant="secondary"
            size="sm"
          >
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const { moduleName, moduleCode, lessons, assessments } = moduleData;

  return (
    <div className="p-6">
      {/* Loading overlay for event creation */}
      {creatingEvent && (
        <LoadingAnimation 
          variant="spinner" 
          size="lg" 
          text="Creating event..." 
          fullScreen={true}
          color="blue"
        />
      )}

      <div className="mb-6 text-center">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold text-blue-900">
            {moduleCode} - {moduleName}
          </h1>
        </div>
      </div>

      {/* Assessments */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-blue-800">
            Upcoming Events
          </h2>

          <div className="flex gap-2">
            {/* <Button
              onClick={() =>
                router.push(`/educator/module/${moduleId}/assessment`)
              }
              disabled={creatingEvent}
            >
              Create Assessment
            </Button> */}

            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsEventModalOpen(true)}
              disabled={creatingEvent}
            >
              + New Event
            </Button>
          </div>
        </div>

        {assessments.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 4h6m2-4h-2V5a1 1 0 00-1-1h-4a1 1 0 00-1 1v6h-2l2 2 2-2z" />
              </svg>
            </div>
            <p className="text-gray-600 italic">No assessments scheduled.</p>
          </div>
        ) : (
          <div className="flex flex-wrap gap-4">
            {assessments.map((assess) => (
              <EducatorEventCard
                key={assess.assessment_id}
                title={assess.title}
                module={moduleName}
                uploads={`${assess.submissionsCount}/${moduleData.enrollmentsCount}`}
                date={new Date(assess.deadline).toLocaleString("en-US", {
                  year: "numeric",
                  month: "numeric",
                  day: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                  second: "2-digit",
                  hour12: true,
                })}
                label={
                  assess.type === "assignment" ? "Due on:" : "Scheduled on:"
                }
                assessmentId={assess.assessment_id}
                moduleId={moduleData.moduleId}
                assessmentType={assess.type}
              />
            ))}
          </div>
        )}
      </div>

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

      {/* Lessons */}
      <div className="mt-8">
        <div className="flex flex-col items-center">
          <div className="flex items-center justify-between mb-4 w-full max-w-screen-lg">
            <h2 className="text-xl font-semibold text-blue-800">Lessons</h2>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsLessonModalOpen(true)}
              disabled={creatingEvent}
            >
              + Learning Material
            </Button>
          </div>
          {lessons.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-400 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <p className="text-gray-600 italic">
                No lecture material have been added yet.
              </p>
            </div>
          ) : (
            <div className="flex flex-wrap gap-4 justify-center">
              {lessons.map((lesson) => (
                <LessonCard
                  key={lesson.lesson_id}
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
              ))}
            </div>
          )}
        </div>
      </div>

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
    </div>
  );
}