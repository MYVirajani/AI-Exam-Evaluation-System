// // // // // // src/app/student/assessments/[assessmentId]/bubblesheet/page.tsx
// // // // // "use client";

// // // // // import { useSearchParams, useParams } from "next/navigation";
// // // // // import { useEffect, useState, useRef } from "react";
// // // // // import { FileUploadSection } from "@/components/Upload/FileUploadSection";
// // // // // import Button from "@/components/Button";
// // // // // import toast from "react-hot-toast";
// // // // // import { FiFileText, FiCheckCircle, FiClock, FiAlertCircle } from "react-icons/fi";

// // // // // interface AssessmentData {
// // // // //   assessment_id: string;
// // // // //   type: string;
// // // // //   title: string;
// // // // //   description: string;
// // // // //   deadline: string;
// // // // // }

// // // // // interface BubbleSheetResult {
// // // // //   total_questions: number;
// // // // //   correct_answers: number;
// // // // //   incorrect_answers: number;
// // // // //   unanswered: number;
// // // // //   total_marks: number;
// // // // //   percentage: number;
// // // // //   evaluated_on: string;
// // // // // }

// // // // // interface AssessmentResponse {
// // // // //   module_code: string;
// // // // //   module_name: string;
// // // // //   assessment_data: AssessmentData;
// // // // //   question_paper: { file_url: string } | null;
// // // // //   bubblesheet_result: BubbleSheetResult | null;
// // // // //   has_submitted: boolean;
// // // // //   answer_sheet_url: string | null;
// // // // // }

// // // // // export default function StudentBubbleSheetPage() {
// // // // //   const params = useParams();
// // // // //   const searchParams = useSearchParams();

// // // // //   const moduleId = searchParams.get("moduleId") ?? "";
// // // // //   const assessmentId = params.assessmentId as string;
// // // // //   const studentId = searchParams.get("studentId") ?? "";

// // // // //   const [assessment, setAssessment] = useState<AssessmentResponse | null>(null);
// // // // //   const [loading, setLoading] = useState(true);
// // // // //   const [error, setError] = useState<string | null>(null);

// // // // //   const [answerSheetFile, setAnswerSheetFile] = useState<File | null>(null);
// // // // //   const [isUploading, setIsUploading] = useState(false);
// // // // //   const [uploadProgress, setUploadProgress] = useState(0);
// // // // //   const fileInputRef = useRef<HTMLInputElement>(null);

// // // // //   useEffect(() => {
// // // // //     if (!moduleId || !assessmentId || !studentId) {
// // // // //       setError("Missing required parameters");
// // // // //       setLoading(false);
// // // // //       return;
// // // // //     }

// // // // //     fetchAssessment();
// // // // //   }, [moduleId, assessmentId, studentId]);

// // // // //   const fetchAssessment = async () => {
// // // // //     setLoading(true);
// // // // //     setError(null);
// // // // //     try {
// // // // //       const res = await fetch(
// // // // //         `/api/student/enrollments/${moduleId}/assessment/${assessmentId}/bubblesheet?studentId=${studentId}`
// // // // //       );
      
// // // // //       if (!res.ok) {
// // // // //         const errData = await res.json();
// // // // //         throw new Error(errData.message || "Failed to fetch assessment");
// // // // //       }

// // // // //       const data: AssessmentResponse = await res.json();
// // // // //       setAssessment(data);
// // // // //     } catch (err) {
// // // // //       setError(err instanceof Error ? err.message : "Unknown error");
// // // // //     } finally {
// // // // //       setLoading(false);
// // // // //     }
// // // // //   };

// // // // //   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
// // // // //     const file = e.target.files?.[0];
// // // // //     if (!file) return;

// // // // //     const allowedTypes = ['.png', '.jpg', '.jpeg', '.PNG', '.JPG', '.JPEG'];
// // // // //     const isValidType = allowedTypes.some((ext) =>
// // // // //       file.name.toLowerCase().endsWith(ext.toLowerCase())
// // // // //     );
    
// // // // //     if (!isValidType) {
// // // // //       toast.error("Invalid file type. Please upload an image (PNG, JPG, JPEG)");
// // // // //       return;
// // // // //     }

// // // // //     const maxSize = 10 * 1024 * 1024; // 10MB
// // // // //     if (file.size > maxSize) {
// // // // //       toast.error("File size exceeds 10MB limit");
// // // // //       return;
// // // // //     }

// // // // //     setAnswerSheetFile(file);
// // // // //     e.target.value = "";
// // // // //   };

// // // // //   const handleUpload = async () => {
// // // // //     if (!answerSheetFile) return;

// // // // //     const toastId = toast.loading("Processing bubble sheet...");
// // // // //     setIsUploading(true);
// // // // //     setUploadProgress(0);

// // // // //     try {
// // // // //       const formData = new FormData();
// // // // //       formData.append("file", answerSheetFile);
// // // // //       formData.append("studentId", studentId);
// // // // //       formData.append("assessmentId", assessmentId);
// // // // //       formData.append("moduleId", moduleId);

// // // // //       const uploadUrl = `/api/student/bubblesheet/upload`;

// // // // //       // Simulate progress
// // // // //       const progressInterval = setInterval(() => {
// // // // //         setUploadProgress(prev => Math.min(prev + 10, 90));
// // // // //       }, 200);

// // // // //       const res = await fetch(uploadUrl, {
// // // // //         method: "POST",
// // // // //         body: formData,
// // // // //       });

// // // // //       clearInterval(progressInterval);
// // // // //       setUploadProgress(100);

// // // // //       if (!res.ok) {
// // // // //         const err = await res.json();
// // // // //         throw new Error(err.message || "Upload failed");
// // // // //       }

// // // // //       const result = await res.json();
      
// // // // //       toast.success(
// // // // //         `Bubble sheet processed successfully! Detected ${result.answers_count} answers.`,
// // // // //         { id: toastId }
// // // // //       );

// // // // //       // Refresh assessment data
// // // // //       await fetchAssessment();
// // // // //       setAnswerSheetFile(null);
// // // // //       setUploadProgress(0);
// // // // //     } catch (error) {
// // // // //       toast.error(
// // // // //         error instanceof Error ? error.message : "Upload failed",
// // // // //         { id: toastId }
// // // // //       );
// // // // //       setUploadProgress(0);
// // // // //     } finally {
// // // // //       setIsUploading(false);
// // // // //     }
// // // // //   };

// // // // //   const triggerFileInput = () => {
// // // // //     fileInputRef.current?.click();
// // // // //   };

// // // // //   const formatDate = (dateString: string) => {
// // // // //     return new Date(dateString).toLocaleDateString("en-US", {
// // // // //       year: "numeric",
// // // // //       month: "long",
// // // // //       day: "numeric",
// // // // //       hour: "2-digit",
// // // // //       minute: "2-digit",
// // // // //     });
// // // // //   };

// // // // //   const getStatusBadge = () => {
// // // // //     if (assessment?.bubblesheet_result) {
// // // // //       return (
// // // // //         <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
// // // // //           <FiCheckCircle className="mr-1" />
// // // // //           Evaluated
// // // // //         </span>
// // // // //       );
// // // // //     }
// // // // //     if (assessment?.has_submitted) {
// // // // //       return (
// // // // //         <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
// // // // //           <FiClock className="mr-1" />
// // // // //           Submitted
// // // // //         </span>
// // // // //       );
// // // // //     }
// // // // //     const deadline = new Date(assessment?.assessment_data.deadline || "");
// // // // //     const now = new Date();
// // // // //     if (now > deadline) {
// // // // //       return (
// // // // //         <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
// // // // //           <FiAlertCircle className="mr-1" />
// // // // //           Overdue
// // // // //         </span>
// // // // //       );
// // // // //     }
// // // // //     return (
// // // // //       <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
// // // // //         <FiClock className="mr-1" />
// // // // //         Pending
// // // // //       </span>
// // // // //     );
// // // // //   };

// // // // //   if (loading) {
// // // // //     return (
// // // // //       <div className="min-h-screen bg-gray-50 flex items-center justify-center">
// // // // //         <div className="flex items-center space-x-2">
// // // // //           <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
// // // // //           <span className="text-lg text-gray-600">Loading assessment...</span>
// // // // //         </div>
// // // // //       </div>
// // // // //     );
// // // // //   }

// // // // //   if (error || !assessment) {
// // // // //     return (
// // // // //       <div className="min-h-screen bg-gray-50 flex items-center justify-center">
// // // // //         <div className="bg-white p-8 rounded-lg shadow-md border border-red-200">
// // // // //           <div className="flex items-center space-x-3">
// // // // //             <FiAlertCircle className="h-8 w-8 text-red-500" />
// // // // //             <div>
// // // // //               <h3 className="text-lg font-medium text-red-800">Error</h3>
// // // // //               <p className="text-red-600 mt-1">{error || "Assessment not found"}</p>
// // // // //             </div>
// // // // //           </div>
// // // // //         </div>
// // // // //       </div>
// // // // //     );
// // // // //   }

// // // // //   return (
// // // // //     <div className="min-h-screen bg-gray-50">
// // // // //       <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
// // // // //         {/* Header */}
// // // // //         <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
// // // // //           <div className="flex items-start justify-between">
// // // // //             <div>
// // // // //               <h1 className="text-2xl font-bold text-gray-900 mb-2">
// // // // //                 {assessment.module_code} - {assessment.module_name}
// // // // //               </h1>
// // // // //               <p className="text-sm text-gray-500">Bubble Sheet Assessment</p>
// // // // //             </div>
// // // // //             {getStatusBadge()}
// // // // //           </div>
// // // // //         </div>

// // // // //         {/* Assessment Information */}
// // // // //         <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
// // // // //           <div className="border-b border-gray-200 pb-4 mb-4">
// // // // //             <h2 className="text-xl font-semibold text-gray-900 mb-2">
// // // // //               {assessment.assessment_data.title}
// // // // //             </h2>
// // // // //             <div className="flex items-center space-x-4 text-sm text-gray-600">
// // // // //               <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded font-medium">
// // // // //                 Multiple Choice (MCQ)
// // // // //               </span>
// // // // //               <span>Due: {formatDate(assessment.assessment_data.deadline)}</span>
// // // // //             </div>
// // // // //           </div>

// // // // //           {assessment.assessment_data.description && (
// // // // //             <div className="mb-4">
// // // // //               <h3 className="text-sm font-medium text-gray-900 mb-2">Description</h3>
// // // // //               <p className="text-gray-700">{assessment.assessment_data.description}</p>
// // // // //             </div>
// // // // //           )}

// // // // //           {/* Question Paper */}
// // // // //           {assessment.question_paper && (
// // // // //             <div className="mb-4">
// // // // //               <h3 className="text-sm font-medium text-gray-900 mb-2">Question Paper</h3>
// // // // //               <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
// // // // //                 <FiFileText className="h-5 w-5 text-blue-600" />
// // // // //                 <div className="flex-1">
// // // // //                   <a
// // // // //                     href={assessment.question_paper.file_url}
// // // // //                     target="_blank"
// // // // //                     rel="noopener noreferrer"
// // // // //                     className="font-medium text-blue-700 hover:text-blue-800 underline"
// // // // //                   >
// // // // //                     Download Question Paper
// // // // //                   </a>
// // // // //                 </div>
// // // // //               </div>
// // // // //             </div>
// // // // //           )}
// // // // //         </div>

// // // // //         {/* Upload Section */}
// // // // //         <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
// // // // //           <h3 className="text-lg font-semibold text-gray-900 mb-4">
// // // // //             Answer Sheet Submission
// // // // //           </h3>

// // // // //           {assessment.has_submitted && !assessment.bubblesheet_result ? (
// // // // //             <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
// // // // //               <div className="flex items-center space-x-3">
// // // // //                 <FiClock className="h-5 w-5 text-blue-600" />
// // // // //                 <div>
// // // // //                   <p className="font-medium text-blue-800">Submitted - Awaiting Evaluation</p>
// // // // //                   <p className="text-sm text-blue-600 mt-1">
// // // // //                     Your answer sheet has been submitted. Results will appear here once evaluated.
// // // // //                   </p>
// // // // //                 </div>
// // // // //               </div>
// // // // //             </div>
// // // // //           ) : assessment.bubblesheet_result ? (
// // // // //             <div className="p-4 bg-green-50 rounded-lg border border-green-200">
// // // // //               <div className="flex items-center space-x-3">
// // // // //                 <FiCheckCircle className="h-5 w-5 text-green-600" />
// // // // //                 <div>
// // // // //                   <p className="font-medium text-green-800">Submission Completed & Evaluated</p>
// // // // //                   <p className="text-sm text-green-600 mt-1">
// // // // //                     Your results are available below.
// // // // //                   </p>
// // // // //                 </div>
// // // // //               </div>
// // // // //             </div>
// // // // //           ) : (
// // // // //             <div className="space-y-4">
// // // // //               <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
// // // // //                 <div className="flex items-start space-x-2">
// // // // //                   <FiAlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
// // // // //                   <div>
// // // // //                     <p className="text-sm font-medium text-yellow-800">
// // // // //                       Upload Instructions
// // // // //                     </p>
// // // // //                     <ul className="text-xs text-yellow-700 mt-2 space-y-1 list-disc list-inside">
// // // // //                       <li>Upload a clear image of your filled bubble sheet</li>
// // // // //                       <li>Supported formats: PNG, JPG, JPEG</li>
// // // // //                       <li>Maximum file size: 10MB</li>
// // // // //                       <li>Ensure all marked bubbles are clearly visible</li>
// // // // //                     </ul>
// // // // //                   </div>
// // // // //                 </div>
// // // // //               </div>

// // // // //               <FileUploadSection
// // // // //                 title="Upload Bubble Sheet Image"
// // // // //                 type="ANSWER_SCRIPT"
// // // // //                 icon={<FiFileText />}
// // // // //                 uploadedFile={answerSheetFile}
// // // // //                 onTriggerUpload={triggerFileInput}
// // // // //               />

// // // // //               <input
// // // // //                 type="file"
// // // // //                 ref={fileInputRef}
// // // // //                 onChange={handleFileChange}
// // // // //                 accept=".png,.jpg,.jpeg"
// // // // //                 className="hidden"
// // // // //               />

// // // // //               {answerSheetFile && (
// // // // //                 <div className="space-y-3">
// // // // //                   <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
// // // // //                     <div className="flex items-center space-x-3">
// // // // //                       <FiFileText className="h-5 w-5 text-green-600" />
// // // // //                       <div>
// // // // //                         <p className="text-sm font-medium text-gray-900">
// // // // //                           {answerSheetFile.name}
// // // // //                         </p>
// // // // //                         <p className="text-xs text-gray-500">
// // // // //                           {(answerSheetFile.size / (1024 * 1024)).toFixed(2)} MB
// // // // //                         </p>
// // // // //                       </div>
// // // // //                     </div>
// // // // //                   </div>

// // // // //                   {isUploading && (
// // // // //                     <div className="space-y-2">
// // // // //                       <div className="flex items-center justify-between text-sm text-gray-600">
// // // // //                         <span>Processing...</span>
// // // // //                         <span>{uploadProgress}%</span>
// // // // //                       </div>
// // // // //                       <div className="w-full bg-gray-200 rounded-full h-2">
// // // // //                         <div
// // // // //                           className="bg-blue-600 h-2 rounded-full transition-all duration-300"
// // // // //                           style={{ width: `${uploadProgress}%` }}
// // // // //                         />
// // // // //                       </div>
// // // // //                     </div>
// // // // //                   )}

// // // // //                   <Button
// // // // //                     onClick={handleUpload}
// // // // //                     disabled={isUploading}
// // // // //                     className="w-full"
// // // // //                   >
// // // // //                     {isUploading ? "Processing..." : "Upload & Process"}
// // // // //                   </Button>
// // // // //                 </div>
// // // // //               )}
// // // // //             </div>
// // // // //           )}
// // // // //         </div>

// // // // //         {/* Results Section */}
// // // // //         {assessment.bubblesheet_result && (
// // // // //           <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
// // // // //             <h3 className="text-lg font-semibold text-gray-900 mb-4">
// // // // //               Your Results
// // // // //             </h3>

// // // // //             <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
// // // // //               <div className="p-4 bg-green-50 rounded-lg border border-green-200">
// // // // //                 <div className="text-center">
// // // // //                   <p className="text-2xl font-bold text-green-900">
// // // // //                     {assessment.bubblesheet_result.correct_answers}
// // // // //                   </p>
// // // // //                   <p className="text-sm text-green-600">Correct</p>
// // // // //                 </div>
// // // // //               </div>
// // // // //               <div className="p-4 bg-red-50 rounded-lg border border-red-200">
// // // // //                 <div className="text-center">
// // // // //                   <p className="text-2xl font-bold text-red-900">
// // // // //                     {assessment.bubblesheet_result.incorrect_answers}
// // // // //                   </p>
// // // // //                   <p className="text-sm text-red-600">Incorrect</p>
// // // // //                 </div>
// // // // //               </div>
// // // // //               <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
// // // // //                 <div className="text-center">
// // // // //                   <p className="text-2xl font-bold text-gray-900">
// // // // //                     {assessment.bubblesheet_result.unanswered}
// // // // //                   </p>
// // // // //                   <p className="text-sm text-gray-600">Unanswered</p>
// // // // //                 </div>
// // // // //               </div>
// // // // //               <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
// // // // //                 <div className="text-center">
// // // // //                   <p className="text-2xl font-bold text-blue-900">
// // // // //                     {assessment.bubblesheet_result.total_questions}
// // // // //                   </p>
// // // // //                   <p className="text-sm text-blue-600">Total Questions</p>
// // // // //                 </div>
// // // // //               </div>
// // // // //             </div>

// // // // //             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
// // // // //               <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
// // // // //                 <div className="text-center">
// // // // //                   <p className="text-3xl font-bold text-purple-900">
// // // // //                     {assessment.bubblesheet_result.total_marks}
// // // // //                   </p>
// // // // //                   <p className="text-sm text-purple-600">Total Marks</p>
// // // // //                 </div>
// // // // //               </div>
// // // // //               <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-200">
// // // // //                 <div className="text-center">
// // // // //                   <p className="text-3xl font-bold text-indigo-900">
// // // // //                     {assessment.bubblesheet_result.percentage.toFixed(1)}%
// // // // //                   </p>
// // // // //                   <p className="text-sm text-indigo-600">Percentage</p>
// // // // //                 </div>
// // // // //               </div>
// // // // //             </div>

// // // // //             <div className="mt-4 text-center text-sm text-gray-600">
// // // // //               Evaluated on: {formatDate(assessment.bubblesheet_result.evaluated_on)}
// // // // //             </div>
// // // // //           </div>
// // // // //         )}
// // // // //       </div>
// // // // //     </div>
// // // // //   );
// // // // // }

// // // // // src/app/student/assessments/[assessmentId]/bubblesheet/page.tsx
// // // // "use client";

// // // // import { useSearchParams, useParams } from "next/navigation";
// // // // import { useEffect, useState, useRef } from "react";
// // // // import { FileUploadSection } from "@/components/Upload/FileUploadSection";
// // // // import Button from "@/components/Button";
// // // // import toast from "react-hot-toast";
// // // // import { FiFileText, FiCheckCircle, FiClock, FiAlertCircle } from "react-icons/fi";

// // // // interface AssessmentData {
// // // //   assessment_id: string;
// // // //   type: string;
// // // //   title: string;
// // // //   description: string;
// // // //   deadline: string;
// // // // }

// // // // interface BubbleSheetResult {
// // // //   total_questions: number;
// // // //   correct_answers: number;
// // // //   incorrect_answers: number;
// // // //   unanswered: number;
// // // //   total_marks: number;
// // // //   percentage: number;
// // // //   evaluated_on: string;
// // // // }

// // // // interface AssessmentResponse {
// // // //   module_code: string;
// // // //   module_name: string;
// // // //   assessment_data: AssessmentData;
// // // //   question_paper: { file_url: string } | null;
// // // //   bubblesheet_result: BubbleSheetResult | null;
// // // //   has_submitted: boolean;
// // // //   answer_sheet_url: string | null;
// // // // }

// // // // export default function StudentBubbleSheetPage() {
// // // //   const params = useParams();
// // // //   const searchParams = useSearchParams();

// // // //   const moduleId = searchParams.get("moduleId") ?? "";
// // // //   const assessmentId = params.assessmentId as string;
// // // //   const studentId = searchParams.get("studentId") ?? "";

// // // //   const [assessment, setAssessment] = useState<AssessmentResponse | null>(null);
// // // //   const [loading, setLoading] = useState(true);
// // // //   const [error, setError] = useState<string | null>(null);

// // // //   const [answerSheetFile, setAnswerSheetFile] = useState<File | null>(null);
// // // //   const [isUploading, setIsUploading] = useState(false);
// // // //   const [uploadProgress, setUploadProgress] = useState(0);
// // // //   const fileInputRef = useRef<HTMLInputElement>(null);

// // // //   useEffect(() => {
// // // //     if (!moduleId || !assessmentId || !studentId) {
// // // //       setError("Missing required parameters");
// // // //       setLoading(false);
// // // //       return;
// // // //     }

// // // //     fetchAssessment();
// // // //   }, [moduleId, assessmentId, studentId]);

// // // //   const fetchAssessment = async () => {
// // // //     setLoading(true);
// // // //     setError(null);
// // // //     try {
// // // //       const res = await fetch(
// // // //         `/api/student/enrollments/${moduleId}/assessment/${assessmentId}/bubblesheet?studentId=${studentId}`
// // // //       );
      
// // // //       if (!res.ok) {
// // // //         const errData = await res.json();
// // // //         throw new Error(errData.message || "Failed to fetch assessment");
// // // //       }

// // // //       const data: AssessmentResponse = await res.json();
// // // //       setAssessment(data);
// // // //     } catch (err) {
// // // //       setError(err instanceof Error ? err.message : "Unknown error");
// // // //     } finally {
// // // //       setLoading(false);
// // // //     }
// // // //   };

// // // //   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
// // // //     const file = e.target.files?.[0];
// // // //     if (!file) return;

// // // //     const allowedTypes = ['.png', '.jpg', '.jpeg', '.PNG', '.JPG', '.JPEG'];
// // // //     const isValidType = allowedTypes.some((ext) =>
// // // //       file.name.toLowerCase().endsWith(ext.toLowerCase())
// // // //     );
    
// // // //     if (!isValidType) {
// // // //       toast.error("Invalid file type. Please upload an image (PNG, JPG, JPEG)");
// // // //       return;
// // // //     }

// // // //     const maxSize = 10 * 1024 * 1024; // 10MB
// // // //     if (file.size > maxSize) {
// // // //       toast.error("File size exceeds 10MB limit");
// // // //       return;
// // // //     }

// // // //     setAnswerSheetFile(file);
// // // //     e.target.value = "";
// // // //   };

// // // //   const handleUpload = async () => {
// // // //     if (!answerSheetFile) return;

// // // //     const toastId = toast.loading("Processing bubble sheet...");
// // // //     setIsUploading(true);
// // // //     setUploadProgress(0);

// // // //     try {
// // // //       const formData = new FormData();
// // // //       formData.append("file", answerSheetFile);

// // // //       const uploadUrl = `/api/student/bubblesheet/upload?studentId=${studentId}&assessmentId=${assessmentId}&moduleId=${moduleId}`;

// // // //       // Simulate progress
// // // //       const progressInterval = setInterval(() => {
// // // //         setUploadProgress(prev => Math.min(prev + 10, 90));
// // // //       }, 200);

// // // //       const res = await fetch(uploadUrl, {
// // // //         method: "POST",
// // // //         body: formData,
// // // //       });

// // // //       clearInterval(progressInterval);
// // // //       setUploadProgress(100);

// // // //       if (!res.ok) {
// // // //         const err = await res.json();
// // // //         throw new Error(err.error || err.message || "Upload failed");
// // // //       }

// // // //       const result = await res.json();
      
// // // //       toast.success(
// // // //         `Bubble sheet processed successfully! Detected ${result.answers_count} answers.`,
// // // //         { id: toastId }
// // // //       );

// // // //       // Refresh assessment data
// // // //       await fetchAssessment();
// // // //       setAnswerSheetFile(null);
// // // //       setUploadProgress(0);
// // // //     } catch (error) {
// // // //       console.error("Upload error:", error);
// // // //       toast.error(
// // // //         error instanceof Error ? error.message : "Upload failed",
// // // //         { id: toastId }
// // // //       );
// // // //       setUploadProgress(0);
// // // //     } finally {
// // // //       setIsUploading(false);
// // // //     }
// // // //   };

// // // //   const triggerFileInput = () => {
// // // //     fileInputRef.current?.click();
// // // //   };

// // // //   const formatDate = (dateString: string) => {
// // // //     return new Date(dateString).toLocaleDateString("en-US", {
// // // //       year: "numeric",
// // // //       month: "long",
// // // //       day: "numeric",
// // // //       hour: "2-digit",
// // // //       minute: "2-digit",
// // // //     });
// // // //   };

// // // //   const getStatusBadge = () => {
// // // //     if (assessment?.bubblesheet_result) {
// // // //       return (
// // // //         <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
// // // //           <FiCheckCircle className="mr-1" />
// // // //           Evaluated
// // // //         </span>
// // // //       );
// // // //     }
// // // //     if (assessment?.has_submitted) {
// // // //       return (
// // // //         <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
// // // //           <FiClock className="mr-1" />
// // // //           Submitted
// // // //         </span>
// // // //       );
// // // //     }
// // // //     const deadline = new Date(assessment?.assessment_data.deadline || "");
// // // //     const now = new Date();
// // // //     if (now > deadline) {
// // // //       return (
// // // //         <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
// // // //           <FiAlertCircle className="mr-1" />
// // // //           Overdue
// // // //         </span>
// // // //       );
// // // //     }
// // // //     return (
// // // //       <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
// // // //         <FiClock className="mr-1" />
// // // //         Pending
// // // //       </span>
// // // //     );
// // // //   };

// // // //   if (loading) {
// // // //     return (
// // // //       <div className="min-h-screen bg-gray-50 flex items-center justify-center">
// // // //         <div className="flex items-center space-x-2">
// // // //           <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
// // // //           <span className="text-lg text-gray-600">Loading assessment...</span>
// // // //         </div>
// // // //       </div>
// // // //     );
// // // //   }

// // // //   if (error || !assessment) {
// // // //     return (
// // // //       <div className="min-h-screen bg-gray-50 flex items-center justify-center">
// // // //         <div className="bg-white p-8 rounded-lg shadow-md border border-red-200">
// // // //           <div className="flex items-center space-x-3">
// // // //             <FiAlertCircle className="h-8 w-8 text-red-500" />
// // // //             <div>
// // // //               <h3 className="text-lg font-medium text-red-800">Error</h3>
// // // //               <p className="text-red-600 mt-1">{error || "Assessment not found"}</p>
// // // //             </div>
// // // //           </div>
// // // //         </div>
// // // //       </div>
// // // //     );
// // // //   }

// // // //   return (
// // // //     <div className="min-h-screen bg-gray-50">
// // // //       <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
// // // //         {/* Header */}
// // // //         <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
// // // //           <div className="flex items-start justify-between">
// // // //             <div>
// // // //               <h1 className="text-2xl font-bold text-gray-900 mb-2">
// // // //                 {assessment.module_code} - {assessment.module_name}
// // // //               </h1>
// // // //               <p className="text-sm text-gray-500">Bubble Sheet Assessment</p>
// // // //             </div>
// // // //             {getStatusBadge()}
// // // //           </div>
// // // //         </div>

// // // //         {/* Assessment Information */}
// // // //         <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
// // // //           <div className="border-b border-gray-200 pb-4 mb-4">
// // // //             <h2 className="text-xl font-semibold text-gray-900 mb-2">
// // // //               {assessment.assessment_data.title}
// // // //             </h2>
// // // //             <div className="flex items-center space-x-4 text-sm text-gray-600">
// // // //               <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded font-medium">
// // // //                 Multiple Choice (MCQ)
// // // //               </span>
// // // //               <span>Due: {formatDate(assessment.assessment_data.deadline)}</span>
// // // //             </div>
// // // //           </div>

// // // //           {assessment.assessment_data.description && (
// // // //             <div className="mb-4">
// // // //               <h3 className="text-sm font-medium text-gray-900 mb-2">Description</h3>
// // // //               <p className="text-gray-700">{assessment.assessment_data.description}</p>
// // // //             </div>
// // // //           )}

// // // //           {/* Question Paper */}
// // // //           {assessment.question_paper && (
// // // //             <div className="mb-4">
// // // //               <h3 className="text-sm font-medium text-gray-900 mb-2">Question Paper</h3>
// // // //               <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
// // // //                 <FiFileText className="h-5 w-5 text-blue-600" />
// // // //                 <div className="flex-1">
// // // //                   <a
// // // //                     href={assessment.question_paper.file_url}
// // // //                     target="_blank"
// // // //                     rel="noopener noreferrer"
// // // //                     className="font-medium text-blue-700 hover:text-blue-800 underline"
// // // //                   >
// // // //                     Download Question Paper
// // // //                   </a>
// // // //                 </div>
// // // //               </div>
// // // //             </div>
// // // //           )}
// // // //         </div>

// // // //         {/* Upload Section */}
// // // //         <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
// // // //           <h3 className="text-lg font-semibold text-gray-900 mb-4">
// // // //             Answer Sheet Submission
// // // //           </h3>

// // // //           {assessment.has_submitted && !assessment.bubblesheet_result ? (
// // // //             <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
// // // //               <div className="flex items-center space-x-3">
// // // //                 <FiClock className="h-5 w-5 text-blue-600" />
// // // //                 <div>
// // // //                   <p className="font-medium text-blue-800">Submitted - Awaiting Evaluation</p>
// // // //                   <p className="text-sm text-blue-600 mt-1">
// // // //                     Your answer sheet has been submitted. Results will appear here once evaluated.
// // // //                   </p>
// // // //                 </div>
// // // //               </div>
// // // //             </div>
// // // //           ) : assessment.bubblesheet_result ? (
// // // //             <div className="p-4 bg-green-50 rounded-lg border border-green-200">
// // // //               <div className="flex items-center space-x-3">
// // // //                 <FiCheckCircle className="h-5 w-5 text-green-600" />
// // // //                 <div>
// // // //                   <p className="font-medium text-green-800">Submission Completed & Evaluated</p>
// // // //                   <p className="text-sm text-green-600 mt-1">
// // // //                     Your results are available below.
// // // //                   </p>
// // // //                 </div>
// // // //               </div>
// // // //             </div>
// // // //           ) : (
// // // //             <div className="space-y-4">
// // // //               <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
// // // //                 <div className="flex items-start space-x-2">
// // // //                   <FiAlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
// // // //                   <div>
// // // //                     <p className="text-sm font-medium text-yellow-800">
// // // //                       Upload Instructions
// // // //                     </p>
// // // //                     <ul className="text-xs text-yellow-700 mt-2 space-y-1 list-disc list-inside">
// // // //                       <li>Upload a clear image of your filled bubble sheet</li>
// // // //                       <li>Supported formats: PNG, JPG, JPEG</li>
// // // //                       <li>Maximum file size: 10MB</li>
// // // //                       <li>Ensure all marked bubbles are clearly visible</li>
// // // //                     </ul>
// // // //                   </div>
// // // //                 </div>
// // // //               </div>

// // // //               <FileUploadSection
// // // //                 title="Upload Bubble Sheet Image"
// // // //                 type="ANSWER_SCRIPT"
// // // //                 icon={<FiFileText />}
// // // //                 uploadedFile={answerSheetFile}
// // // //                 onTriggerUpload={triggerFileInput}
// // // //               />

// // // //               <input
// // // //                 type="file"
// // // //                 ref={fileInputRef}
// // // //                 onChange={handleFileChange}
// // // //                 accept=".png,.jpg,.jpeg"
// // // //                 className="hidden"
// // // //               />

// // // //               {answerSheetFile && (
// // // //                 <div className="space-y-3">
// // // //                   <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
// // // //                     <div className="flex items-center space-x-3">
// // // //                       <FiFileText className="h-5 w-5 text-green-600" />
// // // //                       <div>
// // // //                         <p className="text-sm font-medium text-gray-900">
// // // //                           {answerSheetFile.name}
// // // //                         </p>
// // // //                         <p className="text-xs text-gray-500">
// // // //                           {(answerSheetFile.size / (1024 * 1024)).toFixed(2)} MB
// // // //                         </p>
// // // //                       </div>
// // // //                     </div>
// // // //                   </div>

// // // //                   {isUploading && (
// // // //                     <div className="space-y-2">
// // // //                       <div className="flex items-center justify-between text-sm text-gray-600">
// // // //                         <span>Processing...</span>
// // // //                         <span>{uploadProgress}%</span>
// // // //                       </div>
// // // //                       <div className="w-full bg-gray-200 rounded-full h-2">
// // // //                         <div
// // // //                           className="bg-blue-600 h-2 rounded-full transition-all duration-300"
// // // //                           style={{ width: `${uploadProgress}%` }}
// // // //                         />
// // // //                       </div>
// // // //                     </div>
// // // //                   )}

// // // //                   <Button
// // // //                     onClick={handleUpload}
// // // //                     disabled={isUploading}
// // // //                     className="w-full"
// // // //                   >
// // // //                     {isUploading ? "Processing..." : "Upload & Process"}
// // // //                   </Button>
// // // //                 </div>
// // // //               )}
// // // //             </div>
// // // //           )}
// // // //         </div>

// // // //         {/* Results Section */}
// // // //         {assessment.bubblesheet_result && (
// // // //           <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
// // // //             <h3 className="text-lg font-semibold text-gray-900 mb-4">
// // // //               Your Results
// // // //             </h3>

// // // //             <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
// // // //               <div className="p-4 bg-green-50 rounded-lg border border-green-200">
// // // //                 <div className="text-center">
// // // //                   <p className="text-2xl font-bold text-green-900">
// // // //                     {assessment.bubblesheet_result.correct_answers}
// // // //                   </p>
// // // //                   <p className="text-sm text-green-600">Correct</p>
// // // //                 </div>
// // // //               </div>
// // // //               <div className="p-4 bg-red-50 rounded-lg border border-red-200">
// // // //                 <div className="text-center">
// // // //                   <p className="text-2xl font-bold text-red-900">
// // // //                     {assessment.bubblesheet_result.incorrect_answers}
// // // //                   </p>
// // // //                   <p className="text-sm text-red-600">Incorrect</p>
// // // //                 </div>
// // // //               </div>
// // // //               <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
// // // //                 <div className="text-center">
// // // //                   <p className="text-2xl font-bold text-gray-900">
// // // //                     {assessment.bubblesheet_result.unanswered}
// // // //                   </p>
// // // //                   <p className="text-sm text-gray-600">Unanswered</p>
// // // //                 </div>
// // // //               </div>
// // // //               <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
// // // //                 <div className="text-center">
// // // //                   <p className="text-2xl font-bold text-blue-900">
// // // //                     {assessment.bubblesheet_result.total_questions}
// // // //                   </p>
// // // //                   <p className="text-sm text-blue-600">Total Questions</p>
// // // //                 </div>
// // // //               </div>
// // // //             </div>

// // // //             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
// // // //               <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
// // // //                 <div className="text-center">
// // // //                   <p className="text-3xl font-bold text-purple-900">
// // // //                     {assessment.bubblesheet_result.total_marks}
// // // //                   </p>
// // // //                   <p className="text-sm text-purple-600">Total Marks</p>
// // // //                 </div>
// // // //               </div>
// // // //               <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-200">
// // // //                 <div className="text-center">
// // // //                   <p className="text-3xl font-bold text-indigo-900">
// // // //                     {assessment.bubblesheet_result.percentage.toFixed(1)}%
// // // //                   </p>
// // // //                   <p className="text-sm text-indigo-600">Percentage</p>
// // // //                 </div>
// // // //               </div>
// // // //             </div>

// // // //             <div className="mt-4 text-center text-sm text-gray-600">
// // // //               Evaluated on: {formatDate(assessment.bubblesheet_result.evaluated_on)}
// // // //             </div>
// // // //           </div>
// // // //         )}
// // // //       </div>
// // // //     </div>
// // // //   );
// // // // }

// // // // src/app/student/assessments/[assessmentId]/bubblesheet/page.tsx
// // // "use client";

// // // import { useSearchParams, useParams } from "next/navigation";
// // // import { useEffect, useState, useRef } from "react";
// // // import { FileUploadSection } from "@/components/Upload/FileUploadSection";
// // // import Button from "@/components/Button";
// // // import toast from "react-hot-toast";
// // // import { FiFileText, FiCheckCircle, FiClock, FiAlertCircle } from "react-icons/fi";

// // // interface AssessmentData {
// // //   assessment_id: string;
// // //   type: string;
// // //   title: string;
// // //   description: string;
// // //   deadline: string;
// // // }

// // // interface BubbleSheetResult {
// // //   total_questions: number;
// // //   correct_answers: number;
// // //   incorrect_answers: number;
// // //   unanswered: number;
// // //   total_marks: number;
// // //   percentage: number;
// // //   evaluated_on: string;
// // // }

// // // interface AssessmentResponse {
// // //   module_code: string;
// // //   module_name: string;
// // //   assessment_data: AssessmentData;
// // //   question_paper: { file_url: string } | null;
// // //   bubblesheet_result: BubbleSheetResult | null;
// // //   has_submitted: boolean;
// // //   answer_sheet_url: string | null;
// // // }

// // // export default function StudentBubbleSheetPage() {
// // //   const params = useParams();
// // //   const searchParams = useSearchParams();

// // //   const moduleId = searchParams.get("moduleId") ?? "";
// // //   const assessmentId = params.assessmentId as string;
// // //   const studentId = searchParams.get("studentId") ?? "";

// // //   const [assessment, setAssessment] = useState<AssessmentResponse | null>(null);
// // //   const [loading, setLoading] = useState(true);
// // //   const [error, setError] = useState<string | null>(null);

// // //   const [answerSheetFile, setAnswerSheetFile] = useState<File | null>(null);
// // //   const [isUploading, setIsUploading] = useState(false);
// // //   const [uploadProgress, setUploadProgress] = useState(0);
// // //   const fileInputRef = useRef<HTMLInputElement>(null);

// // //   useEffect(() => {
// // //     if (!moduleId || !assessmentId || !studentId) {
// // //       setError("Missing required parameters");
// // //       setLoading(false);
// // //       return;
// // //     }

// // //     fetchAssessment();
// // //   }, [moduleId, assessmentId, studentId]);

// // //   const fetchAssessment = async () => {
// // //     setLoading(true);
// // //     setError(null);
// // //     try {
// // //       const res = await fetch(
// // //         `/api/student/enrollments/${moduleId}/assessment/${assessmentId}/bubblesheet?studentId=${studentId}`
// // //       );
      
// // //       if (!res.ok) {
// // //         const errData = await res.json();
// // //         throw new Error(errData.message || "Failed to fetch assessment");
// // //       }

// // //       const data: AssessmentResponse = await res.json();
// // //       setAssessment(data);
// // //     } catch (err) {
// // //       setError(err instanceof Error ? err.message : "Unknown error");
// // //     } finally {
// // //       setLoading(false);
// // //     }
// // //   };

// // //   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
// // //     const file = e.target.files?.[0];
// // //     if (!file) return;

// // //     const allowedTypes = ['.png', '.jpg', '.jpeg', '.PNG', '.JPG', '.JPEG'];
// // //     const isValidType = allowedTypes.some((ext) =>
// // //       file.name.toLowerCase().endsWith(ext.toLowerCase())
// // //     );
    
// // //     if (!isValidType) {
// // //       toast.error("Invalid file type. Please upload an image (PNG, JPG, JPEG)");
// // //       return;
// // //     }

// // //     const maxSize = 10 * 1024 * 1024; // 10MB
// // //     if (file.size > maxSize) {
// // //       toast.error("File size exceeds 10MB limit");
// // //       return;
// // //     }

// // //     setAnswerSheetFile(file);
// // //     e.target.value = "";
// // //   };

// // //   const handleUpload = async () => {
// // //     if (!answerSheetFile) return;

// // //     const toastId = toast.loading("Processing bubble sheet...");
// // //     setIsUploading(true);
// // //     setUploadProgress(0);

// // //     try {
// // //       const formData = new FormData();
// // //       formData.append("file", answerSheetFile);

// // //       const uploadUrl = `/api/student/bubblesheet/upload?studentId=${studentId}&assessmentId=${assessmentId}&moduleId=${moduleId}`;

// // //       // Simulate progress
// // //       const progressInterval = setInterval(() => {
// // //         setUploadProgress(prev => Math.min(prev + 10, 90));
// // //       }, 200);

// // //       const res = await fetch(uploadUrl, {
// // //         method: "POST",
// // //         body: formData,
// // //       });

// // //       clearInterval(progressInterval);
// // //       setUploadProgress(100);

// // //       if (!res.ok) {
// // //         const err = await res.json();
// // //         throw new Error(err.error || err.message || "Upload failed");
// // //       }

// // //       const result = await res.json();
      
// // //       toast.success(
// // //         `Bubble sheet processed successfully! Detected ${result.answers_count} answers.`,
// // //         { id: toastId }
// // //       );

// // //       // Refresh assessment data
// // //       await fetchAssessment();
// // //       setAnswerSheetFile(null);
// // //       setUploadProgress(0);
// // //     } catch (error) {
// // //       console.error("Upload error:", error);
// // //       toast.error(
// // //         error instanceof Error ? error.message : "Upload failed",
// // //         { id: toastId }
// // //       );
// // //       setUploadProgress(0);
// // //     } finally {
// // //       setIsUploading(false);
// // //     }
// // //   };

// // //   const triggerFileInput = () => {
// // //     fileInputRef.current?.click();
// // //   };

// // //   const formatDate = (dateString: string) => {
// // //     return new Date(dateString).toLocaleDateString("en-US", {
// // //       year: "numeric",
// // //       month: "long",
// // //       day: "numeric",
// // //       hour: "2-digit",
// // //       minute: "2-digit",
// // //     });
// // //   };

// // //   const getStatusBadge = () => {
// // //     if (assessment?.bubblesheet_result) {
// // //       return (
// // //         <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
// // //           <FiCheckCircle className="mr-1" />
// // //           Evaluated
// // //         </span>
// // //       );
// // //     }
// // //     if (assessment?.has_submitted) {
// // //       return (
// // //         <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
// // //           <FiClock className="mr-1" />
// // //           Submitted
// // //         </span>
// // //       );
// // //     }
// // //     const deadline = new Date(assessment?.assessment_data.deadline || "");
// // //     const now = new Date();
// // //     if (now > deadline) {
// // //       return (
// // //         <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
// // //           <FiAlertCircle className="mr-1" />
// // //           Overdue
// // //         </span>
// // //       );
// // //     }
// // //     return (
// // //       <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
// // //         <FiClock className="mr-1" />
// // //         Pending
// // //       </span>
// // //     );
// // //   };

// // //   if (loading) {
// // //     return (
// // //       <div className="min-h-screen bg-gray-50 flex items-center justify-center">
// // //         <div className="flex items-center space-x-2">
// // //           <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
// // //           <span className="text-lg text-gray-600">Loading assessment...</span>
// // //         </div>
// // //       </div>
// // //     );
// // //   }

// // //   if (error || !assessment) {
// // //     return (
// // //       <div className="min-h-screen bg-gray-50 flex items-center justify-center">
// // //         <div className="bg-white p-8 rounded-lg shadow-md border border-red-200">
// // //           <div className="flex items-center space-x-3">
// // //             <FiAlertCircle className="h-8 w-8 text-red-500" />
// // //             <div>
// // //               <h3 className="text-lg font-medium text-red-800">Error</h3>
// // //               <p className="text-red-600 mt-1">{error || "Assessment not found"}</p>
// // //             </div>
// // //           </div>
// // //         </div>
// // //       </div>
// // //     );
// // //   }

// // //   return (
// // //     <div className="min-h-screen bg-gray-50">
// // //       <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
// // //         {/* Header */}
// // //         <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
// // //           <div className="flex items-start justify-between">
// // //             <div>
// // //               <h1 className="text-2xl font-bold text-gray-900 mb-2">
// // //                 {assessment.module_code} - {assessment.module_name}
// // //               </h1>
// // //               <p className="text-sm text-gray-500">Bubble Sheet Assessment</p>
// // //             </div>
// // //             {getStatusBadge()}
// // //           </div>
// // //         </div>

// // //         {/* Assessment Information */}
// // //         <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
// // //           <div className="border-b border-gray-200 pb-4 mb-4">
// // //             <h2 className="text-xl font-semibold text-gray-900 mb-2">
// // //               {assessment.assessment_data.title}
// // //             </h2>
// // //             <div className="flex items-center space-x-4 text-sm text-gray-600">
// // //               <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded font-medium">
// // //                 Multiple Choice (MCQ)
// // //               </span>
// // //               <span>Due: {formatDate(assessment.assessment_data.deadline)}</span>
// // //             </div>
// // //           </div>

// // //           {assessment.assessment_data.description && (
// // //             <div className="mb-4">
// // //               <h3 className="text-sm font-medium text-gray-900 mb-2">Description</h3>
// // //               <p className="text-gray-700">{assessment.assessment_data.description}</p>
// // //             </div>
// // //           )}

// // //           {/* Question Paper */}
// // //           {assessment.question_paper && (
// // //             <div className="mb-4">
// // //               <h3 className="text-sm font-medium text-gray-900 mb-2">Question Paper</h3>
// // //               <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
// // //                 <FiFileText className="h-5 w-5 text-blue-600" />
// // //                 <div className="flex-1">
// // //                   <a
// // //                     href={assessment.question_paper.file_url}
// // //                     target="_blank"
// // //                     rel="noopener noreferrer"
// // //                     className="font-medium text-blue-700 hover:text-blue-800 underline"
// // //                   >
// // //                     Download Question Paper
// // //                   </a>
// // //                 </div>
// // //               </div>
// // //             </div>
// // //           )}
// // //         </div>

// // //         {/* Upload Section */}
// // //         <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
// // //           <h3 className="text-lg font-semibold text-gray-900 mb-4">
// // //             Answer Sheet Submission
// // //           </h3>

// // //           {assessment.has_submitted && !assessment.bubblesheet_result ? (
// // //             <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
// // //               <div className="flex items-center space-x-3">
// // //                 <FiClock className="h-5 w-5 text-blue-600" />
// // //                 <div>
// // //                   <p className="font-medium text-blue-800">Submitted - Awaiting Evaluation</p>
// // //                   <p className="text-sm text-blue-600 mt-1">
// // //                     Your answer sheet has been submitted. Results will appear here once evaluated.
// // //                   </p>
// // //                 </div>
// // //               </div>
// // //             </div>
// // //           ) : assessment.bubblesheet_result ? (
// // //             <div className="p-4 bg-green-50 rounded-lg border border-green-200">
// // //               <div className="flex items-center space-x-3">
// // //                 <FiCheckCircle className="h-5 w-5 text-green-600" />
// // //                 <div>
// // //                   <p className="font-medium text-green-800">Submission Completed & Evaluated</p>
// // //                   <p className="text-sm text-green-600 mt-1">
// // //                     Your results are available below.
// // //                   </p>
// // //                 </div>
// // //               </div>
// // //             </div>
// // //           ) : (
// // //             <div className="space-y-4">
// // //               <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
// // //                 <div className="flex items-start space-x-2">
// // //                   <FiAlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
// // //                   <div>
// // //                     <p className="text-sm font-medium text-yellow-800">
// // //                       Upload Instructions
// // //                     </p>
// // //                     <ul className="text-xs text-yellow-700 mt-2 space-y-1 list-disc list-inside">
// // //                       <li>Upload a clear image of your filled bubble sheet</li>
// // //                       <li>Supported formats: PNG, JPG, JPEG</li>
// // //                       <li>Maximum file size: 10MB</li>
// // //                       <li>Ensure all marked bubbles are clearly visible</li>
// // //                     </ul>
// // //                   </div>
// // //                 </div>
// // //               </div>

// // //               <FileUploadSection
// // //                 title="Upload Bubble Sheet Image"
// // //                 type="ANSWER_SCRIPT"
// // //                 icon={<FiFileText />}
// // //                 uploadedFile={answerSheetFile}
// // //                 onTriggerUpload={triggerFileInput}
// // //               />

// // //               <input
// // //                 type="file"
// // //                 ref={fileInputRef}
// // //                 onChange={handleFileChange}
// // //                 accept=".png,.jpg,.jpeg"
// // //                 className="hidden"
// // //               />

// // //               {answerSheetFile && (
// // //                 <div className="space-y-3">
// // //                   <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
// // //                     <div className="flex items-center space-x-3">
// // //                       <FiFileText className="h-5 w-5 text-green-600" />
// // //                       <div>
// // //                         <p className="text-sm font-medium text-gray-900">
// // //                           {answerSheetFile.name}
// // //                         </p>
// // //                         <p className="text-xs text-gray-500">
// // //                           {(answerSheetFile.size / (1024 * 1024)).toFixed(2)} MB
// // //                         </p>
// // //                       </div>
// // //                     </div>
// // //                   </div>

// // //                   {isUploading && (
// // //                     <div className="space-y-2">
// // //                       <div className="flex items-center justify-between text-sm text-gray-600">
// // //                         <span>Processing...</span>
// // //                         <span>{uploadProgress}%</span>
// // //                       </div>
// // //                       <div className="w-full bg-gray-200 rounded-full h-2">
// // //                         <div
// // //                           className="bg-blue-600 h-2 rounded-full transition-all duration-300"
// // //                           style={{ width: `${uploadProgress}%` }}
// // //                         />
// // //                       </div>
// // //                     </div>
// // //                   )}

// // //                   <Button
// // //                     onClick={handleUpload}
// // //                     disabled={isUploading}
// // //                     className="w-full"
// // //                   >
// // //                     {isUploading ? "Processing..." : "Upload & Process"}
// // //                   </Button>
// // //                 </div>
// // //               )}
// // //             </div>
// // //           )}
// // //         </div>

// // //         {/* Results Section */}
// // //         {assessment.bubblesheet_result && (
// // //           <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
// // //             <h3 className="text-lg font-semibold text-gray-900 mb-4">
// // //               Your Results
// // //             </h3>

// // //             <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
// // //               <div className="p-4 bg-green-50 rounded-lg border border-green-200">
// // //                 <div className="text-center">
// // //                   <p className="text-2xl font-bold text-green-900">
// // //                     {assessment.bubblesheet_result.correct_answers}
// // //                   </p>
// // //                   <p className="text-sm text-green-600">Correct</p>
// // //                 </div>
// // //               </div>
// // //               <div className="p-4 bg-red-50 rounded-lg border border-red-200">
// // //                 <div className="text-center">
// // //                   <p className="text-2xl font-bold text-red-900">
// // //                     {assessment.bubblesheet_result.incorrect_answers}
// // //                   </p>
// // //                   <p className="text-sm text-red-600">Incorrect</p>
// // //                 </div>
// // //               </div>
// // //               <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
// // //                 <div className="text-center">
// // //                   <p className="text-2xl font-bold text-gray-900">
// // //                     {assessment.bubblesheet_result.unanswered}
// // //                   </p>
// // //                   <p className="text-sm text-gray-600">Unanswered</p>
// // //                 </div>
// // //               </div>
// // //               <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
// // //                 <div className="text-center">
// // //                   <p className="text-2xl font-bold text-blue-900">
// // //                     {assessment.bubblesheet_result.total_questions}
// // //                   </p>
// // //                   <p className="text-sm text-blue-600">Total Questions</p>
// // //                 </div>
// // //               </div>
// // //             </div>

// // //             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
// // //               <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
// // //                 <div className="text-center">
// // //                   <p className="text-3xl font-bold text-purple-900">
// // //                     {assessment.bubblesheet_result.total_marks}
// // //                   </p>
// // //                   <p className="text-sm text-purple-600">Total Marks</p>
// // //                 </div>
// // //               </div>
// // //               <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-200">
// // //                 <div className="text-center">
// // //                   <p className="text-3xl font-bold text-indigo-900">
// // //                     {assessment.bubblesheet_result.percentage.toFixed(1)}%
// // //                   </p>
// // //                   <p className="text-sm text-indigo-600">Percentage</p>
// // //                 </div>
// // //               </div>
// // //             </div>

// // //             <div className="mt-4 text-center text-sm text-gray-600">
// // //               Evaluated on: {formatDate(assessment.bubblesheet_result.evaluated_on)}
// // //             </div>
// // //           </div>
// // //         )}
// // //       </div>
// // //     </div>
// // //   );
// // // }

// // // src/app/student/assessments/[assessmentId]/bubblesheet/page.tsx
// // "use client";

// // import { useSearchParams, useParams } from "next/navigation";
// // import { useEffect, useState, useRef } from "react";
// // import Button from "@/components/Button";
// // import toast from "react-hot-toast";
// // import { FiFileText, FiCheckCircle, FiClock, FiAlertCircle } from "react-icons/fi";

// // interface AssessmentData {
// //   assessment_id: string;
// //   type: string;
// //   title: string;
// //   description: string;
// //   deadline: string;
// // }

// // interface BubbleSheetResult {
// //   total_questions: number;
// //   correct_answers: number;
// //   incorrect_answers: number;
// //   unanswered: number;
// //   total_marks: number;
// //   percentage: number;
// //   evaluated_on: string;
// // }

// // interface AssessmentResponse {
// //   module_code: string;
// //   module_name: string;
// //   assessment_data: AssessmentData;
// //   question_paper: { file_url: string } | null;
// //   bubblesheet_result: BubbleSheetResult | null;
// //   has_submitted: boolean;
// //   answer_sheet_url: string | null;
// // }

// // export default function StudentBubbleSheetPage() {
// //   const params = useParams();
// //   const searchParams = useSearchParams();

// //   const moduleId = searchParams.get("moduleId") ?? "";
// //   const assessmentId = params.assessmentId as string;
// //   const studentId = searchParams.get("studentId") ?? "";

// //   const [assessment, setAssessment] = useState<AssessmentResponse | null>(null);
// //   const [loading, setLoading] = useState(true);
// //   const [error, setError] = useState<string | null>(null);

// //   const [answerSheetFile, setAnswerSheetFile] = useState<File | null>(null);
// //   const [isUploading, setIsUploading] = useState(false);
// //   const [uploadProgress, setUploadProgress] = useState(0);
// //   const fileInputRef = useRef<HTMLInputElement>(null);

// //   useEffect(() => {
// //     if (!moduleId || !assessmentId || !studentId) {
// //       setError("Missing required parameters");
// //       setLoading(false);
// //       return;
// //     }

// //     fetchAssessment();
// //   }, [moduleId, assessmentId, studentId]);

// //   const fetchAssessment = async () => {
// //     setLoading(true);
// //     setError(null);
// //     try {
// //       const res = await fetch(
// //         `/api/student/enrollments/${moduleId}/assessment/${assessmentId}/bubblesheet?studentId=${studentId}`
// //       );
      
// //       if (!res.ok) {
// //         const errData = await res.json();
// //         throw new Error(errData.message || "Failed to fetch assessment");
// //       }

// //       const data: AssessmentResponse = await res.json();
// //       setAssessment(data);
// //     } catch (err) {
// //       setError(err instanceof Error ? err.message : "Unknown error");
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
// //     const file = e.target.files?.[0];
// //     if (!file) return;

// //     const allowedTypes = ['.png', '.jpg', '.jpeg', '.PNG', '.JPG', '.JPEG'];
// //     const isValidType = allowedTypes.some((ext) =>
// //       file.name.toLowerCase().endsWith(ext.toLowerCase())
// //     );
    
// //     if (!isValidType) {
// //       toast.error("Invalid file type. Please upload an image (PNG, JPG, JPEG)");
// //       return;
// //     }

// //     const maxSize = 10 * 1024 * 1024; // 10MB
// //     if (file.size > maxSize) {
// //       toast.error("File size exceeds 10MB limit");
// //       return;
// //     }

// //     setAnswerSheetFile(file);
// //     e.target.value = "";
// //   };

// //   const handleUpload = async () => {
// //     if (!answerSheetFile) return;

// //     const toastId = toast.loading("Processing bubble sheet...");
// //     setIsUploading(true);
// //     setUploadProgress(0);

// //     try {
// //       const formData = new FormData();
// //       formData.append("file", answerSheetFile);

// //       // ✅ CORRECT - Use bubble sheet specific endpoint with query params
// //       const uploadUrl = `/api/student/bubblesheet/upload?studentId=${studentId}&assessmentId=${assessmentId}&moduleId=${moduleId}`;

// //       console.log('🎯 Uploading to bubble sheet endpoint:', uploadUrl);

// //       // Simulate progress
// //       const progressInterval = setInterval(() => {
// //         setUploadProgress(prev => Math.min(prev + 10, 90));
// //       }, 200);

// //       const res = await fetch(uploadUrl, {
// //         method: "POST",
// //         body: formData,
// //       });

// //       clearInterval(progressInterval);
// //       setUploadProgress(100);

// //       if (!res.ok) {
// //         const err = await res.json();
// //         throw new Error(err.error || err.message || "Upload failed");
// //       }

// //       const result = await res.json();
      
// //       toast.success(
// //         `Bubble sheet processed successfully! Detected ${result.answers_count} answers.`,
// //         { id: toastId }
// //       );

// //       // Refresh assessment data
// //       await fetchAssessment();
// //       setAnswerSheetFile(null);
// //       setUploadProgress(0);
// //     } catch (error) {
// //       console.error("Upload error:", error);
// //       toast.error(
// //         error instanceof Error ? error.message : "Upload failed",
// //         { id: toastId }
// //       );
// //       setUploadProgress(0);
// //     } finally {
// //       setIsUploading(false);
// //     }
// //   };

// //   const triggerFileInput = () => {
// //     fileInputRef.current?.click();
// //   };

// //   const formatDate = (dateString: string) => {
// //     return new Date(dateString).toLocaleDateString("en-US", {
// //       year: "numeric",
// //       month: "long",
// //       day: "numeric",
// //       hour: "2-digit",
// //       minute: "2-digit",
// //     });
// //   };

// //   const getStatusBadge = () => {
// //     if (assessment?.bubblesheet_result) {
// //       return (
// //         <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
// //           <FiCheckCircle className="mr-1" />
// //           Evaluated
// //         </span>
// //       );
// //     }
// //     if (assessment?.has_submitted) {
// //       return (
// //         <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
// //           <FiClock className="mr-1" />
// //           Submitted
// //         </span>
// //       );
// //     }
// //     const deadline = new Date(assessment?.assessment_data.deadline || "");
// //     const now = new Date();
// //     if (now > deadline) {
// //       return (
// //         <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
// //           <FiAlertCircle className="mr-1" />
// //           Overdue
// //         </span>
// //       );
// //     }
// //     return (
// //       <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
// //         <FiClock className="mr-1" />
// //         Pending
// //       </span>
// //     );
// //   };

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
// //         <div className="bg-white p-8 rounded-lg shadow-md border border-red-200">
// //           <div className="flex items-center space-x-3">
// //             <FiAlertCircle className="h-8 w-8 text-red-500" />
// //             <div>
// //               <h3 className="text-lg font-medium text-red-800">Error</h3>
// //               <p className="text-red-600 mt-1">{error || "Assessment not found"}</p>
// //             </div>
// //           </div>
// //         </div>
// //       </div>
// //     );
// //   }

// //   return (
// //     <div className="min-h-screen bg-gray-50">
// //       <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
// //         {/* Header */}
// //         <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
// //           <div className="flex items-start justify-between">
// //             <div>
// //               <h1 className="text-2xl font-bold text-gray-900 mb-2">
// //                 {assessment.module_code} - {assessment.module_name}
// //               </h1>
// //               <p className="text-sm text-gray-500">Bubble Sheet Assessment</p>
// //             </div>
// //             {getStatusBadge()}
// //           </div>
// //         </div>

// //         {/* Assessment Information */}
// //         <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
// //           <div className="border-b border-gray-200 pb-4 mb-4">
// //             <h2 className="text-xl font-semibold text-gray-900 mb-2">
// //               {assessment.assessment_data.title}
// //             </h2>
// //             <div className="flex items-center space-x-4 text-sm text-gray-600">
// //               <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded font-medium">
// //                 Multiple Choice (MCQ)
// //               </span>
// //               <span>Due: {formatDate(assessment.assessment_data.deadline)}</span>
// //             </div>
// //           </div>

// //           {assessment.assessment_data.description && (
// //             <div className="mb-4">
// //               <h3 className="text-sm font-medium text-gray-900 mb-2">Description</h3>
// //               <p className="text-gray-700">{assessment.assessment_data.description}</p>
// //             </div>
// //           )}

// //           {/* Question Paper */}
// //           {assessment.question_paper && (
// //             <div className="mb-4">
// //               <h3 className="text-sm font-medium text-gray-900 mb-2">Question Paper</h3>
// //               <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
// //                 <FiFileText className="h-5 w-5 text-blue-600" />
// //                 <div className="flex-1">
// //                   <a
// //                     href={assessment.question_paper.file_url}
// //                     target="_blank"
// //                     rel="noopener noreferrer"
// //                     className="font-medium text-blue-700 hover:text-blue-800 underline"
// //                   >
// //                     Download Question Paper
// //                   </a>
// //                 </div>
// //               </div>
// //             </div>
// //           )}
// //         </div>

// //         {/* Upload Section */}
// //         <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
// //           <h3 className="text-lg font-semibold text-gray-900 mb-4">
// //             Answer Sheet Submission
// //           </h3>

// //           {assessment.has_submitted && !assessment.bubblesheet_result ? (
// //             <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
// //               <div className="flex items-center space-x-3">
// //                 <FiClock className="h-5 w-5 text-blue-600" />
// //                 <div>
// //                   <p className="font-medium text-blue-800">Submitted - Awaiting Evaluation</p>
// //                   <p className="text-sm text-blue-600 mt-1">
// //                     Your answer sheet has been submitted. Results will appear here once evaluated.
// //                   </p>
// //                 </div>
// //               </div>
// //             </div>
// //           ) : assessment.bubblesheet_result ? (
// //             <div className="p-4 bg-green-50 rounded-lg border border-green-200">
// //               <div className="flex items-center space-x-3">
// //                 <FiCheckCircle className="h-5 w-5 text-green-600" />
// //                 <div>
// //                   <p className="font-medium text-green-800">Submission Completed & Evaluated</p>
// //                   <p className="text-sm text-green-600 mt-1">
// //                     Your results are available below.
// //                   </p>
// //                 </div>
// //               </div>
// //             </div>
// //           ) : (
// //             <div className="space-y-4">
// //               <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
// //                 <div className="flex items-start space-x-2">
// //                   <FiAlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
// //                   <div>
// //                     <p className="text-sm font-medium text-yellow-800">
// //                       Upload Instructions
// //                     </p>
// //                     <ul className="text-xs text-yellow-700 mt-2 space-y-1 list-disc list-inside">
// //                       <li>Upload a clear image of your filled bubble sheet</li>
// //                       <li>Supported formats: PNG, JPG, JPEG</li>
// //                       <li>Maximum file size: 10MB</li>
// //                       <li>Ensure all marked bubbles are clearly visible</li>
// //                     </ul>
// //                   </div>
// //                 </div>
// //               </div>

// //               <div
// //                 onClick={triggerFileInput}
// //                 className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-400 hover:bg-blue-50 transition-all cursor-pointer"
// //               >
// //                 <FiFileText className="mx-auto h-12 w-12 text-gray-400 mb-3" />
// //                 <p className="text-sm font-medium text-gray-900 mb-1">
// //                   Click to upload bubble sheet image
// //                 </p>
// //                 <p className="text-xs text-gray-500">
// //                   PNG, JPG, or JPEG (max 10MB)
// //                 </p>
// //               </div>

// //               <input
// //                 type="file"
// //                 ref={fileInputRef}
// //                 onChange={handleFileChange}
// //                 accept=".png,.jpg,.jpeg"
// //                 className="hidden"
// //               />

// //               {answerSheetFile && (
// //                 <div className="space-y-3">
// //                   <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
// //                     <div className="flex items-center space-x-3">
// //                       <FiFileText className="h-5 w-5 text-green-600" />
// //                       <div>
// //                         <p className="text-sm font-medium text-gray-900">
// //                           {answerSheetFile.name}
// //                         </p>
// //                         <p className="text-xs text-gray-500">
// //                           {(answerSheetFile.size / (1024 * 1024)).toFixed(2)} MB
// //                         </p>
// //                       </div>
// //                     </div>
// //                   </div>

// //                   {isUploading && (
// //                     <div className="space-y-2">
// //                       <div className="flex items-center justify-between text-sm text-gray-600">
// //                         <span>Processing...</span>
// //                         <span>{uploadProgress}%</span>
// //                       </div>
// //                       <div className="w-full bg-gray-200 rounded-full h-2">
// //                         <div
// //                           className="bg-blue-600 h-2 rounded-full transition-all duration-300"
// //                           style={{ width: `${uploadProgress}%` }}
// //                         />
// //                       </div>
// //                     </div>
// //                   )}

// //                   <Button
// //                     onClick={handleUpload}
// //                     disabled={isUploading}
// //                     className="w-full"
// //                   >
// //                     {isUploading ? "Processing..." : "Upload & Process"}
// //                   </Button>
// //                 </div>
// //               )}
// //             </div>
// //           )}
// //         </div>

// //         {/* Results Section */}
// //         {assessment.bubblesheet_result && (
// //           <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
// //             <h3 className="text-lg font-semibold text-gray-900 mb-4">
// //               Your Results
// //             </h3>

// //             <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
// //               <div className="p-4 bg-green-50 rounded-lg border border-green-200">
// //                 <div className="text-center">
// //                   <p className="text-2xl font-bold text-green-900">
// //                     {assessment.bubblesheet_result.correct_answers}
// //                   </p>
// //                   <p className="text-sm text-green-600">Correct</p>
// //                 </div>
// //               </div>
// //               <div className="p-4 bg-red-50 rounded-lg border border-red-200">
// //                 <div className="text-center">
// //                   <p className="text-2xl font-bold text-red-900">
// //                     {assessment.bubblesheet_result.incorrect_answers}
// //                   </p>
// //                   <p className="text-sm text-red-600">Incorrect</p>
// //                 </div>
// //               </div>
// //               <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
// //                 <div className="text-center">
// //                   <p className="text-2xl font-bold text-gray-900">
// //                     {assessment.bubblesheet_result.unanswered}
// //                   </p>
// //                   <p className="text-sm text-gray-600">Unanswered</p>
// //                 </div>
// //               </div>
// //               <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
// //                 <div className="text-center">
// //                   <p className="text-2xl font-bold text-blue-900">
// //                     {assessment.bubblesheet_result.total_questions}
// //                   </p>
// //                   <p className="text-sm text-blue-600">Total Questions</p>
// //                 </div>
// //               </div>
// //             </div>

// //             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
// //               <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
// //                 <div className="text-center">
// //                   <p className="text-3xl font-bold text-purple-900">
// //                     {assessment.bubblesheet_result.total_marks}
// //                   </p>
// //                   <p className="text-sm text-purple-600">Total Marks</p>
// //                 </div>
// //               </div>
// //               <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-200">
// //                 <div className="text-center">
// //                   <p className="text-3xl font-bold text-indigo-900">
// //                     {assessment.bubblesheet_result.percentage.toFixed(1)}%
// //                   </p>
// //                   <p className="text-sm text-indigo-600">Percentage</p>
// //                 </div>
// //               </div>
// //             </div>

// //             <div className="mt-4 text-center text-sm text-gray-600">
// //               Evaluated on: {formatDate(assessment.bubblesheet_result.evaluated_on)}
// //             </div>
// //           </div>
// //         )}
// //       </div>
// //     </div>
// //   );
// // }

// // src/app/student/assessments/[assessmentId]/bubblesheet/page.tsx
// "use client";

// import { useSearchParams, useParams } from "next/navigation";
// import { useEffect, useState, useRef } from "react";
// import toast from "react-hot-toast";

// interface AssessmentData {
//   assessment_id: string;
//   type: string;
//   title: string;
//   description: string;
//   deadline: string;
// }

// interface BubbleSheetResult {
//   total_questions: number;
//   correct_answers: number;
//   incorrect_answers: number;
//   unanswered: number;
//   total_marks: number;
//   percentage: number;
//   evaluated_on: string;
// }

// interface AssessmentResponse {
//   module_code: string;
//   module_name: string;
//   assessment_data: AssessmentData;
//   question_paper: { file_url: string } | null;
//   bubblesheet_result: BubbleSheetResult | null;
//   has_submitted: boolean;
// }

// export default function StudentBubbleSheetPage() {
//   const params = useParams();
//   const searchParams = useSearchParams();

//   const moduleId = searchParams.get("moduleId") ?? "";
//   const assessmentId = params.assessmentId as string;
//   const studentId = searchParams.get("studentId") ?? "";

//   const [assessment, setAssessment] = useState<AssessmentResponse | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [answerSheetFile, setAnswerSheetFile] = useState<File | null>(null);
//   const [isUploading, setIsUploading] = useState(false);
//   const fileInputRef = useRef<HTMLInputElement>(null);

//   console.log("🎯 BUBBLE SHEET PAGE LOADED");
//   console.log("Student ID:", studentId);
//   console.log("Assessment ID:", assessmentId);
//   console.log("Module ID:", moduleId);

//   useEffect(() => {
//     if (!moduleId || !assessmentId || !studentId) {
//       setError("Missing required parameters");
//       setLoading(false);
//       return;
//     }
//     fetchAssessment();
//   }, [moduleId, assessmentId, studentId]);

//   const fetchAssessment = async () => {
//     setLoading(true);
//     setError(null);
//     try {
//       const res = await fetch(
//         `/api/student/enrollments/${moduleId}/assessment/${assessmentId}/bubblesheet?studentId=${studentId}`
//       );
      
//       if (!res.ok) {
//         const errData = await res.json();
//         throw new Error(errData.message || "Failed to fetch assessment");
//       }

//       const data: AssessmentResponse = await res.json();
//       setAssessment(data);
//     } catch (err) {
//       setError(err instanceof Error ? err.message : "Unknown error");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (!file) return;

//     const allowedExtensions = ['.png', '.jpg', '.jpeg'];
//     const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    
//     if (!allowedExtensions.includes(fileExtension)) {
//       toast.error("Invalid file type. Please upload PNG, JPG, or JPEG image only.");
//       return;
//     }

//     const maxSize = 10 * 1024 * 1024; // 10MB
//     if (file.size > maxSize) {
//       toast.error("File size exceeds 10MB limit");
//       return;
//     }

//     setAnswerSheetFile(file);
//     e.target.value = "";
//   };

//   const handleUpload = async () => {
//     if (!answerSheetFile) {
//       toast.error("Please select a file first");
//       return;
//     }

//     console.log("🎯 STARTING BUBBLE SHEET UPLOAD");
//     console.log("File:", answerSheetFile.name);
//     console.log("File type:", answerSheetFile.type);
//     console.log("File size:", answerSheetFile.size);

//     const toastId = toast.loading("Processing bubble sheet...");
//     setIsUploading(true);

//     try {
//       const formData = new FormData();
//       formData.append("file", answerSheetFile);

//       // ✅ BUBBLE SHEET SPECIFIC ENDPOINT - NOT the old submission endpoint
//       const uploadUrl = `/api/student/bubblesheet/upload?studentId=${studentId}&assessmentId=${assessmentId}&moduleId=${moduleId}`;
      
//       console.log("🎯 Upload URL:", uploadUrl);
//       console.log("🎯 Calling BUBBLE SHEET API (NOT submission API)");
//       console.log("🎯 This should call Flask on port 7000");

//       const res = await fetch(uploadUrl, {
//         method: "POST",
//         body: formData,
//       });

//       console.log("Response status:", res.status);

//       if (!res.ok) {
//         const err = await res.json();
//         console.error("Upload error:", err);
//         throw new Error(err.error || err.details || "Upload failed");
//       }

//       const result = await res.json();
//       console.log("✅ Upload successful:", result);
      
//       toast.success(
//         `Bubble sheet processed! Detected ${result.answers_count} answers.`,
//         { id: toastId }
//       );

//       await fetchAssessment();
//       setAnswerSheetFile(null);
//     } catch (error) {
//       console.error("❌ Upload error:", error);
//       toast.error(
//         error instanceof Error ? error.message : "Upload failed",
//         { id: toastId }
//       );
//     } finally {
//       setIsUploading(false);
//     }
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gray-50 flex items-center justify-center">
//         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
//       </div>
//     );
//   }

//   if (error || !assessment) {
//     return (
//       <div className="min-h-screen bg-gray-50 flex items-center justify-center">
//         <div className="bg-white p-8 rounded-lg shadow-md">
//           <p className="text-red-600">{error || "Assessment not found"}</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-50 py-8 px-4">
//       <div className="max-w-4xl mx-auto">
//         {/* Header */}
//         <div className="bg-white rounded-lg shadow p-6 mb-6">
//           <h1 className="text-2xl font-bold text-gray-900">
//             {assessment.assessment_data.title}
//           </h1>
//           <p className="text-gray-600 mt-2">
//             {assessment.module_code} - {assessment.module_name}
//           </p>
//           <span className="inline-block mt-2 px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
//             Bubble Sheet (MCQ)
//           </span>
//         </div>

//         {/* Question Paper */}
//         {assessment.question_paper && (
//           <div className="bg-white rounded-lg shadow p-6 mb-6">
//             <h2 className="text-lg font-semibold mb-3">Question Paper</h2>
//             <a
//               href={assessment.question_paper.file_url}
//               target="_blank"
//               rel="noopener noreferrer"
//               className="inline-flex items-center text-blue-600 hover:text-blue-700 underline"
//             >
//               📄 Download Question Paper
//             </a>
//           </div>
//         )}

//         {/* Upload Section */}
//         <div className="bg-white rounded-lg shadow p-6 mb-6">
//           <h2 className="text-lg font-semibold mb-4">Upload Your Answer Sheet</h2>

//           {assessment.has_submitted ? (
//             <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
//               <p className="text-green-800 font-medium">✓ Submitted</p>
//               {assessment.bubblesheet_result ? (
//                 <p className="text-green-700 text-sm mt-1">
//                   Your submission has been evaluated. See results below.
//                 </p>
//               ) : (
//                 <p className="text-green-700 text-sm mt-1">
//                   Awaiting evaluation
//                 </p>
//               )}
//             </div>
//           ) : (
//             <>
//               {/* Instructions */}
//               <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
//                 <p className="text-sm font-medium text-yellow-800 mb-2">
//                   📋 Instructions:
//                 </p>
//                 <ul className="text-xs text-yellow-700 space-y-1 list-disc list-inside">
//                   <li>Upload a clear image of your filled bubble sheet</li>
//                   <li>Supported: PNG, JPG, JPEG (max 10MB)</li>
//                   <li>Ensure all bubbles are clearly visible</li>
//                 </ul>
//               </div>

//               {/* File Input */}
//               <input
//                 type="file"
//                 ref={fileInputRef}
//                 onChange={handleFileChange}
//                 accept=".png,.jpg,.jpeg"
//                 className="hidden"
//               />

//               {!answerSheetFile ? (
//                 <button
//                   onClick={() => fileInputRef.current?.click()}
//                   className="w-full border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 hover:bg-blue-50 transition-colors"
//                 >
//                   <div className="text-4xl mb-2">📷</div>
//                   <p className="text-gray-700 font-medium">Click to select image</p>
//                   <p className="text-gray-500 text-sm mt-1">PNG, JPG, or JPEG</p>
//                 </button>
//               ) : (
//                 <div className="space-y-4">
//                   <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
//                     <div className="flex items-center gap-3">
//                       <div className="text-2xl">🖼️</div>
//                       <div className="flex-1">
//                         <p className="font-medium text-gray-900">{answerSheetFile.name}</p>
//                         <p className="text-sm text-gray-500">
//                           {(answerSheetFile.size / (1024 * 1024)).toFixed(2)} MB
//                         </p>
//                       </div>
//                       <button
//                         onClick={() => setAnswerSheetFile(null)}
//                         className="text-red-600 hover:text-red-700"
//                       >
//                         ✕
//                       </button>
//                     </div>
//                   </div>

//                   <button
//                     onClick={handleUpload}
//                     disabled={isUploading}
//                     className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
//                       isUploading
//                         ? "bg-gray-300 text-gray-500 cursor-not-allowed"
//                         : "bg-blue-600 text-white hover:bg-blue-700"
//                     }`}
//                   >
//                     {isUploading ? "Processing..." : "Upload & Process Bubble Sheet"}
//                   </button>
//                 </div>
//               )}
//             </>
//           )}
//         </div>

//         {/* Results */}
//         {assessment.bubblesheet_result && (
//           <div className="bg-white rounded-lg shadow p-6">
//             <h2 className="text-lg font-semibold mb-4">Your Results</h2>
            
//             <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
//               <div className="p-4 bg-green-50 rounded-lg text-center">
//                 <div className="text-3xl font-bold text-green-900">
//                   {assessment.bubblesheet_result.correct_answers}
//                 </div>
//                 <div className="text-sm text-green-700">Correct</div>
//               </div>
              
//               <div className="p-4 bg-red-50 rounded-lg text-center">
//                 <div className="text-3xl font-bold text-red-900">
//                   {assessment.bubblesheet_result.incorrect_answers}
//                 </div>
//                 <div className="text-sm text-red-700">Incorrect</div>
//               </div>
              
//               <div className="p-4 bg-gray-50 rounded-lg text-center">
//                 <div className="text-3xl font-bold text-gray-900">
//                   {assessment.bubblesheet_result.unanswered}
//                 </div>
//                 <div className="text-sm text-gray-700">Unanswered</div>
//               </div>
              
//               <div className="p-4 bg-blue-50 rounded-lg text-center">
//                 <div className="text-3xl font-bold text-blue-900">
//                   {assessment.bubblesheet_result.total_questions}
//                 </div>
//                 <div className="text-sm text-blue-700">Total</div>
//               </div>
//             </div>

//             <div className="grid grid-cols-2 gap-4">
//               <div className="p-4 bg-purple-50 rounded-lg text-center">
//                 <div className="text-4xl font-bold text-purple-900">
//                   {assessment.bubblesheet_result.total_marks}
//                 </div>
//                 <div className="text-sm text-purple-700">Total Marks</div>
//               </div>
              
//               <div className="p-4 bg-indigo-50 rounded-lg text-center">
//                 <div className="text-4xl font-bold text-indigo-900">
//                   {assessment.bubblesheet_result.percentage.toFixed(1)}%
//                 </div>
//                 <div className="text-sm text-indigo-700">Percentage</div>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// src/app/student/assessments/[assessmentId]/bubblesheet/page.tsx
"use client";

import { useSearchParams, useParams } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import toast from "react-hot-toast";
import { 
  FiFileText, 
  FiCheckCircle, 
  FiClock, 
  FiAlertCircle,
  FiUpload,
  FiX,
  FiImage,
  FiDownload
} from "react-icons/fi";

interface AssessmentData {
  assessment_id: string;
  type: string;
  title: string;
  description: string;
  deadline: string;
}

interface BubbleSheetResult {
  total_questions: number;
  correct_answers: number;
  incorrect_answers: number;
  unanswered: number;
  total_marks: number;
  percentage: number;
  evaluated_on: string;
}

interface AssessmentResponse {
  module_code: string;
  module_name: string;
  assessment_data: AssessmentData;
  question_paper: { file_url: string } | null;
  bubblesheet_result: BubbleSheetResult | null;
  has_submitted: boolean;
}

export default function StudentBubbleSheetPage() {
  const params = useParams();
  const searchParams = useSearchParams();

  const moduleId = searchParams.get("moduleId") ?? "";
  const assessmentId = params.assessmentId as string;
  const studentId = searchParams.get("studentId") ?? "";

  const [assessment, setAssessment] = useState<AssessmentResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [answerSheetFile, setAnswerSheetFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  console.log("🎯 BUBBLE SHEET PAGE LOADED");
  console.log("Student ID:", studentId);
  console.log("Assessment ID:", assessmentId);
  console.log("Module ID:", moduleId);

  useEffect(() => {
    if (!moduleId || !assessmentId || !studentId) {
      setError("Missing required parameters");
      setLoading(false);
      return;
    }
    fetchAssessment();
  }, [moduleId, assessmentId, studentId]);

  const fetchAssessment = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/student/enrollments/${moduleId}/assessment/${assessmentId}/bubblesheet?studentId=${studentId}`
      );
      
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Failed to fetch assessment");
      }

      const data: AssessmentResponse = await res.json();
      setAssessment(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedExtensions = ['.png', '.jpg', '.jpeg'];
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    
    if (!allowedExtensions.includes(fileExtension)) {
      toast.error("Invalid file type. Please upload PNG, JPG, or JPEG image only.");
      return;
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      toast.error("File size exceeds 10MB limit");
      return;
    }

    setAnswerSheetFile(file);
    e.target.value = "";
  };

  const handleUpload = async () => {
    if (!answerSheetFile) {
      toast.error("Please select a file first");
      return;
    }

    console.log("🎯 STARTING BUBBLE SHEET UPLOAD");
    console.log("File:", answerSheetFile.name);
    console.log("File type:", answerSheetFile.type);
    console.log("File size:", answerSheetFile.size);

    const toastId = toast.loading("Processing bubble sheet...");
    setIsUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append("file", answerSheetFile);

      const uploadUrl = `/api/student/bubblesheet/upload?studentId=${studentId}&assessmentId=${assessmentId}&moduleId=${moduleId}`;
      
      console.log("🎯 Upload URL:", uploadUrl);
      console.log("🎯 Calling BUBBLE SHEET API (NOT submission API)");
      console.log("🎯 This should call Flask on port 7000");

      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const res = await fetch(uploadUrl, {
        method: "POST",
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      console.log("Response status:", res.status);

      if (!res.ok) {
        const err = await res.json();
        console.error("Upload error:", err);
        throw new Error(err.error || err.details || "Upload failed");
      }

      const result = await res.json();
      console.log("✅ Upload successful:", result);
      
      toast.success(
        `Bubble sheet processed! Detected ${result.answers_count} answers.`,
        { id: toastId }
      );

      await fetchAssessment();
      setAnswerSheetFile(null);
      setUploadProgress(0);
    } catch (error) {
      console.error("❌ Upload error:", error);
      toast.error(
        error instanceof Error ? error.message : "Upload failed",
        { id: toastId }
      );
      setUploadProgress(0);
    } finally {
      setIsUploading(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = () => {
    if (assessment?.bubblesheet_result) {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <FiCheckCircle className="mr-1.5 h-3.5 w-3.5" />
          Evaluated
        </span>
      );
    }
    if (assessment?.has_submitted) {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          <FiClock className="mr-1.5 h-3.5 w-3.5" />
          Submitted
        </span>
      );
    }
    const deadline = new Date(assessment?.assessment_data.deadline || "");
    const now = new Date();
    if (now > deadline) {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <FiAlertCircle className="mr-1.5 h-3.5 w-3.5" />
          Overdue
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
        <FiClock className="mr-1.5 h-3.5 w-3.5" />
        Pending
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="text-lg font-medium text-gray-600">Loading assessment...</span>
        </div>
      </div>
    );
  }

  if (error || !assessment) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-xl shadow-sm border border-red-200 max-w-md w-full">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <FiAlertCircle className="h-6 w-6 text-red-500" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-red-900">Error Loading Assessment</h3>
              <p className="text-sm text-red-600 mt-1">{error || "Assessment not found"}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-sm font-medium text-gray-500">
                  {assessment.module_code}
                </span>
                <span className="text-gray-300">•</span>
                <span className="text-sm text-gray-500">{assessment.module_name}</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-1">
                {assessment.assessment_data.title}
              </h1>
              <p className="text-sm text-gray-600">Bubble Sheet Assessment</p>
            </div>
            {getStatusBadge()}
          </div>

          <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-gray-100">
            <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium bg-purple-100 text-purple-800">
              Multiple Choice Questions
            </span>
            <div className="flex items-center text-sm text-gray-600">
              <FiClock className="mr-1.5 h-4 w-4" />
              Due: {formatDate(assessment.assessment_data.deadline)}
            </div>
          </div>
        </div>

        {/* Description Card */}
        {assessment.assessment_data.description && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-sm font-semibold text-gray-900 mb-3">Description</h2>
            <p className="text-gray-700 leading-relaxed">{assessment.assessment_data.description}</p>
          </div>
        )}

        {/* Question Paper Card */}
        {assessment.question_paper && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-sm font-semibold text-gray-900 mb-4">Question Paper</h2>
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FiFileText className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Question Paper</p>
                  <p className="text-xs text-gray-500">PDF Document</p>
                </div>
              </div>
              <a
                href={assessment.question_paper.file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                <FiDownload className="mr-2 h-4 w-4" />
                Download
              </a>
            </div>
          </div>
        )}

        {/* Upload Section Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Answer Sheet Submission
          </h2>

          {assessment.has_submitted && !assessment.bubblesheet_result ? (
            <div className="p-5 bg-blue-50 rounded-xl border border-blue-200">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <FiClock className="h-5 w-5 text-blue-600 mt-0.5" />
                </div>
                <div>
                  <p className="font-semibold text-blue-900">Submitted - Awaiting Evaluation</p>
                  <p className="text-sm text-blue-700 mt-1">
                    Your answer sheet has been submitted successfully. Results will appear here once the evaluation is complete.
                  </p>
                </div>
              </div>
            </div>
          ) : assessment.bubblesheet_result ? (
            <div className="p-5 bg-green-50 rounded-xl border border-green-200">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <FiCheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                </div>
                <div>
                  <p className="font-semibold text-green-900">Submission Completed & Evaluated</p>
                  <p className="text-sm text-green-700 mt-1">
                    Your bubble sheet has been evaluated. View your results below.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Instructions */}
              <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <FiAlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-amber-900 mb-2">
                      Upload Instructions
                    </p>
                    <ul className="text-xs text-amber-800 space-y-1.5 list-disc list-inside">
                      <li>Upload a clear, high-quality image of your filled bubble sheet</li>
                      <li>Supported formats: PNG, JPG, JPEG (Maximum 10MB)</li>
                      <li>Ensure all marked bubbles are clearly visible and legible</li>
                      <li>Avoid shadows, glare, or blurry images for accurate processing</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Hidden File Input */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".png,.jpg,.jpeg"
                className="hidden"
              />

              {/* File Upload Area */}
              {!answerSheetFile ? (
                <button
                  onClick={triggerFileInput}
                  className="w-full border-2 border-dashed border-gray-300 rounded-xl p-10 text-center hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 group"
                >
                  <div className="flex flex-col items-center">
                    <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-blue-100 transition-colors">
                      <FiImage className="h-8 w-8 text-gray-400 group-hover:text-blue-500 transition-colors" />
                    </div>
                    <p className="text-base font-semibold text-gray-700 mb-1">
                      Click to upload bubble sheet
                    </p>
                    <p className="text-sm text-gray-500">
                      PNG, JPG or JPEG (max. 10MB)
                    </p>
                  </div>
                </button>
              ) : (
                <div className="space-y-4">
                  {/* Selected File Preview */}
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3 flex-1 min-w-0">
                        <div className="flex-shrink-0 h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                          <FiFileText className="h-6 w-6 text-green-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {answerSheetFile.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {(answerSheetFile.size / (1024 * 1024)).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => setAnswerSheetFile(null)}
                        className="flex-shrink-0 ml-3 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        disabled={isUploading}
                      >
                        <FiX className="h-5 w-5" />
                      </button>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  {isUploading && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium text-gray-700">Processing bubble sheet...</span>
                        <span className="font-semibold text-blue-600">{uploadProgress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-blue-600 h-2.5 rounded-full transition-all duration-300 ease-out"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Upload Button */}
                  <button
                    onClick={handleUpload}
                    disabled={isUploading}
                    className={`w-full py-3.5 px-6 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center ${
                      isUploading
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg"
                    }`}
                  >
                    {isUploading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                        Processing...
                      </>
                    ) : (
                      <>
                        <FiUpload className="mr-2 h-5 w-5" />
                        Upload & Process Bubble Sheet
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Results Section */}
        {assessment.bubblesheet_result && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Your Results</h2>
              <span className="text-xs text-gray-500">
                Evaluated on: {formatDate(assessment.bubblesheet_result.evaluated_on)}
              </span>
            </div>

            {/* Question Statistics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="p-5 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200">
                <div className="text-center">
                  <p className="text-3xl font-bold text-green-900 mb-1">
                    {assessment.bubblesheet_result.correct_answers}
                  </p>
                  <p className="text-xs font-medium text-green-700 uppercase tracking-wide">Correct</p>
                </div>
              </div>
              
              <div className="p-5 bg-gradient-to-br from-red-50 to-rose-50 rounded-xl border border-red-200">
                <div className="text-center">
                  <p className="text-3xl font-bold text-red-900 mb-1">
                    {assessment.bubblesheet_result.incorrect_answers}
                  </p>
                  <p className="text-xs font-medium text-red-700 uppercase tracking-wide">Incorrect</p>
                </div>
              </div>
              
              <div className="p-5 bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl border border-gray-200">
                <div className="text-center">
                  <p className="text-3xl font-bold text-gray-900 mb-1">
                    {assessment.bubblesheet_result.unanswered}
                  </p>
                  <p className="text-xs font-medium text-gray-700 uppercase tracking-wide">Unanswered</p>
                </div>
              </div>
              
              <div className="p-5 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border border-blue-200">
                <div className="text-center">
                  <p className="text-3xl font-bold text-blue-900 mb-1">
                    {assessment.bubblesheet_result.total_questions}
                  </p>
                  <p className="text-xs font-medium text-blue-700 uppercase tracking-wide">Total</p>
                </div>
              </div>
            </div>

            {/* Score Summary Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-6 bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl border border-purple-200">
                <div className="text-center">
                  <p className="text-4xl font-bold text-purple-900 mb-2">
                    {assessment.bubblesheet_result.total_marks}
                  </p>
                  <p className="text-sm font-semibold text-purple-700 uppercase tracking-wide">Total Marks</p>
                </div>
              </div>
              
              <div className="p-6 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl border border-indigo-200">
                <div className="text-center">
                  <p className="text-4xl font-bold text-indigo-900 mb-2">
                    {assessment.bubblesheet_result.percentage.toFixed(1)}%
                  </p>
                  <p className="text-sm font-semibold text-indigo-700 uppercase tracking-wide">Percentage</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}