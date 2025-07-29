"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { FiTrash2 } from "react-icons/fi";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import Button from "@/components/Button";

interface Question {
  questionText: string;
  options: string[];
  correctAnswerIndex: number;
}

const assessmentTypes = [
  { label: "Quiz", value: "quiz" },
  { label: "Assignment", value: "assignment" },
  { label: "Mid Exam", value: "midExam" },
  { label: "End Exam", value: "endExam" },
];

export default function AssessmentFormPage() {
  const { moduleId } = useParams();
  const router = useRouter();

  const [type, setType] = useState("quiz");
  const [title, setTitle] = useState("");
  const [duration, setDuration] = useState("");
  const [description, setDescription] = useState("");
  const [questions, setQuestions] = useState<Question[]>([
    {
      questionText: "",
      options: ["", "", "", ""],
      correctAnswerIndex: 0,
    },
  ]);

  const handleQuestionChange = (
    index: number,
    field: keyof Question,
    value: any
  ) => {
    const newQuestions = [...questions];
    newQuestions[index][field] = value;
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

    if (
      newQuestions[qIdx].correctAnswerIndex >= newQuestions[qIdx].options.length
    ) {
      newQuestions[qIdx].correctAnswerIndex = 0;
    }

    setQuestions(newQuestions);
  };

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        questionText: "",
        options: ["", "", "", ""],
        correctAnswerIndex: 0,
      },
    ]);
  };

  const removeQuestion = (index: number) => {
    const newQuestions = questions.filter((_, i) => i !== index);
    setQuestions(newQuestions);
  };

  const handleSubmit = async () => {
    const assessment = {
      moduleId,
      type,
      title,
      duration,
      description,
      ...(type === "quiz" && { questions }),
    };

    console.log("Submitting Assessment:", assessment);

    // await fetch("/api/educator/assessment", { method: "POST", body: JSON.stringify(assessment) });

    router.push(`/educator/module/${moduleId}`);
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-blue-900 mb-6">
        Create Assessment
      </h1>

      {/* Type Selector */}
      <div className="mb-4">
        <label className="block mb-2 text-sm font-medium text-gray-700">
          Assessment Type
        </label>
        <select
          className="w-full border border-gray-300 rounded px-3 py-2 text-gray-900"
          value={type}
          onChange={(e) => setType(e.target.value)}
        >
          {assessmentTypes.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </div>

      {/* Common Fields */}
      <div className="mb-4">
        <Input
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="text-gray-900"
        />
      </div>
      <div className="mb-4">
        <Input
          placeholder="Duration (in minutes)"
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
          className="text-gray-900"
        />
      </div>
      <div className="mb-4">
        <Textarea
          placeholder="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="text-gray-900"
        />
      </div>

      {/* Quiz Questions */}
      {type === "quiz" && (
        <div className="mt-6">
          <h2 className="text-lg font-semibold text-blue-800 mb-4">
            Quiz Questions
          </h2>

          {questions.map((q, qIdx) => (
            <div
              key={qIdx}
              className="mb-6 border p-4 rounded-lg bg-gray-50 relative"
            >
              <Textarea
                placeholder={`Question ${qIdx + 1} Text`}
                value={q.questionText}
                onChange={(e) =>
                  handleQuestionChange(qIdx, "questionText", e.target.value)
                }
                className="text-gray-900 mb-2"
              />

              {q.options.map((opt, optIdx) => (
                <div key={optIdx} className="mb-2 flex items-center gap-2">
                  <Input
                    placeholder={`Option ${optIdx + 1}`}
                    value={opt}
                    onChange={(e) =>
                      handleOptionChange(qIdx, optIdx, e.target.value)
                    }
                    className="text-gray-900 flex-1"
                  />
                  {q.options.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeOption(qIdx, optIdx)}
                      className="text-gray-700 hover:text-gray-800"
                      title="Remove Option"
                    >
                      <FiTrash2 size={16} />
                    </button>
                  )}
                </div>
              ))}

              <button
                type="button"
                onClick={() => addOption(qIdx)}
                className="text-blue-700 text-sm mb-2 hover:underline"
              >
                + Add Option
              </button>

              <Input
                type="number"
                min={0}
                max={q.options.length - 1}
                placeholder={`Correct Answer Index (0-${q.options.length - 1})`}
                value={q.correctAnswerIndex}
                onChange={(e) =>
                  handleQuestionChange(
                    qIdx,
                    "correctAnswerIndex",
                    parseInt(e.target.value)
                  )
                }
                className="text-gray-900"
              />

              {/* Remove Question Button */}
              {questions.length > 1 && (
                <div className="mt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={() => removeQuestion(qIdx)}
                    className="flex items-center gap-1 text-gray-700 text-sm hover:underline"
                  >
                    <FiTrash2 size={16} />
                    Remove Question
                  </button>
                </div>
              )}
            </div>
          ))}

          <button
            type="button"
            onClick={addQuestion}
            className="text-blue-700 text-sm flex items-center gap-1 hover:underline"
          >
            + Add Question
          </button>
        </div>
      )}

      {/* Submit/Cancel */}
      <div className="flex gap-2 mt-6">
        <Button onClick={handleSubmit}>Create Assessment</Button>
        <Button variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
