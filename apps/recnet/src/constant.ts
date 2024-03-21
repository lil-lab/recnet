export enum UserRole {
  ADMIN = "ADMIN",
  USER = "USER",
}

export enum ErrorMessages {
  MISSING_FIREBASE_SECRET = "Unauthorized, missing Firebase secret",
  MISSING_RECNET_SECRET = "Unauthorized, missing Recnet secret",
  NOT_ADMIN = "Unauthorized, not an admin",
  INTERNAL_SERVER_ERROR = "Internal server error",
  // user
  USER_NOT_FOUND = "User not found",
  USER_HANDLE_USED = "User handle already used",
  // rec
  REC_NOT_FOUND = "Rec not found",
  // invite-code
  INVITE_CODE_NOT_FOUND = "Invite code not found",
  INVITE_CODE_USED = "Invite code already used",
}
