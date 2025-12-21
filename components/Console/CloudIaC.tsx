
import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { CloudProvider } from '../../types';
import { Server, Key, Terminal, Play, Save, CheckCircle2, AlertCircle, RefreshCw, Layers } from 'lucide-react';

export const CloudIaC = ({ userId }: { userId: string }) => {
    const [activeTab, setActiveTab] = useState<'creds' | 'provision'>('provision');
    const [providers, setProviders] = useState<CloudProvider[]>([]);

    // Provisioning State
    const [selectedProvider, setSelectedProvider] = useState('');
    const [resourceType, setResourceType] = useState('ec2');
    const [config, setConfig] = useState({
        name: 'my-app-server',
        region: 'us-east-1',
        instanceType: 't2.micro',
        ami: 'ami-0c55b159cbfafe1f0' // Standard AWS Linux 2
    });

    const [logs, setLogs] = useState('');
    const [resourceId, setResourceId] = useState<string | null>(null);
    const [status, setStatus] = useState<'idle' | 'planning' | 'planned' | 'applying' | 'done' | 'error'>('idle');

    useEffect(() => {
        loadProviders();
    }, []);

    const loadProviders = () => {
        api.cloud.listProviders().then(res => {
            if (res.success && res.data) setProviders(res.data);
        });
    };

    const handleAddProvider = async (e: React.FormEvent) => {
        e.preventDefault();
        const form = e.target as HTMLFormElement;
        const data = {
            name: (form.elements.namedItem('name') as HTMLInputElement).value,
            type: (form.elements.namedItem('type') as HTMLSelectElement).value,
            credentials: {
                accessKey: (form.elements.namedItem('accessKey') as HTMLInputElement).value,
                secretKey: (form.elements.namedItem('secretKey') as HTMLInputElement).value,
            }
        };
        await api.cloud.addProvider(data);
        loadProviders();
        form.reset();
        alert("Provider added!");
    };

    const handlePlan = async () => {
        if (!selectedProvider) return alert("Select a provider first");

        setStatus('planning');
        setLogs("Initializing Terraform workspace...\n> terraform init");

        const res = await api.cloud.plan({
            providerId: selectedProvider,
            resourceType,
            config,
            userId
        });

        if (res.success) {
            setResourceId(res.resourceId || null);
            setLogs(prev => prev + "\n" + (res.logs || "Plan successful."));
            setStatus('planned');
        } else {
            setLogs(prev => prev + "\nError: " + res.error);
            setStatus('error');
        }
    };

    const handleApply = async () => {
        if (!resourceId) return;
        setStatus('applying');
        setLogs(prev => prev + "\n\n> terraform apply -auto-approve");

        const res = await api.cloud.apply({ resourceId });

        if (res.success) {
            setLogs(prev => prev + "\n\n" + (res.logs || "Apply successful."));
            if (res.outputs) {
                setLogs(prev => prev + "\n\nOutputs:\n" + JSON.stringify(res.outputs, null, 2));
            }
            setStatus('done');
        } else {
            setLogs(prev => prev + "\nError: " + res.error);
            setStatus('error');
        }
    };

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg animate-fade-in">
            {/* Header / Tabs */}
            <div className="flex border-b border-slate-800 bg-slate-950/50">
                <button
                    onClick={() => setActiveTab('provision')}
                    className={`flex items-center gap-2 px-6 py-4 text-sm font-bold border-r border-slate-800 transition-colors ${activeTab === 'provision' ? 'bg-slate-900 text-blue-400' : 'text-slate-500 hover:text-white'}`}
                >
                    <Layers size={16} /> Provisioner
                </button>
                <button
                    onClick={() => setActiveTab('creds')}
                    className={`flex items-center gap-2 px-6 py-4 text-sm font-bold border-r border-slate-800 transition-colors ${activeTab === 'creds' ? 'bg-slate-900 text-purple-400' : 'text-slate-500 hover:text-white'}`}
                >
                    <Key size={16} /> Credentials
                </button>
            </div>

            <div className="p-6">
                {activeTab === 'creds' ? (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* List */}
                            <div className="space-y-3">
                                <h3 className="text-white font-bold flex items-center gap-2"><Server size={16} /> Linked Providers</h3>
                                {providers.length === 0 && <p className="text-slate-500 text-sm">No providers linked.</p>}
                                {providers.map(p => (
                                    <div key={p.id} className="p-4 bg-slate-950 border border-slate-800 rounded-lg flex justify-between items-center">
                                        <div>
                                            <div className="font-bold text-white">{p.name}</div>
                                            <div className="text-xs text-slate-500 font-mono mt-1">{p.type} • {p.status}</div>
                                        </div>
                                        <div className="px-2 py-1 bg-slate-900 rounded text-xs text-slate-600 font-mono">
                                            {p.credentials ? '***' : 'No Creds'}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Add Form */}
                            <form onSubmit={handleAddProvider} className="space-y-4 bg-slate-950 p-6 rounded-xl border border-slate-800">
                                <h3 className="text-white font-bold mb-4">Link New Provider</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <input name="name" placeholder="Friendly Name (e.g. My AWS)" className="bg-slate-900 border border-slate-800 rounded p-2 text-sm text-white outline-none focus:border-purple-500" required />
                                    <select name="type" className="bg-slate-900 border border-slate-800 rounded p-2 text-sm text-white outline-none focus:border-purple-500">
                                        <option value="AWS">AWS</option>
                                        <option value="ALIYUN">Aliyun</option>
                                        <option value="VMWARE">VMware</option>
                                    </select>
                                </div>
                                <input name="accessKey" placeholder="Access Key ID" className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-sm text-white outline-none focus:border-purple-500" required />
                                <input name="secretKey" type="password" placeholder="Secret Access Key" className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-sm text-white outline-none focus:border-purple-500" required />
                                <button type="submit" className="w-full py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded transition-colors flex justify-center items-center gap-2">
                                    <Save size={16} /> Save Credentials
                                </button>
                            </form>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[600px]">
                        {/* Config Panel */}
                        <div className="col-span-1 space-y-6 overflow-y-auto pr-2">
                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Target Provider</label>
                                    <select
                                        value={selectedProvider}
                                        onChange={e => setSelectedProvider(e.target.value)}
                                        className="w-full bg-slate-950 border border-slate-800 rounded p-2.5 text-sm text-white outline-none focus:border-blue-500"
                                    >
                                        <option value="">Select Provider</option>
                                        {providers.map(p => <option key={p.id} value={p.id}>{p.name} ({p.type})</option>)}
                                    </select>
                                    {providers.length === 0 && <div className="text-xs text-red-400 mt-1">Please add credentials in "Credentials" tab first.</div>}
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Resource</label>
                                        <select value={resourceType} onChange={e => setResourceType(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded p-2.5 text-sm text-white outline-none focus:border-blue-500">
                                            <option value="ec2">EC2 Instance</option>
                                            <option value="rds">RDS Database</option>
                                            <option value="s3">S3 Bucket</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Region</label>
                                        <input value={config.region} onChange={e => setConfig({ ...config, region: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded p-2.5 text-sm text-white outline-none focus:border-blue-500" />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Instance Name</label>
                                    <input value={config.name} onChange={e => setConfig({ ...config, name: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded p-2.5 text-sm text-white outline-none focus:border-blue-500" />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Instance Type</label>
                                        <input value={config.instanceType} onChange={e => setConfig({ ...config, instanceType: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded p-2.5 text-sm text-white outline-none focus:border-blue-500" />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase block mb-1">AMI ID</label>
                                        <input value={config.ami} onChange={e => setConfig({ ...config, ami: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded p-2.5 text-sm text-white outline-none focus:border-blue-500" />
                                    </div>
                                </div>
                            </div>

                            <div className="pt-6 border-t border-slate-800 flex flex-col gap-3">
                                <button
                                    onClick={handlePlan}
                                    disabled={!selectedProvider || status === 'planning' || status === 'applying'}
                                    className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-lg transition-colors flex justify-center items-center gap-2 shadow-lg shadow-blue-900/20"
                                >
                                    {status === 'planning' ? <RefreshCw className="animate-spin" size={18} /> : <Terminal size={18} />}
                                    Generate Plan
                                </button>

                                {status === 'planned' && (
                                    <button
                                        onClick={handleApply}
                                        className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg transition-colors flex justify-center items-center gap-2 shadow-lg shadow-emerald-900/20 animate-in slide-in-from-bottom-2"
                                    >
                                        <Play size={18} /> Apply Changes
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Logs Panel */}
                        <div className="col-span-2 bg-slate-950 rounded-xl border border-slate-800 flex flex-col font-mono text-xs overflow-hidden">
                            <div className="px-4 py-2 border-b border-slate-800 bg-slate-900 text-slate-400 flex justify-between items-center">
                                <span>Output Console</span>
                                <span className={`flex items-center gap-1.5 ${status === 'done' ? 'text-emerald-500' : status === 'error' ? 'text-red-500' : 'text-blue-500'}`}>
                                    {status === 'done' ? <CheckCircle2 size={12} /> : status === 'error' ? <AlertCircle size={12} /> : <div className="w-2 h-2 bg-current rounded-full animate-pulse"></div>}
                                    {status.toUpperCase()}
                                </span>
                            </div>
                            <div className="flex-1 p-4 overflow-y-auto text-slate-300">
                                {logs ? <pre className="whitespace-pre-wrap font-mono">{logs}</pre> : <div className="h-full flex items-center justify-center text-slate-600 italic">Waiting for execution...</div>}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
