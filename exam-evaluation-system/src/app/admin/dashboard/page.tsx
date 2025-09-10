"use client";

import { useState } from "react";
import StudentsTable from "./StudentsTable";
import EducatorsTable from "./EducatorsTable";
import AdminsTable from "./AdminsTable";

type UserRole = 'student' | 'educator' | 'admin';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<UserRole>('student');

  const tabs: { key: UserRole; label: string; icon: string }[] = [
    { key: 'student', label: 'Students', icon: '🎓' },
    { key: 'educator', label: 'Educators', icon: '👨‍🏫' },
    { key: 'admin', label: 'Admins', icon: '⚙️' },
  ];

  return (
    <div className="p-4 bg-white text-gray-900 min-h-screen">
      <h2 className="text-2xl font-bold mb-6">User Management</h2>

      {/* Tab Navigation */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`${
                  activeTab === tab.key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors`}
              >
                <span>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Table */}
      <div>
        {activeTab === "student" && <StudentsTable />}
        {activeTab === "educator" && <EducatorsTable />}
        {activeTab === "admin" && <AdminsTable />}
      </div>
    </div>
  );
}
