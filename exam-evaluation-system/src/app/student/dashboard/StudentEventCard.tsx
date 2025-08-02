// StudentEventCard.tsx
import React from "react";

interface StudentEventCardProps {
  title: string;
  module: string;
  countdown: string;
  date: string;
  onClick?: () => void;
}

const StudentEventCard: React.FC<StudentEventCardProps> = ({
  title,
  module,
  countdown,
  date,
  onClick,
}) => {
  const isExpired = countdown === "Expired";
  
  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter") onClick?.();
      }}
      className="group min-w-[280px] bg-white border border-gray-200 rounded-xl p-5 cursor-pointer transition-all duration-300 ease-out hover:shadow-lg hover:border-blue-300 hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 active:scale-[0.98]"
    >
      {/* Card Header */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-700 transition-colors duration-200 line-clamp-2 leading-tight">
          {title}
        </h3>
        <p className="text-sm text-gray-600 group-hover:text-blue-600 transition-colors duration-200 mt-1 truncate">
          {module}
        </p>
      </div>

      {/* Countdown Section */}
      <div className="mb-4 p-3 bg-gray-50 group-hover:bg-blue-50 transition-colors duration-200 rounded-lg">
        <div className={`text-xl font-bold transition-colors duration-200 ${
          isExpired 
            ? 'text-red-600 group-hover:text-red-700' 
            : 'text-green-600 group-hover:text-green-700'
        }`}>
          {countdown}
        </div>
        <div className="text-xs text-gray-500 group-hover:text-gray-600 transition-colors duration-200 mt-1">
          {isExpired ? '' : 'Time Left'}
        </div>
      </div>

      {/* Date Section */}
      <div className="border-t border-gray-100 group-hover:border-blue-200 transition-colors duration-200 pt-3">
        <div className="text-xs text-gray-500 group-hover:text-blue-600 transition-colors duration-200 font-medium mb-1">
          Scheduled on:
        </div>
        <div className="text-sm text-gray-700 group-hover:text-gray-900 transition-colors duration-200">
          {date}
        </div>
      </div>

      {/* Hover Indicator */}
      <div className="mt-3 flex justify-end opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <svg 
          className="w-4 h-4 text-blue-500 transform group-hover:translate-x-1 transition-transform duration-200" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </div>
  );
};

export default StudentEventCard;