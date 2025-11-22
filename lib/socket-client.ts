'use client';

import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

/**
 * Initialize Socket.io connection (singleton pattern)
 * Ensures only one connection exists across the entire app
 */
function initSocket(): Socket {
  if (socket) return socket;

  const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';

  console.log(`🔌 Connecting to WebSocket server at ${socketUrl}`);

  socket = io(socketUrl, {
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 5,
    transports: ['websocket', 'polling'],
  });

  socket.on('connect', () => {
    console.log('✓ Connected to WebSocket server');
  });

  socket.on('disconnect', () => {
    console.log('✗ Disconnected from WebSocket server');
  });

  socket.on('error', (error) => {
    console.error('Socket error:', error);
  });

  return socket;
}

/**
 * React hook to use Socket.io connection
 * Returns null initially, then the socket instance
 */
export function useSocket(): Socket | null {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!socket) {
      initSocket();
    }
    setIsReady(true);

    return () => {
      // Don't disconnect - keep connection alive for other components
    };
  }, []);

  return isReady ? socket : null;
}