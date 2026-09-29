import { Router, Response } from 'express';
import Groq, { toFile } from 'groq-sdk';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth.js';
import { config } from '../config.js';

const router = Router();
router.use(requireAuth);

let groqClient: Groq | null = null;
const apiKey = process.env.WHISPER_API_KEY || config.GROQ_API_KEY;

if (apiKey && apiKey.startsWith('gsk_')) {
  try {
    groqClient = new Groq({ apiKey });
  } catch (err) {
    console.warn('[Transcribe] Failed to initialize Groq client:', err);
  }
}

// POST /api/transcribe
router.post('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { audioBase64, mimeType = 'audio/webm' } = req.body;

    if (!audioBase64) {
      res.status(400).json({ error: 'No audio data provided' });
      return;
    }

    if (!groqClient) {
      const currentKey = process.env.WHISPER_API_KEY || config.GROQ_API_KEY;
      if (currentKey && currentKey.startsWith('gsk_')) {
        groqClient = new Groq({ apiKey: currentKey });
      }
    }

    if (!groqClient) {
      res.status(503).json({
        error:
          'Transcription API key not configured. Set GROQ_API_KEY or WHISPER_API_KEY in .env',
      });
      return;
    }

    // Convert Base64 string to Buffer
    const base64Data = audioBase64.replace(/^data:audio\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    // Create file object for Groq Whisper
    const file = await toFile(buffer, 'dictation.webm', { type: mimeType });

    const transcription = await groqClient.audio.transcriptions.create({
      file,
      model: 'whisper-large-v3-turbo',
      language: 'en',
      response_format: 'json',
    });

    res.json({
      text: transcription.text,
    });
  } catch (err: any) {
    console.error('[Transcribe] Error during audio transcription:', err);
    res.status(500).json({ error: err.message || 'Failed to transcribe audio' });
  }
});

export default router;
