import { FirebaseTs } from "@/types/rec";
import { Timestamp } from "firebase/firestore";

const CYCLE_DUE_DAY = 2;

export const getNextCutOff = (): Date => {
  const currentDate = new Date();
  const currentDay = currentDate.getUTCDay();
  const daysUntilNextCutoff = (CYCLE_DUE_DAY + 7 - currentDay) % 7;
  currentDate.setUTCDate(currentDate.getUTCDate() + daysUntilNextCutoff);
  currentDate.setUTCHours(23, 59, 59, 999);
  return currentDate;
};

export const getLatestCutOff = (): Date => {
  const nextCutOff = getNextCutOff();
  nextCutOff.setUTCDate(nextCutOff.getUTCDate() - 7);
  return nextCutOff;
};

export const getVerboseDateString = (date: Date): string => {
  return Intl.DateTimeFormat("default", {
    weekday: "long",
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZoneName: "short",
    hourCycle: "h11",
  })
    .format(date)
    .replaceAll(",", " ");
};

export const getDateFromFirebaseTimestamp = (ts: FirebaseTs): Date => {
  const timestamp = new Timestamp(ts._seconds, ts._nanoseconds);
  return timestamp.toDate();
};

export const formatDate = (date: Date): string => {
  // return MM/DD/YYYY
  return date.toLocaleDateString("en-US");
};
