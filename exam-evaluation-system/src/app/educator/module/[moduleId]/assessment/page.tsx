"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { FiTrash2, FiDownload, FiFileText, FiFile } from "react-icons/fi";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import Button from "@/components/Button";

interface Question {
  questionText: string;
  options: string[];
  correctAnswerIndex: number;
  marks?: number;
}

const assessmentTypes = [
  { label: "Quiz", value: "quiz" },
  { label: "Assignment", value: "assignment" },
  { label: "Mid Exam", value: "midExam" },
  { label: "End Exam", value: "endExam" },
];

export default function AssessmentFormPage() {
  const { moduleId } = useParams();
  const router = useRouter();

  const [type, setType] = useState("quiz");
  const [title, setTitle] = useState("");
  const [duration, setDuration] = useState("");
  const [description, setDescription] = useState("");
  const [totalMarks, setTotalMarks] = useState("");
  const [instructions, setInstructions] = useState("");
  const [questions, setQuestions] = useState<Question[]>([
    {
      questionText: "",
      options: ["", "", "", ""],
      correctAnswerIndex: 0,
      marks: 1,
    },
  ]);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleQuestionChange = (
    index: number,
    field: keyof Question,
    value: any
  ) => {
    const newQuestions = [...questions];
    newQuestions[index][field] = value;
    setQuestions(newQuestions);
  };

  const handleOptionChange = (qIdx: number, optIdx: number, value: string) => {
    const newQuestions = [...questions];
    newQuestions[qIdx].options[optIdx] = value;
    setQuestions(newQuestions);
  };

  const addOption = (qIdx: number) => {
    const newQuestions = [...questions];
    newQuestions[qIdx].options.push("");
    setQuestions(newQuestions);
  };

  const removeOption = (qIdx: number, optIdx: number) => {
    const newQuestions = [...questions];
    newQuestions[qIdx].options.splice(optIdx, 1);

    if (
      newQuestions[qIdx].correctAnswerIndex >= newQuestions[qIdx].options.length
    ) {
      newQuestions[qIdx].correctAnswerIndex = 0;
    }

    setQuestions(newQuestions);
  };

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        questionText: "",
        options: ["", "", "", ""],
        correctAnswerIndex: 0,
        marks: 1,
      },
    ]);
  };

  const removeQuestion = (index: number) => {
    const newQuestions = questions.filter((_, i) => i !== index);
    setQuestions(newQuestions);
  };

  // Generate PDF content
  const generatePDF = async () => {
    setIsGenerating(true);
    try {
      // Import jsPDF dynamically to avoid SSR issues
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF();
      
      // Set up document styling
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 20;
      const lineHeight = 7;
      let yPosition = margin;

      // Helper function to add text with word wrapping
      const addText = (text: string, x: number, y: number, maxWidth: number, fontSize = 11) => {
        doc.setFontSize(fontSize);
        const lines = doc.splitTextToSize(text, maxWidth);
        doc.text(lines, x, y);
        return y + (lines.length * lineHeight);
      };

      // Header
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text(title || 'Assessment', pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 15;

      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      if (duration) {
        doc.text(`Duration: ${duration} minutes`, margin, yPosition);
        yPosition += 10;
      }
      if (totalMarks) {
        doc.text(`Total Marks: ${totalMarks}`, margin, yPosition);
        yPosition += 10;
      }

      // Instructions
      if (instructions) {
        yPosition += 5;
        doc.setFont('helvetica', 'bold');
        yPosition = addText('Instructions:', margin, yPosition, pageWidth - 2 * margin, 12);
        doc.setFont('helvetica', 'normal');
        yPosition = addText(instructions, margin, yPosition + 5, pageWidth - 2 * margin);
        yPosition += 10;
      }

      // Description
      if (description) {
        yPosition += 5;
        yPosition = addText(description, margin, yPosition, pageWidth - 2 * margin);
        yPosition += 10;
      }

      // Questions
      questions.forEach((question, index) => {
        // Check if we need a new page
        if (yPosition > 250) {
          doc.addPage();
          yPosition = margin;
        }

        // Question number and text
        doc.setFont('helvetica', 'bold');
        const questionHeader = `${index + 1}. ${question.marks ? `[${question.marks} marks] ` : ''}`;
        yPosition = addText(questionHeader, margin, yPosition, pageWidth - 2 * margin, 12);
        
        doc.setFont('helvetica', 'normal');
        yPosition = addText(question.questionText, margin, yPosition, pageWidth - 2 * margin);
        yPosition += 5;

        // Options (for quiz type)
        if (type === 'quiz' && question.options.length > 0) {
          question.options.forEach((option, optIndex) => {
            if (option.trim()) {
              const optionText = `${String.fromCharCode(97 + optIndex)}) ${option}`;
              yPosition = addText(optionText, margin + 10, yPosition, pageWidth - 2 * margin - 10);
              yPosition += 2;
            }
          });
        } else {
          // Add answer space for non-quiz questions
          yPosition += 20; // Space for answer
          doc.setDrawColor(200, 200, 200);
          for (let i = 0; i < 3; i++) {
            doc.line(margin, yPosition + (i * 8), pageWidth - margin, yPosition + (i * 8));
          }
          yPosition += 25;
        }
        
        yPosition += 10; // Space between questions
      });

      // Save the PDF
      const fileName = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'assessment'}_question_paper.pdf`;
      doc.save(fileName);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Generate DOCX content
  const generateDOCX = async () => {
    setIsGenerating(true);
    try {
      // Import docx library dynamically
      const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } = await import('docx');
      const { saveAs } = await import('file-saver');

      const children: any[] = [];

      // Title
      children.push(
        new Paragraph({
          children: [new TextRun({ text: title || 'Assessment', bold: true, size: 32 })],
          heading: HeadingLevel.TITLE,
          alignment: AlignmentType.CENTER,
          spacing: { after: 300 }
        })
      );

      // Assessment details
      if (duration || totalMarks) {
        const details: string[] = [];
        if (duration) details.push(`Duration: ${duration} minutes`);
        if (totalMarks) details.push(`Total Marks: ${totalMarks}`);
        
        children.push(
          new Paragraph({
            children: [new TextRun({ text: details.join(' | '), size: 22 })],
            spacing: { after: 200 }
          })
        );
      }

      // Instructions
      if (instructions) {
        children.push(
          new Paragraph({
            children: [new TextRun({ text: 'Instructions:', bold: true, size: 24 })],
            spacing: { after: 100 }
          })
        );
        children.push(
          new Paragraph({
            children: [new TextRun({ text: instructions, size: 22 })],
            spacing: { after: 300 }
          })
        );
      }

      // Description
      if (description) {
        children.push(
          new Paragraph({
            children: [new TextRun({ text: description, size: 22 })],
            spacing: { after: 300 }
          })
        );
      }

      // Questions
      questions.forEach((question, index) => {
        // Question header
        const questionHeader = `${index + 1}. ${question.marks ? `[${question.marks} marks] ` : ''}`;
        children.push(
          new Paragraph({
            children: [
              new TextRun({ text: questionHeader, bold: true, size: 24 }),
              new TextRun({ text: question.questionText, size: 22 })
            ],
            spacing: { after: 150 }
          })
        );

        // Options for quiz
        if (type === 'quiz' && question.options.length > 0) {
          question.options.forEach((option, optIndex) => {
            if (option.trim()) {
              children.push(
                new Paragraph({
                  children: [new TextRun({ 
                    text: `${String.fromCharCode(97 + optIndex)}) ${option}`, 
                    size: 22 
                  })],
                  indent: { left: 400 },
                  spacing: { after: 100 }
                })
              );
            }
          });
        } else {
          // Add answer space
          children.push(
            new Paragraph({
              children: [new TextRun({ text: '_'.repeat(80), size: 22 })],
              spacing: { after: 100 }
            })
          );
          children.push(
            new Paragraph({
              children: [new TextRun({ text: '_'.repeat(80), size: 22 })],
              spacing: { after: 100 }
            })
          );
          children.push(
            new Paragraph({
              children: [new TextRun({ text: '_'.repeat(80), size: 22 })],
              spacing: { after: 200 }
            })
          );
        }

        children.push(
          new Paragraph({
            children: [new TextRun({ text: '', size: 22 })],
            spacing: { after: 200 }
          })
        );
      });

      const doc = new Document({
        sections: [{
          properties: {},
          children: children
        }]
      });

      const blob = await Packer.toBlob(doc);
      const fileName = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'assessment'}_question_paper.docx`;
      saveAs(blob, fileName);
    } catch (error) {
      console.error('Error generating DOCX:', error);
      alert('Error generating DOCX. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmit = async () => {
    const assessment = {
      moduleId,
      type,
      title,
      duration,
      description,
      totalMarks,
      instructions,
      ...(type === "quiz" && { questions }),
    };

    console.log("Submitting Assessment:", assessment);

    // await fetch("/api/educator/assessment", { method: "POST", body: JSON.stringify(assessment) });

    router.push(`/educator/module/${moduleId}`);
  };

  const calculateTotalMarks = () => {
    return questions.reduce((total, q) => total + (q.marks || 0), 0);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Create Assessment
          </h1>
          <p className="text-gray-600">
            Design your assessment and download as PDF or DOCX format
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          {/* Assessment Type */}
          <div className="mb-6">
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Assessment Type
            </label>
            <select
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              {assessmentTypes.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Title
              </label>
              <Input
                placeholder="Assessment Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="text-gray-900"
              />
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Duration (minutes)
              </label>
              <Input
                placeholder="Duration"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="text-gray-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Total Marks
              </label>
              <Input
                placeholder="Total Marks"
                value={totalMarks}
                onChange={(e) => setTotalMarks(e.target.value)}
                className="text-gray-900"
              />
              {type === 'quiz' && (
                <p className="text-xs text-gray-500 mt-1">
                  Calculated from questions: {calculateTotalMarks()} marks
                </p>
              )}
            </div>
          </div>

          <div className="mb-6">
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Instructions
            </label>
            <Textarea
              placeholder="Assessment instructions for students..."
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              className="text-gray-900"
              rows={3}
            />
          </div>

          <div className="mb-6">
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Description
            </label>
            <Textarea
              placeholder="Additional description (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="text-gray-900"
              rows={2}
            />
          </div>

          {/* Questions Section */}
          {type === "quiz" && (
            <div className="mt-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">
                  Quiz Questions
                </h2>
                <div className="text-sm text-gray-600">
                  Total: {questions.length} question{questions.length !== 1 ? 's' : ''}
                </div>
              </div>

              <div className="space-y-6">
                {questions.map((q, qIdx) => (
                  <div
                    key={qIdx}
                    className="border border-gray-200 p-6 rounded-lg bg-gray-50"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-medium text-gray-900">
                        Question {qIdx + 1}
                      </h3>
                      {questions.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeQuestion(qIdx)}
                          className="flex items-center gap-1 text-red-600 hover:text-red-700 text-sm"
                        >
                          <FiTrash2 size={16} />
                          Remove
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                      <div className="md:col-span-3">
                        <Textarea
                          placeholder="Enter your question here..."
                          value={q.questionText}
                          onChange={(e) =>
                            handleQuestionChange(qIdx, "questionText", e.target.value)
                          }
                          className="text-gray-900"
                          rows={2}
                        />
                      </div>
                      <div>
                        <label className="block mb-2 text-sm font-medium text-gray-700">
                          Marks
                        </label>
                        <Input
                          type="number"
                          min="1"
                          placeholder="Marks"
                          value={q.marks || ''}
                          onChange={(e) =>
                            handleQuestionChange(qIdx, "marks", parseInt(e.target.value) || 1)
                          }
                          className="text-gray-900"
                        />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="block text-sm font-medium text-gray-700">
                        Answer Options
                      </label>
                      {q.options.map((opt, optIdx) => (
                        <div key={optIdx} className="flex items-center gap-3">
                          <div className="flex items-center">
                            <input
                              type="radio"
                              name={`correct-${qIdx}`}
                              checked={q.correctAnswerIndex === optIdx}
                              onChange={() =>
                                handleQuestionChange(qIdx, "correctAnswerIndex", optIdx)
                              }
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                            />
                            <label className="ml-2 text-sm text-gray-700">
                              {String.fromCharCode(97 + optIdx).toUpperCase()}
                            </label>
                          </div>
                          <Input
                            placeholder={`Option ${optIdx + 1}`}
                            value={opt}
                            onChange={(e) =>
                              handleOptionChange(qIdx, optIdx, e.target.value)
                            }
                            className="text-gray-900 flex-1"
                          />
                          {q.options.length > 2 && (
                            <button
                              type="button"
                              onClick={() => removeOption(qIdx, optIdx)}
                              className="text-red-600 hover:text-red-700 p-1"
                              title="Remove Option"
                            >
                              <FiTrash2 size={16} />
                            </button>
                          )}
                        </div>
                      ))}
                      
                      {q.options.length < 6 && (
                        <button
                          type="button"
                          onClick={() => addOption(qIdx)}
                          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                        >
                          + Add Option
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6">
                <button
                  type="button"
                  onClick={addQuestion}
                  className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
                >
                  + Add Question
                </button>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between mt-8 pt-6 border-t border-gray-200">
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={generatePDF}
                disabled={isGenerating || !title}
                variant="outline"
                className="flex items-center gap-2"
              >
                <FiFileText size={16} />
                {isGenerating ? 'Generating...' : 'Download PDF'}
              </Button>
              <Button
                onClick={generateDOCX}
                disabled={isGenerating || !title}
                variant="outline"
                className="flex items-center gap-2"
              >
                <FiFile size={16} />
                {isGenerating ? 'Generating...' : 'Download DOCX'}
              </Button>
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
              <Button onClick={handleSubmit}>
                Create Assessment
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}