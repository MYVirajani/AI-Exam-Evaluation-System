// components/StudentHomePage.tsx
import React from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const upcomingEvents = [
  {
    id: 1,
    title: 'Quiz 2',
    module: 'EC 7260 Advanced Artificial Intelligence',
    countdown: '72:36:54',
    date: '1st of June 2025 11.59 PM'
  },
  {
    id: 2,
    title: 'Mid Exam',
    module: 'EE6350 Artificial Intelligence',
    countdown: '120:36:54',
    date: '04th of July 2025 8.30 PM'
  },
  {
    id: 3,
    title: 'Take Home Assignment',
    module: 'EC 7208 Optimization Techniques for Engineers',
    countdown: '240:36:54',
    date: '5th of June 2025 11.59 PM'
  }
];

const modules = [
  {
    id: 1,
    title: 'EC 7260 Advanced Artificial Intelligence',
    image: '/images/advanced_ai_2.png',
    event: 'Quiz 2'
  },
  {
    id: 2,
    title: 'EC7208 Optimization Techniques for Engineers',
    image: '/images/opt.png',
    event: 'Take Home Assignment'
  },
  {
    id: 3,
    title: 'EC 7207 High Performance Computing',
    image: '/images/hpc.png',
    event: 'Quiz 1'
  },
  {
    id: 4,
    title: 'EC 7205 Cloud Computing',
    image: '/images/cloud_computing.png',
    event: 'No upcoming events'
  }
];

const StudentHomePage: React.FC = () => {
  return (
    <div className="w-full min-h-screen space-y-12 px-0 sm:px-2 overflow-auto">
      {/* Upcoming Events */}
      <div>
        <h2 className="text-xl font-bold text-blue-900 mb-4">Upcoming Events</h2>
        <div className="flex items-center space-x-4 overflow-x-auto">
          {upcomingEvents.map((event) => (
            <div key={event.id} className="min-w-[250px] bg-gray-100 rounded-2xl p-4 text-center">
              <h3 className="text-lg font-bold text-blue-800">{event.title}</h3>
              <p className="text-sm text-blue-900 truncate">{event.module}</p>
             <p className="text-2xl font-semibold mt-2 text-black">{event.countdown}</p>

              <p className="text-xs text-gray-600 mt-1">Scheduled on:<br />{event.date}</p>
            </div>
          ))}
          <FiChevronRight className="text-2xl text-black cursor-pointer" />
        </div>
      </div>

      {/* Enrolled Modules */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-blue-900">Enrolled Modules</h2>
          <button className="bg-blue-900 text-white text-sm px-4 py-2 rounded-md">Enroll New Module</button>
        </div>
        <div className="flex items-center space-x-4 overflow-x-auto">
          <FiChevronLeft className="text-2xl text-black cursor-pointer" />
          {modules.map((module) => (
            <div key={module.id} className="min-w-[220px] bg-gray-100 rounded-2xl p-3">
              <img
                src={module.image}
                alt={module.title}
                className="w-full h-24 object-cover rounded-xl mb-2"
              />
              <p className="text-sm font-medium text-blue-900 truncate">{module.title}</p>
              <p className="text-xs text-blue-800">{module.event}</p>
            </div>
          ))}
          <FiChevronRight className="text-2xl text-black cursor-pointer" />
        </div>
      </div>
    </div>
  )
}

export default StudentHomePage;
