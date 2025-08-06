'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import Button from '@/components/Button';
import toast from 'react-hot-toast';

interface Question {
  question_id: string;
  type: 'MCQ' | 'SHORT';
  question_number: string;
  question: string;
  mcq_answer_options: string[];
  marks_allowed: string;
}

interface QuizData {
  assessmentId: string;
  title: string;
  duration: number;
  module_code: string;
  module_name: string;
  started_at: string;
  questions: Question[];
}

const QuizAttemptPage = () => {
  const router = useRouter();
  const { assessmentId } = useParams();
  const searchParams = useSearchParams();

  const studentId = searchParams.get('studentId');
  const moduleId = searchParams.get('moduleId');
  const submissionId = searchParams.get('submissionId');

  const [quizData, setQuizData] = useState<QuizData | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuiz = async () => {
      if (!assessmentId || !submissionId) {
        toast.error('Missing assessment or submission ID');
        return;
      }

      try {
        const res = await fetch(
          `/api/student/quiz/${assessmentId}/questions?submissionId=${submissionId}`
        );
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || 'Failed to load quiz');
        }

        setQuizData(data);
      } catch (error: any) {
        toast.error(error.message || 'Failed to load quiz');
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [assessmentId, submissionId]);

  const handleAnswerChange = (questionId: string, answer: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }));
  };

  const handleNext = () => {
    if (currentIndex < (quizData?.questions.length || 0) - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (!studentId || !submissionId) {
      toast.error('Missing student or submission ID');
      return;
    }

    const formattedAnswers = Object.entries(answers).map(([question_id, student_answer]) => ({
      question_id,
      student_answer,
    }));

    try {
      const res = await fetch(`/api/quiz/${assessmentId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          submissionId,
          studentId,
          answers: formattedAnswers,
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message || 'Submission failed');
      }

      toast.success('Quiz submitted successfully!');
      router.push(`/student/quiz/results/${assessmentId}?studentId=${studentId}&moduleId=${moduleId}`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit quiz');
    }
  };

  if (loading) return <div className="p-8 text-center">Loading quiz...</div>;
  if (!quizData) return <div className="p-8 text-center">Quiz not found.</div>;

  const currentQuestion = quizData.questions[currentIndex];

  return (
  <div className="max-w-3xl mx-auto px-4 py-8 bg-white text-gray-900 min-h-screen">
    {/* Quiz Header */}
    <div className="mb-6">
      <h1 className="text-3xl font-bold text-gray-800">{quizData.title}</h1>
      <p className="text-gray-700 text-base">
        {quizData.module_code} - {quizData.module_name}
      </p>
      <p className="text-sm text-gray-500 mt-1">
        Question {currentIndex + 1} of {quizData.questions.length}
      </p>
    </div>

    {/* Question Container */}
    <div className="bg-gray-50 shadow rounded-lg p-6 mb-6 border border-gray-200">
      <h2 className="font-semibold text-lg text-gray-800 mb-4">
        {currentQuestion.question_number}. {currentQuestion.question}
      </h2>

      {currentQuestion.type === 'MCQ' ? (
        <div className="space-y-2 text-gray-700">
          {currentQuestion.mcq_answer_options.map((option, idx) => (
            <label key={idx} className="block cursor-pointer">
              <input
                type="radio"
                name={`question-${currentQuestion.question_id}`}
                value={option}
                checked={answers[currentQuestion.question_id] === option}
                onChange={() =>
                  handleAnswerChange(currentQuestion.question_id, option)
                }
                className="mr-2"
              />
              {option}
            </label>
          ))}
        </div>
      ) : (
        <textarea
          rows={5}
          className="w-full mt-2 border border-gray-300 rounded-md p-3 text-gray-900"
          placeholder="Type your answer here..."
          value={answers[currentQuestion.question_id] || ''}
          onChange={(e) =>
            handleAnswerChange(currentQuestion.question_id, e.target.value)
          }
        />
      )}
    </div>

    {/* Navigation Buttons */}
    <div className="flex justify-between gap-4">
      <Button
        variant="outline"
        disabled={currentIndex === 0}
        onClick={handlePrevious}
      >
        Previous
      </Button>

      {currentIndex === quizData.questions.length - 1 ? (
        <Button variant="primary" onClick={handleSubmit}>
          Submit Quiz
        </Button>
      ) : (
        <Button variant="primary" onClick={handleNext}>
          Next
        </Button>
      )}
    </div>
  </div>
);

};

export default QuizAttemptPage;
