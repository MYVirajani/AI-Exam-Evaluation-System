"use client";
import { siteConfig } from "@/config/site";
import { FiMenu, FiLogOut, FiX } from "react-icons/fi";
import { useUser } from "@/context/UserContext";
import { useState } from "react";
import toast from "react-hot-toast";
import { logout } from "@/lib/logout";
import ConfirmDialog from "../ConfirmDialog";

interface HeaderProps {
  toggleSidebar: () => void;
  isSidebarOpen: boolean;
}

const Header = ({ toggleSidebar, isSidebarOpen }: HeaderProps) => {
  const { user, setUser } = useUser();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogoutClick = () => setShowLogoutConfirm(true);

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

  const handleCancelLogout = () => setShowLogoutConfirm(false);

  return (
    <>
      <header className="relative overflow-hidden sticky top-0 z-10">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-800 via-blue-600 to-cyan-400" />
        <div className="absolute inset-0 bg-black/10 backdrop-blur-sm" />

        {/* Floating circles */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
          <div className="absolute -top-4 -left-4 w-24 h-24 bg-white/5 rounded-full animate-pulse" />
          <div
            className="absolute top-8 right-16 w-16 h-16 bg-white/3 rounded-full animate-bounce"
            style={{ animationDelay: "1s", animationDuration: "3s" }}
          />
          <div
            className="absolute bottom-4 left-1/3 w-20 h-20 bg-white/4 rounded-full animate-pulse"
            style={{ animationDelay: "0.5s" }}
          />
        </div>

        {/* Content */}
        <div className="relative z-10 p-6">
          <div className="flex items-center justify-between">
            {/* Left: Sidebar toggle & title */}
            <div className="flex items-center space-x-6">
              {user ? (
                <button
                  onClick={toggleSidebar}
                  className="group relative p-2 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-110"
                  aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
                >
                  {isSidebarOpen ? (
                    <FiX className="text-white text-xl group-hover:rotate-90 transition-transform duration-300" />
                  ) : (
                    <FiMenu className="text-white text-xl group-hover:rotate-90 transition-transform duration-300" />
                  )}
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-400/20 to-cyan-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </button>
              ) : (
                <div className="w-[48px] h-[48px]" />
              )}

              <div className="space-y-1">
                <h1 className="text-3xl font-bold text-white drop-shadow-lg tracking-tight">
                  {siteConfig.title}
                </h1>
                {siteConfig.description && (
                  <p className="text-white/80 text-sm font-medium drop-shadow-sm">
                    {siteConfig.description}
                  </p>
                )}
              </div>
            </div>

            {/* Right: User info + logout */}
            {user && (
              <div className="flex items-center space-x-3 sm:space-x-4">
                <div className="text-left sm:text-right">
                  <div className="text-white font-medium text-sm sm:text-base truncate">
                    {user.firstName} {user.lastName}
                  </div>
                  {user.role && (
                    <div className="text-white/70 text-xs sm:text-sm truncate">
                      {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </div>
                  )}
                </div>

                <button
                  onClick={handleLogoutClick}
                  className="group relative p-2.5 sm:p-3 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-110"
                  title="Logout"
                >
                  <FiLogOut className="text-white text-lg sm:text-xl" />
                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400/30 to-blue-400/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-300" />
      </header>

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
  );
};

export default Header;
