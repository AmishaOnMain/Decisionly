import express, { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from './config.js';
import { runMigrations } from './db/migrate.js';

import authRoutes from './routes/auth.js';
import personalContextRoutes from './routes/personalContext.js';
import decisionsRoutes from './routes/decisions.js';
import exportRoutes from './routes/export.js';
import accountRoutes from './routes/account.js';
import transcribeRoutes from './routes/transcribe.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

if (config.TRUST_PROXY) {
  app.set('trust proxy', 1);
}

// Security headers
app.use(
  helmet({
    contentSecurityPolicy: false, // Allows Vite inline dev scripts & fonts
    crossOriginEmbedderPolicy: false,
  })
);

// CORS configuration
app.use(
  cors({
    origin: config.NODE_ENV === 'production' ? config.APP_BASE_URL : ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:3000'],
    credentials: true,
  })
);

// Body parsers with bounded limit
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));
app.use(cookieParser());

// Rate Limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Please try again shortly.' },
});

app.use('/api/', apiLimiter);

// Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'Decisionly API',
  });
});

// Mount API routes
app.use('/api/auth', authRoutes);
app.use('/api/personal-context', personalContextRoutes);
app.use('/api/decisions', decisionsRoutes);
app.use('/api/export', exportRoutes);
app.use('/api/account', accountRoutes);
app.use('/api/transcribe', transcribeRoutes);

// Global Error Handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('[Decisionly Error]', err?.message || err);
  const status = err.status || 500;
  const message = config.NODE_ENV === 'production' && status === 500
    ? 'An unexpected server error occurred.'
    : err.message || 'Internal server error';

  res.status(status).json({ error: message });
});

// Serve frontend in production build if present
const clientDist = path.resolve(__dirname, '../dist/client');
app.use(express.static(clientDist));
app.get('*', (req: Request, res: Response, next: NextFunction) => {
  if (req.path.startsWith('/api')) {
    res.status(404).json({ error: 'Endpoint not found' });
    return;
  }
  const indexHtml = path.resolve(clientDist, 'index.html');
  res.sendFile(indexHtml, (err) => {
    if (err) {
      // In dev mode when client runs on Vite 5173
      res.status(404).send('API Server running on port ' + config.PORT + '. Open Vite dev server on http://localhost:5173');
    }
  });
});

async function startServer() {
  await runMigrations();

  app.listen(config.PORT, () => {
    console.log(`🚀 Decisionly API running at http://localhost:${config.PORT}`);
    console.log(`✨ Environment: ${config.NODE_ENV}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

export default app;
