import { Inter } from "next/font/google";
import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";

import { ModalProvider } from "@/providers/modal-provider";
import { ToasterProvider } from "@/providers/toast-provider";

import "./globals.css";

const inter = Inter({ subsets: ["latin"]});

export const metadata: Metadata = {
  title: "Admin Dashbiard",
  description: "Admin Dashbiard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body
          className={inter.className}>
          <ToasterProvider />
          <ModalProvider />
          {children}</body>
      </html>
    </ClerkProvider>
  );
}
