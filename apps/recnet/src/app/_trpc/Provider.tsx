"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import { trpc } from "./client";
import React, { useState } from "react";
import { clientEnv } from "@recnet/recnet-web/clientEnv";

const IS_SERVER = typeof window === "undefined";
function getURL(path: string) {
  const baseURL = IS_SERVER
    ? clientEnv.NEXT_PUBLIC_BASE_URL
    : window.location.origin;
  return new URL(path, baseURL).toString();
}

export function Provider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({}));
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [httpBatchLink({ url: getURL("/api/trpc") })],
    })
  );

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpc.Provider>
  );
}
