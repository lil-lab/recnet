import { UserPreview as DbUserPreview } from "@recnet-api/database/repository/user.repository.type";

import { UserPreview } from "./entities/user.preview.entity";

export const transformUserPreview = (user: DbUserPreview): UserPreview => ({
  id: user.id,
  handle: user.handle,
  displayName: user.displayName,
  photoUrl: user.photoUrl,
  affiliation: user.affiliation,
  bio: user.bio,
  url: user.url,
  numFollowers: user.followedBy.length,
  numRecs: user.recommendations.length,
});
