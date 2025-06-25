export interface CardProps {
  title: string
  courseCode: string
  uploads: string
  dateType: 'due' | 'scheduled'
  date: string
}