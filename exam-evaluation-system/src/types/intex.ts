export interface EventItem {
  title: string;
  moduleCode: string;
  moduleName: string;
  uploads?: string;
  dueOrScheduled: string;
  date: string;
  time: string;
  type: 'assignment' | 'quiz' | 'exam';
}

export interface ModuleItem {
  moduleCode: string;
  moduleName: string;
  enrolled: string;
  total: string;
}