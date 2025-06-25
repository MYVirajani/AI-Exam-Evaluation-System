"use client";
import React from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import StudentEventCard from "./StudentEventCard";
import StudentModuleCard from "./StudentModuleCard";
import Button from "@/components/Button";

const upcomingEvents = [
  {
    id: 1,
    title: "Quiz 2",
    module: "EC 7260 Advanced Artificial Intelligence",
    countdown: "72:36:54",
    date: "1st of June 2025 11.59 PM",
  },
  {
    id: 2,
    title: "Mid Exam",
    module: "EE6350 Artificial Intelligence",
    countdown: "120:36:54",
    date: "04th of July 2025 8.30 PM",
  },
  {
    id: 3,
    title: "Take Home Assignment",
    module: "EC 7208 Optimization Techniques for Engineers",
    countdown: "240:36:54",
    date: "5th of June 2025 11.59 PM",
  },
];

const modules = [
  {
    id: 1,
    title: "EC 7260 Advanced Artificial Intelligence",
    image: "/images/advanced_ai_2.png",
    event: "Quiz 2",
  },
  {
    id: 2,
    title: "EC7208 Optimization Techniques for Engineers",
    image: "/images/opt.png",
    event: "Take Home Assignment",
  },
  {
    id: 3,
    title: "EC 7207 High Performance Computing",
    image: "/images/hpc.png",
    event: "Quiz 1",
  },
  {
    id: 4,
    title: "EC 7205 Cloud Computing",
    image: "/images/cloud_computing.png",
    event: "No upcoming events",
  },
];

const StudentHomePage: React.FC = () => {
  return (
    <div className="w-full min-h-screen space-y-12 px-0 sm:px-2 overflow-auto">
      {/* Upcoming Events */}
      <div>
        <h2 className="text-xl font-bold text-blue-900 mb-4">
          Upcoming Events
        </h2>
        <div className="flex items-center space-x-4 overflow-x-auto">
          {upcomingEvents.map((event) => (
            <StudentEventCard
              key={event.id}
              title={event.title}
              module={event.module}
              countdown={event.countdown}
              date={event.date}
            />
          ))}
          {/* <FiChevronRight className="text-2xl text-black cursor-pointer" /> */}
        </div>
      </div>

      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-blue-900">Enrolled Modules</h2>
          <Button
            variant="primary"
            size="sm"
            onClick={() => console.log("Button clicked")}
          >
            Enroll New Module
          </Button>
         </div>
        <div className="flex items-center space-x-4 overflow-x-auto">
          {/* <FiChevronLeft className="text-2xl text-black cursor-pointer" /> */}
          {modules.map((module) => (
            <StudentModuleCard
              key={module.id}
              title={module.title}
              image={module.image}
              event={module.event}
            />
          ))}
          {/* <FiChevronRight className="text-2xl text-black cursor-pointer" /> */}
        </div>
      </div>
    </div>
  );
};

export default StudentHomePage;
