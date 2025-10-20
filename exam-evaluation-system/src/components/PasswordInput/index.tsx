import React, { useState } from "react";
import { FiLock, FiEye, FiEyeOff, FiRefreshCw, FiCopy, FiCheck } from "react-icons/fi";
import generatePassword from "generate-password";

interface PasswordInputProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  helperText?: string;
  className?: string;
  id?: string;
}

const PasswordInput: React.FC<PasswordInputProps> = ({
  label = "Password",
  value,
  onChange,
  placeholder = "Enter password",
  required = false,
  helperText,
  className = "",
  id = "password",
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState(false);

  const generateRandomPassword = () => {
    const newPassword = generatePassword.generate({
      length: 12,
      numbers: true,
      symbols: false,
      lowercase: true,
      uppercase: true,
      excludeSimilarCharacters: true,
    });
    onChange(newPassword);
  };

  const copyToClipboard = async () => {
    if (value) {
      try {
        await navigator.clipboard.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error("Failed to copy password:", err);
      }
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className={className}>
      <label
        htmlFor={id}
        className="block text-sm font-semibold text-gray-800 mb-2"
      >
        <div className="flex items-center space-x-2">
          <FiLock className="h-4 w-4 text-gray-600" />
          <span>
            {label} {required && <span className="text-red-500">*</span>}
          </span>
        </div>
      </label>
      
      <div className="relative">
        <input
          type={showPassword ? "text" : "password"}
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full px-4 py-3 pr-32 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-gray-900 bg-white"
          required={required}
        />
        
        {/* Action Buttons */}
        <div className="absolute inset-y-0 right-0 flex items-center space-x-1 pr-3">
          {/* Copy Button */}
          {value && (
            <button
              type="button"
              onClick={copyToClipboard}
              className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors rounded-md hover:bg-gray-100"
              title="Copy password"
            >
              {copied ? (
                <FiCheck className="h-4 w-4 text-green-500" />
              ) : (
                <FiCopy className="h-4 w-4" />
              )}
            </button>
          )}
          
          {/* Generate Button */}
          <button
            type="button"
            onClick={generateRandomPassword}
            className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors rounded-md hover:bg-blue-50"
            title="Generate password"
          >
            <FiRefreshCw className="h-4 w-4" />
          </button>
          
          {/* Toggle Visibility Button */}
          <button
            type="button"
            onClick={togglePasswordVisibility}
            className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors rounded-md hover:bg-gray-100"
            title={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <FiEyeOff className="h-4 w-4" />
            ) : (
              <FiEye className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>
      
      {helperText && (
        <p className="text-xs text-gray-500 mt-1">{helperText}</p>
      )}
      
      {copied && (
        <p className="text-xs text-green-600 mt-1 font-medium">
          Password copied to clipboard!
        </p>
      )}
    </div>
  );
};

export default PasswordInput;