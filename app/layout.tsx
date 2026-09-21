import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const description = "A one-line API to pause any automation and wait for a human to approve or reject via email.";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "https://shonin.dev"),
  title: "Shonin — Human approval API",
  description,
  icons: {
    icon: "/logo.png",
  },
  openGraph: {
    title: "Shonin: human approval, delivered to any inbox",
    description,
    siteName: "Shonin",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Shonin: human approval, delivered to any inbox",
    description,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
