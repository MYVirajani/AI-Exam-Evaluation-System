'use client'
import Header from "@/components/Header";
import Card from "@/components/Card";
import Divider from "@/components/Divider";
import StatsCard from "@/components/StatsCard";
import Button from "@/components/Button";
import {
  assignments,
  quizzes,
  exams,
  modules,
} from "@/constants/data";

export default function Home() {
  return (
    <main className="min-h-screen p-8 bg-gray-50">
      {/* <div className="max-w-4xl mx-auto"> */}
        {/* <Header /> */}

        <section className="mt-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Upcoming Events
          </h2>

          <div className="space-y-4">
            {assignments.map((assignment, index) => (
              <Card key={`assignment-${index}`} {...assignment} />
            ))}

            {quizzes.map((quiz, index) => (
              <Card key={`quiz-${index}`} {...quiz} />
            ))}

            {exams.map((exam, index) => (
              <Card key={`exam-${index}`} {...exam} />
            ))}
          </div>
        </section>

        <Divider />

        <section className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800">
              Your Modules
            </h2>
            <Button 
              variant="primary" 
              size="sm"
              onClick={() => console.log('Button clicked')}
            >
              New Module
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {modules.map((module, index) => (
              <StatsCard 
                key={`module-${index}`} 
                {...module} 
                moduleId={`module-${index}`}
              />
            ))}
          </div>
        </section>

        <Divider />
      {/* </div> */}
    </main>
  );
}