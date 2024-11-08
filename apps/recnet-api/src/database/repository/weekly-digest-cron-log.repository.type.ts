export type WeeklyDigestCronResult = {
  email: {
    successCount: number;
    errorUserIds: string[];
  };
  slack: {
    successCount: number;
    errorUserIds: string[];
  };
};
