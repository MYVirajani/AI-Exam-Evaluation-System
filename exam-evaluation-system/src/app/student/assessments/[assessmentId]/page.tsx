'use client';

import { useSearchParams, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

interface AssessmentData {
  assessment_id: string;
  type: string;
  title: string;
  description: string;
  deadline: string;
}

interface Paper {
  file_url: string;
  created_on: string;
}

interface Submission {
  submission_id: string;
  file_url: string;
  submission_time: string;
}

interface Graded {
  grade_id: string;
  total_marks: number;
  marks_awarded: number;
  feedback: string;
  grading_time: string;
  auto_graded: boolean;
}

interface AssessmentResponse {
  module_code: string;
  module_name: string;
  assessment_data: AssessmentData;
  question_paper: Paper | null;
  submission: Submission | null;
  graded: Graded | null;
}

export default function StudentAssessmentPage() {
  const params = useParams();
  const searchParams = useSearchParams();

  const moduleId = searchParams.get('moduleId') ?? '';
  console.log('moduleId: ', moduleId);
  const assessmentId = params.assessmentId as string;

  // Extract five search params - customize names if needed
  const studentId = searchParams.get('studentId') ?? '';

  const [assessment, setAssessment] = useState<AssessmentResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!moduleId || !assessmentId) {
      setError('Missing moduleId or assessmentId');
      setLoading(false);
      return;
    }

    const fetchAssessment = async () => {
      setLoading(true);
      setError(null);
      try {
        // Build query string with all five params
        const queryParams = new URLSearchParams({
          studentId,
          moduleId
        });

        const url = `/api/student/enrollments/${moduleId}/assessment/${assessmentId}?${queryParams.toString()}`;

        const res = await fetch(url);
        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.message || 'Failed to fetch assessment');
        }

        const data: AssessmentResponse = await res.json();
        setAssessment(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchAssessment();
  }, [moduleId, assessmentId, studentId]);

  if (loading) return <div className="p-6">Loading assessment...</div>;
  if (error) return <div className="p-6 text-red-600">Error: {error}</div>;
  if (!assessment)
    return <div className="p-6">No assessment data available.</div>;

  return (
    <main className="p-6 max-w-3xl mx-auto">
      {/* Module Info */}
      <h1 className="text-3xl font-bold mb-2">
        {assessment.module_code} - {assessment.module_name}
      </h1>

      {/* Assessment Info */}
      <section className="mt-4 p-4 border rounded shadow bg-white">
        <h2 className="text-2xl font-semibold mb-2">
          {assessment.assessment_data.title}
        </h2>
        <p className="mb-1">
          <strong>Type:</strong> {assessment.assessment_data.type}
        </p>
        {assessment.assessment_data.description && (
          <p className="mb-2">{assessment.assessment_data.description}</p>
        )}
        <p className="mb-2 text-sm text-gray-600">
          Deadline:{' '}
          {new Date(assessment.assessment_data.deadline).toLocaleString()}
        </p>

        {/* Question Paper */}
        {assessment.question_paper && (
          <p className="mb-2">
            📘{' '}
            <a
              href={assessment.question_paper.file_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline"
            >
              View Question Paper
            </a>{' '}
            (Uploaded: {new Date(assessment.question_paper.created_on).toLocaleDateString()})
          </p>
        )}

    

        {/* Submission */}
        {assessment.submission ? (
          <p className="mb-2">
            📝{' '}
            <a
              href={assessment.submission.file_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-600 underline"
            >
              View Your Submission
            </a>{' '}
            (Submitted: {new Date(assessment.submission.submission_time).toLocaleString()})
          </p>
        ) : (
          <p className="mb-2 text-gray-500">You have not submitted yet.</p>
        )}

        {/* Grading Info */}
        {assessment.graded ? (
          <div className="mt-4 p-3 border rounded bg-gray-100">
            <h3 className="font-semibold mb-1">Grading</h3>
            <p>
              Marks Awarded: {assessment.graded.marks_awarded} /{' '}
              {assessment.graded.total_marks}
            </p>
            <p>Feedback: {assessment.graded.feedback || 'No feedback'}</p>
            <p>
              Graded on:{' '}
              {new Date(assessment.graded.grading_time).toLocaleString()}
            </p>
            <p>
              Auto Graded:{' '}
              {assessment.graded.auto_graded ? 'Yes' : 'No'}
            </p>
          </div>
        ) : (
          <p className="mt-4 text-gray-600">Not graded yet.</p>
        )}
      </section>
    </main>
  );
}
