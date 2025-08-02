// components/EducatorModuleCard.tsx
import React from "react";
import Image from "next/image";
import { getRandomGradient, type GradientColor } from "../../../constants/gradientColors";

interface EducatorModuleCardProps {
  title: string;
  image?: string | null;
  enrolled: string;
  maxEnrollments?: number; // New prop for maximum enrollments allowed
}

const EducatorModuleCard: React.FC<EducatorModuleCardProps> = ({
  title,
  image,
  enrolled,
  maxEnrollments = 100, // Default max enrollments if not provided
}) => {
  const hasValidImage = image?.trim();
  const randomGradient: GradientColor = React.useMemo(() => getRandomGradient(), []);
  
  // Calculate enrollment metrics
  const enrolledCount = parseInt(enrolled.replace(/,/g, ''), 10) || 0;
  const enrollmentPercentage = Math.min((enrolledCount / maxEnrollments) * 100, 100);
  
  // Determine progress bar color based on percentage
  const getProgressBarColor = (percentage: number) => {
    if (percentage >= 90) return "bg-red-500";
    if (percentage >= 75) return "bg-orange-500";
    if (percentage >= 50) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getProgressBarBgColor = (percentage: number) => {
    if (percentage >= 90) return "bg-red-100";
    if (percentage >= 75) return "bg-orange-100";
    if (percentage >= 50) return "bg-yellow-100";
    return "bg-green-100";
  };

  return (
    <div className="group min-w-[280px] max-w-[320px] bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-2 hover:scale-105 transition-all duration-300 ease-out overflow-hidden transform cursor-pointer">
      {/* Image or Header-Style Gradient Background */}
      <div className="relative w-full h-36 overflow-hidden">
        {hasValidImage ? (
          <Image
            src={image}
            alt={title}
            fill
            className="object-cover object-center group-hover:scale-110 transition-transform duration-300"
          />
        ) : (
          <div className="relative w-full h-full overflow-hidden">
            {/* Main gradient background */}
            <div className={`absolute inset-0 bg-gradient-to-r ${randomGradient.gradient}`} />
            
            {/* Glass morphism overlay */}
            <div className={`absolute inset-0 ${randomGradient.overlayPattern} backdrop-blur-sm`} />
            
            {/* Animated background elements similar to header */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
              <div className="absolute -top-2 -left-2 w-16 h-16 bg-white/5 rounded-full animate-pulse" />
              <div 
                className="absolute top-4 right-8 w-12 h-12 bg-white/3 rounded-full animate-bounce" 
                style={{ animationDelay: '1s', animationDuration: '3s' }} 
              />
              <div 
                className="absolute bottom-2 left-1/4 w-14 h-14 bg-white/4 rounded-full animate-pulse" 
                style={{ animationDelay: '0.5s' }} 
              />
              <div className="absolute top-1/2 right-4 w-8 h-8 bg-white/6 rounded-full animate-pulse" 
                style={{ animationDelay: '2s' }} 
              />
            </div>
            
            {/* Bottom gradient accent line (similar to header) */}
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-white/30 via-white/50 to-white/30" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="text-base font-semibold text-gray-800 group-hover:text-blue-600 leading-tight mb-3 line-clamp-2 min-h-[2.5rem] transition-colors duration-300">
          {title}
        </h3>
        
        <div className="flex items-center justify-between text-sm mb-3">
          <span className="text-gray-500 font-medium">
            Total enrolled
          </span>
          <span className="text-blue-600 font-semibold bg-blue-50 px-2 py-1 rounded-md">
            {enrolled}
          </span>
        </div>

        {/* Enrollment Progress Bar */}
        <div className="mt-3">
          <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
            <span>Enrollment Progress</span>
            <span>{Math.round(enrollmentPercentage)}%</span>
          </div>
          
          <div className={`w-full h-2 rounded-full ${getProgressBarBgColor(enrollmentPercentage)}`}>
            <div
              className={`h-full rounded-full transition-all duration-300 ${getProgressBarColor(enrollmentPercentage)}`}
              style={{ width: `${enrollmentPercentage}%` }}
            />
          </div>
          
          <div className="flex items-center justify-between text-xs text-gray-400 mt-1">
            <span>0</span>
            <span>Max: {maxEnrollments.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EducatorModuleCard;