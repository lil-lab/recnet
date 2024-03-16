"use client";
import { trpc } from "../_trpc/client";

export default function TestPage() {
  const data = trpc.hello.useQuery();

  console.log(data.data);
  return <div>Test</div>;
}
