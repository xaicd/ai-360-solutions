
import { AdminUser, Solution, AuditLog, ApiResponse, UserRole, DigitalAgent } from '../types';

// ==========================================
// CLIENT-SIDE API SERVICE
// Connects to the Express Backend (http://localhost:3001/api)
// ==========================================

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

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
    },
    register: async (data: any): Promise<ApiResponse<AdminUser>> => {
      try {
        const res = await fetch(`${API_BASE_URL}/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        return await res.json();
      } catch (e) {
        return { success: false, error: 'Network Error', timestamp: new Date().toISOString() };
      }
    },
    sendCode: async (target: string, type: 'email' | 'phone'): Promise<ApiResponse<boolean>> => {
      try {
        const res = await fetch(`${API_BASE_URL}/auth/send-code`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ target, type })
        });
        return await res.json();
      } catch (e) { return { success: false, error: 'Network Error' }; }
    },
    bind: async (data: { userId: string, type: 'email' | 'phone', value: string, code: string }): Promise<ApiResponse<boolean>> => {
      try {
        const res = await fetch(`${API_BASE_URL}/auth/bind`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        return await res.json();
      } catch (e) { return { success: false, error: 'Network Error' }; }
    }
  },
  console: {
    orders: async (userId: string): Promise<ApiResponse<any>> => {
      try {
        const res = await fetch(`${API_BASE_URL}/console/orders?userId=${userId}`);
        return await res.json();
      } catch (e) {
        return { success: false, error: 'Network Error', timestamp: new Date().toISOString() };
      }
    },
    resources: async (userId: string): Promise<ApiResponse<any>> => {
      try {
        const res = await fetch(`${API_BASE_URL}/console/resources?userId=${userId}`);
        return await res.json();
      } catch (e) {
        return { success: false, error: 'Network Error', timestamp: new Date().toISOString() };
      }
    },
    workforce: async (userId: string): Promise<ApiResponse<DigitalAgent[]>> => {
      try {
        const res = await fetch(`${API_BASE_URL}/console/workforce?userId=${userId}`);
        return await res.json();
      } catch (e) {
        return { success: false, error: 'Network Error', timestamp: new Date().toISOString() };
      }
    },
    buy: async (data: { userId: string, solutionId: string, tier: string, price: number, currency?: string }): Promise<{ success: boolean, orderId?: string, error?: string }> => {
      try {
        const res = await fetch(`${API_BASE_URL}/console/buy`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        return await res.json();
      } catch (e) { return { success: false, error: 'Network Error' }; }
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
    create: async (solution: Partial<Solution>, userId: string): Promise<ApiResponse<Solution>> => {
      try {
        const res = await fetch(`${API_BASE_URL}/solutions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(solution)
        });
        return await res.json();
      } catch (e) {
        return { success: false, error: 'Network Error', timestamp: new Date().toISOString() };
      }
    },
    update: async (id: string, data: Partial<Solution>, userId: string): Promise<ApiResponse<boolean>> => {
      try {
        const res = await fetch(`${API_BASE_URL}/solutions/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        return await res.json();
      } catch (e) {
        return { success: false, error: 'Network Error', timestamp: new Date().toISOString() };
      }
    },
    updateStatus: async (id: string, status: string, userId: string): Promise<ApiResponse<boolean>> => {
      return remoteApi.solutions.update(id, { status: status as any }, userId);
    },
    delete: async (id: string, userId: string): Promise<ApiResponse<boolean>> => {
      // Mock delete for now
      return { success: true, data: true, timestamp: new Date().toISOString() };
    }
  },
  agents: {
    list: async (): Promise<ApiResponse<DigitalAgent[]>> => {
      try {
        const res = await fetch(`${API_BASE_URL}/agents`);
        return await res.json();
      } catch (e) {
        return { success: false, error: 'Network Error', timestamp: new Date().toISOString() };
      }
    },
    create: async (data: Partial<DigitalAgent>): Promise<ApiResponse<DigitalAgent>> => {
      try {
        const res = await fetch(`${API_BASE_URL}/agents`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        return await res.json();
      } catch (e) {
        return { success: false, error: 'Network Error', timestamp: new Date().toISOString() };
      }
    },
    update: async (id: string, data: Partial<DigitalAgent>): Promise<ApiResponse<DigitalAgent>> => {
      try {
        const res = await fetch(`${API_BASE_URL}/agents/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        return await res.json();
      } catch (e) {
        return { success: false, error: 'Network Error', timestamp: new Date().toISOString() };
      }
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
  },
  cloud: {
    listProviders: async (): Promise<ApiResponse<any[]>> => {
      try {
        const res = await fetch(`${API_BASE_URL}/cloud/providers`);
        return await res.json();
      } catch (e) { return { success: false, error: 'Network Error', timestamp: new Date().toISOString() }; }
    },
    addProvider: async (data: any): Promise<ApiResponse<any>> => {
      try {
        const res = await fetch(`${API_BASE_URL}/cloud/providers`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        return await res.json();
      } catch (e) { return { success: false, error: 'Network Error', timestamp: new Date().toISOString() }; }
    },
    plan: async (data: any): Promise<{ success: boolean, resourceId?: string, logs?: string, error?: string }> => {
      try {
        const res = await fetch(`${API_BASE_URL}/cloud/provision/plan`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        return await res.json();
      } catch (e: any) { return { success: false, error: 'Network Error' }; }
    },
    apply: async (data: { resourceId: string }): Promise<{ success: boolean, logs?: string, outputs?: any, error?: string }> => {
      try {
        const res = await fetch(`${API_BASE_URL}/cloud/provision/apply`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        return await res.json();
      } catch (e: any) { return { success: false, error: 'Network Error' }; }
    }
  }
};

export const api = remoteApi;
