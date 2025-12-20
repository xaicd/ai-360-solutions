
import { AdminUser, Solution, AuditLog, ApiResponse, UserRole } from '../types';

// ==========================================
// CLIENT-SIDE API SERVICE
// Connects to the Express Backend (http://localhost:3001/api)
// ==========================================

const API_BASE_URL = 'http://localhost:3001/api';

/**
 * Remote Backend Implementation
 */
const remoteApi = {
  dashboard: {
    stats: async (): Promise<ApiResponse<any>> => {
      try {
        const res = await fetch(`${API_BASE_URL}/stats`);
        return await res.json();
      } catch (e) {
        return { success: false, error: 'Network Error', timestamp: new Date().toISOString() };
      }
    }
  },
  auth: {
    login: async (username: string, password: string): Promise<ApiResponse<AdminUser>> => {
      try {
        const res = await fetch(`${API_BASE_URL}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password })
        });
        return await res.json();
      } catch (e) {
        return { success: false, error: 'Auth Network Error', timestamp: new Date().toISOString() };
      }
    }
  },
  solutions: {
    list: async (): Promise<ApiResponse<Solution[]>> => {
      try {
        const res = await fetch(`${API_BASE_URL}/solutions`);
        return await res.json();
      } catch (e) {
        return { success: false, error: 'Network Error', timestamp: new Date().toISOString() };
      }
    },
    create: async (solution: Solution, userId: string): Promise<ApiResponse<Solution>> => {
      // Logic to be implemented in backend
      return { success: false, error: 'Not implemented in this version', timestamp: new Date().toISOString() };
    },
    updateStatus: async (id: string, status: string, userId: string): Promise<ApiResponse<boolean>> => {
      // Logic to be implemented in backend
      return { success: true, data: true, timestamp: new Date().toISOString() };
    },
    delete: async (id: string, userId: string): Promise<ApiResponse<boolean>> => {
      // Logic to be implemented in backend
      return { success: true, data: true, timestamp: new Date().toISOString() };
    }
  },
  users: {
    list: async (): Promise<ApiResponse<AdminUser[]>> => {
      try {
        const res = await fetch(`${API_BASE_URL}/users`);
        return await res.json();
      } catch (e) {
        return { success: false, error: 'Network Error', timestamp: new Date().toISOString() };
      }
    },
    create: async (user: Partial<AdminUser>, creatorId: string): Promise<ApiResponse<AdminUser>> => {
      return { success: false, error: 'Not implemented', timestamp: new Date().toISOString() };
    },
    delete: async (id: string, adminId: string): Promise<ApiResponse<boolean>> => {
      return { success: false, error: 'Not implemented', timestamp: new Date().toISOString() };
    }
  },
  logs: {
    list: async (): Promise<ApiResponse<AuditLog[]>> => {
      try {
        const res = await fetch(`${API_BASE_URL}/logs`);
        return await res.json();
      } catch (e) {
        return { success: false, error: 'Network Error', timestamp: new Date().toISOString() };
      }
    },
    create: async (userId: string, username: string, action: string, details: string) => {
      // Fire and forget log
      console.log("Audit:", action);
    }
  },
  system: {
    get: async (): Promise<ApiResponse<Record<string, string>>> => {
      try {
        const res = await fetch(`${API_BASE_URL}/system`);
        return await res.json();
      } catch (e) {
        return { success: false, error: 'Network Error', timestamp: new Date().toISOString() };
      }
    },
    update: async (settings: Record<string, string | boolean>, userId: string): Promise<ApiResponse<boolean>> => {
      return { success: true, data: true, timestamp: new Date().toISOString() };
    }
  }
};

export const api = remoteApi;
