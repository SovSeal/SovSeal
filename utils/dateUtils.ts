/**
 * Date utility functions for formatting timestamps
 */

/**
 * Format a timestamp as a relative time string (e.g., "in 2 hours", "3 days ago")
 *
 * @param timestamp Unix timestamp in milliseconds
 * @returns Formatted relative time string
 */
export function formatDistanceToNow(timestamp: number): string {
  const now = Date.now();
  const diff = timestamp - now;
  const absDiff = Math.abs(diff);

  const seconds = Math.floor(absDiff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  const future = diff > 0;
  const prefix = future ? "in " : "";
  const suffix = future ? "" : " ago";

  if (years > 0) {
    return `${prefix}${years} year${years > 1 ? "s" : ""}${suffix}`;
  }
  if (months > 0) {
    return `${prefix}${months} month${months > 1 ? "s" : ""}${suffix}`;
  }
  if (weeks > 0) {
    return `${prefix}${weeks} week${weeks > 1 ? "s" : ""}${suffix}`;
  }
  if (days > 0) {
    return `${prefix}${days} day${days > 1 ? "s" : ""}${suffix}`;
  }
  if (hours > 0) {
    return `${prefix}${hours} hour${hours > 1 ? "s" : ""}${suffix}`;
  }
  if (minutes > 0) {
    return `${prefix}${minutes} minute${minutes > 1 ? "s" : ""}${suffix}`;
  }
  return `${prefix}${seconds} second${seconds !== 1 ? "s" : ""}${suffix}`;
}

/**
 * Calculate message status based on unlock timestamp and unlocked state
 *
 * @param unlockTimestamp Unix timestamp in milliseconds
 * @param isUnlocked Whether the message has been unlocked by the user
 * @returns Message status
 */
export function calculateMessageStatus(
  unlockTimestamp: number,
  isUnlocked: boolean
): "Locked" | "Unlockable" | "Unlocked" {
  if (isUnlocked) {
    return "Unlocked";
  }

  const now = Date.now();
  if (now >= unlockTimestamp) {
    return "Unlockable";
  }

  return "Locked";
}
