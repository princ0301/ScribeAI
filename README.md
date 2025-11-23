# ScribeAI - AI-Powered Meeting Transcription

A full-stack application that captures, transcribes, and summarizes audio sessions in real-time using Google Gemini API and WebSocket communication.

**Live Features:**
- Real-time audio recording (microphone & tab-share)
- Live transcription via Gemini API
- Automatic AI-generated summaries
- Real-time status updates via Socket.io
- Session persistence in PostgreSQL
- Session history & management
- Export transcripts as text files

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    Browser (Frontend)                    │
│  Next.js 14 + React 18 + TypeScript + Tailwind          │
│  - RecordingInterface (Audio capture)                    │
│  - TranscriptViewer (Display results)                    │
│  - SessionHistory (Session management)                   │
└───────────┬──────────────────────────┬──────────────────┘
            │                          │
    WebSocket (Socket.io)    MediaRecorder API
            │                          │
            ▼                          ▼
┌─────────────────────────────────────────────────────────┐
│              Node.js WebSocket Server                    │
│  - Audio chunk buffering (30s chunks)                    │
│  - Session state management                              │
│  - Real-time broadcast updates                           │
└───────────┬──────────────────────┬──────────────────────┘
            │                      │
            ▼                      ▼
      Google Gemini API      PostgreSQL (Neon)
      (Transcription)        (Data Persistence)
```

---

## Architecture Comparison: Streaming vs. Upload

| Aspect | Streaming (Current) | Upload Approach |
|--------|-------------------|-----------------|
| **Latency** | 30s | Full recording duration |
| **Memory Usage** | Low (30s buffers) | High (full audio in memory) |
| **User Experience** | Real-time feedback | Wait until complete |
| **Reliability** | Connection drop = current chunk loss | Connection drop = full retry |
| **API Cost** | Incremental calls | Single large request |
| **Scalability** | Better for 1hr+ sessions | Limited to file size |
| **Bandwidth** | Reduced (streaming) | High (single upload) |

**Why we chose Streaming:**
- Supports up to 1+ hour recordings without memory overload
- Real-time UI updates keep users engaged
- Lower bandwidth requirements
- Better fault tolerance with chunked approach

---

## Quick Start (5 minutes)

### Prerequisites
- Node.js 18+
- Git
- Neon PostgreSQL database
- Gemini API key

### Clone & Install
```bash
git clone https://github.com/princ0301/ScribeAI.git
cd ScribeAI
npm install
```

### Setup Environment
Create `.env.local`:
```env
GEMINI_API_KEY=
DATABASE_URL="postgresql:"
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Setup Database
```bash
npx prisma migrate dev --name init
npx prisma generate
```

### Start Services

**Terminal 1 - WebSocket Server:**
```bash
npm run socket-server
```
Expected output: `Socket.io server running on port 3001`

**Terminal 2 - Next.js App:**
```bash
npm run dev
```
Expected output: `ready - started server on 0.0.0.0:3000`

### Open Browser
Navigate to: **http://localhost:3000**

---

## Project Structure

```
scribeai/
├── app/
│   ├── layout.tsx                 # Root layout
│   ├── page.tsx                   # Landing page
│   ├── globals.css                # Global styles
│   └── dashboard/
│       ├── page.tsx               # Main dashboard
│       └── sessions/
│           └── [id]/
│               └── page.tsx       # Session detail view
├── components/
│   ├── RecordingInterface.tsx     # Recording controls
│   ├── TranscriptViewer.tsx       # Display transcripts
│   └── SessionHistory.tsx         # Session list
├── lib/
│   └── socket-client.ts           # Socket.io hook
├── server/
│   ├── socket-server.js           # WebSocket server
│   └── transcription.js           # Gemini integration
├── prisma/
│   ├── schema.prisma              # Database schema
│   └── migrations/                # Migration history
├── types/
│   └── index.ts                   # TypeScript definitions
├── .env.local                     # Environment variables
├── package.json
├── tsconfig.json
├── next.config.js
└── tailwind.config.js
```

## Configuration

### Prisma Database Setup
```bash
# Generate Prisma client
npx prisma generate

# Create/update database
npx prisma db push

# Open database GUI
npx prisma studio
```

## Usage Flow

### 1. Start Recording
- Go to Dashboard
- Click "New Session" or "Start Recording"
- Choose: **Microphone** or **Tab Share**
- Grant browser permissions

### 2. Recording Interface
- **Start:** Click "Start Recording" button
- **Pause/Resume:** Use pause button during recording
- **Stop:** Click "Stop" to process

### 3. Processing
- Server receives 30-second audio chunks
- Gemini transcribes each chunk
- Auto-generated summary after completion

### 4. View Results
- Full transcript with timestamps
- AI-generated summary
- Copy or download options

### 5. Session History
- All sessions saved in PostgreSQL
- View past recordings anytime
- Delete sessions as needed

---

## Core Features Explained

### Real-time Streaming Pipeline
```
User speaks → MediaRecorder buffers (1s)
  ↓
Every 1 second → Convert to base64 audio
  ↓
Emit via Socket.io → Server receives
  ↓
Accumulate in memory (30s chunks)
  ↓
Send to Gemini API → Transcription response
  ↓
Broadcast back to client → Display in UI
```

### State Management
Recording states:
- `idle` - Ready to record
- `recording` - Currently recording
- `paused` - Recording paused
- `processing` - Generating summary
- `completed` - Ready to view

### Error Handling
- **Network Drop:** Current chunk lost, user can resume
- **Device Off:** Session saves progress up to last chunk
- **API Error:** Graceful fallback with error message
- **Permission Denied:** Clear error prompt

---

## WebSocket Events

### Client → Server
```javascript
socket.emit('start_recording', { sessionId, userId })
socket.emit('audio_chunk', { sessionId, audioData, chunkIndex })
socket.emit('pause_recording', {})
socket.emit('resume_recording', {})
socket.emit('stop_recording', { sessionId })
```

### Server → Client
```javascript
socket.on('recording_started', { sessionId, timestamp })
socket.on('chunk_received', { chunkIndex, status })
socket.on('session_status', { sessionId, status })
socket.on('transcription_complete', { transcript, summary })
socket.on('transcription_error', { error })
```

---

## Testing Locally

### Test Mic Recording
1. Dashboard → Start Recording
2. Choose "Microphone"
3. Speak for 10-15 seconds
4. Stop recording
5. Wait for transcription

### Test Tab Share
1. Open Google Meet/Zoom/any audio source
2. Start recording
3. Choose "Tab Share"
4. Select tab/screen
5. Stop recording

### Test Full Flow
```bash
# Terminal 1
npm run socket-server

# Terminal 2
npm run dev

# Browser: http://localhost:3000/dashboard
# Record 30 seconds → Stop → Check transcript
```

## Long-Session Scalability (200+ words)

**Challenge:** Handling 1+ hour recordings without memory overload.

**Solution Architecture:**
1. **Client-side Chunking:** MediaRecorder emits data every 1 second, auto-converted to 30-second chunks before transmission
2. **Server Buffering:** Node.js server maintains in-memory buffers per session, clearing after Gemini API call
3. **Database Chunking:** Each 30-second chunk stored as TranscriptionChunk record with order index
4. **WebSocket Broadcasting:** Real-time updates prevent UI blocking while processing
5. **Fault Tolerance:** Session recovery on connection drop - only last chunk lost, not entire recording
 
## Technology Stack

- **Frontend:** Next.js 14, React 18, TypeScript, Tailwind CSS
- **Backend:** Node.js, Express, Socket.io
- **Database:** PostgreSQL (Neon), Prisma ORM
- **AI:** Google Gemini API
- **Authentication:** (Optional) Better Auth
- **Deployment:** Vercel, Railway

---

## License

MIT - Feel free to use for personal/commercial projects

---

## Contributing

Pull requests welcome! Areas needing help:
- [ ] Multi-language transcription support
- [ ] Speaker identification ML model
- [ ] Mobile app (React Native)
- [ ] Desktop app (Electron)

---

## Support

Issues? Check:
1. Terminal logs for errors
2. Browser console (F12)
3. Prisma Studio for database state
4. Socket.io server logs

---
