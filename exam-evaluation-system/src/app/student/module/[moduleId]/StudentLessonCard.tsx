"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  FiFile, 
  FiFileText, 
  FiDownload, 
  FiEye, 
  FiChevronDown, 
  FiChevronUp,
  FiBookOpen,
  FiClock,
  FiUser
} from "react-icons/fi";

interface Material {
  material_id?: string;
  file_name?: string;
  file_url: string | null;
  description?: string | null;
}

interface StudentLessonCardProps {
  lesson_id: string;
  title: string;
  materials?: Material[];
  instructor?: string;
  duration?: string;
  lessonNumber?: number;
  isCompleted?: boolean;
  onMarkComplete?: (lessonId: string) => void;
}

const StudentLessonCard: React.FC<StudentLessonCardProps> = ({
  lesson_id,
  title,
  materials = [],
  instructor,
  duration,
  lessonNumber,
  isCompleted = false,
  onMarkComplete,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf':
        return <FiFileText className="text-red-500" size={20} />;
      case 'doc':
      case 'docx':
        return <FiFileText className="text-blue-500" size={20} />;
      case 'ppt':
      case 'pptx':
        return <FiFileText className="text-orange-500" size={20} />;
      case 'mp4':
      case 'avi':
      case 'mov':
        return <FiFile className="text-purple-500" size={20} />;
      case 'mp3':
      case 'wav':
        return <FiFile className="text-green-500" size={20} />;
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return <FiFile className="text-pink-500" size={20} />;
      default:
        return <FiFile className="text-gray-500" size={20} />;
    }
  };

  const getFileSize = (url: string) => {
    // This would typically come from the API, but for demo purposes
    return "2.4 MB";
  };

  const handleDownload = (url: string, fileName: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 mb-4 overflow-hidden">
      {/* Header Section */}
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center mb-2">
              {lessonNumber && (
                <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-1 rounded-full mr-3">
                  Lesson {lessonNumber}
                </span>
              )}
              {isCompleted && (
                <span className="bg-green-100 text-green-800 text-xs font-semibold px-2 py-1 rounded-full mr-3">
                  ✓ Completed
                </span>
              )}
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2 leading-tight">
              {title}
            </h3>
            
            {/* Lesson Meta Info */}
            <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
              {instructor && (
                <div className="flex items-center">
                  <FiUser size={14} className="mr-1" />
                  {instructor}
                </div>
              )}
              {duration && (
                <div className="flex items-center">
                  <FiClock size={14} className="mr-1" />
                  {duration}
                </div>
              )}
              <div className="flex items-center">
                <FiBookOpen size={14} className="mr-1" />
                {materials.length} material{materials.length !== 1 ? 's' : ''}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-2 ml-4">
            {!isCompleted && onMarkComplete && (
              <button
                onClick={() => onMarkComplete(lesson_id)}
                className="px-4 py-2 text-sm font-medium text-green-600 bg-green-50 rounded-lg hover:bg-green-100 transition-colors duration-200"
              >
                Mark Complete
              </button>
            )}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors duration-200"
              title={isExpanded ? "Collapse Materials" : "View Materials"}
            >
              {isExpanded ? <FiChevronUp size={18} /> : <FiChevronDown size={18} />}
            </button>
          </div>
        </div>

        {/* Quick Materials Preview */}
        {!isExpanded && materials.length > 0 && (
          <div className="border-t border-gray-100 pt-4">
            <div className="flex items-center justify-between">
              <div className="flex -space-x-2 overflow-hidden">
                {materials.slice(0, 3).map((mat, index) => (
                  <div
                    key={mat.material_id || index}
                    className="inline-flex items-center justify-center w-8 h-8 bg-gray-100 border-2 border-white rounded-full"
                  >
                    {getFileIcon(mat.file_name || 'file')}
                  </div>
                ))}
                {materials.length > 3 && (
                  <div className="inline-flex items-center justify-center w-8 h-8 bg-gray-200 border-2 border-white rounded-full text-xs font-medium text-gray-600">
                    +{materials.length - 3}
                  </div>
                )}
              </div>
              <button
                onClick={() => setIsExpanded(true)}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                View All Materials
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Expanded Materials Section */}
      {isExpanded && (
        <div className="border-t border-gray-100 bg-gray-50">
          <div className="p-6">
            {materials.length > 0 ? (
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-gray-700 mb-4">
                  Course Materials
                </h4>
                {materials.map((mat, index) => {
                  const fileUrl = mat.file_url || "#";
                  const fileName = mat.file_name?.trim() || "Lecture note";
                  const key = mat.material_id || `${fileUrl}-${index}`;

                  return (
                    <div key={key} className="bg-white rounded-lg p-4 border border-gray-200 hover:border-gray-300 transition-colors duration-200">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                            {getFileIcon(fileName)}
                          </div>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h5 className="font-medium text-gray-900 truncate">
                            {fileName}
                          </h5>
                          {mat.description && (
                            <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                              {mat.description}
                            </p>
                          )}
                          <p className="text-xs text-gray-400 mt-1">
                            {getFileSize(fileUrl)}
                          </p>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex space-x-2 flex-shrink-0">
                          {fileUrl !== "#" && (
                            <>
                              <Link
                                href={fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors duration-200"
                              >
                                <FiEye size={14} className="mr-1" />
                                View
                              </Link>
                              <button
                                onClick={() => handleDownload(fileUrl, fileName)}
                                className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                              >
                                <FiDownload size={14} className="mr-1" />
                                Download
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FiFile className="text-gray-400" size={32} />
                </div>
                <p className="text-gray-500 text-sm mb-2">
                  No materials available for this lesson
                </p>
                <p className="text-gray-400 text-xs">
                  Materials will appear here when uploaded by your instructor
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentLessonCard;