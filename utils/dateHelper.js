import { Timestamp } from "firebase/firestore";

export const DUE_DAY = 2; // 0 for Sunday, 1 for Monday, ..., 6 for Saturday
export const START_DATE = new Date(2023, 9, 24); // NOTE: month is 0-indexed

/** Returns a cutoff Date object with exact cutoff time given the date.
 * @param {Date} date
 */
function getCutoffTime(cutoff) {
  cutoff.setUTCHours(23, 59, 59, 999);
  return cutoff;
}

export function getLastCutoff() {
  const currentDate = new Date();
  const currentDay = currentDate.getUTCDay();
  const daysUntilNextCutoff = (DUE_DAY + 7 - currentDay) % 7;
  const daysSinceLastCutoff = 7 - daysUntilNextCutoff;
  currentDate.setUTCDate(currentDate.getUTCDate() - daysSinceLastCutoff);
  return getCutoffTime(currentDate);
}

export function getNextCutoff() {
  const currentDate = new Date();
  const currentDay = currentDate.getUTCDay();
  const daysUntilNextCutoff = (DUE_DAY + 7 - currentDay) % 7;
  currentDate.setUTCDate(currentDate.getUTCDate() + daysUntilNextCutoff);
  return getCutoffTime(currentDate);
}

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
export function formatNextDueDay() {
  return formatDate(getNextCutoff());
}

/** Format the cutoff as Weekday MM/DD HH:MM:SS Time_zone. */
export function formatDateVerbose(date, excludeDate) {
  var options = {};
  if (excludeDate) {
    options = {
      weekday: "long",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
      timeZoneName: "short",
    };
  } else {
    options = {
      weekday: "long",
      month: "numeric",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
      timeZoneName: "short",
    };
  }

  const formattedDate = new Intl.DateTimeFormat("default", options).format(
    date
  );
  return formattedDate.replaceAll(",", "");
}

/** Get timestamp in milliseconds from server timestamp.
 * @param timestamp Server timestamp object
 */
export function getDateFromServerTimestamp(timestamp) {
  timestamp = new Timestamp(timestamp.seconds, timestamp.nanoseconds);
  return new Date(timestamp.toMillis());
}

/** Gets all cutoff day dates from the start date to today in reverse order.
 * @param {Date} startDate
 * @return {Date[]} cutoff dates from the latest
 */
export function getPastDueDays(startDate) {
  let result = [];
  let currentDate = new Date(startDate);

  // find the next due day after start date
  while (currentDate.getUTCDay() !== DUE_DAY) {
    currentDate.setUTCDate(currentDate.getUTCDate() + 1);
  }
  currentDate = getCutoffTime(currentDate);
  // add subsequent due dates to list
  while (currentDate <= new Date()) {
    result.push(new Date(currentDate));
    currentDate.setUTCDate(currentDate.getUTCDate() + 7);
  }

  return result.reverse();
}

/** Returns if a date is within this cutoff.
 * @param date
 */
export function isDateWithinDateRange(date) {
  return date > getLastCutoff() && date <= getNextCutoff();
}
