// components/EducatorModuleCard.tsx
import React from "react";
import Image from "next/image";

interface EducatorModuleCardProps {
  title: string;
  image?: string | null;
  enrolled: string;
  maxEnrollments?: number; // New prop for maximum enrollments allowed
}

// List all your fallback images here (paths are relative to /public)
const FALLBACK_IMAGES = [
  "/background-images/image1.jpg",
  "/background-images/image2.jpg",
  "/background-images/image3.jpg",
  "/background-images/image4.jpg",
  "/background-images/image5.jpg",
  "/background-images/image6.jpg",
  "/background-images/image7.jpg",
  "/background-images/image8.jpg",
  "/background-images/image9.jpg",
  "/background-images/image10.jpg",
  "/background-images/image11.jpg",
  "/background-images/image12.jpg",
  "/background-images/image13.jpg",
];

// Color palette from the provided image
const FALLBACK_COLORS = [
  "from-blue-900 to-blue-800",     // Dark navy blue
  "from-blue-600 to-blue-500",     // Medium blue
  "from-cyan-500 to-cyan-400",     // Bright cyan
  "from-sky-400 to-sky-300",       // Light blue
  "from-blue-200 to-blue-100",     // Very light blue
];

const getRandomFallback = () =>
  FALLBACK_IMAGES[Math.floor(Math.random() * FALLBACK_IMAGES.length)];

const getRandomColor = () =>
  FALLBACK_COLORS[Math.floor(Math.random() * FALLBACK_COLORS.length)];

const EducatorModuleCard: React.FC<EducatorModuleCardProps> = ({
  title,
  image,
  enrolled,
  maxEnrollments = 100, // Default max enrollments if not provided
}) => {
  const hasValidImage = image?.trim();
  const fallbackSrc = getRandomFallback();
  const fallbackColor = getRandomColor();
  
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
      {/* Image or Color Background */}
      <div className="relative w-full h-36 overflow-hidden">
        {hasValidImage ? (
          <Image
            src={image}
            alt={title}
            fill
            className="object-cover object-center"
            onError={() => {
              // Fallback to random image if the provided image fails to load
              const img = document.querySelector(`img[alt="${title}"]`) as HTMLImageElement;
              if (img) {
                img.src = fallbackSrc;
              }
            }}
          />
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${fallbackColor} flex items-center justify-center`}>
            <div className="text-white text-2xl font-semibold opacity-20">
              {title.charAt(0).toUpperCase()}
            </div>
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