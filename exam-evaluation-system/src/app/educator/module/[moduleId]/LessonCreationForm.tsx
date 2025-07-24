'use client';

import React from 'react';
import { Dialog } from '@headlessui/react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { FaBook } from 'react-icons/fa';

export interface LessonFormData {
  title: string;
  material?: FileList;
}

interface LessonCreationFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: LessonFormData) => Promise<void>;
}

export default function LessonCreationForm({
  isOpen,
  onClose,
  onSubmit,
}: LessonCreationFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<LessonFormData>();

  const submit = async (data: LessonFormData) => {
    try {
      await onSubmit(data);
      toast.success('Lesson created!');
      reset();
      onClose();
    } catch (e: any) {
      toast.error(e.message || 'Failed to create lesson');
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onClose={onClose} className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <Dialog.Panel className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <Dialog.Title className="text-xl font-bold text-blue-900 mb-4">New Lesson</Dialog.Title>
        <form onSubmit={handleSubmit(submit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Lesson Title <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <FaBook className="absolute left-3 top-3 text-gray-500" />
              <input
                {...register('title', { required: 'Title is required' })}
                className={`w-full pl-10 pr-3 py-2 border rounded-md text-gray-800 ${
                  errors.title ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="e.g., Introduction to AI"
              />
            </div>
            {errors.title && <p className="text-red-600 text-sm mt-1">{errors.title.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Material (optional)
            </label>
            <input
              type="file"
              accept=".pdf,.doc,.ppt,.pptx"
              {...register('material')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-800"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-900 text-white rounded-md hover:bg-blue-800"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Create Lesson'}
            </button>
          </div>
        </form>
      </Dialog.Panel>
    </Dialog>
  );
}
