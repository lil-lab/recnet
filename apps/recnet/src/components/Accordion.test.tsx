import { describe, test } from "vitest";

import { Accordion } from "./Accordion";

import { render, screen } from "../test/test-utils";

test("Render Accordion", () => {
  const title = "Title";
  const content = "Content";
  render(<Accordion title={title}>{content}</Accordion>);
});
