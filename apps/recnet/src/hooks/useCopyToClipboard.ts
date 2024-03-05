import { useCallback, useState } from "react";

// ref: https://github.com/juliencrn/usehooks-ts/blob/master/packages/usehooks-ts/src/useCopyToClipboard/useCopyToClipboard.ts
type CopiedValue = string | null;
type CopyFn = (text: string) => Promise<boolean>;

export function useCopyToClipboard() {
  const [copiedText, setCopiedText] = useState<CopiedValue>(null);

  const copy: CopyFn = useCallback(async (text) => {
    if (!navigator?.clipboard) {
      console.warn("Clipboard not supported");
      return false;
    }

    // Try to save to clipboard then save it in the state if worked
    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(text);
      return true;
    } catch (error) {
      console.warn("Copy failed", error);
      setCopiedText(null);
      return false;
    }
  }, []);

  return {
    copiedText,
    copy,
  };
}
