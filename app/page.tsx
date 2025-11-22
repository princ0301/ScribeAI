import Link from 'next/link';
import { Mic, Zap, Clock, Download, ArrowRight } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-6 py-32 text-center">
        <div className="mb-12">
          <div className="inline-block mb-6 px-4 py-2 bg-blue-900/30 border border-blue-700/50 rounded-full">
            <p className="text-blue-300 text-sm font-medium">
              ✨ AI-Powered Meeting Transcription
            </p>
          </div>

          <h1 className="text-6xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Turn Your Meetings Into
            <span className="block bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Smart Notes
            </span>
          </h1>

          <p className="text-xl text-slate-300 mb-12 max-w-3xl mx-auto leading-relaxed">
            Record, transcribe, and summarize meetings in real-time using AI. Capture every word,
            never miss an action item. Perfect for teams, students, and professionals.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-20">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold rounded-lg transition transform hover:scale-105 hover:shadow-xl"
          >
            Start Recording <ArrowRight size={20} />
          </Link>
          <a
            href="#features"
            className="inline-flex items-center justify-center px-8 py-4 border border-slate-700 text-white font-bold rounded-lg hover:bg-slate-800/50 transition"
          >
            Learn More
          </a>
        </div>

        {/* Demo Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-20">
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-6">
            <div className="text-3xl font-bold text-blue-400 mb-2">30s</div>
            <p className="text-slate-400 text-sm">Streaming chunks for live transcription</p>
          </div>
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-6">
            <div className="text-3xl font-bold text-purple-400 mb-2">1hr+</div>
            <p className="text-slate-400 text-sm">Support for long-duration sessions</p>
          </div>
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-6">
            <div className="text-3xl font-bold text-pink-400 mb-2">Real-time</div>
            <p className="text-slate-400 text-sm">Updates via WebSocket</p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="max-w-6xl mx-auto px-6 py-20 border-t border-slate-800">
        <h2 className="text-4xl font-bold text-white text-center mb-16">
          Powerful Features
        </h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-6 hover:border-blue-700/50 transition group">
            <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-500/30 transition">
              <Mic className="w-6 h-6 text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Live Recording</h3>
            <p className="text-slate-400 text-sm">
              Record from microphone or screen share. Capture audio from any source.
            </p>
          </div>

          <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-6 hover:border-purple-700/50 transition group">
            <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mb-4 group-hover:bg-purple-500/30 transition">
              <Zap className="w-6 h-6 text-purple-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">AI Transcription</h3>
            <p className="text-slate-400 text-sm">
              Powered by Google Gemini. Accurate transcription with speaker detection.
            </p>
          </div>

          <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-6 hover:border-green-700/50 transition group">
            <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mb-4 group-hover:bg-green-500/30 transition">
              <Clock className="w-6 h-6 text-green-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Real-time Updates</h3>
            <p className="text-slate-400 text-sm">
              See transcription and status updates as they happen via WebSockets.
            </p>
          </div>

          <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-6 hover:border-orange-700/50 transition group">
            <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center mb-4 group-hover:bg-orange-500/30 transition">
              <Download className="w-6 h-6 text-orange-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Export & Share</h3>
            <p className="text-slate-400 text-sm">
              Download transcripts and summaries. Never lose important notes.
            </p>
          </div>
        </div>
      </section>

      {/* Tech Stack Section */}
      <section className="max-w-6xl mx-auto px-6 py-20 border-t border-slate-800">
        <h2 className="text-3xl font-bold text-white text-center mb-16">
          Built With Modern Tech
        </h2>

        <div className="grid md:grid-cols-2 gap-12">
          <div className="bg-gradient-to-br from-blue-900/20 to-blue-800/10 border border-blue-700/30 rounded-lg p-8">
            <h3 className="text-xl font-semibold text-blue-400 mb-6">Frontend Stack</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-slate-300">
                <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                Next.js 14 (App Router)
              </li>
              <li className="flex items-center gap-3 text-slate-300">
                <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                React 18 with TypeScript
              </li>
              <li className="flex items-center gap-3 text-slate-300">
                <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                Tailwind CSS
              </li>
              <li className="flex items-center gap-3 text-slate-300">
                <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                Socket.io Client
              </li>
            </ul>
          </div>

          <div className="bg-gradient-to-br from-purple-900/20 to-purple-800/10 border border-purple-700/30 rounded-lg p-8">
            <h3 className="text-xl font-semibold text-purple-400 mb-6">Backend & Services</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-slate-300">
                <span className="w-2 h-2 bg-purple-400 rounded-full"></span>
                Node.js WebSocket Server
              </li>
              <li className="flex items-center gap-3 text-slate-300">
                <span className="w-2 h-2 bg-purple-400 rounded-full"></span>
                PostgreSQL (Neon)
              </li>
              <li className="flex items-center gap-3 text-slate-300">
                <span className="w-2 h-2 bg-purple-400 rounded-full"></span>
                Google Gemini API
              </li>
              <li className="flex items-center gap-3 text-slate-300">
                <span className="w-2 h-2 bg-purple-400 rounded-full"></span>
                Prisma ORM
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-slate-700/50 rounded-xl p-16 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Transform Your Meetings?</h2>
          <p className="text-slate-300 mb-8 text-lg">
            Start recording and transcribing today. It takes less than a minute to get started.
          </p>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold rounded-lg transition transform hover:scale-105 hover:shadow-xl"
          >
            Launch ScribeAI Now <ArrowRight size={20} />
          </Link>
        </div>
      </section>
    </div>
  );
}