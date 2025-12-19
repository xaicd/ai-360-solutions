
import { GoogleGenAI, Type } from "@google/genai";
import { Solution, DigitalAgent, Language, AiModel, EnrichedSolution } from "../types";

// Always use the process.env.API_KEY for Gemini API
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Fix: Implement getLanguageName helper function
const getLanguageName = (lang: Language): string => {
  switch (lang) {
    case 'zh': return 'Chinese';
    case 'ko': return 'Korean';
    case 'ja': return 'Japanese';
    case 'de': return 'German';
    default: return 'English';
  }
};

export const generateDigitalTeam = async (solution: Solution, language: Language): Promise<DigitalAgent[]> => {
  const targetLang = getLanguageName(language);

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `
      ROLE: You are the Chief Talent Officer of "AI 360 Solutions".
      TASK: Create a specialized digital team (3 agents) to support the solution: "${solution.title}".
      DESCRIPTION: ${solution.description}
      INDUSTRY: ${solution.industry}

      REQUIREMENTS:
      1. Define 3 unique roles essential for this industry.
      2. Assign them cool, tech-industrial names and seeds for avatars.
      3. Define their "Personality Matrix" and "Initial Mission".
      
      OUTPUT: JSON array of DigitalAgent objects.
      IMPORTANT: Language must be ${targetLang}.
      `,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              role: { type: Type.STRING },
              name: { type: Type.STRING },
              avatarSeed: { type: Type.STRING },
              personality: { type: Type.STRING },
              currentTask: { type: Type.STRING },
              status: { type: Type.STRING },
              saturation: { type: Type.NUMBER }
            },
            required: ["id", "role", "name", "avatarSeed", "personality", "currentTask", "status", "saturation"]
          }
        }
      }
    });

    const text = response.text;
    if (!text) return [];

    const agents = JSON.parse(text) as any[];
    return agents.map(a => ({
      ...a,
      status: 'AWAKE',
      trainingHistory: [],
      boundSolutionId: solution.id
    })) as DigitalAgent[];
  } catch (error) {
    console.error("Team generation failed", error);
    return [];
  }
};

// Fix: Implemented and exported searchSolutions to resolve import error in App.tsx
export const searchSolutions = async (query: string, language: Language, aiModel: AiModel): Promise<Solution[]> => {
  const targetLang = getLanguageName(language);

  // Always include Flagship Solution
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

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Search for AI solutions matching: "${query}". Return 3-5 relevant solutions.
      Language: ${targetLang}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              industry: { type: Type.STRING },
              stars: { type: Type.NUMBER },
              price: { type: Type.NUMBER },
              status: { type: Type.STRING }
            },
            required: ["id", "title", "description", "industry", "stars", "price", "status"]
          }
        }
      }
    });

    const text = response.text;
    if (!text) return [flagshipSolution];

    const data = JSON.parse(text) as any[];
    const aiResults = data.map(item => ({
      ...item,
      githubRepo: 'ai-360/' + item.id,
      tags: [item.industry, 'AI'],
      scenarios: ['Enterprise Automation'],
      deploymentModes: ['CLOUD', 'EDGE_PRIVATE'],
      deploymentDifficulty: 'Medium',
      matchScore: 90,
      securitySpecs: {
        encryptionLevel: 'AES-256',
        tunnelType: 'Reverse-SSH',
        packageSigned: true
      },
      currency: 'CNY',
      architectReview: {
        qualityScore: 88,
        securityVerdict: 'Safe',
        codeMaintainability: 'High',
        isAudited: true,
        auditDate: new Date().toISOString()
      },
      createdAt: new Date().toISOString()
    })) as Solution[];

    // Add flagship at the top
    return [flagshipSolution, ...aiResults];
  } catch (error) {
    console.warn("Search failed (likely invalid API key). Using Mock Data Fallback.", error);

    const mockSolutions: Solution[] = [
      {
        id: 'SOL-OCR-PRO',
        title: 'Industrial OCR Vision Pro',
        description: 'High-speed optical character recognition for manufacturing labels and logistics waybills.',
        industry: 'Logistics',
        githubRepo: 'ai-360/ocr-pro',
        stars: 842,
        tags: ['Computer Vision', 'Logistics'],
        scenarios: ['Warehouse', 'Sorting'],
        deploymentModes: ['EDGE_PRIVATE'],
        deploymentDifficulty: 'Medium',
        matchScore: 85,
        securitySpecs: { encryptionLevel: 'AES-256', tunnelType: 'Wireguard', packageSigned: true },
        price: 5200,
        currency: 'CNY',
        status: 'active',
        architectReview: { qualityScore: 92, securityVerdict: 'Safe', codeMaintainability: 'Medium', isAudited: true, auditDate: new Date().toISOString() },
        createdAt: new Date().toISOString()
      },
      {
        id: 'SOL-LEGAL-MIND',
        title: 'Legal Contract Reviewer Agent',
        description: 'Automated contract risk analysis and clause extraction using specialized legal LLMs.',
        industry: 'Legal',
        githubRepo: 'ai-360/legal-mind',
        stars: 1205,
        tags: ['NLP', 'LegalTech'],
        scenarios: ['Law Firms', 'Corporate Legal'],
        deploymentModes: ['CLOUD'],
        deploymentDifficulty: 'Low',
        matchScore: 88,
        securitySpecs: { encryptionLevel: 'AES-256', tunnelType: 'Cloud-Proxy', packageSigned: true },
        price: 8800,
        currency: 'CNY',
        status: 'active',
        architectReview: { qualityScore: 95, securityVerdict: 'Safe', codeMaintainability: 'High', isAudited: false, auditDate: new Date().toISOString() },
        createdAt: new Date().toISOString()
      }
    ];

    return [flagshipSolution, ...mockSolutions];
  }
};

// Fix: Implemented and exported enrichSolutionDetails to resolve import error in App.tsx
export const enrichSolutionDetails = async (solution: Solution, language: Language, aiModel: AiModel): Promise<EnrichedSolution> => {
  // Hardcoded enrichment for Flagship Solution to maintain accuracy
  if (solution.id === 'SOL-AI-STUDIO-ENT') {
    return {
      ...solution,
      fullOverview: `
# HyperScale AI Studio: The Ultimate GenAI Foundry

## System Architecture
HyperScale AI Studio is a dedicated PaaS environment engineered for high-performance Large Language Model (LLM) interfaces. It replicates the internal tooling used by top-tier AI labs (like Google DeepMind), providing a seamless "Code-to-Model" bridge.

### Core Components
1.  **Unified Proxy Gateway (The "Alkali" Pattern)**:
    -   Single-entry RPC tunneling via \`ProxyUnaryCall\`.
    -   Protocol Buffers (Protobuf) for compact, type-safe data transmission.
    -   Microservice orchestration without exposing internal topology.

2.  **Sandbox Execution Engine**:
    -   **Technology**: Firecracker MicroVMs & gVisor.
    -   **Capabilities**: Executes Python/Node.js code generated by LLMs in <300ms.
    -   **Isolation**: Network-gapped environments with whitelisted PyPI/npm mirroring.

3.  **Real-Time Multimodal Streaming**:
    -   **WebSocket Data Plane**: Bi-directional audio/video streams for "Live" model interaction.
    -   **Device Abstraction**: Virtualizes client-side cameras and microphones for server-side processing.

## Enterprise Features
-   **Data Sovereignty**: Complete data isolation within your Private VPC.
-   **Audit Trails**: Full logging of every prompt, code execution, and model output.
-   **Team Collaboration**: Multi-seat referencing, prompt versioning, and shared context.

## Integration Roadmap
-   **Phase 1**: Deployment of Control Plane (K8s Clusters).
-   **Phase 2**: Integration of your private Code-LLM.
-   **Phase 3**: Custom UI branding and SSO integration.
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
          trainingHistory: []
        },
        {
          id: 'arch-001',
          role: 'Solutions Architect',
          name: 'Architect Prime',
          avatarSeed: 'robot-2',
          personality: 'Visionary, structured, obsessed with clean architecture.',
          status: 'WORKING',
          saturation: 95,
          currentTask: 'Designing scaler policies',
          trainingHistory: []
        }
      ],
      executionPlan: {
        poc: { title: 'Sandbox Validation', description: 'Test code execution isolation', resources: { compute: '4 vCPU', memory: '8GB', network: 'VPC', storage: 'NVMe' }, human: { roles: ['SecOps'], estimatedHours: 20 }, steps: ['Deploy Gateway', 'Run Penetration Test'] },
        production: { title: 'Cluster Rollout', description: 'Full K8s deployment', resources: { compute: '50 Nodes', memory: '1TB', network: '10Gbps', storage: 'Ceph Cluster' }, human: { roles: ['SRE Team'], estimatedHours: 200 }, steps: ['Helm Install', 'Load Balancing', 'DNS Switch'] },
        saas: { title: 'Global Availability', description: 'Multi-region federation', resources: { compute: 'Hybrid Cloud', memory: 'Infinite', network: 'Anycast', storage: 'Geo-Replicated' }, human: { roles: ['Product VP'], estimatedHours: 500 }, steps: ['Federation', 'Compliance', 'Marketing'] }
      },
      simulation: {}
    } as EnrichedSolution;
  }

  const targetLang = getLanguageName(language);

  try {
    const overviewResponse = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Provide a detailed technical overview for the solution: "${solution.title}".
      Description: ${solution.description}
      Language: ${targetLang}`,
    });

    const fullOverview = overviewResponse.text || solution.description;
    const digitalTeam = await generateDigitalTeam(solution, language);

    const executionPlan = {
      poc: {
        title: "Proof of Concept",
        description: "Initial validation phase",
        resources: { compute: "2 vCPU", memory: "4GB", network: "100Mbps", storage: "50GB" },
        human: { roles: ["Solution Architect"], estimatedHours: 40 },
        steps: ["Environment Setup", "Base Model Integration", "Initial Feedback"]
      },
      production: {
        title: "Production Deployment",
        description: "Scale to enterprise users",
        resources: { compute: "8 vCPU", memory: "32GB", network: "1Gbps", storage: "500GB" },
        human: { roles: ["DevOps Engineer", "Project Manager"], estimatedHours: 160 },
        steps: ["Clustering", "Data Migration", "Security Hardening"]
      },
      saas: {
        title: "SaaS Expansion",
        description: "Multi-tenant cloud service",
        resources: { compute: "Auto-scaling", memory: "Elastic", network: "Global CDN", storage: "Distributed" },
        human: { roles: ["Product Manager", "Support"], estimatedHours: 320 },
        steps: ["Billing Integration", "Compliance Audit", "Global Rollout"]
      }
    };

    return {
      ...solution,
      fullOverview,
      digitalTeam,
      executionPlan,
      simulation: {}
    } as EnrichedSolution;
  } catch (error) {
    console.error("Enrichment failed", error);
    throw error;
  }
};
