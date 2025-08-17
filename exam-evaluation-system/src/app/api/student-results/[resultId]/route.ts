// // // import { NextRequest, NextResponse } from 'next/server';
// // // import { PrismaClient } from '@prisma/client';

// // // const prisma = new PrismaClient();

// // // export async function GET(
// // //   request: NextRequest,
// // //   { params }: { params: { resultId: string } }
// // // ) {
// // //   try {
// // //     const { resultId } = params;
// // //     const url = new URL(request.url);
// // //     const studentIndex = url.searchParams.get('studentIndex');
// // //     const moduleCode = url.searchParams.get('moduleCode');
// // //     const examYear = url.searchParams.get('examYear');
// // //     const examMonth = url.searchParams.get('examMonth');
// // //     const assessmentId = url.searchParams.get('assessmentId');

// // //     if (!studentIndex || !moduleCode || !examYear || !examMonth || !assessmentId) {
// // //       return NextResponse.json(
// // //         { error: 'Missing required parameters' },
// // //         { status: 400 }
// // //       );
// // //     }

// // //     // Get submission details
// // //     const submission = await prisma.submission.findFirst({
// // //       where: {
// // //         assessment: {
// // //           assessment_id: assessmentId
// // //         },
// // //         student: {
// // //           registration_number: studentIndex
// // //         }
// // //       },
// // //       include: {
// // //         student: {
// // //           include: {
// // //             user: true
// // //           }
// // //         },
// // //         assessment: {
// // //           include: {
// // //             module: true
// // //           }
// // //         }
// // //       }
// // //     });

// // //     if (!submission) {
// // //       return NextResponse.json(
// // //         { error: 'Submission not found' },
// // //         { status: 404 }
// // //       );
// // //     }

// // //     // Get graded answers from both models
// // //     const openaiResults = await prisma.graded_student_answers_openai.findMany({
// // //       where: {
// // //         student_index: studentIndex,
// // //         module_code: moduleCode,
// // //         exam_year: parseInt(examYear),
// // //         exam_month: examMonth,
// // //         assessment_id: assessmentId
// // //       },
// // //       orderBy: {
// // //         graded_at: 'desc'
// // //       }
// // //     });

// // //     const geminiResults = await prisma.graded_student_answers_gemini.findMany({
// // //       where: {
// // //         student_index: studentIndex,
// // //         module_code: moduleCode,
// // //         exam_year: parseInt(examYear),
// // //         exam_month: examMonth,
// // //         assessment_id: assessmentId
// // //       },
// // //       orderBy: {
// // //         graded_at: 'desc'
// // //       }
// // //     });

// // //     // Merge results, preferring the most recent evaluation
// // //     const mergedResults = new Map();

// // //     // Add OpenAI results
// // //     openaiResults.forEach(result => {
// // //       mergedResults.set(result.full_question_id, {
// // //         ...result,
// // //         model_type: 'openai'
// // //       });
// // //     });

// // //     // Add Gemini results, replacing if more recent
// // //     geminiResults.forEach(result => {
// // //       const existing = mergedResults.get(result.full_question_id);
// // //       if (!existing || result.graded_at > existing.graded_at) {
// // //         mergedResults.set(result.full_question_id, {
// // //           ...result,
// // //           model_type: 'gemini'
// // //         });
// // //       }
// // //     });

// // //     const gradedAnswers = Array.from(mergedResults.values()).sort((a, b) => {
// // //       // Custom sort for question IDs (Q1_i, Q1_ii, Q2_a, etc.)
// // //       const parseQuestionId = (id: string) => {
// // //         const parts = id.split('_');
// // //         const qNum = parseInt(parts[0].substring(1)); // Remove 'Q' and convert to number
// // //         const subPart = parts[1];
// // //         return { qNum, subPart };
// // //       };

// // //       const aNum = parseQuestionId(a.full_question_id);
// // //       const bNum = parseQuestionId(b.full_question_id);

// // //       if (aNum.qNum !== bNum.qNum) {
// // //         return aNum.qNum - bNum.qNum;
// // //       }
// // //       return aNum.subPart.localeCompare(bNum.subPart);
// // //     });

// // //     // Get file URL based on submission type
// // //     const fileUrl = submission.is_handwritten 
// // //       ? submission.handwritten_file_url 
// // //       : submission.file_url;

// // //     return NextResponse.json({
// // //       submission: {
// // //         id: submission.submission_id,
// // //         studentName: `${submission.student.user.first_name} ${submission.student.user.last_name}`,
// // //         studentIndex: submission.student.registration_number,
// // //         moduleCode: submission.assessment.module.module_code,
// // //         moduleName: submission.assessment.module.module_name,
// // //         assessmentTitle: submission.assessment.title,
// // //         fileUrl: fileUrl,
// // //         submittedAt: submission.submission_end_at || submission.submission_start_at,
// // //         isHandwritten: submission.is_handwritten
// // //       },
// // //       gradedAnswers: gradedAnswers
// // //     });

// // //   } catch (error) {
// // //     console.error('Error fetching student result details:', error);
// // //     return NextResponse.json(
// // //       { error: 'Internal server error' },
// // //       { status: 500 }
// // //     );
// // //   }
// // // }

// // // export async function PUT(
// // //   request: NextRequest,
// // //   { params }: { params: { resultId: string } }
// // // ) {
// // //   try {
// // //     const { resultId } = params;
// // //     const body = await request.json();
// // //     const { updates, studentIndex, moduleCode, examYear, examMonth, assessmentId } = body;

// // //     // Update grades in both tables
// // //     for (const update of updates) {
// // //       const { questionId, mark, reason, modelType } = update;

// // //       if (modelType === 'openai') {
// // //         await prisma.graded_student_answers_openai.updateMany({
// // //           where: {
// // //             student_index: studentIndex,
// // //             module_code: moduleCode,
// // //             exam_year: parseInt(examYear),
// // //             exam_month: examMonth,
// // //             assessment_id: assessmentId,
// // //             full_question_id: questionId
// // //           },
// // //           data: {
// // //             mark: parseFloat(mark),
// // //             reason: reason
// // //           }
// // //         });
// // //       } else if (modelType === 'gemini') {
// // //         await prisma.graded_student_answers_gemini.updateMany({
// // //           where: {
// // //             student_index: studentIndex,
// // //             module_code: moduleCode,
// // //             exam_year: parseInt(examYear),
// // //             exam_month: examMonth,
// // //             assessment_id: assessmentId,
// // //             full_question_id: questionId
// // //           },
// // //           data: {
// // //             mark: parseFloat(mark),
// // //             reason: reason
// // //           }
// // //         });
// // //       }
// // //     }

// // //     // Recalculate total marks
// // //     const updatedOpenaiResults = await prisma.graded_student_answers_openai.findMany({
// // //       where: {
// // //         student_index: studentIndex,
// // //         module_code: moduleCode,
// // //         exam_year: parseInt(examYear),
// // //         exam_month: examMonth,
// // //         assessment_id: assessmentId
// // //       }
// // //     });

// // //     const updatedGeminiResults = await prisma.graded_student_answers_gemini.findMany({
// // //       where: {
// // //         student_index: studentIndex,
// // //         module_code: moduleCode,
// // //         exam_year: parseInt(examYear),
// // //         exam_month: examMonth,
// // //         assessment_id: assessmentId
// // //       }
// // //     });

// // //     // Calculate new totals (using the same logic as in the GET method)
// // //     const mergedResults = new Map();
    
// // //     updatedOpenaiResults.forEach(result => {
// // //       mergedResults.set(result.full_question_id, result);
// // //     });

// // //     updatedGeminiResults.forEach(result => {
// // //       const existing = mergedResults.get(result.full_question_id);
// // //       if (!existing || result.graded_at > existing.graded_at) {
// // //         mergedResults.set(result.full_question_id, result);
// // //       }
// // //     });

// // //     const totalMarks = Array.from(mergedResults.values())
// // //       .reduce((sum, result) => sum + result.mark, 0);
    
// // //     const totalPossible = Array.from(mergedResults.values())
// // //       .reduce((sum, result) => sum + result.max_marks, 0);

// // //     // Update total marks in results tables
// // //     const hasOpenaiData = updatedOpenaiResults.length > 0;
// // //     const hasGeminiData = updatedGeminiResults.length > 0;

// // //     if (hasOpenaiData) {
// // //       await prisma.student_paper_results_openai.updateMany({
// // //         where: {
// // //           student_index: studentIndex,
// // //           module_code: moduleCode,
// // //           exam_year: parseInt(examYear),
// // //           exam_month: examMonth,
// // //           assessment_id: assessmentId
// // //         },
// // //         data: {
// // //           total_marks: totalMarks,
// // //           total_possible: totalPossible
// // //         }
// // //       });
// // //     }

// // //     if (hasGeminiData) {
// // //       await prisma.student_paper_results_gemini.updateMany({
// // //         where: {
// // //           student_index: studentIndex,
// // //           module_code: moduleCode,
// // //           exam_year: parseInt(examYear),
// // //           exam_month: examMonth,
// // //           assessment_id: assessmentId
// // //         },
// // //         data: {
// // //           total_marks: totalMarks,
// // //           total_possible: totalPossible
// // //         }
// // //       });
// // //     }

// // //     return NextResponse.json({ 
// // //       success: true, 
// // //       message: 'Grades updated successfully',
// // //       totalMarks,
// // //       totalPossible
// // //     });

// // //   } catch (error) {
// // //     console.error('Error updating student grades:', error);
// // //     return NextResponse.json(
// // //       { error: 'Internal server error' },
// // //       { status: 500 }
// // //     );
// // //   }
// // // }

// // import { NextRequest, NextResponse } from 'next/server';
// // import { PrismaClient } from '@prisma/client';

// // const prisma = new PrismaClient();

// // // Type definitions
// // interface GradedAnswerOpenAI {
// //   id: number;
// //   student_index: string;
// //   module_code: string;
// //   exam_year: number;
// //   exam_month: string;
// //   full_question_id: string;
// //   mark: number;
// //   max_marks: number;
// //   reason: string;
// //   graded_at: Date;
// //   is_null_answer: boolean;
// //   assessment_id: string;
// //   submission_id: string | null;
// // }

// // interface GradedAnswerGemini {
// //   id: number;
// //   student_index: string;
// //   module_code: string;
// //   exam_year: number;
// //   exam_month: string;
// //   full_question_id: string;
// //   mark: number;
// //   max_marks: number;
// //   reason: string;
// //   graded_at: Date;
// //   is_null_answer: boolean;
// //   assessment_id: string;
// //   submission_id: string | null;
// // }

// // interface MergedGradedAnswer extends GradedAnswerOpenAI {
// //   model_type: 'openai' | 'gemini';
// // }

// // export async function GET(
// //   request: NextRequest,
// //   { params }: { params: { resultId: string } }
// // ) {
// //   try {
// //     const { resultId } = params;
// //     const url = new URL(request.url);
// //     const studentIndex = url.searchParams.get('studentIndex');
// //     const moduleCode = url.searchParams.get('moduleCode');
// //     const examYear = url.searchParams.get('examYear');
// //     const examMonth = url.searchParams.get('examMonth');
// //     const assessmentId = url.searchParams.get('assessmentId');

// //     if (!studentIndex || !moduleCode || !examYear || !examMonth || !assessmentId) {
// //       return NextResponse.json(
// //         { error: 'Missing required parameters' },
// //         { status: 400 }
// //       );
// //     }

// //     // Get submission details
// //     const submission = await prisma.submission.findFirst({
// //       where: {
// //         assessment: {
// //           assessment_id: assessmentId
// //         },
// //         student: {
// //           registration_number: studentIndex
// //         }
// //       },
// //       include: {
// //         student: {
// //           include: {
// //             user: true
// //           }
// //         },
// //         assessment: {
// //           include: {
// //             module: true
// //           }
// //         }
// //       }
// //     });

// //     if (!submission) {
// //       return NextResponse.json(
// //         { error: 'Submission not found' },
// //         { status: 404 }
// //       );
// //     }

// //     // Get graded answers from both models
// //     const openaiResults = await prisma.graded_student_answers_openai.findMany({
// //       where: {
// //         student_index: studentIndex,
// //         module_code: moduleCode,
// //         exam_year: parseInt(examYear),
// //         exam_month: examMonth,
// //         assessment_id: assessmentId
// //       },
// //       orderBy: {
// //         graded_at: 'desc'
// //       }
// //     });

// //     const geminiResults = await prisma.graded_student_answers_gemini.findMany({
// //       where: {
// //         student_index: studentIndex,
// //         module_code: moduleCode,
// //         exam_year: parseInt(examYear),
// //         exam_month: examMonth,
// //         assessment_id: assessmentId
// //       },
// //       orderBy: {
// //         graded_at: 'desc'
// //       }
// //     });

// //     // Merge results, preferring the most recent evaluation
// //     const mergedResults = new Map<string, MergedGradedAnswer>();

// //     // Add OpenAI results
// //     openaiResults.forEach((result: GradedAnswerOpenAI) => {
// //       mergedResults.set(result.full_question_id, {
// //         ...result,
// //         model_type: 'openai'
// //       });
// //     });

// //     // Add Gemini results, replacing if more recent
// //     geminiResults.forEach((result: GradedAnswerGemini) => {
// //       const existing = mergedResults.get(result.full_question_id);
// //       if (!existing || result.graded_at > existing.graded_at) {
// //         mergedResults.set(result.full_question_id, {
// //           ...result,
// //           model_type: 'gemini'
// //         });
// //       }
// //     });

// //     const gradedAnswers = Array.from(mergedResults.values()).sort((a: MergedGradedAnswer, b: MergedGradedAnswer) => {
// //       // Custom sort for question IDs (Q1_i, Q1_ii, Q2_a, etc.)
// //       const parseQuestionId = (id: string) => {
// //         const parts = id.split('_');
// //         const qNum = parseInt(parts[0].substring(1)); // Remove 'Q' and convert to number
// //         const subPart = parts[1];
// //         return { qNum, subPart };
// //       };

// //       const aNum = parseQuestionId(a.full_question_id);
// //       const bNum = parseQuestionId(b.full_question_id);

// //       if (aNum.qNum !== bNum.qNum) {
// //         return aNum.qNum - bNum.qNum;
// //       }
// //       return aNum.subPart.localeCompare(bNum.subPart);
// //     });

// //     // Get file URL based on submission type
// //     const fileUrl = submission.is_handwritten 
// //       ? submission.handwritten_file_url 
// //       : submission.file_url;

// //     return NextResponse.json({
// //       submission: {
// //         id: submission.submission_id,
// //         studentName: `${submission.student.user.first_name} ${submission.student.user.last_name}`,
// //         studentIndex: submission.student.registration_number,
// //         moduleCode: submission.assessment.module.module_code,
// //         moduleName: submission.assessment.module.module_name,
// //         assessmentTitle: submission.assessment.title,
// //         fileUrl: fileUrl,
// //         submittedAt: submission.submission_end_at || submission.submission_start_at,
// //         isHandwritten: submission.is_handwritten
// //       },
// //       gradedAnswers: gradedAnswers
// //     });

// //   } catch (error) {
// //     console.error('Error fetching student result details:', error);
// //     return NextResponse.json(
// //       { error: 'Internal server error' },
// //       { status: 500 }
// //     );
// //   }
// // }

// // export async function PUT(
// //   request: NextRequest,
// //   { params }: { params: { resultId: string } }
// // ) {
// //   try {
// //     const { resultId } = params;
// //     const body = await request.json();
// //     const { updates, studentIndex, moduleCode, examYear, examMonth, assessmentId } = body;

// //     // Update grades in both tables
// //     for (const update of updates) {
// //       const { questionId, mark, reason, modelType } = update;

// //       if (modelType === 'openai') {
// //         await prisma.graded_student_answers_openai.updateMany({
// //           where: {
// //             student_index: studentIndex,
// //             module_code: moduleCode,
// //             exam_year: parseInt(examYear),
// //             exam_month: examMonth,
// //             assessment_id: assessmentId,
// //             full_question_id: questionId
// //           },
// //           data: {
// //             mark: parseFloat(mark),
// //             reason: reason
// //           }
// //         });
// //       } else if (modelType === 'gemini') {
// //         await prisma.graded_student_answers_gemini.updateMany({
// //           where: {
// //             student_index: studentIndex,
// //             module_code: moduleCode,
// //             exam_year: parseInt(examYear),
// //             exam_month: examMonth,
// //             assessment_id: assessmentId,
// //             full_question_id: questionId
// //           },
// //           data: {
// //             mark: parseFloat(mark),
// //             reason: reason
// //           }
// //         });
// //       }
// //     }

// //     // Recalculate total marks
// //     const updatedOpenaiResults = await prisma.graded_student_answers_openai.findMany({
// //       where: {
// //         student_index: studentIndex,
// //         module_code: moduleCode,
// //         exam_year: parseInt(examYear),
// //         exam_month: examMonth,
// //         assessment_id: assessmentId
// //       }
// //     });

// //     const updatedGeminiResults = await prisma.graded_student_answers_gemini.findMany({
// //       where: {
// //         student_index: studentIndex,
// //         module_code: moduleCode,
// //         exam_year: parseInt(examYear),
// //         exam_month: examMonth,
// //         assessment_id: assessmentId
// //       }
// //     });

// //     // Calculate new totals (using the same logic as in the GET method)
// //     const mergedResults = new Map<string, GradedAnswerOpenAI | GradedAnswerGemini>();
    
// //     updatedOpenaiResults.forEach((result: GradedAnswerOpenAI) => {
// //       mergedResults.set(result.full_question_id, result);
// //     });

// //     updatedGeminiResults.forEach((result: GradedAnswerGemini) => {
// //       const existing = mergedResults.get(result.full_question_id);
// //       if (!existing || result.graded_at > existing.graded_at) {
// //         mergedResults.set(result.full_question_id, result);
// //       }
// //     });

// //     const totalMarks = Array.from(mergedResults.values())
// //       .reduce((sum: number, result: GradedAnswerOpenAI | GradedAnswerGemini) => sum + result.mark, 0);
    
// //     const totalPossible = Array.from(mergedResults.values())
// //       .reduce((sum: number, result: GradedAnswerOpenAI | GradedAnswerGemini) => sum + result.max_marks, 0);

// //     // Update total marks in results tables
// //     const hasOpenaiData = updatedOpenaiResults.length > 0;
// //     const hasGeminiData = updatedGeminiResults.length > 0;

// //     if (hasOpenaiData) {
// //       await prisma.student_paper_results_openai.updateMany({
// //         where: {
// //           student_index: studentIndex,
// //           module_code: moduleCode,
// //           exam_year: parseInt(examYear),
// //           exam_month: examMonth,
// //           assessment_id: assessmentId
// //         },
// //         data: {
// //           total_marks: totalMarks,
// //           total_possible: totalPossible
// //         }
// //       });
// //     }

// //     if (hasGeminiData) {
// //       await prisma.student_paper_results_gemini.updateMany({
// //         where: {
// //           student_index: studentIndex,
// //           module_code: moduleCode,
// //           exam_year: parseInt(examYear),
// //           exam_month: examMonth,
// //           assessment_id: assessmentId
// //         },
// //         data: {
// //           total_marks: totalMarks,
// //           total_possible: totalPossible
// //         }
// //       });
// //     }

// //     return NextResponse.json({ 
// //       success: true, 
// //       message: 'Grades updated successfully',
// //       totalMarks,
// //       totalPossible
// //     });

// //   } catch (error) {
// //     console.error('Error updating student grades:', error);
// //     return NextResponse.json(
// //       { error: 'Internal server error' },
// //       { status: 500 }
// //     );
// //   }
// // }

// import { NextRequest, NextResponse } from 'next/server';
// import { prisma } from '@/lib/prisma';

// // Type definitions
// interface GradedAnswerOpenAI {
//   id: number;
//   student_index: string;
//   module_code: string;
//   exam_year: number;
//   exam_month: string;
//   full_question_id: string;
//   mark: number;
//   max_marks: number;
//   reason: string;
//   graded_at: Date;
//   is_null_answer: boolean;
//   assessment_id: string;
//   submission_id: string | null;
// }

// interface GradedAnswerGemini {
//   id: number;
//   student_index: string;
//   module_code: string;
//   exam_year: number;
//   exam_month: string;
//   full_question_id: string;
//   mark: number;
//   max_marks: number;
//   reason: string;
//   graded_at: Date;
//   is_null_answer: boolean;
//   assessment_id: string;
//   submission_id: string | null;
// }

// interface MergedGradedAnswer extends GradedAnswerOpenAI {
//   model_type: 'openai' | 'gemini';
// }

// export async function GET(
//   request: NextRequest,
//   { params }: { params: { resultId: string } }
// ) {
//   try {
//     const { resultId } = params;
//     const url = new URL(request.url);
//     const studentIndex = url.searchParams.get('studentIndex');
//     const moduleCode = url.searchParams.get('moduleCode');
//     const examYear = url.searchParams.get('examYear');
//     const examMonth = url.searchParams.get('examMonth');
//     const assessmentId = url.searchParams.get('assessmentId');

//     if (!studentIndex || !moduleCode || !examYear || !examMonth || !assessmentId) {
//       return NextResponse.json(
//         { error: 'Missing required parameters' },
//         { status: 400 }
//       );
//     }

//     // Get submission details
//     const submission = await prisma.submission.findFirst({
//       where: {
//         assessment: {
//           assessment_id: assessmentId
//         },
//         student: {
//           registration_number: studentIndex
//         }
//       },
//       include: {
//         student: {
//           include: {
//             user: true
//           }
//         },
//         assessment: {
//           include: {
//             module: true
//           }
//         }
//       }
//     });

//     if (!submission) {
//       return NextResponse.json(
//         { error: 'Submission not found' },
//         { status: 404 }
//       );
//     }

//     // Get graded answers from both models
//     const openaiResults = await prisma.graded_student_answers_openai.findMany({
//       where: {
//         student_index: studentIndex,
//         module_code: moduleCode,
//         exam_year: parseInt(examYear),
//         exam_month: examMonth,
//         assessment_id: assessmentId
//       },
//       orderBy: {
//         graded_at: 'desc'
//       }
//     });

//     const geminiResults = await prisma.graded_student_answers_gemini.findMany({
//       where: {
//         student_index: studentIndex,
//         module_code: moduleCode,
//         exam_year: parseInt(examYear),
//         exam_month: examMonth,
//         assessment_id: assessmentId
//       },
//       orderBy: {
//         graded_at: 'desc'
//       }
//     });

//     // Merge results, preferring the most recent evaluation
//     const mergedResults = new Map<string, MergedGradedAnswer>();

//     // Add OpenAI results
//     openaiResults.forEach((result: GradedAnswerOpenAI) => {
//       mergedResults.set(result.full_question_id, {
//         ...result,
//         model_type: 'openai'
//       });
//     });

//     // Add Gemini results, replacing if more recent
//     geminiResults.forEach((result: GradedAnswerGemini) => {
//       const existing = mergedResults.get(result.full_question_id);
//       if (!existing || result.graded_at > existing.graded_at) {
//         mergedResults.set(result.full_question_id, {
//           ...result,
//           model_type: 'gemini'
//         });
//       }
//     });

//     const gradedAnswers = Array.from(mergedResults.values()).sort((a: MergedGradedAnswer, b: MergedGradedAnswer) => {
//       // Custom sort for question IDs (Q1_i, Q1_ii, Q2_a, etc.)
//       const parseQuestionId = (id: string) => {
//         const parts = id.split('_');
//         const qNum = parseInt(parts[0].substring(1)); // Remove 'Q' and convert to number
//         const subPart = parts[1];
//         return { qNum, subPart };
//       };

//       const aNum = parseQuestionId(a.full_question_id);
//       const bNum = parseQuestionId(b.full_question_id);

//       if (aNum.qNum !== bNum.qNum) {
//         return aNum.qNum - bNum.qNum;
//       }
//       return aNum.subPart.localeCompare(bNum.subPart);
//     });

//     // Get file URL based on submission type
//     const fileUrl = submission.is_handwritten 
//       ? submission.handwritten_file_url 
//       : submission.file_url;

//     return NextResponse.json({
//       submission: {
//         id: submission.submission_id,
//         studentName: `${submission.student.user.first_name} ${submission.student.user.last_name}`,
//         studentIndex: submission.student.registration_number,
//         moduleCode: submission.assessment.module.module_code,
//         moduleName: submission.assessment.module.module_name,
//         assessmentTitle: submission.assessment.title,
//         fileUrl: fileUrl,
//         submittedAt: submission.submission_end_at || submission.submission_start_at,
//         isHandwritten: submission.is_handwritten
//       },
//       gradedAnswers: gradedAnswers
//     });

//   } catch (error) {
//     console.error('Error fetching student result details:', error);
//     return NextResponse.json(
//       { error: 'Internal server error' },
//       { status: 500 }
//     );
//   }
// }

// export async function PUT(
//   request: NextRequest,
//   { params }: { params: { resultId: string } }
// ) {
//   try {
//     const { resultId } = params;
//     const body = await request.json();
//     const { updates, studentIndex, moduleCode, examYear, examMonth, assessmentId } = body;

//     // Update grades in both tables
//     for (const update of updates) {
//       const { questionId, mark, reason, modelType } = update;

//       if (modelType === 'openai') {
//         await prisma.graded_student_answers_openai.updateMany({
//           where: {
//             student_index: studentIndex,
//             module_code: moduleCode,
//             exam_year: parseInt(examYear),
//             exam_month: examMonth,
//             assessment_id: assessmentId,
//             full_question_id: questionId
//           },
//           data: {
//             mark: parseFloat(mark),
//             reason: reason
//           }
//         });
//       } else if (modelType === 'gemini') {
//         await prisma.graded_student_answers_gemini.updateMany({
//           where: {
//             student_index: studentIndex,
//             module_code: moduleCode,
//             exam_year: parseInt(examYear),
//             exam_month: examMonth,
//             assessment_id: assessmentId,
//             full_question_id: questionId
//           },
//           data: {
//             mark: parseFloat(mark),
//             reason: reason
//           }
//         });
//       }
//     }

//     // Recalculate total marks
//     const updatedOpenaiResults = await prisma.graded_student_answers_openai.findMany({
//       where: {
//         student_index: studentIndex,
//         module_code: moduleCode,
//         exam_year: parseInt(examYear),
//         exam_month: examMonth,
//         assessment_id: assessmentId
//       }
//     });

//     const updatedGeminiResults = await prisma.graded_student_answers_gemini.findMany({
//       where: {
//         student_index: studentIndex,
//         module_code: moduleCode,
//         exam_year: parseInt(examYear),
//         exam_month: examMonth,
//         assessment_id: assessmentId
//       }
//     });

//     // Calculate new totals (using the same logic as in the GET method)
//     const mergedResults = new Map<string, GradedAnswerOpenAI | GradedAnswerGemini>();
    
//     updatedOpenaiResults.forEach((result: GradedAnswerOpenAI) => {
//       mergedResults.set(result.full_question_id, result);
//     });

//     updatedGeminiResults.forEach((result: GradedAnswerGemini) => {
//       const existing = mergedResults.get(result.full_question_id);
//       if (!existing || result.graded_at > existing.graded_at) {
//         mergedResults.set(result.full_question_id, result);
//       }
//     });

//     const totalMarks = Array.from(mergedResults.values())
//       .reduce((sum: number, result: GradedAnswerOpenAI | GradedAnswerGemini) => sum + result.mark, 0);
    
//     const totalPossible = Array.from(mergedResults.values())
//       .reduce((sum: number, result: GradedAnswerOpenAI | GradedAnswerGemini) => sum + result.max_marks, 0);

//     // Update total marks in results tables
//     const hasOpenaiData = updatedOpenaiResults.length > 0;
//     const hasGeminiData = updatedGeminiResults.length > 0;

//     if (hasOpenaiData) {
//       await prisma.student_paper_results_openai.updateMany({
//         where: {
//           student_index: studentIndex,
//           module_code: moduleCode,
//           exam_year: parseInt(examYear),
//           exam_month: examMonth,
//           assessment_id: assessmentId
//         },
//         data: {
//           total_marks: totalMarks,
//           total_possible: totalPossible
//         }
//       });
//     }

//     if (hasGeminiData) {
//       await prisma.student_paper_results_gemini.updateMany({
//         where: {
//           student_index: studentIndex,
//           module_code: moduleCode,
//           exam_year: parseInt(examYear),
//           exam_month: examMonth,
//           assessment_id: assessmentId
//         },
//         data: {
//           total_marks: totalMarks,
//           total_possible: totalPossible
//         }
//       });
//     }

//     return NextResponse.json({ 
//       success: true, 
//       message: 'Grades updated successfully',
//       totalMarks,
//       totalPossible
//     });

//   } catch (error) {
//     console.error('Error updating student grades:', error);
//     return NextResponse.json(
//       { error: 'Internal server error' },
//       { status: 500 }
//     );
//   }
// }

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Type definitions
interface GradedAnswerOpenAI {
  id: number;
  student_index: string;
  module_code: string;
  exam_year: number;
  exam_month: string;
  full_question_id: string;
  mark: number;
  max_marks: number;
  reason: string;
  graded_at: Date;
  is_null_answer: boolean;
  assessment_id: string;
  submission_id: string | null;
}

interface GradedAnswerGemini {
  id: number;
  student_index: string;
  module_code: string;
  exam_year: number;
  exam_month: string;
  full_question_id: string;
  mark: number;
  max_marks: number;
  reason: string;
  graded_at: Date;
  is_null_answer: boolean;
  assessment_id: string;
  submission_id: string | null;
}

interface MergedGradedAnswer extends GradedAnswerOpenAI {
  model_type: 'openai' | 'gemini';
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ resultId: string }> }
) {
  try {
    const { resultId } = await params;
    const url = new URL(request.url);
    const studentIndex = url.searchParams.get('studentIndex');
    const moduleCode = url.searchParams.get('moduleCode');
    const examYear = url.searchParams.get('examYear');
    const examMonth = url.searchParams.get('examMonth');
    const assessmentId = url.searchParams.get('assessmentId');

    if (!studentIndex || !moduleCode || !examYear || !examMonth || !assessmentId) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Get submission details
    const submission = await prisma.submission.findFirst({
      where: {
        assessment: {
          assessment_id: assessmentId
        },
        student: {
          registration_number: studentIndex
        }
      },
      include: {
        student: {
          include: {
            user: true
          }
        },
        assessment: {
          include: {
            module: true
          }
        }
      }
    });

    if (!submission) {
      return NextResponse.json(
        { error: 'Submission not found' },
        { status: 404 }
      );
    }

    // Get graded answers from both models
    const openaiResults = await prisma.graded_student_answers_openai.findMany({
      where: {
        student_index: studentIndex,
        module_code: moduleCode,
        exam_year: parseInt(examYear),
        exam_month: examMonth,
        assessment_id: assessmentId
      },
      orderBy: {
        graded_at: 'desc'
      }
    });

    const geminiResults = await prisma.graded_student_answers_gemini.findMany({
      where: {
        student_index: studentIndex,
        module_code: moduleCode,
        exam_year: parseInt(examYear),
        exam_month: examMonth,
        assessment_id: assessmentId
      },
      orderBy: {
        graded_at: 'desc'
      }
    });

    // Merge results, preferring the most recent evaluation
    const mergedResults = new Map<string, MergedGradedAnswer>();

    // Add OpenAI results
    openaiResults.forEach((result: GradedAnswerOpenAI) => {
      mergedResults.set(result.full_question_id, {
        ...result,
        model_type: 'openai'
      });
    });

    // Add Gemini results, replacing if more recent
    geminiResults.forEach((result: GradedAnswerGemini) => {
      const existing = mergedResults.get(result.full_question_id);
      if (!existing || result.graded_at > existing.graded_at) {
        mergedResults.set(result.full_question_id, {
          ...result,
          model_type: 'gemini'
        });
      }
    });

    const gradedAnswers = Array.from(mergedResults.values()).sort((a: MergedGradedAnswer, b: MergedGradedAnswer) => {
      // Custom sort for question IDs (Q1_i, Q1_ii, Q2_a, etc.)
      const parseQuestionId = (id: string) => {
        const parts = id.split('_');
        const qNum = parseInt(parts[0].substring(1)); // Remove 'Q' and convert to number
        const subPart = parts[1];
        return { qNum, subPart };
      };

      const aNum = parseQuestionId(a.full_question_id);
      const bNum = parseQuestionId(b.full_question_id);

      if (aNum.qNum !== bNum.qNum) {
        return aNum.qNum - bNum.qNum;
      }
      return aNum.subPart.localeCompare(bNum.subPart);
    });

    // Get file URL based on submission type
    const fileUrl = submission.is_handwritten 
      ? submission.handwritten_file_url 
      : submission.file_url;

    return NextResponse.json({
      submission: {
        id: submission.submission_id,
        studentName: `${submission.student.user.first_name} ${submission.student.user.last_name}`,
        studentIndex: submission.student.registration_number,
        moduleCode: submission.assessment.module.module_code,
        moduleName: submission.assessment.module.module_name,
        assessmentTitle: submission.assessment.title,
        fileUrl: fileUrl,
        submittedAt: submission.submission_end_at || submission.submission_start_at,
        isHandwritten: submission.is_handwritten
      },
      gradedAnswers: gradedAnswers
    });

  } catch (error) {
    console.error('Error fetching student result details:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ resultId: string }> }
) {
  try {
    const { resultId } = await params;
    const body = await request.json();
    const { updates, studentIndex, moduleCode, examYear, examMonth, assessmentId } = body;

    // Update grades in both tables
    for (const update of updates) {
      const { questionId, mark, reason, modelType } = update;

      if (modelType === 'openai') {
        await prisma.graded_student_answers_openai.updateMany({
          where: {
            student_index: studentIndex,
            module_code: moduleCode,
            exam_year: parseInt(examYear),
            exam_month: examMonth,
            assessment_id: assessmentId,
            full_question_id: questionId
          },
          data: {
            mark: parseFloat(mark),
            reason: reason
          }
        });
      } else if (modelType === 'gemini') {
        await prisma.graded_student_answers_gemini.updateMany({
          where: {
            student_index: studentIndex,
            module_code: moduleCode,
            exam_year: parseInt(examYear),
            exam_month: examMonth,
            assessment_id: assessmentId,
            full_question_id: questionId
          },
          data: {
            mark: parseFloat(mark),
            reason: reason
          }
        });
      }
    }

    // Recalculate total marks
    const updatedOpenaiResults = await prisma.graded_student_answers_openai.findMany({
      where: {
        student_index: studentIndex,
        module_code: moduleCode,
        exam_year: parseInt(examYear),
        exam_month: examMonth,
        assessment_id: assessmentId
      }
    });

    const updatedGeminiResults = await prisma.graded_student_answers_gemini.findMany({
      where: {
        student_index: studentIndex,
        module_code: moduleCode,
        exam_year: parseInt(examYear),
        exam_month: examMonth,
        assessment_id: assessmentId
      }
    });

    // Calculate new totals (using the same logic as in the GET method)
    const mergedResults = new Map<string, GradedAnswerOpenAI | GradedAnswerGemini>();
    
    updatedOpenaiResults.forEach((result: GradedAnswerOpenAI) => {
      mergedResults.set(result.full_question_id, result);
    });

    updatedGeminiResults.forEach((result: GradedAnswerGemini) => {
      const existing = mergedResults.get(result.full_question_id);
      if (!existing || result.graded_at > existing.graded_at) {
        mergedResults.set(result.full_question_id, result);
      }
    });

    const totalMarks = Array.from(mergedResults.values())
      .reduce((sum: number, result: GradedAnswerOpenAI | GradedAnswerGemini) => sum + result.mark, 0);
    
    const totalPossible = Array.from(mergedResults.values())
      .reduce((sum: number, result: GradedAnswerOpenAI | GradedAnswerGemini) => sum + result.max_marks, 0);

    // Update total marks in results tables
    const hasOpenaiData = updatedOpenaiResults.length > 0;
    const hasGeminiData = updatedGeminiResults.length > 0;

    if (hasOpenaiData) {
      await prisma.student_paper_results_openai.updateMany({
        where: {
          student_index: studentIndex,
          module_code: moduleCode,
          exam_year: parseInt(examYear),
          exam_month: examMonth,
          assessment_id: assessmentId
        },
        data: {
          total_marks: totalMarks,
          total_possible: totalPossible
        }
      });
    }

    if (hasGeminiData) {
      await prisma.student_paper_results_gemini.updateMany({
        where: {
          student_index: studentIndex,
          module_code: moduleCode,
          exam_year: parseInt(examYear),
          exam_month: examMonth,
          assessment_id: assessmentId
        },
        data: {
          total_marks: totalMarks,
          total_possible: totalPossible
        }
      });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Grades updated successfully',
      totalMarks,
      totalPossible
    });

  } catch (error) {
    console.error('Error updating student grades:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}