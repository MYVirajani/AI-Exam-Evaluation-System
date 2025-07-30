'use client'
import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const StudentResultsDashboard = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('/data/student_paper_results_gemini-new2.json')
      .then((res) => {
        if (!res.ok) {
          throw new Error('Failed to fetch results');
        }
        return res.json();
      })
      .then((data) => {
        // If it's a single object, wrap in array
        const resultArray = Array.isArray(data) ? data : [data];
        setResults(resultArray);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <p className="text-center mt-10 text-gray-700">Loading...</p>;
  if (error) return <p className="text-center mt-10 text-red-600">Error: {error}</p>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h1 className="text-4xl font-bold mb-8 text-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Student Results Dashboard
          </h1>
           {/* Enhanced Chart */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-6 text-center text-slate-800">Performance Overview</h2>
            <div className="w-full h-[450px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={results} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <XAxis 
                    dataKey="student_index" 
                    tick={{ fill: '#374151', fontSize: 12 }}
                    axisLine={{ stroke: '#6B7280' }}
                  />
                  <YAxis 
                    tick={{ fill: '#374151', fontSize: 12 }}
                    axisLine={{ stroke: '#6B7280' }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1F2937', 
                      border: 'none', 
                      borderRadius: '8px',
                      color: 'white',
                      boxShadow: '0 10px 25px rgba(0,0,0,0.3)'
                    }}
                  />
                  <Legend 
                    wrapperStyle={{ color: '#374151', fontWeight: '600' }}
                  />
                  <Bar 
                    dataKey="total_marks" 
                    fill="url(#marksGradient)" 
                    name="Marks Obtained" 
                    radius={[4, 4, 0, 0]}
                  />
                  <defs>
                    <linearGradient id="marksGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3B82F6" />
                      <stop offset="100%" stopColor="#1E40AF" />
                    </linearGradient>
                    <linearGradient id="totalGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10B981" />
                      <stop offset="100%" stopColor="#059669" />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Enhanced Table */}
         <div className="bg-white rounded-lg shadow-md">
            <h3 className="text-xl font-bold p-4 bg-gradient-to-r from-slate-800 to-slate-700 text-white rounded-t-lg">
              Detailed Results
            </h3>
            <div className="overflow-auto max-h-96" style={{ scrollbarWidth: 'thin', scrollbarColor: '#CBD5E1 #F1F5F9' }}>
              <table className="min-w-full bg-white border-collapse">
                <thead className="sticky top-0 z-10">
                  <tr className="bg-gradient-to-r from-slate-800 to-slate-700">
                    <th className="px-6 py-4 border border-slate-600 text-white font-semibold text-sm uppercase tracking-wider">Index</th>
                    <th className="px-6 py-4 border border-slate-600 text-white font-semibold text-sm uppercase tracking-wider">Module</th>
                    <th className="px-6 py-4 border border-slate-600 text-white font-semibold text-sm uppercase tracking-wider">Year</th>
                    <th className="px-6 py-4 border border-slate-600 text-white font-semibold text-sm uppercase tracking-wider">Month</th>
                    <th className="px-6 py-4 border border-slate-600 text-white font-semibold text-sm uppercase tracking-wider">Marks</th>
                    <th className="px-6 py-4 border border-slate-600 text-white font-semibold text-sm uppercase tracking-wider">Total</th>
                    <th className="px-6 py-4 border border-slate-600 text-white font-semibold text-sm uppercase tracking-wider">Percentage</th>
                    <th className="px-6 py-4 border border-slate-600 text-white font-semibold text-sm uppercase tracking-wider">Graded At</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((res, index) => {
                    const percentage = ((res.total_marks / res.total_possible) * 100).toFixed(1);
                    const getGradeColor = (percent) => {
                      if (percent >= 90) return 'text-green-600';
                      if (percent >= 80) return 'text-blue-600';
                      if (percent >= 70) return 'text-yellow-600';
                      if (percent >= 60) return 'text-orange-600';
                      return 'text-red-600';
                    };

                    return (
                      <tr 
                        key={res.id} 
                        className={`text-center transition-colors duration-200 hover:bg-blue-50 ${
                          index % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                        }`}
                      >
                        <td className="border border-gray-300 px-6 py-4 text-slate-800 font-medium">{res.student_index}</td>
                        <td className="border border-gray-300 px-6 py-4 text-slate-700 font-medium">{res.module_code}</td>
                        <td className="border border-gray-300 px-6 py-4 text-slate-700">{res.exam_year}</td>
                        <td className="border border-gray-300 px-6 py-4 text-slate-700">{res.exam_month}</td>
                        <td className="border border-gray-300 px-6 py-4 text-blue-600 font-bold text-lg">{res.total_marks}</td>
                        <td className="border border-gray-300 px-6 py-4 text-green-600 font-semibold">{res.total_possible}</td>
                        <td className={`border border-gray-300 px-6 py-4 font-bold text-lg ${getGradeColor(parseFloat(percentage))}`}>
                          {percentage}%
                        </td>
                        <td className="border border-gray-300 px-6 py-4 text-slate-600 text-sm">{new Date(res.graded_at).toLocaleString()}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

         
        </div>
      </div>
    </div>
  );
};

export default StudentResultsDashboard;