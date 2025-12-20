
import React from 'react';
import { ExecutionPlan as IExecutionPlan, Language } from '../types';
import { translations } from '../translations';
import {
  Users, ListTodo, Cpu, Clock,
  Zap, Building, Cloud
} from 'lucide-react';

interface ExecutionPlanProps {
  plan: IExecutionPlan;
  language: Language;
  selectedTier: keyof IExecutionPlan; // Forced sync with mall SKU selection
}

const ExecutionPlan: React.FC<ExecutionPlanProps> = ({ plan, language, selectedTier }) => {
  const t = translations[language];
  const currentTier = plan?.[selectedTier];

  if (!currentTier) {
    return (
      <div className="bg-slate-800 rounded-3xl border border-slate-700 p-8 text-center text-slate-500">
        Execution Plan not available for this tier.
      </div>
    );
  }

  return (
    <div className="bg-slate-800 rounded-3xl border border-slate-700 overflow-hidden shadow-xl">
      <div className="p-8 border-b border-slate-700 flex justify-between items-center">
        <h3 className="text-2xl font-bold text-white flex items-center gap-3">
          <ListTodo className="text-blue-400" /> {t.execution.title}
        </h3>
        <div className="flex gap-2">
          {['poc', 'production', 'saas'].map((id) => (
            <div
              key={id}
              className={`w-3 h-3 rounded-full ${selectedTier === id ? 'bg-blue-500 scale-125' : 'bg-slate-700'} transition-all`}
            ></div>
          ))}
        </div>
      </div>

      <div className="p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

          {/* Detailed Specs */}
          <div className="space-y-8">
            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800">
              <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                <Cpu size={14} className="text-blue-400" /> {t.execution.resources}
              </h4>
              <div className="grid grid-cols-2 gap-y-6 gap-x-12">
                <div>
                  <label className="text-[10px] text-slate-500 uppercase mb-1 block">{t.execution.hardware}</label>
                  <span className="text-sm text-white font-mono">{currentTier.resources.compute}</span>
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 uppercase mb-1 block">{t.execution.network}</label>
                  <span className="text-sm text-white font-mono">{currentTier.resources.network}</span>
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 uppercase mb-1 block">RAM / Storage</label>
                  <span className="text-sm text-white font-mono">{currentTier.resources.memory} / {currentTier.resources.storage}</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800">
              <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                <Users size={14} className="text-purple-400" /> {t.execution.human}
              </h4>
              <div className="flex flex-wrap gap-2 mb-4">
                {currentTier.human.roles.map((role, i) => (
                  <span key={i} className="px-3 py-1 bg-purple-500/10 text-purple-300 text-[10px] rounded-full uppercase font-bold border border-purple-500/20">
                    {role}
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-400 border-t border-slate-800 pt-4">
                <Clock size={16} />
                {t.execution.hours}: <span className="text-white font-bold">{currentTier.human.estimatedHours}h</span>
              </div>
            </div>
          </div>

          {/* Roadmap */}
          <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800">
            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-8 flex items-center gap-2">
              <ListTodo size={14} className="text-emerald-400" /> {t.execution.steps}
            </h4>
            <div className="space-y-6">
              {currentTier.steps.map((step, i) => (
                <div key={i} className="flex gap-4 group">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center text-xs font-bold text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
                      {i + 1}
                    </div>
                    {i < currentTier.steps.length - 1 && <div className="w-px h-full bg-slate-700 my-2"></div>}
                  </div>
                  <p className="text-sm text-slate-300 pt-1.5 group-hover:text-white transition-colors leading-relaxed">{step}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExecutionPlan;
