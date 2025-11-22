'use client';

import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { RecordingInterface } from '@/components/RecordingInterface';
import { TranscriptViewer } from '@/components/TranscriptViewer';
import { SessionHistory } from '@/components/SessionHistory';
import { Plus, ChevronLeft, Trash2 } from 'lucide-react';

type View = 'history' | 'recording' | 'transcript';

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

export default function Dashboard() {
  const [view, setView] = useState<View>('history');
  const [sessions, setSessions] = useState<Session[]>([]);
  const [currentSession, setCurrentSession] = useState<Session | null>(null);
  const [newSessionId, setNewSessionId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  // Load sessions from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('scribeai_sessions');
      if (stored) {
        setSessions(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load sessions:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save sessions to localStorage
  useEffect(() => {
    if (sessions.length > 0) {
      localStorage.setItem('scribeai_sessions', JSON.stringify(sessions));
    }
  }, [sessions]);

  const handleStartRecording = () => {
    const sessionId = uuidv4();
    setNewSessionId(sessionId);
    const now = new Date();
    setCurrentSession({
      id: sessionId,
      title: `Meeting - ${now.toLocaleString()}`,
      duration: 0,
      status: 'recording',
      createdAt: now.toISOString(),
    });
    setView('recording');
  };

  const handleTranscriptionComplete = (data: { transcript: string; summary: string }) => {
    if (!currentSession) return;

    const updatedSession: Session = {
      ...currentSession,
      status: 'completed',
      transcript: data.transcript,
      summary: data.summary,
      rawTranscript: data.transcript,
    };

    setCurrentSession(updatedSession);
    setSessions((prev) => {
      const existing = prev.find((s) => s.id === currentSession.id);
      if (existing) {
        return prev.map((s) => (s.id === currentSession.id ? updatedSession : s));
      }
      return [updatedSession, ...prev];
    });

    setView('transcript');
  };

  const handleDeleteSession = async (id: string) => {
    if (!confirm('Are you sure? This session will be deleted permanently.')) return;
    setSessions((prev) => prev.filter((s) => s.id !== id));
  };

  const handleViewSession = (session: Session) => {
    setCurrentSession(session);
    setView('transcript');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin mb-4">
            <div className="w-12 h-12 border-4 border-slate-700 border-t-blue-500 rounded-full"></div>
          </div>
          <p className="text-slate-300">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 to-slate-900 py-12">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="mb-12 flex items-center justify-between">
          <div>
            {view !== 'history' && (
              <button
                onClick={() => setView('history')}
                className="mb-6 flex items-center gap-2 text-slate-400 hover:text-white transition font-medium"
              >
                <ChevronLeft size={20} /> Back to Sessions
              </button>
            )}
            <h1 className="text-5xl font-bold text-white">
              {view === 'history' && '📚 My Recordings'}
              {view === 'recording' && '🎙️ Recording Session'}
              {view === 'transcript' && '📝 Transcript & Summary'}
            </h1>
            <p className="text-slate-400 mt-2">
              {view === 'history' && 'Manage and access all your recorded sessions'}
              {view === 'recording' && 'Start speaking to begin transcription'}
              {view === 'transcript' && 'View your transcription and AI-generated summary'}
            </p>
          </div>

          {view === 'history' && (
            <button
              onClick={handleStartRecording}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold rounded-lg transition transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              <Plus size={20} /> New Session
            </button>
          )}
        </div>

        {/* Content */}
        <div className="space-y-8">
          {view === 'history' && (
            <SessionHistory
              sessions={sessions}
              onDelete={handleDeleteSession}
              onViewSession={handleViewSession}
            />
          )}

          {view === 'recording' && currentSession && (
            <div>
              <div className="mb-6 p-6 bg-slate-800/50 border border-slate-700/50 rounded-lg">
                <h3 className="text-xl font-semibold text-white">{currentSession.title}</h3>
                <p className="text-sm text-slate-400 mt-2">
                  Session ID: <code className="bg-slate-900/50 px-2 py-1 rounded">{currentSession.id}</code>
                </p>
              </div>
              <RecordingInterface
                sessionId={currentSession.id}
                onTranscriptionComplete={handleTranscriptionComplete}
              />
            </div>
          )}

          {view === 'transcript' && currentSession && (
            <div>
              <div className="mb-6 p-6 bg-slate-800/50 border border-slate-700/50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-semibold text-white">{currentSession.title}</h3>
                    <p className="text-sm text-slate-400 mt-2">
                      Status:{' '}
                      <span
                        className={`font-semibold ${
                          currentSession.status === 'completed'
                            ? 'text-green-400'
                            : currentSession.status === 'processing'
                              ? 'text-blue-400'
                              : 'text-slate-400'
                        }`}
                      >
                        {currentSession.status.charAt(0).toUpperCase() +
                          currentSession.status.slice(1)}
                      </span>
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setSessions((prev) => prev.filter((s) => s.id !== currentSession.id));
                      setView('history');
                    }}
                    className="p-3 hover:bg-red-900/30 rounded-lg transition text-slate-400 hover:text-red-400"
                    title="Delete session"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
              <TranscriptViewer
                transcript={currentSession.transcript}
                summary={currentSession.summary}
                title={currentSession.title}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}