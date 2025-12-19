
import React, { useState } from 'react';
import { translations } from '../../translations';
import { Language, AdminUser } from '../../types';
import { api } from '../../services/api'; // Import api service
import { Shield, Lock, Fingerprint, Zap, Loader2 } from 'lucide-react';

interface AdminLoginProps {
  language: Language;
  onLogin: (user: AdminUser) => void;
  onBack: () => void;
}

export default function AdminLogin({ language, onLogin, onBack }: AdminLoginProps) {
  const t = translations[language];
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false); // Add loading state

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const u = username.trim().toLowerCase();
      const p = password.trim();

      // Use the API service instead of hardcoded checks
      const response = await api.auth.login(u, p);

      if (response.success && response.data) {
        onLogin(response.data);
      } else {
        setError(t.admin.loginError || 'Invalid credentials.');
      }
    } catch (err) {
      setError('System error during authentication.');
    } finally {
      setLoading(false);
    }
  };

  const fillCredentials = (u: string, p: string) => {
    setUsername(u);
    setPassword(p);
    setError('');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] animate-fade-in">
      <div className="w-full max-w-md bg-slate-800 rounded-2xl border border-slate-700 shadow-2xl p-8 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl -mr-16 -mt-16"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl -ml-16 -mb-16"></div>

        <div className="relative z-10">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center border border-slate-700 shadow-inner">
              <Shield className="w-8 h-8 text-blue-400" />
            </div>
          </div>

          <h2 className="text-2xl font-bold text-center text-white mb-2">{t.admin.loginTitle}</h2>
          <p className="text-center text-slate-400 mb-8">{t.admin.loginSubtitle}</p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                {t.admin.username}
              </label>
              <div className="relative">
                <Fingerprint className="absolute left-3 top-3 text-slate-500 w-5 h-5" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    if(error) setError('');
                  }}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg py-3 pl-10 pr-4 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                  placeholder="admin"
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                {t.admin.password}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 text-slate-500 w-5 h-5" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if(error) setError('');
                  }}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg py-3 pl-10 pr-4 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                  placeholder="••••••"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Quick Login Buttons */}
            <div className="flex gap-2 justify-center py-2">
               <button 
                 type="button" 
                 onClick={() => fillCredentials('admin', 'admin')}
                 className="flex items-center gap-1 text-xs bg-slate-700 hover:bg-slate-600 text-blue-300 px-3 py-1.5 rounded transition-colors"
                 disabled={loading}
               >
                 <Zap size={10} /> {t.admin.demoAdmin}
               </button>
               <button 
                 type="button" 
                 onClick={() => fillCredentials('architect', '123')}
                 className="flex items-center gap-1 text-xs bg-slate-700 hover:bg-slate-600 text-purple-300 px-3 py-1.5 rounded transition-colors"
                 disabled={loading}
               >
                 <Zap size={10} /> {t.admin.demoArchitect}
               </button>
            </div>

            {error && (
              <div className="text-red-400 text-sm text-center bg-red-900/20 py-2 rounded border border-red-900/30">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg shadow-lg shadow-blue-900/20 transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="animate-spin w-5 h-5" /> : t.admin.loginBtn}
            </button>
          </form>

          <button 
            onClick={onBack}
            className="w-full text-center mt-6 text-sm text-slate-500 hover:text-slate-300 transition-colors"
          >
            ← Back to Public Site
          </button>
        </div>
      </div>
    </div>
  );
}
