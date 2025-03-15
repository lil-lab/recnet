import { Reaction as DbReaction } from "@recnet-api/database/repository/activity.repository.type";

import { Reaction } from "./entities/activity.entity";

import { transformRec } from "../rec/rec.transformer";

export const transformReaction = (dbReaction: DbReaction): Reaction => {
  return {
    ...dbReaction, // id, userId, reaction: ReactionType
    createdAt: dbReaction.createdAt.toISOString(),
    recommendation: transformRec(dbReaction.recommendation),
  };
};
