'use client';

import { useEffect, useState } from 'react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isConnected, setIsConnected] = useState(false);
  const [checkingConnection, setCheckingConnection] = useState(true);

  useEffect(() => {
    const checkConnection = async () => {
      try {
        const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';
        const response = await fetch(
          `${socketUrl}/socket.io/?EIO=4&transport=polling`,
          { method: 'GET', mode: 'no-cors' }
        );
        setIsConnected(true);
      } catch (error) {
        setIsConnected(false);
      }
      setCheckingConnection(false);
    };

    checkConnection();
    const interval = setInterval(checkConnection, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 to-slate-900">
      {/* Connection Status Badge */}
      <div className="fixed top-20 right-4 z-50">
        {checkingConnection ? (
          <div className="flex items-center gap-2 px-4 py-2 bg-slate-800/80 border border-slate-700 rounded-lg backdrop-blur">
            <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse"></div>
            <span className="text-slate-300 text-sm">Checking connection...</span>
          </div>
        ) : isConnected ? (
          <div className="flex items-center gap-2 px-4 py-2 bg-green-900/50 border border-green-700/50 rounded-lg backdrop-blur">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-green-200 text-sm font-medium">Connected</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 px-4 py-2 bg-red-900/50 border border-red-700/50 rounded-lg backdrop-blur">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-red-200 text-sm font-medium">Connecting...</span>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="pt-6">
        {children}
      </div>
    </div>
  );
}