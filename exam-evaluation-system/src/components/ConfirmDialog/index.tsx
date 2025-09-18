"use client";

import React, { useState, useEffect } from "react";
import { AlertTriangle, X } from "lucide-react";
import Button from "@/components/Button";

interface ConfirmDialogProps {
  isOpen: boolean;
  title?: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  variant?: 'primary' | 'destructive' | 'success' | 'secondary';
  icon?: React.ReactNode;
  loading?: boolean;
}

export default function ConfirmDialog({
  isOpen,
  title = "Confirm Action",
  message,
  onConfirm,
  onCancel,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = 'primary',
  icon,
  loading = false,
}: ConfirmDialogProps) {
  const [isMounted, setIsMounted] = useState(false);

  // Ensure component only renders on client side
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCancel();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, isMounted, onCancel]);

  // Don't render anything until mounted on client
  if (!isMounted || !isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onCancel();
    }
  };

  const getIconColor = () => {
    switch (variant) {
      case 'destructive':
        return 'text-red-600';
      case 'success':
        return 'text-green-600';
      case 'secondary':
        return 'text-gray-600';
      default:
        return 'text-blue-600';
    }
  };

  const getIconBgColor = () => {
    switch (variant) {
      case 'destructive':
        return 'bg-red-50 border-red-200';
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'secondary':
        return 'bg-gray-50 border-gray-200';
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  const defaultIcon = <AlertTriangle className="w-6 h-6" />;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-md transform animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-4">
            {/* Icon */}
            <div className={`w-12 h-12 rounded-xl border-2 flex items-center justify-center ${getIconBgColor()}`}>
              <div className={getIconColor()}>
                {icon || defaultIcon}
              </div>
            </div>
            
            {/* Title */}
            <div>
              <h3 className="text-lg font-bold text-gray-900">{title}</h3>
              <p className="text-sm text-gray-500">Please confirm your action</p>
            </div>
          </div>
          
          {/* Close button */}
          <button
            onClick={onCancel}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            disabled={loading}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="text-gray-700 leading-relaxed whitespace-pre-line">
            {message}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 p-6 pt-0">
          <Button
            onClick={onCancel}
            variant="outline"
            size="md"
            disabled={loading}
            className="min-w-[80px]"
          >
            {cancelText}
          </Button>
          
          <Button
            onClick={onConfirm}
            variant={variant}
            size="md"
            loading={loading}
            className="min-w-[100px]"
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
}