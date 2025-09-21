"use client"
import { siteConfig } from '@/config/site'
import Head from 'next/head'
import { ReactNode, useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiMenu, FiLogOut, FiX } from 'react-icons/fi'
import { useUser } from '@/context/UserContext'
import { logout } from '@/lib/logout'
import toast from 'react-hot-toast'
import Footer from '../Footer'
import ScrollButtons from '../ScrollButtons'
import Sidebar from '../Sidebar'
import ConfirmDialog from '../ConfirmDialog'

interface LayoutProps {
  children: ReactNode
  title?: string
  description?: string
}

const Layout = ({
  children,
  title = siteConfig.title,
  description = siteConfig.description,
}: LayoutProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const { user } = useUser() // Add user context

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
      // Auto-close sidebar on mobile when screen becomes small
      if (window.innerWidth < 768 && isSidebarOpen) {
        setIsSidebarOpen(false)
      }
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [isSidebarOpen])

  // Close sidebar when user logs out
  useEffect(() => {
    if (!user && isSidebarOpen) {
      setIsSidebarOpen(false)
    }
  }, [user, isSidebarOpen])

  // Toggle sidebar function - only if user is logged in
  const toggleSidebar = () => {
    if (!user) return // Prevent toggle if no user
    setIsSidebarOpen(!isSidebarOpen)
  }

  // Close sidebar function
  const closeSidebar = () => {
    setIsSidebarOpen(false)
  }

  // Prevent body scroll when sidebar is open on mobile
  useEffect(() => {
    if (isMobile && isSidebarOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isMobile, isSidebarOpen])

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="flex flex-col min-h-screen bg-gray-50">
        {/* Header - Fixed at top, doesn't move */}
        <HeaderWithToggle 
          toggleSidebar={toggleSidebar} 
          isSidebarOpen={isSidebarOpen}
        />

        {/* Body container that moves with sidebar */}
        <div className="flex flex-1 relative">
          {/* Desktop Sidebar - Fixed position, doesn't scroll with content */}
          <AnimatePresence>
            {user && isSidebarOpen && !isMobile && (
              <motion.aside
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 280, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ 
                  duration: 0.3, 
                  ease: "easeInOut",
                  width: { duration: 0.3 },
                  opacity: { duration: 0.2 }
                }}
                className="bg-white shadow-lg border-r border-gray-200 flex-shrink-0 sticky top-0 h-screen overflow-hidden"
              >
                <div className="w-70 h-full">
                  <Sidebar isOpen={true} onClose={closeSidebar} />
                </div>
              </motion.aside>
            )}
          </AnimatePresence>

          {/* Mobile Sidebar - Only render when user is logged in */}
          {user && isMobile && (
            <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />
          )}

          {/* Main content container - This scrolls independently */}
          <div className="flex flex-col flex-1 min-h-0 overflow-auto">
            {/* Main content */}
            <main className="flex-grow w-full">
              {children}
            </main>

            {/* Footer */}
            <Footer />
          </div>
        </div>

        {/* Scroll Buttons */}
        <ScrollButtons />

        {/* Mobile Overlay */}
        <AnimatePresence>
          {isSidebarOpen && isMobile && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={closeSidebar}
              className="fixed inset-0 bg-black z-20 md:hidden"
            />
          )}
        </AnimatePresence>
      </div>
    </>
  )
}

// Enhanced Header Component with Sidebar Toggle
interface HeaderWithToggleProps {
  toggleSidebar: () => void
  isSidebarOpen: boolean
}

const HeaderWithToggle = ({ toggleSidebar, isSidebarOpen }: HeaderWithToggleProps) => {
  const { user, setUser } = useUser();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
  };

  const handleConfirmLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      setShowLogoutConfirm(false);
      setUser(null);
      toast.success("Logged out successfully ✅");
    } catch (error) {
      console.error("Logout failed:", error);
      toast.error("Logout failed. Please try again.");
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleCancelLogout = () => {
    setShowLogoutConfirm(false);
  };

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
            {/* Left section: sidebar toggle + title */}
            <div className="flex items-center space-x-6">
              {user ? (
                // Show functional toggle button when user is logged in
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
                // Show disabled/hidden button when user is not logged in
                <div className="w-[48px] h-[48px]" /> // Placeholder to maintain layout spacing
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

            {/* Right section: user info + logout */}
            {user && (
              <div className="flex items-center space-x-4">
                <span className="text-white font-medium">
                  {user.firstName} {user.lastName}
                </span>
                <button
                  onClick={handleLogoutClick}
                  className="group relative p-3 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-110"
                  title="Logout"
                >
                  <FiLogOut className="text-white text-xl" />
                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-red-400/30 to-pink-400/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Bottom border */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-300" />
      </header>

      {/* Confirm Dialog for Logout */}
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
  )
}

export default Layout