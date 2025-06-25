import React from 'react'
import { ModuleCardProps } from './types'

const ModuleCard: React.FC<ModuleCardProps> = ({ 
  moduleCode, 
  enrolled 
}) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
      <div className="flex justify-between items-center">
        <h3 className="font-medium text-gray-900">{moduleCode}</h3>
        <span className="text-sm text-gray-500">Total enrolled - {enrolled}</span>
      </div>
    </div>
  )
}

export default ModuleCard