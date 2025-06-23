import React from 'react'
import { useRouter } from 'next/navigation'
import { StatsCardProps } from './types'

const StatsCard: React.FC<StatsCardProps> = ({ 
  courseCode, 
  enrolled,
  courseId // Add this new prop
}) => {
  const router = useRouter()

  const handleClick = () => {
    router.push(`/pages/educator/evaluate?courseId=${courseId}`)
    // or router.push('/upload') if you don't need courseId
  }

  return (
    <div 
      className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
      onClick={handleClick}
    >
      <h3 className="font-medium text-gray-900">{courseCode}</h3>
      <p className="text-sm text-gray-500 mt-2">Total enrolled - {enrolled}</p>
    </div>
  )
}

export default StatsCard