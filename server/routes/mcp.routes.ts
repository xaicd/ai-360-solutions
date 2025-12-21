
import { Router, Request, Response } from 'express';

const router = Router();

router.get('/agent/:agentRole', (req: Request, res: Response) => {
    const { agentRole } = req.params;
    // Dynamic generation based on role
    // In future: Query DB for agent capabilities
    res.json({
        jsonrpc: "2.0",
        result: {
            name: `AI 360 Employee: ${agentRole}`,
            version: "1.0.0",
            capabilities: {
                tools: {
                    "query_knowledge": {
                        "description": "Query the specialized knowledge base of this solution.",
                        "parameters": { "type": "object", "properties": { "query": { "type": "string" } } }
                    },
                    "gen_report": {
                        "description": "Generate a PDF report based on findings.",
                        "parameters": { "type": "object", "properties": { "title": { "type": "string" } } }
                    },
                    "code_audit": {
                        "description": "Scan code for vulnerabilities (DevOps only).",
                        "parameters": { "type": "object", "properties": { "repoUrl": { "type": "string" } } }
                    }
                }
            }
        }
    });
});

export const mcpRoutes = router;
