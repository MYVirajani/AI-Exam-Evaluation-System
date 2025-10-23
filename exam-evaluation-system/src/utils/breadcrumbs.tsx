// utils/breadcrumbs.ts
import { BreadcrumbItem } from '@/components/Breadcrumbs';

export interface BreadcrumbConfig {
  [key: string]: {
    label: string;
    href?: string;
    dynamic?: boolean;
  };
}

// Define breadcrumb configuration for different routes
export const breadcrumbConfig: BreadcrumbConfig = {
  '/educator/dashboard': {
    label: 'Dashboard',
    href: '/educator/dashboard'
  },
  '/educator/module': {
    label: 'Modules',
    href: '/educator/modules'
  },
  '/educator/module/[moduleId]': {
    label: 'Module Details',
    dynamic: true
  },
  '/educator/module/[moduleId]/assessment/[assessmentId]': {
    label: 'Assessment Details',
    dynamic: true
  },
  '/educator/assessment': {
    label: 'Assessments',
    href: '/educator/assessments'
  },
  '/educator/assessment/[assessmentId]': {
    label: 'Assessment Details',
    dynamic: true
  },
  '/educator/profile': {
    label: 'Profile',
    href: '/educator/profile'
  },
  '/educator/settings': {
    label: 'Settings',
    href: '/educator/settings'
  },
  '/student/dashboard': {
    label: 'Dashboard',
    href: '/student/dashboard'
  },
  '/student/module': {
    label: 'Modules',
    href: '/student/modules'
  },
  '/student/module/[moduleId]': {
    label: 'Module Details',
    dynamic: true
  },
  '/student/assessments': {
    label: 'Assessments',
    href: '/student/assessments'
  },
  '/student/quiz': {
    label: 'Quiz',
    href: '/student/quiz'
  },
  '/student/profile': {
    label: 'Profile',
    href: '/student/profile'
  }
};

export const generateBreadcrumbs = (
  pathname: string,
  dynamicValues?: { [key: string]: string }
): BreadcrumbItem[] => {
  const pathSegments = pathname.split('/').filter(segment => segment);
  const breadcrumbs: BreadcrumbItem[] = [];
  
  // Always start with Dashboard for educator/student routes
  if (pathSegments[0] === 'educator') {
    breadcrumbs.push({
      label: 'Dashboard',
      href: '/educator/dashboard'
    });
  } else if (pathSegments[0] === 'student') {
    breadcrumbs.push({
      label: 'Dashboard',
      href: '/student/dashboard'
    });
  }
  
  // Build breadcrumbs based on path segments
  let currentPath = '';
  
  for (let i = 0; i < pathSegments.length; i++) {
    currentPath += `/${pathSegments[i]}`;
    
    // Skip the first segment (educator) as we already added Dashboard
    if (i === 0) continue;
    
    const config = breadcrumbConfig[currentPath];
    
    if (config) {
      const isLast = i === pathSegments.length - 1;
      
      breadcrumbs.push({
        label: config.dynamic && dynamicValues?.[pathSegments[i]] 
          ? dynamicValues[pathSegments[i]] 
          : config.label,
        href: isLast ? undefined : config.href,
        current: isLast
      });
    } else {
      // Handle dynamic routes
      const isDynamicSegment = pathSegments[i].startsWith('[') && pathSegments[i].endsWith(']');
      if (isDynamicSegment) {
        const paramName = pathSegments[i].slice(1, -1); // Remove [ and ]
        const dynamicPath = currentPath.replace(`/${pathSegments[i]}`, '/[' + paramName + ']');
        const dynamicConfig = breadcrumbConfig[dynamicPath];
        
        if (dynamicConfig) {
          const isLast = i === pathSegments.length - 1;
          const actualValue = dynamicValues?.[paramName] || pathSegments[i];
          
          breadcrumbs.push({
            label: actualValue,
            href: isLast ? undefined : dynamicConfig.href?.replace('[' + paramName + ']', pathSegments[i]),
            current: isLast
          });
        }
      }
    }
  }
  
  return breadcrumbs;
};

// Helper function specifically for module pages
export const getModuleBreadcrumbs = (
  moduleCode?: string,
  moduleId?: string,
  userType: 'educator' | 'student' = 'educator'
): BreadcrumbItem[] => {
  const dashboardHref = userType === 'educator' ? '/educator/dashboard' : '/student/dashboard';
  
  return [
    {
      label: 'Dashboard',
      href: dashboardHref
    },
    {
      label: moduleCode || 'Module',
      current: true
    }
  ];
};

// Helper function specifically for assessment pages
export const getAssessmentBreadcrumbs = (
  moduleCode?: string,
  moduleId?: string,
  assessmentTitle?: string,
  assessmentId?: string,
  userType: 'educator' | 'student' = 'educator'
): BreadcrumbItem[] => {
  const dashboardHref = userType === 'educator' ? '/educator/dashboard' : '/student/dashboard';
  const moduleHref = userType === 'educator' 
    ? `/educator/module/${moduleId}` 
    : `/student/module/${moduleId}`;
  
  return [
    {
      label: 'Dashboard',
      href: dashboardHref
    },
    {
      label: moduleCode || 'Module',
      href: moduleId ? moduleHref : undefined
    },
    {
      label: assessmentTitle || 'Assessment',
      current: true
    }
  ];
};