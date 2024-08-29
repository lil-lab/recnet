import { Text, Button } from "@radix-ui/themes";
import Link from "next/link";
import { redirect } from "next/navigation";

import { cn } from "@recnet/recnet-web/utils/cn";
import { getUserServerSide } from "@recnet/recnet-web/utils/getUserServerSide";

import { LoginButton } from "./LoginButton";

import { AnnouncementCard } from "../components/AnnouncementCard";
import { RecNetLink } from "../components/Link";

const cards = [
  {
    icon: "📬",
    title: "Expert-Curated Recommendations",
    desc: "Receive weekly, high-quality paper recommendations from trusted academic peers!",
  },
  {
    icon: "📅",
    title: "Structured Discovery Cycle",
    desc: "Enjoy a regular, manageable influx of new content with our organized weekly cycle.",
  },
  {
    icon: "💭",
    title: "Focused Communication",
    desc: "Access concise summaries and recommendations without the clutter of comments or likes.",
  },
];

export default async function Home() {
  await getUserServerSide({
    isLoggedInCallback: () => {
      redirect("/feeds");
    },
  });

  return (
    <div
      className={cn(
        "w-full",
        "lg:w-[60%]",
        `min-h-[90svh]`,
        "flex",
        "flex-col",
        "justify-center",
        "items-center",
        "gap-y-6",
        "py-8",
        "px-4"
      )}
    >
      <AnnouncementCard
        id="invite-only"
        className="w-[95%] sm:w-[75%] md:w-full sm:mt-4 mb-8"
        title={"Invite Only"}
        allowClose={false}
        content={
          <Text>
            RecNet is under early development. Signing up requires an invite
            code. You can request one by filling this{" "}
            <RecNetLink href="https://forms.gle/pBzfxvLifZkrVz1J7">
              form
            </RecNetLink>
            .
          </Text>
        }
      />

      <Text
        className={cn(
          "text-[60px]",
          "leading-[48px]",
          "sm:text-[72px]",
          "sm:leading-[60px]",
          "font-bold",
          "w-fit",
          "h-fit",
          "bg-gradient-to-b",
          "from-[#3A5CCC]",
          "to-[#7CE2FE]",
          "to-[99%]",
          "text-transparent",
          "bg-clip-text",
          "text-center"
        )}
      >
        Welcome to RecNet
      </Text>
      <Text
        size={{
          initial: "5",
          sm: "6",
        }}
        className="text-gray-11 text-center w-[80%]"
      >
        Receive weekly paper recs from researchers you follow.
      </Text>
      <div className="w-[90%] sm:w-[55%] flex justify-start mt-6">
        <iframe
          src="https://www.youtube.com/embed/Sl7CKRwcX1s?si=IBLh-ibnEFN1lALz"
          title="YouTube video player"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="w-full aspect-[560/315]"
        ></iframe>
      </div>
      <div className="flex flex-row gap-x-3 px-3">
        <LoginButton />
        <Button size="4" variant="outline" asChild className="cursor-pointer">
          <Link href="/about">Learn more</Link>
        </Button>
      </div>

      <div
        className={cn(
          "py-6",
          "gap-6",
          "flex",
          "flex-col",
          "sm:flex-row",
          "px-10"
        )}
      >
        {cards.map((card) => (
          <div
            key={card.title}
            className={cn(
              "flex-col",
              "flex",
              "gap-y-3",
              "p-6",
              "border-[1px]",
              "border-slate-5",
              "rounded-4",
              "w-auto"
            )}
          >
            <div className="bg-gray-4 rounded-3 w-[50px] aspect-square flex justify-center items-center">
              <Text size="8">{card.icon}</Text>
            </div>
            <Text size="4" className="text-gray-11" weight="medium">
              {card.title}
            </Text>
            <Text size="3" className="text-gray-10">
              {card.desc}
            </Text>
          </div>
        ))}
      </div>
    </div>
  );
}
