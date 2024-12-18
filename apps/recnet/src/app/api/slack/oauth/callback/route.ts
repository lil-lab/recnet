import { redirect } from "next/navigation";
import { type NextRequest } from "next/server";

import { serverClient } from "@recnet/recnet-web/app/_trpc/serverClient";
import { serverEnv } from "@recnet/recnet-web/serverEnv";

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const code = searchParams.get("code");
  const errorDesc = searchParams.get("error_description");

  if (!code) {
    redirect(
      `/feeds?slackOAuthStatus=error${errorDesc ? `&error_description=${errorDesc}` : ""}`
    );
  }
  let isSuccess = true;
  let workspaceName = "";
  try {
    const data = await serverClient.slackOAuth2FA({
      code: code,
      redirectUri: serverEnv.SLACK_OAUTH_REDIRECT_URI,
    });
    workspaceName = data.workspaceName;
  } catch (e) {
    console.error("e: ", e);
    isSuccess = false;
  }
  redirect(
    `/feeds?slackOAuthStatus=${isSuccess ? `success&workspace_name=${workspaceName}` : "error"}${errorDesc ? `&error_description=${errorDesc}` : ""}`
  );
}
