// // exam-evaluation-system\src\app\student\dashboard\StudentEventCard.tsx
// import React, { useEffect, useState } from "react";
// import { calculateCountdown, CountdownResult } from "@/utils/countdownUtils";
// import { formatDuration, formatOpenCloseTime } from "@/utils/date-time";

// interface StudentEventCardProps {
//   title: string;
//   module: string;
//   duration?: number; 
//   open_at?: string;
//   close_at?: string;
//   deadline?: string;
//   onClick?: () => void;
// }

// const statusConfig = {
//   not_started: {
//     bg: "bg-blue-50",
//     border: "border-blue-200",
//     text: "text-blue-700",
//     badge: "bg-blue-100 text-blue-800",
//     label: "Not Started"
//   },
//   in_progress: {
//     bg: "bg-emerald-50",
//     border: "border-emerald-200",
//     text: "text-emerald-700",
//     badge: "bg-emerald-100 text-emerald-800",
//     label: "In Progress"
//   },
//   closing_soon: {
//     bg: "bg-amber-50",
//     border: "border-amber-200",
//     text: "text-amber-700",
//     badge: "bg-amber-100 text-amber-800",
//     label: "Closing Soon"
//   },
//   expired: {
//     bg: "bg-red-50",
//     border: "border-red-200",
//     text: "text-red-700",
//     badge: "bg-red-100 text-red-800",
//     label: "Expired"
//   },
// };

// const StudentEventCard: React.FC<StudentEventCardProps> = ({
//   title,
//   module,
//   duration,
//   open_at,
//   close_at,
//   deadline,
//   onClick,
// }) => {
//   const [countdown, setCountdown] = useState<CountdownResult>(
//     calculateCountdown(open_at, close_at, deadline)
//   );

//   useEffect(() => {
//     const timer = setInterval(() => {
//       setCountdown(calculateCountdown(open_at, close_at, deadline));
//     }, 1000);

//     return () => clearInterval(timer);
//   }, [open_at, close_at, deadline]);

//   const config = statusConfig[countdown.status];
//   const timingInfo = formatOpenCloseTime(open_at, close_at, deadline);
//   const durationText = duration ? formatDuration(duration) : null;

//   return (
//     <div
//       onClick={onClick}
//       className={`
//         min-w-[300px] max-w-[340px] rounded-xl border-2 transition-all duration-200 
//         ${config.border} ${config.bg}
//         cursor-pointer hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]
//         shadow-sm
//       `}
//     >
//       {/* Header Section */}
//       <div className="p-5 pb-3">
//         <div className="flex items-start justify-between gap-3">
//           <div className="flex-1 min-w-0">
//             <h3 className="font-semibold text-gray-900 text-lg leading-tight mb-1 break-words">
//               {title}
//             </h3>
//             <p className="text-sm text-gray-600 font-medium truncate" title={module}>
//               {module}
//             </p>
//             {/* Duration Display */}
//             {durationText && (
//               <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
//                 <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
//                 </svg>
//                 Duration: {durationText}
//               </p>
//             )}
//           </div>
//           <span className={`
//             inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium
//             whitespace-nowrap flex-shrink-0 ${config.badge}
//           `}>
//             {config.label}
//           </span>
//         </div>
//       </div>

//       {/* Countdown Section */}
//       <div className={`mx-5 mb-3 p-4 rounded-lg border ${config.border}`}>
//         <div className="flex items-center justify-between">
//           <div>
//             <div className={`text-2xl font-bold font-mono ${config.text} mb-1`}>
//               {countdown.text}
//             </div>
//             <div className={`text-xs uppercase font-semibold tracking-wide ${config.text} opacity-80`}>
//               {countdown.label}
//             </div>
//           </div>
//           {countdown.status === "closing_soon" && (
//             <div className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-200 animate-pulse">
//               <div className="w-2 h-2 rounded-full bg-amber-700"></div>
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Assessment Timing Information */}
//       {timingInfo && (
//         <div className="mx-5 mb-4 p-3 bg-white/50 rounded-lg border border-gray-200">
//           <div className="flex items-start gap-2">
//             <svg className="w-4 h-4 mt-0.5 text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
//             </svg>
//             <p className="text-xs text-gray-600 leading-relaxed">
//               {timingInfo}
//             </p>
//           </div>
//         </div>
//       )}

//       {/* Footer hint for interaction */}
//       <div className="px-5 pb-3">
//         <div className="text-xs text-gray-500 text-center opacity-0 group-hover:opacity-100 transition-opacity">
//           Click to view details
//         </div>
//       </div>
//     </div>
//   );
// };

// export default StudentEventCard;

// exam-evaluation-system\src\app\student\dashboard\StudentEventCard.tsx
import React, { useEffect, useState } from "react";
import { calculateCountdown, CountdownResult } from "@/utils/countdownUtils";
import { formatDuration, formatOpenCloseTime } from "@/utils/date-time";

interface StudentEventCardProps {
  title: string;
  module: string;
  duration?: number; 
  open_at?: string;
  close_at?: string;
  deadline?: string;
  assessmentType?: string; // ✅ ADDED
  onClick?: () => void;
}

const statusConfig = {
  not_started: {
    bg: "bg-blue-50",
    border: "border-blue-200",
    text: "text-blue-700",
    badge: "bg-blue-100 text-blue-800",
    label: "Not Started"
  },
  in_progress: {
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    text: "text-emerald-700",
    badge: "bg-emerald-100 text-emerald-800",
    label: "In Progress"
  },
  closing_soon: {
    bg: "bg-amber-50",
    border: "border-amber-200",
    text: "text-amber-700",
    badge: "bg-amber-100 text-amber-800",
    label: "Closing Soon"
  },
  expired: {
    bg: "bg-red-50",
    border: "border-red-200",
    text: "text-red-700",
    badge: "bg-red-100 text-red-800",
    label: "Expired"
  },
};

const StudentEventCard: React.FC<StudentEventCardProps> = ({
  title,
  module,
  duration,
  open_at,
  close_at,
  deadline,
  assessmentType, // ✅ ADDED
  onClick,
}) => {
  const [countdown, setCountdown] = useState<CountdownResult>(
    calculateCountdown(open_at, close_at, deadline)
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(calculateCountdown(open_at, close_at, deadline));
    }, 1000);

    return () => clearInterval(timer);
  }, [open_at, close_at, deadline]);

  // ✅ ADDED: Function to get assessment type badge
  const getTypeBadge = () => {
    if (!assessmentType) return null;
    
    const typeConfig: Record<string, { label: string; color: string }> = {
      bubbleSheet: { label: "MCQ", color: "bg-purple-100 text-purple-800" },
      endExam: { label: "End Exam", color: "bg-red-100 text-red-800" },
      midExam: { label: "Mid Exam", color: "bg-orange-100 text-orange-800" },
      assignment: { label: "Assignment", color: "bg-blue-100 text-blue-800" },
      quiz: { label: "Quiz", color: "bg-green-100 text-green-800" },
    };

    const type = typeConfig[assessmentType] || { 
      label: assessmentType, 
      color: "bg-gray-100 text-gray-800" 
    };

    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${type.color} mt-1`}>
        {type.label}
      </span>
    );
  };

  const config = statusConfig[countdown.status];
  const timingInfo = formatOpenCloseTime(open_at, close_at, deadline);
  const durationText = duration ? formatDuration(duration) : null;

  return (
    <div
      onClick={onClick}
      className={`
        min-w-[300px] max-w-[340px] rounded-xl border-2 transition-all duration-200 
        ${config.border} ${config.bg}
        cursor-pointer hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]
        shadow-sm
      `}
    >
      {/* Header Section */}
      <div className="p-5 pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 text-lg leading-tight mb-1 break-words">
              {title}
            </h3>
            <p className="text-sm text-gray-600 font-medium truncate" title={module}>
              {module}
            </p>
            
            {/* ✅ ADDED: Assessment Type Badge */}
            {getTypeBadge()}
            
            {/* Duration Display */}
            {durationText && (
              <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Duration: {durationText}
              </p>
            )}
          </div>
          <span className={`
            inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium
            whitespace-nowrap flex-shrink-0 ${config.badge}
          `}>
            {config.label}
          </span>
        </div>
      </div>

      {/* Countdown Section */}
      <div className={`mx-5 mb-3 p-4 rounded-lg border ${config.border}`}>
        <div className="flex items-center justify-between">
          <div>
            <div className={`text-2xl font-bold font-mono ${config.text} mb-1`}>
              {countdown.text}
            </div>
            <div className={`text-xs uppercase font-semibold tracking-wide ${config.text} opacity-80`}>
              {countdown.label}
            </div>
          </div>
          {countdown.status === "closing_soon" && (
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-200 animate-pulse">
              <div className="w-2 h-2 rounded-full bg-amber-700"></div>
            </div>
          )}
        </div>
      </div>

      {/* Assessment Timing Information */}
      {timingInfo && (
        <div className="mx-5 mb-4 p-3 bg-white/50 rounded-lg border border-gray-200">
          <div className="flex items-start gap-2">
            <svg className="w-4 h-4 mt-0.5 text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-xs text-gray-600 leading-relaxed">
              {timingInfo}
            </p>
          </div>
        </div>
      )}

      {/* Footer hint for interaction */}
      <div className="px-5 pb-3">
        <div className="text-xs text-gray-500 text-center opacity-0 group-hover:opacity-100 transition-opacity">
          Click to view details
        </div>
      </div>
    </div>
  );
};

export default StudentEventCard;