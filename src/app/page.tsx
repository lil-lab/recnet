import { Flex, Text, Button } from "@radix-ui/themes";

export default function Home() {
  return (
    <div>
      <Flex direction="column" gap="2">
        <Text>Hello from Radix Themes :)</Text>
        <Button className="hover:scale-150">Lets go</Button>
      </Flex>
    </div>
  );
}
