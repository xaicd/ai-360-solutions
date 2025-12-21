import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import util from 'util';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const execAsync = util.promisify(exec);

export class TerraformService {
    // Relative from server/services/ to server/terraform/workspaces
    private basePath = path.join(__dirname, '../terraform/workspaces');
    private modulesPath = path.join(__dirname, '../terraform/modules');

    constructor() {
        if (!fs.existsSync(this.basePath)) {
            fs.mkdirSync(this.basePath, { recursive: true });
        }
    }

    async initWorkspace(resourceId: string, provider: 'aws' | 'aliyun', type: 'ec2' | 'ecs', config: any) {
        const workspaceDir = path.join(this.basePath, resourceId);
        if (!fs.existsSync(workspaceDir)) {
            fs.mkdirSync(workspaceDir, { recursive: true });
        }

        // Determine Module Path relative to the workspace file (../../modules/...)
        const sourcePath = `../../modules/${provider}/${type}`;

        // Generate main.tf
        // We map config keys to module variables dynamically
        // Note: In production, use strict mapping.

        const variables = Object.keys(config).map(key => {
            return `${key} = "${config[key]}"`;
        }).join('\n  ');

        const tfContent = `
module "main" {
  source = "${sourcePath}"
  
  ${variables}
}

output "outputs" {
  value = module.main
}
`;

        fs.writeFileSync(path.join(workspaceDir, 'main.tf'), tfContent);

        return this.runCommand(workspaceDir, 'terraform init');
    }

    async plan(resourceId: string) {
        const workspaceDir = path.join(this.basePath, resourceId);
        // We run regular plan to get human readable output for the Console
        const result = await this.runCommand(workspaceDir, 'terraform plan -out=tfplan');
        return result.stdout;
    }

    async apply(resourceId: string) {
        const workspaceDir = path.join(this.basePath, resourceId);
        const applyResult = await this.runCommand(workspaceDir, 'terraform apply -auto-approve tfplan');

        // Capture Outputs
        const outputResult = await this.runCommand(workspaceDir, 'terraform output -json');

        return {
            logs: applyResult.stdout,
            outputs: JSON.parse(outputResult.stdout || '{}')
        };
    }

    async destroy(resourceId: string) {
        const workspaceDir = path.join(this.basePath, resourceId);
        const result = await this.runCommand(workspaceDir, 'terraform destroy -auto-approve');
        return result.stdout;
    }

    private async runCommand(cwd: string, command: string) {
        console.log(`[TF Runner] Executing: ${command} in ${cwd}`);
        try {
            const { stdout, stderr } = await execAsync(command, { cwd });
            return { stdout, stderr };
        } catch (error: any) {
            console.error(`[TF Error]`, error.stdout || error.message);
            throw new Error(error.stdout || error.message);
        }
    }
}

export const terraformService = new TerraformService();
