import { GoogleAnalytics } from "@next/third-parties/google";
import { Theme } from "@radix-ui/themes";
import type { Metadata } from "next";
import localFont from "next/font/local";
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

const sfpro = localFont({
  src: [
    {
      path: "../fonts/SF-Pro-Text-Black.otf",
      weight: "900",
      style: "normal",
    },
    {
      path: "../fonts/SF-Pro-Text-Heavy.otf",
      weight: "800",
      style: "normal",
    },
    {
      path: "../fonts/SF-Pro-Text-Bold.otf",
      weight: "700",
      style: "normal",
    },
    {
      path: "../fonts/SF-Pro-Text-Semibold.otf",
      weight: "600",
      style: "normal",
    },
    {
      path: "../fonts/SF-Pro-Text-Medium.otf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../fonts/SF-Pro-Text-Regular.otf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../fonts/SF-Pro-Text-Light.otf",
      weight: "300",
      style: "normal",
    },
    {
      path: "../fonts/SF-Pro-Text-Thin.otf",
      weight: "200",
      style: "normal",
    },
    {
      path: "../fonts/SF-Pro-Text-Ultralight.otf",
      weight: "100",
      style: "normal",
    },
    // italic
    {
      path: "../fonts/SF-Pro-Text-BlackItalic.otf",
      weight: "900",
      style: "italic",
    },
    {
      path: "../fonts/SF-Pro-Text-HeavyItalic.otf",
      weight: "800",
      style: "italic",
    },
    {
      path: "../fonts/SF-Pro-Text-BoldItalic.otf",
      weight: "700",
      style: "italic",
    },
    {
      path: "../fonts/SF-Pro-Text-SemiboldItalic.otf",
      weight: "600",
      style: "italic",
    },
    {
      path: "../fonts/SF-Pro-Text-MediumItalic.otf",
      weight: "500",
      style: "italic",
    },
    {
      path: "../fonts/SF-Pro-Text-RegularItalic.otf",
      weight: "400",
      style: "italic",
    },
    {
      path: "../fonts/SF-Pro-Text-LightItalic.otf",
      weight: "300",
      style: "italic",
    },
    {
      path: "../fonts/SF-Pro-Text-ThinItalic.otf",
      weight: "200",
      style: "italic",
    },
    {
      path: "../fonts/SF-Pro-Text-UltralightItalic.otf",
      weight: "100",
      style: "italic",
    },
  ],
});

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
    <html lang="en">
      {clientEnv.NEXT_PUBLIC_ENV === "prod" ? (
        <GoogleAnalytics
          gaId={clientEnv.NEXT_PUBLIC_GA_TRACKING_ID as string}
        />
      ) : null}
      <body className={sfpro.className}>
        <TrpcProvider>
          <ProgressbarProvider>
            <AuthProvider serverUser={user}>
              <HistoryProvider>
                <Theme accentColor="blue">
                  <Headerbar />
                  <Toaster position="top-right" richColors offset={80} />
                  <div className="min-h-[90svh] flex justify-center">
                    {children}
                  </div>
                  <Footer />
                  <MobileNavigator />
                </Theme>
              </HistoryProvider>
            </AuthProvider>
          </ProgressbarProvider>
        </TrpcProvider>
      </body>
    </html>
  );
}
