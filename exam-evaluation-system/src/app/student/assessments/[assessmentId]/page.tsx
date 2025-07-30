"use client";

import { useSearchParams, useParams } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { FileUploadSection } from "@/components/Upload/FileUploadSection";
import Button from "@/components/Button";
import toast from "react-hot-toast";
import { FileIcon } from "@/components/Icons";

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

  const moduleId = searchParams.get("moduleId") ?? "";
  const assessmentId = params.assessmentId as string;
  const studentId = searchParams.get("studentId") ?? "";

  const [assessment, setAssessment] = useState<AssessmentResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [answerScriptFile, setAnswerScriptFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!moduleId || !assessmentId) {
      setError("Missing moduleId or assessmentId");
      setLoading(false);
      return;
    }

    const fetchAssessment = async () => {
      setLoading(true);
      setError(null);
      try {
        const queryParams = new URLSearchParams({ studentId, moduleId });
        const url = `/api/student/enrollments/${moduleId}/assessment/${assessmentId}?${queryParams.toString()}`;

        const res = await fetch(url);
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

    fetchAssessment();
  }, [moduleId, assessmentId, studentId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith(".pdf") && !file.name.endsWith(".docx")) {
      toast.error("Invalid file type. Only PDF and DOCX allowed.");
      return;
    }

    setAnswerScriptFile(file);
    e.target.value = ""; // reset input
  };

  const handleUpload = async () => {
    if (!answerScriptFile) return;

    const toastId = toast.loading("Uploading answer script...");
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", answerScriptFile);

      const uploadUrl = `/api/student/enrollments/${moduleId}/assessment/${assessmentId}/submission/${studentId}`;

      const res = await fetch(uploadUrl, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Upload failed");
      }

      toast.success("Answer script uploaded!", { id: toastId });

      // Refresh assessment data
      const queryParams = new URLSearchParams({ studentId, moduleId });
      const refreshRes = await fetch(
        `/api/student/enrollments/${moduleId}/assessment/${assessmentId}?${queryParams.toString()}`
      );
      const refreshedData: AssessmentResponse = await refreshRes.json();
      setAssessment(refreshedData);
      setAnswerScriptFile(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed", {
        id: toastId,
      });
    } finally {
      setIsUploading(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  if (loading) return <div className="p-6">Loading assessment...</div>;
  if (error) return <div className="p-6 text-red-600">Error: {error}</div>;
  if (!assessment)
    return <div className="p-6">No assessment data available.</div>;

  return (
    <main className="p-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">
        {assessment.module_code} - {assessment.module_name}
      </h1>

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
          Deadline:{" "}
          {new Date(assessment.assessment_data.deadline).toLocaleString()}
        </p>

        {/* Question Paper */}
        {assessment.question_paper && (
          <p className="mb-2">
            📘{" "}
            <a
              href={assessment.question_paper.file_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline"
            >
              View Question Paper
            </a>{" "}
            (Uploaded:{" "}
            {new Date(
              assessment.question_paper.created_on
            ).toLocaleDateString()}
            )
          </p>
        )}

        {/* Submission */}
        {assessment.submission ? (
          <p className="mb-2">
            📝{" "}
            <a
              href={assessment.submission.file_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-600 underline"
            >
              View Your Submission
            </a>{" "}
            (Submitted:{" "}
            {new Date(assessment.submission.submission_time).toLocaleString()})
          </p>
        ) : (
          <>
            <FileUploadSection
              title="Answer Script"
              acceptedTypes="PDF, DOCX"
              maxSize="5MB"
              icon={<FileIcon />}
              uploadedFile={answerScriptFile}
              onTriggerUpload={triggerFileInput}
            />
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".pdf,.docx"
              className="hidden"
            />
            <div className="mt-4 flex justify-end">
              <Button
                onClick={handleUpload}
                disabled={!answerScriptFile || isUploading}
              >
                {isUploading ? "Uploading..." : "Upload Answer Script"}
              </Button>
            </div>
          </>
        )}

        {/* Grading Info */}
        {assessment.graded ? (
          <div className="mt-4 p-3 border rounded bg-gray-100">
            <h3 className="font-semibold mb-1">Grading</h3>
            <p>
              Marks Awarded: {assessment.graded.marks_awarded} /{" "}
              {assessment.graded.total_marks}
            </p>
            <p>Feedback: {assessment.graded.feedback || "No feedback"}</p>
            <p>
              Graded on:{" "}
              {new Date(assessment.graded.grading_time).toLocaleString()}
            </p>
            <p>Auto Graded: {assessment.graded.auto_graded ? "Yes" : "No"}</p>
          </div>
        ) : (
          <p className="mt-4 text-gray-600">Not graded yet.</p>
        )}
      </section>
    </main>
  );
}
