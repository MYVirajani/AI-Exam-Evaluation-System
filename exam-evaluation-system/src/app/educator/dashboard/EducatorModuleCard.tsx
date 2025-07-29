// components/EducatorModuleCard.tsx
import React from "react";
import Image from "next/image";

interface EducatorModuleCardProps {
  title: string;
  image?: string | null;
  enrolled: string;
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

const getRandomFallback = () =>
  FALLBACK_IMAGES[Math.floor(Math.random() * FALLBACK_IMAGES.length)];

const EducatorModuleCard: React.FC<EducatorModuleCardProps> = ({
  title,
  image,
  enrolled,
}) => {
  const src = image?.trim() ? image : getRandomFallback();

  return (
    <div className="group min-w-[280px] bg-gradient-to-br from-white via-purple-50 to-cyan-50 rounded-3xl shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 ease-out border border-purple-100/50 backdrop-blur-sm overflow-hidden">
      {/* Image with gradient overlay */}
      <div className="relative w-full h-40 rounded-t-3xl overflow-hidden">
        <Image
          src={src}
          alt={title}
          fill
          className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-purple-900/30 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-300"></div>
        
        {/* Floating enrollment badge */}
        <div className="absolute top-3 right-3 bg-gradient-to-r from-purple-600 to-cyan-500 text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-lg backdrop-blur-sm bg-opacity-90">
          {enrolled} enrolled
        </div>
      </div>

      {/* Body with enhanced styling */}
      <div className="p-6 relative">
        {/* Decorative gradient line */}
        <div className="w-12 h-1 bg-gradient-to-r from-purple-500 to-cyan-400 rounded-full mb-4 group-hover:w-16 transition-all duration-300"></div>
        
        <h3 className="text-lg font-bold bg-gradient-to-r from-purple-800 via-blue-700 to-cyan-600 bg-clip-text text-transparent leading-tight mb-3 group-hover:from-purple-600 group-hover:to-cyan-500 transition-all duration-300">
          {title}
        </h3>
        
        {/* Enhanced enrollment info */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-gradient-to-r from-purple-500 to-cyan-400 rounded-full animate-pulse"></div>
            <p className="text-sm font-medium text-purple-700 group-hover:text-purple-600 transition-colors duration-300">
              Total Students
            </p>
          </div>
          <div className="bg-gradient-to-r from-purple-100 to-cyan-100 px-3 py-1.5 rounded-full">
            <span className="text-sm font-bold text-purple-800">{enrolled}</span>
          </div>
        </div>

        {/* Subtle bottom gradient accent */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 opacity-30 group-hover:opacity-60 transition-opacity duration-300"></div>
      </div>

      {/* Hover effect overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-400/5 via-transparent to-cyan-400/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-3xl"></div>
    </div>
  );
};

export default EducatorModuleCard;