import React from 'react';

interface StudentEventCardProps {
  title: string;
  module: string;
  countdown: string;
  date: string;
}

const StudentEventCard: React.FC<StudentEventCardProps> = ({ title, module, countdown, date }) => {
  return (
    <div className="min-w-[250px] bg-gray-100 rounded-2xl p-4 text-center">
      <h3 className="text-lg font-bold text-blue-800">{title}</h3>
      <p className="text-sm text-blue-900 truncate">{module}</p>
      <p className="text-2xl font-semibold mt-2 text-black">{countdown}</p>
      <p className="text-xs text-gray-600 mt-1">Scheduled on:<br />{date}</p>
    </div>
  );
};

export default StudentEventCard;
