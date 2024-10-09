import { ImageResponse } from "next/og";

import { serverClient } from "@recnet/recnet-web/app/_trpc/serverClient";
import { cn } from "@recnet/recnet-web/utils/cn";

import { formatDate } from "@recnet/recnet-date-fns";

// Image metadata
export const alt = "RecNet Recommendation";
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
export default async function Image({ params }: { params: { id: string } }) {
  const { id } = params;

  const { rec } = await serverClient.getRecById({
    id,
  });

  return new ImageResponse(
    (
      // ImageResponse JSX element
      <div
        tw={cn(
          "flex flex-col justify-start h-full bg-white",
          "p-8",
          "gap-y-2",
          "text-[48px]"
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
        <div tw="font-medium">{rec.article.title}</div>
        <p tw="text-[24px] text-gray-700">{rec.description} </p>
        <p tw={cn("text-[18px] text-gray-600")}>{rec.article.author} </p>
        <div
          tw={cn(
            "flex flex-row items-center",
            "mt-auto",
            "text-gray-600 text-[24px]"
          )}
        >
          {/* eslint-disable-next-line */}
          <img
            src={rec.user.photoUrl}
            tw="w-12 h-12 rounded-full mr-4"
            alt={rec.user.displayName}
          />
          <span tw="self-center">{`${rec.user.displayName} · ${formatDate(new Date(rec.cutoff))}`}</span>
          {rec.isSelfRec ? (
            <div tw="ml-4 bg-[#FFEFDD] text-[#D14E00] rounded-md px-2 py-1 text-[16px] font-medium w-fit max-w-fit">
              Self Rec
            </div>
          ) : null}
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
