import { Link as RadixLink } from "@radix-ui/themes";
import Link, { LinkProps } from "next/link";
import React from "react";

type RecNetLinkProps = {
  radixLinkProps?: React.ComponentProps<typeof RadixLink>;
  nextLinkProps?: LinkProps;
  href: string;
  children: React.ReactNode;
};

// combine Radix-theme's Link and Nextjs's Link
export function RecNetLink(props: RecNetLinkProps) {
  const { href, children, ...rest } = props;
  const { radixLinkProps, nextLinkProps } = rest;
  return (
    <RadixLink asChild {...radixLinkProps}>
      <Link href={href} {...nextLinkProps}>
        {children}
      </Link>
    </RadixLink>
  );
}
