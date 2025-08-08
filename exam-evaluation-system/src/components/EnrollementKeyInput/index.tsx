"use client";
import React, { useState } from "react";
import { UseFormRegister, UseFormSetValue, UseFormTrigger, FieldErrors } from "react-hook-form";
import { FaKey, FaEye, FaEyeSlash, FaRedo, FaCopy, FaCheck } from "react-icons/fa";
import toast from "react-hot-toast";

interface EnrollmentKeyInputProps {
  register: UseFormRegister<any>;
  setValue: UseFormSetValue<any>;
  trigger: UseFormTrigger<any>;
  errors: FieldErrors<any>;
  currentValue?: string;
}

const EnrollmentKeyInput: React.FC<EnrollmentKeyInputProps> = ({
  register,
  setValue,
  trigger,
  errors,
  currentValue
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState(false);

  // Generate a random enrollment key
  const generateKey = () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const keyLength = 8;
    let result = '';
    
    for (let i = 0; i < keyLength; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    
    // Add a hyphen in the middle for better readability
    const formattedKey = `${result.slice(0, 4)}-${result.slice(4)}`;
    
    setValue("enrollmentKey", formattedKey);
    trigger("enrollmentKey");
    toast.success("Enrollment key generated!");
    
    // Reset copied state if it was previously copied
    if (copied) {
      setCopied(false);
    }
  };

  // Copy key to clipboard
  const copyToClipboard = async () => {
    if (!currentValue) return;
    
    try {
      await navigator.clipboard.writeText(currentValue);
      setCopied(true);
      toast.success("Key copied to clipboard!");
      
      // Reset copied state after 2 seconds
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (err) {
      toast.error("Failed to copy key");
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-gray-700">
        Enrollment Key
      </label>
      
      <div className="space-y-3">
        {/* Input Field */}
        <div className="relative">
          <FaKey className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            {...register("enrollmentKey", {
              minLength: {
                value: 6,
                message: "At least 6 characters recommended",
              },
              pattern: {
                value: /^[A-Z0-9-]+$/,
                message: "Only uppercase letters, numbers, and hyphens allowed",
              },
            })}
            type={showPassword ? "text" : "password"}
            placeholder="Leave blank to set later"
            className="w-full pl-12 pr-24 py-3 border-2 border-gray-200 rounded-xl text-gray-800 bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200"
          />
          
          {/* Action buttons container */}
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
            {/* Copy button - only show if there's a value */}
            {currentValue && (
              <button
                type="button"
                onClick={copyToClipboard}
                className="p-2 text-gray-400 hover:text-blue-600 transition-colors duration-200"
                title="Copy to clipboard"
              >
                {copied ? (
                  <FaCheck className="text-green-600" />
                ) : (
                  <FaCopy />
                )}
              </button>
            )}
            
            {/* Show/hide password button */}
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
              title={showPassword ? "Hide key" : "Show key"}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
        </div>

        {/* Generate Key Button */}
        <div className="flex justify-between items-center">
          <button
            type="button"
            onClick={generateKey}
            className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white text-sm font-medium rounded-lg hover:from-purple-600 hover:to-blue-600 focus:ring-4 focus:ring-purple-200 transition-all duration-200 shadow-md"
          >
            <FaRedo className="mr-2 text-sm" />
            Generate Key
          </button>
          
          {currentValue && (
            <div className="text-xs text-gray-500 bg-gray-50 px-3 py-1 rounded-md">
              Key Length: {currentValue.length} characters
            </div>
          )}
        </div>

        {/* Help text */}
        <div className="text-xs text-gray-500 bg-blue-50 p-3 rounded-lg">
          <div className="flex items-start space-x-2">
            <svg className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="font-medium text-blue-800 mb-1">About Enrollment Keys:</p>
              <ul className="text-blue-700 space-y-0.5">
                <li>• Students need this key to join your module</li>
                <li>• Leave blank if you want to set it later</li>
                <li>• Generated keys use uppercase letters and numbers for clarity</li>
                <li>• You can share this key with your students via email or announcements</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Error message */}
      {errors.enrollmentKey && (
        <p className="text-blue-600 text-sm flex items-center mt-1">
          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {errors.enrollmentKey.message}
        </p>
      )}
    </div>
  );
};

export default EnrollmentKeyInput;