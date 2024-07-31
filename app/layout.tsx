// app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Analytics } from '@vercel/analytics/react';
import Script from 'next/script';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "MockTalk.ai",
  description: "Best AI Interviewer",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <head>
        <title>MockTalk.ai</title>
        {/* Plausible Analytics Script */}
        <Script
          defer
          data-domain="mock-talk-ai.vercel.app"
          src="https://plausible.io/js/script.js"
        />
      </head>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
