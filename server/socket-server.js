const http = require('http');
const socketIo = require('socket.io');
const { transcribeAudio } = require('./transcription');

const PORT = process.env.SOCKET_PORT || 3001;

const server = http.createServer();
const io = socketIo(server, {
  cors: {
    origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});

const activeSessions = new Map();

io.on('connection', (socket) => {
  console.log(`✓ Client connected: ${socket.id}`);

  socket.on('start_recording', async (data) => {
    const { sessionId, userId } = data;
    console.log(`📹 Recording started: ${sessionId}`);
    
    activeSessions.set(socket.id, {
      sessionId,
      userId,
      audioChunks: [],
      startTime: Date.now(),
      status: 'recording',
    });

    socket.emit('recording_started', { sessionId, timestamp: new Date() });
    io.emit('session_status', { sessionId, status: 'recording' });
  });

  socket.on('audio_chunk', async (data) => {
    const session = activeSessions.get(socket.id);
    if (!session) return;

    const { audioData, chunkIndex } = data;
    session.audioChunks.push({
      data: audioData,
      index: chunkIndex,
      timestamp: Date.now() - session.startTime,
    });

    console.log(`🔊 Chunk ${chunkIndex} received`);
    socket.emit('chunk_received', { chunkIndex, status: 'queued' });
  });

  socket.on('pause_recording', () => {
    const session = activeSessions.get(socket.id);
    if (!session) return;
    session.status = 'paused';
    console.log(`⏸ Recording paused: ${session.sessionId}`);
    io.emit('session_status', { sessionId: session.sessionId, status: 'paused' });
  });

  socket.on('resume_recording', () => {
    const session = activeSessions.get(socket.id);
    if (!session) return;
    session.status = 'recording';
    console.log(`▶ Recording resumed: ${session.sessionId}`);
    io.emit('session_status', { sessionId: session.sessionId, status: 'recording' });
  });

  socket.on('stop_recording', async (data) => {
    const session = activeSessions.get(socket.id);
    if (!session) return;

    const { sessionId } = data;
    console.log(`⏹ Recording stopped: ${sessionId}`);
    console.log(`📊 Total chunks: ${session.audioChunks.length}`);

    io.emit('session_status', { sessionId, status: 'processing' });

    try {
      const result = await transcribeAudio(session.audioChunks, sessionId);
      
      console.log(`✅ Transcription complete for ${sessionId}`);
      
      socket.emit('transcription_complete', {
        sessionId,
        transcript: result.transcript,
        summary: result.summary,
      });

      io.emit('session_status', { 
        sessionId, 
        status: 'completed',
        transcript: result.transcript,
        summary: result.summary,
      });

    } catch (error) {
      console.error(`❌ Transcription error: ${error.message}`);
      socket.emit('transcription_error', { sessionId, error: error.message });
      io.emit('session_status', { sessionId, status: 'error', error: error.message });
    } finally {
      activeSessions.delete(socket.id);
    }
  });

  socket.on('disconnect', () => {
    const session = activeSessions.get(socket.id);
    if (session) {
      console.log(`⚠ Client disconnected during recording: ${session.sessionId}`);
      activeSessions.delete(socket.id);
    } else {
      console.log(`✗ Client disconnected: ${socket.id}`);
    }
  });
});

server.listen(PORT, () => {
  console.log(`🚀 Socket.io server running on port ${PORT}`);
  console.log(`📡 CORS enabled for ${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}`);
});