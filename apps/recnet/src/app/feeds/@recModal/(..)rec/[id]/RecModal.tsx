"use client";
import { Cross1Icon } from "@radix-ui/react-icons";
import { Dialog, Button } from "@radix-ui/themes";
import { useRouter } from "next/navigation";

export function RecModal(props: { children: React.ReactNode }) {
  const router = useRouter();

  const onCloseModal = () => {
    router.back();
  };

  return (
    <Dialog.Root
      defaultOpen
      onOpenChange={(open) => {
        if (!open) {
          onCloseModal();
        }
      }}
    >
      <Dialog.Content
        maxWidth={{
          initial: "500px",
          md: "700px",
        }}
        className="relative"
      >
        <Dialog.Close className="absolute top-6 right-4 hidden md:block">
          <Button variant="soft" color="gray" className="cursor-pointer">
            <Cross1Icon />
          </Button>
        </Dialog.Close>
        {props.children}
      </Dialog.Content>
    </Dialog.Root>
  );
}
