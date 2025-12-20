
import React, { useState, useEffect } from 'react';
import { Language, CloudProvider, CloudResource } from '../../types';
import { Server, Cloud, Database, Plus, RefreshCw, Terminal } from 'lucide-react';

interface CloudManagerProps {
    language: Language;
}

export default function CloudManager({ language }: CloudManagerProps) {
    const [activeTab, setActiveTab] = useState<'overview' | 'providers' | 'resources'>('overview');
    const [providers, setProviders] = useState<CloudProvider[]>([]);
    const [resources, setResources] = useState<CloudResource[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [pRes, rRes] = await Promise.all([
                fetch('http://localhost:3001/api/cloud/providers').then(r => r.json()),
                fetch('http://localhost:3001/api/cloud/resources').then(r => r.json())
            ]);
            if (pRes.success) setProviders(pRes.data);
            if (rRes.success) setResources(rRes.data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleSync = async () => {
        setLoading(true);
        await fetch('http://localhost:3001/api/cloud/resources/sync', { method: 'POST' });
        await fetchData();
        setLoading(false);
    };

    return (
        <div className="animate-fade-in">
            <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-black text-white flex items-center gap-3">
                    <Cloud className="text-blue-400" /> Cloud Resources
                </h2>
                <div className="flex gap-2">
                    <button onClick={handleSync} className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 transition-colors">
                        <RefreshCw size={16} className={loading ? "animate-spin" : ""} /> Sync
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-white font-bold transition-colors">
                        <Plus size={16} /> Add Provider
                    </button>
                </div>
            </div>

            <div className="flex gap-4 mb-8 border-b border-slate-700">
                {['overview', 'providers', 'resources'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab as any)}
                        className={`px-6 py-3 border-b-2 font-bold capitalize transition-colors ${activeTab === tab ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {activeTab === 'overview' && (
                <div className="grid grid-cols-3 gap-6">
                    <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-blue-500/10 text-blue-400 rounded-lg"><Server size={24} /></div>
                            <span className="text-slate-500 text-xs font-bold uppercase">Total Compute</span>
                        </div>
                        <div className="text-4xl font-black text-white">{resources.filter(r => r.type === 'COMPUTE').length}</div>
                        <div className="text-slate-400 text-sm mt-2">Active Instances</div>
                    </div>
                    <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-purple-500/10 text-purple-400 rounded-lg"><Database size={24} /></div>
                            <span className="text-slate-500 text-xs font-bold uppercase">Storage Buckets</span>
                        </div>
                        <div className="text-4xl font-black text-white">{resources.filter(r => r.type === 'STORAGE').length}</div>
                        <div className="text-slate-400 text-sm mt-2">Total Capacity</div>
                    </div>
                    <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-green-500/10 text-green-400 rounded-lg"><Terminal size={24} /></div>
                            <span className="text-slate-500 text-xs font-bold uppercase">Terraform Stacks</span>
                        </div>
                        <div className="text-4xl font-black text-white">0</div>
                        <div className="text-slate-400 text-sm mt-2">Managed States</div>
                    </div>
                </div>
            )}

            {activeTab === 'resources' && (
                <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
                    <table className="w-full text-left text-slate-400">
                        <thead className="bg-slate-900/50 text-xs uppercase font-bold text-slate-500">
                            <tr>
                                <th className="px-6 py-4">Name</th>
                                <th className="px-6 py-4">Type</th>
                                <th className="px-6 py-4">Region</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Specs</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700">
                            {resources.length === 0 ? (
                                <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500">No resources found. Click Sync.</td></tr>
                            ) : resources.map(r => (
                                <tr key={r.id} className="hover:bg-slate-700/50">
                                    <td className="px-6 py-4 text-white font-medium">{r.name}</td>
                                    <td className="px-6 py-4"><span className="px-2 py-1 bg-slate-700 rounded text-xs">{r.type}</span></td>
                                    <td className="px-6 py-4">{r.region}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${r.status === 'RUNNING' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                            {r.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-xs font-mono">{JSON.stringify(r.specs)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
