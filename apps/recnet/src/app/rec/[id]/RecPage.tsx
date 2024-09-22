import { Flex, Text } from "@radix-ui/themes";

import { serverClient } from "@recnet/recnet-web/app/_trpc/serverClient";
import { Avatar } from "@recnet/recnet-web/components/Avatar";
import { GoBackButton } from "@recnet/recnet-web/components/GoBackButton";
import { RecNetLink } from "@recnet/recnet-web/components/Link";
import { LinkPreview } from "@recnet/recnet-web/components/LinkPreview";
import { SelfRecBadge } from "@recnet/recnet-web/components/SelfRecBadge";
import { cn } from "@recnet/recnet-web/utils/cn";

import { formatDate } from "@recnet/recnet-date-fns";

const fallbackImage =
  "https://recnet.io/_next/image?url=%2Frecnet-logo.webp&w=64&q=100";

/**
    Page for a single recommendation
*/
export async function RecPage(props: { id: string }) {
  const { id } = props;

  const { rec } = await serverClient.getRecById({
    id,
  });
  const linkPreviewMetadata = await serverClient.getLinkPreviewMetadata({
    url: rec.article.link,
  });

  return (
    <div
      className={cn(
        "w-full",
        "lg:w-[35%]",
        "sm:w-[60%]",
        `min-h-[90svh]`,
        "flex",
        "flex-col",
        "p-8",
        "gap-y-6"
      )}
    >
      <div className="flex flex-col gap-y-4 py-4 px-2 mt-10">
        <GoBackButton />
        <Flex className="items-center gap-x-2">
          <Avatar user={rec.user} size={"3"} />
          <Text size="2" className="text-gray-11">
            <RecNetLink
              href={`/${rec.user.handle}`}
              radixLinkProps={{
                className: "font-bold",
              }}
            >
              {rec.user.displayName}
            </RecNetLink>{" "}
            {formatDate(new Date(rec.cutoff))}
          </Text>
          {rec.isSelfRec ? <SelfRecBadge /> : null}
        </Flex>
        <Text size="3" className="text-gray-11">
          {rec.description}
        </Text>
        <LinkPreview
          url={rec.article.link}
          title={rec.article.title}
          description={rec.article.author}
          imageUrl={
            linkPreviewMetadata?.logo?.url ||
            linkPreviewMetadata?.image?.url ||
            fallbackImage
          }
        />
      </div>
    </div>
  );
}
