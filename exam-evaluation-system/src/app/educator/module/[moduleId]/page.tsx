"use client";

import React, { useEffect, useState } from "react";
import EducatorEventCard from "@/components/EducatorEventCard";
import Button from "@/components/Button";
import EventCreationForm, {
  EventFormData,
} from "@/components/EventCreationForm";
import LessonCreationForm from "./LessonCreationForm";
import LessonCard from "./LessonCard";
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
}

interface ModuleData {
  moduleId: string;
  moduleName: string;
  moduleCode?: string;
  lessons: Lesson[];
  assessments: Assessment[];
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
        const res = await fetch(`/api/educator/module/${moduleId}`);
        if (!res.ok) throw new Error("Failed to fetch module data");

        const data = await res.json();
        setModuleData(data);
      } catch (err) {
        console.error("[getModuleData_ERROR]", err);
        setModuleData(null);
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

  if (loading) {
    return (
      <p className="p-6 text-center text-gray-600">
        Loading module information...
      </p>
    );
  }

  if (error) {
    return (
      <p className="p-6 text-center text-red-600">
        {error || "An unexpected error occurred."}
      </p>
    );
  }

  if (!moduleData) {
    return (
      <p className="p-6 text-center text-red-600">
        Failed to load module data. Please try again later.
      </p>
    );
  }

  const { moduleName, moduleCode, lessons, assessments } = moduleData;

  return (
    <div className="p-6">
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
            <Button
              onClick={() =>
                router.push(`/educator/module/${moduleId}/assessment`)
              }
            >
              Create Assessment
            </Button>

            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsEventModalOpen(true)}
            >
              + New Event
            </Button>
          </div>
        </div>

        {assessments.length === 0 ? (
          <p className="text-gray-600 italic">No assessments scheduled.</p>
        ) : (
          <div className="flex flex-wrap gap-4">
            {assessments.map((assess) => (
              <EducatorEventCard
                key={assess.assessment_id}
                title={assess.title}
                module={moduleName}
                uploads="0"
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
            >
              + New Lesson
            </Button>
          </div>
          {lessons.length === 0 ? (
            <p className="text-gray-600 italic">
              No lessons have been added yet.
            </p>
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