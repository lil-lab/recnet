import { redirect } from "next/navigation";

import { generateOAuthLink } from "../slackAppInstallHelper";

export async function GET(req: Request) {
  redirect(generateOAuthLink());
}
