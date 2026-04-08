/**
 * Format a Date as a Dutch relative time string, e.g. "2 uur geleden".
 */
export function timeAgo(date: Date): string {
  const now = Date.now();
  const seconds = Math.floor((now - date.getTime()) / 1000);

  if (seconds < 60) return "zojuist";

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} ${minutes === 1 ? "minuut" : "minuten"} geleden`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} uur geleden`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} ${days === 1 ? "dag" : "dagen"} geleden`;

  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks} ${weeks === 1 ? "week" : "weken"} geleden`;

  const months = Math.floor(days / 30);
  if (months < 12) return `${months} ${months === 1 ? "maand" : "maanden"} geleden`;

  const years = Math.floor(days / 365);
  return `${years} ${years === 1 ? "jaar" : "jaar"} geleden`;
}
