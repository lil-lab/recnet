"use client";

// this page must not be server-side rendered since we need to get the client's local time
import { cn } from "@recnet/recnet-web/utils/cn";
import {
  getNextCutOff,
  getVerboseDateString,
} from "@recnet/recnet-web/utils/date";
import { Text } from "@radix-ui/themes";
import * as React from "react";

const faqs: {
  title: string;
  content: () => React.ReactNode;
}[] = [
  {
    title: "How does RecNet work?",
    content: () => {
      return (
        <div>
          <Text>
            {
              "Each user may recommend one paper per cycle. They may change the paper they recommend each cycle as many times as they want during the cycle (i.e, before the cutoff time). A recommendation is made out of (a) a link to the paper, (b) paper title and authors, (c) a very short tl;dr message of 280 characters."
            }
          </Text>
          <div className="w-full flex justify-start mt-6">
            <iframe
              src="https://www.youtube.com/embed/qpEvFhNqrn8?si=mi23tRg6Z9N8M2q9"
              title="YouTube video player"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="w-full md:w-[95%] aspect-[560/315]"
            ></iframe>
          </div>
        </div>
      );
    },
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
            {faq.content()}
          </Text>
        </React.Fragment>
      ))}
    </div>
  );
}
