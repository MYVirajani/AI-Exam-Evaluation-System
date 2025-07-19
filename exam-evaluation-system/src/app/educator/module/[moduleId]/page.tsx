// app/educator/module/[moduleId]/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import LessonCreationForm, { LessonFormData } from './LessonCreationForm';
import LessonCard, { Lesson } from './LessonCard';
import { Assessment, Enrollment } from '@/generated/prisma';

interface ModuleType {
  module_id: string;
  module_code: string;
  module_name: string;
  semester: string;
  education_institute: string;
  max_enrollments: number;
  learning_outcomes?: string;
  enrollment_key?: string;
  module_image_url?: string;
  created_by: string;
  lessons: Lesson[];
  assessments: Assessment[];
  enrollments: Enrollment[];
}

export default function ModulePage({
  params,
}: {
  params: { moduleId: string };
}) {
  const { moduleId } = params;
  const [module, setModule] = useState<ModuleType | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/educator/modules/${moduleId}/lessons`);
        if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
        const json = await res.json();
        setModule(json.module);
        setLessons(json.module.lessons);
      } catch (err: any) {
        console.error('Load module error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [moduleId]);

  const handleNewLesson = async (data: LessonFormData) => {
    const form = new FormData();
    form.append('title', data.title);
    form.append('moduleId', moduleId);
    if (data.material && data.material.length > 0) {
      form.append('material', data.material[0]);
    }

    const res = await fetch(`/api/educator/modules/${moduleId}/lessons`, {
      method: 'POST',
      body: form,
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error);
    setLessons((prev) => [...prev, json.lesson]);
    setShowForm(false);
  };

  if (loading) {
    return <div className="p-8">Loading module...</div>;
  }
  if (error) {
    return <div className="p-8 text-red-600">Error: {error}</div>;
  }
  if (!module) {
    return <div className="p-8">Module not found.</div>;
  }

  return (
    <div className="px-6 py-8 space-y-6">
      <h1 className="text-2xl font-bold text-blue-900">
        {module.module_code} – {module.module_name}
      </h1>

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Lessons</h2>
        <button
          onClick={() => setShowForm(true)}
          className="px-3 py-1 bg-blue-900 text-white rounded"
        >
          + New Lesson
        </button>
      </div>

      {showForm && (
        <LessonCreationForm
          isOpen={showForm}
          onClose={() => setShowForm(false)}
          onSubmit={handleNewLesson}
        />
      )}

      {lessons.length === 0 ? (
        <p className="text-gray-600">No lessons yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {lessons.map((lesson) => (
            <LessonCard key={lesson.lesson_id} lesson={lesson} />
          ))}
        </div>
      )}
    </div>
  );
}
