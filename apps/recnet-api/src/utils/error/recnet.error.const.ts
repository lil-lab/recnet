export const ErrorCode = {
  INTERNAL_SERVER_ERROR: 1000,
  ZOD_VALIDATION_ERROR: 1001,
  INVALID_CUTOFF: 1002,
  REC_ALREADY_EXISTS: 1003,
  REC_UPDATE_OR_CREATE_RULE_VIOLATION: 1004,
  INVALID_INVITE_CODE: 1005,
  HANDLE_EXISTS: 1006,
  START_DATE_AFTER_END_DATE: 1007,

  // DB error codes
  DB_UNKNOWN_ERROR: 2000,
  DB_USER_NOT_FOUND: 2001,
  DB_UNIQUE_CONSTRAINT: 2002,

  // Third party error codes
  EMAIL_SEND_ERROR: 3000,
};

export const errorMessages = {
  [ErrorCode.INTERNAL_SERVER_ERROR]: "Internal server error",
  [ErrorCode.ZOD_VALIDATION_ERROR]: "Zod validation error",
  [ErrorCode.INVALID_CUTOFF]: "Invalid cutoff",
  [ErrorCode.REC_ALREADY_EXISTS]: "Upcoming rec already exists",
  [ErrorCode.REC_UPDATE_OR_CREATE_RULE_VIOLATION]:
    "article and articleId cannot be null or have value at the same time",
  [ErrorCode.INVALID_INVITE_CODE]: "Invalid invite code",
  [ErrorCode.HANDLE_EXISTS]: "Handle already exists",
  [ErrorCode.START_DATE_AFTER_END_DATE]: "Start date is after end date",
  [ErrorCode.DB_UNKNOWN_ERROR]: "Database error",
  [ErrorCode.DB_USER_NOT_FOUND]: "User not found",
  [ErrorCode.DB_UNIQUE_CONSTRAINT]: "Unique constraint violation",
};
