// lib/date-time.ts
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

// open close time formatting
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

  const openD = hasOpen ? new Date(openAt!) : null;
  const closeD = hasClose ? new Date(closeAt!) : null;
  const deadlineD = hasDeadline ? new Date(deadline!) : null;

  const sameDay =
    hasOpen && hasClose && openD!.toDateString() === closeD!.toDateString();

  const parts: string[] = [];

  if (hasOpen && hasClose) {
    if (sameDay) {
      parts.push(
        `Opens at ${openD!.toLocaleTimeString([], timeOpts)} and closes at ${closeD!.toLocaleTimeString([], timeOpts)} on ${openD!.toLocaleDateString([], dateOpts)}`
      );
    } else {
      parts.push(
        `Opens at ${openD!.toLocaleTimeString([], timeOpts)} on ${openD!.toLocaleDateString([], dateOpts)} and closes at ${closeD!.toLocaleTimeString([], timeOpts)} on ${closeD!.toLocaleDateString([], dateOpts)}`
      );
    }
  } else if (hasOpen) {
    parts.push(
      `Opens at ${openD!.toLocaleTimeString([], timeOpts)} on ${openD!.toLocaleDateString([], dateOpts)}`
    );
  } else if (hasClose) {
    parts.push(
      `Closes at ${closeD!.toLocaleTimeString([], timeOpts)} on ${closeD!.toLocaleDateString([], dateOpts)}`
    );
  }

  // Uncomment if you want deadline to display:
  // if (hasDeadline) {
  //   parts.push(`Deadline: ${deadlineD!.toLocaleDateString([], dateOpts)}`);
  // }

  return parts.length > 0 ? parts.join(" · ") + "." : "";
}

