/**
 * Format a Date as a Dutch relative time string, e.g. "2 uur geleden".
 *
 * Accepts a string/number too: data that passes through unstable_cache is
 * JSON-serialized, so Date fields come back as ISO strings at runtime even
 * though their TypeScript type still says Date.
 */
export function timeAgo(date: Date | string | number): string {
  const d = date instanceof Date ? date : new Date(date);
  const now = Date.now();
  const seconds = Math.floor((now - d.getTime()) / 1000);

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
