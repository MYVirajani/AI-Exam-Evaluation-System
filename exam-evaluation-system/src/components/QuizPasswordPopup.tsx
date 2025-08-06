"use client";

import React, { useState, useEffect } from "react";
import { X, Lock, Eye, EyeOff } from "lucide-react";
import AttemptButton from "./AttemptButton";
import CancelButton from "./CancelButton";
import toast from "react-hot-toast";

interface QuizPasswordPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  assessmentId: string;
  studentId: string;
  quizTitle: string;
}

const QuizPasswordPopup: React.FC<QuizPasswordPopupProps> = ({
  isOpen,
  onClose,
  onSuccess,
  assessmentId,
  studentId,
  quizTitle,
}) => {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [attemptCount, setAttemptCount] = useState(0);

  // Reset form when popup opens/closes
  useEffect(() => {
    if (isOpen) {
      setPassword("");
      setShowPassword(false);
      setAttemptCount(0);
    }
  }, [isOpen]);

  // Handle escape key press
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!password.trim()) {
      toast.error("Please enter the quiz password");
      return;
    }

    setLoading(true);
    setAttemptCount((prev) => prev + 1);

    try {
      const response = await fetch(`/api/student/quiz/verify-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          assessmentId,
          studentId,
          password: password.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Password verification failed");
      }

      if (data.success) {
        toast.success("Password verified! Starting quiz...");
        onSuccess();
        onClose();
      } else {
        toast.error("Incorrect password. Please try again.");
        setPassword("");
      }
    } catch (error: any) {
      console.error("Password verification error:", error);
      toast.error(error.message || "Failed to verify password");
      setPassword("");
    } finally {
      setLoading(false);
    }
  };

  const handleAttemptClick = () => {
    // Trigger form submission
    const form = document.getElementById(
      "quiz-password-form"
    ) as HTMLFormElement;
    if (form) {
      form.requestSubmit();
    }
  };

  const handleCancelClick = () => {
    if (loading) {
      toast.error("Please wait for the current verification to complete");
      return;
    }
    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !loading) {
      onClose();
    }
  };

  if (!isOpen) return null;

  // Dynamic button text based on attempt count
  const getAttemptButtonText = () => {
    if (attemptCount === 0) return "Start Quiz";
    if (attemptCount === 1) return "Try Again";
    return "Retry";
  };

  const getAttemptButtonIcon = () => {
    if (attemptCount === 0) return "play";
    return "refresh";
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-auto transform transition-all">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Lock className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Quiz Password Required
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Enter password to start the quiz
              </p>
            </div>
          </div>
          <button
            onClick={handleCancelClick}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
            disabled={loading}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form id="quiz-password-form" onSubmit={handleSubmit} className="p-6">
          {/* Quiz Info */}
          <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-medium text-blue-900 mb-1">
              Quiz: {quizTitle}
            </h3>
            <p className="text-sm text-blue-700">
              This quiz is password protected. Please enter the correct password
              to proceed.
            </p>
            {attemptCount > 0 && (
              <p className="text-xs text-blue-600 mt-2 font-medium">
                Attempt {attemptCount}{" "}
                {attemptCount > 1 ? "- Please double-check your password" : ""}
              </p>
            )}
          </div>

          {/* Password Input */}
          <div className="mb-6">
            <label
              htmlFor="quiz-password"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Quiz Password
            </label>
            <div className="relative">
              <input
                id="quiz-password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter quiz password"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all pr-12 text-gray-900 placeholder-gray-400 bg-white"
                disabled={loading}
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                disabled={loading}
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <CancelButton
              text="Cancel"
              onClick={handleCancelClick}
              disabled={loading}
              variant="outline"
              size="lg"
              showIcon={true}
              iconType="x"
              className="flex-1"
            />
            <AttemptButton
              text={getAttemptButtonText()}
              onClick={handleAttemptClick}
              disabled={loading || !password.trim()}
              loading={loading}
              variant="primary"
              size="lg"
              showIcon={true}
              iconType={getAttemptButtonIcon() as "play" | "refresh"}
              className="flex-1"
              type="button"
            />
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 pb-6">
          <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
            <strong>Note:</strong> Make sure you have a stable internet
            connection. Once you start the quiz, you cannot pause or restart it.
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizPasswordPopup;
