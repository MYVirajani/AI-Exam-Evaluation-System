import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { Result } from '../types';

interface ResultsChartProps {
  results: Result[];
}

const ResultsChart: React.FC<ResultsChartProps> = ({ results }) => {
  return (
    <div className="bg-gray-50 rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-6 text-center text-slate-800">Performance Overview</h2>
      <div className="w-full h-[450px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={results} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <XAxis dataKey="student_index" tick={{ fill: '#374151', fontSize: 12 }} axisLine={{ stroke: '#6B7280' }} />
            <YAxis tick={{ fill: '#374151', fontSize: 12 }} axisLine={{ stroke: '#6B7280' }} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1F2937',
                border: 'none',
                borderRadius: '8px',
                color: 'white',
                boxShadow: '0 10px 25px rgba(0,0,0,0.3)'
              }}
            />
            <Legend wrapperStyle={{ color: '#374151', fontWeight: '600' }} />
            <Bar dataKey="total_marks" fill="url(#marksGradient)" name="Marks Obtained" radius={[4, 4, 0, 0]} />
            <defs>
              <linearGradient id="marksGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3B82F6" />
                <stop offset="100%" stopColor="#1E40AF" />
              </linearGradient>
            </defs>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ResultsChart;
