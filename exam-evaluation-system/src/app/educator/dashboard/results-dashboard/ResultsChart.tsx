import React, { useMemo } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Result } from './types';

interface ResultsChartProps {
  results: Result[];
}

interface DistributionData {
  range: string;
  frequency: number;
  percentage: number;
  rangeStart: number;
}

const ResultsChart: React.FC<ResultsChartProps> = ({ results }) => {
  const distributionData = useMemo(() => {
    if (!results || results.length === 0) return [];

    // Get all marks and find max for percentage calculation
    const marks = results.map(result => result.total_marks).filter(mark => mark !== null && mark !== undefined);
    if (marks.length === 0) return [];

    const maxMark = Math.max(...marks);
    const totalStudents = marks.length;
    
    // Create mark ranges (bins) - adjust bin size based on max marks
    const binSize = maxMark <= 20 ? 2 : maxMark <= 50 ? 5 : 10;
    const numBins = Math.ceil(maxMark / binSize);
    
    // Initialize bins
    const bins: { [key: string]: number } = {};
    const binRanges: string[] = [];
    
    for (let i = 0; i < numBins; i++) {
      const start = i * binSize;
      const end = Math.min((i + 1) * binSize - 1, maxMark);
      const range = start === end ? `${start}` : `${start}-${end}`;
      bins[range] = 0;
      binRanges.push(range);
    }
    
    // Count marks in each bin
    marks.forEach(mark => {
      const binIndex = Math.min(Math.floor(mark / binSize), numBins - 1);
      const start = binIndex * binSize;
      const end = Math.min((binIndex + 1) * binSize - 1, maxMark);
      const range = start === end ? `${start}` : `${start}-${end}`;
      bins[range]++;
    });
    
    // Convert to chart data
    return binRanges.map((range, index) => ({
      range,
      frequency: bins[range],
      percentage: Math.round((bins[range] / totalStudents) * 100),
      rangeStart: index * binSize
    })).filter(item => item.frequency > 0);
  }, [results]);

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-4 min-w-[200px]">
          <div className="text-sm font-semibold text-gray-800 mb-2">
            Marks Range: {label}
          </div>
          <div className="text-sm text-gray-600 space-y-1">
            <div className="flex justify-between">
              <span>Students:</span>
              <span className="font-medium text-blue-600">{data.frequency}</span>
            </div>
            <div className="flex justify-between">
              <span>Percentage:</span>
              <span className="font-medium text-blue-600">{data.percentage}%</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  if (!results || results.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8">
        <div className="text-center text-gray-500">
          <div className="text-lg font-medium mb-2">No Data Available</div>
          <div className="text-sm">No results to display in the distribution chart.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Marks Distribution</h2>
        <p className="text-sm text-gray-600">
          Distribution showing frequency of marks across different score ranges ({results.length} students)
        </p>
      </div>
      
      <div className="w-full h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart 
            data={distributionData} 
            margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
            barCategoryGap="10%"
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis 
              dataKey="range" 
              tick={{ fill: '#475569', fontSize: 12 }}
              axisLine={{ stroke: '#e2e8f0' }}
              tickLine={{ stroke: '#e2e8f0' }}
              angle={-45}
              textAnchor="end"
              height={80}
              interval={0}
            />
            <YAxis 
              tick={{ fill: '#475569', fontSize: 12 }}
              axisLine={{ stroke: '#e2e8f0' }}
              tickLine={{ stroke: '#e2e8f0' }}
              label={{ 
                value: 'Number of Students', 
                angle: -90, 
                position: 'insideLeft',
                style: { textAnchor: 'middle', fill: '#475569', fontSize: '12px' }
              }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar 
              dataKey="frequency" 
              fill="#3b82f6"
              radius={[4, 4, 0, 0]}
              stroke="#2563eb"
              strokeWidth={1}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      {/* Statistics Summary */}
      <div className="mt-6 pt-4 border-t border-gray-100">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-lg font-bold text-gray-900">
              {results.length}
            </div>
            <div className="text-xs text-gray-600 uppercase tracking-wide">
              Total Students
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-lg font-bold text-gray-900">
              {Math.max(...results.map(r => r.total_marks).filter(m => m !== null))}
            </div>
            <div className="text-xs text-gray-600 uppercase tracking-wide">
              Highest Score
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-lg font-bold text-gray-900">
              {Math.min(...results.map(r => r.total_marks).filter(m => m !== null))}
            </div>
            <div className="text-xs text-gray-600 uppercase tracking-wide">
              Lowest Score
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-lg font-bold text-gray-900">
              {Math.round(results.reduce((sum, r) => sum + r.total_marks, 0) / results.length)}
            </div>
            <div className="text-xs text-gray-600 uppercase tracking-wide">
              Average Score
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultsChart;