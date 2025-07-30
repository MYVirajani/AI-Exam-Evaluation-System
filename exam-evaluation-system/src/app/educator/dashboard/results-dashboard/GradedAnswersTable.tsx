import React from 'react';
import { GradedAnswer } from '../types';

interface Props {
  gradedAnswers: GradedAnswer[];
}

const GradedAnswersTable: React.FC<Props> = ({ gradedAnswers }) => {
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
        Detailed Graded Answers
      </h3>
      <div className="overflow-auto max-h-96">
        <table className="min-w-full bg-white border-collapse">
          <thead className="sticky top-0 z-10 text-white bg-gradient-to-r from-slate-800 to-slate-700 text-sm uppercase tracking-wider">
            <tr>
              <th className="px-4 py-4 border border-slate-600">ID</th>
              <th className="px-4 py-4 border border-slate-600">Student Index</th>
              <th className="px-4 py-4 border border-slate-600">Module</th>
              <th className="px-4 py-4 border border-slate-600">Year</th>
              <th className="px-4 py-4 border border-slate-600">Month</th>
              <th className="px-4 py-4 border border-slate-600">Question</th>
              <th className="px-4 py-4 border border-slate-600">Mark</th>
              <th className="px-4 py-4 border border-slate-600">Max Marks</th>
              <th className="px-4 py-4 border border-slate-600">Percentage</th>
              <th className="px-4 py-4 border border-slate-600">Reason</th>
              <th className="px-4 py-4 border border-slate-600">Graded At</th>
            </tr>
          </thead>
          <tbody>
            {gradedAnswers.map((answer, index) => {
              const percentage = ((answer.mark / answer.max_marks) * 100).toFixed(1);
              return (
                <tr key={answer.id} className={`text-center ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}>
                  <td className="border px-4 py-4 text-slate-800">{answer.id}</td>
                  <td className="border px-4 py-4 text-slate-800">{answer.student_index}</td>
                  <td className="border px-4 py-4 text-slate-700">{answer.module_code}</td>
                  <td className="border px-4 py-4 text-slate-700">{answer.exam_year}</td>
                  <td className="border px-4 py-4 text-slate-700">{answer.exam_month}</td>
                  <td className="border px-4 py-4 text-purple-600">{answer.full_question_id}</td>
                  <td className="border px-4 py-4 text-blue-600 font-bold">{answer.mark}</td>
                  <td className="border px-4 py-4 text-green-600 font-semibold">{answer.max_marks}</td>
                  <td className={`border px-4 py-4 font-bold ${getGradeColor(parseFloat(percentage))}`}>
                    {percentage}%
                  </td>
                  <td className="border px-4 py-4 text-left max-w-xs truncate" title={answer.reason}>
                    {answer.reason}
                  </td>
                  <td className="border px-4 py-4 text-slate-600 text-sm">{new Date(answer.graded_at).toLocaleString()}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default GradedAnswersTable;
