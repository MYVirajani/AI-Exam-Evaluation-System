// utils/countdownUtils.ts

export const getCountdownText = (deadline: string, closeAt?: string | null): string => {
  const now = Date.now();
  const targetTime = closeAt ? new Date(closeAt).getTime() : new Date(deadline).getTime();
  const diff = targetTime - now;

  if (diff <= 0) {
    return "Expired";
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  const parts: string[] = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0 || parts.length > 0) parts.push(`${hours}h`);
  if (minutes > 0 || parts.length > 0) parts.push(`${minutes}m`);
  parts.push(`${seconds}s`);

  return parts.join(" ");
};

export const updateAllCountdowns = (
  assessments: Array<{ assessment_id: string; deadline: string; close_at?: string | null }>
): Record<string, string> => {
  const newCountdowns: Record<string, string> = {};

  assessments.forEach(({ assessment_id, deadline, close_at }) => {
    newCountdowns[assessment_id] = getCountdownText(deadline, close_at);
  });

  return newCountdowns;
};