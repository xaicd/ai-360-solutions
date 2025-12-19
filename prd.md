
# Product Requirements Document (PRD): AI 360 Solutions
**Version:** 1.2  
**Status:** Updated  
**Last Updated:** 2024-05-23

---

## 1. Executive Summary
**AI 360 Solutions** is a "Taobao-like" marketplace platform designed to democratize access to enterprise-grade Artificial Intelligence. It connects 360 vertical industries (Healthcare, Legal, FinTech, etc.) with verified open-source AI solutions. 

The platform has evolved from a simple directory into a **Self-Evolving AI Ecosystem** where:
1.  **Web3 Economy:** Payments are natively supported via USDT/USDC stablecoins.
2.  **Digital Workforce:** Solutions come bundled with "Digital Agents" that can be awakened and assigned tasks.
3.  **Data Feedback Loop:** Real-world operational data from deployed solutions is fed back into the training pipeline to improve Digital Agent intelligence.

## 2. Target Audience & Personas
*   **SME Business Owners:** Look for easy-to-buy AI "SKUs" with crypto-payment options for global flexibility.
*   **Operations Managers:** Manage the "Digital Team" assigned to their purchased solutions.
*   **Solution Architects (Admin):** Curate solutions and "Train/Bind" Digital Agents in the Agent Workshop.

---

## 3. Functional Requirements

### 3.1. Public Portal (Mall Frontend)
*   **Web3 Checkout:** Support for USDT (TRC20/ERC20) and USDC with real-time exchange rates and blockchain confirmation simulation.
*   **Agent Command Center:** 
    *   **Awakening Flow:** One-click activation of hibernating agents.
    *   **Task Assignment:** Directing agents to perform POC tests, environment audits, or data analysis.
    *   **Saturation Tracking:** Visual display of an agent's training level (0-100%).
*   **Privatization Deployment:** Secure tunneling and SM4-encrypted package delivery for edge node installation.

### 3.2. Admin Portal (Management Backend)
*   **Agent Workshop (NEW):**
    *   **Neural Binding:** Linking specific Agent prototypes to Solutions to inherit domain context.
    *   **Data Injection:** Manual and automated injection of "Operation Logs" into the training model.
    *   **Saturation Management:** Monitoring and boosting agent intelligence based on feedback quality.
*   **Solution Management:** Full SKU configuration including Web3 pricing modifiers.
*   **AI Engine Settings:** Migration of core model parameters (API Keys, Temperature, etc.) to the internal admin layer.

### 3.3. Flagship Solution: HyperScale AI Studio
*   **Definition:** A premium, "Google-grade" PaaS solution available for purchase within the marketplace.
*   **Architecture (The "Alkali" Pattern):**
    *   **Frontend:** Custom React-based IDE with Monaco Editor and realtime device streaming.
    *   **Backend:** Single-entry `ProxyUnaryCall` Gateway using gRPC-Web tunneling for high-performance microservice access.
    *   **Sandbox:** Secure, containerized "Code Interpreter" environments (gVisor/Firecracker) for executing AI-generated code.
*   **Commercial Model:** Sold as a high-ticket item (USDT) with embedded "DevOps Agents" for maintenance.

---

## 4. Technical Architecture

### 4.1. Core Entities
*   **Digital Agent:** Includes `status` (Hibernating/Awake), `saturation`, `boundSolutionId`, and `tasks`.
*   **Solution:** Now includes `currency` (CNY/USD/USDT/USDC) and `deploymentModes` (Cloud/Edge).
*   **Feedback Loop:** A mechanism that extracts "Execution Logs" from the `Solution` entity and transforms them into `TrainingData` for the `Agent`.

### 4.2. Tech Stack
*   **Frontend:** React 19 + Tailwind CSS + Lucide Icons.
*   **Encryption:** SM4/AES-256 simulation for secure package distribution.
*   **Database:** AlaSQL (Local Storage) for persistence of Agents, Solutions, and Audit Logs.
*   **GenAI:** Gemini 3 Flash for search, enrichment, and simulated Agent training logs.

---

## 5. UI/UX Guidelines
*   **Cyber-Industrial Aesthetic:** Use of high-contrast "Neural Pulse" animations, terminal-style outputs, and neon indicators for active systems.
*   **Web3 Native:** Crypto-wallet style interfaces for payment and "Agent Auth Tokens."
*   **Feedback Transparency:** Clear visual links between solution performance and agent training improvements.
