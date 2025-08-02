import React from 'react';
import Image from 'next/image';
import { getRandomGradient, type GradientColor } from '../../../constants/gradientColors';

interface StudentModuleCardProps {
  title: string;
  image?: string | null;
  event: string;
  onClick?: () => void;
}

const StudentModuleCard: React.FC<StudentModuleCardProps> = ({ title, image, event, onClick }) => {
  const hasValidImage = image?.trim();
  const randomGradient: GradientColor = React.useMemo(() => getRandomGradient(), []);

  return (
    <div
      onClick={onClick}
      className="group min-w-[250px] bg-white rounded-2xl shadow border border-gray-100 hover:shadow-lg hover:-translate-y-1 hover:scale-105 transition-all duration-300 ease-out transform cursor-pointer overflow-hidden"
    >
      {/* Image or Header-Style Gradient Background */}
      <div className="relative w-full h-32 overflow-hidden">
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
            
            {/* Animated background elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
              <div className="absolute -top-2 -left-2 w-12 h-12 bg-white/5 rounded-full animate-pulse" />
              <div 
                className="absolute top-3 right-6 w-8 h-8 bg-white/3 rounded-full animate-bounce" 
                style={{ animationDelay: '1s', animationDuration: '3s' }} 
              />
              <div 
                className="absolute bottom-1 left-1/4 w-10 h-10 bg-white/4 rounded-full animate-pulse" 
                style={{ animationDelay: '0.5s' }} 
              />
              <div className="absolute top-1/2 right-3 w-6 h-6 bg-white/6 rounded-full animate-pulse" 
                style={{ animationDelay: '2s' }} 
              />
            </div>
            
            {/* Bottom gradient accent line */}
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-white/30 via-white/50 to-white/30" />
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-4">
        <p className="text-sm font-semibold text-gray-800 group-hover:text-blue-600 leading-snug whitespace-normal break-words transition-colors duration-300">
          {title}
        </p>
        <p className="text-xs text-gray-600 mt-1">{event}</p>
      </div>
    </div>
  );
};

export default StudentModuleCard;