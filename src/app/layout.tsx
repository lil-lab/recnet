import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "@radix-ui/themes/styles.css";
import { Theme } from "@radix-ui/themes";
import { Headerbar } from "@/app/Headerbar";
import { AuthProvider } from "./AuthProvider";
import { getUserServerSide } from "@/utils/getUserServerSide";
import { Footer } from "@/app/Footer";

const inter = Inter({ subsets: ["latin"] });

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
      <body className={inter.className}>
        <AuthProvider serverUser={user}>
          <Theme accentColor="blue">
            <Headerbar />
            <div className="min-h-[90svh]">{children}</div>
            <Footer />
          </Theme>
        </AuthProvider>
      </body>
    </html>
  );
}
