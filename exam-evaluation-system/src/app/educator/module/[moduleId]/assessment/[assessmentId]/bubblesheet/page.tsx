// // // src/app/educator/module/[moduleId]/assessment/[assessmentId]/bubblesheet/page.tsx
// // "use client";

// // import { useSearchParams, useParams } from "next/navigation";
// // import { useState, useEffect, useRef } from "react";
// // import { FileUploadSection } from "@/components/Upload/FileUploadSection";
// // import Button from "@/components/Button";
// // import Breadcrumbs from "@/components/Breadcrumbs";
// // import { getAssessmentBreadcrumbs } from "@/utils/breadcrumbs";
// // import toast from "react-hot-toast";
// // import { FiFileText, FiKey, FiUsers, FiCheckCircle } from "react-icons/fi";
// // import Link from "next/link";

// // interface Student {
// //   user_id: string;
// //   registration_number: string;
// //   user: {
// //     first_name: string;
// //     last_name: string;
// //     email: string;
// //   };
// // }

// // interface BubbleSheetAnswer {
// //   question_number: number;
// //   selected_option: string;
// // }

// // interface BubbleSheetResult {
// //   total_questions: number;
// //   correct_answers: number;
// //   incorrect_answers: number;
// //   unanswered: number;
// //   total_marks: number;
// //   percentage: number;
// //   student_id: string;
// //   student: Student;
// // }

// // interface AssessmentData {
// //   assessment_id: string;
// //   type: string;
// //   title: string;
// //   description: string;
// //   deadline: string;
// //   created_on: string;
// //   question_paper?: {
// //     file_url: string;
// //     created_on: string;
// //   } | null;
// //   module: {
// //     module_code: string;
// //     module_name: string;
// //   };
// //   enrollmentCount: number;
// //   answer_key_count: number;
// //   student_submissions_count: number;
// //   results: BubbleSheetResult[];
// // }

// // export default function EducatorBubbleSheetPage() {
// //   const searchParams = useSearchParams();
// //   const params = useParams();
// //   const moduleId = params.moduleId as string;
// //   const assessmentId = params.assessmentId as string;
// //   const educatorId = searchParams.get("educatorId");

// //   const [assessment, setAssessment] = useState<AssessmentData | null>(null);
// //   const [loading, setLoading] = useState(true);
// //   const [error, setError] = useState<string | null>(null);

// //   const [answerKeyFile, setAnswerKeyFile] = useState<File | null>(null);
// //   const [questionPaperFile, setQuestionPaperFile] = useState<File | null>(null);
// //   const [isUploadingAnswerKey, setIsUploadingAnswerKey] = useState(false);
// //   const [isUploadingQuestionPaper, setIsUploadingQuestionPaper] = useState(false);
// //   const [isEvaluating, setIsEvaluating] = useState(false);

// //   const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
// //   const [searchTerm, setSearchTerm] = useState("");

// //   const answerKeyInputRef = useRef<HTMLInputElement>(null);
// //   const questionPaperInputRef = useRef<HTMLInputElement>(null);

// //   const breadcrumbs = assessment
// //     ? getAssessmentBreadcrumbs(
// //         assessment.module.module_code,
// //         moduleId,
// //         assessment.title,
// //         assessmentId,
// //         "educator"
// //       )
// //     : [];

// //   useEffect(() => {
// //     if (!moduleId || !assessmentId || !educatorId) {
// //       setError("Missing required parameters");
// //       setLoading(false);
// //       return;
// //     }

// //     fetchAssessment();
// //   }, [moduleId, assessmentId, educatorId]);

// //   const fetchAssessment = async () => {
// //     setLoading(true);
// //     try {
// //       const res = await fetch(
// //         `/api/educator/module/${moduleId}/assessment/${assessmentId}/bubblesheet?educatorId=${educatorId}`
// //       );
      
// //       if (!res.ok) throw new Error("Failed to fetch assessment");

// //       const data: AssessmentData = await res.json();
// //       setAssessment(data);
// //     } catch (err) {
// //       setError(err instanceof Error ? err.message : "Failed to load assessment");
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   const handleAnswerKeyFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
// //     const file = e.target.files?.[0];
// //     if (!file) return;

// //     const allowedTypes = ['.pdf', '.docx', '.doc', '.xlsx', '.xls'];
// //     const isValidType = allowedTypes.some((ext) =>
// //       file.name.toLowerCase().endsWith(ext.toLowerCase())
// //     );
    
// //     if (!isValidType) {
// //       toast.error("Invalid file type. Please upload PDF, Word, or Excel file");
// //       return;
// //     }

// //     setAnswerKeyFile(file);
// //     e.target.value = "";
// //   };

// //   const handleQuestionPaperChange = (e: React.ChangeEvent<HTMLInputElement>) => {
// //     const file = e.target.files?.[0];
// //     if (!file) return;

// //     const allowedTypes = ['.pdf', '.docx', '.doc'];
// //     const isValidType = allowedTypes.some((ext) =>
// //       file.name.toLowerCase().endsWith(ext.toLowerCase())
// //     );
    
// //     if (!isValidType) {
// //       toast.error("Invalid file type. Please upload PDF or Word file");
// //       return;
// //     }

// //     setQuestionPaperFile(file);
// //     e.target.value = "";
// //   };

// //   const uploadAnswerKey = async () => {
// //     if (!answerKeyFile) return;

// //     setIsUploadingAnswerKey(true);
// //     const toastId = toast.loading("Extracting answer key...");

// //     try {
// //       const formData = new FormData();
// //       formData.append("file", answerKeyFile);
// //       formData.append("assessmentId", assessmentId);
// //       formData.append("moduleId", moduleId);
// //       formData.append("educatorId", educatorId!);

// //       const res = await fetch(`/api/educator/bubblesheet/answer-key`, {
// //         method: "POST",
// //         body: formData,
// //       });

// //       if (!res.ok) {
// //         const errorData = await res.json();
// //         throw new Error(errorData.error || "Upload failed");
// //       }

// //       const result = await res.json();
      
// //       toast.success(
// //         `Answer key uploaded! Detected ${result.answer_count} answers.`,
// //         { id: toastId }
// //       );

// //       await fetchAssessment();
// //       setAnswerKeyFile(null);
// //     } catch (error) {
// //       console.error("Error uploading answer key:", error);
// //       toast.error(
// //         error instanceof Error ? error.message : "Failed to upload answer key",
// //         { id: toastId }
// //       );
// //     } finally {
// //       setIsUploadingAnswerKey(false);
// //     }
// //   };

// //   const uploadQuestionPaper = async () => {
// //     if (!questionPaperFile) return;

// //     setIsUploadingQuestionPaper(true);
// //     const toastId = toast.loading("Uploading question paper...");

// //     try {
// //       const formData = new FormData();
// //       formData.append("file", questionPaperFile);

// //       const res = await fetch(
// //         `/api/educator/module/${moduleId}/assessment/${assessmentId}/question-paper`,
// //         { method: "POST", body: formData }
// //       );

// //       if (!res.ok) {
// //         const errorData = await res.json();
// //         throw new Error(errorData.error || "Upload failed");
// //       }

// //       toast.success("Question paper uploaded successfully!", { id: toastId });
// //       await fetchAssessment();
// //       setQuestionPaperFile(null);
// //     } catch (error) {
// //       console.error("Error uploading question paper:", error);
// //       toast.error(
// //         error instanceof Error ? error.message : "Failed to upload question paper",
// //         { id: toastId }
// //       );
// //     } finally {
// //       setIsUploadingQuestionPaper(false);
// //     }
// //   };

// //   const startEvaluation = async () => {
// //     if (selectedStudents.length === 0) {
// //       toast.error("Please select at least one student");
// //       return;
// //     }

// //     setIsEvaluating(true);
// //     const toastId = toast.loading(`Evaluating ${selectedStudents.length} student(s)...`);

// //     try {
// //       const res = await fetch(`/api/educator/bubblesheet/evaluate`, {
// //         method: "POST",
// //         headers: { "Content-Type": "application/json" },
// //         body: JSON.stringify({
// //           assessmentId,
// //           moduleId,
// //           studentIds: selectedStudents,
// //         }),
// //       });

// //       if (!res.ok) {
// //         const errorData = await res.json();
// //         throw new Error(errorData.error || "Evaluation failed");
// //       }

// //       const result = await res.json();
      
// //       toast.success(
// //         `Successfully evaluated ${result.evaluated_count} student(s)!`,
// //         { id: toastId }
// //       );

// //       await fetchAssessment();
// //       setSelectedStudents([]);
// //     } catch (error) {
// //       console.error("Error during evaluation:", error);
// //       toast.error(
// //         error instanceof Error ? error.message : "Evaluation failed",
// //         { id: toastId }
// //       );
// //     } finally {
// //       setIsEvaluating(false);
// //     }
// //   };

// //   const handleSelectAll = () => {
// //     if (!assessment) return;
    
// //     const submittedStudents = assessment.results
// //       .map(r => r.student_id)
// //       .filter(id => !assessment.results.find(r => r.student_id === id));

// //     if (selectedStudents.length === submittedStudents.length) {
// //       setSelectedStudents([]);
// //     } else {
// //       setSelectedStudents(submittedStudents);
// //     }
// //   };

// //   const filteredResults = assessment?.results.filter(result => {
// //     if (!searchTerm) return true;
// //     const name = `${result.student.user.first_name} ${result.student.user.last_name}`.toLowerCase();
// //     const regNum = result.student.registration_number.toLowerCase();
// //     return name.includes(searchTerm.toLowerCase()) || regNum.includes(searchTerm.toLowerCase());
// //   }) || [];

// //   if (loading) {
// //     return (
// //       <div className="min-h-screen bg-gray-50 flex items-center justify-center">
// //         <div className="flex items-center space-x-2">
// //           <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
// //           <span className="text-lg text-gray-600">Loading assessment...</span>
// //         </div>
// //       </div>
// //     );
// //   }

// //   if (error || !assessment) {
// //     return (
// //       <div className="min-h-screen bg-gray-50 flex items-center justify-center">
// //         <div className="bg-white p-8 rounded-lg shadow-sm border border-red-200">
// //           <div className="text-red-600 text-center">
// //             <h2 className="text-lg font-semibold mb-2">Error</h2>
// //             <p>{error || "Assessment not found"}</p>
// //           </div>
// //         </div>
// //       </div>
// //     );
// //   }

// //   return (
// //     <div className="min-h-screen bg-gray-50">
// //       <div className="max-w-5xl mx-auto px-6 py-8">
// //         {/* Breadcrumbs */}
// //         <div className="mb-6">
// //           <Breadcrumbs items={breadcrumbs} />
// //         </div>

// //         {/* Header */}
// //         <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
// //           <div className="border-b border-gray-100 pb-4 mb-4">
// //             <h1 className="text-2xl font-bold text-gray-900 mb-2">
// //               {assessment.title}
// //             </h1>
// //             <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
// //               <div className="text-sm text-gray-600">
// //                 <span className="font-medium">{assessment.module.module_code}</span>
// //                 <span className="mx-2">•</span>
// //                 <span>{assessment.module.module_name}</span>
// //               </div>
// //               <div className="text-sm text-gray-600">
// //                 <span className="font-medium">Submissions: </span>
// //                 <span className="text-blue-600">{assessment.student_submissions_count}</span>
// //                 <span className="mx-1">/</span>
// //                 <span>{assessment.enrollmentCount} enrolled</span>
// //               </div>
// //             </div>
// //           </div>
// //           {assessment.description && (
// //             <p className="text-gray-700 leading-relaxed">{assessment.description}</p>
// //           )}
// //         </div>

// //         {/* View Results Dashboard */}
// //         <div className="bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-200 rounded-lg p-4 mb-6">
// //           <div className="flex items-center justify-between">
// //             <div>
// //               <h3 className="font-medium text-gray-900 mb-1">Bubble Sheet Results Dashboard</h3>
// //               <p className="text-sm text-gray-600">View detailed results and analytics</p>
// //             </div>
// //             <Link
// //               href={`/educator/dashboard/bubblesheet-results?assessmentId=${assessmentId}&title=${encodeURIComponent(
// //                 assessment.title
// //               )}&module=${encodeURIComponent(assessment.module.module_name)}`}
// //               className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors"
// //             >
// //               <FiCheckCircle className="w-4 h-4" />
// //               View Dashboard
// //             </Link>
// //           </div>
// //         </div>

// //         {/* File Upload Sections */}
// //         <div className="space-y-6">
// //           {/* Question Paper */}
// //           <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
// //             <div className="flex items-center justify-between mb-4">
// //               <h2 className="text-lg font-semibold text-gray-900">Question Paper</h2>
// //               {assessment.question_paper && (
// //                 <a
// //                   href={assessment.question_paper.file_url}
// //                   target="_blank"
// //                   rel="noopener noreferrer"
// //                   className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700 font-medium"
// //                 >
// //                   <FiFileText className="w-4 h-4 mr-2" />
// //                   View Current Question Paper
// //                 </a>
// //               )}
// //             </div>

// //             <input
// //               type="file"
// //               ref={questionPaperInputRef}
// //               onChange={handleQuestionPaperChange}
// //               accept=".pdf,.docx,.doc"
// //               className="hidden"
// //             />

// //             {!assessment.question_paper && (
// //               <>
// //                 <FileUploadSection
// //                   title="Upload Question Paper"
// //                   icon={<FiFileText />}
// //                   type="QUESTION_PAPER"
// //                   uploadedFile={questionPaperFile}
// //                   onTriggerUpload={() => questionPaperInputRef.current?.click()}
// //                 />
// //                 {questionPaperFile && (
// //                   <div className="mt-4 flex justify-end">
// //                     <Button
// //                       onClick={uploadQuestionPaper}
// //                       disabled={isUploadingQuestionPaper}
// //                       className="px-6"
// //                     >
// //                       {isUploadingQuestionPaper ? "Uploading..." : "Upload Question Paper"}
// //                     </Button>
// //                   </div>
// //                 )}
// //               </>
// //             )}
// //           </div>

// //           {/* Answer Key */}
// //           <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
// //             <div className="flex items-center justify-between mb-4">
// //               <div>
// //                 <h2 className="text-lg font-semibold text-gray-900">Answer Key</h2>
// //                 {assessment.answer_key_count > 0 && (
// //                   <p className="text-sm text-green-600 mt-1">
// //                     <FiCheckCircle className="inline mr-1" />
// //                     {assessment.answer_key_count} answers uploaded
// //                   </p>
// //                 )}
// //               </div>
// //             </div>

// //             {assessment.answer_key_count === 0 && (
// //               <div className="space-y-4">
// //                 <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
// //                   <div className="flex items-start space-x-2">
// //                     <FiKey className="h-5 w-5 text-blue-600 mt-0.5" />
// //                     <div>
// //                       <p className="text-sm font-medium text-blue-800">Upload Instructions</p>
// //                       <ul className="text-xs text-blue-700 mt-2 space-y-1 list-disc list-inside">
// //                         <li>Upload answer key in PDF, Word, or Excel format</li>
// //                         <li>Format: Q1: A, Q2: B, Q3: C, etc.</li>
// //                         <li>System will automatically extract correct answers</li>
// //                       </ul>
// //                     </div>
// //                   </div>
// //                 </div>

// //                 <input
// //                   type="file"
// //                   ref={answerKeyInputRef}
// //                   onChange={handleAnswerKeyFileChange}
// //                   accept=".pdf,.docx,.doc,.xlsx,.xls"
// //                   className="hidden"
// //                 />

// //                 <FileUploadSection
// //                   title="Upload Answer Key Document"
// //                   icon={<FiKey />}
// //                   type="MODEL_PAPER"
// //                   uploadedFile={answerKeyFile}
// //                   onTriggerUpload={() => answerKeyInputRef.current?.click()}
// //                 />

// //                 {answerKeyFile && (
// //                   <div className="flex justify-end">
// //                     <Button
// //                       onClick={uploadAnswerKey}
// //                       disabled={isUploadingAnswerKey}
// //                       className="px-6"
// //                     >
// //                       {isUploadingAnswerKey ? "Processing..." : "Upload & Extract"}
// //                     </Button>
// //                   </div>
// //                 )}
// //               </div>
// //             )}
// //           </div>
// //         </div>

// //         {/* Student Submissions */}
// //         {assessment.student_submissions_count > 0 && (
// //           <div className="bg-white rounded-lg shadow-sm border border-gray-200 mt-6">
// //             <div className="p-6 border-b border-gray-200">
// //               <div className="flex items-center justify-between mb-4">
// //                 <h2 className="text-lg font-semibold text-gray-900">
// //                   <FiUsers className="inline mr-2" />
// //                   Student Submissions
// //                 </h2>
// //                 <div className="text-sm text-gray-600">
// //                   {selectedStudents.length} selected
// //                 </div>
// //               </div>

// //               <div className="flex items-center gap-4">
// //                 <input
// //                   type="text"
// //                   placeholder="Search by name or registration number..."
// //                   value={searchTerm}
// //                   onChange={(e) => setSearchTerm(e.target.value)}
// //                   className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
// //                 />
// //                 <Button
// //                   variant="outline"
// //                   onClick={handleSelectAll}
// //                   className="whitespace-nowrap"
// //                 >
// //                   {selectedStudents.length === filteredResults.length
// //                     ? "Deselect All"
// //                     : "Select All"}
// //                 </Button>
// //               </div>
// //             </div>

// //             <div className="overflow-x-auto">
// //               <table className="min-w-full divide-y divide-gray-200">
// //                 <thead className="bg-gray-50">
// //                   <tr>
// //                     <th className="px-6 py-3 text-left">
// //                       <input
// //                         type="checkbox"
// //                         checked={selectedStudents.length === filteredResults.length}
// //                         onChange={handleSelectAll}
// //                         className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
// //                       />
// //                     </th>
// //                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
// //                       Student
// //                     </th>
// //                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
// //                       Registration No.
// //                     </th>
// //                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
// //                       Status
// //                     </th>
// //                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
// //                       Score
// //                     </th>
// //                   </tr>
// //                 </thead>
// //                 <tbody className="bg-white divide-y divide-gray-200">
// //                   {filteredResults.map((result) => (
// //                     <tr
// //                       key={result.student_id}
// //                       className={`hover:bg-gray-50 ${
// //                         selectedStudents.includes(result.student_id) ? "bg-blue-50" : ""
// //                       }`}
// //                     >
// //                       <td className="px-6 py-4">
// //                         <input
// //                           type="checkbox"
// //                           checked={selectedStudents.includes(result.student_id)}
// //                           onChange={(e) => {
// //                             if (e.target.checked) {
// //                               setSelectedStudents([...selectedStudents, result.student_id]);
// //                             } else {
// //                               setSelectedStudents(
// //                                 selectedStudents.filter((id) => id !== result.student_id)
// //                               );
// //                             }
// //                           }}
// //                           className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
// //                         />
// //                       </td>
// //                       <td className="px-6 py-4">
// //                         <div className="text-sm font-medium text-gray-900">
// //                           {result.student.user.first_name} {result.student.user.last_name}
// //                         </div>
// //                         <div className="text-sm text-gray-500">{result.student.user.email}</div>
// //                       </td>
// //                       <td className="px-6 py-4 text-sm text-gray-900">
// //                         {result.student.registration_number}
// //                       </td>
// //                       <td className="px-6 py-4">
// //                         {result.total_marks > 0 ? (
// //                           <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
// //                             Evaluated
// //                           </span>
// //                         ) : (
// //                           <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
// //                             Pending
// //                           </span>
// //                         )}
// //                       </td>
// //                       <td className="px-6 py-4 text-sm text-gray-900">
// //                         {result.total_marks > 0 ? (
// //                           <span>
// //                             {result.correct_answers}/{result.total_questions} (
// //                             {result.percentage.toFixed(1)}%)
// //                           </span>
// //                         ) : (
// //                           <span className="text-gray-400">-</span>
// //                         )}
// //                       </td>
// //                     </tr>
// //                   ))}
// //                 </tbody>
// //               </table>
// //             </div>
// //           </div>
// //         )}

// //         {/* Evaluation Button */}
// //         {assessment.answer_key_count > 0 && assessment.student_submissions_count > 0 && (
// //           <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-6">
// //             <div className="flex items-center justify-between">
// //               <div>
// //                 <h3 className="text-lg font-semibold text-gray-900 mb-1">
// //                   Start Evaluation
// //                 </h3>
// //                 <p className="text-sm text-gray-600">
// //                   Evaluate selected students against the uploaded answer key
// //                 </p>
// //               </div>
// //               <Button
// //                 onClick={startEvaluation}
// //                 disabled={selectedStudents.length === 0 || isEvaluating}
// //                 className="px-6"
// //               >
// //                 {isEvaluating
// //                   ? "Evaluating..."
// //                   : `Evaluate (${selectedStudents.length} selected)`}
// //               </Button>
// //             </div>
// //           </div>
// //         )}
// //       </div>
// //     </div>
// //   );
// // }

// // src/app/educator/module/[moduleId]/assessment/[assessmentId]/bubblesheet/page.tsx
// "use client";

// import { useSearchParams, useParams } from "next/navigation";
// import { useState, useEffect, useRef } from "react";
// import { FileUploadSection } from "@/components/Upload/FileUploadSection";
// import Button from "@/components/Button";
// import Breadcrumbs from "@/components/Breadcrumbs";
// import { getAssessmentBreadcrumbs } from "@/utils/breadcrumbs";
// import toast from "react-hot-toast";
// import { FiFileText, FiKey, FiUsers, FiCheckCircle } from "react-icons/fi";
// import Link from "next/link";

// interface Student {
//   user_id: string;
//   registration_number: string;
//   user: {
//     first_name: string;
//     last_name: string;
//     email: string;
//   };
// }

// interface BubbleSheetAnswer {
//   question_number: number;
//   selected_option: string;
// }

// interface BubbleSheetResult {
//   total_questions: number;
//   correct_answers: number;
//   incorrect_answers: number;
//   unanswered: number;
//   total_marks: number;
//   percentage: number;
//   student_id: string;
//   student: Student;
// }

// interface AssessmentData {
//   assessment_id: string;
//   type: string;
//   title: string;
//   description: string;
//   deadline: string;
//   created_on: string;
//   question_paper?: {
//     file_url: string;
//     created_on: string;
//   } | null;
//   module: {
//     module_code: string;
//     module_name: string;
//   };
//   enrollmentCount: number;
//   answer_key_count: number;
//   student_submissions_count: number;
//   results: BubbleSheetResult[];
// }

// export default function EducatorBubbleSheetPage() {
//   const searchParams = useSearchParams();
//   const params = useParams();
//   const moduleId = params.moduleId as string;
//   const assessmentId = params.assessmentId as string;
//   const educatorId = searchParams.get("educatorId");

//   const [assessment, setAssessment] = useState<AssessmentData | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   const [answerKeyFile, setAnswerKeyFile] = useState<File | null>(null);
//   const [questionPaperFile, setQuestionPaperFile] = useState<File | null>(null);
//   const [isUploadingAnswerKey, setIsUploadingAnswerKey] = useState(false);
//   const [isUploadingQuestionPaper, setIsUploadingQuestionPaper] = useState(false);
//   const [isEvaluating, setIsEvaluating] = useState(false);

//   const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
//   const [searchTerm, setSearchTerm] = useState("");

//   const answerKeyInputRef = useRef<HTMLInputElement>(null);
//   const questionPaperInputRef = useRef<HTMLInputElement>(null);

//   const breadcrumbs = assessment
//     ? getAssessmentBreadcrumbs(
//         assessment.module.module_code,
//         moduleId,
//         assessment.title,
//         assessmentId,
//         "educator"
//       )
//     : [];

//   useEffect(() => {
//     if (!moduleId || !assessmentId || !educatorId) {
//       setError("Missing required parameters");
//       setLoading(false);
//       return;
//     }

//     fetchAssessment();
//   }, [moduleId, assessmentId, educatorId]);

//   const fetchAssessment = async () => {
//     setLoading(true);
//     try {
//       const res = await fetch(
//         `/api/educator/module/${moduleId}/assessment/${assessmentId}/bubblesheet?educatorId=${educatorId}`
//       );
      
//       if (!res.ok) throw new Error("Failed to fetch assessment");

//       const data: AssessmentData = await res.json();
//       setAssessment(data);
//     } catch (err) {
//       setError(err instanceof Error ? err.message : "Failed to load assessment");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleAnswerKeyFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (!file) return;

//     const allowedTypes = ['.pdf', '.docx', '.doc', '.xlsx', '.xls'];
//     const isValidType = allowedTypes.some((ext) =>
//       file.name.toLowerCase().endsWith(ext.toLowerCase())
//     );
    
//     if (!isValidType) {
//       toast.error("Invalid file type. Please upload PDF, Word, or Excel file");
//       return;
//     }

//     setAnswerKeyFile(file);
//     e.target.value = "";
//   };

//   const handleQuestionPaperChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (!file) return;

//     const allowedTypes = ['.pdf', '.docx', '.doc'];
//     const isValidType = allowedTypes.some((ext) =>
//       file.name.toLowerCase().endsWith(ext.toLowerCase())
//     );
    
//     if (!isValidType) {
//       toast.error("Invalid file type. Please upload PDF or Word file");
//       return;
//     }

//     setQuestionPaperFile(file);
//     e.target.value = "";
//   };

//   const uploadAnswerKey = async () => {
//     if (!answerKeyFile) return;

//     setIsUploadingAnswerKey(true);
//     const toastId = toast.loading("Extracting answer key...");

//     try {
//       const formData = new FormData();
//       formData.append("file", answerKeyFile);

//       const res = await fetch(
//         `/api/educator/bubblesheet/answer-key?assessmentId=${assessmentId}&moduleId=${moduleId}&educatorId=${educatorId}`,
//         {
//           method: "POST",
//           body: formData,
//         }
//       );

//       if (!res.ok) {
//         const errorData = await res.json();
//         throw new Error(errorData.error || "Upload failed");
//       }

//       const result = await res.json();
      
//       toast.success(
//         `Answer key uploaded! Detected ${result.answer_count} answers.`,
//         { id: toastId }
//       );

//       await fetchAssessment();
//       setAnswerKeyFile(null);
//     } catch (error) {
//       console.error("Error uploading answer key:", error);
//       toast.error(
//         error instanceof Error ? error.message : "Failed to upload answer key",
//         { id: toastId }
//       );
//     } finally {
//       setIsUploadingAnswerKey(false);
//     }
//   };

//   const uploadQuestionPaper = async () => {
//     if (!questionPaperFile) return;

//     setIsUploadingQuestionPaper(true);
//     const toastId = toast.loading("Uploading question paper...");

//     try {
//       const formData = new FormData();
//       formData.append("file", questionPaperFile);

//       const res = await fetch(
//         `/api/educator/module/${moduleId}/assessment/${assessmentId}/question-paper`,
//         { method: "POST", body: formData }
//       );

//       if (!res.ok) {
//         const errorData = await res.json();
//         throw new Error(errorData.error || "Upload failed");
//       }

//       toast.success("Question paper uploaded successfully!", { id: toastId });
//       await fetchAssessment();
//       setQuestionPaperFile(null);
//     } catch (error) {
//       console.error("Error uploading question paper:", error);
//       toast.error(
//         error instanceof Error ? error.message : "Failed to upload question paper",
//         { id: toastId }
//       );
//     } finally {
//       setIsUploadingQuestionPaper(false);
//     }
//   };

//   const startEvaluation = async () => {
//     if (selectedStudents.length === 0) {
//       toast.error("Please select at least one student");
//       return;
//     }

//     setIsEvaluating(true);
//     const toastId = toast.loading(`Evaluating ${selectedStudents.length} student(s)...`);

//     try {
//       const res = await fetch(`/api/educator/bubblesheet/evaluate`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           assessmentId,
//           moduleId,
//           studentIds: selectedStudents,
//         }),
//       });

//       if (!res.ok) {
//         const errorData = await res.json();
//         throw new Error(errorData.error || "Evaluation failed");
//       }

//       const result = await res.json();
      
//       toast.success(
//         `Successfully evaluated ${result.evaluated_count} student(s)!`,
//         { id: toastId }
//       );

//       await fetchAssessment();
//       setSelectedStudents([]);
//     } catch (error) {
//       console.error("Error during evaluation:", error);
//       toast.error(
//         error instanceof Error ? error.message : "Evaluation failed",
//         { id: toastId }
//       );
//     } finally {
//       setIsEvaluating(false);
//     }
//   };

//   const handleSelectAll = () => {
//     if (!assessment) return;
    
//     const submittedStudents = assessment.results
//       .map(r => r.student_id)
//       .filter(id => !assessment.results.find(r => r.student_id === id));

//     if (selectedStudents.length === submittedStudents.length) {
//       setSelectedStudents([]);
//     } else {
//       setSelectedStudents(submittedStudents);
//     }
//   };

//   const filteredResults = assessment?.results.filter(result => {
//     if (!searchTerm) return true;
//     const name = `${result.student.user.first_name} ${result.student.user.last_name}`.toLowerCase();
//     const regNum = result.student.registration_number.toLowerCase();
//     return name.includes(searchTerm.toLowerCase()) || regNum.includes(searchTerm.toLowerCase());
//   }) || [];

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gray-50 flex items-center justify-center">
//         <div className="flex items-center space-x-2">
//           <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
//           <span className="text-lg text-gray-600">Loading assessment...</span>
//         </div>
//       </div>
//     );
//   }

//   if (error || !assessment) {
//     return (
//       <div className="min-h-screen bg-gray-50 flex items-center justify-center">
//         <div className="bg-white p-8 rounded-lg shadow-sm border border-red-200">
//           <div className="text-red-600 text-center">
//             <h2 className="text-lg font-semibold mb-2">Error</h2>
//             <p>{error || "Assessment not found"}</p>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-50">
//       <div className="max-w-5xl mx-auto px-6 py-8">
//         {/* Breadcrumbs */}
//         <div className="mb-6">
//           <Breadcrumbs items={breadcrumbs} />
//         </div>

//         {/* Header */}
//         <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
//           <div className="border-b border-gray-100 pb-4 mb-4">
//             <h1 className="text-2xl font-bold text-gray-900 mb-2">
//               {assessment.title}
//             </h1>
//             <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
//               <div className="text-sm text-gray-600">
//                 <span className="font-medium">{assessment.module.module_code}</span>
//                 <span className="mx-2">•</span>
//                 <span>{assessment.module.module_name}</span>
//               </div>
//               <div className="text-sm text-gray-600">
//                 <span className="font-medium">Submissions: </span>
//                 <span className="text-blue-600">{assessment.student_submissions_count}</span>
//                 <span className="mx-1">/</span>
//                 <span>{assessment.enrollmentCount} enrolled</span>
//               </div>
//             </div>
//           </div>
//           {assessment.description && (
//             <p className="text-gray-700 leading-relaxed">{assessment.description}</p>
//           )}
//         </div>

//         {/* View Results Dashboard */}
//         <div className="bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-200 rounded-lg p-4 mb-6">
//           <div className="flex items-center justify-between">
//             <div>
//               <h3 className="font-medium text-gray-900 mb-1">Bubble Sheet Results Dashboard</h3>
//               <p className="text-sm text-gray-600">View detailed results and analytics</p>
//             </div>
//             <Link
//               href={`/educator/dashboard/bubblesheet-results?assessmentId=${assessmentId}&title=${encodeURIComponent(
//                 assessment.title
//               )}&module=${encodeURIComponent(assessment.module.module_name)}`}
//               className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors"
//             >
//               <FiCheckCircle className="w-4 h-4" />
//               View Dashboard
//             </Link>
//           </div>
//         </div>

//         {/* File Upload Sections */}
//         <div className="space-y-6">
//           {/* Question Paper */}
//           <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
//             <div className="flex items-center justify-between mb-4">
//               <h2 className="text-lg font-semibold text-gray-900">Question Paper</h2>
//               {assessment.question_paper && (
//                 <a
//                   href={assessment.question_paper.file_url}
//                   target="_blank"
//                   rel="noopener noreferrer"
//                   className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700 font-medium"
//                 >
//                   <FiFileText className="w-4 h-4 mr-2" />
//                   View Current Question Paper
//                 </a>
//               )}
//             </div>

//             <input
//               type="file"
//               ref={questionPaperInputRef}
//               onChange={handleQuestionPaperChange}
//               accept=".pdf,.docx,.doc"
//               className="hidden"
//             />

//             {!assessment.question_paper && (
//               <>
//                 <FileUploadSection
//                   title="Upload Question Paper"
//                   icon={<FiFileText />}
//                   type="QUESTION_PAPER"
//                   uploadedFile={questionPaperFile}
//                   onTriggerUpload={() => questionPaperInputRef.current?.click()}
//                 />
//                 {questionPaperFile && (
//                   <div className="mt-4 flex justify-end">
//                     <Button
//                       onClick={uploadQuestionPaper}
//                       disabled={isUploadingQuestionPaper}
//                       className="px-6"
//                     >
//                       {isUploadingQuestionPaper ? "Uploading..." : "Upload Question Paper"}
//                     </Button>
//                   </div>
//                 )}
//               </>
//             )}
//           </div>

//           {/* Answer Key */}
//           <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
//             <div className="flex items-center justify-between mb-4">
//               <div>
//                 <h2 className="text-lg font-semibold text-gray-900">Answer Key</h2>
//                 {assessment.answer_key_count > 0 && (
//                   <p className="text-sm text-green-600 mt-1">
//                     <FiCheckCircle className="inline mr-1" />
//                     {assessment.answer_key_count} answers uploaded
//                   </p>
//                 )}
//               </div>
//             </div>

//             {assessment.answer_key_count === 0 && (
//               <div className="space-y-4">
//                 <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
//                   <div className="flex items-start space-x-2">
//                     <FiKey className="h-5 w-5 text-blue-600 mt-0.5" />
//                     <div>
//                       <p className="text-sm font-medium text-blue-800">Upload Instructions</p>
//                       <ul className="text-xs text-blue-700 mt-2 space-y-1 list-disc list-inside">
//                         <li>Upload answer key in PDF, Word, or Excel format</li>
//                         <li>Format: Q1: A, Q2: B, Q3: C, etc.</li>
//                         <li>System will automatically extract correct answers</li>
//                       </ul>
//                     </div>
//                   </div>
//                 </div>

//                 <input
//                   type="file"
//                   ref={answerKeyInputRef}
//                   onChange={handleAnswerKeyFileChange}
//                   accept=".pdf,.docx,.doc,.xlsx,.xls"
//                   className="hidden"
//                 />

//                 <FileUploadSection
//                   title="Upload Answer Key Document"
//                   icon={<FiKey />}
//                   type="MODEL_PAPER"
//                   uploadedFile={answerKeyFile}
//                   onTriggerUpload={() => answerKeyInputRef.current?.click()}
//                 />

//                 {answerKeyFile && (
//                   <div className="flex justify-end">
//                     <Button
//                       onClick={uploadAnswerKey}
//                       disabled={isUploadingAnswerKey}
//                       className="px-6"
//                     >
//                       {isUploadingAnswerKey ? "Processing..." : "Upload & Extract"}
//                     </Button>
//                   </div>
//                 )}
//               </div>
//             )}
//           </div>
//         </div>

//         {/* Student Submissions */}
//         {assessment.student_submissions_count > 0 && (
//           <div className="bg-white rounded-lg shadow-sm border border-gray-200 mt-6">
//             <div className="p-6 border-b border-gray-200">
//               <div className="flex items-center justify-between mb-4">
//                 <h2 className="text-lg font-semibold text-gray-900">
//                   <FiUsers className="inline mr-2" />
//                   Student Submissions
//                 </h2>
//                 <div className="text-sm text-gray-600">
//                   {selectedStudents.length} selected
//                 </div>
//               </div>

//               <div className="flex items-center gap-4">
//                 <input
//                   type="text"
//                   placeholder="Search by name or registration number..."
//                   value={searchTerm}
//                   onChange={(e) => setSearchTerm(e.target.value)}
//                   className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                 />
//                 <Button
//                   variant="outline"
//                   onClick={handleSelectAll}
//                   className="whitespace-nowrap"
//                 >
//                   {selectedStudents.length === filteredResults.length
//                     ? "Deselect All"
//                     : "Select All"}
//                 </Button>
//               </div>
//             </div>

//             <div className="overflow-x-auto">
//               <table className="min-w-full divide-y divide-gray-200">
//                 <thead className="bg-gray-50">
//                   <tr>
//                     <th className="px-6 py-3 text-left">
//                       <input
//                         type="checkbox"
//                         checked={selectedStudents.length === filteredResults.length}
//                         onChange={handleSelectAll}
//                         className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
//                       />
//                     </th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
//                       Student
//                     </th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
//                       Registration No.
//                     </th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
//                       Status
//                     </th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
//                       Score
//                     </th>
//                   </tr>
//                 </thead>
//                 <tbody className="bg-white divide-y divide-gray-200">
//                   {filteredResults.map((result) => (
//                     <tr
//                       key={result.student_id}
//                       className={`hover:bg-gray-50 ${
//                         selectedStudents.includes(result.student_id) ? "bg-blue-50" : ""
//                       }`}
//                     >
//                       <td className="px-6 py-4">
//                         <input
//                           type="checkbox"
//                           checked={selectedStudents.includes(result.student_id)}
//                           onChange={(e) => {
//                             if (e.target.checked) {
//                               setSelectedStudents([...selectedStudents, result.student_id]);
//                             } else {
//                               setSelectedStudents(
//                                 selectedStudents.filter((id) => id !== result.student_id)
//                               );
//                             }
//                           }}
//                           className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
//                         />
//                       </td>
//                       <td className="px-6 py-4">
//                         <div className="text-sm font-medium text-gray-900">
//                           {result.student.user.first_name} {result.student.user.last_name}
//                         </div>
//                         <div className="text-sm text-gray-500">{result.student.user.email}</div>
//                       </td>
//                       <td className="px-6 py-4 text-sm text-gray-900">
//                         {result.student.registration_number}
//                       </td>
//                       <td className="px-6 py-4">
//                         {result.total_marks > 0 ? (
//                           <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
//                             Evaluated
//                           </span>
//                         ) : (
//                           <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
//                             Pending
//                           </span>
//                         )}
//                       </td>
//                       <td className="px-6 py-4 text-sm text-gray-900">
//                         {result.total_marks > 0 ? (
//                           <span>
//                             {result.correct_answers}/{result.total_questions} (
//                             {result.percentage.toFixed(1)}%)
//                           </span>
//                         ) : (
//                           <span className="text-gray-400">-</span>
//                         )}
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           </div>
//         )}

//         {/* Evaluation Button */}
//         {assessment.answer_key_count > 0 && assessment.student_submissions_count > 0 && (
//           <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-6">
//             <div className="flex items-center justify-between">
//               <div>
//                 <h3 className="text-lg font-semibold text-gray-900 mb-1">
//                   Start Evaluation
//                 </h3>
//                 <p className="text-sm text-gray-600">
//                   Evaluate selected students against the uploaded answer key
//                 </p>
//               </div>
//               <Button
//                 onClick={startEvaluation}
//                 disabled={selectedStudents.length === 0 || isEvaluating}
//                 className="px-6"
//               >
//                 {isEvaluating
//                   ? "Evaluating..."
//                   : `Evaluate (${selectedStudents.length} selected)`}
//               </Button>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// src/app/educator/module/[moduleId]/assessment/[assessmentId]/bubblesheet/page.tsx
"use client";

import { useSearchParams, useParams } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { FileUploadSection } from "@/components/Upload/FileUploadSection";
import Button from "@/components/Button";
import Breadcrumbs from "@/components/Breadcrumbs";
import { getAssessmentBreadcrumbs } from "@/utils/breadcrumbs";
import toast from "react-hot-toast";
import { FiFileText, FiKey, FiUsers, FiCheckCircle } from "react-icons/fi";
import Link from "next/link";

interface StudentSubmission {
  student_id: string;
  registration_number: string;
  user: {
    user_id: string;
    first_name: string;
    last_name: string;
    email: string;
  };
  has_submitted: boolean;
  is_evaluated: boolean;
  result: {
    total_questions: number;
    correct_answers: number;
    incorrect_answers: number;
    unanswered: number;
    total_marks: number;
    percentage: number;
  } | null;
}

interface AssessmentData {
  assessment_id: string;
  type: string;
  title: string;
  description: string;
  deadline: string;
  created_on: string;
  question_paper?: {
    file_url: string;
    created_on: string;
  } | null;
  module: {
    module_code: string;
    module_name: string;
  };
  enrollmentCount: number;
  answer_key_count: number;
  student_submissions_count: number;
  students: StudentSubmission[]; // Students who submitted
  results: any[]; // Evaluation results
}

export default function EducatorBubbleSheetPage() {
  const searchParams = useSearchParams();
  const params = useParams();
  const moduleId = params.moduleId as string;
  const assessmentId = params.assessmentId as string;
  const educatorId = searchParams.get("educatorId");

  const [assessment, setAssessment] = useState<AssessmentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [answerKeyFile, setAnswerKeyFile] = useState<File | null>(null);
  const [questionPaperFile, setQuestionPaperFile] = useState<File | null>(null);
  const [isUploadingAnswerKey, setIsUploadingAnswerKey] = useState(false);
  const [isUploadingQuestionPaper, setIsUploadingQuestionPaper] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);

  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  const answerKeyInputRef = useRef<HTMLInputElement>(null);
  const questionPaperInputRef = useRef<HTMLInputElement>(null);

  const breadcrumbs = assessment
    ? getAssessmentBreadcrumbs(
        assessment.module.module_code,
        moduleId,
        assessment.title,
        assessmentId,
        "educator"
      )
    : [];

  useEffect(() => {
    if (!moduleId || !assessmentId || !educatorId) {
      setError("Missing required parameters");
      setLoading(false);
      return;
    }

    fetchAssessment();
  }, [moduleId, assessmentId, educatorId]);

  const fetchAssessment = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/educator/module/${moduleId}/assessment/${assessmentId}/bubblesheet?educatorId=${educatorId}`
      );
      
      if (!res.ok) throw new Error("Failed to fetch assessment");

      const data: AssessmentData = await res.json();
      console.log("📊 Assessment data:", data);
      console.log("👥 Students who submitted:", data.students?.length || 0);
      setAssessment(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load assessment");
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerKeyFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['.pdf', '.docx', '.doc', '.xlsx', '.xls'];
    const isValidType = allowedTypes.some((ext) =>
      file.name.toLowerCase().endsWith(ext.toLowerCase())
    );
    
    if (!isValidType) {
      toast.error("Invalid file type. Please upload PDF, Word, or Excel file");
      return;
    }

    setAnswerKeyFile(file);
    e.target.value = "";
  };

  const handleQuestionPaperChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['.pdf', '.docx', '.doc'];
    const isValidType = allowedTypes.some((ext) =>
      file.name.toLowerCase().endsWith(ext.toLowerCase())
    );
    
    if (!isValidType) {
      toast.error("Invalid file type. Please upload PDF or Word file");
      return;
    }

    setQuestionPaperFile(file);
    e.target.value = "";
  };

  const uploadAnswerKey = async () => {
    if (!answerKeyFile) return;

    setIsUploadingAnswerKey(true);
    const toastId = toast.loading("Extracting answer key...");

    try {
      const formData = new FormData();
      formData.append("file", answerKeyFile);

      const res = await fetch(
        `/api/educator/bubblesheet/answer-key?assessmentId=${assessmentId}&moduleId=${moduleId}&educatorId=${educatorId}`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Upload failed");
      }

      const result = await res.json();
      
      toast.success(
        `Answer key uploaded! Detected ${result.answer_count} answers.`,
        { id: toastId }
      );

      await fetchAssessment();
      setAnswerKeyFile(null);
    } catch (error) {
      console.error("Error uploading answer key:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to upload answer key",
        { id: toastId }
      );
    } finally {
      setIsUploadingAnswerKey(false);
    }
  };

  const uploadQuestionPaper = async () => {
    if (!questionPaperFile) return;

    setIsUploadingQuestionPaper(true);
    const toastId = toast.loading("Uploading question paper...");

    try {
      const formData = new FormData();
      formData.append("file", questionPaperFile);

      const res = await fetch(
        `/api/educator/module/${moduleId}/assessment/${assessmentId}/question-paper`,
        { method: "POST", body: formData }
      );

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Upload failed");
      }

      toast.success("Question paper uploaded successfully!", { id: toastId });
      await fetchAssessment();
      setQuestionPaperFile(null);
    } catch (error) {
      console.error("Error uploading question paper:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to upload question paper",
        { id: toastId }
      );
    } finally {
      setIsUploadingQuestionPaper(false);
    }
  };

  const startEvaluation = async () => {
    if (selectedStudents.length === 0) {
      toast.error("Please select at least one student");
      return;
    }

    if (!assessment || assessment.answer_key_count === 0) {
      toast.error("Please upload answer key first");
      return;
    }

    setIsEvaluating(true);
    const toastId = toast.loading(`Evaluating ${selectedStudents.length} student(s)...`);

    try {
      const res = await fetch(`/api/educator/bubblesheet/evaluate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assessmentId,
          moduleId,
          studentIds: selectedStudents,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Evaluation failed");
      }

      const result = await res.json();
      
      toast.success(
        `Successfully evaluated ${result.evaluated_count} student(s)!`,
        { id: toastId }
      );

      await fetchAssessment();
      setSelectedStudents([]);
    } catch (error) {
      console.error("Error during evaluation:", error);
      toast.error(
        error instanceof Error ? error.message : "Evaluation failed",
        { id: toastId }
      );
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleSelectAll = () => {
    if (!assessment?.students) return;
    
    const allStudentIds = assessment.students.map(s => s.student_id);

    if (selectedStudents.length === allStudentIds.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(allStudentIds);
    }
  };

  const filteredStudents = assessment?.students.filter(student => {
    if (!searchTerm) return true;
    const name = `${student.user.first_name} ${student.user.last_name}`.toLowerCase();
    const regNum = student.registration_number.toLowerCase();
    return name.includes(searchTerm.toLowerCase()) || regNum.includes(searchTerm.toLowerCase());
  }) || [];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span className="text-lg text-gray-600">Loading assessment...</span>
        </div>
      </div>
    );
  }

  if (error || !assessment) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-sm border border-red-200">
          <div className="text-red-600 text-center">
            <h2 className="text-lg font-semibold mb-2">Error</h2>
            <p>{error || "Assessment not found"}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Breadcrumbs */}
        <div className="mb-6">
          <Breadcrumbs items={breadcrumbs} />
        </div>

        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="border-b border-gray-100 pb-4 mb-4">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {assessment.title}
            </h1>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div className="text-sm text-gray-600">
                <span className="font-medium">{assessment.module.module_code}</span>
                <span className="mx-2">•</span>
                <span>{assessment.module.module_name}</span>
              </div>
              <div className="text-sm text-gray-600">
                <span className="font-medium">Submissions: </span>
                <span className="text-blue-600">{assessment.student_submissions_count}</span>
                <span className="mx-1">/</span>
                <span>{assessment.enrollmentCount} enrolled</span>
              </div>
            </div>
          </div>
          {assessment.description && (
            <p className="text-gray-700 leading-relaxed">{assessment.description}</p>
          )}
        </div>

        {/* View Results Dashboard */}
        {assessment.results.length > 0 && (
          <div className="bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900 mb-1">Bubble Sheet Results Dashboard</h3>
                <p className="text-sm text-gray-600">View detailed results and analytics</p>
              </div>
              <Link
                href={`/educator/dashboard/bubblesheet-results?assessmentId=${assessmentId}&title=${encodeURIComponent(
                  assessment.title
                )}&module=${encodeURIComponent(assessment.module.module_name)}`}
                className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors"
              >
                <FiCheckCircle className="w-4 h-4" />
                View Dashboard
              </Link>
            </div>
          </div>
        )}

        {/* File Upload Sections */}
        <div className="space-y-6">
          {/* Question Paper */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Question Paper</h2>
              {assessment.question_paper && (
                <a
                  href={assessment.question_paper.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  <FiFileText className="w-4 h-4 mr-2" />
                  View Current Question Paper
                </a>
              )}
            </div>

            <input
              type="file"
              ref={questionPaperInputRef}
              onChange={handleQuestionPaperChange}
              accept=".pdf,.docx,.doc"
              className="hidden"
            />

            {!assessment.question_paper && (
              <>
                <FileUploadSection
                  title="Upload Question Paper"
                  icon={<FiFileText />}
                  type="QUESTION_PAPER"
                  uploadedFile={questionPaperFile}
                  onTriggerUpload={() => questionPaperInputRef.current?.click()}
                />
                {questionPaperFile && (
                  <div className="mt-4 flex justify-end">
                    <Button
                      onClick={uploadQuestionPaper}
                      disabled={isUploadingQuestionPaper}
                      className="px-6"
                    >
                      {isUploadingQuestionPaper ? "Uploading..." : "Upload Question Paper"}
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Answer Key */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Answer Key</h2>
                {assessment.answer_key_count > 0 && (
                  <p className="text-sm text-green-600 mt-1">
                    <FiCheckCircle className="inline mr-1" />
                    {assessment.answer_key_count} answers uploaded
                  </p>
                )}
              </div>
            </div>

            {assessment.answer_key_count === 0 && (
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-start space-x-2">
                    <FiKey className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-blue-800">Upload Instructions</p>
                      <ul className="text-xs text-blue-700 mt-2 space-y-1 list-disc list-inside">
                        <li>Upload answer key in PDF, Word, or Excel format</li>
                        <li>Format: Q1: A, Q2: B, Q3: C, etc.</li>
                        <li>System will automatically extract correct answers</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <input
                  type="file"
                  ref={answerKeyInputRef}
                  onChange={handleAnswerKeyFileChange}
                  accept=".pdf,.docx,.doc,.xlsx,.xls"
                  className="hidden"
                />

                <FileUploadSection
                  title="Upload Answer Key Document"
                  icon={<FiKey />}
                  type="MODEL_PAPER"
                  uploadedFile={answerKeyFile}
                  onTriggerUpload={() => answerKeyInputRef.current?.click()}
                />

                {answerKeyFile && (
                  <div className="flex justify-end">
                    <Button
                      onClick={uploadAnswerKey}
                      disabled={isUploadingAnswerKey}
                      className="px-6"
                    >
                      {isUploadingAnswerKey ? "Processing..." : "Upload & Extract"}
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Student Submissions List */}
        {assessment.students && assessment.students.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 mt-6">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  <FiUsers className="inline mr-2" />
                  Student Submissions ({assessment.students.length})
                </h2>
                <div className="text-sm text-gray-600">
                  {selectedStudents.length} selected
                </div>
              </div>

              <div className="flex items-center gap-4">
                <input
                  type="text"
                  placeholder="Search by name or registration number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <Button
                  variant="outline"
                  onClick={handleSelectAll}
                  className="whitespace-nowrap"
                >
                  {selectedStudents.length === assessment.students.length
                    ? "Deselect All"
                    : "Select All"}
                </Button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={selectedStudents.length === filteredStudents.length && filteredStudents.length > 0}
                        onChange={handleSelectAll}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Student
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Registration No.
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                      Status
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                      Score
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredStudents.map((student) => (
                    <tr
                      key={student.student_id}
                      className={`hover:bg-gray-50 ${
                        selectedStudents.includes(student.student_id) ? "bg-blue-50" : ""
                      }`}
                    >
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedStudents.includes(student.student_id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedStudents([...selectedStudents, student.student_id]);
                            } else {
                              setSelectedStudents(
                                selectedStudents.filter((id) => id !== student.student_id)
                              );
                            }
                          }}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {student.user.first_name} {student.user.last_name}
                        </div>
                        <div className="text-sm text-gray-500">{student.user.email}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {student.registration_number}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {student.is_evaluated ? (
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                            ✓ Evaluated
                          </span>
                        ) : (
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                            ⏳ Pending
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center text-sm">
                        {student.result ? (
                          <div>
                            <span className="font-medium text-gray-900">
                              {student.result.correct_answers}/{student.result.total_questions}
                            </span>
                            <span className="text-gray-500 ml-2">
                              ({student.result.percentage.toFixed(1)}%)
                            </span>
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredStudents.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">
                  {searchTerm ? "No students found matching your search" : "No submissions yet"}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Evaluation Button */}
        {assessment.answer_key_count > 0 && assessment.students && assessment.students.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  Start Evaluation
                </h3>
                <p className="text-sm text-gray-600">
                  Evaluate selected students against the uploaded answer key
                </p>
              </div>
              <Button
                onClick={startEvaluation}
                disabled={selectedStudents.length === 0 || isEvaluating}
                className="px-6"
              >
                {isEvaluating
                  ? "Evaluating..."
                  : `Evaluate ${selectedStudents.length > 0 ? `(${selectedStudents.length})` : ''}`}
              </Button>
            </div>
          </div>
        )}

        {/* No Submissions Message */}
        {assessment.student_submissions_count === 0 && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 mt-6 text-center">
            <FiUsers className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Student Submissions Yet
            </h3>
            <p className="text-sm text-gray-600">
              Students haven't submitted their bubble sheet answers yet.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}