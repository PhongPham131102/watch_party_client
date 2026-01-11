import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import Header from "../src/components/Header";
import Footer from "../src/components/Footer";
import { Toaster } from "@/components/ui/sonner";
import AuthInitProvider from "../src/components/AuthInitProvider";
import SocketProvider from "../src/components/SocketProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Watch Party",
  description: "Watch Party Platform",
  icons: {
    icon: "/logo.png",
  },
};
import ReactQueryProvider from "../src/providers/react-query.provider";
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#0e0f14] text-white`}
      >
        <ReactQueryProvider>
          <AuthInitProvider>
            <SocketProvider>
              <Header />
              <main className="min-h-[70vh]">{children}</main>
              <Footer />
              <Toaster />
            </SocketProvider>
          </AuthInitProvider>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
