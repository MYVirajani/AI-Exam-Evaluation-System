// // import React, { useState } from 'react';
// // import { Result } from './types';

// // interface Props {
// //   results: Result[];
// // }

// // const ResultsTable: React.FC<Props> = ({ results }) => {
// //   const [currentPage, setCurrentPage] = useState(1);
// //   const [rowsPerPage, setRowsPerPage] = useState(5);

// //   const getGradeColor = (percent: number) => {
// //     if (percent >= 90) return 'text-green-600';
// //     if (percent >= 80) return 'text-blue-600';
// //     if (percent >= 70) return 'text-yellow-600';
// //     if (percent >= 60) return 'text-orange-600';
// //     return 'text-red-600';
// //   };

// //   // Calculate pagination
// //   const totalPages = Math.ceil(results.length / rowsPerPage);
// //   const startIndex = (currentPage - 1) * rowsPerPage;
// //   const endIndex = startIndex + rowsPerPage;
// //   const currentResults = results.slice(startIndex, endIndex);

// //   // Handle page changes
// //   const handlePageChange = (page: number) => {
// //     setCurrentPage(page);
// //   };

// //   // Handle rows per page change
// //   const handleRowsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
// //     setRowsPerPage(Number(e.target.value));
// //     setCurrentPage(1); // Reset to first page when changing rows per page
// //   };

// //   // Generate page numbers for pagination
// //   const getPageNumbers = () => {
// //     const pages = [];
// //     const maxVisiblePages = 5;
// //     let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
// //     let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

// //     if (endPage - startPage < maxVisiblePages - 1) {
// //       startPage = Math.max(1, endPage - maxVisiblePages + 1);
// //     }

// //     for (let i = startPage; i <= endPage; i++) {
// //       pages.push(i);
// //     }
// //     return pages;
// //   };

// //   return (
// //     <div className="bg-white rounded-lg shadow-md">
// //       <h3 className="text-xl font-bold p-4 bg-gradient-to-r from-slate-800 to-slate-700 text-white rounded-t-lg">
// //         Student Results Summary
// //       </h3>
      
// //       {/* Rows per page selector */}
// //       <div className="p-4 border-b border-gray-200 bg-gray-50">
// //         <div className="flex items-center justify-between">
// //           <div className="flex items-center space-x-2">
// //             <label htmlFor="rowsPerPage" className="text-sm font-medium text-gray-700">
// //               Rows per page:
// //             </label>
// //             <select
// //               id="rowsPerPage"
// //               value={rowsPerPage}
// //               onChange={handleRowsPerPageChange}
// //               className="border border-gray-300 rounded-md px-3 py-1 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-slate-500"
// //             >
// //               <option value={5}>5</option>
// //               <option value={10}>10</option>
// //               <option value={15}>15</option>
// //               <option value={25}>25</option>
// //             </select>
// //           </div>
// //           <div className="text-sm text-gray-600">
// //             Showing {startIndex + 1}-{Math.min(endIndex, results.length)} of {results.length} results
// //           </div>
// //         </div>
// //       </div>

// //       <div className="overflow-auto overflow-x-auto">
// //         <table className="min-w-full bg-white border-collapse">
// //           <thead className="sticky top-0 z-10">
// //             <tr className="bg-gradient-to-r from-slate-800 to-slate-700 text-white text-sm uppercase tracking-wider">
// //               <th className="px-6 py-4 border border-slate-600">Index</th>
// //               <th className="px-6 py-4 border border-slate-600">Module</th>
// //               <th className="px-6 py-4 border border-slate-600">Year</th>
// //               <th className="px-6 py-4 border border-slate-600">Month</th>
// //               <th className="px-6 py-4 border border-slate-600">Marks</th>
// //               <th className="px-6 py-4 border border-slate-600">Total</th>
// //               <th className="px-6 py-4 border border-slate-600">Percentage</th>
// //               <th className="px-6 py-4 border border-slate-600">Graded At</th>
// //             </tr>
// //           </thead>
// //           <tbody>
// //             {currentResults.map((res, index) => {
// //               const percentage = ((res.total_marks / res.total_possible) * 100).toFixed(1);
// //               return (
// //                 <tr key={res.id} className={`text-center ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}>
// //                   <td className="border px-6 py-4 text-slate-800">{res.student_index}</td>
// //                   <td className="border px-6 py-4 text-slate-700">{res.module_code}</td>
// //                   <td className="border px-6 py-4 text-slate-700">{res.exam_year}</td>
// //                   <td className="border px-6 py-4 text-slate-700">{res.exam_month}</td>
// //                   <td className="border px-6 py-4 text-blue-600 font-bold">{res.total_marks}</td>
// //                   <td className="border px-6 py-4 text-green-600 font-semibold">{res.total_possible}</td>
// //                   <td className={`border px-6 py-4 font-bold ${getGradeColor(parseFloat(percentage))}`}>
// //                     {percentage}%
// //                   </td>
// //                   <td className="border px-6 py-4 text-slate-600 text-sm">{new Date(res.graded_at).toLocaleString()}</td>
// //                 </tr>
// //               );
// //             })}
// //           </tbody>
// //         </table>
// //       </div>

// //       {/* Pagination controls */}
// //       {totalPages > 1 && (
// //         <div className="p-4 border-t border-gray-200 bg-gray-50">
// //           <div className="flex items-center justify-center space-x-2">
// //             {/* Previous button */}
// //             <button
// //               onClick={() => handlePageChange(currentPage - 1)}
// //               disabled={currentPage === 1}
// //               className="px-3 py-1 text-sm text-gray-900 bg-white border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed disabled:text-gray-400"
// //             >
// //               Previous
// //             </button>

// //             {/* Page numbers */}
// //             {getPageNumbers().map((page) => (
// //               <button
// //                 key={page}
// //                 onClick={() => handlePageChange(page)}
// //                 className={`px-3 py-1 text-sm border rounded-md ${
// //                   currentPage === page
// //                     ? 'bg-slate-700 text-white border-slate-700'
// //                     : 'bg-white text-gray-900 border-gray-300 hover:bg-gray-100'
// //                 }`}
// //               >
// //                 {page}
// //               </button>
// //             ))}

// //             {/* Next button */}
// //             <button
// //               onClick={() => handlePageChange(currentPage + 1)}
// //               disabled={currentPage === totalPages}
// //               className="px-3 py-1 text-sm text-gray-900 bg-white border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed disabled:text-gray-400"
// //             >
// //               Next
// //             </button>
// //           </div>
// //         </div>
// //       )}
// //     </div>
// //   );
// // };

// // export default ResultsTable;

// // import React, { useState } from 'react';
// // import { Result } from './types';

// // interface Props {
// //   results: Result[];
// // }

// // const ResultsTable: React.FC<Props> = ({ results }) => {
// //   const [currentPage, setCurrentPage] = useState(1);
// //   const [rowsPerPage, setRowsPerPage] = useState(5);

// //   const getGradeColor = (percent: number) => {
// //     if (percent >= 90) return 'text-green-600';
// //     if (percent >= 80) return 'text-blue-600';
// //     if (percent >= 70) return 'text-yellow-600';
// //     if (percent >= 60) return 'text-orange-600';
// //     return 'text-red-600';
// //   };

// //   // Calculate pagination
// //   const totalPages = Math.ceil(results.length / rowsPerPage);
// //   const startIndex = (currentPage - 1) * rowsPerPage;
// //   const endIndex = startIndex + rowsPerPage;
// //   const currentResults = results.slice(startIndex, endIndex);

// //   // Handle page changes
// //   const handlePageChange = (page: number) => {
// //     setCurrentPage(page);
// //   };

// //   // Handle rows per page change
// //   const handleRowsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
// //     setRowsPerPage(Number(e.target.value));
// //     setCurrentPage(1); // Reset to first page when changing rows per page
// //   };

// //   // Generate page numbers for pagination
// //   const getPageNumbers = () => {
// //     const pages = [];
// //     const maxVisiblePages = 5;
// //     let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
// //     let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

// //     if (endPage - startPage < maxVisiblePages - 1) {
// //       startPage = Math.max(1, endPage - maxVisiblePages + 1);
// //     }

// //     for (let i = startPage; i <= endPage; i++) {
// //       pages.push(i);
// //     }
// //     return pages;
// //   };

// //   return (
// //     <div className="bg-white rounded-lg shadow-md">
// //       <h3 className="text-xl font-bold p-4 bg-gradient-to-r from-slate-800 to-slate-700 text-white rounded-t-lg">
// //         Student Results Summary
// //       </h3>
      
// //       {/* Rows per page selector */}
// //       <div className="p-4 border-b border-gray-200 bg-gray-50">
// //         <div className="flex items-center justify-between">
// //           <div className="flex items-center space-x-2">
// //             <label htmlFor="rowsPerPage" className="text-sm font-medium text-gray-700">
// //               Rows per page:
// //             </label>
// //             <select
// //               id="rowsPerPage"
// //               value={rowsPerPage}
// //               onChange={handleRowsPerPageChange}
// //               className="border border-gray-300 rounded-md px-3 py-1 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-slate-500"
// //             >
// //               <option value={5}>5</option>
// //               <option value={10}>10</option>
// //               <option value={15}>15</option>
// //               <option value={25}>25</option>
// //             </select>
// //           </div>
// //           <div className="text-sm text-gray-600">
// //             Showing {startIndex + 1}-{Math.min(endIndex, results.length)} of {results.length} results
// //           </div>
// //         </div>
// //       </div>

// //       <div className="overflow-auto overflow-x-auto">
// //         <table className="min-w-full bg-white border-collapse">
// //           <thead className="sticky top-0 z-10">
// //             <tr className="bg-gradient-to-r from-slate-800 to-slate-700 text-white text-sm uppercase tracking-wider">
// //               <th className="px-6 py-4 border border-slate-600">Index</th>
// //               <th className="px-6 py-4 border border-slate-600">Module</th>
// //               <th className="px-6 py-4 border border-slate-600">Year</th>
// //               <th className="px-6 py-4 border border-slate-600">Month</th>
// //               <th className="px-6 py-4 border border-slate-600">Marks</th>
// //               <th className="px-6 py-4 border border-slate-600">Total</th>
// //               <th className="px-6 py-4 border border-slate-600">Percentage</th>
// //               <th className="px-6 py-4 border border-slate-600">Graded At</th>
// //             </tr>
// //           </thead>
// //           <tbody>
// //             {currentResults.map((res, index) => {
// //               const percentage = ((res.total_marks / res.total_possible) * 100).toFixed(1);
// //               return (
// //                 <tr key={res.id} className={`text-center ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}>
// //                   <td className="border px-6 py-4 text-slate-800">{res.student_index}</td>
// //                   <td className="border px-6 py-4 text-slate-700">{res.module_code}</td>
// //                   <td className="border px-6 py-4 text-slate-700">{res.exam_year}</td>
// //                   <td className="border px-6 py-4 text-slate-700">{res.exam_month}</td>
// //                   <td className="border px-6 py-4 text-blue-600 font-bold">{res.total_marks}</td>
// //                   <td className="border px-6 py-4 text-green-600 font-semibold">{res.total_possible}</td>
// //                   <td className={`border px-6 py-4 font-bold ${getGradeColor(parseFloat(percentage))}`}>
// //                     {percentage}%
// //                   </td>
// //                   <td className="border px-6 py-4 text-slate-600 text-sm">{new Date(res.graded_at).toLocaleString()}</td>
// //                 </tr>
// //               );
// //             })}
// //           </tbody>
// //         </table>
// //       </div>

// //       {/* Pagination controls */}
// //       {totalPages > 1 && (
// //         <div className="p-4 border-t border-gray-200 bg-gray-50">
// //           <div className="flex items-center justify-center space-x-2">
// //             {/* Previous button */}
// //             <button
// //               onClick={() => handlePageChange(currentPage - 1)}
// //               disabled={currentPage === 1}
// //               className="px-3 py-1 text-sm text-gray-900 bg-white border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed disabled:text-gray-400"
// //             >
// //               Previous
// //             </button>

// //             {/* Page numbers */}
// //             {getPageNumbers().map((page) => (
// //               <button
// //                 key={page}
// //                 onClick={() => handlePageChange(page)}
// //                 className={`px-3 py-1 text-sm border rounded-md ${
// //                   currentPage === page
// //                     ? 'bg-slate-700 text-white border-slate-700'
// //                     : 'bg-white text-gray-900 border-gray-300 hover:bg-gray-100'
// //                 }`}
// //               >
// //                 {page}
// //               </button>
// //             ))}

// //             {/* Next button */}
// //             <button
// //               onClick={() => handlePageChange(currentPage + 1)}
// //               disabled={currentPage === totalPages}
// //               className="px-3 py-1 text-sm text-gray-900 bg-white border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed disabled:text-gray-400"
// //             >
// //               Next
// //             </button>
// //           </div>
// //         </div>
// //       )}
// //     </div>
// //   );
// // };

// // export default ResultsTable;

// // import React, { useState } from 'react';
// // import { Eye } from 'lucide-react';

// // // Types
// // interface Result {
// //   id: string;
// //   student_index: string;
// //   module_code: string;
// //   exam_year: number;
// //   exam_month: string;
// //   total_marks: number;
// //   total_possible: number;
// //   graded_at: string;
// // }

// // interface Props {
// //   results: Result[];
// // }

// // const ResultsTable: React.FC<Props> = ({ results }) => {
// //   const [currentPage, setCurrentPage] = useState(1);
// //   const [rowsPerPage, setRowsPerPage] = useState(5);

// //   const getGradeColor = (percent: number) => {
// //     if (percent >= 90) return 'text-green-600';
// //     if (percent >= 80) return 'text-blue-600';
// //     if (percent >= 70) return 'text-yellow-600';
// //     if (percent >= 60) return 'text-orange-600';
// //     return 'text-red-600';
// //   };

// //   // Calculate pagination
// //   const totalPages = Math.ceil(results.length / rowsPerPage);
// //   const startIndex = (currentPage - 1) * rowsPerPage;
// //   const endIndex = startIndex + rowsPerPage;
// //   const currentResults = results.slice(startIndex, endIndex);

// //   // Handle page changes
// //   const handlePageChange = (page: number) => {
// //     setCurrentPage(page);
// //   };

// //   // Handle rows per page change
// //   const handleRowsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
// //     setRowsPerPage(Number(e.target.value));
// //     setCurrentPage(1); // Reset to first page when changing rows per page
// //   };

// //   // Handle view button click
// //   const handleViewDetails = (result: Result) => {
// //     // This function can be customized to open a modal, navigate to a detail page, etc.
// //     console.log('View details for:', result);
// //     alert(`Viewing details for student ${result.student_index}\nModule: ${result.module_code}\nScore: ${result.total_marks}/${result.total_possible}`);
// //   };

// //   // Generate page numbers for pagination
// //   const getPageNumbers = () => {
// //     const pages = [];
// //     const maxVisiblePages = 5;
// //     let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
// //     let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

// //     if (endPage - startPage < maxVisiblePages - 1) {
// //       startPage = Math.max(1, endPage - maxVisiblePages + 1);
// //     }

// //     for (let i = startPage; i <= endPage; i++) {
// //       pages.push(i);
// //     }
// //     return pages;
// //   };

// //   return (
// //     <div className="bg-white rounded-lg shadow-md">
// //       <h3 className="text-xl font-bold p-4 bg-gradient-to-r from-slate-800 to-slate-700 text-white rounded-t-lg">
// //         Student Results Summary
// //       </h3>
      
// //       {/* Rows per page selector */}
// //       <div className="p-4 border-b border-gray-200 bg-gray-50">
// //         <div className="flex items-center justify-between">
// //           <div className="flex items-center space-x-2">
// //             <label htmlFor="rowsPerPage" className="text-sm font-medium text-gray-700">
// //               Rows per page:
// //             </label>
// //             <select
// //               id="rowsPerPage"
// //               value={rowsPerPage}
// //               onChange={handleRowsPerPageChange}
// //               className="border border-gray-300 rounded-md px-3 py-1 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-slate-500"
// //             >
// //               <option value={5}>5</option>
// //               <option value={10}>10</option>
// //               <option value={15}>15</option>
// //               <option value={25}>25</option>
// //             </select>
// //           </div>
// //           <div className="text-sm text-gray-600">
// //             Showing {startIndex + 1}-{Math.min(endIndex, results.length)} of {results.length} results
// //           </div>
// //         </div>
// //       </div>

// //       <div className="overflow-auto overflow-x-auto">
// //         <table className="min-w-full bg-white border-collapse">
// //           <thead className="sticky top-0 z-10">
// //             <tr className="bg-gradient-to-r from-slate-800 to-slate-700 text-white text-sm uppercase tracking-wider">
// //               <th className="px-6 py-4 border border-slate-600">Index</th>
// //               <th className="px-6 py-4 border border-slate-600">Module</th>
// //               <th className="px-6 py-4 border border-slate-600">Year</th>
// //               <th className="px-6 py-4 border border-slate-600">Month</th>
// //               <th className="px-6 py-4 border border-slate-600">Marks</th>
// //               <th className="px-6 py-4 border border-slate-600">Total</th>
// //               <th className="px-6 py-4 border border-slate-600">Percentage</th>
// //               <th className="px-6 py-4 border border-slate-600">Graded At</th>
// //               <th className="px-6 py-4 border border-slate-600">Action</th>
// //             </tr>
// //           </thead>
// //           <tbody>
// //             {currentResults.map((res, index) => {
// //               const percentage = ((res.total_marks / res.total_possible) * 100).toFixed(1);
// //               return (
// //                 <tr key={res.id} className={`text-center ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'} hover:bg-blue-50 transition-colors`}>
// //                   <td className="border px-6 py-4 text-slate-800 font-medium">{res.student_index}</td>
// //                   <td className="border px-6 py-4 text-slate-700">{res.module_code}</td>
// //                   <td className="border px-6 py-4 text-slate-700">{res.exam_year}</td>
// //                   <td className="border px-6 py-4 text-slate-700">{res.exam_month}</td>
// //                   <td className="border px-6 py-4 text-blue-600 font-bold">{res.total_marks}</td>
// //                   <td className="border px-6 py-4 text-green-600 font-semibold">{res.total_possible}</td>
// //                   <td className={`border px-6 py-4 font-bold ${getGradeColor(parseFloat(percentage))}`}>
// //                     {percentage}%
// //                   </td>
// //                   <td className="border px-6 py-4 text-slate-600 text-sm">
// //                     <div className="flex flex-col">
// //                       <span>{new Date(res.graded_at).toLocaleDateString()}</span>
// //                       <span className="text-xs text-gray-400">
// //                         {new Date(res.graded_at).toLocaleTimeString('en-US', {
// //                           hour: '2-digit',
// //                           minute: '2-digit'
// //                         })}
// //                       </span>
// //                     </div>
// //                   </td>
// //                   <td className="border px-6 py-4">
// //                     <button
// //                       onClick={() => handleViewDetails(res)}
// //                       className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition-all duration-200"
// //                       title={`View details for ${res.student_index}`}
// //                     >
// //                       <Eye className="w-4 h-4 mr-1.5" />
// //                       View
// //                     </button>
// //                   </td>
// //                 </tr>
// //               );
// //             })}
// //           </tbody>
// //         </table>
// //       </div>

// //       {/* Pagination controls */}
// //       {totalPages > 1 && (
// //         <div className="p-4 border-t border-gray-200 bg-gray-50">
// //           <div className="flex items-center justify-center space-x-2">
// //             {/* Previous button */}
// //             <button
// //               onClick={() => handlePageChange(currentPage - 1)}
// //               disabled={currentPage === 1}
// //               className="px-3 py-1 text-sm text-gray-900 bg-white border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed disabled:text-gray-400 transition-colors"
// //             >
// //               Previous
// //             </button>

// //             {/* Page numbers */}
// //             {getPageNumbers().map((page) => (
// //               <button
// //                 key={page}
// //                 onClick={() => handlePageChange(page)}
// //                 className={`px-3 py-1 text-sm border rounded-md transition-colors ${
// //                   currentPage === page
// //                     ? 'bg-slate-700 text-white border-slate-700'
// //                     : 'bg-white text-gray-900 border-gray-300 hover:bg-gray-100'
// //                 }`}
// //               >
// //                 {page}
// //               </button>
// //             ))}

// //             {/* Next button */}
// //             <button
// //               onClick={() => handlePageChange(currentPage + 1)}
// //               disabled={currentPage === totalPages}
// //               className="px-3 py-1 text-sm text-gray-900 bg-white border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed disabled:text-gray-400 transition-colors"
// //             >
// //               Next
// //             </button>
// //           </div>
// //         </div>
// //       )}
// //     </div>
// //   );
// // };

// // export default ResultsTable;

// import React, { useState } from 'react';
// import { Eye, Download } from 'lucide-react';

// // Types
// interface Result {
//   id: string;
//   student_index: string;
//   module_code: string;
//   exam_year: number;
//   exam_month: string;
//   total_marks: number;
//   total_possible: number;
//   graded_at: string;
// }

// interface Props {
//   results: Result[];
// }

// const ResultsTable: React.FC<Props> = ({ results }) => {
//   const [currentPage, setCurrentPage] = useState(1);
//   const [rowsPerPage, setRowsPerPage] = useState(5);

//   const getGradeColor = (percent: number) => {
//     if (percent >= 90) return 'text-green-600';
//     if (percent >= 80) return 'text-blue-600';
//     if (percent >= 70) return 'text-yellow-600';
//     if (percent >= 60) return 'text-orange-600';
//     return 'text-red-600';
//   };

//   // CSV Download Function
//   const downloadCSV = () => {
//     const headers = [
//       'Student Index',
//       'Marks Obtained',
//       'Total Possible',
//       'Percentage',
//     ];

//     const csvData = results.map(result => {
//       const percentage = ((result.total_marks / result.total_possible) * 100).toFixed(1);
//       const gradedDate = new Date(result.graded_at);
      
//       return [
//         result.student_index,
//         result.total_marks,
//         result.total_possible,
//         `${percentage}%`,
//       ];
//     });

//     // Create CSV content
//     const csvContent = [
//       headers.join(','),
//       ...csvData.map(row => 
//         row.map(field => 
//           // Escape fields that contain commas, quotes, or newlines
//           typeof field === 'string' && (field.includes(',') || field.includes('"') || field.includes('\n'))
//             ? `"${field.replace(/"/g, '""')}"`
//             : field
//         ).join(',')
//       )
//     ].join('\n');

//     // Create and download the file
//     const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
//     const link = document.createElement('a');
//     const url = URL.createObjectURL(blob);
    
//     link.setAttribute('href', url);
//     link.setAttribute('download', `student-results-${new Date().toISOString().split('T')[0]}.csv`);
//     link.style.visibility = 'hidden';
    
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
    
//     // Clean up the URL object
//     URL.revokeObjectURL(url);
//   };

//   // Calculate pagination
//   const totalPages = Math.ceil(results.length / rowsPerPage);
//   const startIndex = (currentPage - 1) * rowsPerPage;
//   const endIndex = startIndex + rowsPerPage;
//   const currentResults = results.slice(startIndex, endIndex);

//   // Handle page changes
//   const handlePageChange = (page: number) => {
//     setCurrentPage(page);
//   };

//   // Handle rows per page change
//   const handleRowsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
//     setRowsPerPage(Number(e.target.value));
//     setCurrentPage(1); // Reset to first page when changing rows per page
//   };

//   // Handle view button click
//   const handleViewDetails = (result: Result) => {
//     // This function can be customized to open a modal, navigate to a detail page, etc.
//     console.log('View details for:', result);
//     alert(`Viewing details for student ${result.student_index}\nModule: ${result.module_code}\nScore: ${result.total_marks}/${result.total_possible}`);
//   };

//   // Generate page numbers for pagination
//   const getPageNumbers = () => {
//     const pages = [];
//     const maxVisiblePages = 5;
//     let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
//     let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

//     if (endPage - startPage < maxVisiblePages - 1) {
//       startPage = Math.max(1, endPage - maxVisiblePages + 1);
//     }

//     for (let i = startPage; i <= endPage; i++) {
//       pages.push(i);
//     }
//     return pages;
//   };

//   return (
//     <div className="bg-white rounded-lg shadow-md">
//       <div className="flex items-center justify-between p-4 bg-gradient-to-r from-slate-800 to-slate-700 text-white rounded-t-lg">
//         <h3 className="text-xl font-bold">
//           Student Results Summary
//         </h3>
//         <button
//           onClick={downloadCSV}
//           className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
//           title="Download results as CSV"
//         >
//           <Download className="w-4 h-4 mr-2" />
//           Download CSV
//         </button>
//       </div>
      
//       {/* Rows per page selector */}
//       <div className="p-4 border-b border-gray-200 bg-gray-50">
//         <div className="flex items-center justify-between">
//           <div className="flex items-center space-x-2">
//             <label htmlFor="rowsPerPage" className="text-sm font-medium text-gray-700">
//               Rows per page:
//             </label>
//             <select
//               id="rowsPerPage"
//               value={rowsPerPage}
//               onChange={handleRowsPerPageChange}
//               className="border border-gray-300 rounded-md px-3 py-1 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-slate-500"
//             >
//               <option value={5}>5</option>
//               <option value={10}>10</option>
//               <option value={15}>15</option>
//               <option value={25}>25</option>
//             </select>
//           </div>
//           <div className="flex items-center space-x-4">
//             <div className="text-sm text-gray-600">
//               Showing {startIndex + 1}-{Math.min(endIndex, results.length)} of {results.length} results
//             </div>
//             <div className="text-sm text-gray-500">
//               Total records available for download: {results.length}
//             </div>
//           </div>
//         </div>
//       </div>

//       <div className="overflow-auto overflow-x-auto">
//         <table className="min-w-full bg-white border-collapse">
//           <thead className="sticky top-0 z-10">
//             <tr className="bg-gradient-to-r from-slate-800 to-slate-700 text-white text-sm uppercase tracking-wider">
//               <th className="px-6 py-4 border border-slate-600">Index</th>
//               <th className="px-6 py-4 border border-slate-600">Module</th>
//               <th className="px-6 py-4 border border-slate-600">Year</th>
//               <th className="px-6 py-4 border border-slate-600">Month</th>
//               <th className="px-6 py-4 border border-slate-600">Marks</th>
//               <th className="px-6 py-4 border border-slate-600">Total</th>
//               <th className="px-6 py-4 border border-slate-600">Percentage</th>
//               <th className="px-6 py-4 border border-slate-600">Graded At</th>
//               <th className="px-6 py-4 border border-slate-600">Action</th>
//             </tr>
//           </thead>
//           <tbody>
//             {currentResults.map((res, index) => {
//               const percentage = ((res.total_marks / res.total_possible) * 100).toFixed(1);
//               return (
//                 <tr key={res.id} className={`text-center ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'} hover:bg-blue-50 transition-colors`}>
//                   <td className="border px-6 py-4 text-slate-800 font-medium">{res.student_index}</td>
//                   <td className="border px-6 py-4 text-slate-700">{res.module_code}</td>
//                   <td className="border px-6 py-4 text-slate-700">{res.exam_year}</td>
//                   <td className="border px-6 py-4 text-slate-700">{res.exam_month}</td>
//                   <td className="border px-6 py-4 text-blue-600 font-bold">{res.total_marks}</td>
//                   <td className="border px-6 py-4 text-green-600 font-semibold">{res.total_possible}</td>
//                   <td className={`border px-6 py-4 font-bold ${getGradeColor(parseFloat(percentage))}`}>
//                     {percentage}%
//                   </td>
//                   <td className="border px-6 py-4 text-slate-600 text-sm">
//                     <div className="flex flex-col">
//                       <span>{new Date(res.graded_at).toLocaleDateString()}</span>
//                       <span className="text-xs text-gray-400">
//                         {new Date(res.graded_at).toLocaleTimeString('en-US', {
//                           hour: '2-digit',
//                           minute: '2-digit'
//                         })}
//                       </span>
//                     </div>
//                   </td>
//                   <td className="border px-6 py-4">
//                     <button
//                       onClick={() => handleViewDetails(res)}
//                       className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition-all duration-200"
//                       title={`View details for ${res.student_index}`}
//                     >
//                       <Eye className="w-4 h-4 mr-1.5" />
//                       View
//                     </button>
//                   </td>
//                 </tr>
//               );
//             })}
//           </tbody>
//         </table>
//       </div>

//       {/* Pagination controls */}
//       {totalPages > 1 && (
//         <div className="p-4 border-t border-gray-200 bg-gray-50">
//           <div className="flex items-center justify-center space-x-2">
//             {/* Previous button */}
//             <button
//               onClick={() => handlePageChange(currentPage - 1)}
//               disabled={currentPage === 1}
//               className="px-3 py-1 text-sm text-gray-900 bg-white border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed disabled:text-gray-400 transition-colors"
//             >
//               Previous
//             </button>

//             {/* Page numbers */}
//             {getPageNumbers().map((page) => (
//               <button
//                 key={page}
//                 onClick={() => handlePageChange(page)}
//                 className={`px-3 py-1 text-sm border rounded-md transition-colors ${
//                   currentPage === page
//                     ? 'bg-slate-700 text-white border-slate-700'
//                     : 'bg-white text-gray-900 border-gray-300 hover:bg-gray-100'
//                 }`}
//               >
//                 {page}
//               </button>
//             ))}

//             {/* Next button */}
//             <button
//               onClick={() => handlePageChange(currentPage + 1)}
//               disabled={currentPage === totalPages}
//               className="px-3 py-1 text-sm text-gray-900 bg-white border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed disabled:text-gray-400 transition-colors"
//             >
//               Next
//             </button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default ResultsTable;

import React, { useState } from 'react';
import { Eye, Download } from 'lucide-react';
import { useRouter } from 'next/navigation';

// Types
interface Result {
  id: string;
  student_index: string;
  module_code: string;
  exam_year: number;
  exam_month: string;
  total_marks: number;
  total_possible: number;
  graded_at: string;
  assessment_id?: string; // Add this field
}

interface Props {
  results: Result[];
}

const ResultsTable: React.FC<Props> = ({ results }) => {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const getGradeColor = (percent: number) => {
    if (percent >= 90) return 'text-green-600';
    if (percent >= 80) return 'text-blue-600';
    if (percent >= 70) return 'text-yellow-600';
    if (percent >= 60) return 'text-orange-600';
    return 'text-red-600';
  };

  // CSV Download Function
  const downloadCSV = () => {
    const headers = [
      'Student Index',
      'Marks Obtained',
      'Total Possible',
      'Percentage',
    ];

    const csvData = results.map(result => {
      const percentage = ((result.total_marks / result.total_possible) * 100).toFixed(1);
      const gradedDate = new Date(result.graded_at);
      
      return [
        result.student_index,
        result.total_marks,
        result.total_possible,
        `${percentage}%`,
      ];
    });

    // Create CSV content
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => 
        row.map(field => 
          // Escape fields that contain commas, quotes, or newlines
          typeof field === 'string' && (field.includes(',') || field.includes('"') || field.includes('\n'))
            ? `"${field.replace(/"/g, '""')}"`
            : field
        ).join(',')
      )
    ].join('\n');

    // Create and download the file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `student-results-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up the URL object
    URL.revokeObjectURL(url);
  };

  // Calculate pagination
  const totalPages = Math.ceil(results.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const currentResults = results.slice(startIndex, endIndex);

  // Handle page changes
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Handle rows per page change
  const handleRowsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setRowsPerPage(Number(e.target.value));
    setCurrentPage(1); // Reset to first page when changing rows per page
  };

  // Handle view button click - Updated to navigate to detail page
  const handleViewDetails = (result: Result) => {
    const params = new URLSearchParams({
      studentIndex: result.student_index,
      moduleCode: result.module_code,
      examYear: result.exam_year.toString(),
      examMonth: result.exam_month,
      assessmentId: result.assessment_id || ''
    });
    
    router.push(`/educator/dashboard/results-dashboard/${result.id}?${params}`);
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <div className="bg-white rounded-lg shadow-md">
      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-slate-800 to-slate-700 text-white rounded-t-lg">
        <h3 className="text-xl font-bold">
          Student Results Summary
        </h3>
        <button
          onClick={downloadCSV}
          className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          title="Download results as CSV"
        >
          <Download className="w-4 h-4 mr-2" />
          Download CSV
        </button>
      </div>
      
      {/* Rows per page selector */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <label htmlFor="rowsPerPage" className="text-sm font-medium text-gray-700">
              Rows per page:
            </label>
            <select
              id="rowsPerPage"
              value={rowsPerPage}
              onChange={handleRowsPerPageChange}
              className="border border-gray-300 rounded-md px-3 py-1 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-slate-500"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={15}>15</option>
              <option value={25}>25</option>
            </select>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-600">
              Showing {startIndex + 1}-{Math.min(endIndex, results.length)} of {results.length} results
            </div>
            <div className="text-sm text-gray-500">
              Total records available for download: {results.length}
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-auto overflow-x-auto">
        <table className="min-w-full bg-white border-collapse">
          <thead className="sticky top-0 z-10">
            <tr className="bg-gradient-to-r from-slate-800 to-slate-700 text-white text-sm uppercase tracking-wider">
              <th className="px-6 py-4 border border-slate-600">Index</th>
              <th className="px-6 py-4 border border-slate-600">Module</th>
              <th className="px-6 py-4 border border-slate-600">Year</th>
              <th className="px-6 py-4 border border-slate-600">Month</th>
              <th className="px-6 py-4 border border-slate-600">Marks</th>
              <th className="px-6 py-4 border border-slate-600">Total</th>
              <th className="px-6 py-4 border border-slate-600">Percentage</th>
              <th className="px-6 py-4 border border-slate-600">Graded At</th>
              <th className="px-6 py-4 border border-slate-600">Action</th>
            </tr>
          </thead>
          <tbody>
            {currentResults.map((res, index) => {
              const percentage = ((res.total_marks / res.total_possible) * 100).toFixed(1);
              return (
                <tr key={res.id} className={`text-center ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'} hover:bg-blue-50 transition-colors`}>
                  <td className="border px-6 py-4 text-slate-800 font-medium">{res.student_index}</td>
                  <td className="border px-6 py-4 text-slate-700">{res.module_code}</td>
                  <td className="border px-6 py-4 text-slate-700">{res.exam_year}</td>
                  <td className="border px-6 py-4 text-slate-700">{res.exam_month}</td>
                  <td className="border px-6 py-4 text-blue-600 font-bold">{res.total_marks}</td>
                  <td className="border px-6 py-4 text-green-600 font-semibold">{res.total_possible}</td>
                  <td className={`border px-6 py-4 font-bold ${getGradeColor(parseFloat(percentage))}`}>
                    {percentage}%
                  </td>
                  <td className="border px-6 py-4 text-slate-600 text-sm">
                    <div className="flex flex-col">
                      <span>{new Date(res.graded_at).toLocaleDateString()}</span>
                      <span className="text-xs text-gray-400">
                        {new Date(res.graded_at).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </td>
                  <td className="border px-6 py-4">
                    <button
                      onClick={() => handleViewDetails(res)}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition-all duration-200"
                      title={`View details for ${res.student_index}`}
                    >
                      <Eye className="w-4 h-4 mr-1.5" />
                      View
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination controls */}
      {totalPages > 1 && (
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-center space-x-2">
            {/* Previous button */}
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1 text-sm text-gray-900 bg-white border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed disabled:text-gray-400 transition-colors"
            >
              Previous
            </button>

            {/* Page numbers */}
            {getPageNumbers().map((page) => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`px-3 py-1 text-sm border rounded-md transition-colors ${
                  currentPage === page
                    ? 'bg-slate-700 text-white border-slate-700'
                    : 'bg-white text-gray-900 border-gray-300 hover:bg-gray-100'
                }`}
              >
                {page}
              </button>
            ))}

            {/* Next button */}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-1 text-sm text-gray-900 bg-white border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed disabled:text-gray-400 transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResultsTable;