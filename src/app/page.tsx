"use client";

import { useAuth } from "@/app/AuthContext";

export default function Home() {
  const { user } = useAuth();
  return <div>{user ? `Hi, ${user.displayName}` : "Not Logged In "}</div>;
}
