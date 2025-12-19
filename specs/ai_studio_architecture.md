# AI Studio PaaS - Technical Architecture & Solutions Spec

## 1. Solution Overview
**Product Name:** HyperScale AI Studio (Enterprise Edition)
**Solution Type:** PaaS (Platform as a Service) / Private Cloud Deployment
**Value Proposition:** A pixel-perfect replica of Google's "AI Studio" architecture, offering a secure, self-hosted environment for GenAI development, prompt engineering, and sandboxed code execution.

This solution is designed for **Enterprise Clients (B2B)** who require:
1.  **Data Sovereignty:** No prompt data leaves their private cloud (Private K8s/VPC).
2.  **Multimodal Sandbox:** Real-time execution of generated Python/JS code in isolated environments.
3.  **Custom RPC Protocols:** High-performance, low-latency streaming not possible with standard REST APIs.

---

## 2. Technical Architecture (The "Alkali" Pattern)

We adopt the **BFF (Backend for Frontend) Gateway Pattern** combined with **gRPC-Web Tunneling**, mirroring the `ProxyUnaryCall` mechanism analyzed.

### 2.1. High-Level Topology
```mermaid
graph TD
    User[Browser / Web IDE] -->|HTTPS ($rpc/Proto)| Gateway[Unified API Gateway (The "Proxy")]
    
    subgraph "Private Cloud / VPC"
        Gateway -->|gRPC| S1[Auth & Tenant Service]
        Gateway -->|gRPC| S2[Project & Storage Service]
        Gateway -->|gRPC| S3[Model Orchestrator]
        Gateway -->|WebSocket| S4[Live Stream Service]
        
        S3 -->|Execute| Sandbox[Code Sandbox (Firecracker VMs)]
        S3 -->|Inference| LLM[Internal LLM / Proxy Endpoint]
    end
```

### 2.2. Key Components

#### A. Frontend (The "Studio")
*   **Tech Stack:** React 19, Monaco Editor (LSP enabled), XTerm.js (for terminal).
*   **Communication:** 
    *   **Control Plane:** `gRPC-Web` clients sending Protobuf binary messages to `/api/proxy/unary`.
    *   **Data Plane:** `WebSocket` for real-time video/audio streaming and stdout/stderr logs from the sandbox.
*   **Device Abstraction:** Uses `MediaDevices` API to simulate mobile/desktop context and capture hardware streams.

#### B. The Gateway ("ProxyUnaryCall")
*   **Role:** Single entry point. Dispatches requests based on the ServiceID in the Protobuf payload.
*   **Tech Stack:** Golang or Node.js (NestJS).
*   **Protocol:** Accepts `application/x-protobuf`, decodes metadata, handles AuthZ, forwards to internal Microservices via gRPC.

#### C. The Code Sandbox (The "Engine")
*   **Role:** Safely execute AI-generated code.
*   **Tech Stack:** gVisor (Google's sandbox container) or Firecracker MicroVMs.
*   **Features:**
    *   Pre-warmed environments (start in <500ms).
    *   Network isolation (whitelist only).
    *   Ephemeral file system.
    *   **Sidechannel for graph outputs:** Matplotlib plots generated in sandbox are encoded (Base64) and streamed back to UI.

---

## 3. Development Roadmap & Estimation

**Total Estimated Timeline: 3-4 Months (Small Elite Team)**

| Phase | Duration | Key Deliverables | Difficulty |
| :--- | :--- | :--- | :--- |
| **P1: Protobuf Core** | 3 Weeks | Define `.proto` schemas; Build Gateway (BFF) to forward gRPC; Setup Basic React Shell. | High (Architecture) |
| **P2: Studio UI** | 4 Weeks | Monaco Editor integration; Chat Interface; "Streaming" text effect; Device Selection UI. | Medium |
| **P3: The Sandbox** | 5 Weeks | Docker/gVisor setup on backend; Secure execution runner; Capture Stdout/Image output to Frontend. | **Very High** |
| **P4: Solutions Integration** | 2 Weeks | Packaging as a "Product" in AI 360 Mall; Licensing system integration. | Low |
| **P5: Polish** | 2 Weeks | Dark Mode; Performance Tuning; Websocket stability. | Medium |

---

## 4. Integration into AI 360 Marketplace

This solution will be listed as a **Tier-1 Premium SKU** in the `AI 360 Solutions` catalog.

*   **SKU ID:** `SOL-AI-STUDIO-ENT`
*   **Price:** 5,000 - 10,000 USDT (License + Support)
*   **Digital Agent:** Comes with a "DevOps Agent" that monitors the Sandbox health and auto-scales the Gateway.
*   **Data Feedback:** User prompts and "accepted code" are (optionally) fed back to fine-tune the organization's private Code LLM.

## 5. Next Steps
1.  Initialize `proto` definitions repository.
2.  Set up the `ProxyUnaryCall` endpoint mock.
3.  Develop the "Code Interpreter" React component.
