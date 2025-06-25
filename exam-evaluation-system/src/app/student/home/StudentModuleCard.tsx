import React from 'react';

interface StudentModuleCardProps {
  title: string;
  image: string;
  event: string;
}

const StudentModuleCard: React.FC<StudentModuleCardProps> = ({ title, image, event }) => {
  return (
    <div className="min-w-[260px] bg-gray-100 rounded-2xl p-4 text-center">
      <img
        src={image}
        alt={title}
        className="w-full h-28 object-cover rounded-xl mb-3"
      />
      <p className="text-base font-semibold text-blue-900 break-words leading-snug">
        {title}
      </p>
      <p className="text-sm text-blue-800 mt-1">{event}</p>
    </div>
  );
};

export default StudentModuleCard;
