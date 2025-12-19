
import React, { useState } from 'react';
import { AdminUser, Language, AdminView, UserRole, AiModel, ModelConfig } from '../../types';
import { translations } from '../../translations';
import { LayoutDashboard, Database, Users, Settings, Activity, LogOut, Menu, X, Cpu, Brain } from 'lucide-react';
import AdminDashboard from './AdminDashboard';
import SolutionManager from './SolutionManager';
import UserManager from './UserManager';
import AuditLogViewer from './AuditLogViewer';
import SystemConfig from './SystemConfig';
import ModelSettings from '../ModelSettings';
import AgentWorkshop from './AgentWorkshop';

interface AdminPortalProps {
  user: AdminUser;
  language: Language;
  onLogout: () => void;
  aiModel: AiModel;
  setAiModel: (m: AiModel) => void;
  modelConfigs: Record<AiModel, ModelConfig>;
  onUpdateConfig: (m: AiModel, c: ModelConfig) => void;
}

const AdminPortal: React.FC<AdminPortalProps> = ({ 
  user, language, onLogout, 
  aiModel, setAiModel, modelConfigs, onUpdateConfig 
}) => {
  const t = translations[language];
  const [currentView, setCurrentView] = useState<AdminView>(AdminView.DASHBOARD);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const canAccessSolutions = [UserRole.SUPER_ADMIN, UserRole.SOLUTION_ARCHITECT].includes(user.role);
  const canAccessSystem = [UserRole.SUPER_ADMIN, UserRole.SYSTEM_OP].includes(user.role);

  const NavItem = ({ view, icon: Icon, label, disabled = false }: { view: AdminView, icon: any, label: string, disabled?: boolean }) => (
    <button
      onClick={() => !disabled && setCurrentView(view)}
      className={`
        w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all mb-1
        ${currentView === view 
          ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/30' 
          : disabled 
            ? 'text-slate-600 cursor-not-allowed' 
            : 'text-slate-400 hover:bg-slate-800 hover:text-white'
        }
      `}
    >
      <Icon size={20} />
      {sidebarOpen && <span className="font-medium">{label}</span>}
    </button>
  );

  return (
    <div className="flex min-h-screen bg-slate-900">
      <div className={`bg-slate-900 border-r border-slate-700 transition-all duration-300 flex flex-col ${sidebarOpen ? 'w-64' : 'w-20'}`}>
        <div className="p-4 flex items-center justify-between border-b border-slate-800">
          {sidebarOpen && (
            <div className="flex items-center gap-3">
              <img src={`https://picsum.photos/seed/${user.avatar}/100`} className="w-10 h-10 rounded-full border-2 border-slate-600" alt="Profile" />
              <div className="flex flex-col">
                <span className="text-white font-bold text-sm truncate w-32">{user.username}</span>
                <span className="text-xs text-blue-400 truncate w-32">{t.admin.roles[user.role]}</span>
              </div>
            </div>
          )}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-slate-400 hover:text-white p-1">
            {sidebarOpen ? <X size={20} /> : <Menu size={20} className="mx-auto" />}
          </button>
        </div>

        <nav className="flex-1 p-4 overflow-y-auto">
          <NavItem view={AdminView.DASHBOARD} icon={LayoutDashboard} label={t.admin.dashboard} />
          <NavItem view={AdminView.SOLUTIONS} icon={Database} label={t.admin.solutions} disabled={!canAccessSolutions} />
          <NavItem view={AdminView.AGENTS_WORKSHOP} icon={Brain} label="Agent Workshop" disabled={!canAccessSolutions} />
          <NavItem view={AdminView.AI_ENGINE} icon={Cpu} label={t.admin.engine} disabled={!canAccessSystem} />
          <NavItem view={AdminView.USERS} icon={Users} label={t.admin.users} disabled={!canAccessSystem} />
          <NavItem view={AdminView.AUDIT_LOGS} icon={Activity} label={t.admin.logs} />
          <NavItem view={AdminView.SYSTEM} icon={Settings} label={t.admin.system} disabled={!canAccessSystem} />
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button onClick={onLogout} className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-900/20 hover:text-red-300 rounded-lg transition-colors">
            <LogOut size={20} />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </div>

      <div className="flex-1 p-8 overflow-y-auto">
        {currentView === AdminView.DASHBOARD && <AdminDashboard language={language} />}
        {currentView === AdminView.SOLUTIONS && <SolutionManager language={language} />}
        {currentView === AdminView.AGENTS_WORKSHOP && <AgentWorkshop language={language} />}
        {currentView === AdminView.USERS && <UserManager language={language} />}
        {currentView === AdminView.AUDIT_LOGS && <AuditLogViewer language={language} />}
        {currentView === AdminView.SYSTEM && <SystemConfig language={language} />}
        {currentView === AdminView.AI_ENGINE && (
          <ModelSettings 
            currentModel={aiModel}
            onSelectModel={setAiModel}
            configs={modelConfigs}
            onUpdateConfig={onUpdateConfig}
            language={language}
          />
        )}
      </div>
    </div>
  );
};

export default AdminPortal;
