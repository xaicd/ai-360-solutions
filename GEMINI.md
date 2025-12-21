# AI 360 Solutions - Architectural Guidelines & Standards (GEMINI)

## 1. Project Philosophy
**AI 360 Solutions** is a next-generation "B2B AI Solutions Store" and "Digital Workforce Management" platform.
*   **Core Value**: Selling complete, operational AI solution packages (Agents + Cloud Infra + UI) rather than just API keys.
*   **Architecture Goal**: Maintainability, Scalability (to Microservices), and Security by Default.

## 2. Technology Stack & Standards
### Frontend (`/`)
*   **Framework**: React 19 + Vite.
*   **Styling**: Tailwind CSS (Mobile-First, Utility-First).
*   **State Management**: React Context + Hooks (Avoid global stores unless necessary).
*   **Fetching**: Native `fetch` with strict typing (via `services/api.ts`).
*   **Components**: Functional components (`.tsx`). PascalCase.
    *   Structure: `components/<Feature>/<Component>.tsx` preferred over flat lists.

### Backend (`/server`)
*   **Runtime**: Node.js (v20+).
*   **Framework**: Express.js.
*   **Database**: Prisma ORM (SQLite for Dev, PostgreSQL for Prod).
*   **Security**:
    *   **Auth**: Custom JWT-based or Session-based (Currently Custom Token for MVP).
    *   **Validation**: **Zod** schema validation for ALL inputs.
    *   **Protection**: Helmet, Rate-Limit, CORS.
*   **Architecture Pattern**: Modular Monolith.
    *   Routes (`server/routes`) -> Delegates logic to Controllers/Handlers.
    *   Prisma Client (`server/db.ts`) -> Singleton instance.

## 3. Directory Structure (Refactored Target)
The project initially used a flat structure. We are migrating to a cleaner separation:

```
/
├── components/         # Shared UI Components
│   ├── Common/        # Buttons, Inputs, Layouts
│   ├── Console/       # Dashboard specific widgets
│   └── Solution/      # Storefront specific widgets
├── pages/             # (Future) Page-level components
├── hooks/             # Custom React Hooks
├── server/            # Backend Application
│   ├── routes/        # Express Route Definitions (Auth, Console, API)
│   ├── middleware/    # Auth check, Error handling, Logging
│   ├── services/      # Business Logic (Optional for complexity)
│   ├── index.ts       # Entry Point
│   └── db.ts          # Database Connection
├── services/          # Frontend API Client (Bridge to Backend)
└── types.ts           # Shared TypeScript Interfaces
```

## 4. Coding Conventions
1.  **TypeScript**: Strict mode enabled. No `any` unless absolutely necessary (migration only).
2.  **Naming**:
    *   Files: `camelCase.ts` or `PascalCase.tsx`.
    *   Variables: `camelCase`.
    *   Constants: `UPPER_SNAKE_CASE`.
3.  **Error Handling**:
    *   Backend: Global Error Handling Middleware. Try-Catch in async routes.
    *   Frontend: Error Boundaries and Toast notifications.
4.  **Comments**: JSDoc style for functions. Explain *Why*, not *What*.

## 5. Security Checklist (Production)
*   [x] Password Hashing (Bcrypt)
*   [x] Environment Config (.env)
*   [x] Rate Limiting
*   [x] Input Validation (Zod)
*   [ ] Structured Logging (Winston/Pino) - *Pending*
*   [ ] Unit Tests (Vitest/Jest) - *Pending*

## 6. Git Workflow
*   **Commits**: Conventional Commits (`feat: add login`, `fix: resolve crash`, `chore: cleanup`).
## 7. Infrastructure as Code (IaC) Architecture
**Goal**: Manage multi-cloud resources (AWS, Aliyun, VMware) via a unified interface.

### 7.1. Technology
*   **Engine**: Terraform (via `terraform` CLI).
*   **Wrapper**: `server/services/terraform.service.ts` (Node.js wrapper).
*   **State Management**: Local state files in `server/terraform/workspaces/<resourceId>/`. (Migrate to S3/Consul for scaled prod).

### 7.2. Module Structure
Standardized modules located in `server/terraform/modules/<provider>/<type>/`.
*   Input Variables: Must match `config` object keys passed from UI.
*   Outputs: Must include `instance_id` and `public_ip` (if applicable) for DB sync.

### 7.3. Provisioning Flow
1.  **Draft**: UI sends config -> Backend creates `PROVISIONING` record.
2.  **Plan**: Backend runs `terraform plan`, returns logs to UI.
3.  **Apply**: User confirms -> Backend runs `terraform apply`, updates DB with IPs/IDs.
4.  **Monitor**: Periodic sync (future) or Event-driven updates.

