import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface EducatorEventCardProps {
  title: string;
  module: string;
  uploads: string; // Format: "submissions/enrollments"
  date: string;
  label: string; // "Due on:" or "Scheduled on:"
  moduleId: string;
  assessmentId: string;
  assessmentType?: string; // <-- added
  enrollments?: number; // Optional override for enrolled students
  onDelete?: (moduleId: string, assessmentId: string) => Promise<void>;
}

const EducatorEventCard: React.FC<EducatorEventCardProps> = ({
  title,
  module,
  uploads,
  date,
  label,
  moduleId,
  assessmentId,
  assessmentType, // <-- added
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const getEducatorId = (): string => {
    if (typeof window !== 'undefined') {
      try {
        const user = localStorage.getItem('user');
        if (!user) return '';
        const parsed = JSON.parse(user);
        return parsed?.user_id || '';
      } catch (err) {
        console.error('[EducatorEventCard] Failed to parse localStorage user:', err);
        return '';
      }
    }
    return '';
  };

  const educatorId = getEducatorId();

  // ✅ Updated navigation logic
  const navigationUrl =
    assessmentType === 'quiz'
      ? `/educator/module/${moduleId}/assessment/${assessmentId}/quiz?educatorId=${educatorId}`
      : `/educator/module/${moduleId}/assessment/${assessmentId}?educatorId=${educatorId}`;

  const parseUploadsData = () => {
    let submissions = 0;
    let total = 1;
    try {
      if (uploads.includes('/')) {
        const [subs, enr] = uploads.split('/').map(v => parseInt(v.trim(), 10));
        submissions = isNaN(subs) ? 0 : subs;
        total = isNaN(enr) ? 1 : enr;
      } else {
        submissions = parseInt(uploads.trim(), 10) || 0;
        total = Math.max(submissions, 1);
      }
    } catch {
      submissions = 0;
      total = 1;
    }
    return { submissions, enrollments: total };
  };

  const { submissions: submissionCount, enrollments: totalEnrollments } = parseUploadsData();
  const progressPercentage = totalEnrollments > 0 ? Math.min((submissionCount / totalEnrollments) * 100, 100) : 0;

  const parseDate = (dateString: string) => {
    const clean = dateString.replace(/^\w+\s+/, '');
    return new Date(clean);
  };

  const getDeadlineStatus = () => {
    try {
      const deadline = parseDate(date);
      const today = new Date();
      const daysDiff = Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 3600 * 24));

      if (daysDiff < 0) return 'overdue';
      if (daysDiff <= 1) return 'urgent';
      if (daysDiff <= 3) return 'soon';
      return 'normal';
    } catch {
      return 'normal';
    }
  };

  const deadlineStatus = getDeadlineStatus();

  return (
    <Link href={navigationUrl}>
      <div
        className={`
          relative min-w-[280px] max-w-[320px] bg-gradient-to-br from-blue-50 via-white to-indigo-50
          rounded-2xl p-6 text-center cursor-pointer shadow-lg border border-blue-100
          transform transition-all duration-300 ease-out hover:shadow-2xl
          ${isVisible ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-8 opacity-0 scale-95'}
          ${isHovered ? 'scale-105 -translate-y-2 shadow-2xl bg-gradient-to-br from-blue-25 via-white to-indigo-25 border-blue-200' : ''}
        `}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Header */}
        <div className="mb-4">
          <h3 className={`text-xl font-bold mb-2 leading-tight transition-colors ${isHovered ? 'text-blue-700' : 'text-blue-900'}`}>
            {title}
          </h3>
          <p className={`text-sm font-medium transition-colors ${isHovered ? 'text-blue-600' : 'text-blue-800'}`}>
            {module}
          </p>
        </div>

        {/* Submissions */}
        <div className="mb-4 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
          <p className={`text-2xl font-bold transition-colors ${isHovered ? 'text-blue-900' : 'text-blue-800'}`}>
            {uploads}
          </p>
          <p className={`text-sm font-medium transition-colors ${isHovered ? 'text-blue-700' : 'text-blue-600'}`}>
            Submissions
          </p>
        </div>

        {/* Date & Status */}
        <div className="mb-4">
          <p className={`text-xs font-semibold uppercase tracking-wide ${isHovered ? 'text-gray-700' : 'text-gray-600'}`}>
            {label}
          </p>
          <div className={`
            inline-flex items-center px-3 py-1.5 rounded-lg mt-2 font-medium text-sm border transition-all
            ${
              deadlineStatus === 'overdue'
                ? 'bg-red-100 text-red-800 border-red-200 hover:bg-red-150'
                : deadlineStatus === 'urgent'
                ? 'bg-orange-100 text-orange-800 border-orange-200 hover:bg-orange-150'
                : deadlineStatus === 'soon'
                ? 'bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-150'
                : 'bg-green-100 text-green-800 border-green-200 hover:bg-green-150'
            }
            ${isHovered ? 'shadow-md scale-105' : ''}
          `}>
            <div className={`w-2 h-2 rounded-full mr-2 ${
              deadlineStatus === 'overdue' ? 'bg-red-500 animate-pulse'
              : deadlineStatus === 'urgent' ? 'bg-orange-500 animate-pulse'
              : deadlineStatus === 'soon' ? 'bg-yellow-500'
              : 'bg-green-500'
            }`} />
            {date}
          </div>

          {deadlineStatus === 'overdue' && <p className="text-xs text-red-600 font-semibold mt-1 animate-pulse">Overdue!</p>}
          {deadlineStatus === 'urgent' && <p className="text-xs text-orange-600 font-semibold mt-1">Due Soon!</p>}
        </div>

        {/* Progress */}
        <div className="mt-4 pt-4 border-t border-blue-100/50">
          <div className="flex justify-between items-center mb-2">
            <span className={`text-xs font-medium ${isHovered ? 'text-blue-700' : 'text-blue-600'}`}>Progress</span>
            <span className={`text-xs font-bold ${isHovered ? 'text-blue-800' : 'text-blue-700'}`}>
              {submissionCount}/{totalEnrollments}
            </span>
          </div>
          <div className="w-full bg-blue-100 rounded-full h-2.5 overflow-hidden">
            <div
              className={`h-2.5 rounded-full transition-all duration-500 ease-out ${
                progressPercentage >= 80
                  ? 'bg-gradient-to-r from-green-400 to-green-600'
                  : progressPercentage >= 50
                  ? 'bg-gradient-to-r from-yellow-400 to-yellow-600'
                  : 'bg-gradient-to-r from-blue-400 to-blue-600'
              } ${isHovered ? 'shadow-lg' : ''}`}
              style={{
                width: `${progressPercentage}%`,
                transform: isVisible ? 'translateX(0)' : 'translateX(-100%)',
              }}
            />
          </div>
          <div className="text-right mt-1">
            <span className={`text-xs font-semibold ${
              progressPercentage >= 80
                ? isHovered ? 'text-green-700' : 'text-green-600'
                : progressPercentage >= 50
                ? isHovered ? 'text-yellow-700' : 'text-yellow-600'
                : isHovered ? 'text-blue-700' : 'text-blue-600'
            }`}>
              {progressPercentage.toFixed(0)}%
            </span>
          </div>
        </div>

        {/* Hover Dot */}
        <div className={`absolute top-3 right-3 w-2 h-2 bg-blue-500 rounded-full transition-all duration-300 ${
          isHovered ? 'scale-150 bg-blue-600' : 'scale-100'
        }`} />
      </div>
    </Link>
  );
};

export default EducatorEventCard;
