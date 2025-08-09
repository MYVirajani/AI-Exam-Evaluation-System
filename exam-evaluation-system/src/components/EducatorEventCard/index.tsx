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
  assessmentType: string;
  enrollments?: number; // Optional override for enrolled students
  onDelete?: (moduleId: string, assessmentId: string) => Promise<void>;
  onExtendDeadline?: (moduleId: string, assessmentId: string) => void;
}

const EducatorEventCard: React.FC<EducatorEventCardProps> = ({
  title,
  module,
  uploads,
  date,
  label,
  moduleId,
  assessmentId,
  assessmentType,
  onDelete,
  onExtendDeadline,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [showActions, setShowActions] = useState(false);

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

  const getDeadlineInfo = () => {
    try {
      const deadline = parseDate(date);
      const today = new Date();
      const daysDiff = Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 3600 * 24));

      if (daysDiff < 0) return { status: 'past', text: 'Deadline Passed', color: 'blue' };
      if (daysDiff <= 1) return { status: 'today', text: 'Due Today', color: 'amber' };
      if (daysDiff <= 3) return { status: 'soon', text: 'Due Soon', color: 'orange' };
      return { status: 'upcoming', text: 'Upcoming', color: 'green' };
    } catch {
      return { status: 'upcoming', text: 'Upcoming', color: 'green' };
    }
  };

  const deadlineInfo = getDeadlineInfo();

  const handleExtendDeadline = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onExtendDeadline) {
      onExtendDeadline(moduleId, assessmentId);
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onDelete && window.confirm(`Are you sure you want to delete "${title}"?`)) {
      await onDelete(moduleId, assessmentId);
    }
  };

  return (
    <div className="relative">
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
          {/* Action Menu Button */}
          <div 
            className="absolute top-3 right-3 p-1 rounded-full hover:bg-blue-100 transition-colors"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowActions(!showActions);
            }}
          >
            <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"/>
            </svg>
          </div>

          {/* Header */}
          <div className="mb-4">
            <h3 className={`text-xl font-bold mb-2 leading-tight transition-colors ${isHovered ? 'text-blue-700' : 'text-blue-900'}`}>
              {title}
            </h3>
            <p className={`text-sm font-medium transition-colors ${isHovered ? 'text-blue-600' : 'text-blue-800'}`}>
              {module}
            </p>
          </div>

          {/* Submissions Overview */}
          <div className="mb-4 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
            <p className={`text-2xl font-bold transition-colors ${isHovered ? 'text-blue-900' : 'text-blue-800'}`}>
              {uploads}
            </p>
            <p className={`text-sm font-medium transition-colors ${isHovered ? 'text-blue-700' : 'text-blue-600'}`}>
              Student Responses
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
                deadlineInfo.color === 'blue'
                  ? 'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-150'
                  : deadlineInfo.color === 'amber'
                  ? 'bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-150'
                  : deadlineInfo.color === 'orange'
                  ? 'bg-orange-100 text-orange-800 border-orange-200 hover:bg-orange-150'
                  : 'bg-green-100 text-green-800 border-green-200 hover:bg-green-150'
              }
              ${isHovered ? 'shadow-md scale-105' : ''}
            `}>
              <div className={`w-2 h-2 rounded-full mr-2 ${
                deadlineInfo.color === 'blue' ? 'bg-blue-500'
                : deadlineInfo.color === 'amber' ? 'bg-amber-500'
                : deadlineInfo.color === 'orange' ? 'bg-orange-500'
                : 'bg-green-500'
              }`} />
              {date}
            </div>
            <p className={`text-xs font-medium mt-1 ${
              deadlineInfo.color === 'blue' ? 'text-blue-600'
              : deadlineInfo.color === 'amber' ? 'text-amber-600'
              : deadlineInfo.color === 'orange' ? 'text-orange-600'
              : 'text-green-600'
            }`}>
              {deadlineInfo.text}
            </p>
          </div>

          {/* Progress */}
          <div className="mt-4 pt-4 border-t border-blue-100/50">
            <div className="flex justify-between items-center mb-2">
              <span className={`text-xs font-medium ${isHovered ? 'text-blue-700' : 'text-blue-600'}`}>
                Response Rate
              </span>
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
        </div>
      </Link>

      {/* Action Menu */}
      {showActions && (
        <div className="absolute top-12 right-3 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-10 min-w-[160px]">
          <button
            onClick={handleExtendDeadline}
            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Extend Deadline
          </button>
          <button
            onClick={() => {
              navigator.clipboard.writeText(navigationUrl);
              setShowActions(false);
            }}
            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            Copy Link
          </button>
          <hr className="my-1" />
          <button
            onClick={handleDelete}
            className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Delete Assessment
          </button>
        </div>
      )}

      {/* Backdrop to close actions menu */}
      {showActions && (
        <div 
          className="fixed inset-0 z-5" 
          onClick={() => setShowActions(false)}
        />
      )}
    </div>
  );
};

export default EducatorEventCard;