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
        className="min-w-[250px] bg-gray-200 rounded-2xl p-4 text-center hover:bg-gray-300 transition-colors cursor-pointer"
        onClick={() => {
          console.log('[EducatorEventCard] Card content clicked');
        }}
      >
        <h3 className="text-lg font-bold text-blue-900">{title}</h3>
        <p className="text-sm text-blue-800">{module}</p>
        <p className="text-base font-medium mt-2 text-black">{uploads} Submissions</p>
        <p className="text-xs text-gray-600 mt-2">
          {label}<br />{date}
        </p>
      </div>
    </Link>
  );
};

export default EducatorEventCard;