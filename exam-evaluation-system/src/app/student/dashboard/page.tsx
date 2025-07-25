"use client";

import React, { useEffect, useState } from "react";
import StudentEventCard from "./StudentEventCard";
import StudentModuleCard, { getRandomFallback } from "./StudentModuleCard";
import Button from "@/components/Button";
import toast from "react-hot-toast";
import EnrollModulePopup from "./ModuleEnrollPopup";

interface Assessment {
  assessment_id: string;
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
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(false);
  const [popupOpen, setPopupOpen] = useState(false);
  const [userId, setUserId] = useState<string | null>(null); // store userId here

  const fetchEnrolledModules = async (currentUserId: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/student/enrollments?user_id=${currentUserId}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setModules(data.modules || []);
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

  const allAssessments = modules.flatMap((mod) =>
    mod.assessments.map((assess) => ({
      ...assess,
      module: `${mod.module_code} ${mod.module_name}`,
    }))
  );

  return (
    <div className="w-full min-h-screen space-y-12 px-0 sm:px-2 overflow-auto">
      {/* Upcoming Events */}
      <div>
        <h2 className="text-xl font-bold text-blue-900 mb-4">Upcoming Events</h2>
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
                countdown="--:--:--"
                date={new Date(assess.deadline).toLocaleString()}
              />
            ))}
          </div>
        )}
      </div>

      {/* Enrolled Modules */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-blue-900">Enrolled Modules</h2>
          <Button variant="primary" size="sm" onClick={() => setPopupOpen(true)}>
            Enroll New Module
          </Button>
        </div>
        {loading ? (
          <p>Loading enrolled modules...</p>
        ) : modules.length === 0 ? (
          <p className="text-gray-600">
            You are not enrolled in any modules yet. Please enroll to start learning.
          </p>
        ) : (
          <div className="flex items-center space-x-4 overflow-x-auto">
            {modules.map((mod) => (
              <StudentModuleCard
                key={mod.module_id}
                title={`${mod.module_code} ${mod.module_name}`}
                image={
                  mod.module_image_url?.trim()
                    ? mod.module_image_url
                    : getRandomFallback()
                }
                event={mod.assessments[0]?.title || "No upcoming events"}
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
