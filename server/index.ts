import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Routes
import { authRoutes } from './routes/auth.routes';
import { consoleRoutes } from './routes/console.routes';
import { solutionRoutes } from './routes/solution.routes';
import { mcpRoutes } from './routes/mcp.routes';
import { adminRoutes } from './routes/admin.routes';
import { cloudRoutes } from './routes/cloud.routes';

const app = express();
const port = process.env.PORT || 3001;
const HOST_URL = process.env.HOST_URL || `http://localhost:${port}`;

// Security Middleware
app.use(helmet({
    contentSecurityPolicy: false,
}));
app.use(cors());
app.use(express.json());

// Serve Static Files (Unified Build)
app.use(express.static(path.join(__dirname, '../dist')));

// Rate Limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: { success: false, error: "Too many requests" }
});
app.use('/api/', limiter);

// --- API Routes ---

// Health Check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', uptime: process.uptime(), timestamp: new Date().toISOString() });
});

// Mounted Routers
app.use('/api/auth', authRoutes);
app.use('/api/console', consoleRoutes);
app.use('/api/mcp', mcpRoutes);
app.use('/api/cloud', cloudRoutes); // Multi-Cloud Terraform
app.use('/api', solutionRoutes); // /solutions, /agents (Public/Store)
app.use('/api', adminRoutes);    // /stats, /users, /cloud, /finance

// SPA Fallback
app.get(/.*/, (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
});

// Start Server
app.listen(port, () => {
    console.log(`
  🚀 AI 360 Backend Core is running at ${HOST_URL}
  `);
});
