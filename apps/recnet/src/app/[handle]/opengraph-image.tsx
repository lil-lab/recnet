import { ImageResponse } from "next/og";

import { serverClient } from "@recnet/recnet-web/app/_trpc/serverClient";
import { cn } from "@recnet/recnet-web/utils/cn";

// Image metadata
export const alt = "User Profile";
export const size = {
  width: 160,
  height: 160,
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

  return new ImageResponse(
    (
      // ImageResponse JSX element
      <div tw={cn("flex w-full h-full justify-center items-center")}>
        {/* eslint-disable-next-line */}
        <img
          src={user?.photoUrl ?? "https://imgur.com/jVp1pG1.png"}
          tw="w-[160px] h-[160px] rounded-full"
          alt={"User Profile Picture"}
        />
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
