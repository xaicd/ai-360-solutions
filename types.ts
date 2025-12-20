
export type Language = 'en' | 'zh' | 'ko' | 'ja' | 'de';
export type AiModel = 'gemini' | 'chatgpt5' | 'grok' | 'claude4.5' | 'qwen3-plus' | 'ollama' | 'deepseek';

// Added DeploymentMode to specify deployment target environments
export type DeploymentMode = 'CLOUD' | 'EDGE_PRIVATE';

export interface ModelConfig {
  apiKey: string;
  baseUrl: string;
  modelName: string;
  temperature: number;
  topP: number;
  maxTokens: number;
}

export enum ViewState {
  HOME = 'HOME',
  RESULTS = 'RESULTS',
  DETAIL = 'DETAIL',
  SETTINGS = 'SETTINGS',
  ADMIN_LOGIN = 'ADMIN_LOGIN',
  ADMIN_PORTAL = 'ADMIN_PORTAL'
}

export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  SOLUTION_ARCHITECT = 'SOLUTION_ARCHITECT',
  SYSTEM_OP = 'SYSTEM_OP',
  AUDITOR = 'AUDITOR',
  CONSUMER = 'CONSUMER'
}

export interface User {
  id: string;
  username: string;
  role: UserRole;
  passwordHash: string;
  avatar: string;
  lastLogin: string;
  isActive: boolean;
}

export interface AdminUser extends Omit<User, 'passwordHash'> {
  token?: string;
}

// Added AuditLog interface for auditing administrative actions
export interface AuditLog {
  id: string;
  userId: string;
  username: string;
  action: string;
  ip: string;
  details: string;
  createdAt: string;
}

export enum AdminView {
  DASHBOARD = 'DASHBOARD',
  SOLUTIONS = 'SOLUTIONS',
  AGENTS_WORKSHOP = 'AGENTS_WORKSHOP',
  USERS = 'USERS',
  AUDIT_LOGS = 'AUDIT_LOGS',
  SYSTEM = 'SYSTEM',
  AI_ENGINE = 'AI_ENGINE',
  CLOUD_RESOURCES = 'CLOUD_RESOURCES', // New
  FINANCE = 'FINANCE' // New
}

export interface CloudProvider {
  id: string;
  name: string;
  type: 'AWS' | 'ALIYUN' | 'GCP' | 'AZURE' | 'VMWARE' | 'OPENSTACK' | 'LOCAL';
  credentials?: string; // Should be masked in API responses
  status: 'ACTIVE' | 'ERROR' | 'SYNCING';
  createdAt: string;
}

export interface CloudResource {
  id: string;
  providerId: string;
  name: string;
  type: 'COMPUTE' | 'STORAGE' | 'NETWORK' | 'DATABASE';
  region: string;
  status: 'RUNNING' | 'STOPPED' | 'PROVISIONING' | 'TERMINATED';
  ipAddress?: string;
  specs: any; // JSON object
  terraformId?: string;
  providerName?: string; // Enriched
}

export interface InfrastructureStack {
  id: string;
  name: string;
  providerId: string;
  status: 'APPLIED' | 'PLAN_FAILED' | 'APPLY_FAILED' | 'DRIFTED';
  lastApply?: string;
}

export interface ProcurementOrder {
  id: string;
  orderNumber: string;
  requesterId: string;
  resourceType: string;
  specs: any;
  budget: number;
  currency: string;
  status: 'PENDING' | 'MATCHING' | 'FULFILLED' | 'CANCELLED';
  createdAt: string;
  requesterName?: string; // Enriched
}

export type AgentStatus = 'HIBERNATING' | 'AWAKE' | 'WORKING' | 'TRAINING';

export interface AgentTask {
  id: string;
  title: string;
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED';
  progress: number;
  result?: string;
}

export interface TrainingData {
  source: 'REPOS' | 'OPERATION_LOGS' | 'HUMAN_GUIDE';
  tokenCount: number;
  qualityScore: number;
  timestamp: string;
}

export interface DigitalAgent {
  id: string;
  role: string;
  name: string;
  avatarSeed: string;
  personality: string;
  status: AgentStatus;
  saturation: number; // 0-100 训练饱和度
  currentTask?: string;
  tasks?: AgentTask[];
  trainingHistory: TrainingData[];
  boundSolutionId?: string;
}

// Added ExecutionTier to define configuration for specific deployment stages
export interface ExecutionTier {
  title: string;
  description: string;
  resources: {
    compute: string;
    memory: string;
    network: string;
    storage: string;
  };
  human: {
    roles: string[];
    estimatedHours: number;
  };
  steps: string[];
}

// Added ExecutionPlan for representing the full multi-stage deployment strategy
export interface ExecutionPlan {
  poc: ExecutionTier;
  production: ExecutionTier;
  saas: ExecutionTier;
}

export interface Solution {
  id: string;
  title: string;
  description: string;
  industry: string;
  githubRepo: string;
  stars: number;
  tags: string[];
  scenarios: string[];
  deploymentModes: DeploymentMode[];
  deploymentDifficulty: 'Low' | 'Medium' | 'High'; // Added for architect auditing tracking
  matchScore: number; // Added for search ranking tracking
  securitySpecs: {
    encryptionLevel: 'AES-256' | 'FIPS-140-2' | 'SM4';
    tunnelType: 'Reverse-SSH' | 'Wireguard' | 'Cloud-Proxy';
    packageSigned: boolean;
  };
  price: number;
  currency: 'CNY' | 'USD' | 'USDT' | 'USDC';
  status: 'draft' | 'active' | 'pending' | 'deprecated'; // Added 'deprecated' to status union
  architectReview: {
    qualityScore: number;
    securityVerdict: string;
    codeMaintainability: 'High' | 'Medium' | 'Low';
    isAudited: boolean;
    auditDate: string;
  };
  executionPlan?: ExecutionPlan; // Added for database persistence in db.ts
  verticalLLMConfig?: any; // Added for database persistence in db.ts
  createdAt: string;
}

export interface EnrichedSolution extends Solution {
  fullOverview: string;
  digitalTeam: DigitalAgent[];
  executionPlan: ExecutionPlan;
  simulation: any;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}
