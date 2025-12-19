
import React, { useState, useEffect } from 'react';
import { EnrichedSolution, Language, DeploymentMode } from '../types';
import { translations } from '../translations';
import DigitalTeam from './DigitalTeam';
import ExecutionPlan from './ExecutionPlan';
import PaymentGateway from './PaymentGateway';
import {
  CheckCircle2, Cpu, Lock, Shield, Server, Zap, Loader2,
  DollarSign, ShoppingCart, Target, PackageCheck, Briefcase,
  Terminal, Globe, HardDrive, Download, Key, Bitcoin
} from 'lucide-react';

interface SolutionDetailProps {
  solution: EnrichedSolution;
  onBack: () => void;
  language: Language;
}

const SolutionDetail: React.FC<SolutionDetailProps> = ({ solution, onBack, language }) => {
  const t = translations[language];
  const [activeTier, setActiveTier] = useState<keyof NonNullable<EnrichedSolution['executionPlan']>>('poc');
  const [deployMode, setDeployMode] = useState<DeploymentMode>('CLOUD');
  const [showPayment, setShowPayment] = useState(false);
  const [isLicensed, setIsLicensed] = useState(false);
  const [deployStatus, setDeployStatus] = useState<'idle' | 'tunneling' | 'decrypting' | 'installing' | 'success'>('idle');
  const [agentToken, setAgentToken] = useState('AGENT-360-' + Math.random().toString(36).substr(2, 6).toUpperCase());

  const currentPrice = (solution.price || 9999) * (activeTier === 'production' ? 5 : (activeTier === 'saas' ? 2 : 1));
  const usdtPrice = (currentPrice / 7.23).toFixed(0);

  const handleExecute = () => {
    if (deployMode === 'EDGE_PRIVATE') {
      setDeployStatus('tunneling');
      setTimeout(() => setDeployStatus('decrypting'), 2000);
      setTimeout(() => setDeployStatus('installing'), 4000);
      setTimeout(() => setDeployStatus('success'), 7000);
    } else {
      setDeployStatus('installing');
      setTimeout(() => setDeployStatus('success'), 3000);
    }
  };

  return (
    <div className="animate-fade-in pb-20 max-w-7xl mx-auto px-4">
      {showPayment && (
        <PaymentGateway
          price={currentPrice}
          currency={solution.currency || 'CNY'}
          language={language}
          onClose={() => setShowPayment(false)}
          onSuccess={() => { setShowPayment(false); setIsLicensed(true); }}
        />
      )}

      {/* Deployment Progress Modal */}
      {deployStatus !== 'idle' && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md"></div>
          <div className="relative bg-slate-900 border border-slate-700 w-full max-w-lg rounded-3xl p-8 shadow-2xl">
            <div className="flex flex-col items-center text-center">
              {deployStatus === 'success' ? (
                <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mb-6">
                  <CheckCircle2 size={48} className="text-green-500" />
                </div>
              ) : (
                <div className="relative mb-8">
                  <Loader2 className="w-20 h-20 text-blue-500 animate-spin" />
                  <Shield className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-blue-300" size={24} />
                </div>
              )}

              <h3 className="text-2xl font-bold text-white mb-2">
                {deployStatus === 'tunneling' && t.deployment.tunneling}
                {deployStatus === 'decrypting' && t.deployment.encrypting}
                {deployStatus === 'installing' && t.deployment.installing}
                {deployStatus === 'success' && "Deployment Complete"}
              </h3>
              <p className="text-slate-400 text-sm mb-8">
                {deployStatus === 'tunneling' && "Establishing Secure Reverse Tunnel to Edge Node..."}
                {deployStatus === 'decrypting' && "Decrypting SM4/AES-256 Offline Installation Package..."}
                {deployStatus === 'installing' && "Automating local environment configuration..."}
                {deployStatus === 'success' && "Your solution is now live and secured behind reverse penetration tunnel."}
              </p>

              <div className="w-full bg-slate-950 rounded-xl p-4 font-mono text-[10px] text-slate-500 text-left border border-slate-800">
                <div className="flex justify-between border-b border-slate-900 pb-2 mb-2">
                  <span>NODE_STATUS:</span>
                  <span className="text-emerald-500 font-bold">{deployStatus === 'success' ? 'READY' : 'PROVISIONING'}</span>
                </div>
                <div>TUNNEL_ID: 360-R-TUNNEL-X92</div>
                <div>CRYPT_SIG: SM4-92A-SECURE</div>
              </div>

              {deployStatus === 'success' && (
                <button onClick={() => setDeployStatus('idle')} className="mt-8 w-full bg-blue-600 py-3 rounded-xl font-bold text-white">Go to Dashboard</button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="py-6 flex items-center justify-between">
        <button onClick={onBack} className="text-slate-400 hover:text-white flex items-center gap-2 text-sm transition-colors">
          ← {t.detail.back}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 mb-12">
        <div className="lg:col-span-7">
          <div className="flex items-center gap-2 mb-4">
            <span className="px-2 py-0.5 bg-yellow-500 text-slate-900 text-[10px] font-black uppercase rounded">{t.mall.bestSeller}</span>
            <span className="px-2 py-0.5 border border-slate-700 text-slate-400 text-[10px] uppercase rounded">{solution.industry}</span>
          </div>
          <h1 className="text-4xl font-black text-white mb-6 leading-tight">{solution.title}</h1>

          {/* Markdown Content Renderer */}
          <div className="prose prose-invert max-w-none mb-12">
            {solution.fullOverview.split('\n').map((line, i) => {
              if (line.startsWith('# ')) return <h1 key={i} className="text-3xl font-black text-white mt-8 mb-4">{line.replace('# ', '')}</h1>;
              if (line.startsWith('## ')) return <h2 key={i} className="text-2xl font-bold text-white mt-6 mb-3 flex items-center gap-2"><div className="w-1 h-6 bg-blue-500 rounded-full"></div>{line.replace('## ', '')}</h2>;
              if (line.startsWith('### ')) return <h3 key={i} className="text-xl font-bold text-blue-400 mt-4 mb-2">{line.replace('### ', '')}</h3>;
              if (line.startsWith('- ')) return <li key={i} className="ml-4 text-slate-300 mb-1 marker:text-blue-500 list-disc">{line.replace('- ', '')}</li>;
              if (line.trim() === '') return <br key={i} />;
              return <p key={i} className="text-slate-300 leading-relaxed mb-2">{line}</p>;
            })}
          </div>

          {/* Special Architecture Visualizer for AI Studio */}
          {solution.id === 'SOL-AI-STUDIO-ENT' && (
            <div className="mb-12 p-6 bg-slate-900 rounded-3xl border border-slate-700 relative overflow-hidden group">
              <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
              <div className="relative z-10">
                <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest mb-8 flex items-center gap-2">
                  <Server size={14} /> System Topology
                </h3>

                <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-mono">
                  {/* Client */}
                  <div className="p-4 bg-slate-800 border border-slate-600 rounded-xl text-center w-full md:w-32 hover:border-blue-400 transition-colors">
                    <div className="text-blue-400 font-bold mb-2">Browser</div>
                    <div className="text-slate-500">gRPC-Web</div>
                  </div>

                  {/* Tunnel */}
                  <div className="flex-1 w-full flex items-center justify-center relative">
                    <div className="h-0.5 w-full bg-slate-700 absolute"></div>
                    <div className="px-3 py-1 bg-slate-950 border border-slate-700 rounded-full text-[10px] text-yellow-500 relative z-10 font-black animate-pulse">
                      ProxyUnaryCall
                    </div>
                  </div>

                  {/* Gateway */}
                  <div className="p-4 bg-slate-800 border border-yellow-500/30 rounded-xl text-center w-full md:w-32 shadow-[0_0_15px_rgba(234,179,8,0.1)]">
                    <div className="text-yellow-500 font-bold mb-2">Gateway</div>
                    <div className="text-slate-500">Unpack</div>
                  </div>

                  {/* Tunnel */}
                  <div className="flex-1 w-full flex items-center justify-center relative">
                    <div className="h-0.5 w-full bg-slate-700 absolute"></div>
                    <div className="px-3 py-1 bg-slate-950 border border-slate-700 rounded-full text-[10px] text-emerald-500 relative z-10">
                      gRPC/Internal
                    </div>
                  </div>

                  {/* Services */}
                  <div className="flex flex-col gap-2 w-full md:w-32">
                    <div className="p-3 bg-emerald-900/20 border border-emerald-500/30 rounded-lg text-emerald-400 text-center">
                      Sandbox
                    </div>
                    <div className="p-3 bg-purple-900/20 border border-purple-500/30 rounded-lg text-purple-400 text-center">
                      LLM Core
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="mb-8">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Target size={16} className="text-blue-400" /> {t.mall.scenarios}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {(solution.scenarios || []).map((s, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg border border-slate-700/50">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                  <span className="text-sm text-slate-300">{s}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-5">
          <div className="bg-slate-800 rounded-3xl border border-slate-700 shadow-2xl p-8 sticky top-24">
            <div className="mb-8">
              <div className="flex flex-col gap-1">
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-black text-white font-mono">¥{currentPrice.toLocaleString()}</span>
                  <span className="text-slate-500 text-sm">/ License</span>
                </div>
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                  <Bitcoin size={14} />
                  <span>{usdtPrice} USDT / USDC</span>
                </div>
              </div>
            </div>

            <div className="space-y-4 mb-8">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest">{t.deployment.mode}</label>
              <div className="flex gap-2 p-1 bg-slate-900 rounded-xl border border-slate-700">
                <button
                  onClick={() => setDeployMode('CLOUD')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold transition-all ${deployMode === 'CLOUD' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  <Globe size={14} /> {t.deployment.cloud}
                </button>
                <button
                  onClick={() => setDeployMode('EDGE_PRIVATE')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold transition-all ${deployMode === 'EDGE_PRIVATE' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  <HardDrive size={14} /> {t.deployment.edge}
                </button>
              </div>

              {deployMode === 'EDGE_PRIVATE' && (
                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3 animate-fade-in">
                  <div className="flex justify-between items-center">
                    <p className="text-[10px] text-slate-500 uppercase font-black">{t.deployment.agentRegister}</p>
                    <Shield size={10} className="text-blue-400" />
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-blue-400 flex items-center gap-2">
                      <Key size={12} /> {agentToken}
                    </div>
                    <button onClick={() => alert("Token Copied")} className="bg-slate-800 p-2 rounded-lg text-slate-400 hover:text-white"><Terminal size={14} /></button>
                  </div>
                  <p className="text-[9px] text-slate-600 italic leading-tight">
                    * Agent established encrypted SM4 reverse tunnel. Install agent on edge server.
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-3 mb-8">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest">{t.mall.specifications}</label>
              {['poc', 'production', 'saas'].map((spec) => (
                <button
                  key={spec}
                  onClick={() => setActiveTier(spec as any)}
                  className={`w-full text-left p-4 rounded-xl border transition-all flex justify-between items-center ${activeTier === spec ? 'bg-blue-600/10 border-blue-500 shadow-lg' : 'bg-slate-900 border-slate-700 hover:border-slate-600'}`}
                >
                  <div className="text-sm font-bold text-slate-300 capitalize">{spec.toUpperCase()} Tier</div>
                  {activeTier === spec && <CheckCircle2 className="text-blue-500" size={18} />}
                </button>
              ))}
            </div>

            <div className="space-y-3">
              {isLicensed ? (
                <button
                  onClick={handleExecute}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-4 rounded-2xl font-black text-lg shadow-xl shadow-emerald-900/20 transition-all flex items-center justify-center gap-3"
                >
                  <Zap /> {t.detail.deploy}
                </button>
              ) : (
                <button
                  onClick={() => setShowPayment(true)}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-2xl font-black text-lg shadow-xl shadow-blue-900/20 transition-all flex items-center justify-center gap-3"
                >
                  <ShoppingCart /> {t.mall.buyNow}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="mb-12">
        <ExecutionPlan plan={solution.executionPlan!} language={language} selectedTier={activeTier} />
      </div>
      <div className="mb-12">
        <DigitalTeam agents={solution.digitalTeam} language={language} />
      </div>
    </div>
  );
};

export default SolutionDetail;
