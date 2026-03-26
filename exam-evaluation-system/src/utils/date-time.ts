// utils/date-time.ts
export function formatDateTime(dateTimeStr: string): string {
  const date = new Date(dateTimeStr);
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  };
  return date.toLocaleString(undefined, options); // Uses local timezone
}


export function formatDuration(minutes: number): string {
  const days = Math.floor(minutes / (24 * 60));
  const hours = Math.floor((minutes % (24 * 60)) / 60);
  const mins = minutes % 60;

  const parts: string[] = [];
  if (days > 0) parts.push(`${days} day${days > 1 ? 's' : ''}`);
  if (hours > 0) parts.push(`${hours} hr${hours > 1 ? 's' : ''}`);
  if (mins > 0) parts.push(`${mins} min${mins > 1 ? 's' : ''}`);

  return parts.length > 0 ? parts.join(' ') : '0 minutes';
}

export function formatOpenCloseTime(
  openAt?: string,
  closeAt?: string,
  deadline?: string
): string {
  const dateOpts: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "2-digit",
  };
  const timeOpts: Intl.DateTimeFormatOptions = {
    hour: "2-digit",
    minute: "2-digit",
  };

  const hasOpen = !!openAt;
  const hasClose = !!closeAt;
  const hasDeadline = !!deadline;

  const now = new Date();
  const openD = hasOpen ? new Date(openAt!) : null;
  const closeD = hasClose ? new Date(closeAt!) : null;
  const deadlineD = hasDeadline ? new Date(deadline!) : null;

  const sameDay =
    hasOpen && hasClose && openD!.toDateString() === closeD!.toDateString();

  const parts: string[] = [];

  if (hasOpen && hasClose) {
    const isOpenPast = openD! <= now;
    const isClosePast = closeD! <= now;

    const openPrefix = isOpenPast ? "Opened at" : "Opens at";
    const closePrefix = isClosePast ? "closed at" : "closes at";

    if (sameDay) {
      parts.push(
        `${openPrefix} ${openD!.toLocaleTimeString([], timeOpts)} and ${closePrefix} ${closeD!.toLocaleTimeString([], timeOpts)} on ${openD!.toLocaleDateString([], dateOpts)}`
      );
    } else {
      parts.push(
        `${openPrefix} ${openD!.toLocaleTimeString([], timeOpts)} on ${openD!.toLocaleDateString([], dateOpts)} and ${closePrefix} ${closeD!.toLocaleTimeString([], timeOpts)} on ${closeD!.toLocaleDateString([], dateOpts)}`
      );
    }
  } else if (hasOpen) {
    const isOpenPast = openD! <= now;
    const prefix = isOpenPast ? "Opened at" : "Opens at";
    parts.push(
      `${prefix} ${openD!.toLocaleTimeString([], timeOpts)} on ${openD!.toLocaleDateString([], dateOpts)}`
    );
  } else if (hasClose) {
    const isClosePast = closeD! <= now;
    const prefix = isClosePast ? "Closed at" : "Closes at";
    parts.push(
      `${prefix} ${closeD!.toLocaleTimeString([], timeOpts)} on ${closeD!.toLocaleDateString([], dateOpts)}`
    );
  }

  // Show deadline only if both openAt and closeAt are missing
  if (hasDeadline && !hasOpen && !hasClose) {
    parts.push(`Deadline: ${deadlineD!.toLocaleDateString([], dateOpts)}`);
  }

  return parts.length > 0 ? parts.join(" · ") + "." : "";
}
