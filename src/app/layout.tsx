import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "@radix-ui/themes/styles.css";
import { Theme } from "@radix-ui/themes";
import { Headerbar } from "@/app/Headerbar";
import { Tokens, getTokens } from "next-firebase-auth-edge";
import { cookies } from "next/headers";
import { AuthProvider } from "./AuthProvider";
import { authConfig } from "@/config";
import { User, UserSchema } from "@/types/user";
import { fetchWithZod } from "@/utils/zodFetch";

const toUser = async ({ decodedToken }: Tokens): Promise<User | null> => {
  const { email } = decodedToken;
  if (!email) {
    return null;
  }
  return await fetchWithZod(UserSchema, `/api/user?email=${email}`);
};

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
  const tokens = await getTokens(cookies(), {
    apiKey: authConfig.apiKey,
    cookieName: authConfig.cookieName,
    cookieSignatureKeys: authConfig.cookieSignatureKeys,
    serviceAccount: authConfig.serviceAccount,
  });
  const user = tokens ? await toUser(tokens) : null;
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider serverUser={user}>
          <Theme accentColor="blue">
            <Headerbar />
            {children}
          </Theme>
        </AuthProvider>
      </body>
    </html>
  );
}
