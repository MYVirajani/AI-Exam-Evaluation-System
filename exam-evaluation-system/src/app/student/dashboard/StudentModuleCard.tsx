import React from 'react';
import Image from 'next/image';
import { getRandomGradient, type GradientColor } from '../../../constants/gradientColors';

interface Assessment {
  title: string;
  // due_date: string;
}

interface StudentModuleCardProps {
  title: string;
  image?: string | null;
  assessments: Assessment[];
  onClick?: () => void;
}

const StudentModuleCard: React.FC<StudentModuleCardProps> = ({ title, image, assessments, onClick }) => {
  const hasValidImage = image?.trim();
  const randomGradient: GradientColor = React.useMemo(() => getRandomGradient(), []);
  const hasAssessments = assessments && assessments.length > 0;

  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter") onClick?.();
      }}
      className="group min-w-[280px] h-[420px] bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-xl hover:border-blue-300 hover:-translate-y-2 transition-all duration-300 ease-out cursor-pointer overflow-hidden focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 active:scale-[0.98] flex flex-col"
    >
      {/* Image or Gradient - Fixed Height */}
      <div className="relative w-full h-36 overflow-hidden flex-shrink-0">
        {hasValidImage ? (
          <Image 
            src={image} 
            alt={title} 
            fill 
            className="object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out" 
          />
        ) : (
          <div className="relative w-full h-full overflow-hidden">
            <div className={`absolute inset-0 bg-gradient-to-br ${randomGradient.gradient} group-hover:scale-105 transition-transform duration-500`} />
            <div className={`absolute inset-0 ${randomGradient.overlayPattern} backdrop-blur-sm opacity-80 group-hover:opacity-60 transition-opacity duration-300`} />
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
              <div className="absolute -top-2 -left-2 w-12 h-12 bg-white/10 rounded-full animate-pulse group-hover:bg-white/20 transition-colors duration-300" />
              <div 
                className="absolute top-4 right-8 w-8 h-8 bg-white/8 rounded-full animate-bounce group-hover:bg-white/15 transition-colors duration-300" 
                style={{ animationDelay: '1s', animationDuration: '3s' }} 
              />
              <div 
                className="absolute bottom-2 left-1/4 w-10 h-10 bg-white/6 rounded-full animate-pulse group-hover:bg-white/12 transition-colors duration-300" 
                style={{ animationDelay: '0.5s' }} 
              />
              <div className="absolute top-1/2 right-4 w-6 h-6 bg-white/12 rounded-full animate-pulse group-hover:bg-white/25 transition-colors duration-300" 
                style={{ animationDelay: '2s' }} 
              />
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-white/20 via-white/40 to-white/20 group-hover:from-white/30 group-hover:via-white/60 group-hover:to-white/30 transition-all duration-300" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent group-hover:from-black/30 transition-all duration-300" />
      </div>

      {/* Body - Flexible Content Area */}
      <div className="p-5 flex-1 flex flex-col">
        {/* Module Title - Fixed Height */}
        <div className="mb-3 h-12 flex items-start">
          <h3 className="text-base font-semibold text-gray-900 group-hover:text-blue-700 leading-tight line-clamp-2 transition-colors duration-200">
            {title}
          </h3>
        </div>

        {/* Assessments Section - Flexible Height */}
        <div className="space-y-2 flex-1 flex flex-col">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500 group-hover:text-blue-600 transition-colors duration-200 uppercase tracking-wide">
              {hasAssessments ? 'Assessments' : 'No Assessments'}
            </span>
            {hasAssessments && (
              <div className="w-2 h-2 bg-green-500 rounded-full group-hover:bg-green-600 transition-colors duration-200 animate-pulse" />
            )}
          </div>

          <div className="flex-1 min-h-[120px] max-h-[140px] overflow-hidden">
            {hasAssessments ? (
              <div className="h-full overflow-y-auto pr-1 space-y-2">
                {assessments.slice(0, 3).map((assessment, index) => (
                  <div
                    key={index}
                    className="p-3 rounded-lg bg-blue-50 group-hover:bg-blue-100 border border-blue-100 group-hover:border-blue-200 transition-all duration-200"
                  >
                    <p className="text-sm text-blue-800 group-hover:text-blue-900 font-medium line-clamp-1">
                      {assessment.title}
                    </p>
                    {/* <p className="text-xs text-blue-600 group-hover:text-blue-800 mt-1">
                      {assessment.due_date}
                    </p> */}
                  </div>
                ))}
                {assessments.length > 3 && (
                  <div className="text-center py-2">
                    <span className="text-xs text-gray-500 group-hover:text-blue-600 transition-colors duration-200 font-medium">
                      +{assessments.length - 3} more assessment{assessments.length - 3 > 1 ? 's' : ''}
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div className="h-full flex items-center">
                <div className="w-full p-4 rounded-lg bg-gray-50 group-hover:bg-gray-100 border border-gray-100 group-hover:border-gray-200 transition-all duration-200 text-center">
                  <div className="w-8 h-8 mx-auto mb-2 text-gray-400">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <p className="text-sm text-gray-600 group-hover:text-gray-700 transition-colors duration-200">
                    No upcoming assessments
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action CTA - Fixed Position at Bottom */}
        <div className="mt-4 pt-3 border-t border-gray-100 group-hover:border-blue-200 transition-colors duration-200">
          <div className="flex justify-end opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <div className="flex items-center space-x-1 text-blue-500">
              <span className="text-xs font-medium">View Module</span>
              <svg 
                className="w-3 h-3 transform group-hover:translate-x-1 transition-transform duration-200" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentModuleCard;