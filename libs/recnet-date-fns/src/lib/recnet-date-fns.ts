const CYCLE_DUE_DAY = 2;
export const WeekTs = 604800000 as const;
export const START_DATE = new Date(2023, 9, 24);

export const monthValMap = {
  Jan: 0,
  Feb: 1,
  Mar: 2,
  Apr: 3,
  May: 4,
  Jun: 5,
  Jul: 6,
  Aug: 7,
  Sep: 8,
  Oct: 9,
  Nov: 10,
  Dec: 11,
} as const;
export type Month = keyof typeof monthValMap;
export function isMonth(val: string): val is Month {
  return val in monthValMap;
}

export const Months: Month[] = Object.keys(monthValMap).sort(
  (a, b) => monthValMap[a as Month] - monthValMap[b as Month]
) as Month[];

export const numToMonth = Months.reduce(
  (acc, key) => {
    const num = monthValMap[key];
    acc[num] = key;
    return acc;
  },
  {} as Record<number, Month>
);
export const monthToNum = Months.reduce(
  (acc, key) => {
    const num = monthValMap[key];
    acc[key] = num;
    return acc;
  },
  {} as Record<Month, number>
);

/**
  @param _date: Date
  @returns Date

  Returns the next cutoff date from the given date.
*/
export const getCutOff = (_date: Date): Date => {
  const date = new Date(_date.getTime());
  const currentDay = date.getUTCDay();
  const daysUntilNextCutoff = (CYCLE_DUE_DAY + 7 - currentDay) % 7;
  date.setUTCDate(date.getUTCDate() + daysUntilNextCutoff);
  date.setUTCHours(23, 59, 59, 999);
  return date;
};

/**
  @returns Date

  Returns the next cutoff date from the current date.
*/
export const getNextCutOff = (): Date => {
  const currentDate = new Date();
  return getCutOff(currentDate);
};

/**
  @returns Date

  Returns the latest cutoff date before the current date.
*/
export const getLatestCutOff = (): Date => {
  const nextCutOff = getNextCutOff();
  nextCutOff.setUTCDate(nextCutOff.getUTCDate() - 7);
  return nextCutOff;
};

export const getVerboseDateString = (
  date: Date,
  options?: Intl.DateTimeFormatOptions & {
    withTime?: boolean;
  }
): string => {
  const { withTime = true, ...restOptions } = options || {};

  const dateTimeFormatTimeOptions: Intl.DateTimeFormatOptions = withTime
    ? {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        // timeZoneName: "short",
        hourCycle: "h23",
      }
    : {};

  return Intl.DateTimeFormat("default", {
    weekday: "long",
    month: "numeric",
    day: "numeric",
    ...dateTimeFormatTimeOptions,
    ...restOptions,
  })
    .format(date)
    .replaceAll(",", " ");
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
