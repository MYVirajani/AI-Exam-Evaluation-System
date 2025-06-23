export interface EventItem {
  title: string;
  courseCode: string;
  courseName: string;
  uploads?: string;
  dueOrScheduled: string;
  date: string;
  time: string;
  type: 'assignment' | 'quiz' | 'exam';
}

export interface ModuleItem {
  courseCode: string;
  courseName: string;
  enrolled: string;
  total: string;
}