export function resolveBaseUrl(env: string | undefined) {
  /**
   * If the environment is preview, we need to use the Vercel branch URL.
   * Otherwise, we use the base URL.
   * Ref: https://vercel.com/docs/projects/environment-variables/framework-environment-variables#NEXT_PUBLIC_VERCEL_BRANCH_URL
   */
  if (env === "preview") {
    return `https://${process.env.NEXT_PUBLIC_VERCEL_BRANCH_URL}`;
  }
  return process.env.NEXT_PUBLIC_BASE_URL;
}
