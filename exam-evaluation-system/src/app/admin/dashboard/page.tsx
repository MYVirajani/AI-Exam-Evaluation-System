"use client";

import { useState, useEffect } from "react";
import StudentsTable from "./StudentsTable";
import EducatorsTable from "./EducatorsTable";
import AdminsTable from "./AdminsTable";
import PricingPlansTable from "./PricingPlansTable";
import EvaluationModelsTable from "./EvaluationModelsTable";
import { GraduationCap, Presentation, Settings, Menu, X } from "lucide-react";

type MainTab = "users" | "pricing" | "evaluation";
type UserRole = "student" | "educator" | "admin";

interface UserCounts {
  students: number;
  educators: number;
  admins: number;
}

export const AdminDashboard: React.FC = () => {
  const [mainTab, setMainTab] = useState<MainTab>("users");
  const [userRoleTab, setUserRoleTab] = useState<UserRole>("student");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [userCounts, setUserCounts] = useState<UserCounts>({
    students: 0,
    educators: 0,
    admins: 0,
  });

  const userTabs: { key: UserRole; label: string; icon: React.ElementType }[] = [
    { key: "student", label: "Students", icon: GraduationCap },
    { key: "educator", label: "Educators", icon: Presentation },
    { key: "admin", label: "Admins", icon: Settings },
  ];

  const mainTabs: { key: MainTab; label: string }[] = [
    { key: "users", label: "User Management" },
    { key: "pricing", label: "Pricing Plans" },
    { key: "evaluation", label: "Exam Evaluation Models" },
  ];

  useEffect(() => {
    const fetchUserCounts = async () => {
      try {
        const res = await fetch("/api/admin/users");
        const data = await res.json();
        if (data.counts) {
          setUserCounts(data.counts);
        }
      } catch (err) {
        console.error("Failed to fetch user counts", err);
      }
    };

    fetchUserCounts();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">Admin Dashboard</h1>
            <p className="mt-2 text-sm text-gray-600">
              Manage your platform users, pricing, and evaluation models
            </p>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Main Tab Navigation */}
        <div className="mb-8">
          {/* Desktop Navigation */}
          <div className="hidden lg:block">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-1">
              <nav className="flex space-x-1">
                {mainTabs.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setMainTab(tab.key)}
                    className={`${
                      mainTab === tab.key
                        ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    } px-6 py-3 rounded-lg font-medium text-sm transition-all duration-200 flex-1 text-center`}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Mobile Navigation */}
          <div className="lg:hidden">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-200">
                <div
                  className={`${
                    mainTab === "users" ? "text-blue-600" : "text-gray-900"
                  } font-medium`}
                >
                  {mainTabs.find((tab) => tab.key === mainTab)?.label}
                </div>
              </div>

              {isMobileMenuOpen && (
                <div className="py-2">
                  {mainTabs.map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => {
                        setMainTab(tab.key);
                        setIsMobileMenuOpen(false);
                      }}
                      className={`${
                        mainTab === tab.key
                          ? "bg-blue-50 text-blue-600 border-r-2 border-blue-600"
                          : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                      } w-full text-left px-4 py-3 text-sm font-medium transition-colors`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Content Container */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {mainTab === "users" && (
            <>
              {/* User Role Sub-Tabs */}
              <div className="border-b border-gray-200 bg-gray-50">
                {/* Desktop Sub-tabs */}
                <div className="hidden sm:block px-6 py-4">
                  <nav className="flex space-x-1">
                    {userTabs.map((tab) => {
                      const Icon = tab.icon;
                      return (
                        <button
                          key={tab.key}
                          onClick={() => setUserRoleTab(tab.key)}
                          className={`${
                            userRoleTab === tab.key
                              ? "bg-white text-blue-600 shadow-sm border-blue-200"
                              : "text-gray-600 hover:text-gray-900 hover:bg-white/50"
                          } px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition-all duration-200 border`}
                        >
                          <Icon className="w-4 h-4" />
                          <span className="hidden md:inline">{tab.label}</span>
                          <span className="md:hidden">{tab.label.replace("s", "")}</span>
                        </button>
                      );
                    })}
                  </nav>
                </div>

                {/* Mobile Sub-tabs */}
                <div className="sm:hidden">
                  <select
                    value={userRoleTab}
                    onChange={(e) => setUserRoleTab(e.target.value as UserRole)}
                    className="w-full px-4 py-3 bg-transparent border-none text-sm font-medium text-gray-900 focus:outline-none focus:ring-0"
                  >
                    {userTabs.map((tab) => (
                      <option key={tab.key} value={tab.key}>
                        {tab.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* User Tables */}
              <div className="overflow-hidden">
                {userRoleTab === "student" && <StudentsTable />}
                {userRoleTab === "educator" && <EducatorsTable />}
                {userRoleTab === "admin" && <AdminsTable />}
              </div>
            </>
          )}

          {mainTab === "pricing" && <PricingPlansTable />}
          {mainTab === "evaluation" && <EvaluationModelsTable />}
        </div>

        {/* Stats Cards */}
        {mainTab === "users" && (
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Total Students</p>
                  <p className="text-3xl font-bold">{userCounts.students}</p>
                </div>
                <GraduationCap className="w-8 h-8 text-blue-200" />
              </div>
            </div>

            <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-emerald-100 text-sm font-medium">Total Educators</p>
                  <p className="text-3xl font-bold">{userCounts.educators}</p>
                </div>
                <Presentation className="w-8 h-8 text-emerald-200" />
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">Total Admins</p>
                  <p className="text-3xl font-bold">{userCounts.admins}</p>
                </div>
                <Settings className="w-8 h-8 text-purple-200" />
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-in-out;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default AdminDashboard;
