import React from 'react';

interface TabButtonProps {
  tabId: string;
  label: string;
  isActive: boolean;
  onClick: (tabId: 'results' | 'graded') => void;
}

const TabButton: React.FC<TabButtonProps> = ({ tabId, label, isActive, onClick }) => (
  <button
    onClick={() => onClick(tabId as 'results' | 'graded')}
    className={`flex-1 px-6 py-3 font-semibold text-sm uppercase tracking-wider transition-all duration-200 text-center ${
      isActive
        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white border-b-2 border-blue-600'
        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
    } ${tabId === 'results' ? 'rounded-tl-lg' : 'rounded-tr-lg'}`}
  >
    {label}
  </button>
);

export default TabButton;