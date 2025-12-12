'use client';

import { useEffect, useState } from 'react';

interface Assessment {
  assessment_id: string;
  title: string;
  type: string;
  description: string;
  deadline: string;
}

interface Module {
  module_id: string;
  module_code: string;
  module_name: string;
  semester: string;
  education_institute: string;
  module_image_url: string;
  assessments: Assessment[];
}

const StudentAssessmentPage = () => {
  const [modules, setModules] = useState<Module[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    // Read userId from localStorage when component mounts
    const storedUserId = localStorage.getItem('user_id');
    console.log('Loaded user_id from localStorage:', storedUserId);
    if (!storedUserId) {
      setError('User ID not found in localStorage');
      return;
    }
    setUserId(storedUserId);
  }, []);

  useEffect(() => {
    const fetchAssessments = async () => {
      try {
        if (!userId) {
          console.error('No user_id available to fetch data');
          return;
        }

        console.log('Fetching assessments for user_id:', userId);

        const url = `/api/student/enrollments/by-assessment/${userId}?user_id=${userId}`;
        console.log('Request URL:', url);

        const res = await fetch(url);
        console.log('Fetch response status:', res.status);

        const data = await res.json();
        console.log('Fetched data:', data);

        if (!res.ok) {
          console.error('API error response:', data.error);
          setError(data.error || 'Something went wrong');
          return;
        }

        setModules(data.modules);
        console.log('Modules set in state:', data.modules);
      } catch (err) {
        console.error('Fetch error:', err);
        setError('Failed to fetch data');
      }
    };

    if (userId) {
      fetchAssessments();
    }
  }, [userId]);

  if (error) {
    console.warn('Rendering error message:', error);
    return <div className="text-red-500">Error: {error}</div>;
  }

  if (!modules.length) {
    console.log('No modules yet, showing loading state');
    return <div>Loading assessments...</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">My Assessments</h1>
      {modules.map((mod) => (
        <div key={mod.module_id} className="mb-6 border rounded-lg p-4 shadow">
          <h2 className="text-xl font-semibold mb-2">
            {mod.module_name} ({mod.module_code})
          </h2>
          <p className="text-sm text-gray-600 mb-2">
            Semester: {mod.semester} 
          </p>

          {mod.assessments.length === 0 ? (
            <p className="text-gray-500">No assessments available.</p>
          ) : (
            <ul className="space-y-2">
              {mod.assessments.map((a) => (
                <li key={a.assessment_id} className="p-3 border rounded bg-gray-50">
                  <h3 className="text-lg font-medium">{a.title}</h3>
                  <p className="text-sm text-gray-700">Type: {a.type}</p>
                  <p className="text-sm text-gray-700">{a.description}</p>
                  <p className="text-sm text-gray-600">
                    Deadline: {new Date(a.deadline).toLocaleString()}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
};

export default StudentAssessmentPage;
