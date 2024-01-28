import { cn } from "@/utils/cn";
import { Flex, Text, Link as RadixLink } from "@radix-ui/themes";
import Link from "next/link";

const teamMembers: {
  name: string;
  website: string;
  username?: string;
}[] = [
  {
    name: "Yoav Artzi",
    website: "https://yoavartzi.com/",
    username: "yoav",
  },
  {
    name: "Frank Hsu",
    website: "https://swh00tw.me",
    username: "swh00tw",
  },
  {
    name: "Joanne Chen",
    website: "https://joannechen1223.github.io/",
  },
  {
    name: "Anya Ji",
    website: "https://anya-ji.github.io/",
    username: "anya",
  },
  {
    name: "Valene Tjong",
    website: "https://www.linkedin.com/in/valene-tjong/",
    username: "vtjong",
  },
];

export default function AboutPage() {
  return (
    <div
      className={cn(
        "w-full",
        "lg:w-[60%]",
        `min-h-[90svh]`,
        "flex",
        "flex-col",
        "p-8",
        "gap-y-6"
      )}
    >
      <Text size="8" className="text-gray-12" weight="bold">
        About RecNet
      </Text>
      <Text className="text-gray-11" size="5">
        Recnet is a human-driven recommendation system for academic readings.
        Recnet implements a mechanism similar to contemporary social networks,
        but it is designed to be impoverished in certain ways through
        information bottlenecks that increase communication cost. This is
        intended to limit the amount of time the system consumes from its users,
        while increasing the quality of information passed. The Recnet mechanism
        was initially outlined by Yoav Artzi in a Substack post. Recnet is
        currently in initial development stages.
      </Text>
      <div className="w-full flex justify-start">
        <iframe
          src="https://www.youtube.com/embed/qpEvFhNqrn8?si=mi23tRg6Z9N8M2q9"
          title="YouTube video player"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="w-full md:w-[95%] aspect-[560/315]"
        ></iframe>
      </div>
      <div className="h-[2px] bg-gray-8 w-full" />
      <Text size="8" className="text-gray-12" weight="bold">
        Team
      </Text>
      <div className="flex flex-col gap-y-3 p-1">
        {teamMembers.map((member) => (
          <Flex key={member.name} className="gap-x-2 p-1">
            <Text size="3" className="text-gray-12" weight="medium">
              {member.name}
            </Text>
            <RadixLink asChild underline="always">
              <Link href={member.website} target="_blank">
                <Text>website</Text>
              </Link>
            </RadixLink>
            {member.username ? (
              <RadixLink asChild underline="always">
                <Link href={`/user/${member.username}`}>
                  <Text>profile</Text>
                </Link>
              </RadixLink>
            ) : null}
          </Flex>
        ))}
      </div>
    </div>
  );
}
