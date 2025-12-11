"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import LoadingAnimation from "@/components/LoadingAnimation";

interface User {
  first_name: string;
  last_name: string;
  title: string;
  email: string;
  phone_number: string;
  profile_image_url: string | null;
}

interface Student {
  user_id: string;
  registration_number: string;
  education_institute: string;
  user: User;
}

interface EvaluationModel {
  id: string;
  model_name: string;
  description: string | null;
  model_type: string;
}

interface AssessmentGrade {
  model_id: string;
  submission_id: string;
  assessment_id: string;
  score: number;
  max_marks: number;
  created_on: string;
  updated_on: string;
  evaluation_model: EvaluationModel;
}

interface Submission {
  submission_id: string;
  student_id: string;
  assessment_id: string;
  type: string;
  submission_start_at: string;
  submission_end_at: string;
  file_url: string | null;
  media_extracted_file_url: string | null;
  ip_address: string | null;
  device_info: string | null;
  student_score: number | null;
  is_graded: boolean;
  is_handwritten: boolean;
  handwritten_file_url: string | null;
  student: Student;
  grades_by_model: Record<string, AssessmentGrade>;
}

interface Assessment {
  assessment_id: string;
  module_id: string;
  title: string;
  type: string;
  deadline: string;
  module: {
    module_code: string;
    module_name: string;
  };
}

interface AssessmentData {
  assessment: Assessment;
  submissions: Submission[];
  evaluation_models: EvaluationModel[];
}

const GRADE_RANGES = [
  { label: "A (80-100)", min: 80, max: 100, color: "#22c55e" },
  { label: "B (60-79)", min: 60, max: 79, color: "#3b82f6" },
  { label: "C (40-59)", min: 40, max: 59, color: "#f59e0b" },
  { label: "D (20-39)", min: 20, max: 39, color: "#ef4444" },
  { label: "F (0-19)", min: 0, max: 19, color: "#991b1b" },
];

const PAGE_SIZE_OPTIONS = [5, 10, 25, 50];

// Dropdown Component
function Dropdown({ 
  options, 
  selectedOption, 
  onSelect, 
  className = '' 
}: { 
  options: number[], 
  selectedOption: number, 
  onSelect: (option: number) => void,
  className?: string 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        type="button"
        className="flex items-center justify-between w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
        onClick={() => setIsOpen(!isOpen)}
      >
        {selectedOption}
        <svg className={`w-5 h-5 ml-2 transition-transform ${isOpen ? 'transform rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 z-10 w-full top-full mt-1 origin-top-right bg-white border border-gray-200 rounded-md shadow-lg">
          <div className="py-1">
            {options.map((option) => (
              <button
                key={option}
                className={`block w-full px-4 py-2 text-sm text-left ${selectedOption === option ? 'bg-blue-100 text-blue-800' : 'text-gray-700 hover:bg-gray-100'}`}
                onClick={() => {
                  onSelect(option);
                  setIsOpen(false);
                }}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function AssessmentResultsPage() {
  const params = useParams();
  const router = useRouter();
  const assessmentId = params.assessmentId as string;
  const moduleId = params.moduleId as string;
  const [data, setData] = useState<AssessmentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch(
          `/api/educator/assessment/${assessmentId}/assessment-grades?assessmentId=${assessmentId}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch assessment results");
        }

        const result = await response.json();
        setData(result);

        if (result.evaluation_models.length > 0) {
          setActiveTab(result.evaluation_models[0].id);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [assessmentId]);

  // Reset to page 1 when items per page changes
  useEffect(() => {
    setCurrentPage(1);
    setSelectedIndex(0);
  }, [itemsPerPage]);

  // Arrow key navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!data) return;

      const totalSubmissions = data.submissions.length;
      const totalPages = Math.ceil(totalSubmissions / itemsPerPage);

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => {
          const newIndex = Math.min(prev + 1, totalSubmissions - 1);
          const newPage = Math.floor(newIndex / itemsPerPage) + 1;
          if (newPage !== currentPage) {
            setCurrentPage(newPage);
          }
          return newIndex;
        });
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => {
          const newIndex = Math.max(prev - 1, 0);
          const newPage = Math.floor(newIndex / itemsPerPage) + 1;
          if (newPage !== currentPage) {
            setCurrentPage(newPage);
          }
          return newIndex;
        });
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (data.submissions[selectedIndex]) {
          handleRowClick(data.submissions[selectedIndex]);
        }
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        setCurrentPage((prev) => Math.min(prev + 1, totalPages));
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        setCurrentPage((prev) => Math.max(prev - 1, 1));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [data, selectedIndex, currentPage, itemsPerPage]);

  const handleRowClick = (submission: Submission) => {
    const modelId = activeTab === "all" 
      ? (data?.evaluation_models[0]?.id || "") 
      : activeTab;
    
    const reviewUrl = `/educator/module/${moduleId}/assessment/${assessmentId}/submission/${submission.submission_id}/model/${modelId}`;
    router.push(reviewUrl);
  };

  // if (loading) {
  //   return (
  //     <div className="flex items-center justify-center min-h-screen">
  //       <div className="text-center">
  //         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
  //         <p className="mt-4 text-gray-600">Loading assessment results...</p>
  //       </div>
  //     </div>
  //   );
  // }

     if (loading) {
      return (
        <LoadingAnimation
          size="lg"
          variant="wave"
          text="Loading assessment results..."
          fullScreen={true}
          color="blue"
        />
      );
    }
  

  if (error || !data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <h2 className="text-red-800 font-semibold mb-2">Error</h2>
          <p className="text-red-600">{error || "No data available"}</p>
        </div>
      </div>
    );
  }

  const getScore = (submission: Submission): number | null => {
    if (activeTab === "all") {
      return submission.student_score;
    }
    
    const grade = submission.grades_by_model[activeTab];
    if (grade && grade.max_marks > 0) {
      return (grade.score / grade.max_marks) * 100;
    }
    
    return null;
  };

  const isGraded = (submission: Submission): boolean => {
    if (activeTab === "all") {
      return submission.is_graded;
    }
    return submission.grades_by_model[activeTab] !== undefined;
  };

  const filteredSubmissions = data.submissions;
  const totalPages = Math.ceil(filteredSubmissions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedSubmissions = filteredSubmissions.slice(startIndex, endIndex);

  const gradedSubmissions = filteredSubmissions.filter((s) => {
    const score = getScore(s);
    return isGraded(s) && score !== null;
  });

  const stats = {
    total: filteredSubmissions.length,
    graded: gradedSubmissions.length,
    pending: filteredSubmissions.length - gradedSubmissions.length,
    average:
      gradedSubmissions.length > 0
        ? gradedSubmissions.reduce((sum, s) => sum + (getScore(s) || 0), 0) /
          gradedSubmissions.length
        : 0,
    highest: Math.max(...gradedSubmissions.map((s) => getScore(s) || 0), 0),
    lowest:
      gradedSubmissions.length > 0
        ? Math.min(...gradedSubmissions.map((s) => getScore(s) || 0))
        : 0,
  };

  const gradeDistribution = GRADE_RANGES.map((range) => ({
    name: range.label,
    value: gradedSubmissions.filter((s) => {
      const score = getScore(s);
      return score !== null && score >= range.min && score <= range.max;
    }).length,
    color: range.color,
  }));

  const scoreDistribution = Array.from({ length: 10 }, (_, i) => {
    const min = i * 10;
    const max = (i + 1) * 10;
    return {
      range: `${min}-${max}`,
      count: gradedSubmissions.filter((s) => {
        const score = getScore(s);
        return score !== null && score >= min && score < max;
      }).length,
    };
  });

  const passFailData = [
    {
      name: "Pass (≥40)",
      count: gradedSubmissions.filter((s) => (getScore(s) || 0) >= 40).length,
      fill: "#22c55e",
    },
    {
      name: "Fail (<40)",
      count: gradedSubmissions.filter((s) => (getScore(s) || 0) < 40).length,
      fill: "#ef4444",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {data.assessment.title}
              </h1>
              <p className="text-gray-600">
                {data.assessment.module.module_code} -{" "}
                {data.assessment.module.module_name}
              </p>
              <div className="flex gap-4 mt-3">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                  {data.assessment.type}
                </span>
                <span className="text-sm text-gray-500">
                  Deadline:{" "}
                  {new Date(data.assessment.deadline).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-4">
            <p className="text-sm text-gray-600">Total Submissions</p>
            <p className="text-xl font-bold text-gray-900">{stats.total}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4">
            <p className="text-sm text-gray-600">Graded</p>
            <p className="text-xl font-bold text-green-600">{stats.graded}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4">
            <p className="text-sm text-gray-600">Pending</p>
            <p className="text-xl font-bold text-orange-600">
              {stats.pending}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4">
            <p className="text-sm text-gray-600">Average</p>
            <p className="text-xl font-bold text-blue-600">
              {stats.average.toFixed(1)}%
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4">
            <p className="text-sm text-gray-600">Highest</p>
            <p className="text-xl font-bold text-green-600">
              {stats.highest.toFixed(1)}%
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4">
            <p className="text-sm text-gray-600">Lowest</p>
            <p className="text-xl font-bold text-red-600">{stats.lowest.toFixed(1)}%</p>
          </div>
        </div>

        {/* Evaluation Model Tabs */}
        {data.evaluation_models.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm mb-6">
            <div className="border-b border-gray-200">
              <div className="flex overflow-x-auto">
                <button
                  onClick={() => setActiveTab("all")}
                  className={`px-6 py-3 text-sm font-medium whitespace-nowrap ${
                    activeTab === "all"
                      ? "border-b-2 border-blue-600 text-blue-600"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  All Submissions (Student Scores)
                </button>
                {data.evaluation_models.map((model) => (
                  <button
                    key={model.id}
                    onClick={() => setActiveTab(model.id)}
                    className={`px-6 py-3 text-sm font-medium whitespace-nowrap ${
                      activeTab === model.id
                        ? "border-b-2 border-blue-600 text-blue-600"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    {model.model_name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Charts */}
        {gradedSubmissions.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-base font-semibold text-gray-900 mb-4">
                Grade Distribution
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={gradeDistribution.filter((d) => d.value > 0)}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {gradeDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-base font-semibold text-gray-900 mb-4">
                Pass/Fail Analysis
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={passFailData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6 lg:col-span-2">
              <h3 className="text-base font-semibold text-gray-900 mb-4">
                Score Distribution
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={scoreDistribution}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="range" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar
                    dataKey="count"
                    fill="#3b82f6"
                    name="Number of Students"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Results Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-gray-900">
                  Student Results
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  Use arrow keys to navigate (↑↓ rows, ←→ pages, Enter to view)
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600">
                  Showing {startIndex + 1}-{Math.min(endIndex, filteredSubmissions.length)} of {filteredSubmissions.length}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Rows per page:</span>
                  <Dropdown
                    options={PAGE_SIZE_OPTIONS}
                    selectedOption={itemsPerPage}
                    onSelect={setItemsPerPage}
                    className="w-20"
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Registration No.
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Submission Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Score
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Grade
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedSubmissions.map((submission, index) => {
                  const score = getScore(submission);
                  const graded = isGraded(submission);
                  const grade = GRADE_RANGES.find(
                    (r) => score !== null && score >= r.min && score <= r.max
                  );
                  const globalIndex = startIndex + index;
                  const isSelected = globalIndex === selectedIndex;

                  return (
                    <tr
                      key={submission.submission_id}
                      onClick={() => {
                        setSelectedIndex(globalIndex);
                        handleRowClick(submission);
                      }}
                      className={`cursor-pointer transition-colors ${
                        isSelected
                          ? "bg-blue-100 border-l-4 border-blue-600"
                          : "hover:bg-blue-50"
                      }`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0">
                            {submission.student.user.profile_image_url ? (
                              <img
                                className="h-10 w-10 rounded-full object-cover"
                                src={submission.student.user.profile_image_url}
                                alt=""
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
                                {submission.student.user.first_name[0]}
                                {submission.student.user.last_name[0]}
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {submission.student.user.title}{" "}
                              {submission.student.user.first_name}{" "}
                              {submission.student.user.last_name}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {submission.student.registration_number}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {submission.student.user.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {submission.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                        {score !== null ? `${score.toFixed(1)}%` : "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {grade && (
                          <span
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                            style={{
                              backgroundColor: `${grade.color}20`,
                              color: grade.color,
                            }}
                          >
                            {grade.label.split(" ")[0]}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            graded
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {graded ? "Graded" : "Pending"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <button
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              
              <div className="flex items-center gap-2">
                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 7) {
                    pageNum = i + 1;
                  } else if (currentPage <= 4) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 3) {
                    pageNum = totalPages - 6 + i;
                  } else {
                    pageNum = currentPage - 3 + i;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`px-3 py-1 text-sm font-medium rounded-md ${
                        currentPage === pageNum
                          ? "bg-blue-600 text-white"
                          : "text-gray-700 bg-white border border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}