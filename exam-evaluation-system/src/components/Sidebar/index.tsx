"use client";

import { FiX } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { useUser } from "@/context/UserContext";
import { sidebarMenuConfig } from "@/config/sidebarMenu";
import Link from "next/link";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user } = useUser();
  const role = user?.role || "guest";
  console.log("role:", role);
  const menuItems = sidebarMenuConfig[role] || [];

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
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold text-gray-900 capitalize">
                {role} Menu
              </h2>
              <button onClick={onClose} className="text-gray-600 hover:text-gray-900">
                <FiX className="text-xl" />
              </button>
            </div>

            {/* Dynamic Nav Links */}
            <nav className="flex-1 p-4 space-y-4">
              {menuItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className="block text-gray-800 hover:text-purple-600 font-medium transition-colors"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};

export default Sidebar;
