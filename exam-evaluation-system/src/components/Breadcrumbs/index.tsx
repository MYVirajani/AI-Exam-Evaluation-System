import React from 'react';
import Link from 'next/link';
import { ChevronRightIcon, HomeIcon } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
  current?: boolean;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items, className = '' }) => {
  return (
    <nav 
      className={`flex ${className}`} 
      aria-label="Breadcrumb"
    >
      <ol className="inline-flex items-center space-x-1 md:space-x-2 rtl:space-x-reverse">
        {items.map((item, index) => (
          <li key={index} className="inline-flex items-center">
            {index > 0 && (
              <ChevronRightIcon 
                className="rtl:rotate-180 w-3 h-3 text-gray-400 mx-1" 
                aria-hidden="true" 
              />
            )}
            
            {item.current ? (
              <span 
                className="ms-1 text-sm font-medium text-gray-500 md:ms-2 dark:text-gray-400"
                aria-current="page"
              >
                {index === 0 && (
                  <HomeIcon className="w-3 h-3 me-2.5 inline" />
                )}
                {item.label}
              </span>
            ) : item.href ? (
              <Link
                href={item.href}
                className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-purple-600 transition-colors duration-200"
              >
                {index === 0 && (
                  <HomeIcon className="w-3 h-3 me-2.5" />
                )}
                {item.label}
              </Link>
            ) : (
              <span className="inline-flex items-center text-sm font-medium text-blue-600">
                {index === 0 && (
                  <HomeIcon className="w-3 h-3 me-2.5" />
                )}
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;