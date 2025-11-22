// app/dashboard/sessions/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { TranscriptViewer } from '@/components/TranscriptViewer';
import { ChevronLeft, Share2, Trash2, Edit2, Copy, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';

interface Session {
  id: string;
  title: string;
  duration: number;
  status: string;
  createdAt: string;
  transcript?: string;
  summary?: string;
  rawTranscript?: string;
}

export default function SessionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.id as string;

  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load session from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('scribeai_sessions');
      if (stored) {
        const sessions = JSON.parse(stored);
        const found = sessions.find((s: Session) => s.id === sessionId);
        if (found) {
          setSession(found);
          setEditTitle(found.title);
        } else {
          setError('Session not found');
        }
      } else {
        setError('No sessions found');
      }
    } catch (err) {
      console.error('Failed to load session:', err);
      setError('Failed to load session');
    } finally {
      setIsLoading(false);
    }
  }, [sessionId]);

  const handleUpdateTitle = () => {
    if (!session || !editTitle.trim()) return;

    try {
      const stored = localStorage.getItem('scribeai_sessions');
      if (stored) {
        const sessions = JSON.parse(stored);
        const updated = sessions.map((s: Session) =>
          s.id === sessionId ? { ...s, title: editTitle.trim() } : s
        );
        localStorage.setItem('scribeai_sessions', JSON.stringify(updated));
        setSession({ ...session, title: editTitle.trim() });
        setIsEditing(false);
      }
    } catch (err) {
      console.error('Failed to update title:', err);
    }
  };

  const handleDeleteSession = async () => {
    if (!confirm('Delete this session permanently? This cannot be undone.')) return;

    try {
      const stored = localStorage.getItem('scribeai_sessions');
      if (stored) {
        const sessions = JSON.parse(stored);
        const filtered = sessions.filter((s: Session) => s.id !== sessionId);
        localStorage.setItem('scribeai_sessions', JSON.stringify(filtered));
        router.push('/dashboard');
      }
    } catch (err) {
      console.error('Failed to delete session:', err);
      setError('Failed to delete session');
    }
  };

  const handleCopyLink = () => {
    const url = `${window.location.origin}/dashboard/sessions/${sessionId}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: session?.title,
          text: `Check out this meeting transcript: ${session?.title}`,
          url: `${window.location.origin}/dashboard/sessions/${sessionId}`,
        });
      } catch (err) {
        console.error('Share failed:', err);
      }
    } else {
      handleCopyLink();
    }
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    }
    return `${minutes}m ${secs}s`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 to-slate-900">
        <div className="text-center">
          <div className="animate-spin mb-4">
            <div className="w-12 h-12 border-4 border-slate-700 border-t-blue-500 rounded-full"></div>
          </div>
          <p className="text-slate-300">Loading session...</p>
        </div>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 to-slate-900 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <button
            onClick={() => router.push('/dashboard')}
            className="mb-8 flex items-center gap-2 text-slate-400 hover:text-white transition font-medium"
          >
            <ChevronLeft size={20} /> Back to Dashboard
          </button>

          <div className="bg-red-900/30 border border-red-700/50 rounded-lg p-12 text-center">
            <h2 className="text-2xl font-bold text-red-300 mb-2">Error</h2>
            <p className="text-red-200">{error || 'Session not found'}</p>
            <button
              onClick={() => router.push('/dashboard')}
              className="mt-6 px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 to-slate-900 py-12">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="mb-12">
          <button
            onClick={() => router.push('/dashboard')}
            className="mb-6 flex items-center gap-2 text-slate-400 hover:text-white transition font-medium"
          >
            <ChevronLeft size={20} /> Back to Dashboard
          </button>

          {/* Title Section */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex-1">
              {isEditing ? (
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="text-4xl font-bold bg-slate-800/50 border border-slate-600 text-white px-4 py-2 rounded-lg flex-1 focus:outline-none focus:border-blue-500"
                    autoFocus
                  />
                  <button
                    onClick={handleUpdateTitle}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setEditTitle(session.title);
                      setIsEditing(false);
                    }}
                    className="px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg transition"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <h1 className="text-5xl font-bold text-white">{session.title}</h1>
              )}
            </div>

            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="p-3 hover:bg-slate-700/50 rounded-lg transition text-slate-400 hover:text-slate-200"
                title="Edit title"
              >
                <Edit2 size={24} />
              </button>
            )}
          </div>

          {/* Info Bar */}
          <div className="flex flex-wrap items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-slate-400">📅 Date:</span>
              <span className="text-slate-300 font-medium">
                {format(new Date(session.createdAt), 'MMMM dd, yyyy')}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-400">⏰ Time:</span>
              <span className="text-slate-300 font-medium">
                {format(new Date(session.createdAt), 'HH:mm:ss')}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-400">⏱️ Duration:</span>
              <span className="text-slate-300 font-medium">{formatDuration(session.duration)}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-400">📊 Status:</span>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold ${
                  session.status === 'completed'
                    ? 'bg-green-900/50 text-green-300'
                    : session.status === 'processing'
                      ? 'bg-blue-900/50 text-blue-300'
                      : 'bg-slate-900/50 text-slate-300'
                }`}
              >
                {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mb-8 flex flex-wrap gap-3">
          <button
            onClick={handleShare}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition font-medium"
          >
            <Share2 size={18} /> Share
          </button>

          <button
            onClick={handleCopyLink}
            className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition font-medium"
          >
            <Copy size={18} /> {copied ? 'Copied!' : 'Copy Link'}
          </button>

          <button
            onClick={handleDeleteSession}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition font-medium ml-auto"
          >
            <Trash2 size={18} /> Delete
          </button>
        </div>

        {/* Main Content */}
        <div className="space-y-8">
          {/* Session Metadata Card */}
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-8">
            <h2 className="text-2xl font-bold text-white mb-6">📋 Session Information</h2>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-slate-400 mb-2">Session ID</h3>
                <p className="text-slate-300 font-mono text-sm bg-slate-900/50 p-3 rounded break-all">
                  {session.id}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-slate-400 mb-2">Created</h3>
                <p className="text-slate-300">
                  {format(new Date(session.createdAt), 'EEEE, MMMM dd, yyyy • HH:mm:ss')}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-slate-400 mb-2">Recording Duration</h3>
                <p className="text-slate-300 text-lg font-semibold">{formatDuration(session.duration)}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-slate-400 mb-2">Status</h3>
                <p className="text-slate-300 capitalize font-semibold">{session.status}</p>
              </div>
            </div>
          </div>

          {/* Transcript Section */}
          {session.transcript && (
            <TranscriptViewer
              transcript={session.transcript}
              summary={session.summary}
              title={session.title}
            />
          )}

          {/* Empty State */}
          {!session.transcript && (
            <div className="bg-slate-800/30 border border-slate-700/50 rounded-lg p-12 text-center">
              <p className="text-slate-400">
                No transcript available for this session yet.
              </p>
            </div>
          )}
        </div>

        {/* Statistics Footer */}
        {session.transcript && (
          <div className="mt-12 p-8 bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-slate-700/50 rounded-lg">
            <h3 className="text-lg font-bold text-white mb-6">📊 Transcript Statistics</h3>
            <div className="grid md:grid-cols-4 gap-6">
              <div>
                <div className="text-3xl font-bold text-blue-400">
                  {session.transcript.split(' ').length}
                </div>
                <p className="text-slate-400 text-sm mt-1">Total Words</p>
              </div>
              <div>
                <div className="text-3xl font-bold text-purple-400">
                  {session.transcript.split('\n').length}
                </div>
                <p className="text-slate-400 text-sm mt-1">Lines</p>
              </div>
              <div>
                <div className="text-3xl font-bold text-pink-400">
                  {Math.ceil(session.transcript.length / 100)}
                </div>
                <p className="text-slate-400 text-sm mt-1">Paragraphs (est.)</p>
              </div>
              <div>
                <div className="text-3xl font-bold text-green-400">
                  {Math.ceil(session.transcript.split(' ').length / 200)}
                </div>
                <p className="text-slate-400 text-sm mt-1">Read Time (min)</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}