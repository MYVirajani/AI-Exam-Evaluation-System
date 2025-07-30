'use client'
import React, { useEffect, useState } from 'react';
import TabButton from './TabButton';
import ResultsChart from './ResultsChart';
import ResultsTable from './ResultsTable';
import GradedAnswersTable from './GradedAnswersTable';
import { GradedAnswer, Result } from './types';

const StudentResultsDashboard = () => {
  const [results, setResults] = useState<Result[]>([]);
  const [gradedAnswers, setGradedAnswers] = useState<GradedAnswer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'results' | 'graded'>('results');

  useEffect(() => {
    Promise.all([
      fetch('/data/student_paper_results_gemini-new2.json').then(res => res.json()),
      fetch('/data/graded_student_answers_gemini-new.json').then(res => res.json())
    ])
      .then(([resultsData, gradedData]) => {
        setResults(Array.isArray(resultsData) ? resultsData : [resultsData]);
        setGradedAnswers(Array.isArray(gradedData) ? gradedData : [gradedData]);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <p className="text-center mt-10 text-gray-700">Loading...</p>;
  if (error) return <p className="text-center mt-10 text-red-600">Error: {error}</p>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h1 className="text-4xl font-bold mb-8 text-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Student Results Dashboard
          </h1>

          <div className="flex mb-8 bg-gray-100 rounded-lg p-1">
            <TabButton tabId="results" label="Results Summary" isActive={activeTab === 'results'} onClick={setActiveTab} />
            <TabButton tabId="graded" label="Detailed Graded Answers" isActive={activeTab === 'graded'} onClick={setActiveTab} />
          </div>

          <div className="tab-content space-y-10">
            {activeTab === 'results' && (
              <>
                <ResultsChart results={results} />
                <ResultsTable results={results} />
              </>
            )}
            {activeTab === 'graded' && <GradedAnswersTable gradedAnswers={gradedAnswers} />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentResultsDashboard;
