import React from 'react'
import { useRouter } from 'next/navigation'
import { StatsCardProps } from './types'

const StatsCard: React.FC<StatsCardProps> = ({ 
  moduleCode, 
  enrolled,
  moduleId // Add this new prop
}) => {
  const router = useRouter()

  const handleClick = () => {
    router.push(`/educator/evaluate?moduleId=${moduleId}`)
  }

  return (
    <div 
      className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
      onClick={handleClick}
    >
      <h3 className="font-medium text-gray-900">{moduleCode}</h3>
      <p className="text-sm text-gray-500 mt-2">Total enrolled - {enrolled}</p>
    </div>
  )
}

export default StatsCard