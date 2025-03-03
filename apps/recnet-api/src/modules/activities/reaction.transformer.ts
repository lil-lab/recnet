import { Reaction as DbReaction } from "@recnet-api/database/repository/reaction.repository.type";

import { Reaction } from "./entities/reaction.entity";

export const transformReaction = (dbReaction: DbReaction): Reaction => {
  return {
    ...dbReaction,
    createdAt: dbReaction.createdAt.toISOString(),
    // recommendation: transformUserPreview(dbReaction.rec),
  };
};
