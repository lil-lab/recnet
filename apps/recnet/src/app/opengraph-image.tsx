import { ImageResponse } from "next/og";

import { cn } from "@recnet/recnet-web/utils/cn";

// Image metadata
export const alt = "RecNet";
export const size = {
  width: 1600,
  height: 900,
};

export const contentType = "image/png";

/**
  Styling: You can write Tailwind CSS via "tw" prop here.
  However, our radix-theme preset won't be available here.
  Therefore, only default Tailwind CSS classes are available.
*/
export default async function Image() {
  return new ImageResponse(
    (
      // ImageResponse JSX element
      <div
        tw={cn(
          "flex flex-col justify-center items-center h-full w-full bg-white",
          "p-8",
          "gap-y-2",
          "text-[48px]"
        )}
      >
        <div tw="flex flex-row items-center mx-auto">
          {/* eslint-disable-next-line */}
          <img
            src={"https://imgur.com/jVp1pG1.png"}
            tw="w-[200px] h-[200px] mr-4"
            alt={"recnet-logo"}
          />
          <div tw="flex flex-col gap-y-2 text-[#0090FF] ml-8 justify-center">
            <div tw={cn("text-[64px]")}>RecNet</div>
            <div tw="text-[20px]">
              {"Receive weekly paper recs from researchers you follow"}
            </div>
          </div>
        </div>
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
