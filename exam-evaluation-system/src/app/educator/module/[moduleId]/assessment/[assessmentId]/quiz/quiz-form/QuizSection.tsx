"use client";

import { Plus, Trash2, Minus, BookOpen, AlertCircle } from "lucide-react";
import Button from "@/components/Button";
import Dropdown from "@/components/Dropdown";
import ImportQuestions from "./ImportQuestions";

interface Question {
  question_id: string;
  assessment_id: string;
  type: "MCQ" | "SHORT";
  question_number: string;
  question: string;
  model_answer: string;
  mcq_answer_options: string[];
  marks_allowed: string;
}

interface QuizSectionProps {
  questions: Question[];
  onAddQuestion: () => void;
  onUpdateQuestion: (index: number, field: keyof Question, value: any) => void;
  onUpdateMCQOption: (
    questionIndex: number,
    optionIndex: number,
    value: string
  ) => void;
  onAddMCQOption: (questionIndex: number) => void;
  onRemoveMCQOption: (questionIndex: number, optionIndex: number) => void;
  onRemoveQuestion: (index: number) => void;
  assessmentId: string;
}

export default function QuizSection({
  questions,
  onAddQuestion,
  onUpdateQuestion,
  onUpdateMCQOption,
  onAddMCQOption,
  onRemoveMCQOption,
  onRemoveQuestion,
  assessmentId,
}: QuizSectionProps) {
  const questionTypeOptions = [
    "Multiple Choice Question",
    "Short Answer Question",
  ];

  const getQuestionTypeValue = (option: string): "MCQ" | "SHORT" => {
    return option === "Multiple Choice Question" ? "MCQ" : "SHORT";
  };

  const getQuestionTypeLabel = (type: "MCQ" | "SHORT"): string => {
    return type === "MCQ"
      ? "Multiple Choice Question"
      : "Short Answer Question";
  };

  const handleImport = (importedQuestions: any[]) => {
    const newQuestions = importedQuestions.map((q, i) => ({
      question_id: `imported_${Date.now()}_${i}`,
      assessment_id: assessmentId,
      type: q.type === "MCQ" ? "MCQ" : "SHORT",
      question_number: String(questions.length + i + 1),
      question: q.question,
      model_answer: q.correctAnswer,
      mcq_answer_options: q.options || [],
      marks_allowed: String(q.marks || 1),
    }));

    newQuestions.forEach((q, i) => {
      const index = questions.length + i;
      onUpdateQuestion(index, "question_id", q.question_id);
      onUpdateQuestion(index, "assessment_id", q.assessment_id);
      onUpdateQuestion(index, "type", q.type);
      onUpdateQuestion(index, "question_number", q.question_number);
      onUpdateQuestion(index, "question", q.question);
      onUpdateQuestion(index, "model_answer", q.model_answer);
      onUpdateQuestion(index, "marks_allowed", q.marks_allowed);
      
      if (q.type === "MCQ") {
        q.mcq_answer_options.forEach((opt: string, optIndex: number) => {
          onUpdateMCQOption(index, optIndex, opt);
        });
      }
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden mb-8">
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-600" />
              Quiz Questions ({questions.length})
            </h2>
            <p className="text-gray-600 text-sm mt-1">
              Create and manage your quiz questions
            </p>
          </div>
          {/* <div className="flex gap-2">
            <ImportQuestions onImport={handleImport} />
            <Button
              onClick={onAddQuestion}
              variant="primary"
              size="sm"
            >
              <Plus className="w-4 h-4" />
              Add Question
            </Button>
          </div> */}
        </div>
      </div>

      <div className="p-6">
        {questions.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <BookOpen className="w-10 h-10 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No Questions Added Yet
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Start building your quiz by adding your first question. You can
              create multiple choice or short answer questions.
            </p>
            <div className="flex justify-center gap-4">
              <Button
                onClick={onAddQuestion}
                className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                <Plus className="w-5 h-5" />
                Add Your First Question
              </Button>
              <ImportQuestions onImport={handleImport} />
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {questions.map((question, questionIndex) => (
              <div
                key={question.question_id}
                className="border-2 border-gray-200 rounded-2xl overflow-hidden hover:border-blue-300 transition-colors"
              >
                <div className="bg-gradient-to-r from-gray-50 to-blue-50 px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl flex items-center justify-center font-bold text-lg">
                        {questionIndex + 1}
                      </div>
                      <div className="w-auto">
                        <Dropdown
                          options={questionTypeOptions}
                          selectedOption={getQuestionTypeLabel(question.type)}
                          onSelect={(option) => {
                            const typeValue = getQuestionTypeValue(option);
                            onUpdateQuestion(questionIndex, "type", typeValue);
                          }}
                          className="w-full"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Choose the question type
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Marks
                        </label>
                        <input
                          type="number"
                          value={question.marks_allowed}
                          onChange={(e) =>
                            onUpdateQuestion(
                              questionIndex,
                              "marks_allowed",
                              e.target.value
                            )
                          }
                          min="0.00"
                          step="0.5"
                          className="w-20 px-3 py-2 text-center bg-white border border-gray-300 rounded-lg font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                        />
                      </div>
                      <Button
                        onClick={() => onRemoveQuestion(questionIndex)}
                        variant="outline"
                        size="sm"
                        className="text-red-600 border-red-300 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <div className="mb-6">
                    <label className="block text-sm font-semibold text-gray-800 mb-3">
                      Question Text <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={question.question}
                      onChange={(e) =>
                        onUpdateQuestion(
                          questionIndex,
                          "question",
                          e.target.value
                        )
                      }
                      rows={3}
                      className="w-full px-4 py-3 text-gray-900 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 shadow-sm resize-none"
                      placeholder="Enter your question here. Be clear and specific..."
                    />
                  </div>

                  {question.type === "MCQ" && (
                    <div className="mb-6">
                      <div className="flex items-center justify-between mb-4">
                        <label className="block text-sm font-semibold text-gray-800">
                          Answer Options <span className="text-red-500">*</span>
                        </label>
                      </div>
                      <div className="space-y-4">
                        {question.mcq_answer_options.map(
                          (option, optionIndex) => (
                            <div
                              key={optionIndex}
                              className="flex items-center gap-4 group"
                            >
                              <div className="flex items-center">
                                <input
                                  type="radio"
                                  name={`correct_answer_${questionIndex}`}
                                  checked={
                                    question.model_answer === option &&
                                    option.trim() !== ""
                                  }
                                  onChange={() =>
                                    onUpdateQuestion(
                                      questionIndex,
                                      "model_answer",
                                      option
                                    )
                                  }
                                  className="w-5 h-5 text-blue-600 focus:ring-blue-500 focus:ring-2"
                                  disabled={option.trim() === ""}
                                />
                                <span className="ml-3 w-8 h-8 bg-blue-100 text-blue-700 rounded-lg flex items-center justify-center font-bold text-sm">
                                  {String.fromCharCode(65 + optionIndex)}
                                </span>
                              </div>
                              <input
                                type="text"
                                value={option}
                                onChange={(e) =>
                                  onUpdateMCQOption(
                                    questionIndex,
                                    optionIndex,
                                    e.target.value
                                  )
                                }
                                className="flex-1 px-4 py-3 text-gray-900 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 shadow-sm"
                                placeholder={`Enter option ${String.fromCharCode(
                                  65 + optionIndex
                                )}`}
                              />
                              {question.mcq_answer_options.length > 2 && (
                                <Button
                                  onClick={() =>
                                    onRemoveMCQOption(questionIndex, optionIndex)
                                  }
                                  variant="outline"
                                  size="sm"
                                  className="text-red-600 border-red-300 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <Minus className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                          )
                        )}
                      </div>
                      <div className="mt-3 flex items-start gap-2">
                        <div className="flex-1 p-3 w-auto bg-amber-50 border border-amber-200 rounded-lg">
                          <p className="text-xs text-amber-800 flex items-center gap-2">
                            <AlertCircle className="w-4 h-4" />
                            Select the radio button next to the correct answer.
                            Students will see these options in random order. You
                            can add up to 8 options per question.
                          </p>
                        </div>
                        <Button
                          onClick={() => onAddMCQOption(questionIndex)}
                          variant="primary"
                          size="sm"
                          className=""
                          disabled={question.mcq_answer_options.length >= 8}
                        >
                          <Plus className="w-5 h-5" />
                        </Button>
                      </div>
                    </div>
                  )}

                  {question.type === "SHORT" && (
                    <div className="mb-6">
                      <label className="block text-sm font-semibold text-gray-800 mb-3">
                        Model Answer <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        value={question.model_answer}
                        onChange={(e) =>
                          onUpdateQuestion(
                            questionIndex,
                            "model_answer",
                            e.target.value
                          )
                        }
                        rows={3}
                        className="w-full px-4 py-3 text-gray-900 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 shadow-sm resize-none"
                        placeholder="Enter the expected answer or key points that should be included..."
                      />
                      <p className="text-xs text-gray-500 mt-2">
                        This will be used as a reference for manual grading.
                        Include key points or the exact answer expected.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {questions.length > 0 && (
          <div className="flex justify-between mt-6">
            <ImportQuestions onImport={handleImport} />
            <Button
              onClick={onAddQuestion}
              variant="primary"
            >
              <Plus className="w-4 h-4" />
              Add Question
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}