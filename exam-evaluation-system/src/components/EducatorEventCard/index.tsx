import React from 'react';
import Link from 'next/link';

interface EducatorEventCardProps {
  title: string;
  module: string;
  uploads: string;
  date: string;
  label: string; // "Due on:" or "Scheduled on:"
  moduleId: string;
  assessmentId: string;
}

const EducatorEventCard: React.FC<EducatorEventCardProps> = ({
  title,
  module,
  uploads,
  date,
  label,
  moduleId,
  assessmentId
}) => {
  // Get educatorId from localStorage (client-side only)
  const getEducatorId = () => {
    if (typeof window !== 'undefined') {
      console.log('[EducatorEventCard] Accessing localStorage...');
      const user = localStorage.getItem('user');
      
      if (!user) {
        console.warn('[EducatorEventCard] No user found in localStorage');
        return '';
      }

      try {
        const parsedUser = JSON.parse(user);
        console.log('[EducatorEventCard] Retrieved user:', parsedUser);
        return parsedUser.user_id || '';
      } catch (error) {
        console.error('[EducatorEventCard] Error parsing user data:', error);
        return '';
      }
    }
    console.log('[EducatorEventCard] Window not available (SSR)');
    return '';
  };

  const educatorId = getEducatorId();
  const navigationUrl = `/educator/module/${moduleId}/assessment/${assessmentId}?educatorId=${educatorId}`;

  console.log('[EducatorEventCard] Navigation details:', {
    moduleId,
    assessmentId,
    educatorId,
    finalUrl: navigationUrl
  });

  return (
    <Link 
      href={navigationUrl}
      passHref
      onClick={(e) => {
        console.log('[EducatorEventCard] Link clicked', {
          moduleId,
          assessmentId,
          educatorId
        });
      }}
    >
      <div 
        className="group min-w-[280px] bg-white/95 backdrop-blur-lg rounded-2xl p-6 text-center hover:shadow-xl hover:shadow-purple-500/20 transition-all duration-300 cursor-pointer hover:-translate-y-1 relative overflow-hidden border border-purple-100/50"
        onClick={() => {
          console.log('[EducatorEventCard] Card content clicked');
        }}
      >
        {/* Gradient border effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500 via-blue-500 to-cyan-500 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
        <div className="absolute inset-[1px] bg-white/95 backdrop-blur-lg rounded-2xl -z-10"></div>
        
        {/* Content */}
        <div className="relative z-10">
          {/* Title */}
          <h3 className="text-lg font-bold text-gray-800 mb-3 group-hover:text-purple-700 transition-colors duration-300">
            {title}
          </h3>
          
          {/* Module badge */}
          <div className="inline-block bg-gradient-to-r from-purple-500 to-blue-500 rounded-full px-4 py-1.5 mb-4 shadow-sm">
            <p className="text-sm font-medium text-white">{module}</p>
          </div>
          
          {/* Uploads section */}
          <div className="flex items-center justify-center space-x-3 mb-4 p-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-100/50">
            {/* Upload icon */}
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center shadow-sm">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <div className="text-left">
              <p className="text-xl font-bold text-gray-800">{uploads}</p>
              <p className="text-sm text-gray-600">Uploads</p>
            </div>
          </div>
          
          {/* Date section */}
          <div className="bg-gradient-to-r from-gray-50 to-purple-50 rounded-xl p-3 border border-purple-100/50">
            <p className="text-xs font-semibold text-purple-600 uppercase tracking-wide mb-1">
              {label}
            </p>
            <p className="text-sm font-bold text-gray-700">
              {date}
            </p>
          </div>
        </div>
        
        {/* Subtle accent dots */}
        <div className="absolute top-3 right-3 w-2 h-2 bg-gradient-to-br from-purple-400 to-blue-400 rounded-full opacity-60"></div>
        <div className="absolute bottom-3 left-3 w-1.5 h-1.5 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-full opacity-60"></div>
      </div>
    </Link>
  );
};

export default EducatorEventCard;