'use client'
import { useState, useRef, useEffect } from 'react'
import { ChevronDownIcon } from '../Icons'

interface DropdownProps {
  options: string[]
  selectedOption: string
  onSelect: (option: string) => void
  className?: string
  direction?: 'top' | 'bottom' // Add direction prop
}

export default function Dropdown({
  options,
  selectedOption,
  onSelect,
  className = '',
  direction = 'bottom' // Default to bottom
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Calculate position classes based on direction
  const positionClasses = direction === 'top' 
    ? 'bottom-full mb-1 origin-bottom-right' 
    : 'top-full mt-1 origin-top-right'

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        type="button"
        className="flex items-center justify-between w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
        onClick={() => setIsOpen(!isOpen)}
      >
        {selectedOption}
        <ChevronDownIcon className={`w-5 h-5 ml-2 transition-transform ${isOpen ? 'transform rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className={`absolute right-0 z-10 w-full ${positionClasses} bg-white border border-gray-200 rounded-md shadow-lg`}>
          <div className="py-1">
            {options.map((option) => (
              <button
                key={option}
                className={`block w-full px-4 py-2 text-sm text-left ${selectedOption === option ? 'bg-blue-100 text-blue-800' : 'text-gray-700 hover:bg-gray-100'}`}
                onClick={() => {
                  onSelect(option)
                  setIsOpen(false)
                }}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}