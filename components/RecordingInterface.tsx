'use client';

import { useEffect, useRef, useState } from 'react';
import { useSocket } from '@/lib/socket-client';
import { Mic, MonitorPlay, Play, Pause, Square, AlertCircle } from 'lucide-react';

type RecordingState = 'idle' | 'recording' | 'paused' | 'processing' | 'completed';

interface RecordingInterfaceProps {
  sessionId: string;
  onTranscriptionComplete?: (data: { transcript: string; summary: string }) => void;
}

export function RecordingInterface({
  sessionId,
  onTranscriptionComplete,
}: RecordingInterfaceProps) {
  const socket = useSocket();
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [state, setState] = useState<RecordingState>('idle');
  const [inputSource, setInputSource] = useState<'mic' | 'tab'>('mic');
  const [duration, setDuration] = useState(0);
  const [chunkCount, setChunkCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Timer for duration
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (state === 'recording') {
      interval = setInterval(() => setDuration((d) => d + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [state]);

  // Socket listeners
  useEffect(() => {
    if (!socket) return;

    socket.on('recording_started', () => {
      console.log('✓ Recording started on server');
    });

    socket.on('chunk_received', (data) => {
      setChunkCount((c) => c + 1);
    });

    socket.on('transcription_complete', (data) => {
      setState('completed');
      setIsProcessing(false);
      onTranscriptionComplete?.(data);
    });

    socket.on('transcription_error', (data) => {
      setError(data.error || 'Transcription failed');
      setState('idle');
      setIsProcessing(false);
    });

    socket.on('session_status', (data) => {
      if (data.sessionId === sessionId) {
        if (data.status === 'processing') {
          setIsProcessing(true);
        }
        if (data.status === 'completed') {
          setState('completed');
          setIsProcessing(false);
        }
        if (data.status === 'error') {
          setError(data.error || 'An error occurred');
          setState('idle');
          setIsProcessing(false);
        }
      }
    });

    return () => {
      socket.off('recording_started');
      socket.off('chunk_received');
      socket.off('transcription_complete');
      socket.off('transcription_error');
      socket.off('session_status');
    };
  }, [socket, sessionId, onTranscriptionComplete]);

  const handleStartRecording = async () => {
    try {
      setError(null);
      let stream: MediaStream;

      if (inputSource === 'mic') {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      } else {
        // Tab share with audio
        stream = await navigator.mediaDevices.getDisplayMedia({
          video: false,
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          } as any,
        });
      }

      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm',
      });

      let chunkIndex = 0;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64 = (reader.result as string).split(',')[1];
            socket?.emit('audio_chunk', {
              sessionId,
              audioData: base64,
              chunkIndex: chunkIndex++,
            });
          };
          reader.readAsDataURL(event.data);
        }
      };

      mediaRecorder.start(1000);
      mediaRecorderRef.current = mediaRecorder;

      setState('recording');
      setDuration(0);
      setChunkCount(0);

      socket?.emit('start_recording', { sessionId, userId: 'current-user' });
    } catch (err: any) {
      setError(err.message || 'Failed to start recording');
      console.error('Recording error:', err);
    }
  };

  const handlePauseResume = () => {
    const recorder = mediaRecorderRef.current;
    if (!recorder) return;

    if (state === 'recording') {
      recorder.pause();
      setState('paused');
      socket?.emit('pause_recording');
    } else if (state === 'paused') {
      recorder.resume();
      setState('recording');
      socket?.emit('resume_recording');
    }
  };

  const handleStopRecording = () => {
    const recorder = mediaRecorderRef.current;
    if (!recorder) return;

    recorder.stop();
    setState('processing');
    setIsProcessing(true);

    streamRef.current?.getTracks().forEach((track) => track.stop());

    socket?.emit('stop_recording', { sessionId });
  };

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <div className="w-full max-w-3xl mx-auto p-8 bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50 rounded-xl shadow-2xl">
      <h2 className="text-3xl font-bold text-white mb-8">🎙️ Record Your Session</h2>

      {error && (
        <div className="mb-6 p-4 bg-red-900/30 border border-red-700/50 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-red-200 font-medium">Error</p>
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Input Source Selection */}
      <div className="mb-8 flex gap-4">
        <button
          onClick={() => setInputSource('mic')}
          disabled={state !== 'idle'}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition ${
            inputSource === 'mic'
              ? 'bg-blue-600 text-white shadow-lg'
              : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
          } ${state !== 'idle' ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <Mic size={20} /> Microphone
        </button>
        <button
          onClick={() => setInputSource('tab')}
          disabled={state !== 'idle'}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition ${
            inputSource === 'tab'
              ? 'bg-purple-600 text-white shadow-lg'
              : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
          } ${state !== 'idle' ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <MonitorPlay size={20} /> Tab Share
        </button>
      </div>

      {/* Stats Grid */}
      <div className="mb-8 grid grid-cols-3 gap-4">
        <div className="bg-slate-700/50 p-5 rounded-lg border border-slate-600/50">
          <div className="text-slate-400 text-sm font-medium mb-2">⏱️ Duration</div>
          <div className="text-3xl font-mono font-bold text-white">{formatTime(duration)}</div>
        </div>
        <div className="bg-slate-700/50 p-5 rounded-lg border border-slate-600/50">
          <div className="text-slate-400 text-sm font-medium mb-2">📦 Chunks</div>
          <div className="text-3xl font-mono font-bold text-white">{chunkCount}</div>
        </div>
        <div className="bg-slate-700/50 p-5 rounded-lg border border-slate-600/50">
          <div className="text-slate-400 text-sm font-medium mb-2">🔄 Status</div>
          <div className="text-xl font-mono font-bold text-white capitalize">
            {isProcessing ? '⏳ Processing' : state}
          </div>
        </div>
      </div>

      {/* Recording Indicator */}
      {state === 'recording' && (
        <div className="mb-8 flex items-center gap-3 bg-red-900/30 border border-red-700/50 p-4 rounded-lg">
          <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
          <span className="text-red-200 font-medium">🔴 Recording in progress...</span>
        </div>
      )}

      {state === 'paused' && (
        <div className="mb-8 flex items-center gap-3 bg-yellow-900/30 border border-yellow-700/50 p-4 rounded-lg">
          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
          <span className="text-yellow-200 font-medium">⏸️ Recording paused</span>
        </div>
      )}

      {isProcessing && (
        <div className="mb-8 flex items-center gap-3 bg-blue-900/30 border border-blue-700/50 p-4 rounded-lg">
          <div className="animate-spin">⏳</div>
          <span className="text-blue-200 font-medium">Processing your audio...</span>
        </div>
      )}

      {/* Control Buttons */}
      <div className="flex gap-4 justify-center">
        {state === 'idle' && (
          <button
            onClick={handleStartRecording}
            className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold rounded-lg transition transform hover:scale-105 shadow-lg hover:shadow-xl text-lg"
          >
            <Mic size={24} /> Start Recording
          </button>
        )}

        {(state === 'recording' || state === 'paused') && (
          <>
            <button
              onClick={handlePauseResume}
              className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800 text-white font-bold rounded-lg transition transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              {state === 'recording' ? (
                <>
                  <Pause size={20} /> Pause
                </>
              ) : (
                <>
                  <Play size={20} /> Resume
                </>
              )}
            </button>
            <button
              onClick={handleStopRecording}
              className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold rounded-lg transition transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              <Square size={20} /> Stop
            </button>
          </>
        )}

        {state === 'completed' && (
          <div className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-green-600 to-green-700 text-white font-bold rounded-lg">
            ✓ Completed
          </div>
        )}
      </div>

      {/* Info Box */}
      <div className="mt-8 p-4 bg-slate-700/30 border border-slate-600/30 rounded-lg">
        <p className="text-sm text-slate-300">
          💡 <span className="font-medium">Tip:</span> Speak clearly for better transcription. Supports up to 1 hour of recording.
        </p>
      </div>
    </div>
  );
}