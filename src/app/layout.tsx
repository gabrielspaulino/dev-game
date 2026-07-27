import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "@/styles/globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: "LearningStack — Gamified Learning for Developers",
  description:
    "Level up your software engineering skills with daily practice sessions, streaks, and XP. Inspired by Duolingo, built for developers.",
};

const themeScript = `
(function(){
  var t = localStorage.getItem('theme');
  if (t === 'light') return;
  document.documentElement.classList.add('dark');
})()
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className={`${inter.variable} ${mono.variable} font-sans`}>{children}</body>
    </html>
  );
}
