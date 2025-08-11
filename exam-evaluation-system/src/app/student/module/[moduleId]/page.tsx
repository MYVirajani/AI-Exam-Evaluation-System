"use client";

import React, { useEffect, useState } from "react";
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

  // Navigate to assessment detail page on event card click - Updated with type-based routing
  const handleEventCardClick = (moduleId: string, assessmentId: string, assessmentType: string) => {
    if (assessmentType === 'quiz') {
      router.push(
        `/student/quiz/${assessmentId}?studentId=${studentId}&moduleId=${moduleId}`
      );
    } else {
      router.push(
        `/student/assessments/${assessmentId}?studentId=${studentId}&moduleId=${moduleId}`
      );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-4 animate-pulse">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div className="text-slate-600 text-lg font-medium">Loading module data...</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!module) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-red-400 to-red-600 rounded-full mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="text-red-600 text-lg font-medium">Module not found or access denied.</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-7xl">
        <div className="space-y-8 lg:space-y-12">
          {/* Module Header */}
          <div className="relative overflow-hidden bg-white rounded-2xl shadow-xl border border-slate-200/50 backdrop-blur-sm">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 via-purple-600/5 to-indigo-600/5"></div>
            <div className="relative p-8 sm:p-10">
              <div className="space-y-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-4 flex-1">
                    <div className="inline-flex items-center px-3 py-1 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 text-sm font-semibold rounded-full border border-blue-200/50">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                      {module.module_code}
                    </div>
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-slate-800 via-blue-800 to-purple-800 bg-clip-text text-transparent leading-tight">
                      {module.module_name}
                    </h1>
                    <div className="flex flex-wrap items-center gap-4 text-slate-600">
                      <div className="flex items-center">
                        <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4M8 7H6a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V9a2 2 0 00-2-2h-2M8 7v4" />
                        </svg>
                        <span className="font-medium">{module.semester}</span>
                      </div>
                      <div className="flex items-center">
                        <svg className="w-5 h-5 mr-2 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        <span className="font-medium">{module.education_institute}</span>
                      </div>
                      <div className="flex items-center">
                        <svg className="w-5 h-5 mr-2 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span className="font-medium">{module.educator.user.first_name} {module.educator.user.last_name}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {module.learning_outcomes && (
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-indigo-500/10 rounded-xl"></div>
                    <div className="relative p-6 border border-blue-200/50 rounded-xl backdrop-blur-sm">
                      <div className="flex items-center mb-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mr-3">
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <h3 className="text-lg font-semibold bg-gradient-to-r from-blue-700 to-purple-700 bg-clip-text text-transparent">
                          Learning Outcomes
                        </h3>
                      </div>
                      <p className="text-slate-700 leading-relaxed pl-11">
                        {module.learning_outcomes}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Assessment Events */}
          {assessments.length > 0 && (
            <div className="bg-white rounded-2xl shadow-xl border border-slate-200/50 p-8 sm:p-10">
              <div className="flex items-center mb-8">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-800 to-purple-800 bg-clip-text text-transparent">
                  Upcoming Assessments
                </h2>
              </div>
              
              {/* Mobile: Grid, Desktop: Horizontal scroll */}
              <div className="block sm:hidden">
                <div className="grid gap-6">
                  {assessments.map((assess) => (
                    <StudentEventCard
                      key={assess.assessment_id}
                      title={assess.title}
                      module={`${module.module_code} ${module.module_name}`}
                      countdown={countdowns[assess.assessment_id] || "--:--:--"}
                      date={new Date(assess.deadline).toLocaleString()}
                      onClick={() =>
                        handleEventCardClick(module.module_id, assess.assessment_id, assess.type)
                      }
                    />
                  ))}
                </div>
              </div>
              
              <div className="hidden sm:block">
                <div className="flex overflow-x-auto space-x-6 pb-6 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100">
                  {assessments.map((assess) => (
                    <div key={assess.assessment_id} className="flex-shrink-0 transform hover:scale-105 transition-transform duration-200">
                      <StudentEventCard
                        title={assess.title}
                        module={`${module.module_code} ${module.module_name}`}
                        countdown={countdowns[assess.assessment_id] || "--:--:--"}
                        date={new Date(assess.deadline).toLocaleString()}
                        onClick={() =>
                          handleEventCardClick(module.module_id, assess.assessment_id, assess.type)
                        }
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Lessons Section */}
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200/50 p-8 sm:p-10">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-indigo-800 to-purple-800 bg-clip-text text-transparent">
                  Learning Materials
                </h2>
              </div>
              {lessons.length > 0 && (
                <div className="hidden sm:flex items-center px-4 py-2 bg-gradient-to-r from-blue-50 to-purple-50 rounded-full border border-blue-200/50">
                  <span className="text-sm font-semibold text-blue-800">{lessons.length} Lesson{lessons.length !== 1 ? 's' : ''}</span>
                </div>
              )}
            </div>
            
            <div className="space-y-6">
              {lessons.length > 0 ? (
                lessons.map((lesson, index) => (
                  <div key={lesson.lesson_id} className="transform hover:scale-[1.02] transition-all duration-200">
                    <StudentLessonCard
                      lesson_id={lesson.lesson_id}
                      title={lesson.title}
                      lessonNumber={index + 1}
                      materials={lesson.materials}
                      instructor={`${module.educator.user.first_name} ${module.educator.user.last_name}`}
                    />
                  </div>
                ))
              ) : (
                <div className="text-center py-16">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-32 h-32 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full opacity-20"></div>
                    </div>
                    <div className="relative">
                      <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl mb-6">
                        <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                      </div>
                      <h3 className="text-xl font-bold text-slate-800 mb-3">No Lessons Available Yet</h3>
                      <p className="text-slate-600 max-w-md mx-auto leading-relaxed">
                        Your instructor hasn't uploaded any lesson materials yet. Check back soon for updates and new content.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentModulePage;