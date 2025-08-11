"use client";

import { useSearchParams, useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { ArrowLeft, Download, RefreshCw, Users, TrendingUp, Award, Clock } from "lucide-react";
import Button from "@/components/Button";
import Breadcrumbs from "@/components/Breadcrumbs";
import { getAssessmentBreadcrumbs } from "@/utils/breadcrumbs";

interface GradeRow {
  submission_id: string;
  assessment_id: string;
  student_id: string;
  registration_number: string | null;
  student_name: string | null;
  username: string | null;
  email: string | null;
  marks_awarded: number | null;
  max_marks: number | null;
  percentage: number | null;
  graded_at: string | null;
  auto_graded: boolean | null;
  grade_id: string | null;
  educator_id: string | null;
  model_id: string | null;
  has_overall_grade: boolean;
}

interface Assessment {
  assessment_id: string;
  title: string;
  module: {
    module_code: string;
    module_name: string;
  };
}

export default function QuizResultsPage() {
  const searchParams = useSearchParams();
  const params = useParams();
  const router = useRouter();

  const moduleId = params.moduleId as string;
  const assessmentId = params.assessmentId as string;
  const educatorId = searchParams.get("educatorId");

  const [grades, setGrades] = useState<GradeRow[]>([]);
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!moduleId || !assessmentId || !educatorId) {
      setError("Missing required parameters");
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        // Fetch grades
        const gradesRes = await fetch(
          `/api/educator/assessment/quiz/results?assessmentId=${assessmentId}`
        );
        if (!gradesRes.ok) throw new Error("Failed to fetch grades");
        const gradesData = await gradesRes.json();

        // Fetch assessment details for breadcrumbs and header
        const assessmentRes = await fetch(
          `/api/educator/module/${moduleId}/assessment/${assessmentId}?educatorId=${educatorId}`
        );
        if (!assessmentRes.ok) throw new Error("Failed to fetch assessment");
        const assessmentData = await assessmentRes.json();

        setGrades(gradesData.data || []);
        setAssessment({
          assessment_id: assessmentData.assessment.assessment_id,
          title: assessmentData.assessment.title,
          module: assessmentData.module,
        });
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch data"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [moduleId, assessmentId, educatorId]);

  const handleGoBack = () => {
    router.push(
      `/educator/module/${moduleId}/assessment/${assessmentId}/quiz?educatorId=${educatorId}`
    );
  };

  const handleExportResults = () => {
    // Create CSV content
    const headers = [
      "Registration Number",
      "Student Name",
      "Email",
      "Marks Awarded",
      "Max Marks",
      "Percentage",
      "Graded At",
      "Auto Graded"
    ];
    
    const csvContent = [
      headers.join(","),
      ...grades.map(row => [
        row.registration_number || "",
        `"${row.student_name || ""}"`,
        row.email || "",
        row.marks_awarded || "",
        row.max_marks || "",
        row.percentage ? `${row.percentage}%` : "",
        row.graded_at ? new Date(row.graded_at).toLocaleDateString() : "",
        row.auto_graded ? "Yes" : "No"
      ].join(","))
    ].join("\n");

    // Download CSV
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `quiz-results-${assessment?.title.replace(/\s+/g, "-").toLowerCase()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const getStatistics = () => {
    const gradedSubmissions = grades.filter(g => g.marks_awarded !== null);
    const totalSubmissions = grades.length;
    const avgPercentage = gradedSubmissions.length > 0 
      ? gradedSubmissions.reduce((sum, g) => sum + (g.percentage || 0), 0) / gradedSubmissions.length
      : 0;
    const highestPercentage = Math.max(...gradedSubmissions.map(g => g.percentage || 0));
    
    return {
      totalSubmissions,
      gradedSubmissions: gradedSubmissions.length,
      avgPercentage: Math.round(avgPercentage * 100) / 100,
      highestPercentage: gradedSubmissions.length > 0 ? highestPercentage : 0
    };
  };

  const getGradeColor = (percentage: number | null) => {
    if (percentage === null) return "text-gray-500";
    if (percentage >= 80) return "text-green-600";
    if (percentage >= 60) return "text-blue-600";
    if (percentage >= 40) return "text-yellow-600";
    return "text-red-600";
  };

  const getGradeBadgeColor = (percentage: number | null) => {
    if (percentage === null) return "bg-gray-100 text-gray-600";
    if (percentage >= 80) return "bg-green-100 text-green-800";
    if (percentage >= 60) return "bg-blue-100 text-blue-800";
    if (percentage >= 40) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-sm">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading quiz results...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-sm border border-red-200">
          <div className="text-red-600 text-center">
            <h2 className="text-lg font-semibold mb-2">Error</h2>
            <p>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  const stats = getStatistics();
  
  // Generate breadcrumbs
  const breadcrumbs = assessment 
    ? [
        ...getAssessmentBreadcrumbs(
          assessment.module.module_code, 
          moduleId, 
          assessment.title, 
          assessmentId, 
          'educator'
        ),
        { label: 'Results', current: true }
      ]
    : [
        { label: 'Dashboard', href: '/educator/dashboard' }, 
        { label: 'Module', href: `/educator/module/${moduleId}` }, 
        { label: 'Assessment', href: `/educator/module/${moduleId}/assessment/${assessmentId}` },
        { label: 'Results', current: true }
      ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Breadcrumbs */}
        <div className="mb-6">
          <Breadcrumbs items={breadcrumbs} className="" />
        </div>

        {/* Header Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Button
                  onClick={handleGoBack}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Quiz
                </Button>
                <h1 className="text-2xl font-bold text-gray-900">
                  Quiz Results
                </h1>
              </div>
              {assessment && (
                <div className="text-sm text-gray-600">
                  <span className="font-medium">{assessment.module.module_code}</span>
                  <span className="mx-2">•</span>
                  <span>{assessment.title}</span>
                </div>
              )}
            </div>
            <div className="flex gap-3">
              <Button
                onClick={handleExportResults}
                variant="outline"
                className="flex items-center gap-2"
                disabled={grades.length === 0}
              >
                <Download className="w-4 h-4" />
                Export CSV
              </Button>
              <Button
                onClick={() => window.location.reload()}
                variant="outline"
                className="flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </Button>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-600">
                    {stats.totalSubmissions}
                  </div>
                  <div className="text-sm text-blue-700 font-medium">
                    Total Submissions
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                  <Award className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {stats.gradedSubmissions}
                  </div>
                  <div className="text-sm text-green-700 font-medium">
                    Graded
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-600">
                    {stats.avgPercentage}%
                  </div>
                  <div className="text-sm text-purple-700 font-medium">
                    Average Score
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg p-4 border border-orange-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                  <Award className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-orange-600">
                    {stats.highestPercentage}%
                  </div>
                  <div className="text-sm text-orange-700 font-medium">
                    Highest Score
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Results Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-900">
              Student Results
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {grades.length} submission{grades.length !== 1 ? 's' : ''} found
            </p>
          </div>

          {grades.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Student
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Registration
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Score
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Percentage
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Grade Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Graded At
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {grades.map((grade, index) => (
                    <tr 
                      key={grade.submission_id}
                      className={`hover:bg-gray-50 transition-colors ${
                        index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'
                      }`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <div className="text-sm font-medium text-gray-900">
                            {grade.student_name || "Unknown Student"}
                          </div>
                          <div className="text-sm text-gray-500">
                            {grade.email}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 font-mono">
                          {grade.registration_number || "N/A"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {grade.marks_awarded !== null && grade.max_marks !== null
                            ? `${grade.marks_awarded} / ${grade.max_marks}`
                            : "Not graded"
                          }
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {grade.percentage !== null ? (
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getGradeBadgeColor(
                              grade.percentage
                            )}`}
                          >
                            {grade.percentage}%
                          </span>
                        ) : (
                          <span className="text-sm text-gray-500">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {grade.has_overall_grade ? (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <Award className="w-3 h-3 mr-1" />
                              Graded
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                              <Clock className="w-3 h-3 mr-1" />
                              Pending
                            </span>
                          )}
                          {grade.auto_graded && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              Auto
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {grade.graded_at
                          ? new Date(grade.graded_at).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit"
                            })
                          : "-"
                        }
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <Users className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No Submissions Yet
              </h3>
              <p className="text-gray-600">
                Students haven't submitted their quiz attempts yet.
              </p>
            </div>
          )}
        </div>

        {/* Grade Distribution */}
        {grades.length > 0 && (
          <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Grade Distribution
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                { label: "Excellent (80-100%)", range: [80, 100], color: "bg-green-500" },
                { label: "Good (60-79%)", range: [60, 79], color: "bg-blue-500" },
                { label: "Average (40-59%)", range: [40, 59], color: "bg-yellow-500" },
                { label: "Below Average (<40%)", range: [0, 39], color: "bg-red-500" }
              ].map((band) => {
                const count = grades.filter(g => 
                  g.percentage !== null && 
                  g.percentage >= band.range[0] && 
                  g.percentage <= band.range[1]
                ).length;
                const percentage = stats.gradedSubmissions > 0 
                  ? Math.round((count / stats.gradedSubmissions) * 100)
                  : 0;

                return (
                  <div key={band.label} className="text-center">
                    <div className="mb-2">
                      <div className={`w-12 h-12 ${band.color} rounded-lg mx-auto flex items-center justify-center text-white font-bold text-lg`}>
                        {count}
                      </div>
                    </div>
                    <div className="text-sm font-medium text-gray-900">
                      {percentage}%
                    </div>
                    <div className="text-xs text-gray-600">
                      {band.label}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}