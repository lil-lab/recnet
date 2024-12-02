import { serverEnv } from "@recnet/recnet-web/serverEnv";

export function generateOAuthLink(): string {
  return `https://slack.com/oauth/v2/authorize?scope=${serverEnv.SLACK_OAUTH_APP_SCOPES}&client_id=${serverEnv.SLACK_APP_CLIENT_ID}&redirect_uri=${serverEnv.SLACK_OAUTH_REDIRECT_URI}`;
}
