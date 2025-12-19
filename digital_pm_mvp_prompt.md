# MVP Generation Prompt: Digital Product Manager (Smart Workbench)

Use this prompt to generate a functioning MVP for a Digital Product Manager application using the specified technology stack.

---

# Role
你是一位精通生成式 AI 应用开发的全栈架构师。即使是构建 MVP，你也追求代码的结构化、可扩展性和极致的 UI/UX 体验。

# Project Goal
构建一个名为 **"Digital PM (数字产品经理)"** 的企业级智能工作台。
这不仅是一个文档工具，更是一个**基于知识图谱 (Knowledge Graph) 的产品大脑**。它利用多模态数据存储和图算法，发现需求间的隐性关联，强化产品决策逻辑，实现跨领域的数据整合与自我进化。

# Technical Stack (Enterprise Architecture)
1.  **Frontend**: React 19 + TypeScript + Tailwind CSS (Vite).
2.  **Backend (Core)**: Node.js (NestJS or Express) - **Designed for Polyglot Persistence**.
3.  **Database Abstraction Layer (DAL)**:
    *   采用 **Repository Pattern** 设计通用的数据访问层。
    *   **Structured Data**: 支持 **SQLite3** (Dev) / **PostgreSQL** (Prod) 切换，存储 User, Product, Tenant 等核心实体。
    *   **Document Data**: 支持 **MongoDB**，存储非结构化的 PRD 文档、复杂的 JSON 配置和历史变更记录。
4.  **Knowledge Engine**:
    *   **Graph Database**: 集成 **Neo4j** (通过 neo4j-driver)。
    *   **Use Case**: 将所有实体（需求、功能、用户、市场趋势）映射为图节点，通过边（Relationships）建立连接，通过图算法计算“需求影响力”和“冲突检测”。
5.  **AI Integration**: Google Gemini SDK (`@google/genai`) 结合图谱数据进行 RAG (检索增强生成)。

# Core Features for MVP
1.  **Unified Dashboard**: 综合展示来自 SQL (统计数据) 和 Neo4j (关系热力图) 的产品健康度。
2.  **Graph-Enhanced Requirement Pool**:
    *   在创建需求时，自动在 Neo4j 中建立 `(Requirement)-[:AFFECTS]->(Feature)` 关系。
    *   利用 Gemini 分析文本，自动提取实体并推入图谱。
3.  **Smart PRD Generator (RAG)**:
    *   利用 MongoDB 检索相似的历史文档。
    *   利用 Neo4j 查找相关联的依赖模块，将其作为上下文输入给 AI，生成考虑到全局影响的 PRD。
4.  **Impact Analysis (Neo4j)**:
    *   可视化视图：修改一个需求，高亮显示所有受影响的下游功能和对应的 Persona。

# Data Models & Persistence Strategy
**Note**: Defines a `BaseEntity` interface containing default audit fields: `id`, `createdBy`, `createdDate`, `updatedBy`, `updatedDate`, `tenantId`.

*   **SQLite/PG (Relational)**:
    *   `Product`, `User`, `TenantConfig`.
*   **MongoDB (Document)**:
    *   `PRD`: `content` (Full Markdown), `versionHistory`, `metadata`.
    *   `WebAnalysis`: 爬取的竞品分析报告数据。
*   **Neo4j (Graph)**:
    *   Nodes: `Requirement`, `Feature`, `Persona`, `Goal`, `Risk`.
    *   Relationships: `BLOCKS`, `REQUIRES`, `CONTRIBUTES_TO`, `CONFLICTS_WITH`.

# Implementation Steps
1.  **`types.ts`**: 定义统一的 Entity 接口和 DTO。
2.  **`services/db/` (The Adapter Layer)**:
    *   `sqlAdapter.ts`: 封装 Prisma 或 TypeORM (SQLite/PG)。
    *   `mongoAdapter.ts`: 封装 Mongoose 或 Native Client。
    *   `graphAdapter.ts`: 封装 Neo4j Cypher 查询，提供 `findImpactPath`, `detectCircularDependency` 方法。
3.  **`services/geminiService.ts`**: 实现 Graph-RAG 逻辑，先查图谱，再生成内容。
4.  **UI Components**: 增加可视化图谱组件 (使用 `react-force-graph` 或类似库) 展示关联。
5.  **`App.tsx`**: 组装视图。

# Design Aesthetics
*   **Style**: "Notion-like" 极简主义 或 "Linear-like" 黑暗科技风（请选择深色模式 Dark Mode）。
*   **Interaction**: 所有数据加载和 AI 生成过程都需要有细腻的骨架屏（Skeleton）或 Loading 动画。

# Implementation Steps
请按以下顺序输出代码：
1.  **`types.ts`**: 定义产品、需求、PRD 的数据接口。
2.  **`services/db.ts`**: 实现基于 LocalStorage 的通用 Mock 数据库服务。
3.  **`services/geminiService.ts`**: 封装 AI 方法 `generatePRD`, `analyzeRequirement`, `simulateFeedback`。
4.  **Components**: 核心 UI 组件（卡片、编辑器视图、看板）。
5.  **`App.tsx`**: 组装所有视图，实现基于 State 的路由逻辑。

# Limitations
*   代码必须强类型（TypeScript）。
*   必须包含 Mock 初始化数据，确保应用运行时不为空。
*   保持文件结构清晰，不要把所有代码堆在一个文件里。
