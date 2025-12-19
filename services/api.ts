
import { prisma as prismaLocal } from './db';
import { AdminUser, Solution, AuditLog, ApiResponse, UserRole } from '../types';

// ==========================================
// CONFIGURATION SWITCH
// Set this to TRUE to use the real Node.js server (server/index.js)
// Set this to FALSE to use the Browser Simulation (AlaSQL)
// ==========================================
const USE_REAL_BACKEND = false; 

const API_BASE_URL = 'http://localhost:3001/api';

/**
 * Local Simulation Implementation
 */
const localApi = {
  dashboard: {
    stats: async (): Promise<ApiResponse<any>> => {
      // Aggregate stats from local DB
      const solCount = (await prismaLocal.solution.findMany()).length;
      const userCount = (await prismaLocal.user.findMany()).length;
      const activeCount = (await prismaLocal.solution.findMany()).filter(s => s.status === 'active').length;
      const apiUsage = solCount * 1200 + 5000; // Mock calculation

      return {
        success: true,
        data: {
          totalSolutions: solCount,
          activeDeployments: activeCount,
          users: userCount,
          apiUsage: apiUsage,
          systemHealth: 100
        },
        timestamp: new Date().toISOString()
      }
    }
  },
  auth: {
    login: async (username: string, password: string): Promise<ApiResponse<AdminUser>> => {
      await new Promise(r => setTimeout(r, 300));
      const user = await prismaLocal.user.findUnique({ where: { username } });
      
      if (user && user.passwordHash === password) {
        const adminUser: AdminUser = {
          id: user.id, username: user.username, role: user.role as UserRole,
          avatar: user.avatar, lastLogin: new Date().toISOString(), isActive: user.isActive,
          token: `mock-jwt-${Date.now()}`
        };
        await prismaLocal.auditLog.create({
          data: { userId: user.id, username: user.username, action: 'LOGIN_SUCCESS', ip: '127.0.0.1', details: 'Local Login', createdAt: new Date().toISOString() }
        });
        return { success: true, data: adminUser, timestamp: new Date().toISOString() };
      }
      return { success: false, error: 'Invalid credentials', timestamp: new Date().toISOString() };
    }
  },
  solutions: {
    list: async (): Promise<ApiResponse<Solution[]>> => {
      const data = await prismaLocal.solution.findMany({ orderBy: { createdAt: 'desc' } });
      return { success: true, data, timestamp: new Date().toISOString() };
    },
    create: async (solution: Solution, userId: string): Promise<ApiResponse<Solution>> => {
      const newSol = await prismaLocal.solution.create({ data: solution });
      return { success: true, data: newSol, timestamp: new Date().toISOString() };
    },
    updateStatus: async (id: string, status: 'active' | 'pending' | 'deprecated', userId: string): Promise<ApiResponse<boolean>> => {
      await prismaLocal.solution.update({ where: { id }, data: { status } });
      return { success: true, data: true, timestamp: new Date().toISOString() };
    },
    delete: async (id: string, userId: string): Promise<ApiResponse<boolean>> => {
      await prismaLocal.solution.delete({ where: { id } });
      return { success: true, data: true, timestamp: new Date().toISOString() };
    }
  },
  users: {
    list: async (): Promise<ApiResponse<AdminUser[]>> => {
      const users = await prismaLocal.user.findMany();
      return { success: true, data: users as any, timestamp: new Date().toISOString() };
    },
    create: async (user: Partial<AdminUser>, creatorId: string): Promise<ApiResponse<AdminUser>> => {
      const newUser = await prismaLocal.user.create({
         data: {
           username: user.username || 'newuser',
           role: user.role || UserRole.AUDITOR,
           passwordHash: '123456',
           avatar: Math.floor(Math.random() * 1000).toString(),
           isActive: true,
           lastLogin: new Date().toISOString()
         }
      });
      await prismaLocal.auditLog.create({
        data: { userId: creatorId, username: 'Admin', action: 'USER_CREATE', ip: '127.0.0.1', details: `Created user ${newUser.username}`, createdAt: new Date().toISOString() }
      });
      return { success: true, data: newUser as any, timestamp: new Date().toISOString() };
    },
    delete: async (id: string, adminId: string): Promise<ApiResponse<boolean>> => {
      await prismaLocal.user.delete({ where: { id } });
      await prismaLocal.auditLog.create({
        data: { userId: adminId, username: 'Admin', action: 'USER_DELETE', ip: '127.0.0.1', details: `Deleted user ${id}`, createdAt: new Date().toISOString() }
      });
      return { success: true, data: true, timestamp: new Date().toISOString() };
    }
  },
  logs: {
    list: async (): Promise<ApiResponse<AuditLog[]>> => {
      const logs = await prismaLocal.auditLog.findMany({ take: 100, orderBy: { createdAt: 'desc' } });
      return { success: true, data: logs, timestamp: new Date().toISOString() };
    },
    create: async (userId: string, username: string, action: string, details: string) => {
       await prismaLocal.auditLog.create({
        data: { userId, username, action, ip: '127.0.0.1', details, createdAt: new Date().toISOString() }
      });
    }
  },
  system: {
    get: async (): Promise<ApiResponse<Record<string, string>>> => {
      const configs = await prismaLocal.systemConfig.findMany();
      // DB has { id, value }, Frontend expects { [key]: value }
      const configObj = configs.reduce((acc: any, curr: any) => ({ ...acc, [curr.id]: curr.value }), {});
      return { success: true, data: configObj, timestamp: new Date().toISOString() };
    },
    update: async (settings: Record<string, string | boolean>, userId: string): Promise<ApiResponse<boolean>> => {
      for (const [key, value] of Object.entries(settings)) {
        await prismaLocal.systemConfig.upsert({
          where: { id: key },
          update: { value: String(value) },
          create: { id: key, value: String(value) }
        });
      }
      await prismaLocal.auditLog.create({
        data: { userId, username: 'Admin', action: 'SYSTEM_UPDATE', ip: '127.0.0.1', details: 'Updated system configuration', createdAt: new Date().toISOString() }
      });
      return { success: true, data: true, timestamp: new Date().toISOString() };
    }
  }
};

/**
 * Real Remote Backend Implementation (fetch)
 */
const remoteApi = {
  dashboard: {
    stats: async (): Promise<ApiResponse<any>> => {
      const res = await fetch(`${API_BASE_URL}/stats`);
      return res.json();
    }
  },
  auth: {
    login: async (username: string, password: string): Promise<ApiResponse<AdminUser>> => {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      return res.json();
    }
  },
  solutions: {
    list: async (): Promise<ApiResponse<Solution[]>> => {
      const res = await fetch(`${API_BASE_URL}/solutions`);
      return res.json();
    },
    create: async (solution: Solution, userId: string): Promise<ApiResponse<Solution>> => {
      const res = await fetch(`${API_BASE_URL}/solutions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...solution, userId })
      });
      return res.json();
    },
    updateStatus: async (id: string, status: string, userId: string): Promise<ApiResponse<boolean>> => {
      const res = await fetch(`${API_BASE_URL}/solutions/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, userId })
      });
      return res.json();
    },
    delete: async (id: string, userId: string): Promise<ApiResponse<boolean>> => {
      const res = await fetch(`${API_BASE_URL}/solutions/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });
      return res.json();
    }
  },
  users: {
    list: async (): Promise<ApiResponse<AdminUser[]>> => {
      const res = await fetch(`${API_BASE_URL}/users`);
      return res.json();
    },
    create: async (user: Partial<AdminUser>, creatorId: string): Promise<ApiResponse<AdminUser>> => {
      const res = await fetch(`${API_BASE_URL}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...user, creatorId })
      });
      return res.json();
    },
    delete: async (id: string, adminId: string): Promise<ApiResponse<boolean>> => {
      const res = await fetch(`${API_BASE_URL}/users/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminId })
      });
      return res.json();
    }
  },
  logs: {
    list: async (): Promise<ApiResponse<AuditLog[]>> => {
      const res = await fetch(`${API_BASE_URL}/logs`);
      return res.json();
    },
    create: async (userId: string, username: string, action: string, details: string) => {
      console.log("Log sent to server:", action);
    }
  },
  system: {
    get: async (): Promise<ApiResponse<Record<string, string>>> => {
      const res = await fetch(`${API_BASE_URL}/system`);
      return res.json();
    },
    update: async (settings: Record<string, string | boolean>, userId: string): Promise<ApiResponse<boolean>> => {
      const res = await fetch(`${API_BASE_URL}/system`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings, userId })
      });
      return res.json();
    }
  }
};

// Export the selected API implementation
export const api = USE_REAL_BACKEND ? remoteApi : localApi;
