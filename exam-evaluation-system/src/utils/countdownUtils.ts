// utils/countdownUtils.ts

export type AssessmentStatus = 
  | 'not_started' 
  | 'in_progress' 
  | 'closed' 
  | 'expired' 
  | 'closing_soon';

export interface CountdownResult {
  text: string;
  status: AssessmentStatus;
}

export const getCountdownDetails = (
  deadline: string,
  open_at?: string | null,
  close_at?: string | null
): CountdownResult => {
  const now = Date.now();
  const openTime = open_at ? new Date(open_at).getTime() : null;
  const closeTime = close_at ? new Date(close_at).getTime() : new Date(deadline).getTime();
  
  // Assessment hasn't opened yet
  if (openTime && now < openTime) {
    const diff = openTime - now;
    return {
      text: formatTimeDifference(diff, `Opens in`),
      status: 'not_started'
    };
  }

  // Assessment is open but not yet closed
  if (now < closeTime) {
    const diff = closeTime - now;
    const hoursRemaining = diff / (1000 * 60 * 60);
    
    // If less than 24 hours remaining, show more precise countdown
    if (hoursRemaining < 24) {
      return {
        text: formatTimeDifference(diff, `Closes in`),
        status: hoursRemaining < 2 ? 'closing_soon' : 'in_progress'
      };
    }
    return {
      text: formatTimeDifference(diff, `Closes in`),
      status: 'in_progress'
    };
  }

  // Assessment is closed
  return {
    text: 'Closed',
    status: 'closed'
  };
};

const formatTimeDifference = (diff: number, prefix: string): string => {
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  if (days > 0) {
    return `${prefix} ${days}d ${hours}h`;
  }
  if (hours > 0) {
    return `${prefix} ${hours}h ${minutes}m`;
  }
  if (minutes > 0) {
    return `${prefix} ${minutes}m ${seconds}s`;
  }
  return `${prefix} ${seconds}s`;
};

export const updateAllCountdowns = (
  assessments: Array<{
    assessment_id: string;
    deadline: string;
    open_at?: string | null;
    close_at?: string | null;
  }>
): Record<string, CountdownResult> => {
  const newCountdowns: Record<string, CountdownResult> = {};

  assessments.forEach(({ assessment_id, deadline, open_at, close_at }) => {
    newCountdowns[assessment_id] = getCountdownDetails(deadline, open_at, close_at);
  });

  return newCountdowns;
};