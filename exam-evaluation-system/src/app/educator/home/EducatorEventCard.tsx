import React from 'react';

interface EducatorEventCardProps {
  title: string;
  module: string;
  uploads: string;
  date: string;
  label: string; // "Due on:" or "Scheduled on:"
}

const EducatorEventCard: React.FC<EducatorEventCardProps> = ({
  title,
  module,
  uploads,
  date,
  label
}) => {
  return (
    <div className="min-w-[250px] bg-gray-100 rounded-2xl p-4 text-center">
      <h3 className="text-lg font-bold text-blue-900">{title}</h3>
      <p className="text-sm text-blue-800">{module}</p>
      <p className="text-base font-medium mt-2 text-black">{uploads} Uploads</p>
      <p className="text-xs text-gray-600 mt-2">
        {label}<br />{date}
      </p>
    </div>
  );
};

export default EducatorEventCard;
