import { FirebaseTs } from "@/types/rec";
import { Timestamp } from "firebase/firestore";

const CYCLE_DUE_DAY = 2;
export const WeekTs = 604800000 as const;
export const START_DATE = new Date(2023, 9, 24);
export const Months = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export const getCutOff = (_date: Date): Date => {
  const date = new Date(_date.getTime());
  const currentDay = date.getUTCDay();
  const daysUntilNextCutoff = (CYCLE_DUE_DAY + 7 - currentDay) % 7;
  date.setUTCDate(date.getUTCDate() + daysUntilNextCutoff);
  date.setUTCHours(23, 59, 59, 999);
  return date;
};

export const getNextCutOff = (): Date => {
  const currentDate = new Date();
  return getCutOff(currentDate);
};

export const getLatestCutOff = (): Date => {
  const nextCutOff = getNextCutOff();
  nextCutOff.setUTCDate(nextCutOff.getUTCDate() - 7);
  return nextCutOff;
};

export const getVerboseDateString = (date: Date): string => {
  const localTime = date.toLocaleTimeString();
  return (
    Intl.DateTimeFormat("default", {
      weekday: "long",
      month: "numeric",
      day: "numeric",
      // hour: "2-digit",
      // minute: "2-digit",
      // second: "2-digit",
      // timeZoneName: "short",
      // hourCycle: "h11",
    })
      .format(date)
      .replaceAll(",", " ") + ` ${localTime}`
  );
};

export const getDateFromFirebaseTimestamp = (ts: FirebaseTs): Date => {
  const timestamp = new Timestamp(ts._seconds, ts._nanoseconds);
  return timestamp.toDate();
};

export const formatDate = (date: Date): string => {
  // return MM/DD/YYYY
  return date.toLocaleDateString("en-US");
};

export const getCutOffFromStartDate = (_startDate?: Date): Date[] => {
  const startDate = _startDate || START_DATE;
  const cutOffs: Date[] = [];
  let curr = getCutOff(startDate);
  const now = new Date();
  while (curr.getTime() < now.getTime()) {
    cutOffs.push(curr);
    curr = new Date(curr.getTime());
    curr.setUTCDate(curr.getUTCDate() + 7);
  }
  return cutOffs.reverse();
};
