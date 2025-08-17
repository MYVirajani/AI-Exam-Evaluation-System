// import React from 'react';
// import { FiX, FiCalendar, FiBook, FiFileText } from 'react-icons/fi';
// import { useRouter } from 'next/navigation';

// interface Event {
//   id: string;
//   title: string;
//   module: string;
//   moduleId: string;
//   assessmentType: 'assignment' | 'quiz' | 'endExam' | 'midExam';
//   date: string;
// }

// interface ResultsSelectionModalProps {
//   isOpen: boolean;
//   onClose: () => void;
//   events: Event[];
//   onEventSelect: (eventId: string, eventTitle: string, moduleTitle: string) => void;
// }

// const ResultsSelectionModal: React.FC<ResultsSelectionModalProps> = ({
//   isOpen,
//   onClose,
//   events,
//   onEventSelect
// }) => {
//   const router = useRouter();

//   if (!isOpen) return null;

//   const handleEventSelect = (eventId: string, eventTitle: string, moduleTitle: string) => {
//     onEventSelect(eventId, eventTitle, moduleTitle);
//     // Navigate to results dashboard with assessment ID as query parameter
//     router.push(`/educator/dashboard/results-dashboard?assessmentId=${eventId}&title=${encodeURIComponent(eventTitle)}&module=${encodeURIComponent(moduleTitle)}`);
//     onClose();
//   };

//   const getAssessmentTypeIcon = (type: string) => {
//     switch (type) {
//       case 'assignment':
//         return <FiFileText className="w-5 h-5 text-blue-600" />;
//       case 'quiz':
//         return <FiBook className="w-5 h-5 text-green-600" />;
//       case 'endExam':
//         return <FiCalendar className="w-5 h-5 text-red-600" />;
//       case 'midExam':
//         return <FiCalendar className="w-5 h-5 text-orange-600" />;
//       default:
//         return <FiFileText className="w-5 h-5 text-gray-600" />;
//     }
//   };

//   const getAssessmentTypeColor = (type: string) => {
//     switch (type) {
//       case 'assignment':
//         return 'bg-blue-50 border-blue-200 text-blue-800';
//       case 'quiz':
//         return 'bg-green-50 border-green-200 text-green-800';
//       case 'endExam':
//         return 'bg-red-50 border-red-200 text-red-800';
//       case 'midExam':
//         return 'bg-orange-50 border-orange-200 text-orange-800';
//       default:
//         return 'bg-gray-50 border-gray-200 text-gray-800';
//     }
//   };

//   const formatAssessmentType = (type: string) => {
//     switch (type) {
//       case 'endExam':
//         return 'Final Exam';
//       case 'midExam':
//         return 'Mid Exam';
//       case 'assignment':
//         return 'Assignment';
//       case 'quiz':
//         return 'Quiz';
//       default:
//         return type;
//     }
//   };

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//       <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[80vh] overflow-hidden">
//         {/* Header */}
//         <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
//           <div className="flex items-center justify-between">
//             <div>
//               <h2 className="text-2xl font-bold text-gray-900">Select Assessment Results</h2>
//               <p className="text-gray-600 mt-1">Choose an assessment to view detailed results</p>
//             </div>
//             <button
//               onClick={onClose}
//               className="p-2 hover:bg-gray-100 rounded-full transition-colors"
//             >
//               <FiX className="w-6 h-6 text-gray-600" />
//             </button>
//           </div>
//         </div>

//         {/* Content */}
//         <div className="p-6 overflow-y-auto max-h-[calc(80vh-120px)]">
//           {events.length === 0 ? (
//             <div className="text-center py-12">
//               <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
//                 <FiFileText className="w-8 h-8 text-gray-400" />
//               </div>
//               <h3 className="text-lg font-semibold text-gray-900 mb-2">No Assessments Available</h3>
//               <p className="text-gray-600">
//                 Create some assessments to view their results here.
//               </p>
//             </div>
//           ) : (
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               {events.map((event) => (
//                 <div
//                   key={event.id}
//                   onClick={() => handleEventSelect(event.id, event.title, event.module)}
//                   className="group bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all cursor-pointer hover:border-blue-300 hover:bg-blue-50/30"
//                 >
//                   <div className="flex items-start justify-between mb-4">
//                     <div className="flex items-center space-x-3">
//                       {getAssessmentTypeIcon(event.assessmentType)}
//                       <div>
//                         <h3 className="font-semibold text-gray-900 group-hover:text-blue-700 transition-colors line-clamp-2">
//                           {event.title}
//                         </h3>
//                         <p className="text-sm text-gray-600 mt-1">
//                           {event.module}
//                         </p>
//                       </div>
//                     </div>
//                   </div>

//                   <div className="flex items-center justify-between">
//                     <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getAssessmentTypeColor(event.assessmentType)}`}>
//                       {formatAssessmentType(event.assessmentType)}
//                     </span>
//                     <span className="text-xs text-gray-500">
//                       {new Date(event.date).toLocaleDateString()}
//                     </span>
//                   </div>

//                   <div className="mt-4 flex items-center justify-end">
//                     <span className="text-sm text-blue-600 group-hover:text-blue-700 font-medium">
//                       View Results →
//                     </span>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>

//         {/* Footer */}
//         <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
//           <div className="flex items-center justify-between">
//             <p className="text-sm text-gray-600">
//               {events.length} assessment{events.length !== 1 ? 's' : ''} available
//             </p>
//             <button
//               onClick={onClose}
//               className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
//             >
//               Cancel
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ResultsSelectionModal;

import React from 'react';
import { FiX, FiCalendar, FiBook, FiFileText } from 'react-icons/fi';
import { useRouter } from 'next/navigation';

interface Event {
  id: string;
  title: string;
  module: string;
  moduleId: string;
  assessmentType: 'assignment' | 'quiz' | 'endExam' | 'midExam';
  date: string;
}

interface ResultsSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  events: Event[];
  onEventSelect: (eventId: string, eventTitle: string, moduleTitle: string) => void;
}

const ResultsSelectionModal: React.FC<ResultsSelectionModalProps> = ({
  isOpen,
  onClose,
  events,
  onEventSelect
}) => {
  const router = useRouter();

  if (!isOpen) return null;

  const handleEventSelect = (eventId: string, eventTitle: string, moduleTitle: string) => {
    onEventSelect(eventId, eventTitle, moduleTitle);
    // Navigate to results dashboard with assessment ID as query parameter
    router.push(`/educator/dashboard/results-dashboard?assessmentId=${eventId}&title=${encodeURIComponent(eventTitle)}&module=${encodeURIComponent(moduleTitle)}`);
    onClose();
  };

  const getAssessmentTypeIcon = (type: string) => {
    switch (type) {
      case 'assignment':
        return <FiFileText className="w-5 h-5 text-blue-600" />;
      case 'quiz':
        return <FiBook className="w-5 h-5 text-green-600" />;
      case 'endExam':
        return <FiCalendar className="w-5 h-5 text-red-600" />;
      case 'midExam':
        return <FiCalendar className="w-5 h-5 text-orange-600" />;
      default:
        return <FiFileText className="w-5 h-5 text-gray-600" />;
    }
  };

  const getAssessmentTypeColor = (type: string) => {
    switch (type) {
      case 'assignment':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      case 'quiz':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'endExam':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'midExam':
        return 'bg-orange-50 border-orange-200 text-orange-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const formatAssessmentType = (type: string) => {
    switch (type) {
      case 'endExam':
        return 'Final Exam';
      case 'midExam':
        return 'Mid Exam';
      case 'assignment':
        return 'Assignment';
      case 'quiz':
        return 'Quiz';
      default:
        return type;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Select Assessment Results</h2>
              <p className="text-gray-600 mt-1">Choose an assessment to view detailed results</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <FiX className="w-6 h-6 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(80vh-120px)]">
          {events.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiFileText className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Assessments Available</h3>
              <p className="text-gray-600">
                Create some assessments to view their results here.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {events.map((event) => (
                <div
                  key={event.id}
                  onClick={() => handleEventSelect(event.id, event.title, event.module)}
                  className="group bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all cursor-pointer hover:border-blue-300 hover:bg-blue-50/30"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      {getAssessmentTypeIcon(event.assessmentType)}
                      <div>
                        <h3 className="font-semibold text-gray-900 group-hover:text-blue-700 transition-colors line-clamp-2">
                          {event.title}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {event.module}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getAssessmentTypeColor(event.assessmentType)}`}>
                      {formatAssessmentType(event.assessmentType)}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(event.date).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="mt-4 flex items-center justify-end">
                    <span className="text-sm text-blue-600 group-hover:text-blue-700 font-medium">
                      View Results →
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              {events.length} assessment{events.length !== 1 ? 's' : ''} available
            </p>
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultsSelectionModal;