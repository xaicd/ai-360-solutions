
/**
 * REAL BACKEND SERVER
 * 
 * To run this:
 * 1. Ensure you have Node.js installed
 * 2. Run the script: sh scripts/init-backend.sh
 * 3. The frontend will point to http://localhost:3001
 */

const express = require('express');
const { PrismaClient } = require('@prisma/client');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const prisma = new PrismaClient();
const PORT = 3001;

app.use(cors());
app.use(bodyParser.json());

// Helper to log actions
const logAction = async (userId, username, action, details, ip) => {
  try {
    // If user doesn't exist (e.g. system action), handle gracefully or ensure user exists
    // For simplicity, we assume userId is valid or we create a 'system' user in seed
    await prisma.auditLog.create({
      data: { userId, username, action, details, ip: ip || '127.0.0.1' }
    });
  } catch (e) {
    console.error("Logging failed:", e.message);
  }
};

// --- Dashboard Stats Route (New for PRD) ---
app.get('/api/stats', async (req, res) => {
  try {
    const [solutionCount, userCount, activeNodes] = await Promise.all([
      prisma.solution.count(),
      prisma.user.count(),
      prisma.solution.count({ where: { status: 'active' } })
    ]);

    // Mock API usage calculation based on solution activity
    const apiUsage = solutionCount * 1500 + Math.floor(Math.random() * 50000);

    res.json({
      success: true,
      data: {
        totalSolutions: solutionCount,
        activeDeployments: activeNodes,
        users: userCount,
        apiUsage: apiUsage,
        systemHealth: 100 // Mock health check
      }
    });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// --- Auth Routes ---

app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  
  try {
    const user = await prisma.user.findUnique({ where: { username } });

    if (user && user.passwordHash === password) {
      await logAction(user.id, user.username, 'LOGIN_SUCCESS', 'User logged in via Admin Portal', req.ip);
      const { passwordHash, ...safeUser } = user;
      res.json({ success: true, data: { ...safeUser, token: 'real-jwt-token' } });
    } else {
      res.status(401).json({ success: false, error: 'Invalid credentials' });
    }
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// --- Solution Routes ---

app.get('/api/solutions', async (req, res) => {
  try {
    const solutions = await prisma.solution.findMany({ orderBy: { createdAt: 'desc' } });
    const parsed = solutions.map(s => ({
      ...s,
      tags: JSON.parse(s.tags || '[]'),
      architectReview: JSON.parse(s.architectReview || '{}')
    }));
    res.json({ success: true, data: parsed });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

app.post('/api/solutions', async (req, res) => {
  try {
    const { userId, ...data } = req.body;
    const payload = {
      ...data,
      tags: JSON.stringify(data.tags),
      architectReview: JSON.stringify(data.architectReview)
    };
    const newSol = await prisma.solution.create({ data: payload });
    await logAction(userId || '1', 'Admin', 'SOLUTION_CREATE', `Created solution: ${newSol.title}`, req.ip);
    res.json({ success: true, data: newSol });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

app.put('/api/solutions/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, userId } = req.body;
    await prisma.solution.update({ where: { id }, data: { status } });
    await logAction(userId || '1', 'Admin', 'SOLUTION_UPDATE', `Updated solution ${id} status to ${status}`, req.ip);
    res.json({ success: true, data: true });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

app.delete('/api/solutions/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;
    await prisma.solution.delete({ where: { id } });
    await logAction(userId || '1', 'Admin', 'SOLUTION_DELETE', `Deleted solution ${id}`, req.ip);
    res.json({ success: true, data: true });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// --- User Routes ---

app.get('/api/users', async (req, res) => {
  try {
    const users = await prisma.user.findMany();
    const safeUsers = users.map(({ passwordHash, ...u }) => u);
    res.json({ success: true, data: safeUsers });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

app.post('/api/users', async (req, res) => {
  try {
    const { creatorId, ...userData } = req.body;
    const newUser = await prisma.user.create({
      data: {
        ...userData,
        passwordHash: '123456', // Default password
        avatar: Math.floor(Math.random() * 1000).toString(),
        lastLogin: new Date().toISOString()
      }
    });
    await logAction(creatorId || '1', 'Admin', 'USER_CREATE', `Created user: ${newUser.username}`, req.ip);
    const { passwordHash, ...safeUser } = newUser;
    res.json({ success: true, data: safeUser });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

app.delete('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { adminId } = req.body; 
    const target = await prisma.user.findUnique({ where: { id } });
    await prisma.user.delete({ where: { id } });
    await logAction(adminId || '1', 'Admin', 'USER_DELETE', `Deleted user: ${target?.username}`, req.ip);
    res.json({ success: true, data: true });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// --- System Routes ---

app.get('/api/system', async (req, res) => {
  try {
    // Configs are stored as { id: 'keyName', value: 'someValue' }
    const configs = await prisma.systemConfig.findMany();
    const configObj = configs.reduce((acc, curr) => ({ ...acc, [curr.id]: curr.value }), {});
    res.json({ success: true, data: configObj });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

app.post('/api/system', async (req, res) => {
  try {
    const { settings, userId } = req.body;
    // Settings is { key: value, key2: value2 }
    for (const [key, value] of Object.entries(settings)) {
      await prisma.systemConfig.upsert({
        where: { id: key },
        update: { value: String(value) },
        create: { id: key, value: String(value) }
      });
    }
    await logAction(userId || '1', 'Admin', 'SYSTEM_UPDATE', 'Updated system configuration', req.ip);
    res.json({ success: true, data: true });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// --- Log Routes ---

app.get('/api/logs', async (req, res) => {
  try {
    const logs = await prisma.auditLog.findMany({
      take: 100,
      orderBy: { createdAt: 'desc' },
      include: { user: false }
    });
    res.json({ success: true, data: logs });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
