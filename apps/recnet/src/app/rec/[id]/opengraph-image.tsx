import { ImageResponse } from "next/og";

import { serverClient } from "@recnet/recnet-web/app/_trpc/serverClient";
import { cn } from "@recnet/recnet-web/utils/cn";

import { formatDate } from "@recnet/recnet-date-fns";

// Image metadata
export const alt = "RecNet Recommendation";
export const size = {
  width: 1600,
  height: 900,
};

export const contentType = "image/png";

const fallbackImage =
  "https://recnet.io/_next/image?url=%2Frecnet-logo.webp&w=64&q=100";

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
  const linkPreviewMetadata = await serverClient.getLinkPreviewMetadata({
    url: rec.article.link,
  });

  return new ImageResponse(
    (
      // ImageResponse JSX element
      <div
        tw={cn(
          "flex flex-col justify-start h-full w-full bg-white",
          "py-8",
          "gap-y-2",
          "text-[48px]"
        )}
      >
        <div tw="flex flex-row items-center px-8">
          {/* eslint-disable-next-line */}
          <img
            src={"https://imgur.com/jVp1pG1.png"}
            tw="w-10 h-10 mr-4"
            alt={"recnet-logo"}
          />
          <p tw={cn("text-[32px] text-[#0090FF]")}> RecNet </p>
        </div>
        <div tw="flex flex-col justify-start px-8 w-[1600px]">
          <div tw="flex flex-row items-center">
            {/* eslint-disable-next-line */}
            <img
              src={rec.user.photoUrl}
              tw="w-10 h-10 rounded-full mr-4"
              alt={rec.user.displayName}
            />
            <p tw="text-[24px] text-gray-600">
              <span tw="mr-2 text-[#0090FF] font-bold">{`${rec.user.displayName}`}</span>
              {formatDate(new Date(rec.cutoff))}
            </p>
          </div>
          <p tw="text-[24px] text-gray-600 px-2 mb-12 mt-0">
            {rec.description}
          </p>
          <div tw="flex flex-row items-center my-4 rounded-[16px] border-[1px] border-[#D9D9D9] text-gray-11">
            <div tw="aspect-square w-auto max-w-[200px] h-full flex items-center justify-center">
              {/* eslint-disable-next-line */}
              <img
                src={
                  linkPreviewMetadata?.logo?.url ||
                  linkPreviewMetadata?.image?.url ||
                  fallbackImage
                }
                alt={"link-metadata-logo"}
                tw={cn("object-contain", "p-4", "min-w-[120px] max-w-[150px]")}
              />
            </div>
            <div tw="flex flex-col p-3 justify-between h-full w-min gap-y-2 pr-2 text-wrap text-gray-600 text-[16px] border-l-[1px] border-[#D9D9D9]">
              <p tw="text-gray-900 text-[24px]">{rec.article.title}</p>
              <p>{rec.article.author}</p>
              <p>{rec.article.link.replace("https://", "").split("/")[0]}</p>
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
