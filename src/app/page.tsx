"use client";

import { useAuth } from "@/app/AuthContext";
import { cn } from "@/utils/cn";
import { Text, Button } from "@radix-ui/themes";
import { useGoogleLogin } from "@/firebase/auth";
import Link from "next/link";

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

export default function Home() {
  const { user } = useAuth();
  const { login } = useGoogleLogin();

  if (!user) {
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
        <Text
          className={cn(
            "text-[72px]",
            "leading-[60px]",
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
        <Text size="7" className="text-gray-11 text-center">
          Receive weekly paper recs from researchers you followed.
        </Text>
        <div className="flex flex-row gap-x-3 px-3">
          <Button
            size="4"
            onClick={async () => {
              await login();
            }}
          >
            Log In
          </Button>
          <Link href="/about">
            <Button size="4" variant="outline">
              Learn more
            </Button>
          </Link>
        </div>
        <div
          className={cn(
            "py-6",
            "gap-6",
            "flex",
            "flex-col",
            "md:flex-row",
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
  return (
    <div>
      <h1>Hi {user.displayName}</h1>
    </div>
  );
}
