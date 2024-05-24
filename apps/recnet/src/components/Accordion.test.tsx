import userEvent from "@testing-library/user-event";
import { describe, expect, test } from "vitest";

import { Accordion } from "./Accordion";

import { render, screen } from "../test/test-utils";

describe("Accordion", () => {
  const title = "Title";
  const content = "Content";
  const user = userEvent.setup();
  render(<Accordion title={title}>{content}</Accordion>);

  test("Should be able to open Accordion", async () => {
    const button = screen.getByTestId("accordion-header");
    await user.click(button);
    const accordionContent = screen.queryByTestId("accordion-content");

    expect(accordionContent).toBeDefined();
  });

  test("Should be able to close Accordion", async () => {
    const button = screen.getByTestId("accordion-header");
    await userEvent.click(button);
    // wait for the closing animation to finish
    await new Promise((resolve) => setTimeout(resolve, 500));
    const accordionContent = screen.queryByTestId("accordion-content");

    expect(accordionContent).toBeNull();
  });
});
