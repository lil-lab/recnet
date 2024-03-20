import { toast } from "sonner";
import useSWR from "swr";

import { Rec, RecSchema } from "@recnet/recnet-web/types/rec";
import { fetchWithZod } from "@recnet/recnet-web/utils/zodFetch";

export function useRec(
  recId: string | null,
  options?: {
    readonly onSuccessCallback?: (
      data: Rec,
      key: string,
      config: unknown
    ) => void;
    readonly onErrorCallback?: (
      error: unknown,
      key: string,
      config: unknown
    ) => void;
  }
) {
  const onSuccessCallback = options?.onSuccessCallback;
  const onErrorCallback = options?.onErrorCallback;
  const { data, error, mutate, isValidating } = useSWR(
    recId ? `/api/recById?id=${recId}` : null,
    async (url) => {
      const res = await fetchWithZod(RecSchema, url);
      return res;
    },
    {
      onSuccess: async (data, key, config) => {
        await onSuccessCallback?.(data, key, config);
      },
      onError: (error, key, config) => {
        if (onErrorCallback === undefined) {
          toast.error("Error fetching Rec");
        } else {
          onErrorCallback(error, key, config);
        }
      },
    }
  );

  return {
    rec: data ?? null,
    isLoading: !error && !data && !(recId === null || recId === undefined),
    isError: error,
    mutate,
    isValidating,
  };
}
