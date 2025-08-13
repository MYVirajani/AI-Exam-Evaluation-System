"use client";

import React, { useEffect, useState, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { FiChevronLeft, FiChevronRight, FiCalendar, FiBook, FiClock, FiTrendingUp } from "react-icons/fi";
import StudentEventCard from "./StudentEventCard";
import StudentModuleCard from "./StudentModuleCard";
import Button from "@/components/Button";
import LoadingAnimation from "@/components/LoadingAnimation";
import toast from "react-hot-toast";
import EnrollModulePopup from "./ModuleEnrollPopup";

interface Assessment {
  assessment_id: string;
  module_id: string;
  title: string;
  type: string;
  deadline: string;
}

interface Module {
  module_id: string;
  module_code: string;
  module_name: string;
  module_image_url?: string;
  assessments: Assessment[];
}

const StudentHomePage: React.FC = () => {
  const router = useRouter();
  const moduleScrollRef = useRef<HTMLDivElement>(null);
  const eventScrollRef = useRef<HTMLDivElement>(null);

  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [popupOpen, setPopupOpen] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [countdowns, setCountdowns] = useState<Record<string, string>>({});

  // Scroll button states
  const [canScrollModuleLeft, setCanScrollModuleLeft] = useState(false);
  const [canScrollModuleRight, setCanScrollModuleRight] = useState(false);
  const [canScrollEventLeft, setCanScrollEventLeft] = useState(false);
  const [canScrollEventRight, setCanScrollEventRight] = useState(false);

  const updateScrollButtons = () => {
    const moduleEl = moduleScrollRef.current;
    const eventEl = eventScrollRef.current;

    if (moduleEl) {
      setCanScrollModuleLeft(moduleEl.scrollLeft > 10);
      setCanScrollModuleRight(
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

  const fetchEnrolledModules = async (currentUserId: string) => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/student/enrollments?user_id=${currentUserId}`
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      // Attach module_id to assessments for routing
      const modulesWithAssessments = data.modules.map((mod: any) => ({
        ...mod,
        assessments: mod.assessments.map((assess: any) => ({
          ...assess,
          module_id: mod.module_id,
        })),
      }));

      setModules(modulesWithAssessments || []);
    } catch (error: any) {
      console.error("Error fetching modules:", error);
      toast.error(error.message || "Failed to fetch enrolled modules");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (user.user_id) {
      setUserId(user.user_id);
      fetchEnrolledModules(user.user_id);
    } else {
      toast.error("User ID not found. Please log in again.");
      setLoading(false);
    }
  }, []);

  // Flatten all assessments for event cards - include type
 const allAssessments = useMemo(() => {
  return modules
    .flatMap((mod) =>
      mod.assessments.map((assess) => ({
        ...assess,
        module: `${mod.module_code} ${mod.module_name}`,
        type: assess.type,
      }))
    )
    .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
}, [modules]);


  // Countdown timers update every second
  useEffect(() => {
    const updateCountdowns = () => {
      const now = Date.now();
      const newCountdowns: Record<string, string> = {};

      allAssessments.forEach(({ assessment_id, deadline }) => {
        const deadlineTime = new Date(deadline).getTime();
        const diff = deadlineTime - now;

        if (diff <= 0) {
          newCountdowns[assessment_id] = "Expired";
        } else {
          const days = Math.floor(diff / (1000 * 60 * 60 * 24));
          const hours = Math.floor(
            (diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
          );
          const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((diff % (1000 * 60)) / 1000);

          const parts: string[] = [];
          if (days > 0) parts.push(`${days}d`);
          if (hours > 0 || parts.length > 0) parts.push(`${hours}h`);
          if (minutes > 0 || parts.length > 0) parts.push(`${minutes}m`);
          parts.push(`${seconds}s`);

          newCountdowns[assessment_id] = parts.join(" ");
        }
      });

      setCountdowns(newCountdowns);
    };

    updateCountdowns(); // initial call
    const timer = setInterval(updateCountdowns, 1000);
    return () => clearInterval(timer);
  }, [allAssessments]);

  // Update scroll buttons when content changes
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
  }, [modules, allAssessments]);

  // Navigate to assessment detail page on event card click - Updated with type-based routing
  const handleEventCardClick = (moduleId: string, assessmentId: string, assessmentType: string) => {
    if (assessmentType === 'quiz') {
      router.push(
        `/student/quiz/${assessmentId}?studentId=${userId}&moduleId=${moduleId}`
      );
    } else {
      router.push(
        `/student/assessments/${assessmentId}?studentId=${userId}&moduleId=${moduleId}`
      );
    }
  };

  // Scroll functions
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

  // Show full screen loading animation on initial load
  if (loading) {
    return (
      <LoadingAnimation
        size="lg"
        variant="wave"
        text="Loading your dashboard..."
        fullScreen={true}
        color="blue"
      />
    );
  }

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

      {/* Main Content Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Hero Section */}
        <div className="relative overflow-hidden">
          <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 rounded-3xl p-8 md:p-12 text-white relative">
            <div className="absolute inset-0 bg-black/10 rounded-3xl"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between">
                <div className="space-y-4">
                  <div className="inline-flex items-center px-4 py-2 bg-white/20 rounded-full text-sm font-medium backdrop-blur-sm">
                    <FiTrendingUp className="w-4 h-4 mr-2" />
                    Student Dashboard
                  </div>
                  <h1 className="text-4xl md:text-5xl font-bold leading-tight">
                    Welcome Back!
                  </h1>
                  <p className="text-blue-100 text-lg md:text-xl max-w-2xl">
                    Track your progress, manage assignments, and explore your enrolled modules all in one place.
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Enrolled Modules</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{modules.length}</p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <FiBook className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Upcoming Events</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{allAssessments.length}</p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-xl flex items-center justify-center">
                <FiCalendar className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Deadlines</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {allAssessments.filter(a => countdowns[a.assessment_id] !== "Expired").length}
                </p>
              </div>
              <div className="h-12 w-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <FiClock className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Upcoming Events Section */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
          <div className="px-6 py-5 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Upcoming Events</h2>
                <p className="text-gray-600 mt-1">Track your assignment deadlines and assessments</p>
              </div>
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
            </div>
          </div>
          
          <div className="p-6">
            {allAssessments.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FiCalendar className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No upcoming events</h3>
                <p className="text-gray-600 max-w-sm mx-auto">
                  You have no upcoming events at the moment. Stay tuned for updates!
                </p>
              </div>
            ) : (
              <div
                ref={eventScrollRef}
                className="flex space-x-4 overflow-x-auto hide-scrollbar pb-2"
              >
                {allAssessments.map((assess) => (
                  <StudentEventCard
                    key={assess.assessment_id}
                    title={assess.title}
                    module={assess.module}
                    countdown={countdowns[assess.assessment_id] || "--:--:--"}
                    date={new Date(assess.deadline).toLocaleString()}
                    onClick={() =>
                      handleEventCardClick(assess.module_id, assess.assessment_id,  assess.type)
                    }
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Enrolled Modules Section */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
          <div className="px-6 py-5 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Enrolled Modules</h2>
                <p className="text-gray-600 mt-1">Access your enrolled courses and materials</p>
              </div>
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  {canScrollModuleLeft && (
                    <button
                      onClick={scrollModuleLeft}
                      className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
                    >
                      <FiChevronLeft className="w-5 h-5 text-gray-600" />
                    </button>
                  )}
                  {canScrollModuleRight && (
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
                  onClick={() => setPopupOpen(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  + Enroll New Module
                </Button>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            {modules.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FiBook className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No enrolled modules</h3>
                <p className="text-gray-600 max-w-sm mx-auto mb-6">
                  You are not enrolled in any modules yet. Please enroll to start learning.
                </p>
                {/* <Button
                  variant="primary"
                  size="md"
                  onClick={() => setPopupOpen(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  Enroll in Your First Module
                </Button> */}
              </div>
            ) : (
              <div
                ref={moduleScrollRef}
                className="flex space-x-4 overflow-x-auto hide-scrollbar pb-2"
              >
                {modules.map((mod) => (
                  <div
                    key={mod.module_id}
                    className="cursor-pointer transform hover:scale-105 transition-transform duration-200"
                  >
                    <StudentModuleCard
                      title={`${mod.module_code} ${mod.module_name}`}
                      image={mod.module_image_url}
                      assessments={mod.assessments}
                      onClick={() =>
                        router.push(
                          `/student/module/${mod.module_id}?studentId=${userId}`
                        )
                      }
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Enroll Module Popup */}
      {userId && (
        <EnrollModulePopup
          isOpen={popupOpen}
          onClose={() => setPopupOpen(false)}
          userId={userId}
          onSuccess={() => fetchEnrolledModules(userId)}
        />
      )}
    </div>
  );
};

export default StudentHomePage;