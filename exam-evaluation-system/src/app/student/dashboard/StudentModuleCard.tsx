import React from 'react';
import Image from 'next/image';

export const FALLBACK_IMAGES = [
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

export const getRandomFallback = () =>
  FALLBACK_IMAGES[Math.floor(Math.random() * FALLBACK_IMAGES.length)];

interface StudentModuleCardProps {
  title: string;
  image?: string | null;
  event: string;
}

const StudentModuleCard: React.FC<StudentModuleCardProps> = ({ title, image, event }) => {
  const src = image?.trim() ? image : getRandomFallback();

  return (
    <div className="min-w-[260px] bg-gray-100 rounded-2xl p-4 text-center">
       <div className="relative w-full h-32 rounded-t-2xl overflow-hidden">
              <Image
                src={src}
                alt={title}
                fill
                className="object-cover object-center"
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
