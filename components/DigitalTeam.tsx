
import React, { useState } from 'react';
import { DigitalAgent, Language, AgentStatus } from '../types';
import { translations } from '../translations';
import { 
  Bot, Brain, Terminal, BarChart, Shield, Wrench, 
  Power, Zap, Activity, Database
} from 'lucide-react';

interface DigitalTeamProps {
  agents: DigitalAgent[];
  language: Language;
  onWakeAgent?: (id: string) => void;
  onAssignTask?: (agentId: string, task: string) => void;
}

const RoleIcon = ({ role }: { role: string }) => {
  switch (role) {
    case 'Project Manager': return <BarChart className="w-5 h-5 text-blue-400" />;
    case 'Tech Lead': return <Terminal className="w-5 h-5 text-green-400" />;
    case 'Architect': return <Wrench className="w-5 h-5 text-orange-400" />;
    case 'DevOps Engineer': return <Bot className="w-5 h-5 text-cyan-400" />;
    default: return <Bot className="w-5 h-5 text-slate-400" />;
  }
};

const DigitalTeam: React.FC<DigitalTeamProps> = ({ agents: initialAgents, language, onWakeAgent, onAssignTask }) => {
  const t = translations[language];
  const [agents, setAgents] = useState(initialAgents);

  const handleWake = (id: string) => {
    setAgents(prev => prev.map(a => a.id === id ? { ...a, status: 'AWAKE' } : a));
    onWakeAgent?.(id);
  };

  const getStatusStyle = (status: AgentStatus) => {
    switch (status) {
      case 'AWAKE': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
      case 'WORKING': return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
      case 'TRAINING': return 'text-purple-400 bg-purple-400/10 border-purple-400/20';
      default: return 'text-slate-500 bg-slate-500/10 border-slate-500/20';
    }
  };

  return (
    <div className="bg-slate-800/50 rounded-3xl border border-slate-700 p-8">
      <div className="flex justify-between items-center mb-10">
        <h3 className="text-2xl font-black text-white flex items-center gap-3">
          <Brain className="text-purple-400" />
          {t.detail.team}
        </h3>
        <div className="flex gap-4">
           <div className="flex items-center gap-2 px-4 py-1.5 bg-slate-900 rounded-full border border-slate-700">
             <Database size={14} className="text-blue-400" />
             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Feedback Loop: Active</span>
           </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {agents.map((agent) => (
          <div 
            key={agent.id} 
            className={`group relative p-6 rounded-2xl border transition-all duration-500 overflow-hidden ${
              agent.status === 'HIBERNATING' ? 'bg-slate-900/40 border-slate-800' : 'bg-slate-900 border-slate-700 shadow-xl shadow-blue-900/10'
            }`}
          >
            {/* Neural Pulse Background */}
            {agent.status !== 'HIBERNATING' && (
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent animate-pulse opacity-50"></div>
            )}

            <div className="flex items-start gap-6 mb-6">
              <div className="relative">
                <img 
                  src={`https://picsum.photos/seed/${agent.avatarSeed}/200`} 
                  alt={agent.name}
                  className={`w-16 h-16 rounded-2xl object-cover border-2 transition-all duration-500 ${
                    agent.status === 'HIBERNATING' ? 'border-slate-700 grayscale' : 'border-blue-500 ring-4 ring-blue-500/10'
                  }`}
                />
                <div className={`absolute -bottom-2 -right-2 rounded-lg p-1.5 border ${
                  agent.status === 'HIBERNATING' ? 'bg-slate-800 border-slate-700' : 'bg-slate-900 border-blue-500 shadow-lg'
                }`}>
                  <RoleIcon role={agent.role} />
                </div>
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-black text-white text-lg">{agent.name}</h4>
                    <p className="text-[10px] text-blue-400 font-black uppercase tracking-widest">{agent.role}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-tighter border ${getStatusStyle(agent.status)}`}>
                    {agent.status}
                  </span>
                </div>
                
                {/* Saturation Bar */}
                <div className="mt-4">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[9px] text-slate-500 font-black uppercase">{t.detail.agentSaturation}</span>
                    <span className="text-[9px] text-blue-400 font-mono font-bold">{agent.saturation || 85}%</span>
                  </div>
                  <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500 transition-all duration-1000" 
                      style={{ width: `${agent.saturation || 85}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {agent.status === 'HIBERNATING' ? (
                <button 
                  onClick={() => handleWake(agent.id)}
                  className="w-full py-3 bg-slate-800 hover:bg-blue-600 text-slate-400 hover:text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                >
                  <Power size={14} /> {t.detail.agentWake}
                </button>
              ) : (
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="bg-slate-950/50 rounded-xl p-4 border border-slate-800 mb-4">
                     <p className="text-[10px] text-slate-500 uppercase font-black mb-2 flex items-center gap-2">
                       <Zap size={10} className="text-yellow-500" /> {t.detail.agentMission}
                     </p>
                     <p className="text-xs text-slate-300 font-mono italic">
                       {agent.currentTask || t.detail.agentAwaiting}
                     </p>
                  </div>
                  <div className="flex gap-2">
                    <button className="flex-1 py-2 bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white rounded-lg text-[10px] font-black uppercase tracking-widest transition-all border border-blue-600/30">
                      {t.detail.agentAssign}
                    </button>
                    <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-lg transition-all">
                      <Activity size={14} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DigitalTeam;
