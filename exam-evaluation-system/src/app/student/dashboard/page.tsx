"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import StudentEventCard from "./StudentEventCard";
import StudentModuleCard from "./StudentModuleCard";
import Button from "@/components/Button";
import toast from "react-hot-toast";
import EnrollModulePopup from "./ModuleEnrollPopup";

interface Assessment {
  assessment_id: string;
  module_id: string; // needed for navigation
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

  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(false);
  const [popupOpen, setPopupOpen] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [countdowns, setCountdowns] = useState<Record<string, string>>({});

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

  // Navigate to assessment detail page on event card click
  const handleEventCardClick = (moduleId: string, assessmentId: string) => {
    router.push(
      `/student/assessments/${assessmentId}?studentId=${userId}&moduleId=${moduleId}`
    );
  };

  return (
    <div className="w-full min-h-screen space-y-12 px-0 sm:px-2 overflow-auto">
      {/* Upcoming Events */}
      <div>
        <h2 className="text-xl font-bold text-blue-900 mb-4">
          Upcoming Events
        </h2>
        {loading ? (
          <p>Loading events...</p>
        ) : allAssessments.length === 0 ? (
          <p className="text-gray-600">
            You have no upcoming events at the moment. Stay tuned for updates!
          </p>
        ) : (
          <div className="flex items-center space-x-4 overflow-x-auto">
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
        )}
      </div>

      {/* Enrolled Modules */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-blue-900">Enrolled Modules</h2>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setPopupOpen(true)}
          >
            Enroll New Module
          </Button>
        </div>
        {loading ? (
          <p>Loading enrolled modules...</p>
        ) : modules.length === 0 ? (
          <p className="text-gray-600">
            You are not enrolled in any modules yet. Please enroll to start
            learning.
          </p>
        ) : (
          <div className="flex items-center space-x-4 overflow-x-auto">
            {modules.map((mod) => (
              <StudentModuleCard
                key={mod.module_id}
                title={`${mod.module_code} ${mod.module_name}`}
                image={mod.module_image_url}
                event={mod.assessments[0]?.title || "No upcoming events"}
                onClick={() => router.push(`/student/module/${mod.module_id}?studentId=${userId}`)}
              />
            ))}
          </div>
        )}
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