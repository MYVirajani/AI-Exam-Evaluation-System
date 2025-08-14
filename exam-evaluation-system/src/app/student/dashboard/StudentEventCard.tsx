// StudentEventCard.tsx
import React from "react";

type AssessmentStatus = 
  | 'not_started' 
  | 'in_progress' 
  | 'closed' 
  | 'expired' 
  | 'closing_soon';

interface StudentEventCardProps {
  title: string;
  module: string;
  countdown: string;
  status: AssessmentStatus;
  date: string;
  onClick?: () => void;
}

const StudentEventCard: React.FC<StudentEventCardProps> = ({
  title,
  module,
  countdown,
  status,
  date,
  onClick,
}) => {
  // Define status styles
  const statusStyles = {
    not_started: {
      bg: 'bg-gray-100 group-hover:bg-gray-200',
      text: 'text-gray-800',
      label: 'Not Started',
    },
    in_progress: {
      bg: 'bg-blue-100 group-hover:bg-blue-200',
      text: 'text-blue-800',
      label: 'In Progress',
    },
    closing_soon: {
      bg: 'bg-orange-100 group-hover:bg-orange-200',
      text: 'text-orange-800',
      label: 'Closing Soon',
    },
    closed: {
      bg: 'bg-gray-200 group-hover:bg-gray-300',
      text: 'text-gray-700',
      label: 'Closed',
    },
    expired: {
      bg: 'bg-red-100 group-hover:bg-red-200',
      text: 'text-red-800',
      label: 'Expired',
    },
  };

  // Determine if the card should be less prominent
  const isInactive = status === 'closed' || status === 'expired';
  
  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter") onClick?.();
      }}
      className={`group min-w-[280px] bg-white border rounded-xl p-5 cursor-pointer transition-all duration-300 ease-out hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 active:scale-[0.98] ${
        isInactive 
          ? 'border-gray-200 hover:border-gray-300 opacity-90' 
          : 'border-blue-100 hover:border-blue-300'
      }`}
    >
      {/* Card Header */}
      <div className="mb-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className={`text-lg font-semibold line-clamp-2 leading-tight ${
              isInactive 
                ? 'text-gray-700 group-hover:text-gray-800' 
                : 'text-gray-900 group-hover:text-blue-700'
            } transition-colors duration-200`}>
              {title}
            </h3>
            <p className={`text-sm mt-1 truncate ${
              isInactive 
                ? 'text-gray-500 group-hover:text-gray-600' 
                : 'text-gray-600 group-hover:text-blue-600'
            } transition-colors duration-200`}>
              {module}
            </p>
          </div>
          <span className={`text-xs px-2 py-1 rounded-full ${
            statusStyles[status].bg
          } ${statusStyles[status].text}`}>
            {statusStyles[status].label}
          </span>
        </div>
      </div>

      {/* Countdown Section */}
      <div className={`mb-4 p-3 rounded-lg transition-colors duration-200 ${
        statusStyles[status].bg
      }`}>
        <div className={`text-xl font-bold transition-colors duration-200 ${
          status === 'closing_soon' ? 'text-orange-700' :
          status === 'in_progress' ? 'text-blue-700' :
          status === 'not_started' ? 'text-gray-700' :
          status === 'expired' ? 'text-red-700' :
          'text-gray-700'
        }`}>
          {countdown}
        </div>
        <div className="text-xs mt-1 opacity-80">
          {status === 'not_started' ? 'Opens in' :
           status === 'in_progress' || status === 'closing_soon' ? 'Closes in' :
           ''}
        </div>
      </div>

      {/* Date Section */}
      <div className={`border-t pt-3 transition-colors duration-200 ${
        isInactive 
          ? 'border-gray-100 group-hover:border-gray-200' 
          : 'border-blue-100 group-hover:border-blue-200'
      }`}>
        <div className={`text-xs font-medium mb-1 ${
          isInactive 
            ? 'text-gray-500 group-hover:text-gray-600' 
            : 'text-blue-600 group-hover:text-blue-700'
        } transition-colors duration-200`}>
          {status === 'not_started' ? 'Starts on:' : 'Due on:'}
        </div>
        <div className={`text-sm ${
          isInactive 
            ? 'text-gray-600 group-hover:text-gray-700' 
            : 'text-gray-700 group-hover:text-gray-900'
        } transition-colors duration-200`}>
          {date}
        </div>
      </div>

      {/* Hover Indicator - Only show for active assessments */}
      {!isInactive && (
        <div className="mt-3 flex justify-end opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <svg 
            className={`w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-200 ${
              status === 'closing_soon' ? 'text-orange-500' : 'text-blue-500'
            }`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      )}
    </div>
  );
};

export default StudentEventCard;