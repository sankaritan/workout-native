/**
 * Date utility functions for calendar and date formatting
 */

/**
 * Gets the number of days in a month
 * @param year - The year
 * @param month - The month (0-11)
 * @returns Number of days in the specified month
 */
export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

/**
 * Gets the day of week for the first day of the month
 * @param year - The year
 * @param month - The month (0-11)
 * @returns Day of week (0 = Sunday, 6 = Saturday)
 */
export function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

/**
 * Format a date as YYYY-MM-DD for comparison
 * @param date - The date to format
 * @returns Date string in YYYY-MM-DD format
 */
export function formatDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Parse ISO date string to YYYY-MM-DD format
 * @param isoString - ISO format date string
 * @returns Date string in YYYY-MM-DD format
 */
export function parseISOToDateKey(isoString: string): string {
  const date = new Date(isoString);
  return formatDateKey(date);
}
