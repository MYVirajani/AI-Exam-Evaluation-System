import React from 'react';
import { Result } from '../types';

interface Props {
  results: Result[];
}

const ResultsTable: React.FC<Props> = ({ results }) => {
  const getGradeColor = (percent: number) => {
    if (percent >= 90) return 'text-green-600';
    if (percent >= 80) return 'text-blue-600';
    if (percent >= 70) return 'text-yellow-600';
    if (percent >= 60) return 'text-orange-600';
    return 'text-red-600';
  };

  return (
    <div className="bg-white rounded-lg shadow-md">
      <h3 className="text-xl font-bold p-4 bg-gradient-to-r from-slate-800 to-slate-700 text-white rounded-t-lg">
        Student Results Summary
      </h3>
      <div className="overflow-auto max-h-96">
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
            {results.map((res, index) => {
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
    </div>
  );
};

export default ResultsTable;
