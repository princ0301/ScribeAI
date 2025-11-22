'use client';

import { format } from 'date-fns';
import { Trash2, Eye } from 'lucide-react';
import { useState } from 'react';

interface Session {
  id: string;
  title: string;
  duration: number;
  status: string;
  createdAt: string;
  summary?: string;
}

interface SessionHistoryProps {
  sessions: Session[];
  onDelete?: (id: string) => Promise<void>;
  onViewSession?: (session: Session) => void;
}

export function SessionHistory({
  sessions,
  onDelete,
  onViewSession,
}: SessionHistoryProps) {
  const [deleting, setDeleting] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this session? This cannot be undone.')) return;
    setDeleting(id);
    try {
      await onDelete?.(id);
    } finally {
      setDeleting(null);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins === 0) return `${secs}s`;
    return `${mins}m ${secs}s`;
  };

  if (sessions.length === 0) {
    return (
      <div className="w-full max-w-4xl mx-auto p-16 bg-slate-800/30 border border-slate-700/50 rounded-lg text-center">
        <div className="text-5xl mb-4">📭</div>
        <p className="text-slate-400 text-lg font-medium">No sessions yet</p>
        <p className="text-slate-500 text-sm mt-2">
          Create a new recording session to get started!
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold text-white mb-8">📚 Recent Sessions</h2>
      <div className="space-y-4">
        {sessions.map((session) => (
          <div
            key={session.id}
            className="flex items-center justify-between p-6 bg-slate-800/50 border border-slate-700/50 rounded-lg hover:border-slate-600/50 transition group"
          >
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-white group-hover:text-blue-300 transition text-lg">
                {session.title}
              </h3>
              <p className="text-sm text-slate-400 mt-2">
                {format(new Date(session.createdAt), 'MMM dd, yyyy • HH:mm')} •{' '}
                <span className="text-slate-300">{formatDuration(session.duration)}</span>
              </p>
              {session.summary && (
                <p className="text-sm text-slate-300 mt-3 line-clamp-2 bg-slate-700/30 p-3 rounded">
                  {session.summary}
                </p>
              )}
            </div>

            <div className="flex items-center gap-3 ml-6 flex-shrink-0">
              <span
                className={`px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap ${
                  session.status === 'completed'
                    ? 'bg-green-900/50 text-green-300'
                    : session.status === 'processing'
                      ? 'bg-blue-900/50 text-blue-300'
                      : 'bg-slate-900/50 text-slate-300'
                }`}
              >
                {session.status}
              </span>

              <a
                href={`/dashboard/sessions/${session.id}`}
                className="p-2 hover:bg-slate-700/50 rounded-lg transition text-slate-400 hover:text-slate-200 inline-flex"
                title="View details"
              >
                <Eye size={20} />
              </a>

              {onDelete && (
                <button
                  onClick={() => handleDelete(session.id)}
                  disabled={deleting === session.id}
                  className="p-2 hover:bg-red-900/30 rounded-lg transition text-slate-400 hover:text-red-400 disabled:opacity-50"
                  title="Delete session"
                >
                  <Trash2 size={20} />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}