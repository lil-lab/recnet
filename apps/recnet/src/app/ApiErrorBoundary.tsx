"use client";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

import { ErrorBlock } from "@recnet/recnet-web/components/error";
import { cn } from "@recnet/recnet-web/utils/cn";

import { trpc } from "./_trpc/client";

const WhitelistedPaths = ["/", "/about", "/help"];

/**
 * Display Error UI when API is down.
 * Note: Some routes are whitelisted to avoid showing the error UI
 */
export function ApiErrorBoundary({ children }: { children: React.ReactNode }) {
  const { data } = trpc.apiHealthCheck.useQuery();
  const pathname = usePathname();
  const utils = trpc.useUtils();

  useEffect(() => {
    utils.apiHealthCheck.invalidate();
  }, [pathname, utils.apiHealthCheck]);

  if (data && !data.ok && !WhitelistedPaths.includes(pathname)) {
    return (
      <div
        className={cn(
          "w-full",
          "lg:w-[60%]",
          `min-h-[90svh]`,
          "flex",
          "flex-col",
          "p-8",
          "gap-y-6",
          "justify-center",
          "items-center"
        )}
      >
        <ErrorBlock code={521} />
      </div>
    );
  }
  return children;
}
