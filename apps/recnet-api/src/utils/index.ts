export const getOffset = (page: number, pageSize: number): number =>
  (page - 1) * pageSize;

export const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));
