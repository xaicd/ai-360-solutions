
import React from 'react';
import { Globe, ShieldCheck, Cpu, Settings, Shield } from 'lucide-react';
import { Language, AiModel } from '../types';
import { translations } from '../translations';

interface HeaderProps {
  onGoHome: () => void;
  onAdmin: () => void;
  language: Language;
  setLanguage: (lang: Language) => void;
}

const Header: React.FC<HeaderProps> = ({ onGoHome, onAdmin, language, setLanguage }) => {
  const t = translations[language];

  return (
    <header className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-slate-700">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div
          className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
          onClick={onGoHome}
        >
          <div className="w-8 h-8 rounded-lg flex items-center justify-center relative hover:scale-110 transition-transform">
            {/* Logo with gentle pulse effect */}
            <div className="absolute inset-0 bg-blue-500/20 blur-md rounded-full animate-pulse"></div>
            <img src="/logo.png" alt="AI 360 Logo" className="w-full h-full object-contain relative z-10" />
          </div>
          <span className="text-xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-400 tracking-tighter">
            {t.title}
          </span>
        </div>

        <div className="hidden md:flex items-center gap-8 text-xs font-bold uppercase tracking-widest text-slate-500">
          <span className="hover:text-blue-400 cursor-pointer transition-colors">{t.nav.industries}</span>
          <span className="hover:text-blue-400 cursor-pointer transition-colors">{t.nav.privatization}</span>
          <span className="hover:text-blue-400 cursor-pointer transition-colors">{t.nav.riskControl}</span>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-[10px] font-black uppercase text-green-400 bg-green-400/10 px-3 py-1.5 rounded-full border border-green-400/20">
            <ShieldCheck size={12} />
            <span className="hidden sm:inline">{t.nav.secure}</span>
          </div>

          <div className="flex items-center gap-3 border-l border-slate-700 pl-4 ml-1">
            <button
              onClick={onAdmin}
              className="p-2 text-slate-400 hover:text-blue-400 hover:bg-slate-800 rounded-xl transition-all"
              title={t.nav.admin}
            >
              <Shield size={20} />
            </button>

            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as Language)}
              className="bg-transparent text-slate-400 font-bold text-xs focus:outline-none cursor-pointer hover:text-white"
            >
              <option value="en">EN</option>
              <option value="zh">ZH</option>
              <option value="ja">JP</option>
              <option value="ko">KR</option>
            </select>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
