import useSWR from "swr";
import { fetchWithZod } from "@/utils/zodFetch";
import { Rec, RecSchema } from "@/types/rec";
import { toast } from "sonner";

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
  const { data, error, mutate } = useSWR(
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
        toast.error("Error fetching Rec");
        console.log("Error fetching Rec: ", error);
        onErrorCallback?.(error, key, config);
      },
    }
  );

  return {
    rec: data ?? null,
    isLoading: !error && !data && !(recId === null || recId === undefined),
    isError: error,
    mutate,
  };
}
