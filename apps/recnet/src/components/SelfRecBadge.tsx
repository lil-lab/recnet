import { Tooltip, Badge } from "@radix-ui/themes";

export function SelfRecBadge() {
  return (
    <Tooltip content="This recommendation was made by the same person who wrote the article.">
      <Badge color="orange" className="cursor-pointer">
        Self Rec
      </Badge>
    </Tooltip>
  );
}
