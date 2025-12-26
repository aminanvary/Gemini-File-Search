import type { Metadata } from "next";
import { Space_Grotesk, JetBrains_Mono, Vazirmatn } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-sans",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

const vazirmatn = Vazirmatn({
  variable: "--font-persian",
  subsets: ["arabic"],
});

export const metadata: Metadata = {
  title: "Gemini File Search Visualizer",
  description: "Visualize and manage your Gemini File Search stores and files",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${spaceGrotesk.variable} ${jetbrainsMono.variable} ${vazirmatn.variable} antialiased font-sans bg-[var(--bg-base)] text-[var(--text-primary)] min-h-screen`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
