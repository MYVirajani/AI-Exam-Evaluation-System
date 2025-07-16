export interface CardProps {
  title: string
  moduleCode: string
  uploads: string
  dateType: 'due' | 'scheduled'
  date: string
}