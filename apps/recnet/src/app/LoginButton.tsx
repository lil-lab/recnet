"use client";
import { Button } from "@radix-ui/themes";
import { useGoogleLogin } from "@/firebase/auth";

export function LoginButton() {
  const { login } = useGoogleLogin();
  return (
    <Button
      size="4"
      onClick={async () => {
        await login();
      }}
    >
      Log In
    </Button>
  );
}
