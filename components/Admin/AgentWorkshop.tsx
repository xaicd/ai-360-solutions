
import React, { useState, useEffect } from 'react';
import { Language, DigitalAgent, Solution } from '../../types';
import { api } from '../../services/api';
import { generateDigitalTeam } from '../../services/geminiService';
import { translations } from '../../translations';
import {
  Brain, Zap, Database, CheckCircle2, Loader2,
  Terminal, Activity, Plus, Settings2, Target, Sparkles
} from 'lucide-react';

interface AgentWorkshopProps {
  language: Language;
  initialSolutionId?: string;
}

const AgentWorkshop: React.FC<AgentWorkshopProps> = ({ language, initialSolutionId }) => {
  const t = translations[language];
  const [agents, setAgents] = useState<DigitalAgent[]>([]);
  const [allAgents, setAllAgents] = useState<DigitalAgent[]>([]);
  const [solutions, setSolutions] = useState<Solution[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<DigitalAgent | null>(null);
  const [selectedSolutionId, setSelectedSolutionId] = useState<string>(initialSolutionId || '');
  const [isTraining, setIsTraining] = useState(false);
  const [isAssembling, setIsAssembling] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newAgentForm, setNewAgentForm] = useState({ name: '', role: '', personality: '' });

  useEffect(() => {
    // Load all data
    const loadData = async () => {
      const [resAgents, resSolutions] = await Promise.all([
        api.agents.list(),
        api.solutions.list()
      ]);
      if (resAgents.data) setAllAgents(resAgents.data);
      if (resSolutions.data) setSolutions(resSolutions.data);
    };
    loadData();
  }, []);

  useEffect(() => {
    if (selectedSolutionId) {
      setAgents(allAgents.filter(a => a.solutionId === selectedSolutionId));
    } else {
      setAgents(allAgents);
    }
  }, [selectedSolutionId, allAgents]);

  useEffect(() => {
    if (initialSolutionId) {
      setSelectedSolutionId(initialSolutionId);
    }
  }, [initialSolutionId]);

  const handleAutoAssemble = async () => {
    if (!selectedSolutionId) {
      alert("Please select a target solution first.");
      return;
    }
    const solution = solutions.find(s => s.id === selectedSolutionId);
    if (!solution) return;

    setIsAssembling(true);
    try {
      const newTeam = await generateDigitalTeam(solution, language);
      setAgents(prev => [...prev, ...newTeam]);
      if (newTeam.length > 0) setSelectedAgent(newTeam[0]);
    } catch (e) {
      alert("AI Team Assembly failed.");
    } finally {
      setIsAssembling(false);
    }
  };

  const handleTrain = () => {
    if (!selectedAgent) return;
    setIsTraining(true);
    setLogs([`[${new Date().toLocaleTimeString()}] ${t.admin.workshop.logs.access}`]);

    let p = 0;
    const interval = setInterval(() => {
      p += 10;
      if (p === 20) setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${t.admin.workshop.logs.fetch} ${selectedAgent.boundSolutionId || 'General'}`]);
      if (p === 50) setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${t.admin.workshop.logs.inject}`]);
      if (p === 80) setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${t.admin.workshop.logs.optimize}`]);

      if (p >= 100) {
        clearInterval(interval);
        setIsTraining(false);
        const newSaturation = Math.min(100, (selectedAgent.saturation || 0) + 12);

        // Optimistic update
        setAllAgents(prev => prev.map(a => a.id === selectedAgent.id ? { ...a, saturation: newSaturation } : a));
        if (selectedAgent) setSelectedAgent({ ...selectedAgent, saturation: newSaturation });

        // API Call
        api.agents.update(selectedAgent.id, { saturation: newSaturation });

        setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${t.admin.workshop.logs.complete}`]);
      }
    }, 150);
  };

  const handleCreateAgent = async () => {
    if (!newAgentForm.name || !newAgentForm.role) return;
    const res = await api.agents.create({
      ...newAgentForm,
      // If a solution is selected, bind to it. Else bind to talent pool.
      solutionId: selectedSolutionId || 'SOL-TALENT-POOL',
      avatarSeed: `agent-${Math.floor(Math.random() * 1000)}`
    });

    if (res.success && res.data) {
      setAllAgents(prev => [...prev, res.data!]);
      setShowCreateModal(false);
      setNewAgentForm({ name: '', role: '', personality: '' });
    }
  };

  return (
    <div className="animate-fade-in flex flex-col h-full">
      <div className="mb-8 flex justify-between items-start">
        <div>
          <h2 className="text-3xl font-black text-white flex items-center gap-3">
            <Brain className="text-purple-400" /> {t.admin.agentWorkshop}
          </h2>
          <p className="text-slate-400 text-sm mt-1">{t.admin.workshop.subtitle}</p>
        </div>

        <div className="flex items-center gap-3 bg-slate-800 p-2 rounded-2xl border border-slate-700">
          <select
            value={selectedSolutionId}
            onChange={(e) => setSelectedSolutionId(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-xs text-white outline-none min-w-[200px]"
          >
            <option value="">{t.admin.workshop.bindSelect}</option>
            {solutions.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
          </select>
          <button
            onClick={handleAutoAssemble}
            disabled={isAssembling || !selectedSolutionId}
            className="bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all shadow-lg shadow-blue-900/20"
          >
            {isAssembling ? <Loader2 className="animate-spin" size={14} /> : <Sparkles size={14} />}
            {t.admin.workshop.autoAssemble}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8 flex-1 overflow-hidden">
        {/* Agent Inventory */}
        <div className="col-span-4 space-y-4 overflow-y-auto pr-2 custom-scrollbar">
          {agents.map(a => (
            <button
              key={a.id}
              onClick={() => setSelectedAgent(a)}
              className={`w-full text-left p-5 rounded-2xl border transition-all relative overflow-hidden group ${selectedAgent?.id === a.id ? 'bg-blue-600/10 border-blue-500 shadow-lg' : 'bg-slate-800 border-slate-700 hover:border-slate-600'
                }`}
            >
              {a.status === 'AWAKE' && (
                <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
              )}
              <div className="flex items-center gap-4">
                <img src={`https://picsum.photos/seed/${a.avatarSeed}/100`} className="w-12 h-12 rounded-xl border border-slate-600 group-hover:scale-110 transition-transform" />
                <div className="flex-1">
                  <h4 className="font-bold text-white text-sm">{a.name}</h4>
                  <p className="text-[9px] text-slate-500 uppercase font-black">{a.role}</p>
                </div>
                <div className="text-right">
                  <div className={`text-[9px] font-black mb-1 ${a.saturation > 80 ? 'text-emerald-400' : 'text-blue-400'}`}>{a.saturation}%</div>
                  <div className="h-1 w-10 bg-slate-900 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500" style={{ width: `${a.saturation}%` }}></div>
                  </div>
                </div>
              </div>
            </button>
          ))}
          <button
            onClick={() => setShowCreateModal(true)}
            className="w-full py-4 rounded-2xl border-2 border-dashed border-slate-700 text-slate-500 hover:border-blue-500 hover:text-blue-400 flex items-center justify-center gap-2 transition-all text-xs font-bold"
          >
            <Plus size={16} /> {t.admin.workshop.newAgent}
          </button>
        </div>

        {/* Configuration & Training Workspace */}
        <div className="col-span-8 flex flex-col gap-6 overflow-hidden">
          {selectedAgent ? (
            <>
              <div className="bg-slate-800 rounded-3xl border border-slate-700 p-8 shadow-xl">
                <div className="flex justify-between items-start mb-8">
                  <div className="flex gap-6">
                    <div className="relative">
                      <img src={`https://picsum.photos/seed/${selectedAgent.avatarSeed}/200`} className="w-24 h-24 rounded-3xl border-2 border-blue-500 shadow-2xl" />
                      <div className={`absolute -bottom-2 -right-2 w-6 h-6 rounded-lg border border-slate-700 flex items-center justify-center ${selectedAgent.status === 'AWAKE' ? 'bg-emerald-500 text-white' : 'bg-slate-900 text-slate-500'}`}>
                        <Zap size={12} fill="currentColor" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-white">{selectedAgent.name}</h3>
                      <div className="flex items-center gap-4 mt-2">
                        <span className="text-[10px] text-blue-400 font-black bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20 uppercase tracking-widest">{selectedAgent.role}</span>
                        <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
                          <Target size={12} />
                          {selectedAgent.boundSolutionId ? `ID: ${selectedAgent.boundSolutionId}` : 'Unbound'}
                        </div>
                      </div>
                      <p className="text-sm text-slate-400 mt-4 max-w-lg leading-relaxed">
                        <span className="text-slate-500 font-bold uppercase text-[10px] block mb-1">{t.admin.workshop.personality}</span>
                        {selectedAgent.personality}
                      </p>
                    </div>
                  </div>
                  <button className="p-3 bg-slate-900 rounded-2xl border border-slate-700 text-slate-400 hover:text-white transition-colors">
                    <Settings2 size={20} />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-950/50 p-6 rounded-2xl border border-slate-800">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                        <Sparkles size={14} className="text-blue-400" /> {t.admin.workshop.bindTitle}
                      </h4>
                    </div>
                    <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-xs text-slate-400 flex items-center justify-between">
                      <span>{selectedAgent.boundSolutionId ? solutions.find(s => s.id === selectedAgent.boundSolutionId)?.title : 'System Internal'}</span>
                      <CheckCircle2 size={14} className="text-emerald-500" />
                    </div>
                  </div>

                  <div className="bg-slate-950/50 p-6 rounded-2xl border border-slate-800">
                    <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2 mb-4">
                      <Activity size={14} className="text-emerald-400" /> {t.admin.workshop.feedbackTitle}
                    </h4>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-2 bg-slate-900 rounded-full overflow-hidden">
                        <div className={`h-full bg-emerald-500 transition-all ${selectedAgent.status === 'AWAKE' ? 'animate-pulse w-[85%]' : 'w-0'}`}></div>
                      </div>
                      <span className="text-[9px] text-slate-500 font-mono">{selectedAgent.status === 'AWAKE' ? t.admin.workshop.feedbackLive : 'OFFLINE'}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex-1 bg-slate-950 rounded-3xl border border-slate-800 p-8 flex flex-col overflow-hidden shadow-2xl">
                <div className="flex justify-between items-center mb-6">
                  <h4 className="text-sm font-black text-white flex items-center gap-2 uppercase tracking-widest">
                    <Terminal size={16} className="text-blue-500" /> {t.admin.workshop.terminalTitle}
                  </h4>
                  <button
                    onClick={handleTrain}
                    disabled={isTraining}
                    className="px-6 py-2 bg-purple-600 hover:bg-purple-500 disabled:bg-slate-800 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-purple-900/20"
                  >
                    {isTraining ? t.admin.workshop.syncing : t.admin.workshop.injectBtn}
                  </button>
                </div>
                <div className="flex-1 bg-black/40 rounded-xl p-5 font-mono text-[11px] text-blue-300 space-y-1.5 overflow-y-auto shadow-inner custom-scrollbar">
                  {logs.map((l, i) => (
                    <div key={i} className="animate-in slide-in-from-left-2 duration-300">
                      <span className="text-slate-600 mr-2">➜</span> {l}
                    </div>
                  ))}
                  {logs.length === 0 && <div className="text-slate-700 italic">{t.admin.workshop.terminalReady}</div>}
                  {isTraining && <div className="text-blue-500 animate-pulse">Processing neural chunks...</div>}
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 bg-slate-800/30 rounded-3xl border border-slate-700 border-dashed flex flex-col items-center justify-center text-slate-500">
              <div className="relative mb-6">
                <Brain size={84} className="opacity-10" />
                <Sparkles size={24} className="absolute top-0 right-0 text-blue-500 animate-bounce opacity-40" />
              </div>
              <p className="font-bold tracking-widest uppercase text-xs">Select or Assemble a Digital Team</p>
            </div>
          )}
        </div>
      </div>


      {/* Create Agent Modal */}
      {
        showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
            <div className="bg-slate-900 border border-slate-700 p-8 rounded-3xl w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
              <h3 className="text-xl font-black text-white mb-6">Recruit New Talent</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-xs uppercase font-black text-slate-500">Name</label>
                  <input
                    value={newAgentForm.name}
                    onChange={e => setNewAgentForm({ ...newAgentForm, name: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-white outline-none mt-1 focus:border-blue-500 font-bold"
                    placeholder="e.g. CyberSentinel"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="text-xs uppercase font-black text-slate-500">Role</label>
                  <input
                    value={newAgentForm.role}
                    onChange={e => setNewAgentForm({ ...newAgentForm, role: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-white outline-none mt-1 focus:border-blue-500"
                    placeholder="e.g. Security Analyst"
                  />
                </div>
                <div>
                  <label className="text-xs uppercase font-black text-slate-500">Personality</label>
                  <textarea
                    value={newAgentForm.personality}
                    onChange={e => setNewAgentForm({ ...newAgentForm, personality: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-white outline-none mt-1 focus:border-blue-500"
                    placeholder="e.g. Vigilant and precise"
                    rows={2}
                  />
                </div>
              </div>
              <div className="flex gap-4 mt-8">
                <button onClick={() => setShowCreateModal(false)} className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-xl font-bold transition-colors">Cancel</button>
                <button onClick={handleCreateAgent} className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-900/20">Recruit</button>
              </div>
            </div>
          </div>
        )
      }
    </div >
  );
};

export default AgentWorkshop;
