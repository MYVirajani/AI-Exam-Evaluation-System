"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import EducatorEventCard from "../../dashboard/EducatorEventCard";
import Button from "@/components/Button";
import EventCreationForm, {
  EventFormData,
} from "@/components/EventCreationForm";

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

  useEffect(() => {
    (async () => {
      const resolvedParams = await params;
      setModuleId(resolvedParams.moduleId);
    })();
  }, [params]);

  useEffect(() => {
    if (!moduleId) return;

    const fetchData = async () => {
      try {
        const res = await fetch(`/api/educator/module/${moduleId}`);
        if (!res.ok) throw new Error("Failed to fetch module data");

        const data = await res.json();
        console.log("data: ", data);
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
    const form = new FormData();
    form.append("type", data.type);
    form.append("title", data.title);
    form.append("description", data.description || "");
    form.append("deadline", data.deadline);
    form.append("moduleId", data.moduleId);

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

    setModuleData((prev) =>
      prev
        ? {
            ...prev,
            assessments: [...prev.assessments, json.assessment],
          }
        : prev
    );

    setIsEventModalOpen(false);
  };

  if (loading) {
    return (
      <p className="p-6 text-center text-gray-600">
        Loading module information...
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
        {moduleData && (
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-blue-900">
              {moduleCode} - {moduleName}
            </h1>
          </div>
        )}
      </div>

      {/* Assessments */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-blue-800">
            Upcoming Events
          </h2>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsEventModalOpen(true)}
          >
            + New Event
          </Button>
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
                label="Due on:"
              />
            ))}
          </div>
        )}
      </div>

      {/* Event Creation Modal */}
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
      />

      {/* Lessons */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-blue-800">Lessons</h2>
          <Button
            variant="primary"
            size="sm"
            onClick={() => alert("Add New Lesson clicked")}
          >
            + New Lesson
          </Button>
        </div>
        {lessons.length === 0 ? (
          <p className="text-gray-600 italic">
            No lessons have been added yet.
          </p>
        ) : (
          lessons.map((lesson) => (
            <div
              key={lesson.lesson_id}
              className="bg-blue-50 rounded-lg p-4 mb-4"
            >
              <h3 className="text-lg font-semibold text-blue-800 mb-2">
                {lesson.title}
              </h3>
              {lesson.materials.length > 0 ? (
                <ul className="list-disc list-inside">
                  {lesson.materials.map((mat) => (
                    <li key={mat.material_id}>
                      <Link
                        href={mat.file_url}
                        className="text-blue-700 underline hover:text-blue-900"
                      >
                        {mat.description || mat.file_url.split("/").pop()}
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-600 italic">
                  No materials available for this lesson.
                </p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
