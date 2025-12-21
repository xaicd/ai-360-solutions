
import React, { useState } from 'react';
import Header from './components/Header';
import SolutionDetail from './components/SolutionDetail';
import AdminLogin from './components/Admin/AdminLogin';
import AdminPortal from './components/Admin/AdminPortal';
import Console from './components/Console/Console';
import ConsumerLogin from './components/ConsumerLogin';
import { searchSolutions, enrichSolutionDetails } from './services/geminiService';
import { Solution, EnrichedSolution, ViewState, Language, AiModel, ModelConfig, AdminUser } from './types';
import { translations } from './translations';
import { Search, Loader2, Sparkles, Database, Star, ArrowRight, ShieldCheck } from 'lucide-react';

const defaultConfigs: Record<AiModel, ModelConfig> = {
  gemini: { apiKey: '', baseUrl: 'https://generativelanguage.googleapis.com', modelName: 'gemini-3-flash-preview', temperature: 0.7, topP: 0.95, maxTokens: 8192 },
  chatgpt5: { apiKey: '', baseUrl: 'https://api.openai.com/v1', modelName: 'gpt-5-preview', temperature: 1.0, topP: 1.0, maxTokens: 4096 },
  grok: { apiKey: '', baseUrl: 'https://api.x.ai/v1', modelName: 'grok-3', temperature: 0.8, topP: 0.9, maxTokens: 8192 },
  'claude4.5': { apiKey: '', baseUrl: 'https://api.anthropic.com/v1', modelName: 'claude-3-opus', temperature: 0.5, topP: 0.9, maxTokens: 4096 },
  'qwen3-plus': { apiKey: '', baseUrl: 'https://dashscope.aliyuncs.com/api/v1', modelName: 'qwen-max', temperature: 0.7, topP: 0.8, maxTokens: 8000 },
  deepseek: { apiKey: '', baseUrl: 'https://api.deepseek.com', modelName: 'deepseek-coder', temperature: 0.0, topP: 1.0, maxTokens: 8192 },
  ollama: { apiKey: 'not-needed', baseUrl: 'http://localhost:11434', modelName: 'llama3', temperature: 0.7, topP: 0.9, maxTokens: 4096 }
};

function App() {
  const [view, setView] = useState<ViewState>(ViewState.HOME);
  const [language, setLanguage] = useState<Language>('zh');
  const [aiModel, setAiModel] = useState<AiModel>('gemini');
  const [modelConfigs, setModelConfigs] = useState<Record<AiModel, ModelConfig>>(defaultConfigs);
  const [query, setQuery] = useState('');
  const [solutions, setSolutions] = useState<Solution[]>([]);
  const [selectedSolution, setSelectedSolution] = useState<EnrichedSolution | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isEnriching, setIsEnriching] = useState(false);
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [consumerUser, setConsumerUser] = useState<AdminUser | null>(null);

  const t = translations[language];

  const handleUpdateConfig = (model: AiModel, config: ModelConfig) => {
    setModelConfigs(prev => ({ ...prev, [model]: config }));
  };

  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    setQuery(searchQuery);
    setSolutions([]);
    setView(ViewState.RESULTS);
    const results = await searchSolutions(searchQuery, language, aiModel);
    setSolutions(results);
    setIsSearching(false);
  };

  const handleSolutionClick = async (solution: Solution) => {
    setIsEnriching(true);
    try {
      const enriched = await enrichSolutionDetails(solution, language, aiModel);
      setSelectedSolution(enriched);
      setView(ViewState.DETAIL);
    } catch (e) {
      alert("Search enrichment failed.");
    } finally { setIsEnriching(false); }
  };

  const handleGoHome = () => {
    setView(ViewState.HOME);
    setSelectedSolution(null);
  };

  const renderContent = () => {
    switch (view) {
      case ViewState.ADMIN_LOGIN:
        return <AdminLogin language={language} onLogin={(u) => { setAdminUser(u); setView(ViewState.ADMIN_PORTAL); }} onBack={handleGoHome} />;

      case ViewState.ADMIN_PORTAL:
        if (!adminUser) return <AdminLogin language={language} onLogin={(u) => { setAdminUser(u); setView(ViewState.ADMIN_PORTAL); }} onBack={handleGoHome} />;
        return (
          <AdminPortal
            user={adminUser} language={language} onLogout={() => { setAdminUser(null); setView(ViewState.HOME); }}
            aiModel={aiModel} setAiModel={setAiModel} modelConfigs={modelConfigs} onUpdateConfig={handleUpdateConfig}
          />
        );

      case ViewState.CONSUMER_LOGIN:
        return <ConsumerLogin language={language} onLogin={(u) => { setConsumerUser(u); setView(ViewState.CONSOLE); }} onBack={handleGoHome} />;

      case ViewState.CONSOLE:
        if (!consumerUser) return <ConsumerLogin language={language} onLogin={(u) => { setConsumerUser(u); setView(ViewState.CONSOLE); }} onBack={handleGoHome} />;
        return <Console user={consumerUser} language={language} onLogout={() => { setConsumerUser(null); setView(ViewState.HOME); }} />;

      case ViewState.DETAIL:
        return selectedSolution ? (
          <SolutionDetail
            solution={selectedSolution}
            user={consumerUser}
            onBack={() => setView(ViewState.RESULTS)}
            onGoHome={handleGoHome}
            onGoConsole={() => setView(ViewState.CONSOLE)}
            language={language}
          />
        ) : null;

      case ViewState.RESULTS:
        return (
          <div className="container mx-auto px-4 py-8 animate-fade-in">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-white"><span className="text-blue-400">{query}</span></h2>
              <span className="text-slate-500 text-sm font-bold">{solutions.length} {t.results.found}</span>
            </div>
            {isSearching ? (
              <div className="flex flex-col items-center justify-center py-20"><Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-4" /><p className="text-slate-400">{t.home.architectLoading}</p></div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {solutions.map((solution) => (
                  <div key={solution.id} onClick={() => handleSolutionClick(solution)} className={`group bg-slate-800 rounded-3xl border ${solution.id === 'SOL-AI-STUDIO-ENT' ? 'border-yellow-500/50 shadow-yellow-500/20 shadow-2xl relative overflow-hidden ring-1 ring-yellow-500/20' : 'border-slate-700 hover:border-blue-500 shadow-xl'} p-8 cursor-pointer transition-all hover:-translate-y-1`}>
                    {solution.id === 'SOL-AI-STUDIO-ENT' && (
                      <div className="absolute top-0 right-0 bg-gradient-to-l from-yellow-500 to-amber-600 text-black text-[10px] font-black px-4 py-1.5 rounded-bl-2xl uppercase tracking-[0.2em] shadow-lg">Flagship</div>
                    )}
                    <div className="flex justify-between items-start mb-6">
                      <div className={`p-3 rounded-2xl border ${solution.id === 'SOL-AI-STUDIO-ENT' ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-500' : 'bg-slate-900 border-slate-700 text-blue-400'}`}>
                        {solution.id === 'SOL-AI-STUDIO-ENT' ? <Sparkles className="w-6 h-6" /> : <Database className="w-6 h-6" />}
                      </div>
                      <div className="flex items-center gap-1 text-yellow-500 text-sm font-black bg-yellow-500/10 px-3 py-1 rounded-full"><Star size={14} fill="currentColor" />{solution.starsFormatted || solution.stars}</div>
                    </div>
                    <h3 className={`text-xl font-black mb-2 line-clamp-1 ${solution.id === 'SOL-AI-STUDIO-ENT' ? 'text-yellow-100' : 'text-white'}`}>{solution.title}</h3>
                    <p className="text-slate-400 text-sm mb-6 line-clamp-2">{solution.description}</p>
                    <div className="flex items-center justify-between pt-6 border-t border-slate-700">
                      <div className={`text-xl font-black font-mono ${solution.id === 'SOL-AI-STUDIO-ENT' ? 'text-yellow-400' : 'text-yellow-500'}`}>
                        {solution.currency === 'USDT' ? '₮' : '¥'}{solution.price?.toLocaleString()}
                      </div>
                      <button className="text-blue-400 text-xs font-black uppercase tracking-widest flex items-center gap-2 group-hover:gap-4 transition-all">{t.results.details} <ArrowRight size={14} /></button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case ViewState.HOME:
      default:
        return (
          <div className="max-w-4xl mx-auto flex flex-col items-center justify-center pt-24 pb-12 animate-fade-in container px-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-widest mb-10"><Sparkles size={14} /><span>{t.home.tagline}</span></div>
            <h1 className="text-6xl md:text-8xl font-black text-center text-white mb-6 leading-none tracking-tighter">{t.title}<br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">{t.subtitle}</span></h1>
            <p className="text-xl text-slate-400 text-center mb-16 max-w-2xl leading-relaxed">{t.home.description}</p>
            <div className="w-full max-w-2xl relative mb-16 group">
              <div className="absolute inset-0 bg-blue-600 rounded-3xl blur-3xl opacity-10 group-hover:opacity-20 transition-opacity"></div>
              <div className="relative flex items-center bg-slate-800 rounded-3xl border border-slate-700 p-2 shadow-2xl">
                <Search className="ml-5 text-slate-500 w-6 h-6" />
                <input type="text" placeholder={t.home.searchPlaceholder} className="w-full bg-transparent border-none focus:ring-0 text-white text-lg px-4 py-4 placeholder:text-slate-600" onKeyDown={(e) => e.key === 'Enter' && handleSearch(e.currentTarget.value)} />
                <button onClick={() => handleSearch((document.querySelector('input') as HTMLInputElement).value)} className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-2xl font-black transition-all shrink-0 shadow-lg shadow-blue-900/40">{t.home.searchButton}</button>
              </div>
            </div>
            <div className="w-full"><p className="text-center text-slate-600 text-[10px] font-black uppercase tracking-[0.3em] mb-6">{t.home.popular}</p><div className="flex flex-wrap justify-center gap-3">{t.industries.map((ind) => (<button key={ind} onClick={() => handleSearch(ind)} className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-slate-300 font-bold text-xs transition-all hover:scale-105">{ind}</button>))}</div></div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 font-sans selection:bg-blue-500/30">
      {view !== ViewState.ADMIN_PORTAL && view !== ViewState.CONSOLE && (
        <Header
          onGoHome={handleGoHome}
          onAdmin={() => setView(ViewState.ADMIN_LOGIN)}
          onConsole={() => setView(ViewState.CONSUMER_LOGIN)}
          language={language}
          setLanguage={setLanguage}
        />
      )}
      <main>
        {isEnriching && (
          <div className="fixed inset-0 z-[200] bg-slate-900/90 backdrop-blur-sm flex flex-col items-center justify-center">
            <Loader2 className="w-16 h-16 text-blue-500 animate-spin mb-8" />
            <h2 className="text-2xl font-black text-white mt-4 animate-pulse uppercase tracking-tighter">{t.detail.loading}</h2>
            <p className="text-slate-500 text-sm mt-2">{t.detail.loadingSub}</p>
          </div>
        )}
        {renderContent()}
      </main>
    </div>
  );
}

export default App;
