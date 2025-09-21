"use client";

import { FiX, FiLogOut } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { useUser } from "@/context/UserContext";
import Link from "next/link";
import { useEffect, useState } from "react";
import { logout } from "@/lib/logout";
import toast from "react-hot-toast";
import ConfirmDialog from "@/components/ConfirmDialog";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Assessment {
  assessment_id: string;
  title: string;
  type: string;
}

interface Module {
  module_id: string;
  module_name: string;
  assessments?: Assessment[];
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user, setUser } = useUser();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const [modules, setModules] = useState<Module[]>([]);

  // Fetch sidebar data based on role
  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      try {
        if (user.role === "educator") {
          const res = await fetch(
            `/api/sidebar/educator?userId=${user.userId}`
          );
          const data = await res.json();
          setModules(data.modules || []);
        } else if (user.role === "student") {
          const res = await fetch(`/api/sidebar/student?userId=${user.userId}`);
          const data = await res.json();
          const enrolledModules = data.enrollments.map(
            (enrollment: any) => enrollment.module
          );
          setModules(enrolledModules || []);
        }
      } catch (error) {
        console.error("Failed to fetch sidebar data:", error);
      }
    };

    fetchData();
  }, [user]);

  if (!user) return null;

  const role = user?.role || "guest";

  const handleLogoutClick = () => setShowLogoutConfirm(true);
  const handleCancelLogout = () => setShowLogoutConfirm(false);

  const handleConfirmLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      setShowLogoutConfirm(false);
      setUser(null);
      toast.success("Logged out successfully");
    } catch (error) {
      console.error("Logout failed:", error);
      toast.error("Logout failed. Please try again.");
    } finally {
      setIsLoggingOut(false);
    }
  };

  // Map role to dashboard route
  const dashboardRoutes: Record<string, string> = {
    admin: "/admin/dashboard",
    educator: "/educator/dashboard",
    student: "/student/dashboard",
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black z-40"
          />

          {/* Sidebar Panel */}
          <motion.aside
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "tween", duration: 0.3 }}
            className="fixed top-0 left-0 w-64 h-full bg-white shadow-2xl z-50 flex flex-col"
          >
            {/* Header with User Info */}
            <div className="p-4 border-b">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-semibold text-gray-900">
                  {user.firstName} {user.lastName}
                </h2>
                <button
                  onClick={onClose}
                  className="text-gray-600 hover:text-gray-900"
                >
                  <FiX className="text-xl" />
                </button>
              </div>
              <p className="text-sm text-gray-600">{user.email}</p>
              <p className="text-xs text-gray-500 capitalize mt-1">{role}</p>
            </div>

            {/* Dynamic Nav Links */}
            <nav className="flex-1 p-4 space-y-4 overflow-y-auto">
              {/* Dashboard link */}
              {dashboardRoutes[role] && (
                <Link
                  href={dashboardRoutes[role]}
                  onClick={onClose}
                  className="block text-purple-700 font-semibold hover:underline"
                >
                  Dashboard
                </Link>
              )}

              {role === "educator" && (
                <>
                  <h3 className="text-sm font-semibold text-gray-700">
                    My Modules
                  </h3>
                  {modules.map((module) => (
                    <div key={module.module_id} className="ml-2">
                      {/* 👇 Module click */}
                      <Link
                        href={`/educator/module/${module.module_id}`}
                        onClick={onClose}
                        className="block text-gray-800 hover:text-purple-600 font-medium"
                      >
                        {module.module_name}
                      </Link>
                      {module.assessments && module.assessments.length > 0 && (
                        <div className="ml-4 mt-1 space-y-1">
                          {module.assessments.map((assessment) => {
                            const href =
                              assessment.type === "quiz"
                                ? `/educator/module/${module.module_id}/assessment/${assessment.assessment_id}/quiz?educatorId=${user.userId}`
                                : `/educator/module/${module.module_id}/assessment/${assessment.assessment_id}?educatorId=${user.userId}`;

                            return (
                              <Link
                                key={assessment.assessment_id}
                                href={href}
                                onClick={onClose}
                                className="block text-sm text-gray-600 hover:text-purple-600"
                              >
                                {assessment.title}
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ))}
                </>
              )}

              {role === "student" && (
                <>
                  <h3 className="text-sm font-semibold text-gray-700">
                    Enrolled Modules
                  </h3>
                  {modules.map((module) => (
                    <div key={module.module_id} className="ml-2">
                      <Link
                        href={`/student/module/${module.module_id}`}
                        onClick={onClose}
                        className="block text-gray-800 hover:text-purple-600 font-medium"
                      >
                        {module.module_name}
                      </Link>
                      {module.assessments && module.assessments.length > 0 && (
                        <div className="ml-4 mt-1 space-y-1">
                          {module.assessments.map((assessment) => (
                            <Link
                              key={assessment.assessment_id}
                              href={`/student/module/${module.module_id}/assessment/${assessment.assessment_id}`}
                              onClick={onClose}
                              className="block text-sm text-gray-600 hover:text-purple-600"
                            >
                              {assessment.title}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </>
              )}
            </nav>

            {/* Footer with Logout */}
            <div className="p-4 border-t bg-gray-50">
              <button
                onClick={handleLogoutClick}
                className="w-full flex items-center justify-center gap-2 py-2 text-sm text-red-600 hover:text-red-800 font-medium border border-red-200 hover:bg-red-50 rounded-md transition-colors"
              >
                <FiLogOut className="text-lg" />
                Logout
              </button>
            </div>
          </motion.aside>

          {/* Confirm Dialog */}
          <ConfirmDialog
            isOpen={showLogoutConfirm}
            title="Confirm Logout"
            message="Are you sure you want to log out?"
            onConfirm={handleConfirmLogout}
            onCancel={handleCancelLogout}
            confirmText="Logout"
            cancelText="Cancel"
            variant="primary"
            icon={<FiLogOut className="w-6 h-6" />}
            loading={isLoggingOut}
          />
        </>
      )}
    </AnimatePresence>
  );
};

export default Sidebar;
