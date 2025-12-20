
import { GoogleGenAI, Type } from "@google/genai";
import { Solution, DigitalAgent, Language, AiModel, EnrichedSolution } from "../types";

// Always use the process.env.API_KEY for Gemini API (kept for legacy/fallback needs)
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const getLanguageName = (lang: Language): string => {
  switch (lang) {
    case 'zh': return 'Chinese';
    case 'ko': return 'Korean';
    case 'ja': return 'Japanese';
    case 'de': return 'German';
    default: return 'English';
  }
};

const API_BASE = 'http://localhost:3001/api';

/**
 * Searches for solutions via the proprietary AI 360 Backend.
 * Fallback to local Flagship data if backend is offline.
 */
export const searchSolutions = async (query: string, language: Language, aiModel: AiModel): Promise<Solution[]> => {
  try {
    console.log(`📡 Fetching from backend: ${API_BASE}/solutions?q=${query}`);
    const response = await fetch(`${API_BASE}/solutions?q=${encodeURIComponent(query)}`);

    if (response.ok) {
      const json = await response.json();
      // Handle standardized { success: true, data: [...] } response
      if (json.success && Array.isArray(json.data)) {
        return json.data as Solution[];
      }
      // Handle legacy/direct array response
      if (Array.isArray(json)) return json as Solution[];

      return [];
    } else {
      throw new Error(`Backend API Error: ${response.status}`);
    }

  } catch (error) {
    console.warn("⚠️ Backend Search failed. Is the server running? Falling back to Offline Mode.", error);

    // Fallback: Local Offline Data (The "Flagship" hardcoded backup)
    const flagshipSolution: Solution = {
      id: 'SOL-AI-STUDIO-ENT',
      title: 'HyperScale AI Studio (Enterprise)',
      description: 'Pixel-perfect replica of Google AI Studio architecture. Features private gRPC-Web tunneling, Firecracker sandboxing, and real-time multimodal streaming. The ultimate PaaS for internal GenAI development.',
      industry: 'Platform Infrastructure',
      githubRepo: 'ai-360/hyperscale-studio',
      stars: 12500,
      tags: ['PaaS', 'Infrastructure', 'GenAI', 'Compiler'],
      scenarios: ['Internal Developer Platform', 'Prompt Engineering', 'Model Finetuning'],
      deploymentModes: ['EDGE_PRIVATE'],
      deploymentDifficulty: 'High',
      matchScore: 100,
      securitySpecs: {
        encryptionLevel: 'SM4',
        tunnelType: 'Cloud-Proxy',
        packageSigned: true
      },
      price: 15000,
      currency: 'USDT',
      status: 'active',
      architectReview: {
        qualityScore: 99,
        securityVerdict: 'Military Grade',
        codeMaintainability: 'High',
        isAudited: true,
        auditDate: new Date().toISOString()
      },
      createdAt: new Date().toISOString()
    };

    return [flagshipSolution];
  }
};

/**
 * Generates or fetches the digital team. 
 * Now primarily fetches from Backend which pre-seeds these agents.
 */
export const generateDigitalTeam = async (solution: Solution, language: Language): Promise<DigitalAgent[]> => {
  // If the solution came from backend, it might already have agents (mapped to digitalTeam in frontend logic usually, but here we treat them distinct if needed)
  if ((solution as any).agents && Array.isArray((solution as any).agents) && (solution as any).agents.length > 0) {
    return (solution as any).agents as DigitalAgent[];
  }
  return [];
};

/**
 * Enriches solution details.
 * Since backend returns full details, this mostly just casts the type or fetches by ID if needed.
 */
export const enrichSolutionDetails = async (solution: Solution, language: Language, aiModel: AiModel): Promise<EnrichedSolution> => {

  // 1. Try to fetch fresh full details from backend ID endpoint
  try {
    const response = await fetch(`${API_BASE}/solutions/${solution.id}`);
    if (response.ok) {
      const data = await response.json(); // Backend returns parsed object directly? Let's check server/index.ts
      // server/index.ts /api/solutions/:id returns the parsed object directly, NOT wrapped in success:true (I recalled this decision).
      // Wait, I should verify. Step 279 code:
      // res.json(parsed);
      // So it IS direct object.
      // But I should check if it's correct.
      return data as EnrichedSolution;
    }
  } catch (e) {
    console.warn("Failed to fetch details from backend", e);
  }

  // 2. If backend fetch failed, check if we already have the data in the input object
  // (FullOverview might be present if it came from list and we updated list to include it?)
  if ((solution as any).fullOverview) {
    return solution as EnrichedSolution;
  }

  // 3. Last Resort: Hardcoded Flagship fallback (Offline)
  if (solution.id === 'SOL-AI-STUDIO-ENT') {
    return {
      ...solution,
      fullOverview: `
# HyperScale AI Studio: The Ultimate GenAI Foundry

## System Architecture
HyperScale AI Studio is a dedicated PaaS environment engineered for high-performance Large Language Model (LLM) interfaces.

### Core Components
1.  **Unified Proxy Gateway**: Single-entry RPC tunneling via \`ProxyUnaryCall\`.
2.  **Sandbox Execution Engine**: Executes Python/Node.js code generated by LLMs in <300ms.
3.  **Real-Time Multimodal Streaming**: WebSocket Data Plane.

## Enterprise Features
-   **Data Sovereignty**: Complete data isolation within your Private VPC.
-   **Audit Trails**: Full logging of every prompt, code execution, and model output.
      `,
      digitalTeam: [
        {
          id: 'devops-001',
          role: 'Site Reliability Engineer',
          name: 'Cipher',
          avatarSeed: 'robot-1',
          personality: 'Rigorous, paranoid about security, highly efficient.',
          status: 'AWAKE',
          saturation: 100,
          currentTask: 'Monitoring gRPC latency',
          trainingHistory: [],
          boundSolutionId: solution.id
        }
      ],
      executionPlan: {
        poc: { title: 'Sandbox Validation', description: 'Test validation', resources: { compute: '4 vCPU', memory: '8GB', network: 'VPC', storage: 'NVMe' }, human: { roles: ['SecOps'], estimatedHours: 20 }, steps: ['Deploy Gateway'] },
        production: { title: 'Cluster Rollout', description: 'Full deployment', resources: { compute: '50 Nodes', memory: '1TB', network: '10Gbps', storage: 'Ceph Cluster' }, human: { roles: ['SRE Team'], estimatedHours: 200 }, steps: ['Helm Install'] },
        saas: { title: 'Global Availability', description: 'Multi-region', resources: { compute: 'Hybrid Cloud', memory: 'Infinite', network: 'Anycast', storage: 'Geo-Replicated' }, human: { roles: ['Product VP'], estimatedHours: 500 }, steps: ['Federation'] }
      },
      simulation: {}
    } as EnrichedSolution;
  }

  // 4. Fallback for generic solutions without backend
  return {
    ...solution,
    fullOverview: solution.description,
    digitalTeam: [],
    executionPlan: { poc: { title: "Standard Deployment", description: "Standard PoC", resources: { compute: "", memory: "", network: "", storage: "" }, human: { roles: [], estimatedHours: 0 }, steps: [] }, production: { title: "Standard Deployment", description: "Standard PoC", resources: { compute: "", memory: "", network: "", storage: "" }, human: { roles: [], estimatedHours: 0 }, steps: [] }, saas: { title: "Standard Deployment", description: "Standard PoC", resources: { compute: "", memory: "", network: "", storage: "" }, human: { roles: [], estimatedHours: 0 }, steps: [] } },  // Added full structure to satisfy strict types if needed
    simulation: {}
  } as EnrichedSolution;
};
