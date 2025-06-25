import React from 'react';
import Image from 'next/image';

interface StudentModuleCardProps {
  title: string;
  image: string;
  event: string;
}

const StudentModuleCard: React.FC<StudentModuleCardProps> = ({ title, image, event }) => {
  return (
    <div className="min-w-[260px] bg-gray-100 rounded-2xl p-4 text-center">
      <div className="relative w-full h-28 mb-3 rounded-xl overflow-hidden">
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover"
        />
      </div>
      <p className="text-base font-semibold text-blue-900 break-words leading-snug">
        {title}
      </p>
      <p className="text-sm text-blue-800 mt-1">{event}</p>
    </div>
  );
};

export default StudentModuleCard;
