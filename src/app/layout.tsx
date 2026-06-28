import type { Metadata } from "next"
import Script from "next/script"
import { Geist, Geist_Mono } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { ToastProvider } from "@/components/toast"
import { MobileBottomNav } from "@/components/mobile-bottom-nav"
import { FloatingChat, CommandPalette } from "@/components/client-dynamic"
import "./globals.css"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: {
    default: "AIVerse — Discover the Best AI Tools",
    template: "%s — AIVerse",
  },
  description:
    "The AI Productivity Ecosystem. Discover, learn, and master AI tools with workspaces, prompts, stacks, learning paths, and a context-aware copilot.",
  keywords: [
    "AI tools",
    "artificial intelligence",
    "AI directory",
    "machine learning",
    "best AI tools",
    "free AI tools",
  ],
  authors: [{ name: "AIVerse" }],
  creator: "AIVerse",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "AIVerse",
    title: "AIVerse — The AI Productivity Ecosystem",
    description:
      "Discover, learn, build, and master AI tools with workspaces, prompts, stacks, and learning paths.",
  },
  twitter: {
    card: "summary_large_image",
    title: "AIVerse — The AI Productivity Ecosystem",
    description:
      "Discover, learn, build, and master AI tools with workspaces, prompts, stacks, and learning paths.",
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable}`}
    >
      <body className="min-h-screen bg-background font-sans antialiased">
        <Script
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2342877955221604"
          crossOrigin="anonymous"
          strategy="beforeInteractive"
        />
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[300] focus:rounded-lg focus:bg-background focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:shadow-lg focus:ring-2 focus:ring-ring"
        >
          Skip to main content
        </a>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ToastProvider>
            {children}
            <FloatingChat />
            <CommandPalette />
            <MobileBottomNav />
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
