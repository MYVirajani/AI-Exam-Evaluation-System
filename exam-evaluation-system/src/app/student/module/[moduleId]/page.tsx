"use client";

import React, { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import StudentLessonCard from "./StudentLessonCard";
import axios from "axios";

interface Material {
  material_id?: string;
  file_name?: string;
  file_url: string | null;
  description?: string | null;
}

interface Lesson {
  lesson_id: string;
  title: string;
  created_on: string;
  materials?: Material[];
}

interface Assessment {
  assessment_id: string;
  title: string;
  type: string;
  description: string;
  deadline: string;
}

interface ModuleData {
  module_id: string;
  module_code: string;
  module_name: string;
  semester: string;
  education_institute: string;
  learning_outcomes?: string;
  module_image_url?: string;
  created_by: string;
  educator: {
    user: {
      first_name: string;
      last_name: string;
      email: string;
    };
  };
}

const StudentModulePage = () => {
  const { moduleId } = useParams();
  const searchParams = useSearchParams();
  const studentId = searchParams.get("studentId") ?? "";

  const [module, setModule] = useState<ModuleData | null>(null);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!moduleId || !studentId) return;

    const fetchModuleData = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`/api/student/enrollments/${moduleId}?studentId=${studentId}`);

        setModule(res.data.module);
        setAssessments(res.data.assessments);
        setLessons(res.data.lessons);
      } catch (error) {
        console.error("[fetchModuleData] Failed to fetch module data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchModuleData();
  }, [moduleId, studentId]);

  if (loading) return <div className="p-6 text-gray-500">Loading module data...</div>;
  if (!module) return <div className="p-6 text-red-500">Module not found or access denied.</div>;

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">{module.module_name}</h1>
        <p className="text-gray-500">
          {module.module_code} • {module.semester} • {module.education_institute}
        </p>
        {module.learning_outcomes && (
          <p className="mt-4 text-gray-600">{module.learning_outcomes}</p>
        )}
      </div>

      <div className="space-y-6">
        {lessons.length > 0 ? (
          lessons.map((lesson, index) => (
            <StudentLessonCard
              key={lesson.lesson_id}
              lesson_id={lesson.lesson_id}
              title={lesson.title}
              lessonNumber={index + 1}
              materials={lesson.materials}
              instructor={`${module.educator.user.first_name} ${module.educator.user.last_name}`}
            />
          ))
        ) : (
          <div className="text-gray-500 text-sm">No lessons available for this module yet.</div>
        )}
      </div>
    </div>
  );
};

export default StudentModulePage;
