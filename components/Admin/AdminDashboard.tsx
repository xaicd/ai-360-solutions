
import React, { useEffect, useState } from 'react';
import { Language } from '../../types';
import { translations } from '../../translations';
import { Database, Server, Activity, Heart, TrendingUp, Loader2 } from 'lucide-react';
import { api } from '../../services/api';

interface AdminDashboardProps {
  language: Language;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ language }) => {
  const t = translations[language];
  const [stats, setStats] = useState({
    totalSolutions: 0,
    activeDeployments: 0,
    apiUsage: 0,
    systemHealth: 100
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.dashboard.stats();
        if (res.success && res.data) {
          setStats(res.data);
        }
      } catch (e) {
        console.error("Failed to fetch dashboard stats", e);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const StatCard = ({ title, value, sub, icon: Icon, color }: { title: string, value: string | number, sub: string, icon: any, color: string }) => (
    <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 relative overflow-hidden group hover:border-slate-500 transition-all">
      <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity ${color}`}>
        <Icon size={64} />
      </div>
      <div className="relative z-10">
        <h3 className="text-slate-400 text-sm uppercase tracking-wider mb-2">{title}</h3>
        <div className="text-3xl font-bold text-white mb-2">
          {loading ? <div className="h-8 w-16 bg-slate-700 rounded animate-pulse"></div> : value}
        </div>
        <div className="text-xs text-slate-500 flex items-center gap-1">
          <TrendingUp size={12} className="text-green-500" />
          {sub}
        </div>
      </div>
    </div>
  );

  return (
    <div className="animate-fade-in">
      <h2 className="text-3xl font-bold text-white mb-8">{t.admin.dashboard}</h2>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          title={t.admin.stats.totalSolutions}
          value={stats.totalSolutions}
          sub="Live in database"
          icon={Database}
          color="text-blue-500"
        />
        <StatCard 
          title={t.admin.stats.activeDeployments}
          value={stats.activeDeployments}
          sub="Verified & Active"
          icon={Server}
          color="text-purple-500"
        />
        <StatCard 
          title={t.admin.stats.apiUsage}
          value={stats.apiUsage.toLocaleString()}
          sub="Tokens generated"
          icon={Activity}
          color="text-green-500"
        />
        <StatCard 
          title={t.admin.stats.systemHealth}
          value={`${stats.systemHealth}%`}
          sub="All systems operational"
          icon={Heart}
          color="text-red-500"
        />
      </div>

      {/* Recent Activity / Placeholder Graphs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
          <h3 className="text-lg font-bold text-white mb-6">Traffic Analysis</h3>
          <div className="h-64 flex items-end gap-2 px-2">
            {[40, 65, 45, 80, 55, 90, 70, 85, 60, 75, 50, 95].map((h, i) => (
              <div key={i} className="flex-1 bg-blue-600/20 hover:bg-blue-600/40 rounded-t transition-all relative group" style={{ height: `${h}%` }}>
                 <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-slate-900 text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                   {h * 100} reqs
                 </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
          <h3 className="text-lg font-bold text-white mb-6">Pending Approvals</h3>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg border border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-900/30 rounded flex items-center justify-center text-purple-400">
                    <Database size={20} />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white">Enterprise CRM V{i}.0</div>
                    <div className="text-xs text-slate-500">Submitted by DevTeam_Alpha</div>
                  </div>
                </div>
                <button className="text-xs bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded transition-colors">
                  Review
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
