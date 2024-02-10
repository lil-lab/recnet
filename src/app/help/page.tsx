import { cn } from "@/utils/cn";
import { getNextCutOff, getVerboseDateString } from "@/utils/date";
import { Text } from "@radix-ui/themes";
import * as React from "react";

const faqs: {
  title: string;
  content: string | (() => string);
}[] = [
  {
    title: "How does RecNet work?",
    content:
      "Each user may recommend one paper per cycle. They may change the paper they recommend each cycle as many times as they want during the cycle (i.e, before the cutoff time). A recommendation is made out of (a) a link to the paper, (b) paper title and authors, (c) a very short tl;dr message of 280 characters.",
  },
  {
    title: "Cycle",
    content: () => {
      const nextCutOff = getNextCutOff();
      return `The cutoff time of each cycle is 11:59:59 PM GMT on each Tuesday. The next cutoff in your local time: ${getVerboseDateString(nextCutOff)}.`;
    },
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
        Help
      </Text>
      {faqs.map((faq) => (
        <React.Fragment key={faq.title}>
          <Text className="text-gray-12" size="7" weight="medium">
            {faq.title}
          </Text>
          <Text className="text-gray-11" size="4">
            {typeof faq.content === "string" ? faq.content : faq.content()}
          </Text>
        </React.Fragment>
      ))}
    </div>
  );
}
