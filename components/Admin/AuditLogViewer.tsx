
import React, { useEffect, useState } from 'react';
import { Language, AuditLog } from '../../types';
import { translations } from '../../translations';
import { api } from '../../services/api';
import { Activity, Search, Filter, Download, Loader2 } from 'lucide-react';

interface AuditLogViewerProps {
  language: Language;
}

const AuditLogViewer: React.FC<AuditLogViewerProps> = ({ language }) => {
  const t = translations[language];
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    try {
      const res = await api.logs.list();
      if (res.success && res.data) {
        setLogs(res.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter(log => 
    log.action.toLowerCase().includes(filter.toLowerCase()) || 
    log.username.toLowerCase().includes(filter.toLowerCase()) ||
    log.details.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-white">{t.admin.logs}</h2>
        <div className="flex gap-2">
           <button className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-2 rounded-lg border border-slate-700 flex items-center gap-2 text-sm">
             <Filter size={16} /> Filter
           </button>
           <button className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-2 rounded-lg border border-slate-700 flex items-center gap-2 text-sm">
             <Download size={16} /> Export
           </button>
        </div>
      </div>

      <div className="bg-slate-800 rounded-xl border border-slate-700 p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-3 text-slate-500 w-5 h-5" />
          <input 
            type="text" 
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Search logs by user, action, or details..."
            className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      <div className="space-y-2">
        {loading ? (
          <div className="flex justify-center p-8"><Loader2 className="animate-spin text-blue-500" /></div>
        ) : filteredLogs.map((log) => (
          <div key={log.id} className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4 flex items-center justify-between hover:border-blue-500/30 transition-colors">
            <div className="flex items-center gap-4">
              <div className={`w-2 h-10 rounded-full ${
                log.action.includes("FAILED") || log.action.includes("DELETE") ? 'bg-red-500' : 
                log.action.includes("SUCCESS") || log.action.includes("CREATE") ? 'bg-green-500' : 'bg-blue-500'
              }`}></div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-bold text-white">{log.action}</span>
                  <span className="text-xs text-slate-500 bg-slate-900 px-2 py-0.5 rounded border border-slate-700">{log.ip}</span>
                </div>
                <div className="text-sm text-slate-400 mt-1">{log.details}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-white font-medium">{log.username}</div>
              <div className="text-xs text-slate-500 font-mono">{new Date(log.createdAt).toLocaleString()}</div>
            </div>
          </div>
        ))}
        {!loading && filteredLogs.length === 0 && (
          <div className="text-center text-slate-500 py-8">No logs found.</div>
        )}
      </div>
    </div>
  );
};

export default AuditLogViewer;
