import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Free X/Twitter Media Downloader - No Ads",
  description:
    "Download X/Twitter photos and videos for free, with no ads. Easy-to-use tool for saving media from tweets without any cost or annoying advertisements.",
  keywords:
    "Twitter downloader, X downloader, free, no ads, media download, tweet saver, photo downloader, video downloader",
  openGraph: {
    title: "Free X/Twitter Media Downloader - No Ads",
    description:
      "Save photos and videos from X/Twitter easily. 100% free, no advertisements.",
    type: "website",
    url: "https://xclipsaver.com",
  },
  twitter: {
    card: "summary_large_image",
    title: "Free X/Twitter Media Downloader - Ad-Free",
    description:
      "Download X/Twitter media for free. No ads, no costs, just a simple and effective tool.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
