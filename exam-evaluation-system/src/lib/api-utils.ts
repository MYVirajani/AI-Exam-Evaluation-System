// src/lib/api-utils.ts
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  status: number;
}

export async function apiRequest<T>(
  url: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        error: data.error || `HTTP ${response.status}: ${response.statusText}`,
        status: response.status,
      };
    }

    return {
      data,
      status: response.status,
    };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Network error occurred',
      status: 0,
    };
  }
}

// // src/lib/dashboard-api.ts
// import { apiRequest } from './api-utils';
// import { Result, GradedAnswer } from '../types';

// export interface DashboardStats {
//   total_answers: number;
//   unique_students: number;
//   unique_modules: number;
//   average_percentage: number;
//   min_percentage: number;
//   max_percentage: number;
// }

// export interface StudentData {
//   results: Result[];
//   gradedAnswers: GradedAnswer[];
// }

// export class DashboardAPI {
//   static async getResults(): Promise<ApiResponse<Result[]>> {
//     return apiRequest<Result[]>('/api/results');
//   }

//   static async getGradedAnswers(studentIndex?: string): Promise<ApiResponse<GradedAnswer[]>> {
//     const url = studentIndex 
//       ? `/api/graded-answers?student_index=${encodeURIComponent(studentIndex)}`
//       : '/api/graded-answers';
//     return apiRequest<GradedAnswer[]>(url);
//   }

//   static async getStudentData(studentIndex: string): Promise<ApiResponse<StudentData>> {
//     return apiRequest<StudentData>(`/api/results/${encodeURIComponent(studentIndex)}`);
//   }

//   static async getStats(): Promise<ApiResponse<DashboardStats>> {
//     return apiRequest<DashboardStats>('/api/graded-answers/stats');
//   }
// }

// // Enhanced version of the dashboard component using the API utility
// // src/components/EnhancedStudentResultsDashboard.tsx
// 'use client'
// import React, { useEffect, useState, useCallback } from 'react';
// import TabButton from './TabButton';
// import ResultsChart from './ResultsChart';
// import ResultsTable from './ResultsTable';
// import GradedAnswersTable from './GradedAnswersTable';
// import { GradedAnswer, Result } from './types';
// import { DashboardAPI, DashboardStats } from '../lib/dashboard-api';

// const EnhancedStudentResultsDashboard = () => {
//   const [results, setResults] = useState<Result[]>([]);
//   const [gradedAnswers, setGradedAnswers] = useState<GradedAnswer[]>([]);
//   const [stats, setStats] = useState<DashboardStats | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [activeTab, setActiveTab] = useState<'results' | 'graded'>('results');

//   const fetchData = useCallback(async () => {
//     try {
//       setLoading(true);
//       setError(null);
      
//       const [resultsResponse, gradedAnswersResponse, statsResponse] = await Promise.all([
//         DashboardAPI.getResults(),
//         DashboardAPI.getGradedAnswers(),
//         DashboardAPI.getStats()
//       ]);

//       if (resultsResponse.error) {
//         throw new Error(`Failed to fetch results: ${resultsResponse.error}`);
//       }

//       if (gradedAnswersResponse.error) {
//         throw new Error(`Failed to fetch graded answers: ${gradedAnswersResponse.error}`);
//       }

//       if (statsResponse.error) {
//         console.warn('Failed to fetch stats:', statsResponse.error);
//       }

//       setResults(resultsResponse.data || []);
//       setGradedAnswers(gradedAnswersResponse.data || []);
//       setStats(statsResponse.data || null);
      
//     } catch (err) {
//       console.error('Error fetching data:', err);
//       setError(err instanceof Error ? err.message : 'Failed to fetch data');
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   useEffect(() => {
//     fetchData();
//   }, [fetchData]);

//   const handleRetry = () => {
//     fetchData();
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
//         <div className="max-w-7xl mx-auto p-6">
//           <div className="bg-white rounded-xl shadow-lg p-8">
//             <div className="flex items-center justify-center space-x-2">
//               <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
//               <p className="text-gray-700">Loading dashboard...</p>
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
//         <div className="max-w-7xl mx-auto p-6">
//           <div className="bg-white rounded-xl shadow-lg p-8">
//             <div className="text-center">
//               <div className="text-red-600 mb-2">
//                 <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
//                 </svg>
//               </div>
//               <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Data</h3>
//               <p className="text-gray-600 mb-4">{error}</p>
//               <button 
//                 onClick={handleRetry}
//                 className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
//               >
//                 Retry
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
//       <div className="max-w-7xl mx-auto p-6">
//         <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
//           <h1 className="text-4xl font-bold mb-8 text-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
//             Student Results Dashboard
//           </h1>

//           {/* Enhanced Data Summary */}
//           <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 p-4 bg-gray-50 rounded-lg">
//             <div className="text-center">
//               <div className="text-2xl font-bold text-blue-600">{results.length}</div>
//               <div className="text-sm text-gray-600">Total Results</div>
//             </div>
//             <div className="text-center">
//               <div className="text-2xl font-bold text-purple-600">{gradedAnswers.length}</div>
//               <div className="text-sm text-gray-600">Graded Answers</div>
//             </div>
//             {stats && (
//               <>
//                 <div className="text-center">
//                   <div className="text-2xl font-bold text-green-600">{stats.unique_students}</div>
//                   <div className="text-sm text-gray-600">Students</div>
//                 </div>
//                 <div className="text-center">
//                   <div className="text-2xl font-bold text-orange-600">{stats.average_percentage.toFixed(1)}%</div>
//                   <div className="text-sm text-gray-600">Avg Score</div>
//                 </div>
//               </>
//             )}
//           </div>

//           <div className="flex mb-8 bg-gray-100 rounded-lg p-1">
//             <TabButton 
//               tabId="results" 
//               label="Results Summary" 
//               isActive={activeTab === 'results'} 
//               onClick={setActiveTab} 
//             />
//             <TabButton 
//               tabId="graded" 
//               label="Detailed Graded Answers" 
//               isActive={activeTab === 'graded'} 
//               onClick={setActiveTab} 
//             />
//           </div>

//           <div className="tab-content space-y-10">
//             {activeTab === 'results' && (
//               <>
//                 <ResultsChart results={results} />
//                 <ResultsTable results={results} />
//               </>
//             )}
//             {activeTab === 'graded' && (
//               <GradedAnswersTable gradedAnswers={gradedAnswers} />
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default EnhancedStudentResultsDashboard;