import useSWR from "swr";
import { fetchWithZod } from "@/utils/zodFetch";
import { inviteCodeSchema } from "@/types/inviteCode";
import { toast } from "sonner";
import { z } from "zod";

const InviteCodesSchema = z.object({
  inviteCodes: z.array(inviteCodeSchema),
});

type InviteCodes = z.infer<typeof InviteCodesSchema>;

export function useInviteCodes(options?: {
  readonly onSuccessCallback?: (
    data: InviteCodes,
    key: string,
    config: unknown
  ) => void;
  readonly onErrorCallback?: (
    error: unknown,
    key: string,
    config: unknown
  ) => void;
}) {
  const onSuccessCallback = options?.onSuccessCallback;
  const onErrorCallback = options?.onErrorCallback;
  const { data, error, mutate } = useSWR(
    `/api/inviteCodes`,
    async (url) => {
      const res = await fetchWithZod(InviteCodesSchema, url);
      return res;
    },
    {
      onSuccess: async (data, key, config) => {
        await onSuccessCallback?.(data, key, config);
      },
      onError: (error, key, config) => {
        toast.error("Error fetching user");
        onErrorCallback?.(error, key, config);
      },
    }
  );

  return {
    inviteCodes: data?.inviteCodes,
    isLoading: !error && !data,
    isError: error,
    mutate,
  };
}
