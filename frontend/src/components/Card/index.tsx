import React from 'react'
import { CardProps } from './types'

const Card: React.FC<CardProps> = ({ 
  title, 
  courseCode, 
  uploads, 
  dateType, 
  date 
}) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-medium text-gray-900">{title}</h3>
          <p className="text-sm text-gray-500">{courseCode}</p>
        </div>
        <span className="text-sm text-gray-500">{uploads}</span>
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-100">
        <p className="text-sm text-gray-500 capitalize">{dateType} on:</p>
        <p className="font-medium text-gray-900">{date}</p>
      </div>
    </div>
  )
}

export default Card