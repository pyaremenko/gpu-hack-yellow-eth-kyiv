import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navigation } from "@/components/navigation";
import { UserProvider } from "@/contexts/user-context";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "GPU Flex - Share GPU Power, Earn Rewards",
  description: "Share your GPU resources for AI training and earn points.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <UserProvider>
          <div className="min-h-screen bg-gradient-to-br  from-slate-500 to-slate-900">
            <Navigation />
            <main className="pt-16">{children}</main>
          </div>
        </UserProvider>
      </body>
    </html>
  );
}
