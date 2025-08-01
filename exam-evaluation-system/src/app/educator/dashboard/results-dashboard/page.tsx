// 'use client'
// import React, { useEffect, useState } from 'react';
// import TabButton from './TabButton';
// import ResultsChart from './ResultsChart';
// import ResultsTable from './ResultsTable';
// import GradedAnswersTable from './GradedAnswersTable';
// import { GradedAnswer, Result } from './types';

// const StudentResultsDashboard = () => {
//   const [results, setResults] = useState<Result[]>([]);
//   const [gradedAnswers, setGradedAnswers] = useState<GradedAnswer[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [activeTab, setActiveTab] = useState<'results' | 'graded'>('results');

//   useEffect(() => {
//     Promise.all([
//       fetch('/data/student_paper_results_gemini-new2.json').then(res => res.json()),
//       fetch('/data/graded_student_answers_gemini-new.json').then(res => res.json())
//     ])
//       .then(([resultsData, gradedData]) => {
//         setResults(Array.isArray(resultsData) ? resultsData : [resultsData]);
//         setGradedAnswers(Array.isArray(gradedData) ? gradedData : [gradedData]);
//         setLoading(false);
//       })
//       .catch((err) => {
//         setError(err.message);
//         setLoading(false);
//       });
//   }, []);

//   if (loading) return <p className="text-center mt-10 text-gray-700">Loading...</p>;
//   if (error) return <p className="text-center mt-10 text-red-600">Error: {error}</p>;

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
//       <div className="max-w-7xl mx-auto p-6">
//         <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
//           <h1 className="text-4xl font-bold mb-8 text-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
//             Student Results Dashboard
//           </h1>

//           <div className="flex mb-8 bg-gray-100 rounded-lg p-1">
//             <TabButton tabId="results" label="Results Summary" isActive={activeTab === 'results'} onClick={setActiveTab} />
//             <TabButton tabId="graded" label="Detailed Graded Answers" isActive={activeTab === 'graded'} onClick={setActiveTab} />
//           </div>

//           <div className="tab-content space-y-10">
//             {activeTab === 'results' && (
//               <>
//                 <ResultsChart results={results} />
//                 <ResultsTable results={results} />
//               </>
//             )}
//             {activeTab === 'graded' && <GradedAnswersTable gradedAnswers={gradedAnswers} />}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default StudentResultsDashboard;


// 'use client'
// import React, { useEffect, useState } from 'react';
// import TabButton from './TabButton';
// import ResultsChart from './ResultsChart';
// import ResultsTable from './ResultsTable';
// import GradedAnswersTable from './GradedAnswersTable';
// import { GradedAnswer, Result } from './types';

// const StudentResultsDashboard = () => {
//   const [results, setResults] = useState<Result[]>([]);
//   const [gradedAnswers, setGradedAnswers] = useState<GradedAnswer[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [activeTab, setActiveTab] = useState<'results' | 'graded'>('results');

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         setLoading(true);
        
//         // Fetch data from API routes instead of JSON files
//         const [resultsResponse, gradedAnswersResponse] = await Promise.all([
//           fetch('/api/results', {
//             headers: {
//               'Content-Type': 'application/json',
//             },
//           }),
//           fetch('/api/graded-answers', {
//             headers: {
//               'Content-Type': 'application/json',
//             },
//           })
//         ]);

//         if (!resultsResponse.ok) {
//           throw new Error(`Results API error: ${resultsResponse.status}`);
//         }

//         if (!gradedAnswersResponse.ok) {
//           throw new Error(`Graded answers API error: ${gradedAnswersResponse.status}`);
//         }

//         const resultsData = await resultsResponse.json();
//         const gradedAnswersData = await gradedAnswersResponse.json();

//         setResults(Array.isArray(resultsData) ? resultsData : []);
//         setGradedAnswers(Array.isArray(gradedAnswersData) ? gradedAnswersData : []);
        
//       } catch (err) {
//         console.error('Error fetching data:', err);
//         setError(err instanceof Error ? err.message : 'Failed to fetch data');
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchData();
//   }, []);

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
//         <div className="max-w-7xl mx-auto p-6">
//           <div className="bg-white rounded-xl shadow-lg p-8">
//             <div className="flex items-center justify-center space-x-2">
//               <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
//               <p className="text-gray-700">Loading dashboard...</p>
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
//         <div className="max-w-7xl mx-auto p-6">
//           <div className="bg-white rounded-xl shadow-lg p-8">
//             <div className="text-center">
//               <div className="text-red-600 mb-2">
//                 <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
//                 </svg>
//               </div>
//               <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Data</h3>
//               <p className="text-gray-600 mb-4">{error}</p>
//               <button 
//                 onClick={() => window.location.reload()} 
//                 className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
//               >
//                 Retry
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
//       <div className="max-w-7xl mx-auto p-6">
//         <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
//           <h1 className="text-4xl font-bold mb-8 text-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
//             Student Results Dashboard
//           </h1>

//           {/* Data Summary */}
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 p-4 bg-gray-50 rounded-lg">
//             <div className="text-center">
//               <div className="text-2xl font-bold text-blue-600">{results.length}</div>
//               <div className="text-sm text-gray-600">Total Results</div>
//             </div>
//             <div className="text-center">
//               <div className="text-2xl font-bold text-purple-600">{gradedAnswers.length}</div>
//               <div className="text-sm text-gray-600">Graded Answers</div>
//             </div>
//           </div>

//           <div className="flex mb-8 bg-gray-100 rounded-lg p-1">
//             <TabButton 
//               tabId="results" 
//               label="Results Summary" 
//               isActive={activeTab === 'results'} 
//               onClick={setActiveTab} 
//             />
//             <TabButton 
//               tabId="graded" 
//               label="Detailed Graded Answers" 
//               isActive={activeTab === 'graded'} 
//               onClick={setActiveTab} 
//             />
//           </div>

//           <div className="tab-content space-y-10">
//             {activeTab === 'results' && (
//               <>
//                 <ResultsChart results={results} />
//                 <ResultsTable results={results} />
//               </>
//             )}
//             {activeTab === 'graded' && (
//               <GradedAnswersTable gradedAnswers={gradedAnswers} />
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default StudentResultsDashboard;

'use client'
import React, { useEffect, useState } from 'react';
import TabButton from './TabButton';
import ResultsChart from './ResultsChart';
import ResultsTable from './ResultsTable';
import GradedAnswersTable from './GradedAnswersTable';
import { GradedAnswer, Result } from './types';

type ModelType = 'chatgpt' | 'gemini';

const StudentResultsDashboard = () => {
  const [results, setResults] = useState<Result[]>([]);
  const [gradedAnswers, setGradedAnswers] = useState<GradedAnswer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'results' | 'graded'>('results');
  const [selectedModel, setSelectedModel] = useState<ModelType>('chatgpt');

  const fetchData = async (model: ModelType) => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch data from different API routes based on selected model
      const [resultsResponse, gradedAnswersResponse] = await Promise.all([
        fetch(`/api/results/${model}`, {
          headers: {
            'Content-Type': 'application/json',
          },
        }),
        fetch(`/api/graded-answers/${model}`, {
          headers: {
            'Content-Type': 'application/json',
          },
        })
      ]);

      if (!resultsResponse.ok) {
        throw new Error(`Results API error for ${model}: ${resultsResponse.status}`);
      }

      if (!gradedAnswersResponse.ok) {
        throw new Error(`Graded answers API error for ${model}: ${gradedAnswersResponse.status}`);
      }

      const resultsData = await resultsResponse.json();
      const gradedAnswersData = await gradedAnswersResponse.json();

      setResults(Array.isArray(resultsData) ? resultsData : []);
      setGradedAnswers(Array.isArray(gradedAnswersData) ? gradedAnswersData : []);
      
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(selectedModel);
  }, [selectedModel]);

  const handleModelChange = (model: ModelType) => {
    setSelectedModel(model);
  };

  const getModelDisplayName = (model: ModelType) => {
    switch (model) {
      case 'chatgpt':
        return 'ChatGPT';
      case 'gemini':
        return 'Gemini';
      default:
        return model;
    }
  };

  const getModelIcon = (model: ModelType) => {
    switch (model) {
      case 'chatgpt':
        return (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142-.0852 4.783-2.7582a.7712.7712 0 0 0 .7806 0l5.8428 3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364 15.1192 7.2a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.667zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997Z"/>
          </svg>
        );
      case 'gemini':
        return (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0L8.485 3.515L12 7.03l3.515-3.515L12 0zM0 12l3.515-3.515L7.03 12l-3.515 3.515L0 12zm24 0l-3.515-3.515L16.97 12l3.515 3.515L24 12zM12 24l3.515-3.515L12 16.97l-3.515 3.515L12 24z"/>
          </svg>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
        <div className="max-w-7xl mx-auto p-6">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <p className="text-gray-700">Loading dashboard for {getModelDisplayName(selectedModel)}...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
        <div className="max-w-7xl mx-auto p-6">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="text-center">
              <div className="text-red-600 mb-2">
                <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Data</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <button 
                onClick={() => fetchData(selectedModel)} 
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
            <h1 className="text-4xl font-bold mb-4 lg:mb-0 text-center lg:text-left bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Student Results Dashboard
            </h1>
            
            {/* Model Selector */}
            <div className="flex justify-center lg:justify-end">
              <div className="bg-gray-100 rounded-lg p-1">
                <div className="flex space-x-1">
                  {(['chatgpt', 'gemini'] as ModelType[]).map((model) => (
                    <button
                      key={model}
                      onClick={() => handleModelChange(model)}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-md font-medium text-sm transition-all ${
                        selectedModel === model
                          ? 'bg-white text-gray-900 shadow-sm'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
                      }`}
                    >
                      {getModelIcon(model)}
                      <span>{getModelDisplayName(model)}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Model Status Indicator */}
          <div className="mb-6">
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-600 bg-gray-50 rounded-lg py-2 px-4">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>Currently showing results from</span>
                <span className="font-semibold text-gray-900 flex items-center space-x-1">
                  {getModelIcon(selectedModel)}
                  <span>{getModelDisplayName(selectedModel)}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Data Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 p-4 bg-gray-50 rounded-lg">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{results.length}</div>
              <div className="text-sm text-gray-600">Total Results ({getModelDisplayName(selectedModel)})</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{gradedAnswers.length}</div>
              <div className="text-sm text-gray-600">Graded Answers ({getModelDisplayName(selectedModel)})</div>
            </div>
          </div>

          <div className="flex mb-8 bg-gray-100 rounded-lg p-1">
            <TabButton 
              tabId="results" 
              label="Results Summary" 
              isActive={activeTab === 'results'} 
              onClick={setActiveTab} 
            />
            <TabButton 
              tabId="graded" 
              label="Detailed Graded Answers" 
              isActive={activeTab === 'graded'} 
              onClick={setActiveTab} 
            />
          </div>

          <div className="tab-content space-y-10">
            {activeTab === 'results' && (
              <>
                <ResultsChart results={results} />
                <ResultsTable results={results} />
              </>
            )}
            {activeTab === 'graded' && (
              <GradedAnswersTable gradedAnswers={gradedAnswers} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentResultsDashboard;