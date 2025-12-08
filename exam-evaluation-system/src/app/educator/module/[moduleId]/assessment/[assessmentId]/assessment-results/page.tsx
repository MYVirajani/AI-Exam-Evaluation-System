"use client";

import { useEffect, useState } from "react";
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

export default function AssessmentResultsPage() {
  const params = useParams();
  const router = useRouter();
  const assessmentId = params.assessmentId as string;
  const moduleId = params.moduleId as string;
  const [data, setData] = useState<AssessmentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("all");

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

        // Set first evaluation model as default tab if available
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

  const handleRowClick = (submission: Submission) => {
    // Determine which model to use for navigation
    const modelId = activeTab === "all" 
      ? (data?.evaluation_models[0]?.id || "") 
      : activeTab;
    
    // Navigate to submission review page
    const reviewUrl = `/educator/module/${moduleId}/assessment/${assessmentId}/submission/${submission.submission_id}/model/${modelId}`;
    router.push(reviewUrl);
  };

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

  // Get score for a submission based on active tab
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

  // Check if submission is graded for active model
  const isGraded = (submission: Submission): boolean => {
    if (activeTab === "all") {
      return submission.is_graded;
    }
    return submission.grades_by_model[activeTab] !== undefined;
  };

  // Filter submissions based on active tab
  const filteredSubmissions = data.submissions;

  const gradedSubmissions = filteredSubmissions.filter((s) => {
    const score = getScore(s);
    return isGraded(s) && score !== null;
  });

  // Calculate statistics
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

  // Prepare grade distribution data for pie chart
  const gradeDistribution = GRADE_RANGES.map((range) => ({
    name: range.label,
    value: gradedSubmissions.filter((s) => {
      const score = getScore(s);
      return score !== null && score >= range.min && score <= range.max;
    }).length,
    color: range.color,
  }));

  // Prepare score distribution for bar chart
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

  // Prepare pass/fail data
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
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4">
            <p className="text-sm text-gray-600">Graded</p>
            <p className="text-2xl font-bold text-green-600">{stats.graded}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4">
            <p className="text-sm text-gray-600">Pending</p>
            <p className="text-2xl font-bold text-orange-600">
              {stats.pending}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4">
            <p className="text-sm text-gray-600">Average</p>
            <p className="text-2xl font-bold text-blue-600">
              {stats.average.toFixed(1)}%
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4">
            <p className="text-sm text-gray-600">Highest</p>
            <p className="text-2xl font-bold text-green-600">
              {stats.highest.toFixed(1)}%
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4">
            <p className="text-sm text-gray-600">Lowest</p>
            <p className="text-2xl font-bold text-red-600">{stats.lowest.toFixed(1)}%</p>
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
            {/* Grade Distribution Pie Chart */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
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

            {/* Pass/Fail Chart */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
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

            {/* Score Distribution Bar Chart */}
            <div className="bg-white rounded-lg shadow-sm p-6 lg:col-span-2">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
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
            <h3 className="text-lg font-semibold text-gray-900">
              Student Results
            </h3>
            <p className="text-sm text-gray-500 mt-1">Click on any row to view detailed submission</p>
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
                {filteredSubmissions.map((submission) => {
                  const score = getScore(submission);
                  const graded = isGraded(submission);
                  const grade = GRADE_RANGES.find(
                    (r) => score !== null && score >= r.min && score <= r.max
                  );

                  return (
                    <tr
                      key={submission.submission_id}
                      onClick={() => handleRowClick(submission)}
                      className="hover:bg-blue-50 cursor-pointer transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0">
                            {submission.student.user.profile_image_url ? (
                              <img
                                className="h-10 w-10 rounded-full object-cover"
                                src={
                                  submission.student.user.profile_image_url
                                }
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
        </div>
      </div>
    </div>
  );
}