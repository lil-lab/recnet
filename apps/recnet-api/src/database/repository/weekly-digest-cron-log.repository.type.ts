export type WeeklyDigestCronResult = {
  email: {
    successCount: number;
    errorUserIds: string[];
  };
};
