import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";

const geist = Geist({
  subsets: ["latin", "cyrillic"],
  variable: "--font-geist-sans"
});

export const metadata: Metadata = {
  title: "AIKA | AI business operating system",
  description: "AI entrepreneur mentor and growth engine for Central Asia."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body className={`${geist.variable} font-sans antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
