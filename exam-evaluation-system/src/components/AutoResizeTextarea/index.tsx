"use client";

import React, { useEffect, useRef, TextareaHTMLAttributes } from "react";

interface AutoResizeTextareaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  value: string;
  minHeight?: number;
}

const AutoResizeTextarea = React.forwardRef<
  HTMLTextAreaElement,
  AutoResizeTextareaProps
>(({ value, minHeight = 100, ...props }, ref) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Combine refs so both the forwarded ref and our local ref work
  React.useImperativeHandle(ref, () => textareaRef.current as HTMLTextAreaElement);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.max(
        textarea.scrollHeight,
        minHeight
      )}px`;
    }
  }, [value, minHeight]);

  return (
    <textarea
      ref={textareaRef}
      value={value}
      {...props}
      style={{ height: "auto", minHeight: `${minHeight}px` }}
      className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none text-gray-900 bg-white overflow-hidden ${props.className}`}
    />
  );
});

AutoResizeTextarea.displayName = "AutoResizeTextarea";

export default AutoResizeTextarea;