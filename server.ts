import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Removed better-sqlite3 DB initialization as per user request to use localStorage in the frontend instead of a backend DB.

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.set('trust proxy', 1);

  // Middleware to handle CORS and iframe cookie issues
  app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (origin) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Allow-Credentials', 'true');
    } else {
      res.setHeader('Access-Control-Allow-Origin', '*');
    }
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    
    // P3P header for older browsers in iframes
    res.setHeader('P3P', 'CP="IDC DSP COR ADM DEVi TAIi PSA PSD IVAi IVDi CONi HIS OUR IND CNT"');
    
    // Set a dummy cookie with SameSite=None and Secure to help with iframe issues
    res.setHeader('Set-Cookie', 'ais_session_check=1; SameSite=None; Secure; Path=/; Max-Age=3600');
    
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  });

  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // API Routes (Mocked - Now using client-side localStorage)
  app.get('/api/parts', (req, res) => {
    res.json([]);
  });

  app.post('/api/parts', (req, res) => {
    res.json({ success: true });
  });

  app.put('/api/parts/:id', (req, res) => {
    res.json({ success: true });
  });

  app.delete('/api/parts/:id', (req, res) => {
    res.json({ success: true });
  });

  app.get('/api/quizzes', (req, res) => {
    res.json([]);
  });

  app.post('/api/quizzes', (req, res) => {
    res.json({ success: true });
  });

  app.put('/api/quizzes/:id', (req, res) => {
    res.json({ success: true });
  });

  app.delete('/api/quizzes/:id', (req, res) => {
    res.json({ success: true });
  });

  // Bulk Quiz Import
  app.post('/api/quizzes/bulk', (req, res) => {
    res.json({ success: true });
  });

  // Bulk Parts Import
  app.post('/api/parts/bulk', (req, res) => {
    res.json({ success: true });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get('*', (req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
    } else {
      console.error(`Dist path not found: ${distPath}`);
      app.get('*', (req, res) => {
        res.status(404).send('Application not built. Please run npm run build.');
      });
    }
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
