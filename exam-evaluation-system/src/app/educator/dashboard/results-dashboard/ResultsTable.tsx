import React, { useState } from 'react';
import { Result } from './types';

interface Props {
  results: Result[];
}

const ResultsTable: React.FC<Props> = ({ results }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const getGradeColor = (percent: number) => {
    if (percent >= 90) return 'text-green-600';
    if (percent >= 80) return 'text-blue-600';
    if (percent >= 70) return 'text-yellow-600';
    if (percent >= 60) return 'text-orange-600';
    return 'text-red-600';
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
      <h3 className="text-xl font-bold p-4 bg-gradient-to-r from-slate-800 to-slate-700 text-white rounded-t-lg">
        Student Results Summary
      </h3>
      
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
          <div className="text-sm text-gray-600">
            Showing {startIndex + 1}-{Math.min(endIndex, results.length)} of {results.length} results
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
            </tr>
          </thead>
          <tbody>
            {currentResults.map((res, index) => {
              const percentage = ((res.total_marks / res.total_possible) * 100).toFixed(1);
              return (
                <tr key={res.id} className={`text-center ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}>
                  <td className="border px-6 py-4 text-slate-800">{res.student_index}</td>
                  <td className="border px-6 py-4 text-slate-700">{res.module_code}</td>
                  <td className="border px-6 py-4 text-slate-700">{res.exam_year}</td>
                  <td className="border px-6 py-4 text-slate-700">{res.exam_month}</td>
                  <td className="border px-6 py-4 text-blue-600 font-bold">{res.total_marks}</td>
                  <td className="border px-6 py-4 text-green-600 font-semibold">{res.total_possible}</td>
                  <td className={`border px-6 py-4 font-bold ${getGradeColor(parseFloat(percentage))}`}>
                    {percentage}%
                  </td>
                  <td className="border px-6 py-4 text-slate-600 text-sm">{new Date(res.graded_at).toLocaleString()}</td>
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

export default ResultsTable;