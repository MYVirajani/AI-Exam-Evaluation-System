//  components/QuizForm.tsx
"use client";

import React from "react";
import { FiTrash2 } from "react-icons/fi";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";

interface Question {
  id: string;
  questionType: "MCQ" | "SHORT";
  questionText: string;
  options: string[];
  correctAnswerIndex: number;
  marks: number;
  expectedAnswer?: string;
}

interface QuizFormProps {
  questions: Question[];
  setQuestions: React.Dispatch<React.SetStateAction<Question[]>>;
  onSubmit: () => void;
}

const questionTypes = [
  { label: "Multiple Choice (MCQ)", value: "MCQ" },
  { label: "Short Answer", value: "SHORT" },
];

const QuizForm: React.FC<QuizFormProps> = ({ questions, setQuestions, onSubmit }) => {
  const generateQuestionId = () =>
    Date.now().toString() + Math.random().toString(36).substr(2, 9);

  // Ensure all questions have valid marks when component initializes
  React.useEffect(() => {
    const updatedQuestions = questions.map(q => ({
      ...q,
      marks: q.marks != null ? q.marks : 1 // Default to 1 if marks is undefined/null
    }));
    
    // Only update if there were changes
    const hasChanges = questions.some((q, index) => q.marks !== updatedQuestions[index].marks);
    if (hasChanges) {
      setQuestions(updatedQuestions);
    }
  }, []);

  const handleQuestionChange = (
    index: number,
    field: keyof Question,
    value: any
  ) => {
    const newQuestions = [...questions];
    newQuestions[index][field] = value;
    setQuestions(newQuestions);
  };

  const handleQuestionTypeChange = (
    index: number,
    questionType: "MCQ" | "SHORT"
  ) => {
    const newQuestions = [...questions];
    newQuestions[index].questionType = questionType;

    if (questionType === "MCQ") {
      newQuestions[index].options = ["", "", "", ""];
      newQuestions[index].correctAnswerIndex = 0;
      delete newQuestions[index].expectedAnswer;
    } else {
      newQuestions[index].options = [];
      newQuestions[index].correctAnswerIndex = -1;
      newQuestions[index].expectedAnswer = "";
    }

    setQuestions(newQuestions);
  };

  const handleOptionChange = (qIdx: number, optIdx: number, value: string) => {
    const newQuestions = [...questions];
    newQuestions[qIdx].options[optIdx] = value;
    setQuestions(newQuestions);
  };

  const addOption = (qIdx: number) => {
    const newQuestions = [...questions];
    newQuestions[qIdx].options.push("");
    setQuestions(newQuestions);
  };

  const removeOption = (qIdx: number, optIdx: number) => {
    const newQuestions = [...questions];
    newQuestions[qIdx].options.splice(optIdx, 1);

    if (newQuestions[qIdx].correctAnswerIndex >= newQuestions[qIdx].options.length) {
      newQuestions[qIdx].correctAnswerIndex = 0;
    }

    setQuestions(newQuestions);
  };

  const addQuestion = (questionType: "MCQ" | "SHORT" = "MCQ") => {
    const newQuestion: Question = {
      id: generateQuestionId(),
      questionType,
      questionText: "",
      options: questionType === "MCQ" ? ["", "", "", ""] : [],
      correctAnswerIndex: questionType === "MCQ" ? 0 : -1,
      marks: 1, // Ensure marks is always initialized as a number
    };

    if (questionType === "SHORT") {
      newQuestion.expectedAnswer = "";
    }

    setQuestions([...questions, newQuestion]);
  };

  const removeQuestion = (index: number) => {
    const newQuestions = questions.filter((_, i) => i !== index);
    setQuestions(newQuestions);
  };

  const getMCQCount = () => questions.filter((q) => q.questionType === "MCQ").length;
  const getShortAnswerCount = () => questions.filter((q) => q.questionType === "SHORT").length;

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Quiz Questions</h2>
        <div className="text-sm text-gray-600">
          Total: {questions.length} question{questions.length !== 1 ? "s" : ""} (
          {getMCQCount()} MCQ, {getShortAnswerCount()} Short Answer)
        </div>
      </div>

      <div className="space-y-6">
        {questions.map((q, qIdx) => (
          <div key={q.id} className="border border-gray-200 p-6 rounded-lg bg-gray-50">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-gray-900">
                Question {qIdx + 1} <span className="ml-2 text-sm text-gray-600">({q.questionType === "MCQ" ? "Multiple Choice" : "Short Answer"})</span>
              </h3>
              {questions.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeQuestion(qIdx)}
                  className="flex items-center gap-1 text-red-600 hover:text-red-700 text-sm"
                >
                  <FiTrash2 size={16} /> Remove
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">Question Type</label>
                <select
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={q.questionType}
                  onChange={(e) => handleQuestionTypeChange(qIdx, e.target.value as "MCQ" | "SHORT")}
                >
                  {questionTypes.map((type) => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">Marks</label>
                <Input
                  type="number"
                  min="0"
                  step="0.1"
                  placeholder="Marks"
                  value={q.marks != null ? q.marks.toString() : ""} // Handle undefined/null marks
                  onChange={(e) => {
                    const value = e.target.value;
                    // Handle empty string and convert to number
                    const marks = value === "" ? 0 : parseFloat(value);
                    handleQuestionChange(qIdx, "marks", isNaN(marks) ? 0 : marks);
                  }}
                  className="text-gray-900"
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="block mb-2 text-sm font-medium text-gray-700">Question Text</label>
              <Textarea
                placeholder="Enter your question here..."
                value={q.questionText}
                onChange={(e) => handleQuestionChange(qIdx, "questionText", e.target.value)}
                className="text-gray-900"
                rows={2}
              />
            </div>

            {/* MCQ Options */}
            {q.questionType === "MCQ" && (
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">Answer Options</label>
                {q.options.map((opt, optIdx) => (
                  <div key={optIdx} className="flex items-center gap-3">
                    <div className="flex items-center">
                      <input
                        type="radio"
                        name={`correct-${qIdx}`}
                        checked={q.correctAnswerIndex === optIdx}
                        onChange={() => handleQuestionChange(qIdx, "correctAnswerIndex", optIdx)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                      />
                      <label className="ml-2 text-sm text-gray-700">
                        {String.fromCharCode(97 + optIdx).toUpperCase()}
                      </label>
                    </div>
                    <Input
                      placeholder={`Option ${optIdx + 1}`}
                      value={opt}
                      onChange={(e) => handleOptionChange(qIdx, optIdx, e.target.value)}
                      className="text-gray-900 flex-1"
                    />
                    {q.options.length > 2 && (
                      <button
                        type="button"
                        onClick={() => removeOption(qIdx, optIdx)}
                        className="text-red-600 hover:text-red-700 p-1"
                        title="Remove Option"
                      >
                        <FiTrash2 size={16} />
                      </button>
                    )}
                  </div>
                ))}

                {q.options.length < 6 && (
                  <button
                    type="button"
                    onClick={() => addOption(qIdx)}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    + Add Option
                  </button>
                )}
              </div>
            )}

            {/* Short Answer Expected Answer */}
            {q.questionType === "SHORT" && (
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">Expected Answer (Optional - for reference)</label>
                <Textarea
                  placeholder="Enter the expected answer or key points..."
                  value={q.expectedAnswer || ""}
                  onChange={(e) => handleQuestionChange(qIdx, "expectedAnswer", e.target.value)}
                  className="text-gray-900"
                  rows={3}
                />
                <p className="text-xs text-gray-500">This will not be shown on the question paper. It's for your reference only.</p>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-6 flex gap-2">
        <button
          type="button"
          onClick={() => addQuestion("MCQ")}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium px-4 py-2 rounded-lg border border-blue-200 hover:bg-blue-50"
        >
          + Add MCQ Question
        </button>
        <button
          type="button"
          onClick={() => addQuestion("SHORT")}
          className="flex items-center gap-2 text-green-600 hover:text-green-700 font-medium px-4 py-2 rounded-lg border border-green-200 hover:bg-green-50"
        >
          + Add Short Answer Question
        </button>
        {/* <button
          type="button"
          onClick={onSubmit}
          className="ml-auto bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700"
        >
          Submit Quiz
        </button> */}
      </div>
    </div>
  );
};

export default QuizForm;