"use client";

import React, { useEffect, useState, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import StudentEventCard from "./StudentEventCard";
import StudentModuleCard from "./StudentModuleCard";
import Button from "@/components/Button";
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
  const [loading, setLoading] = useState(false);
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
      setCanScrollModuleRight(moduleEl.scrollLeft + moduleEl.clientWidth < moduleEl.scrollWidth - 10);
    }
    
    if (eventEl) {
      setCanScrollEventLeft(eventEl.scrollLeft > 10);
      setCanScrollEventRight(eventEl.scrollLeft + eventEl.clientWidth < eventEl.scrollWidth - 10);
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
    }
  }, []);

  // Flatten all assessments for event cards
  const allAssessments = useMemo(() => {
    return modules.flatMap((mod) =>
      mod.assessments.map((assess) => ({
        ...assess,
        module: `${mod.module_code} ${mod.module_name}`,
      }))
    );
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
          const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
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

  // Navigate to assessment detail page on event card click
  const handleEventCardClick = (moduleId: string, assessmentId: string) => {
    router.push(
      `/student/assessments/${assessmentId}?studentId=${userId}&moduleId=${moduleId}`
    );
  };

  // Scroll functions
  const scrollEventLeft = () => {
    eventScrollRef.current?.scrollBy({ 
      left: -350, 
      behavior: "smooth" 
    });
  };
  
  const scrollEventRight = () => {
    eventScrollRef.current?.scrollBy({ 
      left: 350, 
      behavior: "smooth" 
    });
  };

  const scrollModuleLeft = () => {
    moduleScrollRef.current?.scrollBy({ 
      left: -400, 
      behavior: "smooth" 
    });
  };
  
  const scrollModuleRight = () => {
    moduleScrollRef.current?.scrollBy({ 
      left: 400, 
      behavior: "smooth" 
    });
  };

  return (
    <div className="w-full min-h-screen space-y-12 px-0 sm:px-2 overflow-auto">
      <style jsx global>{`
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>

      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100 mx-4 sm:mx-0">
        <h1 className="text-2xl font-bold text-blue-900 mb-2">Welcome Back!</h1>
        <p className="text-blue-700">Stay on top of your assignments and explore your enrolled modules</p>
      </div>

      {/* Upcoming Events */}
      <div className="px-4 sm:px-0">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-blue-900">Upcoming Events</h2>
            <p className="text-gray-600 mt-1">Track your assignment deadlines and assessments</p>
          </div>
        </div>
        
        {loading ? (
          <div className="bg-gray-50 rounded-xl p-8 text-center border border-gray-200">
            <div className="animate-pulse">
              <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-32 mx-auto"></div>
            </div>
          </div>
        ) : allAssessments.length === 0 ? (
          <div className="bg-gray-50 rounded-xl p-8 text-center border border-gray-200">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No upcoming events</h3>
            <p className="text-gray-600">You have no upcoming events at the moment. Stay tuned for updates!</p>
          </div>
        ) : (
          <div className="relative">
            {canScrollEventLeft && (
              <button
                onClick={scrollEventLeft}
                className="absolute left-0 top-1/2 -translate-y-1/2 bg-white shadow-lg rounded-full p-3 z-20 border border-gray-200 hover:shadow-xl transition-all duration-200 hover:scale-110 hover:bg-gray-50"
              >
                <FiChevronLeft className="text-xl text-gray-700" />
              </button>
            )}
            <div
              ref={eventScrollRef}
              className="flex items-center space-x-4 overflow-x-auto hide-scrollbar px-8 py-2"
            >
              {allAssessments.map((assess) => (
                <StudentEventCard
                  key={assess.assessment_id}
                  title={assess.title}
                  module={assess.module}
                  countdown={countdowns[assess.assessment_id] || "--:--:--"}
                  date={new Date(assess.deadline).toLocaleString()}
                  onClick={() =>
                    handleEventCardClick(assess.module_id, assess.assessment_id)
                  }
                />
              ))}
            </div>
            {canScrollEventRight && (
              <button
                onClick={scrollEventRight}
                className="absolute right-0 top-1/2 -translate-y-1/2 bg-white shadow-lg rounded-full p-3 z-20 border border-gray-200 hover:shadow-xl transition-all duration-200 hover:scale-110 hover:bg-gray-50"
              >
                <FiChevronRight className="text-xl text-gray-700" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Enrolled Modules */}
      <div className="px-4 sm:px-0">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-blue-900">Enrolled Modules</h2>
            <p className="text-gray-600 mt-1">Access your enrolled courses and materials</p>
          </div>
          <Button
            variant="primary"
            size="md"
            onClick={() => setPopupOpen(true)}
            className="shadow-lg"
          >
            + Enroll New Module
          </Button>
        </div>
        
        {loading ? (
          <div className="bg-gray-50 rounded-xl p-8 text-center border border-gray-200">
            <div className="animate-pulse">
              <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-40 mx-auto"></div>
            </div>
          </div>
        ) : modules.length === 0 ? (
          <div className="bg-gray-50 rounded-xl p-8 text-center border border-gray-200">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No enrolled modules</h3>
            <p className="text-gray-600">You are not enrolled in any modules yet. Please enroll to start learning.</p>
          </div>
        ) : (
          <div className="relative">
            {canScrollModuleLeft && (
              <button
                onClick={scrollModuleLeft}
                className="absolute left-0 top-1/2 -translate-y-1/2 bg-white shadow-lg rounded-full p-3 z-20 border border-gray-200 hover:shadow-xl transition-all duration-200 hover:scale-110 hover:bg-gray-50"
              >
                <FiChevronLeft className="text-xl text-gray-700" />
              </button>
            )}
            <div
              ref={moduleScrollRef}
              className="flex items-center space-x-4 overflow-x-auto hide-scrollbar px-8 py-2"
            >
              {modules.map((mod) => (
                <div
                  key={mod.module_id}
                  className="cursor-pointer transform hover:scale-105 transition-transform duration-200"
                >
                  <StudentModuleCard
                    title={`${mod.module_code} ${mod.module_name}`}
                    image={mod.module_image_url}
                    event={mod.assessments[0]?.title || "No upcoming events"}
                    onClick={() => router.push(`/student/module/${mod.module_id}?studentId=${userId}`)}
                  />
                </div>
              ))}
            </div>
            {canScrollModuleRight && (
              <button
                onClick={scrollModuleRight}
                className="absolute right-0 top-1/2 -translate-y-1/2 bg-white shadow-lg rounded-full p-3 z-20 border border-gray-200 hover:shadow-xl transition-all duration-200 hover:scale-110 hover:bg-gray-50"
              >
                <FiChevronRight className="text-xl text-gray-700" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Quick Stats Section */}
      <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-6 border border-gray-200 mx-4 sm:mx-0">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-900">{modules.length}</div>
            <div className="text-gray-600">Enrolled Modules</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-900">{allAssessments.length}</div>
            <div className="text-gray-600">Upcoming Events</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-900">
              {allAssessments.filter(a => countdowns[a.assessment_id] !== "Expired").length}
            </div>
            <div className="text-gray-600">Active Deadlines</div>
          </div>
        </div>
      </div>

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