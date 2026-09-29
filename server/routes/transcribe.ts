import { Router, Response } from 'express';
import { AssemblyAI } from 'assemblyai';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth.js';
import { config } from '../config.js';

const router = Router();
router.use(requireAuth);

let assemblyClient: AssemblyAI | null = null;

if (config.ASSEMBLYAI_API_KEY) {
  try {
    assemblyClient = new AssemblyAI({ apiKey: config.ASSEMBLYAI_API_KEY });
    console.log('[Transcribe] AssemblyAI initialized.');
  } catch (err) {
    console.warn('[Transcribe] Failed to initialize AssemblyAI client:', err);
  }
}

// POST /api/transcribe
// Accepts audio as base64 string and transcribes using AssemblyAI
router.post('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { audioBase64, mimeType = 'audio/webm' } = req.body;

    if (!audioBase64) {
      res.status(400).json({ error: 'No audio data provided' });
      return;
    }

    if (!assemblyClient) {
      res.status(503).json({
        error: 'Transcription service not configured. Set ASSEMBLYAI_API_KEY in .env',
      });
      return;
    }

    // Convert base64 to Buffer
    const base64Data = audioBase64.replace(/^data:audio\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    // Upload audio to AssemblyAI then transcribe
    const uploadUrl = await assemblyClient.files.upload(buffer);

    const transcript = await assemblyClient.transcripts.transcribe({
      audio_url: uploadUrl,
      language_code: 'en',
    });

    if (transcript.status === 'error') {
      console.error('[Transcribe] AssemblyAI error:', transcript.error);
      res.status(500).json({ error: transcript.error || 'Transcription failed' });
      return;
    }

    res.json({ text: transcript.text || '' });
  } catch (err: any) {
    console.error('[Transcribe] Error during audio transcription:', err);
    res.status(500).json({ error: err.message || 'Failed to transcribe audio' });
  }
});

export default router;
