import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'ScribeAI - Meeting Transcription',
  description: 'AI-powered audio transcription and meeting notes',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} bg-slate-950 text-slate-100`}>
        <div className="min-h-screen flex flex-col">
          <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur sticky top-0 z-40">
            <div className="max-w-7xl mx-auto px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-8">
                  <div>
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                      ScribeAI
                    </h1>
                    <p className="text-xs text-slate-400">AI-Powered Transcription</p>
                  </div>
                </div>
                <nav className="flex items-center gap-6">
                  <a
                    href="/"
                    className="text-slate-300 hover:text-white transition text-sm font-medium"
                  >
                    Home
                  </a>
                  <a
                    href="/dashboard"
                    className="text-slate-300 hover:text-white transition text-sm font-medium"
                  >
                    Dashboard
                  </a>
                </nav>
              </div>
            </div>
          </header>
          <main className="flex-1">{children}</main>
          <footer className="border-t border-slate-800 bg-slate-900/50 text-center py-6 text-slate-400 text-xs">
            <div className="max-w-7xl mx-auto">
              <p>ScribeAI © 2024 | Powered by Gemini API & Socket.io</p>
              <p className="text-slate-500 mt-1">
                Built for end-to-end meeting transcription and summarization
              </p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}