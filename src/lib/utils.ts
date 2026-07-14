export function formatPostedAt(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}

export function getTimeRemaining(expiresAt: string): {
  totalMs: number;
  label: string;
  isExpired: boolean;
} {
  const diff = new Date(expiresAt).getTime() - Date.now();

  if (diff <= 0) {
    return { totalMs: 0, label: "Expired", isExpired: true };
  }

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  let label: string;
  if (hours > 0) {
    label = `${hours}h ${minutes}m left`;
  } else if (minutes > 0) {
    label = `${minutes}m ${seconds}s left`;
  } else {
    label = `${seconds}s left`;
  }

  return { totalMs: diff, label, isExpired: false };
}
