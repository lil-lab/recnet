import { SlackBlockDto } from "slack-block-builder";

export type SendSlackResult = {
  success: boolean;
  skip?: boolean;
  userId?: string;
};

export type SlackMessageBlocks = Readonly<SlackBlockDto>[];

export type SlackOauthInfo = {
  slackAccessToken: string;
  slackUserId: string;
  slackWorkspaceName: string;
};
