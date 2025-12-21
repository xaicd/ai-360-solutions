import React, { useState, useEffect } from 'react';
import { User, Language, CloudResource, ProcurementOrder, AdminUser, DigitalAgent } from '../../types';
import { translations } from '../../translations';
import { api } from '../../services/api';
import { CloudIaC } from './CloudIaC'; // Import CloudIaC
import {
    LayoutDashboard, Server, ShoppingCart, Settings as SettingsIcon,
    LogOut, Bell, Search, CreditCard, Shield, Activity, Box, CheckCircle2, User as UserIcon, Mail, Smartphone,
    MoreHorizontal, Filter, RefreshCw, Plus, ChevronDown, ExternalLink, Globe, Cpu, Hash,
    Users, Bot, Terminal, Code, Copy, Check, Cloud // Added Cloud icon
} from 'lucide-react';

interface ConsoleProps {
    user: AdminUser;
    onLogout: () => void;
    language: Language;
}

// --- Helper Components ---

const SidebarItem = ({ icon, label, active, onClick }: any) => (
    <button onClick={onClick} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-all ${active ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
        {icon} <span className="tracking-tight">{label}</span>
    </button>
);

const StatCard = ({ label, value, icon, trend }: any) => (
    <div className="p-5 bg-slate-900 rounded-xl border border-slate-800 hover:border-slate-700 transition-colors shadow-sm">
        <div className="flex justify-between items-start mb-3">
            <div className="p-2 bg-slate-800 rounded-lg text-slate-400">{icon}</div>
            <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-emerald-400 font-bold">{trend}</span>
        </div>
        <div className="text-2xl font-black text-white mb-1 tracking-tight">{value}</div>
        <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">{label}</div>
    </div>
);

const EmptyState = ({ msg }: { msg: string }) => (
    <div className="w-full py-16 flex flex-col items-center justify-center text-slate-500 border border-dashed border-slate-800 rounded-xl bg-slate-900/50">
        <Users className="w-10 h-10 mb-3 opacity-20" />
        <p className="text-sm font-medium">{msg}</p>
    </div>
);

// --- View Components ---

const Overview = ({ user, t }: { user: AdminUser, t: any }) => (
    <div className="space-y-6 animate-fade-in">
        <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-white tracking-tight">{t.console.nav.overview}</h2>
            <div className="text-xs text-slate-500 font-mono">Region: Global / Zone A</div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <StatCard label={t.console.overview.spending} value="$12,450.00" icon={<CreditCard size={18} />} trend="+12%" />
            <StatCard label={t.console.overview.instances} value="3" icon={<Server size={18} />} trend="Stable" />
            <StatCard label={t.console.overview.security} value="98/100" icon={<Shield size={18} />} trend="High" />
            <StatCard label={t.console.overview.tickets} value="0" icon={<Activity size={18} />} trend="Normal" />
        </div>

        <div className="grid grid-cols-3 gap-6">
            <div className="col-span-2 p-6 bg-slate-900 rounded-xl border border-slate-800">
                <h3 className="text-sm font-bold text-white mb-6 flex items-center gap-2">
                    <Activity size={16} className="text-blue-500" /> {t.console.overview.usage}
                </h3>
                <div className="h-48 flex items-center justify-center border-2 border-dashed border-slate-800 rounded-lg bg-slate-950/50">
                    <div className="text-center">
                        <div className="w-full h-24 flex items-end justify-center gap-2 mb-2 px-10">
                            {[40, 65, 30, 80, 55, 90, 45, 60, 75, 50].map((h, i) => (
                                <div key={i} className="w-6 bg-blue-600/50 rounded-t-sm hover:bg-blue-500 transition-colors" style={{ height: `${h}%` }}></div>
                            ))}
                        </div>
                        <span className="text-xs text-slate-600 font-mono italic">CPU Usage (24h)</span>
                    </div>
                </div>
            </div>
            <div className="col-span-1 p-6 bg-slate-900 rounded-xl border border-slate-800">
                <h3 className="text-sm font-bold text-white mb-4">Service Health</h3>
                <div className="space-y-3">
                    {['Compute Engine', 'Object Storage', 'VPC Network', 'Identity (IAM)'].map(s => (
                        <div key={s} className="flex justify-between items-center text-sm p-2 rounded hover:bg-slate-800 transition-colors cursor-pointer">
                            <span className="text-slate-400">{s}</span>
                            <CheckCircle2 size={14} className="text-emerald-500" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    </div>
);

const Resources = ({ user, t }: { user: AdminUser, t: any }) => {
    const [resources, setResources] = useState<CloudResource[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.console.resources(user.id).then(res => {
            if (res.data) setResources(res.data);
            setLoading(false);
        });
    }, [user.id]);

    return (
        <div className="space-y-4 animate-fade-in">
            <div className="flex justify-between items-end">
                <h2 className="text-xl font-bold text-white tracking-tight">{t.console.resources.title}</h2>
                <button className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg transition-colors">
                    <Plus size={14} /> Create Instance
                </button>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
                {/* Toolbar */}
                <div className="px-4 py-3 border-b border-slate-800 flex gap-3 bg-slate-900 items-center">
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 text-slate-600 w-3 h-3" />
                        <input className="bg-slate-950 border border-slate-800 rounded-md pl-8 pr-3 py-2 text-xs text-white focus:border-blue-500 outline-none w-64" placeholder="Filter by ID, Name..." />
                    </div>
                    <button className="flex items-center gap-2 px-3 py-2 bg-slate-800 border border-slate-700 hover:border-slate-600 text-slate-300 text-xs font-bold rounded-md transition-all">
                        <Filter size={12} /> Filter
                    </button>
                    <button onClick={() => setLoading(true)} className="ml-auto p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-md">
                        <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                    </button>
                </div>

                {/* Table */}
                {loading ? <div className="p-8 text-center text-xs text-slate-500">Loading resources...</div> : (
                    <div className="overflow-x-auto">
                        {resources.length === 0 ? <EmptyState msg={t.console.resources.empty} /> : (
                            <table className="w-full text-left text-sm border-collapse">
                                <thead>
                                    <tr className="bg-slate-950/50 border-b border-slate-800 text-xs text-slate-500 uppercase font-bold tracking-wider">
                                        <th className="px-6 py-4 w-10"><input type="checkbox" className="rounded border-slate-700 bg-slate-900" /></th>
                                        <th className="px-6 py-4">{t.console.resources.columns.name}</th>
                                        <th className="px-6 py-4">{t.console.resources.columns.id}</th>
                                        <th className="px-6 py-4">{t.console.resources.columns.type}</th>
                                        <th className="px-6 py-4">{t.console.resources.columns.region}</th>
                                        <th className="px-6 py-4">{t.console.resources.columns.ip}</th>
                                        <th className="px-6 py-4">{t.console.resources.columns.status}</th>
                                        <th className="px-6 py-4 text-right">{t.console.resources.columns.actions}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800/50">
                                    {resources.map((r, i) => (
                                        <tr key={r.id} className="group hover:bg-slate-800/30 transition-colors">
                                            <td className="px-6 py-4"><input type="checkbox" className="rounded border-slate-700 bg-slate-900" /></td>
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-white flex items-center gap-2">
                                                    <Box size={14} className="text-blue-500" /> {r.name}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 font-mono text-xs text-slate-400">{r.id.substring(0, 12)}...</td>
                                            <td className="px-6 py-4 text-slate-300 flex items-center gap-2"><Cpu size={12} /> {r.type}</td>
                                            <td className="px-6 py-4 text-slate-400"><span className="flex items-center gap-1"><Globe size={12} /> {r.region}</span></td>
                                            <td className="px-6 py-4 font-mono text-xs text-slate-400">{r.ipAddress || `10.0.1.${100 + i}`}</td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${r.status === 'RUNNING' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-slate-800 text-slate-500 border border-slate-700'}`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${r.status === 'RUNNING' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-500'}`}></span>
                                                    {r.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button title="Remote" className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded"><ExternalLink size={14} /></button>
                                                    <button title="More" className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded"><MoreHorizontal size={14} /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

const Workforce = ({ user, t }: { user: AdminUser, t: any }) => {
    const [agents, setAgents] = useState<DigitalAgent[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch Real Workforce
        api.console.workforce(user.id).then(res => {
            if (res.data) setAgents(res.data);
            setLoading(false);
        });
    }, [user.id]);

    const [selectedAgent, setSelectedAgent] = useState<DigitalAgent | null>(null);
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        const config = {
            mcpServers: {
                [selectedAgent?.name?.toLowerCase().replace(/ /g, '_') || 'agent']: {
                    url: selectedAgent?.mcpConfig?.endpoint,
                    tools: selectedAgent?.mcpConfig?.tools?.map(t => t.name)
                }
            }
        };
        navigator.clipboard.writeText(JSON.stringify(config, null, 2));
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-end">
                <h2 className="text-xl font-bold text-white tracking-tight">{t.console.workforce.title}</h2>
                <button className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg transition-colors">
                    <Plus size={14} /> Hire Agent
                </button>
            </div>

            {loading ? <div className="p-10 text-center text-slate-500 text-sm">Loading digital workforce...</div> : (
                agents.length === 0 ? <EmptyState msg={t.console.workforce.empty} /> : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {agents.map(agent => (
                            <div key={agent.id} className="group bg-slate-900 border border-slate-800 rounded-xl p-6 hover:border-blue-500/50 transition-all hover:shadow-xl hover:shadow-blue-900/10">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="relative">
                                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${agent.avatarSeed}`} className="w-12 h-12 rounded-xl bg-slate-800" />
                                        <span className={`absolute -bottom-1 -right-1 w-3 h-3 border-2 border-slate-900 rounded-full ${agent.status === 'WORKING' ? 'bg-emerald-500' : 'bg-slate-500'}`}></span>
                                    </div>
                                    <div className="flex gap-2">
                                        {agent.mcpConfig && (
                                            <button onClick={() => setSelectedAgent(agent)} className="px-3 py-1.5 bg-slate-800 hover:bg-blue-600 hover:text-white text-blue-400 text-[10px] font-bold rounded-lg transition-colors uppercase tracking-wide flex items-center gap-1">
                                                <Code size={12} /> MCP
                                            </button>
                                        )}
                                    </div>
                                </div>
                                <h3 className="text-lg font-bold text-white mb-1">{agent.name}</h3>
                                <div className="text-xs text-slate-500 font-bold uppercase mb-4">{agent.role}</div>

                                <div className="space-y-3">
                                    <div className="bg-slate-950 rounded-lg p-3 border border-slate-800/50">
                                        <div className="text-[10px] text-slate-500 font-bold uppercase mb-2 flex items-center gap-1"><Terminal size={10} /> {t.console.workforce.tools}</div>
                                        <div className="flex flex-wrap gap-1.5">
                                            {agent.mcpConfig?.tools?.map((tool: any) => (
                                                <span key={tool.name} className="px-2 py-1 bg-slate-900 text-slate-300 text-[10px] font-mono rounded border border-slate-800">{tool.name}</span>
                                            )) || <span className="text-slate-600 text-[10px]">No capabilities exposed</span>}
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between text-xs text-slate-500 font-mono">
                                        <span>Saturation: {agent.saturation}%</span>
                                        <span className="text-emerald-500 font-bold">{t.console.workforce.status.ready}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ))}

            {/* MCP Modal */}
            {selectedAgent && (
                <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl animate-in fade-in zoom-in-95">
                        <div className="p-6 border-b border-slate-800 flex justify-between items-center">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2"><Bot className="text-blue-500" /> {t.console.workforce.connectMcp}</h3>
                            <button onClick={() => setSelectedAgent(null)} className="text-slate-500 hover:text-white"><LogOut size={18} className="rotate-45" /></button>
                        </div>
                        <div className="p-6 space-y-4">
                            <p className="text-sm text-slate-400">{t.console.workforce.mcpDescription}</p>
                            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-xs text-blue-300 relative group">
                                <pre className="overflow-x-auto">
                                    {JSON.stringify({
                                        "mcpServers": {
                                            [selectedAgent.name.toLowerCase().replace(/ /g, '_')]: {
                                                "url": selectedAgent.mcpConfig?.endpoint,
                                                "env": { "API_KEY": "sk-..." }
                                            }
                                        }
                                    }, null, 2)}
                                </pre>
                                <button onClick={handleCopy} className="absolute top-3 right-3 p-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors">
                                    {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                                </button>
                            </div>
                            <div className="flex justify-end">
                                <button onClick={() => window.open('https://modelcontextprotocol.io', '_blank')} className="text-xs text-blue-500 hover:text-blue-400 flex items-center gap-1 font-bold">
                                    Learn about MCP <ExternalLink size={12} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const Orders = ({ user, t }: { user: AdminUser, t: any }) => {
    const [orders, setOrders] = useState<ProcurementOrder[]>([]);
    useEffect(() => {
        api.console.orders(user.id).then(res => res.data && setOrders(res.data));
    }, [user.id]);

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-end mb-2">
                <h2 className="text-xl font-bold text-white tracking-tight">{t.console.orders.title}</h2>
                <button className="text-xs font-bold text-blue-400 hover:text-white flex items-center gap-1">Export CSV <ExternalLink size={12} /></button>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    {orders.length === 0 ? <EmptyState msg={t.console.orders.empty} /> : (
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-950/50 border-b border-slate-800 text-xs text-slate-500 uppercase font-black tracking-wider">
                                    <th className="px-6 py-4">{t.console.orders.columns.id}</th>
                                    <th className="px-6 py-4">{t.console.orders.columns.resource}</th>
                                    <th className="px-6 py-4">{t.console.orders.columns.date}</th>
                                    <th className="px-6 py-4 text-right">{t.console.orders.columns.amount}</th>
                                    <th className="px-6 py-4 text-center">{t.console.orders.columns.status}</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm divide-y divide-slate-800/50">
                                {orders.map(o => (
                                    <tr key={o.id} className="hover:bg-slate-800/30 transition-colors">
                                        <td className="px-6 py-4 font-mono text-xs text-slate-400">#{o.orderNumber}</td>
                                        <td className="px-6 py-4 font-bold text-white"><Box size={14} className="inline mr-2 text-blue-500" />{o.resourceType}</td>
                                        <td className="px-6 py-4 text-slate-400">{new Date(o.createdAt).toLocaleDateString()}</td>
                                        <td className="px-6 py-4 font-mono text-white text-right">{o.currency} {o.budget.toLocaleString()}</td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="px-2 py-0.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded text-[10px] font-bold uppercase tracking-wide">{o.status}</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}

const Settings = ({ user, t }: { user: AdminUser, t: any }) => {
    const [form, setForm] = useState({ email: user.email || '', phone: user.phone || '' });
    const [verifying, setVerifying] = useState<'email' | 'phone' | null>(null);
    const [code, setCode] = useState('');

    const sendCode = async (type: 'email' | 'phone', target: string) => {
        if (!target) return alert("Please enter value");
        const res = await api.auth.sendCode(target, type);
        if (res.success) {
            setVerifying(type);
            setCode('');
            alert(t.console.settings.sent + " (Console Log)");
        } else {
            alert("Network error");
        }
    };

    const confirmBind = async () => {
        const res = await api.auth.bind({ userId: user.id, type: verifying!, value: verifying === 'email' ? form.email : form.phone, code });
        if (res.success) {
            alert(t.console.settings.success);
            setVerifying(null);
        } else {
            alert("Failed: " + res.error);
        }
    };

    return (
        <div className="max-w-2xl space-y-8 animate-fade-in">
            <h2 className="text-xl font-bold text-white tracking-tight">{t.console.settings.title}</h2>

            <div className="space-y-4">
                {/* Email Bind */}
                <div className="p-6 bg-slate-900 rounded-xl border border-slate-800 hover:border-slate-700 transition-colors">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-slate-950 rounded-lg border border-slate-800"><Mail className="text-blue-500" size={20} /></div>
                        <div>
                            <div className="font-bold text-white text-sm">{t.console.settings.email}</div>
                            <div className="text-xs text-slate-500 font-mono mt-0.5">{user.email ? <span className="text-emerald-500">{t.console.settings.linked}</span> : t.console.settings.notLinked}</div>
                        </div>
                        {user.email && <CheckCircle2 className="ml-auto text-emerald-500" size={18} />}
                    </div>
                    <div className="flex gap-2">
                        <input
                            value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                            className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-sm text-white outline-none focus:border-blue-500"
                            placeholder="name@company.com"
                            disabled={!!user.email && verifying !== 'email'}
                        />
                        {!user.email && (
                            <button onClick={() => sendCode('email', form.email)} className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-lg text-xs font-bold text-white transition-colors">{t.console.settings.verify}</button>
                        )}
                    </div>
                    {verifying === 'email' && (
                        <div className="mt-4 flex gap-2 animate-in slide-in-from-top-2 p-4 bg-slate-950/50 rounded-lg border border-slate-800">
                            <Hash size={16} className="text-slate-500 mt-2.5 ml-2" />
                            <input value={code} onChange={e => setCode(e.target.value)} className="w-32 bg-transparent border-b-2 border-blue-500 px-2 py-2 text-white outline-none font-mono text-center tracking-widest text-lg" placeholder="******" maxLength={6} />
                            <button onClick={confirmBind} className="ml-auto bg-emerald-600 hover:bg-emerald-500 px-6 py-2 rounded-lg text-xs font-bold text-white transition-colors">{t.console.settings.confirm}</button>
                        </div>
                    )}
                </div>

                {/* Phone Bind */}
                <div className="p-6 bg-slate-900 rounded-xl border border-slate-800 hover:border-slate-700 transition-colors">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-slate-950 rounded-lg border border-slate-800"><Smartphone className="text-purple-500" size={20} /></div>
                        <div>
                            <div className="font-bold text-white text-sm">{t.console.settings.phone}</div>
                            <div className="text-xs text-slate-500 font-mono mt-0.5">{user.phone ? <span className="text-emerald-500">{t.console.settings.linked}</span> : t.console.settings.notLinked}</div>
                        </div>
                        {user.phone && <CheckCircle2 className="ml-auto text-emerald-500" size={18} />}
                    </div>
                    <div className="flex gap-2">
                        <input
                            value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}
                            className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-sm text-white outline-none focus:border-blue-500"
                            placeholder="+1 234 567 890"
                            disabled={!!user.phone && verifying !== 'phone'}
                        />
                        {!user.phone && (
                            <button onClick={() => sendCode('phone', form.phone)} className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-lg text-xs font-bold text-white transition-colors">{t.console.settings.verify}</button>
                        )}
                    </div>
                    {verifying === 'phone' && (
                        <div className="mt-4 flex gap-2 animate-in slide-in-from-top-2 p-4 bg-slate-950/50 rounded-lg border border-slate-800">
                            <Hash size={16} className="text-slate-500 mt-2.5 ml-2" />
                            <input value={code} onChange={e => setCode(e.target.value)} className="w-32 bg-transparent border-b-2 border-blue-500 px-2 py-2 text-white outline-none font-mono text-center tracking-widest text-lg" placeholder="******" maxLength={6} />
                            <button onClick={confirmBind} className="ml-auto bg-emerald-600 hover:bg-emerald-500 px-6 py-2 rounded-lg text-xs font-bold text-white transition-colors">{t.console.settings.confirm}</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// --- Main Component ---

export default function Console({ user, onLogout, language }: ConsoleProps) {
    const t = translations[language];
    const [activeTab, setActiveTab] = useState<'overview' | 'resources' | 'orders' | 'workforce' | 'settings' | 'cloud'>('overview');

    return (
        <div className="flex h-screen bg-slate-950 text-slate-200 font-sans selection:bg-blue-500/30">
            {/* Sidebar */}
            <div className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col z-20 shadow-xl">
                <div className="p-6">
                    <h1 className="text-xl font-black text-white flex items-center gap-2 tracking-tighter">
                        <span className="text-blue-500">AI 360</span> Console
                    </h1>
                </div>

                <nav className="flex-1 px-3 space-y-1">
                    <SidebarItem icon={<LayoutDashboard size={18} />} label={t.console.nav.overview} active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} />
                    <SidebarItem icon={<Server size={18} />} label={t.console.nav.resources} active={activeTab === 'resources'} onClick={() => setActiveTab('resources')} />
                    <SidebarItem icon={<Cloud size={18} />} label="Cloud IaC" active={activeTab === 'cloud'} onClick={() => setActiveTab('cloud')} />
                    <SidebarItem icon={<Users size={18} />} label={t.console.nav.workforce} active={activeTab === 'workforce'} onClick={() => setActiveTab('workforce')} />
                    <SidebarItem icon={<ShoppingCart size={18} />} label={t.console.nav.orders} active={activeTab === 'orders'} onClick={() => setActiveTab('orders')} />
                    <SidebarItem icon={<SettingsIcon size={18} />} label={t.console.nav.settings} active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
                </nav>

                <div className="p-4 border-t border-slate-800/50">
                    <div className="flex items-center gap-3 mb-4 px-2">
                        <img src={user.avatar || `https://i.pravatar.cc/150?u=${user.username}`} className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700" />
                        <div className="flex-1 min-w-0">
                            <div className="text-sm font-bold text-white truncate">{user.username}</div>
                            <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wide">{user.role}</div>
                        </div>
                    </div>
                    <button onClick={onLogout} className="w-full flex items-center justify-center gap-2 text-xs font-bold text-slate-400 hover:text-white py-2.5 rounded-lg hover:bg-slate-800 transition-colors uppercase tracking-widest border border-transparent hover:border-slate-700">
                        <LogOut size={14} /> {t.console.nav.logout}
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden bg-slate-950">
                {/* Header */}
                <header className="h-16 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between px-8 backdrop-blur-md z-10 sticky top-0">
                    <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                        <span className="hover:text-white cursor-pointer transition-colors">Console</span>
                        <span className="text-slate-700">/</span>
                        <span className="capitalize text-white font-bold">{activeTab === 'overview' ? t.console.nav.overview : (activeTab === 'cloud' ? 'Cloud IaC' : t.console.nav[activeTab])}</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="relative group">
                            <Search className="absolute left-3 top-2.5 text-slate-500 w-4 h-4 group-focus-within:text-blue-500 transition-colors" />
                            <input className="bg-slate-950 border border-slate-800 rounded-full pl-9 pr-4 py-2 text-xs text-white focus:border-blue-500 outline-none w-72 transition-all focus:w-80 shadow-inner" placeholder={t.console.searchPlaceholder} />
                        </div>
                        <button className="relative p-2.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors">
                            <Bell size={18} />
                            <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-slate-900"></span>
                        </button>
                        <div className="w-px h-6 bg-slate-800"></div>
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 rounded-full border border-slate-800">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">System Normal</span>
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-8 relative">
                    <div className="max-w-7xl mx-auto">
                        {activeTab === 'overview' && <Overview user={user} t={t} />}
                        {activeTab === 'resources' && <Resources user={user} t={t} />}
                        {activeTab === 'cloud' && <CloudIaC userId={user.id} />}
                        {activeTab === 'workforce' && <Workforce user={user} t={t} />}
                        {activeTab === 'orders' && <Orders user={user} t={t} />}
                        {activeTab === 'settings' && <Settings user={user} t={t} />}
                    </div>
                </main>
            </div>
        </div>
    );
}
