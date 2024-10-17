"use client";
import { FaceIcon } from "@radix-ui/react-icons";
import { Popover, Button, Flex, Spinner } from "@radix-ui/themes";
import { toast } from "sonner";

import { useAuth } from "@recnet/recnet-web/app/AuthContext";
import { trpc } from "@recnet/recnet-web/app/_trpc/client";
import { cn } from "@recnet/recnet-web/utils/cn";
import { notEmpty } from "@recnet/recnet-web/utils/notEmpty";

import { ReactionType, reactionTypeSchema } from "@recnet/recnet-api-model";

const reactionEmojiMap: Record<ReactionType, string> = {
  THUMBS_UP: "👍",
  THINKING: "🤔",
  SURPRISED: "😲",
  CRYING: "😢",
  STARRY_EYES: "🤩",
  MINDBLOWN: "🤯",
  EYES: "👀",
  ROCKET: "🚀",
  HEART: "❤️",
  PRAY: "🙏",
  PARTY: "🎉",
};

function ReactionButton(props: { onSelect: (reaction: ReactionType) => void }) {
  const { onSelect } = props;

  return (
    <Popover.Root>
      <Popover.Trigger>
        <div className="cursor-pointer rounded-[999px] mr-1 p-2 bg-gray-4">
          <FaceIcon width="16" height="16" className="text-gray-11" />
        </div>
      </Popover.Trigger>
      <Popover.Content>
        <Flex>
          {reactionTypeSchema.options.map((reaction) => (
            <Popover.Close key={reaction}>
              <Button
                variant="ghost"
                className="cursor-pointer hover:bg-blue-6 mx-0"
                onClick={() => {
                  onSelect(reaction);
                }}
              >
                {reactionEmojiMap[reaction]}
              </Button>
            </Popover.Close>
          ))}
        </Flex>
      </Popover.Content>
    </Popover.Root>
  );
}

function ReactionChip(props: {
  onClick: (reaction: ReactionType) => void;
  reaction: ReactionType;
  count: number;
  isSelected?: boolean;
}) {
  const { onClick, reaction, count, isSelected = false } = props;

  return (
    <div
      className={cn(
        "flex flex-row cursor-pointer rounded-[99px] px-2 py-1 items-center text-[14px] gap-x-2 transition-colors ease-in-out border-[1px]",
        isSelected
          ? "border-blue-6 bg-blue-4 hover:border-blue-8"
          : "border-gray-6 bg-gray-4 hover:border-gray-8"
      )}
      onClick={() => {
        onClick(reaction);
      }}
    >
      <div>{reactionEmojiMap[reaction]}</div>
      <div>{count}</div>
    </div>
  );
}

export function RecReactionsList(props: { id: string }) {
  const { id } = props;
  const { user } = useAuth();
  const { data, isLoading, refetch } = trpc.getRecById.useQuery({
    id,
  });
  const utils = trpc.useUtils();

  /**
    These mutations use optimistic updates to update the UI before the server responds.
    and roll back if the server responds with an error.
  */
  const addReactionMutation = trpc.addReaction.useMutation({
    onMutate: async ({ recId, reaction }) => {
      // Cancel any outgoing refetches
      await utils.getRecById.cancel({
        id: recId,
      });
      // Snapshot the previous value
      const previousData = utils.getRecById.getData({
        id: recId,
      });
      // Optimistically update to the new value
      if (previousData) {
        utils.getRecById.setData(
          {
            id: recId,
          },
          {
            ...previousData,
            rec: {
              ...previousData.rec,
              reactions: {
                ...previousData.rec.reactions,
                numReactions: previousData.rec.reactions.numReactions.map(
                  (reactionCountPair) => {
                    if (reactionCountPair.type === reaction) {
                      return {
                        type: reaction,
                        count: reactionCountPair.count + 1,
                      };
                    }
                    return reactionCountPair;
                  }
                ),
                selfReactions: [
                  ...previousData.rec.reactions.selfReactions,
                  reaction,
                ],
              },
            },
          }
        );
      }
      // Return a rollback value in context
      return { previousData };
    },
    onError: (error, variables, context) => {
      // If the mutation failed, use the context to roll back
      if (context?.previousData) {
        utils.getRecById.setData({ id: variables.recId }, context.previousData);
      }
    },
    onSettled: () => {
      // Re-fetch the query
      utils.getRecById.refetch();
    },
  });
  const removeReactionMutation = trpc.removeReaction.useMutation({
    onMutate: async ({ recId, reaction }) => {
      // Cancel any outgoing refetches
      await utils.getRecById.cancel({
        id: recId,
      });
      // Snapshot the previous value
      const previousData = utils.getRecById.getData({
        id: recId,
      });
      // Optimistically update to the new value
      if (previousData) {
        utils.getRecById.setData(
          {
            id: recId,
          },
          {
            ...previousData,
            rec: {
              ...previousData.rec,
              reactions: {
                ...previousData.rec.reactions,
                numReactions: previousData.rec.reactions.numReactions
                  .map((reactionCountPair) => {
                    if (reactionCountPair.type === reaction) {
                      // If the count is 1, remove the reaction
                      if (reactionCountPair.count === 1) {
                        return null;
                      }
                      return {
                        type: reaction,
                        count: reactionCountPair.count - 1,
                      };
                    }
                    return reactionCountPair;
                  })
                  .filter(notEmpty),
                selfReactions: previousData.rec.reactions.selfReactions.filter(
                  (r) => r !== reaction
                ),
              },
            },
          }
        );
      }
      // Return a rollback value in context
      return { previousData };
    },
    onError: (error, variables, context) => {
      // If the mutation failed, use the context to roll back
      if (context?.previousData) {
        utils.getRecById.setData({ id: variables.recId }, context.previousData);
      }
    },
    onSettled: () => {
      // Re-fetch the query
      utils.getRecById.refetch();
    },
  });

  const onClickReaction = async (reaction: ReactionType) => {
    if (isLoading || !data) {
      return;
    }
    if (!user) {
      toast.error("You need to be logged in to react");
      return;
    }
    // if yes, send reaction mutation
    // if this reaction is already selected, remove it
    // else, add it
    const isReactionSelected =
      data.rec.reactions.selfReactions.includes(reaction);
    if (isReactionSelected) {
      await removeReactionMutation.mutateAsync({
        recId: id,
        reaction,
      });
    } else {
      await addReactionMutation.mutateAsync({
        recId: id,
        reaction,
      });
    }
    // refresh the list
    refetch();
  };

  return (
    <div className="flex flex-row flex-wrap items-center gap-x-2 gap-y-2">
      <ReactionButton onSelect={onClickReaction} />
      {isLoading ? (
        <Spinner />
      ) : !data ? null : (
        data.rec.reactions.numReactions.map((reactionCountPair) => {
          return (
            <ReactionChip
              key={reactionCountPair.type}
              onClick={onClickReaction}
              reaction={reactionCountPair.type}
              count={reactionCountPair.count}
              isSelected={
                !user
                  ? false
                  : data.rec.reactions.selfReactions.includes(
                      reactionCountPair.type
                    )
              }
            />
          );
        })
      )}
    </div>
  );
}
