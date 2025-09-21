"use client";
import { siteConfig } from "@/config/site";
import Head from "next/head";
import { ReactNode, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useUser } from "@/context/UserContext";
import Footer from "../Footer";
import ScrollButtons from "../ScrollButtons";
import Sidebar from "../Sidebar";
import Header from "../Header";

interface LayoutProps {
  children: ReactNode;
  title?: string;
  description?: string;
}

const Layout = ({
  children,
  title = siteConfig.title,
  description = siteConfig.description,
}: LayoutProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { user } = useUser();

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768 && isSidebarOpen) {
        setIsSidebarOpen(false);
      }
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, [isSidebarOpen]);

  useEffect(() => {
    if (!user && isSidebarOpen) {
      setIsSidebarOpen(false);
    }
  }, [user, isSidebarOpen]);

  const toggleSidebar = () => {
    if (!user) return;
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => setIsSidebarOpen(false);

  useEffect(() => {
    if (isMobile && isSidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobile, isSidebarOpen]);

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="flex flex-col min-h-screen bg-gray-50">
        <Header toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />

        <div className="flex flex-1 relative">
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
                  opacity: { duration: 0.2 },
                }}
                className="bg-white shadow-lg border-r border-gray-200 flex-shrink-0 sticky top-0 h-screen overflow-hidden"
              >
                <Sidebar isOpen={true} onClose={closeSidebar} />
              </motion.aside>
            )}
          </AnimatePresence>

          {user && isMobile && (
            <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />
          )}

          <div className="flex flex-col flex-1 min-h-0 overflow-auto">
            <main className="flex-grow w-full">{children}</main>
            <Footer />
          </div>
        </div>

        <ScrollButtons />

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
  );
};

export default Layout;
