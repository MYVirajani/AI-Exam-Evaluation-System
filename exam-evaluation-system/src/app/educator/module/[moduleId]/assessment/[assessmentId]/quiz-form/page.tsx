"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Button from "@/components/Button";
import QuizForm from "@/components/QuizForm";
import { FiBook, FiClock, FiFileText, FiSave, FiX, FiCheckCircle } from "react-icons/fi";

interface Question {
  id: string;
  questionType: "mcq" | "short_answer";
  questionText: string;
  options: string[];
  correctAnswerIndex: number;
  marks: number;
  expectedAnswer?: string;
}

export default function AssessmentFormPage() {
  const { moduleId, assessmentId } = useParams();
  const searchParams = useSearchParams();
  const educatorId = searchParams.get("educatorId");

  const router = useRouter();

  const [title, setTitle] = useState("");
  const [duration, setDuration] = useState("");
  const [description, setDescription] = useState("");
  const [instructions, setInstructions] = useState("");
  const [totalMarks, setTotalMarks] = useState("");
  const [questions, setQuestions] = useState<Question[]>([
    {
      id: Date.now().toString(),
      questionType: "mcq",
      questionText: "",
      options: ["", "", "", ""],
      correctAnswerIndex: 0,
      marks: 0.5,
    },
  ]);
  const [moduleCode, setModuleCode] = useState("");
  const [moduleName, setModuleName] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAssessment() {
      if (!moduleId || !assessmentId || !educatorId) return;

      try {
        setLoading(true);
        const res = await fetch(
          `/api/educator/module/${moduleId}/assessment/${assessmentId}?educatorId=${educatorId}`
        );
        const data = await res.json();

        if (data.success === false) return;

        const assessment = data.assessments[0];
        setTitle(assessment.title || "");
        setDuration(assessment.duration?.toString() || "");
        setDescription(assessment.description || "");
        setInstructions((assessment.instructions || []).join("\n"));

        // Set module info
        if (data.moduleData) {
          setModuleCode(data.moduleData.module_code || "");
          setModuleName(data.moduleData.module_name || "");
        }
      } catch (err) {
        console.error("Failed to load assessment data:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchAssessment();
  }, [moduleId, assessmentId, educatorId]);

  const calculateTotalMarks = () => {
    return questions.reduce((total, q) => total + (q.marks || 0), 0).toFixed(1);
  };

  const handleSubmit = async () => {
    if (!moduleId || !assessmentId || !educatorId) {
      alert("Missing required identifiers");
      return;
    }

    setIsSaving(true);
    const sanitizedQuestions = questions.map(({ id, ...rest }) => rest);

    const quiz = {
      moduleId,
      type: "quiz",
      assessmentId,
      title,
      duration: parseInt(duration, 10),
      description,
      instructions: instructions.trim(),
      questions: sanitizedQuestions,
      createdBy: educatorId,
    };

    try {
      const res = await fetch("/api/educator/assessment/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(quiz),
      });

      const result = await res.json();
      if (result.success) {
        alert("Assessment saved successfully!");
        router.push(`/educator/module/${moduleId}`);
      } else {
        alert("Failed to save assessment: " + result.message);
      }
    } catch (err) {
      console.error("Error submitting quiz:", err);
      alert("Something went wrong. Check console for details.");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full mx-4">
          <div className="flex items-center justify-center space-x-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="text-lg font-medium text-gray-700">Loading assessment...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-100 rounded-xl">
                <FiFileText className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Assessment Builder</h1>
                <p className="text-gray-600 mt-1">Create and manage quiz assessments</p>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex items-center space-x-3">
              <Button 
                variant="outline" 
                onClick={() => router.back()}
                className="flex items-center space-x-2"
                disabled={isSaving}
              >
                <FiX className="h-4 w-4" />
                <span>Cancel</span>
              </Button>
              <Button 
                onClick={handleSubmit}
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700"
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <FiSave className="h-4 w-4" />
                    <span>Save Quiz</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Module Information Card */}
        {moduleCode && moduleName && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-purple-100 rounded-lg">
                <FiBook className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-gray-600 mt-1">
                  <span className="text-lg font-semibold text-blue-600">{moduleCode} — {moduleName}</span>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Quiz Form Container */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Quiz Configuration</h3>
            <p className="text-gray-600">Configure your assessment details and questions below</p>
          </div>
          
          <div className="p-6">
            <QuizForm
              questions={questions}
              setQuestions={setQuestions}
              onSubmit={handleSubmit}
            />
          </div>
        </div>

        {/* Footer Stats & Actions */}
        <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-8">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <FiCheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Total Questions</p>
                  <p className="text-2xl font-bold text-green-600">{questions.length}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FiClock className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Total Marks</p>
                  <p className="text-2xl font-bold text-blue-600">{calculateTotalMarks()}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Button 
                variant="outline" 
                onClick={() => router.back()}
                className="flex items-center space-x-2"
                disabled={isSaving}
              >
                <FiX className="h-4 w-4" />
                <span>Cancel</span>
              </Button>
              <Button 
                onClick={handleSubmit}
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 px-8"
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Saving Quiz...</span>
                  </>
                ) : (
                  <>
                    <FiSave className="h-4 w-4" />
                    <span>Save Quiz</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}