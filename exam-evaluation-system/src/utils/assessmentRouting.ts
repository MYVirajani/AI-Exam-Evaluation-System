// src/utils/assessmentRouting.ts

/**
 * Get the correct assessment page route based on assessment type
 * @param assessmentType - The type of assessment (bubbleSheet, endExam, midExam, etc.)
 * @param role - User role (student or educator)
 * @param moduleId - Module ID
 * @param assessmentId - Assessment ID
 * @param additionalParams - Additional query parameters
 * @returns The correct route path
 */
export function getAssessmentRoute(
  assessmentType: string,
  role: 'student' | 'educator',
  moduleId: string,
  assessmentId: string,
  additionalParams?: Record<string, string>
): string {
  const baseParams = new URLSearchParams({
    moduleId,
    ...additionalParams,
  });

  if (assessmentType === 'bubbleSheet') {
    if (role === 'student') {
      return `/student/assessments/${assessmentId}/bubblesheet?${baseParams.toString()}`;
    } else {
      return `/educator/module/${moduleId}/assessment/${assessmentId}/bubblesheet?${baseParams.toString()}`;
    }
  }

  // Default routes for other assessment types
  if (role === 'student') {
    return `/student/assessments/${assessmentId}?${baseParams.toString()}`;
  } else {
    return `/educator/module/${moduleId}/assessment/${assessmentId}?${baseParams.toString()}`;
  }
}

/**
 * Get the results dashboard route based on assessment type
 * @param assessmentType - The type of assessment
 * @param assessmentId - Assessment ID
 * @param title - Assessment title
 * @param moduleName - Module name
 * @returns The correct results dashboard route
 */
export function getResultsDashboardRoute(
  assessmentType: string,
  assessmentId: string,
  title: string,
  moduleName: string
): string {
  const params = new URLSearchParams({
    assessmentId,
    title,
    module: moduleName,
  });

  if (assessmentType === 'bubbleSheet') {
    return `/educator/dashboard/bubblesheet-results?${params.toString()}`;
  }

  return `/educator/dashboard/results-dashboard?${params.toString()}`;
}

export function getStudentAssessmentRoute(
  assessmentType: string,
  assessmentId: string,
  studentId: string,
  moduleId: string
): string {
  const baseParams = `studentId=${studentId}&moduleId=${moduleId}`;

  if (assessmentType === 'bubbleSheet') {
    return `/student/assessments/${assessmentId}/bubblesheet?${baseParams}`;
  }

  // Default for all other types (endExam, midExam, assignment, quiz)
  return `/student/assessments/${assessmentId}?${baseParams}`;
}

export function getEducatorAssessmentRoute(
  assessmentType: string,
  moduleId: string,
  assessmentId: string,
  educatorId: string
): string {
  const baseParams = `educatorId=${educatorId}`;

  if (assessmentType === 'bubbleSheet') {
    return `/educator/module/${moduleId}/assessment/${assessmentId}/bubblesheet?${baseParams}`;
  }

  // Default for all other types
  return `/educator/module/${moduleId}/assessment/${assessmentId}?${baseParams}`;
}