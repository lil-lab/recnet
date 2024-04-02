export const ErrorCode = {
  INTERNAL_SERVER_ERROR: 1000,
  ZOD_VALIDATION_ERROR: 1001,
  INVALID_CUTOFF: 1002,
  REC_ALREADY_EXISTS: 1003,
  REC_UPDATE_OR_CREATE_RULE_VIOLATION: 1004,
  INVALID_INVITE_CODE: 1005,

  // DB error codes
  DB_UNKNOWN_ERROR: 2000,
  DB_USER_NOT_FOUND: 2001,
  DB_CREATE_USER_ERROR: 2002,
};

export const errorMessages = {
  [ErrorCode.INTERNAL_SERVER_ERROR]: "Internal server error",
  [ErrorCode.ZOD_VALIDATION_ERROR]: "Zod validation error",
  [ErrorCode.INVALID_CUTOFF]: "Invalid cutoff",
  [ErrorCode.REC_ALREADY_EXISTS]: "Upcoming rec already exists",
  [ErrorCode.REC_UPDATE_OR_CREATE_RULE_VIOLATION]:
    "article and articleId cannot be null or have value at the same time",
  [ErrorCode.INVALID_INVITE_CODE]: "Invalid invite code",
  [ErrorCode.DB_UNKNOWN_ERROR]: "Database error",
  [ErrorCode.DB_USER_NOT_FOUND]: "User not found",
  [ErrorCode.DB_CREATE_USER_ERROR]: "Error creating user",
};
