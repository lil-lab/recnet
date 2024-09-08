import { Theme } from "@radix-ui/themes";
import { render, RenderOptions } from "@testing-library/react";
import { ThemeProvider } from "next-themes";
import React, { ReactElement } from "react";

const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <html lang="en" suppressHydrationWarning>
      <ThemeProvider attribute="class">
        <Theme accentColor="blue">{children}</Theme>
      </ThemeProvider>
    </html>
  );
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper">
) => render(ui, { wrapper: AllTheProviders, ...options });

export * from "@testing-library/react";
export { customRender as render };
