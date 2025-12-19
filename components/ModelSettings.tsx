
import React, { useState, useEffect } from 'react';
import { AiModel, Language, ModelConfig } from '../types';
import { translations } from '../translations';
import { Cpu, Check, Zap, Server, Shield, Globe, Terminal, Code2, Sliders, Eye, EyeOff } from 'lucide-react';

interface ModelSettingsProps {
  currentModel: AiModel;
  onSelectModel: (model: AiModel) => void;
  configs: Record<AiModel, ModelConfig>;
  onUpdateConfig: (model: AiModel, config: ModelConfig) => void;
  language: Language;
}

const ModelIcon = ({ model }: { model: AiModel }) => {
  switch (model) {
    case 'gemini': return <Globe className="text-blue-400" size={32} />;
    case 'chatgpt5': return <Zap className="text-green-400" size={32} />;
    case 'grok': return <Terminal className="text-white" size={32} />;
    case 'claude4.5': return <Shield className="text-orange-400" size={32} />;
    case 'qwen3-plus': return <Server className="text-purple-400" size={32} />;
    case 'deepseek': return <Code2 className="text-cyan-400" size={32} />;
    case 'ollama': return <Cpu className="text-slate-400" size={32} />;
    default: return <Cpu size={32} />;
  }
};

const ModelSettings: React.FC<ModelSettingsProps> = ({ 
  currentModel, 
  onSelectModel, 
  configs, 
  onUpdateConfig, 
  language
}) => {
  const t = translations[language];
  const [showKey, setShowKey] = useState(false);
  const [editConfig, setEditConfig] = useState<ModelConfig>(configs[currentModel]);
  
  useEffect(() => {
    setEditConfig(configs[currentModel]);
  }, [currentModel, configs]);

  const models: AiModel[] = ['gemini', 'chatgpt5', 'grok', 'claude4.5', 'qwen3-plus', 'deepseek', 'ollama'];

  const getModelName = (model: AiModel) => {
    switch (model) {
      case 'gemini': return "Gemini 3 Flash";
      case 'chatgpt5': return "ChatGPT-5";
      case 'grok': return "Grok 3";
      case 'claude4.5': return "Claude 4.5";
      case 'qwen3-plus': return "Qwen 3-Plus";
      case 'deepseek': return "DeepSeek-V3";
      case 'ollama': return "Ollama";
      default: return model;
    }
  };

  const handleSave = () => {
    onUpdateConfig(currentModel, editConfig);
    alert("Configurations saved for " + getModelName(currentModel));
  };

  return (
    <div className="animate-fade-in pb-20">
      <div className="mb-8">
        <h1 className="text-4xl font-black text-white mb-2">{t.admin.engine}</h1>
        <p className="text-slate-400">{t.settings.subtitle}</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="lg:w-1/4 space-y-2">
           {models.map((model) => {
             const isActive = currentModel === model;
             return (
               <button 
                 key={model}
                 onClick={() => onSelectModel(model)}
                 className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${isActive ? 'bg-blue-600 text-white border-blue-500 shadow-xl' : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500'}`}
               >
                 <span className="font-bold text-sm">{getModelName(model)}</span>
                 {isActive && <Check size={16} />}
               </button>
             );
           })}
        </div>

        <div className="lg:w-3/4">
           <div className="bg-slate-800 border border-slate-700 rounded-3xl p-10">
             <div className="flex items-center gap-6 mb-10">
               <div className="p-5 bg-slate-900 rounded-2xl border border-slate-700"><ModelIcon model={currentModel} /></div>
               <div>
                 <h2 className="text-2xl font-black text-white">{getModelName(currentModel)}</h2>
                 <p className="text-slate-500 text-sm mt-1">{t.settings.descriptions[currentModel]}</p>
               </div>
             </div>

             <div className="space-y-8">
                {currentModel !== 'ollama' && (
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t.settings.fields.apiKey}</label>
                    <div className="relative">
                      <input 
                        type={showKey ? "text" : "password"}
                        value={editConfig.apiKey || ''}
                        onChange={(e) => setEditConfig({...editConfig, apiKey: e.target.value})}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none font-mono"
                        placeholder="sk-..."
                      />
                      <button onClick={() => setShowKey(!showKey)} className="absolute right-4 top-3.5 text-slate-500 hover:text-white transition-colors">
                        {showKey ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t.settings.fields.baseUrl}</label>
                    <input type="text" value={editConfig.baseUrl} onChange={e => setEditConfig({...editConfig, baseUrl: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white font-mono text-xs" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t.settings.fields.modelName}</label>
                    <input type="text" value={editConfig.modelName} onChange={e => setEditConfig({...editConfig, modelName: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white font-mono text-xs" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-10">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center"><label className="text-[10px] font-black text-slate-500 uppercase">{t.settings.fields.temperature}</label><span className="text-xs text-blue-400 font-mono">{editConfig.temperature}</span></div>
                    <input type="range" min="0" max="2" step="0.1" value={editConfig.temperature} onChange={e => setEditConfig({...editConfig, temperature: parseFloat(e.target.value)})} className="w-full h-1 bg-slate-700 appearance-none cursor-pointer accent-blue-500" />
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center"><label className="text-[10px] font-black text-slate-500 uppercase">{t.settings.fields.topP}</label><span className="text-xs text-blue-400 font-mono">{editConfig.topP}</span></div>
                    <input type="range" min="0" max="1" step="0.05" value={editConfig.topP} onChange={e => setEditConfig({...editConfig, topP: parseFloat(e.target.value)})} className="w-full h-1 bg-slate-700 appearance-none cursor-pointer accent-blue-500" />
                  </div>
                </div>

                <div className="pt-8 flex justify-end">
                  <button onClick={handleSave} className="bg-blue-600 hover:bg-blue-500 text-white px-10 py-3.5 rounded-2xl font-black shadow-xl shadow-blue-900/20 transition-all">
                    {t.settings.save}
                  </button>
                </div>
             </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default ModelSettings;
