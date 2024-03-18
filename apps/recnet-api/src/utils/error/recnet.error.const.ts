export const ErrorCode = {
  INTERNAL_SERVER_ERROR: 1000,
  ZOD_VALIDATION_ERROR: 1001,
};

export const errorMessages = {
  [ErrorCode.INTERNAL_SERVER_ERROR]: "Internal server error",
  [ErrorCode.ZOD_VALIDATION_ERROR]: "Zod validation error",
};
