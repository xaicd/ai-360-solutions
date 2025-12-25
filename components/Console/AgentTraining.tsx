
import React, { useState, useEffect, useRef } from 'react';
import { api } from '../../services/api';
import { DigitalAgent } from '../../types';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Terminal, Play, Settings as SettingsIcon, Database, Activity, Save, Cpu, Brain, ChevronRight } from 'lucide-react';

interface TrainingJob {
    id: string;
    status: string;
    config: any;
    logs: string;
    metrics: any;
    createdAt: string;
}

export const AgentTraining = ({ userId }: { userId: string }) => {
    const [agents, setAgents] = useState<DigitalAgent[]>([]);
    const [selectedAgent, setSelectedAgent] = useState<string>('');

    // Config Form
    const [config, setConfig] = useState({
        baseModel: 'meta-llama/Meta-Llama-3-8B',
        stage: 'sft',
        dataset: 'alpaca_en_demo',
        epochs: 5,
        learningRate: '2e-4',
        loraRank: 8,
        batchSize: 4
    });

    const [activeJob, setActiveJob] = useState<TrainingJob | null>(null);
    const [jobHistory, setJobHistory] = useState<TrainingJob[]>([]);
    const [logs, setLogs] = useState('');
    const [lossData, setLossData] = useState<any[]>([]);

    useEffect(() => {
        api.console.workforce(userId).then(res => {
            if (res.data) {
                setAgents(res.data);
                if (res.data.length > 0) setSelectedAgent(res.data[0].id);
            }
        });
    }, [userId]);

    useEffect(() => {
        if (!selectedAgent) return;
        loadJobs();
        const timer = setInterval(() => {
            if (activeJob && activeJob.status === 'RUNNING') refreshActiveJob();
        }, 1000);
        return () => clearInterval(timer);
    }, [selectedAgent, activeJob?.id]);

    const loadJobs = async () => {
        const res = await api.training.list(selectedAgent);
        if (res.success && res.data) {
            setJobHistory(res.data);
            // If running job exists, set as active
            const running = res.data.find((j: any) => j.status === 'RUNNING' || j.status === 'QUEUED');
            if (running) setActiveJob(running);
        }
    };

    const refreshActiveJob = async () => {
        if (!activeJob) return;
        const res = await api.training.get(activeJob.id);
        if (res.success && res.data) {
            setActiveJob(res.data);
            setLogs(res.data.logs || '');
            if (res.data.metrics) {
                const m = typeof res.data.metrics === 'string' ? JSON.parse(res.data.metrics) : res.data.metrics;
                setLossData(m.loss || []);
            }
        }
    };

    const startTraining = async () => {
        if (!selectedAgent) return;
        const res = await api.training.create({ agentId: selectedAgent, config });
        if (res.success) {
            setActiveJob(res.data);
            setLogs('[System] Job Submitted...\n');
            setLossData([]);
            loadJobs();
        } else {
            alert('Failed to start: ' + res.error);
        }
    };

    const logRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
    }, [logs]);

    return (
        <div className="flex h-[calc(100vh-100px)] gap-6 animate-fade-in">
            {/* Sidebar Config */}
            <div className="w-80 flex flex-col gap-6 overflow-y-auto pr-2">
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
                    <h3 className="text-white font-bold mb-4 flex items-center gap-2"><Brain className="text-purple-500" size={18} /> Model Selection</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Target Agent</label>
                            <select value={selectedAgent} onChange={e => setSelectedAgent(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-sm text-white outline-none focus:border-purple-500">
                                {agents.map(a => <option key={a.id} value={a.id}>{a.name} ({a.role})</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Base Model</label>
                            <select value={config.baseModel} onChange={e => setConfig({ ...config, baseModel: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-sm text-white outline-none focus:border-purple-500">
                                <option value="meta-llama/Meta-Llama-3-8B">Llama-3-8B</option>
                                <option value="meta-llama/Llama-2-7b-hf">Llama-2-7b</option>
                                <option value="Qwen/Qwen1.5-14B">Qwen1.5-14B</option>
                                <option value="mistralai/Mistral-7B-v0.1">Mistral-7B</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Training Stage</label>
                            <div className="flex bg-slate-950 rounded p-1 border border-slate-800">
                                {['sft', 'pt', 'dpo'].map(s => (
                                    <button key={s} onClick={() => setConfig({ ...config, stage: s })} className={`flex-1 py-1 text-xs font-bold uppercase rounded transition-colors ${config.stage === s ? 'bg-slate-800 text-purple-400' : 'text-slate-500 hover:text-slate-300'}`}>
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
                    <h3 className="text-white font-bold mb-4 flex items-center gap-2"><SettingsIcon className="text-blue-500" size={18} /> Hyperparameters</h3>
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Epochs</label>
                                <input type="number" value={config.epochs} onChange={e => setConfig({ ...config, epochs: parseInt(e.target.value) })} className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-sm text-white outline-none focus:border-blue-500" />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Batch Size</label>
                                <input type="number" value={config.batchSize} onChange={e => setConfig({ ...config, batchSize: parseInt(e.target.value) })} className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-sm text-white outline-none focus:border-blue-500" />
                            </div>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Learning Rate</label>
                            <input value={config.learningRate} onChange={e => setConfig({ ...config, learningRate: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-sm text-white outline-none focus:border-blue-500" />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase block mb-1">LoRA Rank</label>
                            <input type="range" min="4" max="128" step="4" value={config.loraRank} onChange={e => setConfig({ ...config, loraRank: parseInt(e.target.value) })} className="w-full" />
                            <div className="text-right text-xs text-slate-400 font-mono">{config.loraRank}</div>
                        </div>
                    </div>
                </div>

                <button
                    onClick={startTraining}
                    disabled={activeJob?.status === 'RUNNING'}
                    className="w-full py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black rounded-xl transition-all shadow-lg shadow-purple-900/20 flex justify-center items-center gap-2 text-lg"
                >
                    {activeJob?.status === 'RUNNING' ? <Activity className="animate-spin" /> : <Play fill="currentColor" />}
                    START TRAINING
                </button>
            </div>

            {/* Main Visualizer */}
            <div className="flex-1 flex flex-col gap-6 min-w-0">
                {/* Charts */}
                <div className="flex-[2] bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg relative min-h-[300px]">
                    <h3 className="absolute top-6 left-6 text-white font-bold flex items-center gap-2 z-10">
                        <Activity className="text-emerald-500" size={18} /> Training Metrics
                        {activeJob && <span className="ml-2 px-2 py-0.5 bg-slate-800 text-xs text-slate-400 rounded font-mono">Job: {activeJob.id.substring(0, 8)}</span>}
                    </h3>

                    {lossData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={lossData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                                <XAxis dataKey="step" stroke="#475569" tick={{ fontSize: 10 }} label={{ value: 'Steps', position: 'insideBottom', offset: -5 }} />
                                <YAxis stroke="#475569" tick={{ fontSize: 10 }} domain={[0, 'auto']} label={{ value: 'Loss', angle: -90, position: 'insideLeft' }} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#fff' }}
                                    itemStyle={{ color: '#ec4899' }}
                                />
                                <Line type="monotone" dataKey="value" stroke="#ec4899" strokeWidth={2} dot={false} activeDot={{ r: 4 }} animationDuration={300} />
                            </LineChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-full flex items-center justify-center text-slate-600 font-medium">
                            Ready to visualize training metrics
                        </div>
                    )}
                </div>

                {/* Logs */}
                <div className="flex-1 bg-black rounded-xl border border-slate-800 p-4 font-mono text-xs overflow-hidden flex flex-col shadow-inner">
                    <div className="flex justify-between items-center mb-2 text-slate-500 border-b border-slate-900 pb-2">
                        <span className="flex items-center gap-2"><Terminal size={14} /> System Output</span>
                        <span className={`${activeJob?.status === 'RUNNING' ? 'text-emerald-500 animate-pulse' : 'text-slate-600'}`}>● LIVE</span>
                    </div>
                    <div ref={logRef} className="flex-1 overflow-y-auto whitespace-pre-wrap text-slate-300 leading-relaxed p-1">
                        {logs || "// No logs available."}
                    </div>
                </div>
            </div>

            {/* History Sidebar (Optional, maybe collapsible) */}
            <div className="w-64 bg-slate-900 border-l border-slate-800 p-4 overflow-y-auto hidden 2xl:block">
                <h3 className="text-slate-400 text-xs font-bold uppercase mb-4 flex items-center gap-2"><Database size={14} /> History</h3>
                <div className="space-y-2">
                    {jobHistory.map(job => (
                        <div
                            key={job.id}
                            onClick={() => { setActiveJob(job); setLogs(job.logs || ''); }}
                            className={`p-3 rounded-lg border cursor-pointer transition-all ${activeJob?.id === job.id ? 'bg-slate-800 border-blue-500/50' : 'bg-slate-950 border-slate-800 hover:border-slate-700'}`}
                        >
                            <div className="flex justify-between items-center mb-1">
                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${job.status === 'COMPLETED' ? 'bg-emerald-500/20 text-emerald-500' : job.status === 'RUNNING' ? 'bg-blue-500/20 text-blue-500' : 'bg-slate-800 text-slate-500'}`}>{job.status}</span>
                                <span className="text-[10px] text-slate-600">{new Date(job.createdAt).toLocaleDateString()}</span>
                            </div>
                            <div className="text-xs font-mono text-slate-300 truncate">Job-{job.id.substring(0, 6)}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
