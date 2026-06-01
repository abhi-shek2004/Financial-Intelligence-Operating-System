import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import AppShell from "@/components/layout/AppShell";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "FIOS | Financial Intelligence OS",
  description: "Institutional-Grade Multi-Agent AI Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} h-screen w-screen flex overflow-hidden`}>
        <AppShell>
          {children}
        </AppShell>
      </body>
    </html>
  );
}
