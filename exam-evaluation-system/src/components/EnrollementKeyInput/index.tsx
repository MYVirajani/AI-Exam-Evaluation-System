import React, { useState } from "react";
import {
  FiKey,
  FiEye,
  FiEyeOff,
  FiRefreshCw,
  FiCopy,
  FiCheck,
} from "react-icons/fi";
import generatePassword from "generate-password";

export interface EnrollmentInputProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  helperText?: string;
  className?: string;
  id?: string;

  /** generation options */
  groups?: number;      // how many groups (e.g., 3 -> ABCD-1234-EFGH)
  groupSize?: number;   // chars per group
  allowLowercase?: boolean;
  allowUppercase?: boolean;
  allowNumbers?: boolean;
}

const EnrollmentInput: React.FC<EnrollmentInputProps> = ({
  label = "Enrollment Key",
  value,
  onChange,
  placeholder = "Enter or generate an enrollment key",
  required = false,
  helperText = "Share this key with students to join the module.",
  className = "",
  id = "enrollmentKey",
  groups = 3,
  groupSize = 4,
  allowLowercase = false,
  allowUppercase = true,
  allowNumbers = true,
}) => {
  const [show, setShow] = useState(false);
  const [copied, setCopied] = useState(false);

  const formatIntoGroups = (raw: string) => {
    const clean = raw.replace(/[^A-Za-z0-9]/g, "");
    const chunks: string[] = [];
    for (let i = 0; i < groups * groupSize; i += groupSize) {
      chunks.push(clean.slice(i, i + groupSize));
    }
    return chunks.filter(Boolean).join("-");
  };

  const generateKey = () => {
    const length = groups * groupSize;

    const raw = generatePassword.generate({
      length,
      numbers: allowNumbers,
      symbols: false,
      lowercase: allowLowercase,
      uppercase: allowUppercase,
      excludeSimilarCharacters: true, // avoid O/0, l/1, etc.
      strict: true,
    });

    // Ensure casing based on options
    const adjusted =
      allowUppercase && !allowLowercase ? raw.toUpperCase() :
      !allowUppercase && allowLowercase ? raw.toLowerCase() :
      raw;

    onChange(formatIntoGroups(adjusted));
  };

  const copyToClipboard = async () => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error("Failed to copy enrollment key:", e);
    }
  };

  return (
    <div className={className}>
      <label
        htmlFor={id}
        className="block text-sm font-semibold text-gray-800 mb-2"
      >
        <div className="flex items-center space-x-2">
          <FiKey className="h-4 w-4 text-gray-600" />
          <span>
            {label} {required && <span className="text-red-500">*</span>}
          </span>
        </div>
      </label>

      <div className="relative">
        <input
          type={show ? "text" : "password"}
          id={id}
          value={value}
          onChange={(e) => {
            // Keep user edits in the same grouped style
            const next = e.target.value.toUpperCase();
            onChange(next);
          }}
          placeholder={placeholder}
          className="w-full px-4 py-3 pr-32 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-gray-900 bg-white tracking-widest"
          required={required}
          inputMode="latin"
          autoComplete="off"
          spellCheck={false}
        />

        {/* Actions */}
        <div className="absolute inset-y-0 right-0 flex items-center space-x-1 pr-3">
          {/* Copy */}
          {value && (
            <button
              type="button"
              onClick={copyToClipboard}
              className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors rounded-md hover:bg-gray-100"
              title="Copy key"
            >
              {copied ? (
                <FiCheck className="h-4 w-4 text-green-500" />
              ) : (
                <FiCopy className="h-4 w-4" />
              )}
            </button>
          )}

          {/* Generate */}
          <button
            type="button"
            onClick={generateKey}
            className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors rounded-md hover:bg-blue-50"
            title="Generate key"
          >
            <FiRefreshCw className="h-4 w-4" />
          </button>

          {/* Toggle visibility */}
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors rounded-md hover:bg-gray-100"
            title={show ? "Hide key" : "Show key"}
          >
            {show ? <FiEyeOff className="h-4 w-4" /> : <FiEye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {helperText && (
        <p className="text-xs text-gray-500 mt-1">{helperText}</p>
      )}
      {copied && (
        <p className="text-xs text-green-600 mt-1 font-medium">
          Enrollment key copied!
        </p>
      )}
    </div>
  );
};

export default EnrollmentInput;
