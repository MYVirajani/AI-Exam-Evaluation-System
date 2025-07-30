export interface Result {
  id: string;
  student_index: string;
  module_code: string;
  exam_year: number;
  exam_month: string;
  total_marks: number;
  total_possible: number;
  graded_at: string;
}

export interface GradedAnswer {
  id: string;
  student_index: string;
  module_code: string;
  exam_year: number;
  exam_month: string;
  full_question_id: string;
  mark: number;
  max_marks: number;
  reason: string;
  graded_at: string;
}
