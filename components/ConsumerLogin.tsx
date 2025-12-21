import React, { useState } from 'react';
import { translations } from '../translations';
import { Language, User, AdminUser } from '../types';
import { api } from '../services/api';
import { Shield, Lock, User as UserIcon, Loader2, Home, Zap, ArrowRight } from 'lucide-react';

interface ConsumerLoginProps {
    language: Language;
    onLogin: (user: AdminUser) => void;
    onBack: () => void;
}

export default function ConsumerLogin({ language, onLogin, onBack }: ConsumerLoginProps) {
    const t = translations[language];
    const [isRegister, setIsRegister] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            if (isRegister) {
                const res = await api.auth.register({ username, password });
                if (res.success && res.data) {
                    onLogin(res.data);
                } else {
                    setError(res.error || 'Registration failed');
                }
            } else {
                const res = await api.auth.login(username, password);
                if (res.success && res.data) {
                    onLogin(res.data);
                } else {
                    setError(res.error || 'Invalid credentials');
                }
            }
        } catch (err) {
            setError('System Error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] animate-fade-in bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-800 to-slate-950">
            <div className="w-full max-w-md bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-700/50 shadow-2xl p-8 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 group-hover:opacity-100 transition-opacity opacity-50"></div>

                {/* Logo/Header */}
                <div className="relative flex justify-center mb-6">
                    <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 shadow-inner">
                        <Zap className="w-8 h-8 text-blue-500" />
                    </div>
                </div>
                <h2 className="relative text-2xl font-black text-center text-white mb-2 tracking-tight">
                    {isRegister ? t.auth.join : t.auth.welcome}
                </h2>
                <p className="relative text-slate-500 text-center text-sm mb-8 font-medium">To AI 360 Ecosystem</p>

                {/* Tabs */}
                <div className="relative flex mb-8 bg-slate-950/50 rounded-xl p-1 border border-slate-800">
                    <button
                        onClick={() => setIsRegister(false)}
                        className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all ${!isRegister ? 'bg-slate-800 text-white shadow-lg shadow-black/20' : 'text-slate-500 hover:text-white'}`}
                    >
                        {t.auth.loginTab}
                    </button>
                    <button
                        onClick={() => setIsRegister(true)}
                        className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all ${isRegister ? 'bg-slate-800 text-white shadow-lg shadow-black/20' : 'text-slate-500 hover:text-white'}`}
                    >
                        {t.auth.registerTab}
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="relative space-y-5">
                    <div>
                        <label className="text-[10px] uppercase font-black text-slate-500 tracking-wider mb-1.5 block">{t.auth.username}</label>
                        <div className="relative group/input">
                            <UserIcon className="absolute left-3 top-3.5 text-slate-500 w-4 h-4 transition-colors group-focus-within/input:text-blue-500" />
                            <input
                                value={username} onChange={e => setUsername(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm text-white outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all font-medium"
                                placeholder={t.auth.username}
                            />
                        </div>
                    </div>
                    <div>
                        <label className="text-[10px] uppercase font-black text-slate-500 tracking-wider mb-1.5 block">{t.auth.password}</label>
                        <div className="relative group/input">
                            <Lock className="absolute left-3 top-3.5 text-slate-500 w-4 h-4 transition-colors group-focus-within/input:text-blue-500" />
                            <input
                                type="password"
                                value={password} onChange={e => setPassword(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm text-white outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all font-medium"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    {error && <div className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 p-3 rounded-lg text-center font-bold">{error}</div>}

                    <button disabled={loading} className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-900/20 hover:shadow-blue-500/20 hover:-translate-y-0.5 flex justify-center items-center gap-2">
                        {loading ? <Loader2 className="animate-spin w-5 h-5" /> : (
                            <>
                                {isRegister ? t.auth.createAccount : t.auth.accessConsole}
                                <ArrowRight className="w-4 h-4" />
                            </>
                        )}
                    </button>
                </form>

                <button onClick={onBack} className="w-full relative text-center mt-8 text-xs font-bold text-slate-600 hover:text-white transition-colors flex items-center justify-center gap-2 uppercase tracking-tight">
                    <Home size={12} /> {t.auth.backHome}
                </button>

            </div>
        </div>
    );
}
