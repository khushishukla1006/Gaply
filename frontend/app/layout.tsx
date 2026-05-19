import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Navbar } from "@/components/Navbar";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "Gaply — AI-powered research paper assistant",
  description:
    "Search papers, surface research gaps, generate citations, and chat with any paper. Built for researchers who want to read smarter.",
};

const themeInitScript = `
(function() {
  try {
    var theme = localStorage.getItem('gaply-theme');
    if (theme === 'light') {
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
    }
  } catch (e) {
    document.documentElement.classList.add('dark');
  }
})();
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body
        className={`${inter.className} flex min-h-screen flex-col bg-background antialiased selection:bg-primary/30`}
      >
        <Navbar />
        <main className="flex-1">{children}</main>
        <footer className="mt-24 border-t bg-background/40">
          <div className="container flex flex-col items-center justify-between gap-3 py-8 text-xs text-muted-foreground md:flex-row">
            <p>© {new Date().getFullYear()} Gaply · Built for researchers.</p>
            <p>Next.js · Spring Boot · arXiv · OpenAI</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
