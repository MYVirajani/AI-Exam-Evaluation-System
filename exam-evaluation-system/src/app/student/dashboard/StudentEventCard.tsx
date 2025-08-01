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
  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter") onClick?.();
      }}
      className="min-w-[250px] bg-gray-100 rounded-2xl p-4 text-center cursor-pointer hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-600"
    >
      <h3 className="text-lg font-bold text-blue-800">{title}</h3>
      <p className="text-sm text-blue-900 truncate">{module}</p>
      <p className="text-base font-semibold mt-2 text-black">{countdown}</p>
      <p className="text-xs text-gray-600 mt-1">
        Scheduled on:
        <br />
        {date}
      </p>
    </div>
  );
};

export default StudentEventCard;
