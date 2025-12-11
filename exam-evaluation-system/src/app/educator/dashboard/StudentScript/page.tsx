import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save, Edit3, Check, X, User, BookOpen, Calendar, Award, AlertCircle } from 'lucide-react';
import LoadingAnimation from '@/components/LoadingAnimation';

// Types
interface StudentAnswer {
  id: string;
  question_number: number;
  question_text: string;
  student_answer: string;
  marks_obtained: number;
  max_marks: number;
  feedback?: string;
}

interface StudentDetails {
  student_index: string;
  module_code: string;
  exam_year: number;
  exam_month: string;
  total_marks: number;
  total_possible: number;
  graded_at: string;
}

interface StudentScriptViewerProps {
  studentId?: string;
  moduleCode?: string;
  examYear?: number;
  examMonth?: string;
  onBack?: () => void;
}

const StudentScriptViewer: React.FC<StudentScriptViewerProps> = ({
  studentId = 'EG/2020/4044',
  moduleCode = 'EE3350',
  examYear = 2025,
  examMonth = 'June',
  onBack
}) => {
  const [studentDetails, setStudentDetails] = useState<StudentDetails | null>(null);
  const [answers, setAnswers] = useState<StudentAnswer[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingQuestion, setEditingQuestion] = useState<number | null>(null);
  const [tempMark, setTempMark] = useState<string>('');
  const [unsavedChanges, setUnsavedChanges] = useState(false);

  // Sample data - replace with actual API calls
  const sampleStudentDetails: StudentDetails = {
    student_index: studentId,
    module_code: moduleCode,
    exam_year: examYear,
    exam_month: examMonth,
    total_marks: 65.5,
    total_possible: 100,
    graded_at: '2025-07-31T04:12:53Z'
  };

  const sampleAnswers: StudentAnswer[] = [
    {
      id: '1',
      question_number: 1,
      question_text: 'Explain the fundamental principles of Kirchhoff\'s laws and derive the current law with a suitable circuit example.',
      student_answer: 'Kirchhoff\'s laws are fundamental principles in electrical circuit analysis. The first law, known as Kirchhoff\'s Current Law (KCL), states that the algebraic sum of currents entering a node equals the sum of currents leaving that node. This is based on the principle of conservation of charge.\n\nMathematically, ΣI_in = ΣI_out or ΣI = 0 at any node.\n\nFor example, consider a node where three currents meet: I1 entering the node, I2 and I3 leaving the node. According to KCL: I1 = I2 + I3\n\nThe second law, Kirchhoff\'s Voltage Law (KVL), states that the algebraic sum of voltages around any closed loop in a circuit equals zero.',
      marks_obtained: 18,
      max_marks: 20,
      feedback: 'Good explanation of KCL with proper mathematical representation and example.'
    },
    {
      id: '2',
      question_number: 2,
      question_text: 'Analyze the given RLC circuit and determine the resonant frequency. Draw the frequency response curve.',
      student_answer: 'For an RLC circuit, resonance occurs when the inductive reactance equals the capacitive reactance.\n\nAt resonance: XL = XC\n2πfL = 1/(2πfC)\n\nSolving for resonant frequency:\nf₀ = 1/(2π√LC)\n\nAt this frequency, the impedance is minimum and equals the resistance R. The circuit behaves as a pure resistive circuit.\n\nThe frequency response shows that at resonance, the current is maximum and the phase angle is zero.',
      marks_obtained: 15,
      max_marks: 25,
      feedback: 'Correct formula and concept. Missing the frequency response curve drawing.'
    },
    {
      id: '3',
      question_number: 3,
      question_text: 'Design a low-pass filter with a cutoff frequency of 1kHz using RC components. Calculate the required values.',
      student_answer: 'A low-pass RC filter consists of a resistor and capacitor in series, with output taken across the capacitor.\n\nThe cutoff frequency is given by:\nfc = 1/(2πRC)\n\nGiven fc = 1kHz = 1000 Hz\n\nChoosing R = 1kΩ:\nC = 1/(2π × 1000 × 1000) = 1/(2π × 10⁶) ≈ 0.159 μF\n\nAlternatively, choosing C = 0.1 μF:\nR = 1/(2π × 1000 × 0.1 × 10⁻⁶) ≈ 1.59 kΩ',
      marks_obtained: 22,
      max_marks: 25,
      feedback: 'Excellent work! Correct calculations and provided alternative solutions.'
    },
    {
      id: '4',
      question_number: 4,
      question_text: 'Explain the working principle of operational amplifiers and analyze an inverting amplifier configuration.',
      student_answer: 'An operational amplifier is a high-gain differential amplifier with very high input impedance and very low output impedance.\n\nKey characteristics:\n- Very high open-loop gain (typically 10⁵ to 10⁶)\n- Very high input impedance (MΩ range)\n- Very low output impedance (few ohms)\n\nFor an inverting amplifier:\n- Input signal is applied to the inverting terminal through a resistor Rf\n- Non-inverting terminal is grounded\n- Feedback resistor Rf connects output to inverting input\n\nVoltage gain = -Rf/Rin',
      marks_obtained: 10.5,
      max_marks: 30,
      feedback: 'Basic understanding shown but analysis is incomplete. Missing detailed circuit analysis and derivation.'
    }
  ];

  useEffect(() => {
    fetchStudentData();
  }, [studentId, moduleCode, examYear, examMonth]);

  const fetchStudentData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Replace with actual API calls
      // const detailsResponse = await fetch(`/api/student-details/${studentId}/${moduleCode}/${examYear}/${examMonth}`);
      // const answersResponse = await fetch(`/api/student-answers/${studentId}/${moduleCode}/${examYear}/${examMonth}`);
      
      // Simulating API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setStudentDetails(sampleStudentDetails);
      setAnswers(sampleAnswers);
    } catch (err) {
      setError('Failed to fetch student data');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (questionNumber: number, currentMark: number) => {
    setEditingQuestion(questionNumber);
    setTempMark(currentMark.toString());
  };

  const handleSaveMark = async (questionId: string, questionNumber: number) => {
    const newMark = parseFloat(tempMark);
    const question = answers.find(q => q.question_number === questionNumber);
    
    if (!question) return;
    
    if (isNaN(newMark) || newMark < 0 || newMark > question.max_marks) {
      alert(`Please enter a valid mark between 0 and ${question.max_marks}`);
      return;
    }

    try {
      // Replace with actual API call
      // await fetch(`/api/update-mark/${questionId}`, {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ marks_obtained: newMark })
      // });

      // Update local state
      setAnswers(prev => prev.map(answer => 
        answer.question_number === questionNumber 
          ? { ...answer, marks_obtained: newMark }
          : answer
      ));
      
      // Update total marks
      if (studentDetails) {
        const oldMark = question.marks_obtained;
        const newTotal = studentDetails.total_marks - oldMark + newMark;
        setStudentDetails(prev => prev ? { ...prev, total_marks: newTotal } : null);
      }

      setEditingQuestion(null);
      setTempMark('');
      setUnsavedChanges(true);
      
    } catch (err) {
      alert('Failed to update mark');
      console.error('Error updating mark:', err);
    }
  };

  const handleCancelEdit = () => {
    setEditingQuestion(null);
    setTempMark('');
  };

  const handleSaveAll = async () => {
    try {
      setSaving(true);
      
      // Replace with actual API call to save all changes
      // await fetch(`/api/save-all-marks/${studentId}/${moduleCode}/${examYear}/${examMonth}`, {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ answers })
      // });

      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setUnsavedChanges(false);
      alert('All changes saved successfully!');
      
    } catch (err) {
      alert('Failed to save changes');
      console.error('Error saving:', err);
    } finally {
      setSaving(false);
    }
  };

  const calculatePercentage = (marks: number, total: number) => {
    return ((marks / total) * 100).toFixed(1);
  };

  const getGradeColor = (percentage: number) => {
    if (percentage >= 90) return 'text-green-600 bg-green-50';
    if (percentage >= 80) return 'text-blue-600 bg-blue-50';
    if (percentage >= 70) return 'text-yellow-600 bg-yellow-50';
    if (percentage >= 60) return 'text-orange-600 bg-orange-50';
    return 'text-red-600 bg-red-50';
  };

  // if (loading) {
  //   return (
  //     <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
  //       <div className="bg-white rounded-xl shadow-lg p-8 text-center">
  //         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
  //         <p className="text-gray-600">Loading student answer script...</p>
  //       </div>
  //     </div>
  //   );
  // }

   if (loading) {
    return (
      <LoadingAnimation
        size="md"
        variant="wave"
        text="Loading student answer script..."
        fullScreen={true}
        color="blue"
      />
    );
  }

  

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Data</h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <button 
            onClick={fetchStudentData}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!studentDetails) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <p className="text-gray-600">Student data not found</p>
        </div>
      </div>
    );
  }

  const totalPercentage = parseFloat(calculatePercentage(studentDetails.total_marks, studentDetails.total_possible));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={onBack}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Results</span>
              </button>
              
              <div className="h-6 w-px bg-gray-300"></div>
              
              <h1 className="text-2xl font-bold text-gray-900">
                Answer Script Viewer & Editor
              </h1>
            </div>

            <div className="flex items-center space-x-4">
              {unsavedChanges && (
                <div className="flex items-center space-x-2 text-orange-600 bg-orange-50 px-3 py-2 rounded-lg">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm">Unsaved changes</span>
                </div>
              )}
              
              <button
                onClick={handleSaveAll}
                disabled={saving || !unsavedChanges}
                className="flex items-center space-x-2 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Saving...' : 'Save All Changes'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Student Info Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-100 rounded-lg p-2">
                <User className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Student Index</p>
                <p className="font-semibold text-gray-900">{studentDetails.student_index}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="bg-purple-100 rounded-lg p-2">
                <BookOpen className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Module</p>
                <p className="font-semibold text-gray-900">{studentDetails.module_code}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="bg-green-100 rounded-lg p-2">
                <Calendar className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Exam Period</p>
                <p className="font-semibold text-gray-900">{studentDetails.exam_month} {studentDetails.exam_year}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="bg-yellow-100 rounded-lg p-2">
                <Award className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Score</p>
                <div className="flex items-center space-x-2">
                  <p className="font-semibold text-gray-900">
                    {studentDetails.total_marks}/{studentDetails.total_possible}
                  </p>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getGradeColor(totalPercentage)}`}>
                    {totalPercentage}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-12 gap-6">
          {/* Left Column - Student Answers */}
          <div className="col-span-12 lg:col-span-9">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 rounded-t-xl">
                <h2 className="text-xl font-semibold">Student Answers</h2>
              </div>
              
              <div className="p-6 space-y-8">
                {answers.map((answer) => (
                  <div key={answer.id} className="border-b border-gray-100 pb-8 last:border-b-0">
                    <div className="mb-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Question {answer.question_number}
                      </h3>
                      <p className="text-gray-700 bg-gray-50 p-4 rounded-lg border-l-4 border-blue-400">
                        {answer.question_text}
                      </p>
                    </div>
                    
                    <div className="mb-4">
                      <h4 className="font-medium text-gray-800 mb-2">Student Answer:</h4>
                      <div className="bg-white border border-gray-200 rounded-lg p-4">
                        <pre className="whitespace-pre-wrap text-gray-700 font-sans leading-relaxed">
                          {answer.student_answer}
                        </pre>
                      </div>
                    </div>

                    {answer.feedback && (
                      <div className="mb-4">
                        <h4 className="font-medium text-gray-800 mb-2">Feedback:</h4>
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 border-l-4 border-l-yellow-400">
                          <p className="text-gray-700">{answer.feedback}</p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Marks */}
          <div className="col-span-12 lg:col-span-3">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 sticky top-24">
              <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-4 rounded-t-xl">
                <h2 className="text-lg font-semibold">Marks</h2>
              </div>
              
              <div className="p-4 space-y-4">
                {answers.map((answer) => (
                  <div key={answer.id} className="border border-gray-200 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-700">Q{answer.question_number}</span>
                      <span className="text-xs text-gray-500">/{answer.max_marks}</span>
                    </div>
                    
                    {editingQuestion === answer.question_number ? (
                      <div className="space-y-2">
                        <input
                          type="number"
                          value={tempMark}
                          onChange={(e) => setTempMark(e.target.value)}
                          min={0}
                          max={answer.max_marks}
                          step={0.5}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          autoFocus
                        />
                        <div className="flex space-x-1">
                          <button
                            onClick={() => handleSaveMark(answer.id, answer.question_number)}
                            className="flex-1 bg-green-600 text-white px-2 py-1 rounded text-xs hover:bg-green-700 transition-colors"
                          >
                            <Check className="w-3 h-3 mx-auto" />
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="flex-1 bg-gray-500 text-white px-2 py-1 rounded text-xs hover:bg-gray-600 transition-colors"
                          >
                            <X className="w-3 h-3 mx-auto" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-gray-900">
                          {answer.marks_obtained}
                        </span>
                        <button
                          onClick={() => handleEditClick(answer.question_number, answer.marks_obtained)}
                          className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50 transition-colors"
                          title="Edit mark"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                    
                    <div className="mt-2">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${(answer.marks_obtained / answer.max_marks) * 100}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-500 mt-1 text-center">
                        {((answer.marks_obtained / answer.max_marks) * 100).toFixed(1)}%
                      </p>
                    </div>
                  </div>
                ))}

                {/* Total Score */}
                <div className="border-t-2 border-gray-300 pt-4 mt-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Total Score</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {studentDetails.total_marks}/{studentDetails.total_possible}
                      </p>
                      <p className={`text-lg font-semibold ${getGradeColor(totalPercentage).split(' ')[0]}`}>
                        {totalPercentage}%
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentScriptViewer;