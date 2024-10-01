import { ImageResponse } from "next/og";

import { serverClient } from "@recnet/recnet-web/app/_trpc/serverClient";
import { cn } from "@recnet/recnet-web/utils/cn";

// Image metadata
export const alt = "User Profile";
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

/**
  Styling: You can write Tailwind CSS via "tw" prop here.
  However, our radix-theme preset won't be available here.
  Therefore, only default Tailwind CSS classes are available.
*/
export default async function Image({
  params,
}: {
  params: { handle: string };
}) {
  const { handle } = params;

  const { user } = await serverClient.getUserByHandle({
    handle,
  });

  console.log(user);

  if (!user) {
    throw new Error("User not found");
  }

  return new ImageResponse(
    (
      // ImageResponse JSX element
      <div
        tw={cn(
          "flex flex-col justify-start bg-white w-full h-full",
          "p-8",
          "gap-y-2",
          "text-[32px]"
        )}
      >
        <div tw="flex flex-row items-center">
          {/* eslint-disable-next-line */}
          <img
            src={"https://imgur.com/jVp1pG1.png"}
            tw="w-10 h-10 mr-4"
            alt={"recnet-logo"}
          />
          <p tw={cn("text-[24px] text-[#0090FF]")}> RecNet </p>
        </div>
        <div tw={cn("flex flex-row justify-between")}>
          <div tw={cn("flex flex-col gap-y-2", "w-[65%]")}>
            <p>
              {user?.displayName}{" "}
              <span tw="text-gray-600 mx-1 text-[32px]">(@{user.handle})</span>
            </p>
            <div tw="whitespace-pre-line text-[24px] text-gray-600">
              {user.bio}
            </div>
          </div>
          {/* eslint-disable-next-line */}
          <img
            src={user?.photoUrl ?? "https://imgur.com/jVp1pG1.png"}
            tw="w-[120px] h-[120px] rounded-full mx-8"
            alt={"User Profile Picture"}
          />
        </div>
        <p tw="text-[18px] text-gray-500">
          <span>
            {user.numFollowers} follower{user.numFollowers > 1 ? "s" : ""}
          </span>
          <span tw="mx-4"> • </span>
          <span>
            {user.numRecs} Rec{user.numRecs > 1 ? "s" : ""}
          </span>
        </p>
      </div>
    ),
    // ImageResponse options
    {
      // For convenience, we can re-use the exported opengraph-image
      // size config to also set the ImageResponse's width and height.
      ...size,
    }
  );
}
