// server/transcription.js
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Transcribe audio chunks using Gemini API
 * @param {Array} audioChunks - Array of {data, index, timestamp}
 * @param {String} sessionId - Session identifier
 * @returns {Object} { transcript, summary }
 */
async function transcribeAudio(audioChunks, sessionId) {
  try {
    console.log(`🤖 Starting Gemini transcription for ${sessionId}...`);

    // Sort chunks by index to maintain order
    audioChunks.sort((a, b) => a.index - b.index);

    // For demo: simulate transcription from base64 audio
    // In production, you'd decode and process actual audio
    let fullTranscript = '';
    
    for (let i = 0; i < audioChunks.length; i++) {
      const chunk = audioChunks[i];
      
      // Decode base64 audio chunk
      const audioBuffer = Buffer.from(chunk.data, 'base64');
      
      try {
        // Use Gemini to transcribe each chunk
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
        
        const response = await model.generateContent([
          {
            inlineData: {
              mimeType: 'audio/webm',
              data: chunk.data,
            },
          },
          {
            text: 'Transcribe this audio. If there are multiple speakers, indicate who is speaking. Format: [Speaker]: transcription',
          },
        ]);

        const chunkTranscript = response.response.text();
        fullTranscript += `\n[${Math.floor(chunk.timestamp / 1000)}s] ${chunkTranscript}`;
        
        console.log(`✓ Chunk ${i + 1}/${audioChunks.length} transcribed`);
      } catch (error) {
        console.warn(`⚠ Could not transcribe chunk ${i}: ${error.message}`);
        fullTranscript += `\n[${Math.floor(chunk.timestamp / 1000)}s] [Transcription failed]`;
      }
    }

    // Generate summary using Gemini
    console.log('📝 Generating summary...');
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    
    const summaryResponse = await model.generateContent(
      `Summarize this meeting transcript. Include key points, action items, and decisions:\n\n${fullTranscript}`
    );

    const summary = summaryResponse.response.text();

    return {
      transcript: fullTranscript.trim(),
      summary: summary.trim(),
    };

  } catch (error) {
    console.error('Transcription error:', error);
    throw new Error(`Transcription failed: ${error.message}`);
  }
}

module.exports = { transcribeAudio };