"use client";

import { FiX, FiLogOut, FiHome, FiBook, FiDollarSign, FiChevronDown, FiChevronRight } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { useUser } from "@/context/UserContext";
import Link from "next/link";
import { useEffect, useState } from "react";
import { logout } from "@/lib/logout";
import toast from "react-hot-toast";
import ConfirmDialog from "@/components/ConfirmDialog";
import LoadingAnimation from "@/components/LoadingAnimation";

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
  const [loading, setLoading] = useState<boolean>(true);
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  const [isMobile, setIsMobile] = useState(false);

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Toggle module expansion
  const toggleModule = (moduleId: string) => {
    const newExpanded = new Set(expandedModules);
    if (newExpanded.has(moduleId)) {
      newExpanded.delete(moduleId);
    } else {
      newExpanded.add(moduleId);
    }
    setExpandedModules(newExpanded);
  };

  // Fetch sidebar data based on role
  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      setLoading(true);
      try {
        let data;
        if (user.role === "educator") {
          const res = await fetch(`/api/sidebar/educator?userId=${user.userId}`);
          data = await res.json();
          setModules(data.modules || []);
        } else if (user.role === "student") {
          const res = await fetch(`/api/sidebar/student?userId=${user.userId}`);
          data = await res.json();
          setModules(data.enrollments.map((enrollment: any) => enrollment.module) || []);
        }
      } catch (error) {
        console.error("Failed to fetch sidebar data:", error);
        toast.error("Failed to load sidebar data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  if (!user) return null;

  const role = user.role;

  const handleLogoutClick = () => setShowLogoutConfirm(true);
  const handleCancelLogout = () => setShowLogoutConfirm(false);

  const handleConfirmLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      setUser(null);
      setShowLogoutConfirm(false);
      toast.success("Logged out successfully");
    } catch (error) {
      console.error("Logout failed:", error);
      toast.error("Logout failed. Please try again.");
    } finally {
      setIsLoggingOut(false);
    }
  };

  const dashboardRoutes: Record<string, string> = {
    admin: "/admin/dashboard",
    educator: "/educator/dashboard",
    student: "/student/dashboard",
  };

  // Get role colors
  const getRoleColors = (role: string) => {
    switch (role) {
      case "admin":
        return {
          accent: "text-purple-600 hover:text-purple-700",
        };
      case "educator":
        return {
          accent: "text-blue-600 hover:text-blue-700",
        };
      case "student":
        return {
          accent: "text-green-600 hover:text-green-700",
        };
      default:
        return {
          accent: "text-gray-600 hover:text-gray-700",
        };
    }
  };

  const roleColors = getRoleColors(role);

  // Build assessment links dynamically
  const getAssessmentHref = (
    role: string,
    moduleId: string,
    assessment: Assessment,
    userId: string
  ) => {
    if (role === "educator") {
      return assessment.type === "quiz"
        ? `/educator/module/${moduleId}/assessment/${assessment.assessment_id}/quiz?educatorId=${userId}`
        : `/educator/module/${moduleId}/assessment/${assessment.assessment_id}?educatorId=${userId}`;
    }
    if (role === "student") {
      return assessment.type === "quiz"
        ? `/student/quiz/${assessment.assessment_id}?studentId=${userId}&moduleId=${moduleId}`
        : `/student/assessments/${assessment.assessment_id}?studentId=${userId}&moduleId=${moduleId}`;
    }
    return "#";
  };

  // Component for rendering modules & assessments
  const ModuleLinks = ({ modules }: { modules: Module[] }) => (
    <div className="space-y-1">
      {modules.map((module) => {
        const hasAssessments = module.assessments && module.assessments.length > 0;
        const isExpanded = expandedModules.has(module.module_id);
        
        return (
          <div key={module.module_id} className="group">
            <div className="flex items-center">
              <Link
                href={`/${role}/module/${module.module_id}${role === "student" ? `?studentId=${user.userId}` : ""}`}
                onClick={onClose}
                className="flex-1 flex items-center gap-3 px-3 py-2.5 text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-all duration-200 font-medium text-sm group-hover:shadow-sm"
              >
                <FiBook className="w-4 h-4 text-gray-400 group-hover:text-gray-600 flex-shrink-0" />
                <span className="truncate">{module.module_name}</span>
              </Link>
              
              {hasAssessments && (
                <button
                  onClick={() => toggleModule(module.module_id)}
                  className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors duration-200 mr-2"
                >
                  {isExpanded ? (
                    <FiChevronDown className="w-4 h-4" />
                  ) : (
                    <FiChevronRight className="w-4 h-4" />
                  )}
                </button>
              )}
            </div>
            
            <AnimatePresence>
              {hasAssessments && isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="ml-6 mt-1 space-y-1 overflow-hidden"
                >
                  {module.assessments!.map((assessment) => (
                    <Link
                      key={assessment.assessment_id}
                      href={getAssessmentHref(role, module.module_id, assessment, user.userId)}
                      onClick={onClose}
                      className="flex items-center gap-3 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-all duration-200 group"
                    >
                      <div className="w-2 h-2 bg-gray-300 rounded-full group-hover:bg-gray-500 transition-colors" />
                      <span className="truncate">{assessment.title}</span>
                      <span className={`px-2 py-0.5 text-xs rounded-full capitalize ${
                        assessment.type === 'quiz' ? 'bg-purple-100 text-purple-700' : 'bg-orange-100 text-orange-700'
                      }`}>
                        {assessment.type}
                      </span>
                    </Link>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );

  // Mobile sidebar (overlay with mini header)
  if (isMobile) {
    return (
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-black z-40"
            />

            {/* Mobile Sidebar Panel */}
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ 
                type: "spring", 
                damping: 25, 
                stiffness: 200,
                duration: 0.3 
              }}
              className="fixed top-0 left-0 w-80 h-full bg-white shadow-2xl z-50 flex flex-col border-r border-gray-200"
            >
              {/* Mobile Header - Compact version */}
              <div className="p-4 border-b bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <h2 className="text-lg font-semibold text-gray-900 truncate">
                      {user.firstName} {user.lastName}
                    </h2>
                    <p className="text-sm text-gray-600 truncate">{user.email}</p>
                    <span className="inline-block px-2 py-1 mt-1 text-xs font-medium capitalize bg-gray-100 text-gray-800 rounded-full">
                      {role}
                    </span>
                  </div>
                  <button 
                    onClick={onClose} 
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <FiX className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Navigation Content */}
              <SidebarContent 
                loading={loading}
                dashboardRoutes={dashboardRoutes}
                role={role}
                roleColors={roleColors}
                modules={modules}
                ModuleLinks={ModuleLinks}
                onClose={onClose}
                handleLogoutClick={handleLogoutClick}
                isLoggingOut={isLoggingOut}
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    );
  }

  // Desktop sidebar (no header, starts below main header)
  return (
    <div className="h-[calc(100vh-104px)] bg-white flex flex-col">
      <SidebarContent 
        loading={loading}
        dashboardRoutes={dashboardRoutes}
        role={role}
        roleColors={roleColors}
        modules={modules}
        ModuleLinks={ModuleLinks}
        onClose={onClose}
        handleLogoutClick={handleLogoutClick}
        isLoggingOut={isLoggingOut}
      />

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
    </div>
  );
};

// Shared sidebar content component
interface SidebarContentProps {
  loading: boolean;
  dashboardRoutes: Record<string, string>;
  role: string;
  roleColors: { accent: string };
  modules: Module[];
  ModuleLinks: React.ComponentType<{ modules: Module[] }>;
  onClose: () => void;
  handleLogoutClick: () => void;
  isLoggingOut: boolean;
}

const SidebarContent: React.FC<SidebarContentProps> = ({
  loading,
  dashboardRoutes,
  role,
  roleColors,
  modules,
  ModuleLinks,
  onClose,
  handleLogoutClick,
  isLoggingOut
}) => (
  <>
    {/* Navigation Content */}
    <div className="flex-1 flex flex-col min-h-0">
      <nav className="flex-1 p-4 space-y-6 overflow-y-auto">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <LoadingAnimation
              size="sm"
              variant="spinner"
              text="Loading sidebar menu..."
              fullScreen={false}
            />
          </div>
        ) : (
          <>
            {/* Dashboard Link */}
            {dashboardRoutes[role] && (
              <div className="space-y-1">
                <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Navigation
                </h3>
                <Link
                  href={dashboardRoutes[role]}
                  onClick={onClose}
                  className={`flex items-center gap-3 px-3 py-2.5 ${roleColors.accent} hover:bg-gray-50 rounded-lg transition-all duration-200 font-medium text-sm group hover:shadow-sm`}
                >
                  <FiHome className="w-4 h-4 flex-shrink-0" />
                  <span>Dashboard</span>
                </Link>
              </div>
            )}

            {/* Modules Section */}
            {modules.length > 0 && (
              <div className="space-y-1">
                <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                  <FiBook className="w-3 h-3" />
                  Modules ({modules.length})
                </h3>
                <ModuleLinks modules={modules} />
              </div>
            )}

            {/* Additional Links */}
            {role === "educator" && (
              <div className="space-y-1">
                <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Account
                </h3>
                <Link
                  href="/pricing-plans"
                  onClick={onClose}
                  className={`flex items-center gap-3 px-3 py-2.5 ${roleColors.accent} hover:bg-gray-50 rounded-lg transition-all duration-200 font-medium text-sm group hover:shadow-sm`}
                >
                  <FiDollarSign className="w-4 h-4 flex-shrink-0" />
                  <span>Pricing Plans</span>
                </Link>
              </div>
            )}
          </>
        )}
      </nav>

      {/* Footer with Enhanced Logout */}
      <div className="p-4 border-t bg-gray-50/50">
        <button
          onClick={handleLogoutClick}
          disabled={isLoggingOut}
          className="w-full flex items-center justify-center gap-2 py-3 text-sm text-gray-600 hover:text-white hover:bg-gray-700 font-medium border border-gray-300 hover:border-gray-700 rounded-xl transition-all duration-300 group disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[0.99] active:scale-[0.97]"
        >
          <FiLogOut className="w-4 h-4 transition-transform group-hover:rotate-6" />
          {isLoggingOut ? "Logging out..." : "Logout"}
        </button>
      </div>
    </div>
  </>
);

export default Sidebar;