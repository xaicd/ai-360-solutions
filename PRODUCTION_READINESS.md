# Production Readiness Checklist

To make text **AI 360 Solutions** platform production-ready, the following critical tasks must be completed:

## 1. Security Hardening (Critical)
- [x] **Password Hashing:** Currently, passwords are stored in plain text. We must implement `bcrypt` serialization.
- [x] **Input Validation:** Ensure API payloads are sanitized.
- [x] **CORS Configuration:** Restrict API access to trusted domains.

## 2. Configuration & Architecture
- [x] **Environment Variables:** Remove all hardcoded `http://localhost:3001` references. Use `VITE_API_URL` for frontend and `PORT` for backend.
- [x] **Unified Build:** Ensure the Node.js backend can serve the React frontend static files in production mode.

## 3. Feature Completion: MCP Server
- [x] **Real MCP Endpoints:** The UI currently points to `mcp.ai360.com`. We need to implement a local route `/api/mcp/:agentId` that serves the actual Model Context Protocol tool definitions dynamically.
- [x] **Data Consistency:** Ensure provisioned agents have valid endpoints pointing to this server.

## 4. Stability
- [x] **Error Handling:** Global error handler for the Express server.
- [x] **Database:** Ensure robust connection handling (Prisma).

---
**Plan:** Phase 1 complete. Proceeding to Phase 2 (Enterprise Grade).

## 5. Advanced Security & Reliability (Phase 2)
- [x] **Rate Limiting:** Protect APIs from DDOS using `express-rate-limit`.
- [x] **Security Headers:** Implement `helmet` for HTTP security headers (HSTS, XSS protection).
- [x] **Input Sanitization:** Add `zod` schema validation for all `POST` endpoints.
- [ ] **CSRF Protection:** Add `csurf` middleware for session security. (Skipped for now due to complexity with JWT/Fetch)

## 6. DevOps & Deployment
- [x] **Dockerization:** Create `Dockerfile` and `docker-compose.yml`.
- [ ] **CI/CD:** Add GitHub Actions workflow for build/test.
- [x] **Monitoring:** Add health check endpoint `/health` and basic logging integration.
