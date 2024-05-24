import { Theme } from "@radix-ui/themes";
import { render, RenderOptions } from "@testing-library/react";
import { ThemeProvider } from "next-themes";
import React, { ReactElement } from "react";

import { Provider as TrpcProvider } from "@recnet/recnet-web/app/_trpc/Provider";

const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <html lang="en" suppressHydrationWarning>
      <TrpcProvider>
        <ThemeProvider attribute="class">
          <Theme accentColor="blue">{children}</Theme>
        </ThemeProvider>
      </TrpcProvider>
    </html>
  );
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper">
) => render(ui, { wrapper: AllTheProviders, ...options });

export * from "@testing-library/react";
export { customRender as render };
