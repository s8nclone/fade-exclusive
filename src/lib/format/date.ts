export function formatUtcDate(dateInput: string | Date, includeTime = false): string {
  const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    ...(includeTime ? { hour: "2-digit", minute: "2-digit" } : {}),
  }).format(date);
}

export function formatDateTime(dateInput: string | Date): string {
  return formatUtcDate(dateInput, true);
}

export function formatRemainingWindow(dueAtInput: string | Date): {
  expired: boolean;
  label: string;
} {
  const due = typeof dueAtInput === "string" ? new Date(dueAtInput) : dueAtInput;
  const diffMs = due.getTime() - Date.now();
  if (Number.isNaN(diffMs) || diffMs <= 0) {
    return { expired: true, label: "Window Expired" };
  }
  const totalMinutes = Math.floor(diffMs / 60_000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return {
    expired: false,
    label: `${hours}h ${minutes}m remaining`,
  };
}

export function addDaysFormatted(days: number, fromDate: Date = new Date()): string {
  const target = new Date(fromDate.getTime() + days * 24 * 60 * 60 * 1000);
  return formatUtcDate(target, false);
}
