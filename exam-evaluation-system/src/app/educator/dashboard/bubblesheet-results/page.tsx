// // src/app/educator/dashboard/bubblesheet-results/page.tsx
// "use client";

// import { useSearchParams } from "next/navigation";
// import { useEffect, useState } from "react";
// import {
//   FiUsers,
//   FiTrendingUp,
//   FiCheckCircle,
//   FiXCircle,
//   FiDownload,
// } from "react-icons/fi";

// interface StudentResult {
//   student_id: string;
//   registration_number: string;
//   name: string;
//   email: string;
//   total_questions: number;
//   correct_answers: number;
//   incorrect_answers: number;
//   unanswered: number;
//   total_marks: number;
//   percentage: number;
// }

// export default function BubbleSheetResultsDashboard() {
//   const searchParams = useSearchParams();
//   const assessmentId = searchParams.get("assessmentId");
//   const title = searchParams.get("title");
//   const module = searchParams.get("module");

//   const [results, setResults] = useState<StudentResult[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     if (!assessmentId) {
//       setError("Assessment ID is required");
//       setLoading(false);
//       return;
//     }

//     fetchResults();
//   }, [assessmentId]);

//   const fetchResults = async () => {
//     try {
//       const user = JSON.parse(localStorage.getItem("user") || "{}");
//       const educatorId = user.user_id;

//       const res = await fetch(
//         `/api/educator/bubblesheet/results?assessmentId=${assessmentId}&educatorId=${educatorId}`
//       );

//       if (!res.ok) throw new Error("Failed to fetch results");

//       const data = await res.json();
//       setResults(data.results || []);
//     } catch (err) {
//       setError(err instanceof Error ? err.message : "Failed to load results");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const calculateStats = () => {
//     if (results.length === 0) {
//       return {
//         totalStudents: 0,
//         averageScore: 0,
//         highestScore: 0,
//         lowestScore: 0,
//         passRate: 0,
//       };
//     }

//     const scores = results.map((r) => r.percentage);
//     const totalStudents = results.length;
//     const averageScore = scores.reduce((a, b) => a + b, 0) / totalStudents;
//     const highestScore = Math.max(...scores);
//     const lowestScore = Math.min(...scores);
//     const passRate = (results.filter((r) => r.percentage >= 50).length / totalStudents) * 100;

//     return {
//       totalStudents,
//       averageScore,
//       highestScore,
//       lowestScore,
//       passRate,
//     };
//   };

//   const stats = calculateStats();

//   const exportToCSV = () => {
//     const headers = [
//       "Registration Number",
//       "Name",
//       "Email",
//       "Total Questions",
//       "Correct",
//       "Incorrect",
//       "Unanswered",
//       "Total Marks",
//       "Percentage",
//     ];

//     const rows = results.map((r) => [
//       r.registration_number,
//       r.name,
//       r.email,
//       r.total_questions,
//       r.correct_answers,
//       r.incorrect_answers,
//       r.unanswered,
//       r.total_marks,
//       r.percentage.toFixed(2),
//     ]);

//     const csvContent = [
//       headers.join(","),
//       ...rows.map((row) => row.join(",")),
//     ].join("\n");

//     const blob = new Blob([csvContent], { type: "text/csv" });
//     const url = URL.createObjectURL(blob);
//     const a = document.createElement("a");
//     a.href = url;
//     a.download = `bubblesheet_results_${assessmentId}.csv`;
//     a.click();
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gray-50 flex items-center justify-center">
//         <div className="flex items-center space-x-2">
//           <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
//           <span className="text-lg text-gray-600">Loading results...</span>
//         </div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="min-h-screen bg-gray-50 flex items-center justify-center">
//         <div className="bg-white p-8 rounded-lg shadow-md border border-red-200">
//           <div className="text-red-600 text-center">
//             <h2 className="text-lg font-semibold mb-2">Error</h2>
//             <p>{error}</p>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-50">
//       <div className="max-w-7xl mx-auto px-6 py-8">
//         {/* Header */}
//         <div className="mb-6">
//           <h1 className="text-3xl font-bold text-gray-900 mb-2">
//             Bubble Sheet Results
//           </h1>
//           <p className="text-gray-600">
//             {title} - {module}
//           </p>
//         </div>

//         {/* Stats Cards */}
//         <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-6">
//           <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm font-medium text-gray-600">Total Students</p>
//                 <p className="text-3xl font-bold text-gray-900 mt-1">
//                   {stats.totalStudents}
//                 </p>
//               </div>
//               <div className="h-12 w-12 bg-blue-100 rounded-xl flex items-center justify-center">
//                 <FiUsers className="h-6 w-6 text-blue-600" />
//               </div>
//             </div>
//           </div>

//           <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm font-medium text-gray-600">Average Score</p>
//                 <p className="text-3xl font-bold text-gray-900 mt-1">
//                   {stats.averageScore.toFixed(1)}%
//                 </p>
//               </div>
//               <div className="h-12 w-12 bg-green-100 rounded-xl flex items-center justify-center">
//                 <FiTrendingUp className="h-6 w-6 text-green-600" />
//               </div>
//             </div>
//           </div>

//           <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm font-medium text-gray-600">Highest Score</p>
//                 <p className="text-3xl font-bold text-gray-900 mt-1">
//                   {stats.highestScore.toFixed(1)}%
//                 </p>
//               </div>
//               <div className="h-12 w-12 bg-emerald-100 rounded-xl flex items-center justify-center">
//                 <FiCheckCircle className="h-6 w-6 text-emerald-600" />
//               </div>
//             </div>
//           </div>

//           <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm font-medium text-gray-600">Lowest Score</p>
//                 <p className="text-3xl font-bold text-gray-900 mt-1">
//                   {stats.lowestScore.toFixed(1)}%
//                 </p>
//               </div>
//               <div className="h-12 w-12 bg-red-100 rounded-xl flex items-center justify-center">
//                 <FiXCircle className="h-6 w-6 text-red-600" />
//               </div>
//             </div>
//           </div>

//           <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm font-medium text-gray-600">Pass Rate</p>
//                 <p className="text-3xl font-bold text-gray-900 mt-1">
//                   {stats.passRate.toFixed(1)}%
//                 </p>
//               </div>
//               <div className="h-12 w-12 bg-purple-100 rounded-xl flex items-center justify-center">
//                 <FiTrendingUp className="h-6 w-6 text-purple-600" />
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Results Table */}
//         <div className="bg-white rounded-lg shadow-sm border border-gray-200">
//           <div className="p-6 border-b border-gray-200 flex items-center justify-between">
//             <h2 className="text-lg font-semibold text-gray-900">
//               Student Results
//             </h2>
//             <button
//               onClick={exportToCSV}
//               className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
//             >
//               <FiDownload className="w-4 h-4" />
//               Export CSV
//             </button>
//           </div>

//           <div className="overflow-x-auto">
//             <table className="min-w-full divide-y divide-gray-200">
//               <thead className="bg-gray-50">
//                 <tr>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
//                     Student
//                   </th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
//                     Registration No.
//                   </th>
//                   <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
//                     Correct
//                   </th>
//                   <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
//                     Incorrect
//                   </th>
//                   <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
//                     Unanswered
//                   </th>
//                   <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
//                     Total Marks
//                   </th>
//                   <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
//                     Percentage
//                   </th>
//                 </tr>
//               </thead>
//               <tbody className="bg-white divide-y divide-gray-200">
//                 {results.map((result) => (
//                   <tr key={result.student_id} className="hover:bg-gray-50">
//                     <td className="px-6 py-4">
//                       <div className="text-sm font-medium text-gray-900">
//                         {result.name}
//                       </div>
//                       <div className="text-sm text-gray-500">{result.email}</div>
//                     </td>
//                     <td className="px-6 py-4 text-sm text-gray-900">
//                       {result.registration_number}
//                     </td>
//                     <td className="px-6 py-4 text-center">
//                       <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
//                         {result.correct_answers}
//                       </span>
//                     </td>
//                     <td className="px-6 py-4 text-center">
//                       <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
//                         {result.incorrect_answers}
//                       </span>
//                     </td>
//                     <td className="px-6 py-4 text-center">
//                       <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
//                         {result.unanswered}
//                       </span>
//                     </td>
//                     <td className="px-6 py-4 text-center text-sm font-medium text-gray-900">
//                       {result.total_marks}/{result.total_questions}
//                     </td>
//                     <td className="px-6 py-4 text-center">
//                       <span
//                         className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
//                           result.percentage >= 75
//                             ? "bg-green-100 text-green-800"
//                             : result.percentage >= 50
//                             ? "bg-yellow-100 text-yellow-800"
//                             : "bg-red-100 text-red-800"
//                         }`}
//                       >
//                         {result.percentage.toFixed(1)}%
//                       </span>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>

//           {results.length === 0 && (
//             <div className="text-center py-12">
//               <p className="text-gray-500">No results available yet</p>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }

"use client";

import { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface StudentResult {
  student_id: string;
  registration_number: string;
  name: string;
  email: string;
  total_questions: number;
  correct_answers: number;
  incorrect_answers: number;
  unanswered: number;
  total_marks: number;
  percentage: number;
}

interface Distribution {
  grade_ranges: Record<string, number>;
  score_ranges: Record<string, number>;
}

export default function BubbleSheetResultsDashboard() {
  const [results, setResults] = useState<StudentResult[]>([]);
  const [distribution, setDistribution] = useState<Distribution | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [assessmentTitle, setAssessmentTitle] = useState("");
  const [moduleInfo, setModuleInfo] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const assessmentId = params.get("assessmentId");
    const title = params.get("title");
    const module = params.get("module");
    
    setAssessmentTitle(title || "Bubble Sheet Results");
    setModuleInfo(module || "");

    if (!assessmentId) {
      setError("Assessment ID is required");
      setLoading(false);
      return;
    }

    fetchResults(assessmentId);
  }, []);

  const fetchResults = async (assessmentId: string) => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const educatorId = user.user_id;

      const res = await fetch(
        `/api/educator/bubblesheet/results?assessmentId=${assessmentId}&educatorId=${educatorId}`
      );

      if (!res.ok) throw new Error("Failed to fetch results");

      const data = await res.json();
      setResults(data.results || []);
      setDistribution(data.distribution || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load results");
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = () => {
    if (results.length === 0) {
      return {
        totalStudents: 0,
        averageScore: 0,
        highestScore: 0,
        lowestScore: 0,
        passRate: 0,
      };
    }

    const scores = results.map((r) => r.percentage);
    const totalStudents = results.length;
    const averageScore = scores.reduce((a, b) => a + b, 0) / totalStudents;
    const highestScore = Math.max(...scores);
    const lowestScore = Math.min(...scores);
    const passRate = (results.filter((r) => r.percentage >= 50).length / totalStudents) * 100;

    return {
      totalStudents,
      averageScore,
      highestScore,
      lowestScore,
      passRate,
    };
  };

  const stats = calculateStats();

  const exportToCSV = () => {
    const headers = [
      "Registration Number",
      "Name",
      "Email",
      "Total Questions",
      "Correct",
      "Incorrect",
      "Unanswered",
      "Total Marks",
      "Percentage",
    ];

    const rows = results.map((r) => [
      r.registration_number,
      r.name,
      r.email,
      r.total_questions,
      r.correct_answers,
      r.incorrect_answers,
      r.unanswered,
      r.total_marks,
      r.percentage.toFixed(2),
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bubblesheet_results_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  // Prepare chart data
  const gradeChartData = distribution
    ? Object.entries(distribution.grade_ranges).map(([grade, count]) => ({
        grade: grade.split(' ')[0], // Just the letter
        count,
        fullLabel: grade,
      }))
    : [];

  const scoreChartData = distribution
    ? Object.entries(distribution.score_ranges)
        .sort((a, b) => {
          const aNum = parseInt(a[0]);
          const bNum = parseInt(b[0]);
          return aNum - bNum;
        })
        .map(([range, count]) => ({
          range,
          count,
        }))
    : [];

  const GRADE_COLORS = {
    A: "#10b981", // green
    B: "#3b82f6", // blue
    C: "#f59e0b", // yellow
    D: "#f97316", // orange
    F: "#ef4444", // red
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span className="text-lg text-gray-600">Loading results...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md border border-red-200">
          <div className="text-red-600 text-center">
            <h2 className="text-lg font-semibold mb-2">Error</h2>
            <p>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Bubble Sheet Results Dashboard
          </h1>
          <p className="text-gray-600">
            {assessmentTitle} {moduleInfo && `- ${moduleInfo}`}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Students</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {stats.totalStudents}
                </p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Average Score</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {stats.averageScore.toFixed(1)}%
                </p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-xl flex items-center justify-center">
                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Highest Score</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {stats.highestScore.toFixed(1)}%
                </p>
              </div>
              <div className="h-12 w-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                <svg className="h-6 w-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Lowest Score</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {stats.lowestScore.toFixed(1)}%
                </p>
              </div>
              <div className="h-12 w-12 bg-red-100 rounded-xl flex items-center justify-center">
                <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pass Rate</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {stats.passRate.toFixed(1)}%
                </p>
              </div>
              <div className="h-12 w-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <svg className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        {distribution && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Grade Distribution Pie Chart */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Grade Distribution
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={gradeChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ grade, count, percent }) =>
                      count > 0 ? `${grade}: ${count} (${(percent * 100).toFixed(0)}%)` : ""
                    }
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {gradeChartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={GRADE_COLORS[entry.grade as keyof typeof GRADE_COLORS]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number, name: string, props: any) => [
                      value,
                      props.payload.fullLabel,
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Score Range Bar Chart */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Score Distribution
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={scoreChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="range" tick={{ fontSize: 12 }} />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Results Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              Student Results
            </h2>
            <button
              onClick={exportToCSV}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export CSV
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Student
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Registration No.
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                    Correct
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                    Incorrect
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                    Unanswered
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                    Total Marks
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                    Percentage
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {results.map((result) => (
                  <tr key={result.student_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {result.name}
                      </div>
                      <div className="text-sm text-gray-500">{result.email}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {result.registration_number}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {result.correct_answers}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        {result.incorrect_answers}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {result.unanswered}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center text-sm font-medium text-gray-900">
                      {result.total_marks}/{result.total_questions}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          result.percentage >= 75
                            ? "bg-green-100 text-green-800"
                            : result.percentage >= 50
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {result.percentage.toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {results.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No results available yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}