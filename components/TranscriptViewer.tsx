'use client';

import { Download, Copy, CheckCircle } from 'lucide-react';
import { useState } from 'react';

interface TranscriptViewerProps {
  transcript?: string;
  summary?: string;
  title?: string;
}

export function TranscriptViewer({
  transcript,
  summary,
  title = 'Transcript',
}: TranscriptViewerProps) {
  const [copied, setCopied] = useState<'transcript' | 'summary' | null>(null);

  const handleCopy = (text: string, type: 'transcript' | 'summary') => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleDownload = (text: string, filename: string) => {
    const element = document.createElement('a');
    element.setAttribute(
      'href',
      'data:text/plain;charset=utf-8,' + encodeURIComponent(text)
    );
    element.setAttribute('download', filename);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  if (!transcript) {
    return (
      <div className="w-full max-w-4xl mx-auto p-12 bg-slate-800/30 border border-slate-700/50 rounded-lg text-slate-400 text-center">
        <p>No transcript available yet</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Summary Section */}
      {summary && (
        <div className="bg-gradient-to-br from-blue-900/30 to-blue-800/20 border border-blue-700/50 rounded-lg p-8">
          <div className="flex justify-between items-start mb-6">
            <h3 className="text-2xl font-bold text-blue-300 flex items-center gap-2">
              📋 Summary
            </h3>
            <div className="flex gap-2">
              <button
                onClick={() => handleCopy(summary, 'summary')}
                className="p-3 hover:bg-blue-700/30 rounded-lg transition text-blue-400 hover:text-blue-300 flex items-center gap-2"
                title="Copy summary"
              >
                <Copy size={20} />
              </button>
              <button
                onClick={() => handleDownload(summary, `${title}-summary.txt`)}
                className="p-3 hover:bg-blue-700/30 rounded-lg transition text-blue-400 hover:text-blue-300"
                title="Download summary"
              >
                <Download size={20} />
              </button>
            </div>
          </div>
          <p className="text-slate-300 leading-relaxed whitespace-pre-wrap text-base">
            {summary}
          </p>
          {copied === 'summary' && (
            <div className="mt-4 flex items-center gap-2 text-sm text-blue-300">
              <CheckCircle size={16} /> Copied to clipboard
            </div>
          )}
        </div>
      )}

      {/* Transcript Section */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-8">
        <div className="flex justify-between items-start mb-6">
          <h3 className="text-2xl font-bold text-slate-300 flex items-center gap-2">
            📝 Full Transcript
          </h3>
          <div className="flex gap-2">
            <button
              onClick={() => handleCopy(transcript, 'transcript')}
              className="p-3 hover:bg-slate-700/30 rounded-lg transition text-slate-400 hover:text-slate-300"
              title="Copy transcript"
            >
              <Copy size={20} />
            </button>
            <button
              onClick={() => handleDownload(transcript, `${title}-transcript.txt`)}
              className="p-3 hover:bg-slate-700/30 rounded-lg transition text-slate-400 hover:text-slate-300"
              title="Download transcript"
            >
              <Download size={20} />
            </button>
          </div>
        </div>
        <div className="bg-slate-900/50 rounded-lg p-6 max-h-96 overflow-y-auto border border-slate-700/30">
          <pre className="text-slate-300 whitespace-pre-wrap font-mono text-sm leading-relaxed">
            {transcript}
          </pre>
        </div>
        {copied === 'transcript' && (
          <div className="mt-4 flex items-center gap-2 text-sm text-slate-400">
            <CheckCircle size={16} /> Copied to clipboard
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 text-center">
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4">
          <div className="text-2xl font-bold text-slate-300">
            {transcript.split(' ').length}
          </div>
          <div className="text-xs text-slate-400 mt-1">Words</div>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4">
          <div className="text-2xl font-bold text-slate-300">
            {transcript.split('\n').length}
          </div>
          <div className="text-xs text-slate-400 mt-1">Lines</div>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4">
          <div className="text-2xl font-bold text-slate-300">
            {transcript.length}
          </div>
          <div className="text-xs text-slate-400 mt-1">Characters</div>
        </div>
      </div>
    </div>
  );
}