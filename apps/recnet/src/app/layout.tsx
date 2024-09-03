import { GoogleAnalytics } from "@next/third-parties/google";
import { Theme } from "@radix-ui/themes";
import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";

import { Footer } from "@recnet/recnet-web/app/Footer";
import { Headerbar } from "@recnet/recnet-web/app/Headerbar";
import { clientEnv } from "@recnet/recnet-web/clientEnv";
import { getUserServerSide } from "@recnet/recnet-web/utils/getUserServerSide";

import { AuthProvider } from "./AuthProvider";
import { HistoryProvider } from "./HistoryProvider";
import "@radix-ui/themes/styles.css";
import "tailwindcss/tailwind.css";
import { MobileNavigator } from "./MobileNavigator";
import { ProgressbarProvider } from "./Progressbar";
import { Provider as TrpcProvider } from "./_trpc/Provider";

export const metadata: Metadata = {
  title: "RecNet",
  description: "Receive weekly paper recs from researchers you follow",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getUserServerSide();
  return (
    <html lang="en" suppressHydrationWarning>
      {clientEnv.NEXT_PUBLIC_ENV === "production" ? (
        <GoogleAnalytics
          gaId={clientEnv.NEXT_PUBLIC_GA_TRACKING_ID as string}
        />
      ) : null}
      <body>
        <TrpcProvider>
          <ProgressbarProvider>
            <AuthProvider serverUser={user}>
              <HistoryProvider>
                <ThemeProvider attribute="class">
                  <Theme accentColor="blue">
                    <Headerbar />
                    <Toaster position="top-right" richColors offset={80} />
                    <div className="min-h-[90svh] flex justify-center">
                      {children}
                    </div>
                    <Footer />
                    <MobileNavigator />
                  </Theme>
                </ThemeProvider>
              </HistoryProvider>
            </AuthProvider>
          </ProgressbarProvider>
        </TrpcProvider>
      </body>
    </html>
  );
}
