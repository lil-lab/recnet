import { ImageResponse } from "next/og";

import { serverClient } from "@recnet/recnet-web/app/_trpc/serverClient";

// export const runtime = "edge";

// Image metadata
export const alt = "RecNet Recommendation";
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

// Image generation
export default async function Image({ params }: { params: { id: string } }) {
  const { id } = params;

  const { rec } = await serverClient.getRecById({
    id,
  });

  console.log(rec);

  return new ImageResponse(
    (
      // ImageResponse JSX element
      <div
        style={{
          fontSize: 48,
          background: "white",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {rec.article.title}
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
