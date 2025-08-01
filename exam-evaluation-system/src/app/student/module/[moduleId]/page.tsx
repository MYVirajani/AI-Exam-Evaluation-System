"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import StudentLessonCard from "./StudentLessonCard";
import StudentEventCard from "../../dashboard/StudentEventCard";
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
  const router = useRouter();
  const { moduleId } = useParams();
  const searchParams = useSearchParams();
  const studentId = searchParams.get("studentId") ?? "";

  const [module, setModule] = useState<ModuleData | null>(null);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [countdowns, setCountdowns] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!moduleId || !studentId) return;

    const fetchModuleData = async () => {
      try {
        setLoading(true);
        const res = await axios.get(
          `/api/student/enrollments/${moduleId}?studentId=${studentId}`
        );
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

  // Real-time countdown updater
useEffect(() => {
  const updateCountdowns = () => {
    const now = Date.now();
    const newCountdowns: Record<string, string> = {};

    assessments.forEach(({ assessment_id, deadline }) => {
      const deadlineTime = new Date(deadline).getTime();
      const diff = deadlineTime - now;

      if (diff <= 0) {
        newCountdowns[assessment_id] = "Expired";
      } else {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        // Only include non-zero units in the display
        const parts = [];
        if (days > 0) parts.push(`${days}d`);
        if (hours > 0 || days > 0) parts.push(`${hours}h`);
        if (minutes > 0 || hours > 0 || days > 0) parts.push(`${minutes}m`);
        parts.push(`${seconds}s`);

        newCountdowns[assessment_id] = parts.join(" ");
      }
    });

    setCountdowns(newCountdowns);
  };

  updateCountdowns(); // Initial call
  const timer = setInterval(updateCountdowns, 1000);
  return () => clearInterval(timer);
}, [assessments]);


  if (loading) return <div className="p-6 text-gray-500">Loading module data...</div>;
  if (!module) return <div className="p-6 text-red-500">Module not found or access denied.</div>;

  return (
    <div className="p-6 space-y-10">
      {/* Module header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">{module.module_name}</h1>
        <p className="text-gray-500">
          {module.module_code} • {module.semester} • {module.education_institute}
        </p>
        {module.learning_outcomes && (
          <p className="mt-4 text-gray-600">{module.learning_outcomes}</p>
        )}
      </div>

      {/* Assessment Events */}
      {assessments.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-blue-900 mb-3">Upcoming Assessments</h2>
          <div className="flex overflow-x-auto space-x-4">
            {assessments.map((assess) => (
              <StudentEventCard
                key={assess.assessment_id}
                title={assess.title}
                module={`${module.module_code} ${module.module_name}`}
                countdown={countdowns[assess.assessment_id] || "--:--:--"}
                date={new Date(assess.deadline).toLocaleString()}
                onClick={() =>
                  router.push(
                    `/student/assessments/${assess.assessment_id}?studentId=${studentId}&moduleId=${module.module_id}`
                  )
                }
              />
            ))}
          </div>
        </div>
      )}

      {/* Lessons */}
      <div className="space-y-6">
          <h2 className="text-xl font-semibold text-blue-900 mb-3">Lecture Materials</h2>
          <div>
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
          <div className="text-gray-500 text-sm">
            No lessons available for this module yet.
          </div>
        )}
        </div>
      </div>
    </div>
  );
};

export default StudentModulePage;
