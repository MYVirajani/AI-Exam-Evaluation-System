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
  openAt:string;
  closeAt:string;
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
  const [creatingEvent, setCreatingEvent] = useState(false);
  const [showScrollButtons, setShowScrollButtons] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Check scroll position and update button states
  const checkScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
      setShowScrollButtons(scrollWidth > clientWidth);
    }
  };

  // Handle scroll button clicks
  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 300, behavior: 'smooth' });
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
    if (!moduleId) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/educator/module/${moduleId}`);
        if (!res.ok) throw new Error("Failed to fetch module data");

        const data = await res.json();
        // console.log('data: ', data);

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
            openAt:a.open_at,
            closeAt:a.close_at,
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

  // Check scroll after assessments change
  useEffect(() => {
    if (moduleData?.assessments) {
      setTimeout(checkScroll, 100);
      window.addEventListener('resize', checkScroll);
      return () => window.removeEventListener('resize', checkScroll);
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

    // Add submissionsCount with default value 0 to the new assessment
    const newAssessment = {
      ...json.assessment,
      submissionsCount: 0, // Default value for new assessment
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

  // Generate breadcrumbs
  const breadcrumbs = moduleData 
    ? getModuleBreadcrumbs(moduleData.moduleCode, moduleData.moduleId, 'educator')
    : [{ label: 'Dashboard', href: '/educator/dashboard' }, { label: 'Module', current: true }];

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
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-lg mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
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
      </div>
    );
  }

  if (!moduleData) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-lg mx-auto">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
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
      </div>
    );
  }

  const { moduleName, moduleCode, lessons, assessments } = moduleData;

  return (
    <div className="min-h-screen bg-gray-50">
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

      {/* Main Content Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        
        {/* Breadcrumbs */}
        <div className="mb-6">
          <Breadcrumbs 
            items={breadcrumbs} 
            className=""
          />
        </div>
        
        {/* Header Section */}
        <div className="mb-8 sm:mb-12">
          <div className="text-center">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-blue-900 mb-2">
              {moduleCode} - {moduleName}
            </h1>
          </div>
        </div>

        {/* Assessments Section */}
        <div className="mb-12 sm:mb-16">
          <div className="max-w-full mx-auto">
            
            {/* Section Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
              <h2 className="text-xl sm:text-2xl font-semibold text-blue-800">
                Upcoming Events
              </h2>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsEventModalOpen(true)}
                disabled={creatingEvent}
                className="w-full sm:w-auto"
              >
                + New Event
              </Button>
            </div>

            {/* Assessments Content */}
            {assessments.length === 0 ? (
              <div className="text-center py-12 sm:py-16">
                <div className="max-w-md mx-auto">
                  <div className="text-gray-400 mb-6">
                    <svg className="w-16 h-16 sm:w-20 sm:h-20 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 4h6m2-4h-2V5a1 1 0 00-1-1h-4a1 1 0 00-1 1v6h-2l2 2 2-2z" />
                    </svg>
                  </div>
                  <p className="text-gray-600 italic text-lg">No assessments scheduled.</p>
                </div>
              </div>
            ) : (
              <div className="relative">
                {/* Scroll Navigation Buttons */}
                {showScrollButtons && (
                  <>
                    <button
                      onClick={scrollLeft}
                      disabled={!canScrollLeft}
                      className={`absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white shadow-lg border border-gray-200 flex items-center justify-center transition-all duration-200 ${
                        canScrollLeft 
                          ? 'text-blue-600 hover:bg-blue-50 hover:border-blue-300' 
                          : 'text-gray-300 cursor-not-allowed'
                      }`}
                      aria-label="Scroll left"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    
                    <button
                      onClick={scrollRight}
                      disabled={!canScrollRight}
                      className={`absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white shadow-lg border border-gray-200 flex items-center justify-center transition-all duration-200 ${
                        canScrollRight 
                          ? 'text-blue-600 hover:bg-blue-50 hover:border-blue-300' 
                          : 'text-gray-300 cursor-not-allowed'
                      }`}
                      aria-label="Scroll right"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </>
                )}

                {/* Scrollable Container */}
                <div 
                  ref={scrollContainerRef}
                  className="flex gap-3 overflow-x-auto scrollbar-hide pb-4 px-12 sm:px-0"
                  onScroll={checkScroll}
                  style={{
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none',
                  }}
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

        {/* Lessons Section */}
        <div className="mb-8">
          <div className="max-w-6xl mx-auto">
            
            {/* Section Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
              <h2 className="text-xl sm:text-2xl font-semibold text-blue-800">
                Lecture Materials
              </h2>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsLessonModalOpen(true)}
                disabled={creatingEvent}
                className="w-full sm:w-auto"
              >
                + Lecture Materials
              </Button>
            </div>

            {/* Lessons Content */}
            {lessons.length === 0 ? (
              <div className="text-center py-12 sm:py-16">
                <div className="max-w-md mx-auto">
                  <div className="text-gray-400 mb-6">
                    <svg className="w-16 h-16 sm:w-20 sm:h-20 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <p className="text-gray-600 italic text-lg">
                    No lecture materials have been added yet.
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center space-y-4 sm:space-y-6">
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
      `}</style>
    </div>
  );
}