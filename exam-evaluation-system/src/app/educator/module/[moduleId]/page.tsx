"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import EducatorEventCard from "../../dashboard/EducatorEventCard";
import Button from "@/components/Button";

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
  params: Promise<{ moduleId: string }>; // params is now a Promise
}

async function getModuleData(moduleId: string): Promise<ModuleData | null> {
  try {
    const res = await fetch(`/api/educator/module/${moduleId}`);

    if (!res.ok) {
      throw new Error(`Failed to fetch module data: ${res.status}`);
    }

    return await res.json();
  } catch (error) {
    console.error("[getModuleData_ERROR]", error);
    return null;
  }
}

export default function ModulePage({ params }: ModulePageProps) {
  // Unwrap params with React.use()
  const resolvedParams = React.use(params);
  const moduleId = resolvedParams.moduleId;

  const [moduleData, setModuleData] = useState<ModuleData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const data = await getModuleData(moduleId);
      setModuleData(data);
      setLoading(false);
    }
    fetchData();
  }, [moduleId]);

  useEffect(() => {
    console.log("ModulePage loaded with moduleId:", moduleId);
  }, [moduleId]);

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
        <h1 className="text-3xl font-bold text-blue-900">{moduleName}</h1>
        {moduleCode && (
          <p className="text-gray-700 text-sm mt-1">Code: {moduleCode}</p>
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
            onClick={() => alert("Add New Event clicked")}
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
                date={new Date(assess.deadline).toLocaleString()}
                label="Due on:"
              />
            ))}
          </div>
        )}
      </div>

      {/* Lessons */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-blue-800">Lessons</h2>

          <Button
            variant="primary"
            size="sm"
            onClick={() => alert("Add New Event clicked")}
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
