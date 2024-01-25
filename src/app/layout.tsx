import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "@radix-ui/themes/styles.css";
import { Theme } from "@radix-ui/themes";
import { Headerbar } from "@/app/Headerbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "RecNet",
  description: "Receive weekly paper recs from researchers you follow",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Theme accentColor="blue">
          <Headerbar />
          {children}
        </Theme>
      </body>
    </html>
  );
}
