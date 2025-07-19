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
  const src = image?.trim() ? image : getRandomFallback()

  return (
    <div className="min-w-[250px] bg-gray-100 rounded-2xl shadow p-0 text-center">
      {/* Image */}
      <div className="relative w-full h-32 rounded-t-2xl overflow-hidden">
        <Image
          src={src}
          alt={title}
          fill
          className="object-cover object-center"
        />
      </div>

      {/* Body */}
      <div className="p-4">
        <p className="text-sm font-semibold text-blue-900 leading-snug 
                      whitespace-normal break-words">
          {title}
        </p>
        <p className="text-xs text-blue-800 mt-1">
          Total enrolled – {enrolled}
        </p>
      </div>
    </div>
  )
}

export default EducatorModuleCard