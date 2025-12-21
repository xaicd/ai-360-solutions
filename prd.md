
# Product Requirements Document (PRD): AI 360 Solutions
**Version:** 2.0
**Status:** Released
**Last Updated:** 2025-12-21

## Revision History

| Version | Date       | Author | Description of Changes |
| :------ | :--------- | :----- | :--------------------- |
| 1.0     | 2024-05-23 | Team   | Initial MVP launch (Solution Mall). |
| 1.2     | 2024-06-01 | Team   | Added Admin Portal, Agent Workshop, and basic architecture. |
| **2.0** | 2025-12-21 | AI     | **Major Release**: <br>- **Internationalization (i18n):** Full en/zh support.<br>- **Consumer Console:** Dedicated backend for resource/order management.<br>- **Digital Workforce:** MCP integration for AI Employees.<br>- **Backend:** Integrated Purchase->Provisioning flow. |

---

## 1. Executive Summary
**AI 360 Solutions** is a "Taobao-like" marketplace platform designed to democratize access to enterprise-grade Artificial Intelligence. It connects 360 vertical industries with verified open-source AI solutions.

**Version 2.0 Evolution:**
The platform has evolved into a **Hybrid Cloud & Digital Staffing Platform**. It not only sells software solutions but provisions "Digital Employees" that can integrate directly into user workflows via the **Model Context Protocol (MCP)**.
1.  **Global First:** Full Internationalization (i18n) support (en/zh) for all features.
2.  **Digital Workforce:** "Hiring" AI agents as employees that can be connected to IDEs (Cursor, Claude) via MCP.
3.  **Cloud Console:** A professional, AWS-like management console for resources, orders, and agents.

## 2. Target Audience
*   **SME Business Owners:** Purchase complete AI solutions and deploy them instantly.
*   **Developers/CTOs:** "Hire" specialized AI agents (DevOps, QA) and integrate them into their local IDEs via MCP.
*   **Operations Managers:** Monitor resource usage and agent saturation in the Cloud Console.

---

## 3. Functional Requirements

### 3.1. Internationalization (i18n) [NEW]
*   **Requirement:** All user-facing interfaces must support seamless switching between English and Chinese.
*   **Implementation:** Centralized translation management (`translations.ts`) covering Auth, Console, Storefront, and Workforce domains.

### 3.2. Authentication & Roles [NEW]
*   **Consumer Login:** Dedicated `/login` portal for end-users.
*   **Role-Based Access Control (RBAC):**
    *   **Admin:** Full system access, agent training, solution management.
    *   **Consumer:** Access to personal Cloud Console, purchased resources, and hired workforce.

### 3.3. Public Portal (Mall Frontend)
*   **Smart Search:** AI-driven search (using Gemini/LLMs) to find industry-specific solutions.
*   **Purchase Flow [UPDATED]:**
    *   Integrated checkout supporting Tier selection (POC, Production).
    *   Auto-provisioning of underlying resources and creation of associated Digital Agents.

### 3.4. Cloud Console (Consumer Backend) [NEW]
A professional-grade dashboard for managing purchased assets:
1.  **Overview:** Real-time dashboard showing resource health, spending, and usage metrics.
2.  **My Resources:** Management of provisioned Cloud Resources (Instances, Clusters) with status tracking.
3.  **Orders & Billing:** History of Procurement Orders with invoice status.
4.  **Digital Workforce (The "MCP" Feature):**
    *   **Agent Management:** View hired "AI Employees" (cloned from Solution templates).
    *   **MCP Integration:** Generate and export **Model Context Protocol (MCP)** configurations.
    *   **Interoperability:** Copy-paste JSON configs to connect these agents to external tools like Cursor or Claude Desktop.
5.  **Settings:** Account security options including Email and Phone binding verification.

### 3.5. Admin Portal
*   **Agent Workshop:** Train and refine global agent templates.
*   **Solution Management:** Configure pricing, deploying modes, and bound agent teams.

---

## 4. Technical Architecture

### 4.1. Core Entities (Schema)
*   **User:** Extended with `role`, `email`, `phone`, `avatar`.
*   **Solution:** Links to `DigitalAgent` templates.
*   **DigitalAgent:** 
    *   Added `ownerId` for user-ownership.
    *   Added `mcpEndpoint` and `mcpConfig` for external connectivity.
*   **ProcurementOrder:** Tracks purchase lifecycle.
*   **CloudResource:** Represents provisioned infrastructure (mocked as Cloud/Edge nodes).

### 4.2. Tech Stack
*   **Frontend:** React 19 + Tailwind CSS + Lucide Icons + Framer Motion.
*   **Backend:** Node.js (Express) + Prisma ORM.
*   **Database:** SQLite (Dev) / Postgres (Prod).
*   **AI/LLM:** Gemini Service for search enrichment and agent personality simulation.
*   **Integration:** Model Context Protocol (MCP) standards for agent interoperability.

---

## 5. UI/UX Guidelines
*   **"Midnight Cloud" Aesthetic:** Professional dark mode with high-density information tables (Console).
*   **Dynamic Interactive:** Hover effects, skeleton loaders, and smooth transitions.
*   **Global Standard:** Bilingual UI elements with auto-detection preferences.
