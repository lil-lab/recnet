"use client";
import { trpc } from "../_trpc/client";

export default function TestPage() {
  const { data, isLoading } = trpc.search.useQuery({
    keyword: "",
  });

  console.log({
    data,
    isLoading,
  });
  return <div>Test</div>;
}
