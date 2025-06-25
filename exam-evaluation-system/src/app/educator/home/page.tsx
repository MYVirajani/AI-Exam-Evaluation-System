// 'use client'
// import Card from "@/components/Card";
// import Divider from "@/components/Divider";
// import StatsCard from "@/components/StatsCard";
// import Button from "@/components/Button";
// import {
//   assignments,
//   quizzes,
//   exams,
//   modules,
// } from "@/constants/data";

// export default function Home() {
//   return (
//     <main className="min-h-screen p-8 bg-gray-50">

//         <section className="mt-8">
//            <div className="flex items-center justify-between mb-4">
//             <h2 className="text-xl font-semibold text-gray-800">
//               Upcoming Events
//             </h2>
//             <Button 
//               variant="primary" 
//               size="sm"
//               onClick={() => console.log('Button clicked')}
//             >
//               New Event
//             </Button>
//           </div>

//           <div className="space-y-4">
//             {assignments.map((assignment, index) => (
//               <Card key={`assignment-${index}`} {...assignment} />
//             ))}

//             {quizzes.map((quiz, index) => (
//               <Card key={`quiz-${index}`} {...quiz} />
//             ))}

//             {exams.map((exam, index) => (
//               <Card key={`exam-${index}`} {...exam} />
//             ))}
//           </div>
//         </section>

//         <Divider />

//         <section className="mt-8">
//           <div className="flex items-center justify-between mb-4">
//             <h2 className="text-xl font-semibold text-gray-800">
//               Your Modules
//             </h2>
//             <Button 
//               variant="primary" 
//               size="sm"
//               onClick={() => console.log('Button clicked')}
//             >
//               New Module
//             </Button>
//           </div>

//           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//             {modules.map((module, index) => (
//               <StatsCard 
//                 key={`module-${index}`} 
//                 {...module} 
//                 moduleId={`module-${index}`}
//               />
//             ))}
//           </div>
//         </section>

//         <Divider />
//       {/* </div> */}
//     </main>
//   );
// }

'use client'
import React, { useRef } from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import EducatorEventCard from './EducatorEventCard';
import EducatorModuleCard from './EducatorModuleCard';

const upcomingEvents = [
  {
    id: 1,
    title: 'Assignment 1',
    module: 'EE 7260 Advanced Artificial Intelligence',
    uploads: '03/211',
    date: '1st of June 2025 11.59 PM',
    label: 'Due on:'
  },
  {
    id: 2,
    title: 'Quiz 2',
    module: 'EE6350 Artificial Intelligence',
    uploads: '00/140',
    date: '10th of June 2025 8.30 PM',
    label: 'Scheduled on:'
  },
  {
    id: 3,
    title: 'Mid Exam',
    module: 'EE6350 Artificial Intelligence',
    uploads: '00/140',
    date: '04th of July 2025 8.30 PM',
    label: 'Scheduled on:'
  }
];

const createdModules = [
  {
    id: 1,
    title: 'EE 7260 Advanced Artificial Intelligence',
    image: '/images/adv_ai.jpeg',
    enrolled: '211/250'
  },
  {
    id: 2,
    title: 'EE5235 Machine Learning',
    image: '/images/ml.png',
    enrolled: '11/150'
  },
  {
    id: 3,
    title: 'EE 6301 Artificial Intelligence',
    image: '/images/ai_2.jpeg',
    enrolled: '41/100'
  },
  {
    id: 4,
    title: 'EE 6350 Artificial Intelligence',
    image: '/images/download.png',
    enrolled: '140/150'
  }
];

const EducatorHomePage: React.FC = () => {
  const moduleScrollRef = useRef<HTMLDivElement>(null);

  const scrollLeft = () => {
    moduleScrollRef.current?.scrollBy({ left: -300, behavior: 'smooth' });
  };

  const scrollRight = () => {
    moduleScrollRef.current?.scrollBy({ left: 300, behavior: 'smooth' });
  };

  return (
    <div className="w-full min-h-screen space-y-12 px-4 py-6">
      {/* Upcoming Events Section */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-blue-900">Upcoming Events</h2>
          <button className="bg-blue-900 text-white text-sm px-4 py-2 rounded-md flex items-center gap-1">
            + New Event
          </button>
        </div>
        <div className="flex items-center space-x-4 overflow-x-auto scrollbar-hide">
          {upcomingEvents.map(event => (
            <EducatorEventCard key={event.id} {...event} />
          ))}
          <FiChevronRight className="text-2xl text-black cursor-pointer" />
        </div>
      </div>

      {/* Created Modules Section */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-blue-900">Created Modules</h2>
          <button className="bg-blue-900 text-white text-sm px-4 py-2 rounded-md">
            + New Module
          </button>
        </div>

        <div className="relative">
          <button
            onClick={scrollLeft}
            className="absolute left-0 top-1/2 -translate-y-1/2 bg-white shadow-md rounded-full p-2 z-10"
          >
            <FiChevronLeft className="text-2xl text-black" />
          </button>

          <div
            ref={moduleScrollRef}
            className="flex space-x-4 overflow-x-auto scrollbar-hide px-8"
          >
            {createdModules.map(mod => (
              <EducatorModuleCard key={mod.id} {...mod} />
            ))}
          </div>

          <button
            onClick={scrollRight}
            className="absolute right-0 top-1/2 -translate-y-1/2 bg-white shadow-md rounded-full p-2 z-10"
          >
            <FiChevronRight className="text-2xl text-black" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default EducatorHomePage;
