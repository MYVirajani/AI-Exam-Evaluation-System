// components/EducatorModuleCard.tsx
import React from 'react';
import Image from 'next/image';

interface EducatorModuleCardProps {
  title: string;
  image: string;
  enrolled: string;
}

const EducatorModuleCard: React.FC<EducatorModuleCardProps> = ({
  title,
  image,
  enrolled
}) => {
  return (
    <div className="min-w-[250px] bg-gray-100 rounded-2xl p-3 text-center">
      <div className="relative w-full h-28 mb-2 rounded-xl overflow-hidden">
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover"
        />
      </div>
      <p className="text-sm font-semibold text-blue-900 leading-snug">{title}</p>
      <p className="text-xs text-blue-800 mt-1">Total enrolled - {enrolled}</p>
    </div>
  );
};

export default EducatorModuleCard;
