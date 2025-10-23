// utils/questionPaperExport.ts
import * as XLSX from 'xlsx';

interface Question {
  question_id: string;
  assessment_id: string;
  type: "MCQ" | "SHORT";
  question_number: string;
  question: string;
  model_answer: string;
  mcq_answer_options: string[];
  marks_allowed: string;
}

interface Assessment {
  assessment_id: string;
  type: string;
  title: string;
  description?: string;
  deadline: string;
  open_at?: string;
  close_at?: string;
  duration?: number;
  total_marks?: number;
  max_marks?: number;
  instructions?: string[];
  questions?: Question[];
  module: {
    module_code: string;
    module_name: string;
  };
}

// Helper function to format date
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Helper function to format duration
const formatDuration = (minutes: number) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours > 0) {
    return `${hours}h ${mins}m`;
  }
  return `${mins}m`;
};

// Generate PDF using browser's print functionality with improved styling
export const downloadPDF = async (assessment: Assessment) => {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    throw new Error('Unable to open print window');
  }

  const html = generateHTMLContent(assessment);
  
  printWindow.document.write(html);
  printWindow.document.close();
  
  // Wait for content to load
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  printWindow.print();
  printWindow.close();
};

// Generate HTML content for PDF with professional styling
const generateHTMLContent = (assessment: Assessment): string => {
  const questions = assessment.questions || [];
  const sortedQuestions = [...questions].sort((a, b) => 
    parseInt(a.question_number) - parseInt(b.question_number)
  );

  const totalMarks = assessment.total_marks || 
    questions.reduce((total, q) => total + parseInt(q.marks_allowed || "0"), 0);

  const correctAnswerIndex = (question: Question) => {
    if (question.type === "MCQ" && question.mcq_answer_options.length > 0) {
      return question.mcq_answer_options.findIndex(
        (option) =>
          option.trim().toLowerCase() ===
          question.model_answer.trim().toLowerCase()
      );
    }
    return -1;
  };

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${assessment.title} - Question Paper</title>
      <style>
        @page {
          margin: 1in;
          size: A4;
        }
        body {
          font-family: 'Arial', sans-serif;
          margin: 0;
          padding: 0;
          line-height: 1.6;
          color: #333;
          font-size: 14px;
        }
        .header {
          text-align: center;
          border-bottom: 3px solid #2563eb;
          padding-bottom: 25px;
          margin-bottom: 40px;
        }
        .title {
          font-size: 28px;
          font-weight: bold;
          margin: 15px 0;
          color: #1f2937;
        }
        .subtitle {
          font-size: 18px;
          margin: 10px 0;
          color: #374151;
        }
        .assessment-info {
          display: flex;
          justify-content: space-between;
          margin: 25px 0;
          font-size: 14px;
          flex-wrap: wrap;
          gap: 20px;
        }
        .info-item {
          text-align: center;
          padding: 10px;
          background-color: #f8fafc;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
          flex: 1;
          min-width: 150px;
        }
        .info-label {
          font-weight: bold;
          color: #4b5563;
          display: block;
          margin-bottom: 5px;
        }
        .info-value {
          color: #1f2937;
          font-size: 16px;
        }
        .instructions {
          background-color: #eff6ff;
          border: 2px solid #bfdbfe;
          padding: 20px;
          margin: 30px 0;
          border-radius: 10px;
        }
        .instructions h3 {
          margin-top: 0;
          color: #1d4ed8;
          font-size: 18px;
          margin-bottom: 15px;
        }
        .instructions ol {
          margin: 0;
          padding-left: 20px;
        }
        .instructions li {
          margin-bottom: 8px;
          line-height: 1.5;
        }
        .question {
          margin: 40px 0;
          break-inside: avoid;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          overflow: hidden;
          background-color: #ffffff;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        .question-header {
          background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
          padding: 15px 20px;
          border-bottom: 1px solid #d1d5db;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .question-number {
          font-weight: bold;
          color: #1e40af;
          font-size: 16px;
        }
        .question-type {
          font-size: 12px;
          background-color: #dbeafe;
          color: #1e40af;
          padding: 4px 10px;
          border-radius: 15px;
          font-weight: 500;
          margin-left: 12px;
        }
        .marks {
          font-weight: bold;
          color: #dc2626;
          background-color: #fee2e2;
          padding: 6px 12px;
          border-radius: 6px;
          font-size: 14px;
        }
        .question-content {
          padding: 20px;
          font-size: 16px;
          font-weight: 500;
          line-height: 1.7;
          color: #1f2937;
        }
        .mcq-options {
          padding: 0 20px 20px 20px;
        }
        .mcq-option {
          margin: 12px 0;
          display: flex;
          align-items: flex-start;
          padding: 12px;
          background-color: #f9fafb;
          border-radius: 8px;
          border: 1px solid #e5e7eb;
        }
        .option-letter {
          font-weight: bold;
          margin-right: 15px;
          min-width: 25px;
          background-color: #e5e7eb;
          color: #374151;
          width: 25px;
          height: 25px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
        }
        .option-text {
          flex: 1;
          line-height: 1.5;
        }
        .short-answer-space {
          margin: 0 20px 20px 20px;
        }
        .answer-line {
          border-bottom: 1px solid #9ca3af;
          height: 30px;
          margin-bottom: 20px;
        }
        .footer {
          margin-top: 60px;
          text-align: center;
          font-size: 12px;
          color: #6b7280;
          border-top: 2px solid #e5e7eb;
          padding-top: 25px;
        }
        @media print {
          body { 
            margin: 0; 
            -webkit-print-color-adjust: exact;
            color-adjust: exact;
          }
          .question { 
            page-break-inside: avoid;
            box-shadow: none;
          }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="title">${assessment.title}</div>
        <div class="subtitle">${assessment.module.module_code} - ${assessment.module.module_name}</div>
        <div class="assessment-info">
          ${assessment.open_at ? `
            <div class="info-item">
              <span class="info-label">Date</span>
              <span class="info-value">${formatDate(assessment.open_at)}</span>
            </div>
          ` : ''}
          ${assessment.duration ? `
            <div class="info-item">
              <span class="info-label">Duration</span>
              <span class="info-value">${formatDuration(assessment.duration)}</span>
            </div>
          ` : ''}
          <div class="info-item">
            <span class="info-label">Total Marks</span>
            <span class="info-value">${totalMarks}</span>
          </div>
        </div>
      </div>

      ${assessment.instructions && assessment.instructions.length > 0 ? `
        <div class="instructions">
          <h3>📋 Instructions</h3>
          <ol>
            ${assessment.instructions.map(instruction => 
              `<li>${instruction.replace(/^\d+\.\s*/, '')}</li>`
            ).join('')}
          </ol>
        </div>
      ` : ''}

      ${sortedQuestions.map((question) => `
        <div class="question">
          <div class="question-header">
            <div>
              <span class="question-number">Question ${question.question_number}</span>
              <span class="question-type">${question.type === 'MCQ' ? 'Multiple Choice' : 'Short Answer'}</span>
            </div>
            <div class="marks">${question.marks_allowed} marks</div>
          </div>
          
          <div class="question-content">
            ${question.question}
          </div>

          ${question.type === 'MCQ' && question.mcq_answer_options.length > 0 ? `
            <div class="mcq-options">
              ${question.mcq_answer_options.map((option, optIndex) => 
                option.trim() ? `
                  <div class="mcq-option">
                    <span class="option-letter">${String.fromCharCode(65 + optIndex)}</span>
                    <span class="option-text">${option.trim()}</span>
                  </div>
                ` : ''
              ).join('')}
            </div>
          ` : `
            <div class="short-answer-space">
              <div class="answer-line"></div>
              <div class="answer-line"></div>
              <div class="answer-line"></div>
              <div class="answer-line"></div>
            </div>
          `}
        </div>
      `).join('')}

      <div class="footer">
        <p><strong>End of Question Paper</strong></p>
        <p>Generated on ${new Date().toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })}</p>
      </div>
    </body>
    </html>
  `;
};

// Generate DOCX using HTML to DOCX conversion
export const downloadDOCX = async (assessment: Assessment) => {
  const questions = assessment.questions || [];
  const sortedQuestions = [...questions].sort((a, b) => 
    parseInt(a.question_number) - parseInt(b.question_number)
  );

  const totalMarks = assessment.total_marks || 
    questions.reduce((total, q) => total + parseInt(q.marks_allowed || "0"), 0);

  // Create HTML content for DOCX
  let htmlContent = `
    <div style="text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px;">
      <h1 style="font-size: 24px; font-weight: bold; margin: 10px 0;">${assessment.title}</h1>
      <h3 style="font-size: 16px; margin: 5px 0;">${assessment.module.module_code} - ${assessment.module.module_name}</h3>
      <div style="display: flex; justify-content: space-between; margin: 20px 0; flex-wrap: wrap; gap: 20px;">
        ${assessment.open_at ? `<div><strong>Date:</strong> ${formatDate(assessment.open_at)}</div>` : ''}
        ${assessment.duration ? `<div><strong>Duration:</strong> ${formatDuration(assessment.duration)}</div>` : ''}
        <div><strong>Total Marks:</strong> ${totalMarks}</div>
      </div>
    </div>

    ${assessment.instructions && assessment.instructions.length > 0 ? `
      <div style="background-color: #f5f5f5; border: 1px solid #ddd; padding: 15px; margin: 20px 0; border-radius: 5px;">
        <h3 style="margin-top: 0; color: #2563eb;">📋 Instructions:</h3>
        <ol style="margin: 0; padding-left: 20px;">
          ${assessment.instructions.map(instruction => 
            `<li style="margin-bottom: 8px;">${instruction.replace(/^\d+\.\s*/, '')}</li>`
          ).join('')}
        </ol>
      </div>
    ` : ''}

    ${sortedQuestions.map(question => `
      <div style="margin: 30px 0; page-break-inside: avoid; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #f8f9fa; border-bottom: 1px solid #dee2e6; padding: 15px; display: flex; justify-content: space-between; align-items: center;">
          <div>
            <strong style="color: #2563eb; font-size: 16px;">Question ${question.question_number}</strong>
            <span style="font-size: 12px; background-color: #e3f2fd; color: #1976d2; padding: 3px 8px; border-radius: 12px; margin-left: 10px;">
              ${question.type === 'MCQ' ? 'Multiple Choice' : 'Short Answer'}
            </span>
          </div>
          <div style="font-weight: bold; color: #f57c00; background-color: #fff3e0; padding: 6px 12px; border-radius: 6px;">${question.marks_allowed} marks</div>
        </div>
        
        <div style="padding: 20px; font-size: 16px; font-weight: 500; line-height: 1.7;">
          ${question.question}
        </div>

        ${question.type === 'MCQ' && question.mcq_answer_options.length > 0 ? `
          <div style="padding: 0 20px 20px 20px;">
            ${question.mcq_answer_options.map((option, optIndex) => 
              option.trim() ? `
                <div style="margin: 12px 0; display: flex; align-items: flex-start; padding: 12px; background-color: #f9fafb; border-radius: 8px; border: 1px solid #e5e7eb;">
                  <span style="font-weight: bold; margin-right: 15px; background-color: #e5e7eb; color: #374151; width: 25px; height: 25px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 14px;">${String.fromCharCode(65 + optIndex)}</span>
                  <span style="flex: 1;">${option.trim()}</span>
                </div>
              ` : ''
            ).join('')}
          </div>
        ` : `
          <div style="margin: 0 20px 20px 20px;">
            <div style="border-bottom: 1px solid #9ca3af; height: 30px; margin-bottom: 20px;"></div>
            <div style="border-bottom: 1px solid #9ca3af; height: 30px; margin-bottom: 20px;"></div>
            <div style="border-bottom: 1px solid #9ca3af; height: 30px; margin-bottom: 20px;"></div>
            <div style="border-bottom: 1px solid #9ca3af; height: 30px; margin-bottom: 20px;"></div>
          </div>
        `}
      </div>
    `).join('')}

    <div style="margin-top: 50px; text-align: center; font-size: 12px; color: #666; border-top: 1px solid #ddd; padding-top: 20px;">
      <p><strong>End of Question Paper</strong></p>
      <p>Generated on ${new Date().toLocaleDateString()}</p>
    </div>
  `;

  // Create a blob with HTML content and download as DOCX
  const blob = new Blob([
    `<!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>${assessment.title} - Question Paper</title>
    </head>
    <body style="font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; color: #333;">
      ${htmlContent}
    </body>
    </html>`
  ], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
  
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${assessment.title.replace(/[^a-zA-Z0-9]/g, '_')}_Question_Paper.docx`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// Generate Excel file
export const downloadExcel = async (assessment: Assessment) => {
  const questions = assessment.questions || [];
  const sortedQuestions = [...questions].sort((a, b) => 
    parseInt(a.question_number) - parseInt(b.question_number)
  );

  const totalMarks = assessment.total_marks || 
    questions.reduce((total, q) => total + parseInt(q.marks_allowed || "0"), 0);

  // Create workbook
  const workbook = XLSX.utils.book_new();

  // Assessment Info Sheet
  const assessmentInfo = [
    ['Assessment Information'],
    [''],
    ['Title', assessment.title],
    ['Module Code', assessment.module.module_code],
    ['Module Name', assessment.module.module_name],
    ['Type', 'Quiz'],
    ['Total Questions', questions.length],
    ['Total Marks', totalMarks],
    ...(assessment.open_at ? [['Open Date', formatDate(assessment.open_at)]] : []),
    ...(assessment.close_at ? [['Close Date', formatDate(assessment.close_at)]] : []),
    ...(assessment.duration ? [['Duration', formatDuration(assessment.duration)]] : []),
    [''],
    ...(assessment.instructions && assessment.instructions.length > 0 ? 
      [['Instructions'], ...assessment.instructions.map((instruction, index) => [`${index + 1}. ${instruction.replace(/^\d+\.\s*/, '')}`])] : 
      []
    )
  ];

  const assessmentSheet = XLSX.utils.aoa_to_sheet(assessmentInfo);
  
  // Set column widths
  assessmentSheet['!cols'] = [
    { wch: 20 }, // Column A
    { wch: 50 }  // Column B
  ];

  XLSX.utils.book_append_sheet(workbook, assessmentSheet, 'Assessment Info');

  // Questions Sheet
  const questionsData = [
    ['Question No.', 'Type', 'Question', 'Marks', 'Option A', 'Option B', 'Option C', 'Option D', 'Option E', 'Correct Answer']
  ];

  sortedQuestions.forEach(question => {
    const row = [
      question.question_number,
      question.type === 'MCQ' ? 'Multiple Choice' : 'Short Answer',
      question.question,
      question.marks_allowed
    ];

    if (question.type === 'MCQ' && question.mcq_answer_options.length > 0) {
      // Add options (up to 5)
      for (let i = 0; i < 5; i++) {
        row.push(question.mcq_answer_options[i]?.trim() || '');
      }
      row.push(question.model_answer);
    } else {
      // Short answer - empty options, model answer in correct answer column
      for (let i = 0; i < 5; i++) {
        row.push('');
      }
      row.push(question.model_answer);
    }

    questionsData.push(row);
  });

  const questionsSheet = XLSX.utils.aoa_to_sheet(questionsData);
  
  // Set column widths for questions sheet
  questionsSheet['!cols'] = [
    { wch: 12 }, // Question No.
    { wch: 15 }, // Type
    { wch: 50 }, // Question
    { wch: 8 },  // Marks
    { wch: 20 }, // Option A
    { wch: 20 }, // Option B
    { wch: 20 }, // Option C
    { wch: 20 }, // Option D
    { wch: 20 }, // Option E
    { wch: 30 }  // Correct Answer
  ];

  XLSX.utils.book_append_sheet(workbook, questionsSheet, 'Questions');

  // Question Statistics Sheet
  const mcqCount = questions.filter(q => q.type === 'MCQ').length;
  const shortAnswerCount = questions.filter(q => q.type === 'SHORT').length;

  const statisticsData = [
    ['Question Paper Statistics'],
    [''],
    ['Total Questions', questions.length],
    ['Multiple Choice Questions', mcqCount],
    ['Short Answer Questions', shortAnswerCount],
    ['Total Marks', totalMarks],
    [''],
    ['Question Distribution by Marks'],
    ['Marks', 'Count'],
  ];

  // Count questions by marks
  const marksCounts: { [key: string]: number } = {};
  questions.forEach(q => {
    const marks = q.marks_allowed;
    marksCounts[marks] = (marksCounts[marks] || 0) + 1;
  });

  Object.entries(marksCounts)
    .sort(([a], [b]) => parseInt(a) - parseInt(b))
    .forEach(([marks, count]) => {
      statisticsData.push([`${marks} marks`, count]);
    });

  const statisticsSheet = XLSX.utils.aoa_to_sheet(statisticsData);
  
  // Set column widths for statistics sheet
  statisticsSheet['!cols'] = [
    { wch: 25 }, // Labels
    { wch: 15 }  // Values
  ];

  XLSX.utils.book_append_sheet(workbook, statisticsSheet, 'Statistics');

  // Blank Answer Sheet (for students)
  const answerSheetData = [
    ['ANSWER SHEET'],
    [''],
    ['Name: ________________________________', 'Student ID: ________________________________'],
    ['Date: ________________________________', 'Time: ________________________________'],
    [''],
    ['Question', 'Answer'],
  ];

  sortedQuestions.forEach(question => {
    if (question.type === 'MCQ') {
      answerSheetData.push([
        `Q${question.question_number}`,
        'A / B / C / D / E (Circle one)'
      ]);
    } else {
      answerSheetData.push([
        `Q${question.question_number}`,
        '_'.repeat(50)
      ]);
      // Add extra lines for short answers
      answerSheetData.push(['', '_'.repeat(50)]);
      answerSheetData.push(['', '_'.repeat(50)]);
    }
  });

  const answerSheet = XLSX.utils.aoa_to_sheet(answerSheetData);
  
  // Set column widths for answer sheet
  answerSheet['!cols'] = [
    { wch: 15 }, // Question
    { wch: 60 }  // Answer
  ];

  XLSX.utils.book_append_sheet(workbook, answerSheet, 'Answer Sheet');

  // Download the file
  const fileName = `${assessment.title.replace(/[^a-zA-Z0-9]/g, '_')}_Question_Paper.xlsx`;
  XLSX.writeFile(workbook, fileName);
};

// Main export function
export const downloadQuestionPaper = async (assessment: Assessment, format: 'pdf' | 'docx' | 'excel') => {
  if (!assessment.questions || assessment.questions.length === 0) {
    throw new Error('No questions available to export');
  }

  switch (format) {
    case 'pdf':
      await downloadPDF(assessment);
      break;
    case 'docx':
      await downloadDOCX(assessment);
      break;
    case 'excel':
      await downloadExcel(assessment);
      break;
    default:
      throw new Error('Unsupported export format');
  }
};