
import React, { useState, useEffect } from 'react';
import { Solution, Language } from '../../types';
import { translations } from '../../translations';
import { 
  X, Cpu, Database, Activity, ShieldCheck, 
  Loader2, CheckCircle2, Terminal, Zap, Users
} from 'lucide-react';

interface AuditWorkflowModalProps {
  solution: Solution;
  language: Language;
  onClose: () => void;
  onComplete: (id: string) => void;
}

const AuditWorkflowModal: React.FC<AuditWorkflowModalProps> = ({ solution, language, onClose, onComplete }) => {
  const t = translations[language];
  const [step, setStep] = useState<'init' | 'training' | 'simulating' | 'done'>('init');
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (msg: string) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  useEffect(() => {
    if (step === 'training') {
      addLog("Digital Architect Workshop: Starting Neural Team Assembly...");
      addLog("Defining Agent Personas for industry: " + solution.industry);
      const interval = setInterval(() => {
        setProgress(p => {
          if (p >= 100) {
            clearInterval(interval);
            setStep('simulating');
            setProgress(0);
            return 100;
          }
          if (p === 30) addLog("Synthesizing Tech Lead knowledge base from repository...");
          if (p === 60) addLog("Injecting compliance protocols into Auditor Agent...");
          if (p === 90) addLog("Assembling Project Manager resource allocation matrix...");
          return p + 4;
        });
      }, 60);
      return () => clearInterval(interval);
    }

    if (step === 'simulating') {
      addLog("Cloud Stress Test: Spinning up cross-platform simulation...");
      const interval = setInterval(() => {
        setProgress(p => {
          if (p >= 100) {
            clearInterval(interval);
            setStep('done');
            return 100;
          }
          if (p === 40) addLog("Testing Aliyun ecs.gn7i compatibility...");
          if (p === 80) addLog("Verifying AWS inferentia2 node throughput...");
          return p + 3;
        });
      }, 50);
      return () => clearInterval(interval);
    }
  }, [step, solution.industry]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md" onClick={onClose}></div>
      <div className="relative bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[620px]">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Zap className="text-blue-400" size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">{t.admin.audit.title}</h3>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest">{solution.title}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full text-slate-500 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex flex-col p-8">
          
          {/* Status Bar */}
          <div className="grid grid-cols-3 gap-6 mb-10">
            {[
              { id: 'training', label: 'Team Assembly', icon: Users, color: 'text-blue-400', activeColor: 'bg-blue-500' },
              { id: 'simulating', label: 'Mall Simulation', icon: Activity, color: 'text-purple-400', activeColor: 'bg-purple-500' },
              { id: 'done', label: 'Ready to List', icon: ShieldCheck, color: 'text-emerald-400', activeColor: 'bg-emerald-500' }
            ].map((s) => (
              <div key={s.id} className={`flex flex-col gap-2 ${step === s.id ? 'opacity-100' : (step === 'done' ? 'opacity-100' : 'opacity-30')}`}>
                 <div className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest ${s.color}`}>
                   <s.icon size={12} /> {s.label}
                 </div>
                 <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                   <div 
                    className={`h-full ${s.activeColor} transition-all duration-300`} 
                    style={{ width: step === s.id ? `${progress}%` : (step === 'init' ? '0%' : '100%') }}
                   ></div>
                 </div>
              </div>
            ))}
          </div>

          {/* Terminal Output */}
          <div className="flex-1 bg-slate-950 rounded-xl border border-slate-800 p-5 font-mono text-[10px] overflow-y-auto space-y-1 shadow-inner">
            {logs.map((log, i) => (
              <div key={i} className="text-slate-400 leading-relaxed">
                <span className="text-blue-600">architect@mall:~$</span> {log}
              </div>
            ))}
            {step !== 'done' && step !== 'init' && (
              <div className="flex items-center gap-2 text-blue-500 mt-3 italic animate-pulse">
                <Loader2 size={12} className="animate-spin" />
                Processing solution data... {progress}%
              </div>
            )}
            {step === 'done' && (
              <div className="mt-4 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded text-emerald-400 font-bold uppercase tracking-tighter text-center">
                Vetting Complete: Digital Team Assembled & SKU Pricing Validated.
              </div>
            )}
          </div>
        </div>

        {/* Action Button */}
        <div className="p-6 bg-slate-900 border-t border-slate-800 flex justify-end">
          {step === 'init' ? (
            <button 
              onClick={() => setStep('training')}
              className="bg-blue-600 hover:bg-blue-500 text-white px-10 py-3.5 rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-xl shadow-blue-900/30 flex items-center gap-2"
            >
              <Zap size={16} /> {t.admin.audit.train}
            </button>
          ) : step === 'done' ? (
            <button 
              onClick={() => onComplete(solution.id)}
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-10 py-3.5 rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-xl shadow-emerald-900/30 flex items-center gap-2"
            >
              <CheckCircle2 size={16} /> {t.admin.audit.approve}
            </button>
          ) : (
             <div className="text-slate-500 text-xs font-bold uppercase flex items-center gap-2 pr-4">
               <Loader2 size={14} className="animate-spin" />
               Architect Workshop Busy...
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuditWorkflowModal;
