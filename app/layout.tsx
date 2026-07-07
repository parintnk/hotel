import type { Metadata } from "next";
import { Inter, Noto_Sans_Thai, Geist_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const notoThai = Noto_Sans_Thai({
  variable: "--font-thai",
  subsets: ["thai"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Hotel Ops Console — Hotel Automation Platform",
  description:
    "แพลตฟอร์มอัตโนมัติสำหรับโรงแรม: แชทจองด้วย AI, ETL หลายช่องทาง + จับ overbooking, review intelligence และรายงานรายวัน",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="th"
      className={`${inter.variable} ${notoThai.variable} ${geistMono.variable} h-full antialiased`}
      style={{ ["--font-sans" as string]: "var(--font-inter), var(--font-thai)" }}
    >
      {/* suppressHydrationWarning: browser extension (Grammarly) ฉีด attribute ใส่ body */}
      <body suppressHydrationWarning className="min-h-full flex flex-col bg-paper text-ink">
        {children}
      </body>
    </html>
  );
}
