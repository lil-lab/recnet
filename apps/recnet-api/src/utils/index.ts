export const getOffset = (page: number, pageSize: number): number =>
  (page - 1) * pageSize;
