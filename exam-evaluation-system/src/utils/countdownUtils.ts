// @/utils/countdownUtils.ts

export type AssessmentStatus =
  | "not_started"
  | "in_progress"
  | "closing_soon"
  | "expired";

export interface CountdownResult {
  text: string;
  status: AssessmentStatus;
  label: string;
}

/**
 * Formats time difference into human-readable countdown text
 * - If >= 1 day: show "Xd Yh"
 * - If >= 1 hour but < 1 day: show "Xh Ym"
 * - If < 1 hour: show "Xm Ys"
 */
function formatCountdown(timeDiff: number): string {
  if (timeDiff <= 0) return "00m 00s";

  const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);

  if (days > 0) {
    return `${days}d ${hours}h`;
  } else if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else {
    return `${minutes}m ${seconds}s`;
  }
}

/**
 * Calculates the countdown and status for an assessment.
 * Priority logic:
 * 1. If open_at exists and hasn't passed → countdown to open_at (not_started)
 * 2. If open_at passed and close_at exists and hasn't passed → countdown to close_at (in_progress/closing_soon)
 * 3. If close_at passed → expired
 * 4. If both open_at and close_at are null, use deadline
 * 5. If all times have passed → expired
 */
export function calculateCountdown(
  openAt?: string,
  closeAt?: string,
  deadline?: string
): CountdownResult {
  const now = Date.now();
  const openTime = openAt ? new Date(openAt).getTime() : null;
  const closeTime = closeAt ? new Date(closeAt).getTime() : null;
  const deadlineTime = deadline ? new Date(deadline).getTime() : null;

  // If open_at exists and hasn't passed
  if (openTime && now < openTime) {
    const timeDiff = openTime - now;
    return {
      text: formatCountdown(timeDiff),
      status: "not_started",
      label: "Opens in"
    };
  }

  // If open_at has passed (or doesn't exist) and close_at exists and hasn't passed
  if (closeTime && now < closeTime) {
    const timeDiff = closeTime - now;
    const isClosingSoon = timeDiff <= 10 * 60 * 1000; // 10 minutes warning
    
    return {
      text: formatCountdown(timeDiff),
      status: isClosingSoon ? "closing_soon" : "in_progress",
      label: "Closes in"
    };
  }

  // If close_at has passed, check if it was a valid close time
  if (closeTime && now >= closeTime) {
    return {
      text: "Expired",
      status: "expired",
      label: "Status"
    };
  }

  // If both open_at and close_at are null, use deadline
  if (!openTime && !closeTime && deadlineTime) {
    if (now < deadlineTime) {
      const timeDiff = deadlineTime - now;
      return {
        text: formatCountdown(timeDiff),
        status: "in_progress",
        label: "Due in"
      };
    } else {
      return {
        text: "Expired",
        status: "expired",
        label: "Status"
      };
    }
  }

  // If deadline has passed or no valid times provided
  return {
    text: "Expired",
    status: "expired",
    label: "Status"
  };
}