import { Timestamp } from "firebase/firestore";

export const DUE_DAY = 2;
export const START_DATE = new Date(2023, 8, 29); // TODO

const currentDate = new Date();
const currentDay = currentDate.getUTCDay(); // 0 for Sunday, 1 for Monday, ..., 6 for Saturday
const daysUntilNextCutoff = (DUE_DAY + 7 - currentDay) % 7;
const daysSinceLastCutoff = 7 - daysUntilNextCutoff;

/** Returns a cutoff Date object given the date.
 * @param {number} date
 */
function getCutoff(date) {
  const cutoff = new Date();
  cutoff.setUTCDate(date);
  cutoff.setUTCHours(23, 59, 59, 999);
  return cutoff;
}

const LAST_CUTOFF = getCutoff(currentDate.getUTCDate() - daysSinceLastCutoff);
const NEXT_CUTOFF = getCutoff(currentDate.getUTCDate() + daysUntilNextCutoff);

export { LAST_CUTOFF, NEXT_CUTOFF };

/** Format a given day in local timezone in the form of MM/DD/YYYY.
 * @param d Date object
 */
export function formatDate(d) {
  const year = d.getFullYear();
  const month = d.getMonth() + 1; // Months are 0-based
  const date = d.getDate();

  return `${month}/${date}/${year}`;
}

/** Format next cutoff day in the form of MM/DD/YYYY.*/
export function getNextDueDay() {
  return formatDate(NEXT_CUTOFF);
}

/** Get timestamp in milliseconds from server timestamp.
 * @param timestamp Server timestamp object
 */
export function getDateFromServerTimestamp(timestamp) {
  timestamp = new Timestamp(timestamp.seconds, timestamp.nanoseconds);
  return new Date(timestamp.toMillis());
}

/** Gets all due day dates from the start date to today in reverse order.
 * @param startDate
 */
export function getPastDueDays(startDate) {
  let result = [];
  let currentDate = new Date(startDate);

  // find the next due day after start date
  while (currentDate.getUTCDay() !== DUE_DAY) {
    currentDate.setUTCDate(currentDate.getUTCDate() + 1);
  }

  // add subsequent due dates to list
  while (currentDate <= new Date()) {
    result.push(getCutoff(currentDate.getUTCDate()));
    currentDate.setUTCDate(currentDate.getUTCDate() + 7);
  }

  return result.reverse();
}

/** Returns if a date is within this cutoff.
 * @param date
 */
export function isDateWithinDateRange(date) {
  return date > LAST_CUTOFF && date <= NEXT_CUTOFF;
}
