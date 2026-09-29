import app from '../server/index.js';

export default function handler(req: any, res: any) {
  // Restore original /api/... subpath when Vercel rewrites through /api?match=...
  const match = req.query?.match;
  if (match) {
    const subpath = Array.isArray(match) ? match.join('/') : match;
    try {
      const urlObj = new URL(req.url, 'http://localhost');
      urlObj.searchParams.delete('match');
      const search = urlObj.search;
      req.url = `/api/${subpath}${search}`;
    } catch {
      req.url = `/api/${subpath}`;
    }
  } else if (req.headers && req.headers['x-forwarded-uri']) {
    req.url = req.headers['x-forwarded-uri'];
  }

  return app(req, res);
}
