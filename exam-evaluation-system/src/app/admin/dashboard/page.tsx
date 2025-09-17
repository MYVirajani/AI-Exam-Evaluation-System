"use client";

import { useState } from "react";
import StudentsTable from "./StudentsTable";
import EducatorsTable from "./EducatorsTable";
import AdminsTable from "./AdminsTable";
import PricingPlansTable from "./PricingPlansTable";
import EvaluationModelsTable from "./EvaluationModelsTable";

type MainTab = 'users' | 'pricing' | 'evaluation';
type UserRole = 'student' | 'educator' | 'admin';

export default function AdminDashboard() {
  const [mainTab, setMainTab] = useState<MainTab>('users');
  const [userRoleTab, setUserRoleTab] = useState<UserRole>('student');

  const userTabs: { key: UserRole; label: string; icon: string }[] = [
    { key: 'student', label: 'Students', icon: '🎓' },
    { key: 'educator', label: 'Educators', icon: '👨‍🏫' },
    { key: 'admin', label: 'Admins', icon: '⚙️' },
  ];

  const mainTabs: { key: MainTab; label: string }[] = [
    { key: 'users', label: 'User Management' },
    { key: 'pricing', label: 'Pricing Plans' },
    { key: 'evaluation', label: 'Exam Evaluation Models' },
  ];

  return (
    <div className="p-4 bg-white text-gray-900 min-h-screen">
      <h2 className="text-2xl font-bold mb-6">Admin Dashboard</h2>

      {/* Main Tab Navigation */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {mainTabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setMainTab(tab.key)}
                className={`${
                  mainTab === tab.key
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div>
        {mainTab === "users" && (
          <>
            {/* User Role Sub-Tabs */}
            <div className="mb-4">
              <nav className="-mb-px flex space-x-8">
                {userTabs.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setUserRoleTab(tab.key)}
                    className={`${
                      userRoleTab === tab.key
                        ? "border-blue-500 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors`}
                  >
                    <span>{tab.icon}</span>
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            {/* User Tables */}
            {userRoleTab === "student" && <StudentsTable />}
            {userRoleTab === "educator" && <EducatorsTable />}
            {userRoleTab === "admin" && <AdminsTable />}
          </>
        )}

        {mainTab === "pricing" && <PricingPlansTable />}

        {mainTab === "evaluation" && <EvaluationModelsTable />}
      </div>
    </div>
  );
}
