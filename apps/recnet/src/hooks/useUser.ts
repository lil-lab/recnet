import { toast } from "sonner";
import useSWR from "swr";

import { UserSchema, User } from "@recnet/recnet-web/types/user";
import { fetchWithZod } from "@recnet/recnet-web/utils/zodFetch";

export function useUser(
  username: string | null,
  options?: {
    readonly onSuccessCallback?: (
      data: User,
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
    username ? `/api/userByUsername?username=${username}` : null,
    async (url) => {
      const res = await fetchWithZod(UserSchema, url);
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
    user: data,
    isLoading:
      !error && !data && !(username === null || username === undefined),
    isError: error,
    mutate,
  };
}
