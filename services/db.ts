
import { Solution, User, UserRole, AuditLog } from '../types';

declare global {
  interface Window {
    alasql: any;
  }
}

class PrismaLite {
  private dbId = 'ai360_prisma_lite_v7';
  private initialized = false;

  constructor() {}

  private run(sql: string, params: any[] = []): any {
    if (!window.alasql) return [];
    try {
      return window.alasql(sql, params);
    } catch (e) {
      console.error("DB Error:", e, sql);
      return [];
    }
  }

  private async ensureInitialized() {
    if (this.initialized) return;
    this.run(`CREATE LOCALSTORAGE DATABASE IF NOT EXISTS ${this.dbId}`);
    this.run(`ATTACH LOCALSTORAGE DATABASE ${this.dbId}`);
    this.run(`USE ${this.dbId}`);
    this.createTables();
    this.seed();
    this.initialized = true;
  }

  private createTables() {
    this.run(`
      CREATE TABLE IF NOT EXISTS User (
        id STRING PRIMARY KEY,
        username STRING,
        passwordHash STRING,
        role STRING,
        avatar STRING,
        lastLogin DATETIME,
        isActive BOOLEAN,
        createdAt DATETIME
      )
    `);

    this.run(`
      CREATE TABLE IF NOT EXISTS Solution (
        id STRING PRIMARY KEY,
        title STRING,
        description STRING,
        industry STRING,
        githubRepo STRING,
        stars INT,
        tags STRING,
        scenarios STRING,
        deploymentDifficulty STRING,
        matchScore INT,
        architectReview STRING,
        status STRING,
        price NUMBER,
        currency STRING,
        executionPlan STRING,
        verticalLLMConfig STRING,
        createdAt DATETIME,
        updatedAt DATETIME
      )
    `);

    this.run(`
      CREATE TABLE IF NOT EXISTS AuditLog (
        id INT AUTO_INCREMENT PRIMARY KEY,
        userId STRING,
        username STRING,
        action STRING,
        ip STRING,
        details STRING,
        createdAt DATETIME
      )
    `);

    this.run(`
      CREATE TABLE IF NOT EXISTS SystemConfig (
        id STRING PRIMARY KEY, 
        settingValue STRING,
        updatedAt DATETIME
      )
    `);
  }

  private seed() {
    const count = this.run("SELECT COUNT(*) as cnt FROM User")[0].cnt;
    if (count === 0) {
      const users = [
        { id: '1', username: 'admin', passwordHash: 'admin', role: 'SUPER_ADMIN', avatar: '1' },
        { id: '2', username: 'architect', passwordHash: '123', role: 'SOLUTION_ARCHITECT', avatar: '2' }
      ];
      users.forEach(u => {
        this.run("INSERT INTO User VALUES (?,?,?,?,?,?,?,?)", [
          u.id, u.username, u.passwordHash, u.role, u.avatar, 
          new Date().toISOString(), true, new Date().toISOString()
        ]);
      });

      const sols = [
        { 
          id: '1', title: 'LegalContract AI', description: 'Automated contract review and risk analysis.',
          industry: 'Legal', githubRepo: 'law-ai/contracts', stars: 1204,
          tags: ['NLP', 'Legal'], scenarios: ['Contract Review', 'Risk Assessment'],
          deploymentDifficulty: 'Medium', matchScore: 95,
          architectReview: { qualityScore: 92, securityVerdict: 'Ready', codeMaintainability: 'High' },
          status: 'active', price: 12800, currency: 'CNY'
        }
      ];

      sols.forEach(s => {
        const now = new Date().toISOString();
        this.run("INSERT INTO Solution VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)", [
          s.id, s.title, s.description, s.industry, s.githubRepo, s.stars,
          JSON.stringify(s.tags), JSON.stringify(s.scenarios), s.deploymentDifficulty, s.matchScore,
          JSON.stringify(s.architectReview), s.status, s.price, s.currency,
          JSON.stringify({}), JSON.stringify({}), now, now
        ]);
      });

      const now = new Date().toISOString();
      this.run("INSERT INTO SystemConfig VALUES (?,?,?)", ['maintenanceMode', 'false', now]);
    }
  }

  public user = {
    findMany: async (): Promise<User[]> => {
      await this.ensureInitialized();
      return this.run("SELECT * FROM User");
    },
    findUnique: async (args: { where: { username?: string, id?: string } }): Promise<User | null> => {
      await this.ensureInitialized();
      let res = args.where.username 
        ? this.run("SELECT * FROM User WHERE LOWER(username) = LOWER(?)", [args.where.username])
        : this.run("SELECT * FROM User WHERE id = ?", [args.where.id]);
      return res.length ? res[0] : null;
    },
    create: async (args: { data: Partial<User> }) => {
      await this.ensureInitialized();
      const u = args.data;
      const now = new Date().toISOString();
      this.run("INSERT INTO User VALUES (?,?,?,?,?,?,?,?)", [
        u.id || Math.random().toString(36).substr(2, 9), 
        u.username, u.passwordHash, u.role, u.avatar, 
        u.lastLogin || now, u.isActive ?? true, now
      ]);
      return u as User;
    },
    delete: async (args: { where: { id: string } }) => {
      await this.ensureInitialized();
      this.run("DELETE FROM User WHERE id = ?", [args.where.id]);
      return true;
    }
  };

  public solution = {
    findMany: async (args?: { orderBy?: { createdAt: 'desc' | 'asc' } }): Promise<Solution[]> => {
      await this.ensureInitialized();
      let sql = "SELECT * FROM Solution";
      if (args?.orderBy) sql += ` ORDER BY createdAt ${args.orderBy.createdAt.toUpperCase()}`;
      const rows = this.run(sql);
      return rows.map((r: any) => ({
        ...r,
        tags: JSON.parse(r.tags || '[]'),
        scenarios: JSON.parse(r.scenarios || '[]'),
        architectReview: JSON.parse(r.architectReview || '{}'),
        executionPlan: JSON.parse(r.executionPlan || '{}'),
        verticalLLMConfig: JSON.parse(r.verticalLLMConfig || '{}')
      }));
    },
    create: async (args: { data: Partial<Solution> }) => {
      await this.ensureInitialized();
      const s = args.data;
      const now = new Date().toISOString();
      this.run("INSERT INTO Solution VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)", [
        s.id || Math.random().toString(36).substr(2, 9), 
        s.title, s.description, s.industry, s.githubRepo, s.stars || 0,
        JSON.stringify(s.tags || []), JSON.stringify(s.scenarios || []), s.deploymentDifficulty || 'Medium', s.matchScore || 0,
        JSON.stringify(s.architectReview || {}), s.status || 'pending', 
        s.price || 0, s.currency || 'CNY',
        JSON.stringify(s.executionPlan || {}), JSON.stringify(s.verticalLLMConfig || {}),
        s.createdAt || now, now
      ]);
      return s as Solution;
    },
    update: async (args: { where: { id: string }, data: Partial<Solution> }) => {
      await this.ensureInitialized();
      const existing = this.run("SELECT * FROM Solution WHERE id = ?", [args.where.id])[0];
      if (!existing) return null;

      const updated = { ...existing, ...args.data };
      this.run("DELETE FROM Solution WHERE id = ?", [args.where.id]);
      this.run("INSERT INTO Solution VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)", [
        updated.id, updated.title, updated.description, updated.industry, updated.githubRepo, updated.stars,
        typeof updated.tags === 'string' ? updated.tags : JSON.stringify(updated.tags),
        typeof updated.scenarios === 'string' ? updated.scenarios : JSON.stringify(updated.scenarios),
        updated.deploymentDifficulty, updated.matchScore,
        typeof updated.architectReview === 'string' ? updated.architectReview : JSON.stringify(updated.architectReview),
        updated.status, updated.price, updated.currency,
        typeof updated.executionPlan === 'string' ? updated.executionPlan : JSON.stringify(updated.executionPlan),
        typeof updated.verticalLLMConfig === 'string' ? updated.verticalLLMConfig : JSON.stringify(updated.verticalLLMConfig),
        updated.createdAt, new Date().toISOString()
      ]);
      return updated;
    },
    delete: async (args: { where: { id: string } }) => {
      await this.ensureInitialized();
      this.run("DELETE FROM Solution WHERE id = ?", [args.where.id]);
      return true;
    }
  };

  public auditLog = {
    findMany: async (args?: { take?: number, orderBy?: { createdAt: 'desc' } }): Promise<AuditLog[]> => {
      await this.ensureInitialized();
      let sql = "SELECT * FROM AuditLog";
      if (args?.orderBy) sql += ` ORDER BY createdAt ${args.orderBy.createdAt.toUpperCase()}`;
      if (args?.take) sql += ` LIMIT ${args.take}`;
      return this.run(sql);
    },
    create: async (args: { data: Omit<AuditLog, 'id'> }) => {
      await this.ensureInitialized();
      this.run(
        "INSERT INTO AuditLog (userId, username, action, ip, details, createdAt) VALUES (?,?,?,?,?,?)",
        [args.data.userId, args.data.username, args.data.action, args.data.ip, args.data.details, args.data.createdAt]
      );
    }
  };

  public systemConfig = {
    findMany: async () => {
      await this.ensureInitialized();
      const rows = this.run("SELECT * FROM SystemConfig");
      return rows.map((r: any) => ({ id: r.id, value: r.settingValue }));
    },
    upsert: async (args: { where: { id: string }, update: any, create: any }) => {
      await this.ensureInitialized();
      const existing = this.run("SELECT * FROM SystemConfig WHERE id = ?", [args.where.id]);
      const now = new Date().toISOString();
      if (existing.length > 0) {
        this.run("UPDATE SystemConfig SET settingValue = ?, updatedAt = ? WHERE id = ?", [args.update.value, now, args.where.id]);
      } else {
        this.run("INSERT INTO SystemConfig VALUES (?,?,?)", [args.create.id, args.create.value, now]);
      }
    }
  };
}

export const prisma = new PrismaLite();
