import { Flex, Text, Link as RadixLink } from "@radix-ui/themes";

import { RecNetLink } from "@recnet/recnet-web/components/Link";
import { cn } from "@recnet/recnet-web/utils/cn";

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
        RecNet is a human-driven recommendation system for academic readings.
        RecNet implements a mechanism similar to contemporary social networks,
        but it is designed to be impoverished in certain ways through
        information bottlenecks that increase communication cost. This is
        intended to limit the amount of time the system consumes from its users,
        while increasing the quality of information passed. The RecNet mechanism
        was initially outlined{" "}
        <RadixLink
          href="https://yoavartzi.substack.com/p/a-quick-sketch-of-a-human-based-paper"
          target="_blank"
        >
          here
        </RadixLink>
        . RecNet is currently in initial development stages.
      </Text>
      <Text className="text-gray-11" size="5">
        The <RecNetLink href="/help">Help page</RecNetLink> includes
        instructions on how to get started, including a short introduction
        video.
      </Text>
      <Text size="7" className="text-gray-12" weight="bold">
        Team
      </Text>
      <div className="flex flex-col gap-y-3">
        {teamMembers.map((member) => (
          <Flex key={member.name} className="gap-x-2 p-1">
            <Text size="3" className="text-gray-12" weight="medium">
              {member.name}
            </Text>
            <RecNetLink
              href={member.website}
              radixLinkProps={{ underline: "always", target: "_blank" }}
            >
              <Text>website</Text>
            </RecNetLink>
            {member.username ? (
              <RecNetLink
                href={`/${member.username}`}
                radixLinkProps={{ underline: "always" }}
              >
                <Text>profile</Text>
              </RecNetLink>
            ) : null}
          </Flex>
        ))}
      </div>
      <Text size="7" className="text-gray-12" weight="bold">
        Acknowledgements
      </Text>
      <ol className="list-decimal list-inside text-gray-11">
        <li>Thank you to arXiv for use of its open access interoperability.</li>
      </ol>
    </div>
  );
}
