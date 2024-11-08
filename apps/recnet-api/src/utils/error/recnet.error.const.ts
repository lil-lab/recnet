export const ErrorCode = {
  INTERNAL_SERVER_ERROR: 1000,
  ZOD_VALIDATION_ERROR: 1001,
  INVALID_CUTOFF: 1002,
  REC_ALREADY_EXISTS: 1003,
  REC_UPDATE_OR_CREATE_RULE_VIOLATION: 1004,
  INVALID_INVITE_CODE: 1005,
  HANDLE_EXISTS: 1006,
  START_DATE_AFTER_END_DATE: 1007,
  ACCOUNT_NOT_ACTIVATED: 1008,
  DIGITAL_LIBRARY_RANK_CONFLICT: 1009,
  INVALID_REACTION_TYPE: 1010,
  INVALID_SUBSCRIPTION: 1011,

  // DB error codes
  DB_UNKNOWN_ERROR: 2000,
  DB_USER_NOT_FOUND: 2001,
  DB_UNIQUE_CONSTRAINT: 2002,
  DB_REC_NOT_FOUND: 2003,

  // Third party error codes
  EMAIL_SEND_ERROR: 3000,
  FETCH_DIGITAL_LIBRARY_ERROR: 3001,
  SLACK_ERROR: 3002,
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
  [ErrorCode.ACCOUNT_NOT_ACTIVATED]: "The user account is not activated",
  [ErrorCode.DIGITAL_LIBRARY_RANK_CONFLICT]:
    "Digital library rank must be unique",
  [ErrorCode.INVALID_REACTION_TYPE]: "Invalid reaction type",
  [ErrorCode.INVALID_SUBSCRIPTION]: "Invalid subscription",
  [ErrorCode.DB_UNKNOWN_ERROR]: "Database error",
  [ErrorCode.DB_USER_NOT_FOUND]: "User not found",
  [ErrorCode.DB_UNIQUE_CONSTRAINT]: "Unique constraint violation",
  [ErrorCode.DB_REC_NOT_FOUND]: "Rec not found",
  [ErrorCode.EMAIL_SEND_ERROR]: "Email send error",
  [ErrorCode.FETCH_DIGITAL_LIBRARY_ERROR]: "Fetch digital library error",
  [ErrorCode.SLACK_ERROR]: "Slack error",
};
