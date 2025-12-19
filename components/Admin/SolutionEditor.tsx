
import React, { useState } from 'react';
import { Solution, Language, EnrichedSolution } from '../../types';
import { translations } from '../../translations';
import { 
  X, Save, Package, Target, Cpu, 
  Users, ListTodo, Plus, Trash2, Globe, Github, Bitcoin
} from 'lucide-react';

interface SolutionEditorProps {
  solution?: Solution | EnrichedSolution;
  language: Language;
  onSave: (solution: Partial<Solution>) => void;
  onCancel: () => void;
}

const SolutionEditor: React.FC<SolutionEditorProps> = ({ solution, language, onSave, onCancel }) => {
  const t = translations[language];
  const [activeTab, setActiveTab] = useState<'basic' | 'specs' | 'execution'>('basic');
  
  const [formData, setFormData] = useState<Partial<Solution & { scenarios: string[] }>>({
    id: solution?.id || Math.random().toString(36).substr(2, 9),
    title: solution?.title || '',
    description: solution?.description || '',
    industry: solution?.industry || t.industries[0],
    githubRepo: solution?.githubRepo || '',
    price: solution?.price || 0,
    currency: solution?.currency || 'CNY',
    scenarios: solution?.scenarios || [],
    tags: solution?.tags || [],
    status: solution?.status || 'pending',
    architectReview: solution?.architectReview || { 
      qualityScore: 0, 
      securityVerdict: 'Pending', 
      codeMaintainability: 'Medium',
      isAudited: false,
      auditDate: new Date().toISOString()
    }
  });

  const handleScenarioAdd = () => {
    setFormData(prev => ({ ...prev, scenarios: [...(prev.scenarios || []), ""] }));
  };

  const updateScenario = (index: number, val: string) => {
    const next = [...(formData.scenarios || [])];
    next[index] = val;
    setFormData(prev => ({ ...prev, scenarios: next }));
  };

  const removeScenario = (index: number) => {
    setFormData(prev => ({ ...prev, scenarios: prev.scenarios?.filter((_, i) => i !== index) }));
  };

  return (
    <div className="animate-fade-in pb-20">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-white">
            {solution ? t.admin.table.edit : t.admin.addSolution}
          </h2>
          <p className="text-slate-400 text-sm mt-1">Configure product attributes and marketplace placement.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={onCancel}
            className="px-6 py-2.5 rounded-xl border border-slate-700 text-slate-400 hover:text-white transition-all font-bold"
          >
            Cancel
          </button>
          <button 
            onClick={() => onSave(formData)}
            className="px-8 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black transition-all shadow-xl shadow-blue-900/20 flex items-center gap-2"
          >
            <Save size={18} /> {t.admin.editor.save}
          </button>
        </div>
      </div>

      <div className="flex gap-8">
        {/* Left Nav */}
        <div className="w-64 space-y-1">
          {[
            { id: 'basic', label: t.admin.editor.basicInfo, icon: Globe },
            { id: 'specs', label: t.admin.editor.scenarios, icon: Target },
            { id: 'execution', label: t.admin.editor.execution, icon: Package },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`
                w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold text-sm
                ${activeTab === tab.id ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20' : 'text-slate-500 hover:bg-slate-800 hover:text-slate-300'}
              `}
            >
              <tab.icon size={18} /> {tab.label}
            </button>
          ))}
        </div>

        {/* Form Area */}
        <div className="flex-1 space-y-8 bg-slate-800 border border-slate-700 rounded-3xl p-10">
          
          {activeTab === 'basic' && (
            <div className="space-y-6">
               <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t.admin.table.name}</label>
                    <input 
                      type="text" 
                      value={formData.title} 
                      onChange={e => setFormData({...formData, title: e.target.value})}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Industry Category</label>
                    <select 
                      value={formData.industry} 
                      onChange={e => setFormData({...formData, industry: e.target.value})}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      {t.industries.map(i => <option key={i}>{i}</option>)}
                    </select>
                  </div>
               </div>

               <div className="space-y-2">
                 <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Short Description</label>
                 <textarea 
                   value={formData.description}
                   onChange={e => setFormData({...formData, description: e.target.value})}
                   rows={3}
                   className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                 />
               </div>

               <div className="grid grid-cols-3 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Base Price</label>
                    <input 
                      type="number" 
                      value={formData.price} 
                      onChange={e => setFormData({...formData, price: parseFloat(e.target.value)})}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white font-mono" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Pricing Currency</label>
                    <select 
                      value={formData.currency} 
                      onChange={e => setFormData({...formData, currency: e.target.value as any})}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white"
                    >
                      <option value="CNY">CNY (Traditional)</option>
                      <option value="USD">USD (Global)</option>
                      <option value="USDT">USDT (Web3)</option>
                      <option value="USDC">USDC (Web3)</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Market Status</label>
                    <select 
                      value={formData.status} 
                      onChange={e => setFormData({...formData, status: e.target.value as any})}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white"
                    >
                      <option value="pending">Pending Audit</option>
                      <option value="active">Active Mall Listing</option>
                      <option value="deprecated">Hidden/Deprecated</option>
                    </select>
                  </div>
               </div>

               <div className="space-y-2 pt-4">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                    <Github size={12} /> Source Repository
                  </label>
                  <input 
                    type="text" 
                    value={formData.githubRepo} 
                    onChange={e => setFormData({...formData, githubRepo: e.target.value})}
                    placeholder="organization/repository"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white font-mono text-sm" 
                  />
               </div>
            </div>
          )}

          {activeTab === 'specs' && (
            <div className="space-y-8">
               <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest">{t.mall.scenarios}</h3>
                    <button 
                      onClick={handleScenarioAdd}
                      className="text-xs text-blue-400 flex items-center gap-1 hover:text-blue-300 font-bold"
                    >
                      <Plus size={14} /> Add Scenario
                    </button>
                  </div>
                  <div className="space-y-3">
                    {formData.scenarios?.map((s, idx) => (
                      <div key={idx} className="flex gap-3">
                         <input 
                           type="text" 
                           value={s} 
                           onChange={e => updateScenario(idx, e.target.value)}
                           className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-white text-sm"
                           placeholder="Describe a business use case..."
                         />
                         <button onClick={() => removeScenario(idx)} className="p-2 text-red-500 hover:bg-red-900/10 rounded-lg">
                           <Trash2 size={16} />
                         </button>
                      </div>
                    ))}
                    {(!formData.scenarios || formData.scenarios.length === 0) && (
                      <div className="text-center py-6 border-2 border-dashed border-slate-700 rounded-2xl text-slate-500 text-sm italic">
                        No specific scenarios defined yet.
                      </div>
                    )}
                  </div>
               </div>
            </div>
          )}

          {activeTab === 'execution' && (
            <div className="space-y-8">
               <p className="text-slate-400 text-sm">Deployment tiers act as SKU variations for this product. High-level configuration of requirements is managed here.</p>
               <div className="grid grid-cols-1 gap-6">
                 {[
                   { id: 'poc', label: t.mall.skuPoc, color: 'text-blue-400' },
                   { id: 'production', label: t.mall.skuProd, color: 'text-purple-400' },
                   { id: 'saas', label: t.mall.skuSaas, color: 'text-emerald-400' }
                 ].map(tier => (
                   <div key={tier.id} className="bg-slate-950/50 rounded-2xl p-6 border border-slate-700 hover:border-slate-600 transition-colors">
                      <div className="flex justify-between items-center mb-6">
                         <div className={`font-black uppercase tracking-tighter text-lg ${tier.color}`}>{tier.label}</div>
                         <div className="text-xs text-slate-500">Base Modifier: {tier.id === 'production' ? '5.0x' : (tier.id === 'saas' ? '2.0x' : '1.0x')}</div>
                      </div>
                      <div className="grid grid-cols-2 gap-x-12 gap-y-4">
                         <div className="space-y-1">
                           <label className="text-[10px] font-black text-slate-600 uppercase">Resource Requirement</label>
                           <input type="text" className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-300" placeholder="e.g. 8 vCPU, 32GB RAM" />
                         </div>
                         <div className="space-y-1">
                           <label className="text-[10px] font-black text-slate-600 uppercase">Human Resources</label>
                           <input type="text" className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-300" placeholder="e.g. Tech Lead, DevOps" />
                         </div>
                      </div>
                   </div>
                 ))}
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SolutionEditor;
