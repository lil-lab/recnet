"use client";
import { Link2Icon } from "@radix-ui/react-icons";
import { Button, Tooltip } from "@radix-ui/themes";
import { toast } from "sonner";

import { useCopyToClipboard } from "@recnet/recnet-web/hooks/useCopyToClipboard";

export function LinkCopyButton(props: { link: string }) {
  const { copy } = useCopyToClipboard();
  const { link } = props;

  return (
    <Tooltip content="Share the link of rec!">
      <Button
        variant="ghost"
        color="gray"
        className="cursor-pointer p-1 mx-0"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          copy(link).then(() => {
            toast.success("Link copied to clipboard");
          });
        }}
      >
        <Link2Icon />
      </Button>
    </Tooltip>
  );
}
