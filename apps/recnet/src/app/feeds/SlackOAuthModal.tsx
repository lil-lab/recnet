"use client";
import { Button, Dialog } from "@radix-ui/themes";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";

/**
 * Modal to display the result of slack OAuth flow
 */
export function SlackOAuthModal() {
  const [shouldShow, setShouldShow] = useState(false);
  const [oauthStatus, setOAuthStatus] = useState<"success" | "error" | null>(
    null
  );
  const pathname = usePathname();
  const router = useRouter();

  const searchParams = useSearchParams();

  useEffect(() => {
    const status = searchParams.get("slackOAuthStatus");
    if (status) {
      setShouldShow(true);
      setOAuthStatus(status as "success" | "error");
    }
  }, [searchParams]);

  if (!shouldShow || !oauthStatus) {
    return null;
  }

  return (
    <Dialog.Root
      open={shouldShow}
      onOpenChange={(open) => {
        // when closed, remove the search param
        if (!open) {
          router.replace(pathname);
        }
        setShouldShow(open);
      }}
    >
      <Dialog.Content
        maxWidth={{ initial: "450px", md: "450px" }}
        style={{
          maxHeight: "75vh",
          padding: "0",
        }}
      >
        <div className="flex flex-col px-6 pb-6 pt-8">
          <Dialog.Title>
            {oauthStatus === "success"
              ? "✅ You are all set!"
              : "❌ Slack OAuth flow failed"}
          </Dialog.Title>
          <Dialog.Description className="text-gray-11" size="2">
            {oauthStatus === "success"
              ? "Successfully installed the Slack app! You can now receive message from us in your workspace."
              : searchParams.get("error_description") ||
                "Slack OAuth flow failed. Please try again or contact us."}
          </Dialog.Description>
          <div className="flex flex-row justify-end items-center mt-8">
            <Button
              className="mr-4"
              onClick={() => {
                setShouldShow(false);
                router.replace(pathname);
              }}
            >
              {oauthStatus === "success" ? "Got it!" : "Close"}
            </Button>
          </div>
        </div>
      </Dialog.Content>
    </Dialog.Root>
  );
}
