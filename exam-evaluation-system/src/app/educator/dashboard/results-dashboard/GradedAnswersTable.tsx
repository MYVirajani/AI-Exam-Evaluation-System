// import React, { useState, useMemo } from 'react';

// interface GradedAnswer {
//   id: number;
//   student_index: string;
//   module_code: string;
//   exam_year: number;
//   exam_month: string;
//   full_question_id: string;
//   mark: number;
//   max_marks: number;
//   reason: string;
//   graded_at: string;
// }

// interface Props {
//   gradedAnswers: GradedAnswer[];
// }

// const GradedAnswersTable: React.FC<Props> = ({ gradedAnswers }) => {
//   const [registrationFilter, setRegistrationFilter] = useState('');
//   const [currentPage, setCurrentPage] = useState(1);
//   const [rowsPerPage, setRowsPerPage] = useState(5);

//   const getGradeColor = (percent: number) => {
//     if (percent >= 90) return 'text-green-600';
//     if (percent >= 80) return 'text-blue-600';
//     if (percent >= 70) return 'text-yellow-600';
//     if (percent >= 60) return 'text-orange-600';
//     return 'text-red-600';
//   };

//   // Filter the graded answers based on registration number
//   const filteredAnswers = useMemo(() => {
//     if (!registrationFilter.trim()) {
//       return gradedAnswers;
//     }
    
//     return gradedAnswers.filter(answer => 
//       answer.student_index.toLowerCase().includes(registrationFilter.toLowerCase().trim())
//     );
//   }, [gradedAnswers, registrationFilter]);

//   // Get unique registration numbers for suggestions/autocomplete
//   const uniqueRegistrations = useMemo(() => {
//     return [...new Set(gradedAnswers.map(answer => answer.student_index))].sort();
//   }, [gradedAnswers]);

//   // Calculate pagination for filtered results
//   const totalPages = Math.ceil(filteredAnswers.length / rowsPerPage);
//   const startIndex = (currentPage - 1) * rowsPerPage;
//   const endIndex = startIndex + rowsPerPage;
//   const currentResults = filteredAnswers.slice(startIndex, endIndex);

//   // Handle page changes
//   const handlePageChange = (page: number) => {
//     setCurrentPage(page);
//   };

//   // Handle rows per page change
//   const handleRowsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
//     setRowsPerPage(Number(e.target.value));
//     setCurrentPage(1); // Reset to first page when changing rows per page
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

//   const clearFilter = () => {
//     setRegistrationFilter('');
//     setCurrentPage(1); // Reset to first page when clearing filter
//   };

//   return (
//     <div className="bg-white rounded-lg shadow-md">
//       <h3 className="text-xl font-bold p-4 bg-gradient-to-r from-slate-800 to-slate-700 text-white rounded-t-lg">
//         Detailed Graded Answers
//       </h3>
      
//       {/* Filter Section */}
//       <div className="p-4 bg-gray-50 border-b border-gray-200">
//         <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
//           <label htmlFor="registration-filter" className="text-sm font-medium text-gray-700 whitespace-nowrap">
//             Filter by Registration:
//           </label>
//           <div className="flex-1 flex gap-2 items-center">
//             <div className="relative flex-1 max-w-md">
//               <input
//                 id="registration-filter"
//                 type="text"
//                 value={registrationFilter}
//                 onChange={(e) => {
//                   setRegistrationFilter(e.target.value);
//                   setCurrentPage(1); // Reset to first page when filtering
//                 }}
//                 placeholder="Enter registration number (e.g., EG/2020/4001)"
//                 className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm text-gray-900 bg-white"
//                 list="registration-suggestions"
//               />
//               <datalist id="registration-suggestions">
//                 {uniqueRegistrations.map(reg => (
//                   <option key={reg} value={reg} />
//                 ))}
//               </datalist>
//               {registrationFilter && (
//                 <button
//                   onClick={clearFilter}
//                   className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 text-lg font-bold"
//                   title="Clear filter"
//                 >
//                   ×
//                 </button>
//               )}
//             </div>
//             <div className="text-sm text-gray-600 whitespace-nowrap">
//               Showing {filteredAnswers.length} of {gradedAnswers.length} records
//             </div>
//           </div>
//         </div>
        
//         {/* Active Filter Display */}
//         {registrationFilter && (
//           <div className="mt-2 flex items-center gap-2">
//             <span className="text-sm text-gray-600">Active filter:</span>
//             <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
//               Registration: {registrationFilter}
//               <button
//                 onClick={clearFilter}
//                 className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full text-blue-400 hover:bg-blue-200 hover:text-blue-600"
//                 title="Remove filter"
//               >
//                 ×
//               </button>
//             </span>
//           </div>
//         )}
//       </div>

//       {/* Pagination Controls */}
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
//           <div className="text-sm text-gray-600">
//             {filteredAnswers.length > 0 ? (
//               <>Showing {startIndex + 1}-{Math.min(endIndex, filteredAnswers.length)} of {filteredAnswers.length} filtered results</>
//             ) : (
//               <>No results to display</>
//             )}
//           </div>
//         </div>
//       </div>

//       {/* Table */}
//       <div className="overflow-auto overflow-x-auto" style={{ scrollbarWidth: 'thin', scrollbarColor: '#CBD5E1 #F1F5F9' }}>
//         {filteredAnswers.length === 0 ? (
//           <div className="p-8 text-center text-gray-500">
//             {registrationFilter ? (
//               <>
//                 <div className="text-lg font-medium mb-2">No results found</div>
//                 <div className="text-sm">
//                   No records match the registration number "{registrationFilter}"
//                 </div>
//                 <button
//                   onClick={clearFilter}
//                   className="mt-3 text-blue-600 hover:text-blue-800 text-sm font-medium"
//                 >
//                   Clear filter to see all records
//                 </button>
//               </>
//             ) : (
//               <div className="text-lg font-medium">No graded answers available</div>
//             )}
//           </div>
//         ) : (
//           <table className="min-w-full bg-white border-collapse">
//             <thead className="sticky top-0 z-10 text-white bg-gradient-to-r from-slate-800 to-slate-700 text-sm uppercase tracking-wider">
//               <tr>
//                 <th className="px-4 py-4 border border-slate-600 font-semibold">ID</th>
//                 <th className="px-4 py-4 border border-slate-600 font-semibold">Student Index</th>
//                 <th className="px-4 py-4 border border-slate-600 font-semibold">Module</th>
//                 <th className="px-4 py-4 border border-slate-600 font-semibold">Year</th>
//                 <th className="px-4 py-4 border border-slate-600 font-semibold">Month</th>
//                 <th className="px-4 py-4 border border-slate-600 font-semibold">Question</th>
//                 <th className="px-4 py-4 border border-slate-600 font-semibold">Mark</th>
//                 <th className="px-4 py-4 border border-slate-600 font-semibold">Max Marks</th>
//                 <th className="px-4 py-4 border border-slate-600 font-semibold">Percentage</th>
//                 <th className="px-4 py-4 border border-slate-600 font-semibold">Reason</th>
//                 <th className="px-4 py-4 border border-slate-600 font-semibold">Graded At</th>
//               </tr>
//             </thead>
//             <tbody>
//               {currentResults.map((answer, index) => {
//                 const percentage = ((answer.mark / answer.max_marks) * 100).toFixed(1);
//                 return (
//                   <tr 
//                     key={answer.id} 
//                     className={`text-center transition-colors duration-200 hover:bg-blue-50 ${
//                       index % 2 === 0 ? 'bg-gray-50' : 'bg-white'
//                     }`}
//                   >
//                     <td className="border border-gray-300 px-4 py-4 text-slate-800 font-medium">{answer.id}</td>
//                     <td className="border border-gray-300 px-4 py-4 text-slate-800 font-medium">
//                       {registrationFilter && answer.student_index.toLowerCase().includes(registrationFilter.toLowerCase()) ? (
//                         <span className="bg-yellow-200 px-1 rounded">
//                           {answer.student_index}
//                         </span>
//                       ) : (
//                         answer.student_index
//                       )}
//                     </td>
//                     <td className="border border-gray-300 px-4 py-4 text-slate-700 font-medium">{answer.module_code}</td>
//                     <td className="border border-gray-300 px-4 py-4 text-slate-700">{answer.exam_year}</td>
//                     <td className="border border-gray-300 px-4 py-4 text-slate-700">{answer.exam_month}</td>
//                     <td className="border border-gray-300 px-4 py-4 text-purple-600 font-semibold">{answer.full_question_id}</td>
//                     <td className="border border-gray-300 px-4 py-4 text-blue-600 font-bold">{answer.mark}</td>
//                     <td className="border border-gray-300 px-4 py-4 text-green-600 font-semibold">{answer.max_marks}</td>
//                     <td className={`border border-gray-300 px-4 py-4 font-bold ${getGradeColor(parseFloat(percentage))}`}>
//                       {percentage}%
//                     </td>
//                     <td className="border border-gray-300 px-4 py-4 text-slate-600 text-sm text-left max-w-xs">
//                       <div className="truncate" title={answer.reason}>
//                         {answer.reason}
//                       </div>
//                     </td>
//                     <td className="border border-gray-300 px-4 py-4 text-slate-600 text-sm">
//                       {new Date(answer.graded_at).toLocaleString()}
//                     </td>
//                   </tr>
//                 );
//               })}
//             </tbody>
//           </table>
//         )}
//       </div>

//       {/* Pagination Navigation */}
//       {totalPages > 1 && (
//         <div className="p-4 border-t border-gray-200 bg-gray-50">
//           <div className="flex items-center justify-center space-x-2">
//             {/* Previous button */}
//             <button
//               onClick={() => handlePageChange(currentPage - 1)}
//               disabled={currentPage === 1}
//               className="px-3 py-1 text-sm text-gray-900 bg-white border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed disabled:text-gray-400"
//             >
//               Previous
//             </button>

//             {/* Page numbers */}
//             {getPageNumbers().map((page) => (
//               <button
//                 key={page}
//                 onClick={() => handlePageChange(page)}
//                 className={`px-3 py-1 text-sm border rounded-md ${
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
//               className="px-3 py-1 text-sm text-gray-900 bg-white border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed disabled:text-gray-400"
//             >
//               Next
//             </button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default GradedAnswersTable;

import React, { useState, useMemo } from 'react';

interface GradedAnswer {
  id: number;
  student_index: string;
  module_code: string;
  exam_year: number;
  exam_month: string;
  full_question_id: string;
  mark: number;
  max_marks: number;
  reason: string;
  graded_at: string;
}

interface Props {
  gradedAnswers: GradedAnswer[];
}

const ExpandableReason: React.FC<{ reason: string; maxLength?: number }> = ({ reason, maxLength = 200 }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  if (reason.length <= maxLength) {
    return (
      <div className="whitespace-pre-wrap break-words leading-relaxed">
        {reason}
      </div>
    );
  }

  return (
    <div className="whitespace-pre-wrap break-words leading-relaxed">
      {isExpanded ? reason : `${reason.substring(0, maxLength)}...`}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="ml-2 text-blue-600 hover:text-blue-800 font-medium text-xs underline focus:outline-none"
      >
        {isExpanded ? 'Show Less' : 'Show More'}
      </button>
    </div>
  );
};

const GradedAnswersTable: React.FC<Props> = ({ gradedAnswers }) => {
  const [registrationFilter, setRegistrationFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const getGradeColor = (percent: number) => {
    if (percent >= 90) return 'text-green-600';
    if (percent >= 80) return 'text-blue-600';
    if (percent >= 70) return 'text-yellow-600';
    if (percent >= 60) return 'text-orange-600';
    return 'text-red-600';
  };

  // Filter the graded answers based on registration number
  const filteredAnswers = useMemo(() => {
    if (!registrationFilter.trim()) {
      return gradedAnswers;
    }
    
    return gradedAnswers.filter(answer => 
      answer.student_index.toLowerCase().includes(registrationFilter.toLowerCase().trim())
    );
  }, [gradedAnswers, registrationFilter]);

  // Get unique registration numbers for suggestions/autocomplete
  const uniqueRegistrations = useMemo(() => {
    return [...new Set(gradedAnswers.map(answer => answer.student_index))].sort();
  }, [gradedAnswers]);

  // Calculate pagination for filtered results
  const totalPages = Math.ceil(filteredAnswers.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const currentResults = filteredAnswers.slice(startIndex, endIndex);

  // Handle page changes
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Handle rows per page change
  const handleRowsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setRowsPerPage(Number(e.target.value));
    setCurrentPage(1); // Reset to first page when changing rows per page
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

  const clearFilter = () => {
    setRegistrationFilter('');
    setCurrentPage(1); // Reset to first page when clearing filter
  };

  return (
    <div className="bg-white rounded-lg shadow-md">
      <h3 className="text-xl font-bold p-4 bg-gradient-to-r from-slate-800 to-slate-700 text-white rounded-t-lg">
        Detailed Graded Answers
      </h3>
      
      {/* Filter Section */}
      <div className="p-4 bg-gray-50 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <label htmlFor="registration-filter" className="text-sm font-medium text-gray-700 whitespace-nowrap">
            Filter by Registration:
          </label>
          <div className="flex-1 flex gap-2 items-center">
            <div className="relative flex-1 max-w-md">
              <input
                id="registration-filter"
                type="text"
                value={registrationFilter}
                onChange={(e) => {
                  setRegistrationFilter(e.target.value);
                  setCurrentPage(1); // Reset to first page when filtering
                }}
                placeholder="Enter registration number (e.g., EG/2020/4001)"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm text-gray-900 bg-white"
                list="registration-suggestions"
              />
              <datalist id="registration-suggestions">
                {uniqueRegistrations.map(reg => (
                  <option key={reg} value={reg} />
                ))}
              </datalist>
              {registrationFilter && (
                <button
                  onClick={clearFilter}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 text-lg font-bold"
                  title="Clear filter"
                >
                  ×
                </button>
              )}
            </div>
            <div className="text-sm text-gray-600 whitespace-nowrap">
              Showing {filteredAnswers.length} of {gradedAnswers.length} records
            </div>
          </div>
        </div>
        
        {/* Active Filter Display */}
        {registrationFilter && (
          <div className="mt-2 flex items-center gap-2">
            <span className="text-sm text-gray-600">Active filter:</span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              Registration: {registrationFilter}
              <button
                onClick={clearFilter}
                className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full text-blue-400 hover:bg-blue-200 hover:text-blue-600"
                title="Remove filter"
              >
                ×
              </button>
            </span>
          </div>
        )}
      </div>

      {/* Pagination Controls */}
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
          <div className="text-sm text-gray-600">
            {filteredAnswers.length > 0 ? (
              <>Showing {startIndex + 1}-{Math.min(endIndex, filteredAnswers.length)} of {filteredAnswers.length} filtered results</>
            ) : (
              <>No results to display</>
            )}
          </div>
        </div>
      </div>

      {/* Table with wider layout for reason column */}
      <div className="overflow-auto overflow-x-auto" style={{ scrollbarWidth: 'thin', scrollbarColor: '#CBD5E1 #F1F5F9' }}>
        {filteredAnswers.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            {registrationFilter ? (
              <>
                <div className="text-lg font-medium mb-2">No results found</div>
                <div className="text-sm">
                  No records match the registration number "{registrationFilter}"
                </div>
                <button
                  onClick={clearFilter}
                  className="mt-3 text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Clear filter to see all records
                </button>
              </>
            ) : (
              <div className="text-lg font-medium">No graded answers available</div>
            )}
          </div>
        ) : (
          <table className="min-w-full bg-white border-collapse table-fixed">
            <thead className="sticky top-0 z-10 text-white bg-gradient-to-r from-slate-800 to-slate-700 text-sm uppercase tracking-wider">
              <tr>
                {/* <th className="w-16 px-4 py-4 border border-slate-600 font-semibold">ID</th> */}
                <th className="w-32 px-4 py-4 border border-slate-600 font-semibold">Student Index</th>
                <th className="w-20 px-4 py-4 border border-slate-600 font-semibold">Module</th>
                <th className="w-16 px-4 py-4 border border-slate-600 font-semibold">Year</th>
                <th className="w-20 px-4 py-4 border border-slate-600 font-semibold">Month</th>
                <th className="w-24 px-4 py-4 border border-slate-600 font-semibold">Question</th>
                <th className="w-16 px-4 py-4 border border-slate-600 font-semibold">Mark</th>
                <th className="w-20 px-4 py-4 border border-slate-600 font-semibold">Max Marks</th>
                <th className="w-20 px-4 py-4 border border-slate-600 font-semibold">Percentage</th>
                <th className="min-w-100 px-4 py-4 border border-slate-600 font-semibold">Reason</th>
                <th className="w-32 px-4 py-4 border border-slate-600 font-semibold">Graded At</th>
              </tr>
            </thead>
            <tbody>
              {currentResults.map((answer, index) => {
                const percentage = ((answer.mark / answer.max_marks) * 100).toFixed(1);
                return (
                  <tr 
                    key={answer.id} 
                    className={`transition-colors duration-200 hover:bg-blue-50 ${
                      index % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                    }`}
                  >
                    {/* <td className="border border-gray-300 px-4 py-4 text-slate-800 font-medium text-center">{answer.id}</td> */}
                    <td className="border border-gray-300 px-4 py-4 text-slate-800 font-medium text-center">
                      {registrationFilter && answer.student_index.toLowerCase().includes(registrationFilter.toLowerCase()) ? (
                        <span className="bg-yellow-200 px-1 rounded">
                          {answer.student_index}
                        </span>
                      ) : (
                        answer.student_index
                      )}
                    </td>
                    <td className="border border-gray-300 px-4 py-4 text-slate-700 font-medium text-center">{answer.module_code}</td>
                    <td className="border border-gray-300 px-4 py-4 text-slate-700 text-center">{answer.exam_year}</td>
                    <td className="border border-gray-300 px-4 py-4 text-slate-700 text-center">{answer.exam_month}</td>
                    <td className="border border-gray-300 px-4 py-4 text-purple-600 font-semibold text-center">{answer.full_question_id}</td>
                    <td className="border border-gray-300 px-4 py-4 text-blue-600 font-bold text-center">{answer.mark}</td>
                    <td className="border border-gray-300 px-4 py-4 text-green-600 font-semibold text-center">{answer.max_marks}</td>
                    <td className={`border border-gray-300 px-4 py-4 font-bold text-center ${getGradeColor(parseFloat(percentage))}`}>
                      {percentage}%
                    </td>
                    <td className="border border-gray-300 px-4 py-4 text-slate-600 text-sm text-left">
                      <ExpandableReason reason={answer.reason} maxLength={150} />
                    </td>
                    <td className="border border-gray-300 px-4 py-4 text-slate-600 text-sm text-center">
                      {new Date(answer.graded_at).toLocaleString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination Navigation */}
      {totalPages > 1 && (
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-center space-x-2">
            {/* Previous button */}
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1 text-sm text-gray-900 bg-white border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed disabled:text-gray-400"
            >
              Previous
            </button>

            {/* Page numbers */}
            {getPageNumbers().map((page) => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`px-3 py-1 text-sm border rounded-md ${
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
              className="px-3 py-1 text-sm text-gray-900 bg-white border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed disabled:text-gray-400"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GradedAnswersTable;