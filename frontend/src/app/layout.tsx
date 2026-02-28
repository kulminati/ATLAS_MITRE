import type { Metadata } from "next";
import { Inter } from "next/font/google";
import SyncIndicator from "@/components/SyncIndicator";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ATLAS Threat Intelligence Platform",
  description:
    "Interactive MITRE ATLAS matrix for AI/ML threat intelligence learning",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.className} bg-gray-950 text-gray-100 min-h-screen`}
      >
        <header className="border-b border-gray-800 bg-gray-900/80 backdrop-blur-sm sticky top-0 z-50">
          <div className="max-w-[1600px] mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg" />
              <h1 className="text-xl font-bold tracking-tight">
                ATLAS<span className="text-indigo-400"> Threat Intel</span>
              </h1>
            </div>
            <nav className="flex items-center gap-6 text-sm">
              <a
                href="/learn"
                className="text-gray-300 hover:text-white transition-colors"
              >
                Learn
              </a>
              <a
                href="/"
                className="text-gray-300 hover:text-white transition-colors"
              >
                Matrix
              </a>
              <a
                href="/killchain"
                className="text-gray-300 hover:text-white transition-colors"
              >
                Killchains
              </a>
              <a
                href="/graph"
                className="text-gray-300 hover:text-white transition-colors"
              >
                Graph
              </a>
              <a
                href="/compare"
                className="text-gray-300 hover:text-white transition-colors"
              >
                Compare
              </a>
              <a
                href="/threat-model"
                className="text-gray-300 hover:text-white transition-colors"
              >
                Threat Model
              </a>
              <a
                href="/exercises"
                className="text-gray-300 hover:text-white transition-colors"
              >
                Exercises
              </a>
              <a
                href="/reports"
                className="text-gray-300 hover:text-white transition-colors"
              >
                Reports
              </a>
              <a
                href="/search"
                className="text-gray-300 hover:text-white transition-colors inline-flex items-center gap-1.5"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                Search
              </a>
              <div className="border-l border-gray-700 pl-4">
                <SyncIndicator />
              </div>
            </nav>
          </div>
        </header>
        <main className="max-w-[1600px] mx-auto px-6 py-8">{children}</main>
      </body>
    </html>
  );
}
