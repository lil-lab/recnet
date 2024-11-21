import { redirect } from "next/navigation";
import { type NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const code = searchParams.get("code");
  console.log("req: ", req);
  console.log("code", code);

  if (!code) {
    redirect("/feeds?slackOAuthStatus=error");
  }
  try {
    // hit trpc api to forward the code to api server
    redirect("/feeds?slackOAuthStatus=success");
  } catch (e) {
    redirect("/feeds?slackOAuthStatus=error");
  }
}
