export const ErrorCode = {
  INTERNAL_SERVER_ERROR: 1000,
  ZOD_VALIDATION_ERROR: 1001,
  INVALID_CUTOFF: 1002,
  REC_ALREADY_EXISTS: 1003,
};

export const errorMessages = {
  [ErrorCode.INTERNAL_SERVER_ERROR]: "Internal server error",
  [ErrorCode.ZOD_VALIDATION_ERROR]: "Zod validation error",
  [ErrorCode.INVALID_CUTOFF]: "Invalid cutoff",
  [ErrorCode.REC_ALREADY_EXISTS]: "Upcoming rec already exists",
};
