"use client";
import { Button } from "@radix-ui/themes";
import { useGoogleLogin } from "@recnet/recnet-web/firebase/auth";

export function LoginButton() {
  const { login } = useGoogleLogin();
  return (
    <Button
      size="4"
      className="cursor-pointer"
      onClick={async () => {
        await login();
      }}
    >
      Log In
    </Button>
  );
}
