import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { AntdProvider } from "@/providers";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Frequenz coding challenge",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AntdProvider>{children}</AntdProvider>
      </body>
    </html>
  );
}
