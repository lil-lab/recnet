import { ReactionType } from "@prisma/client";

import {
  Rec as DbRec,
  RecReaction as DbRecReaction,
} from "@recnet-api/database/repository/rec.repository.type";
import { transformUserPreview } from "@recnet-api/modules/user/user.transformer";

import { Rec } from "./entities/rec.entity";

export const transformRec = (
  dbRec: DbRec,
  authUserId: string | null = null
): Rec => {
  let selfReactions: ReactionType[] = [];
  if (authUserId) {
    selfReactions = dbRec.reactions
      .filter((reaction) => reaction.userId == authUserId)
      .map((reaction) => reaction.reaction);
  }

  const reactionCounts = dbRec.reactions.reduce(
    (acc: Record<ReactionType, number>, reaction: DbRecReaction) => {
      if (!acc[reaction.reaction]) {
        acc[reaction.reaction] = 0;
      }
      acc[reaction.reaction] += 1;
      return acc;
    },
    {} as Record<ReactionType, number>
  );
  const numReactions = Object.keys(reactionCounts).map((reactionType) => ({
    type: reactionType as ReactionType,
    count: reactionCounts[reactionType as ReactionType],
  }));

  return {
    ...dbRec,
    cutoff: dbRec.cutoff.toISOString(),
    user: transformUserPreview(dbRec.user),
    reactions: {
      selfReactions,
      numReactions,
    },
  };
};
