
import React, { useEffect, useState } from 'react';
import { Language, Solution } from '../../types';
import { translations } from '../../translations';
import { api } from '../../services/api';
import { 
  Edit2, Trash2, PauseCircle, 
  Loader2, Plus, ShieldCheck, DollarSign, ExternalLink, Database, Search, Download, X
} from 'lucide-react';
import AuditWorkflowModal from './AuditWorkflowModal';
import SolutionEditor from './SolutionEditor';

interface SolutionManagerProps {
  language: Language;
}

const SolutionManager: React.FC<SolutionManagerProps> = ({ language }) => {
  const t = translations[language];
  const [solutions, setSolutions] = useState<Solution[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId] = useState('1'); 
  const [auditingSolution, setAuditingSolution] = useState<Solution | null>(null);
  const [editingSolution, setEditingSolution] = useState<Solution | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importUrl, setImportUrl] = useState('');

  useEffect(() => {
    loadSolutions();
  }, []);

  const loadSolutions = async () => {
    setLoading(true);
    try {
      const response = await api.solutions.list();
      if (response.success && response.data) {
        setSolutions(response.data);
      }
    } catch (e) {
      console.error("Failed to load solutions", e);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: string, newStatus: Solution['status']) => {
    try {
      await api.solutions.updateStatus(id, newStatus as any, currentUserId);
      setSolutions(prev => prev.map(s => s.id === id ? { ...s, status: newStatus } : s));
    } catch (e) {
      console.error("Failed to update status", e);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this solution from the mall?')) return;
    try {
      await api.solutions.delete(id, currentUserId);
      setSolutions(prev => prev.filter(s => s.id !== id));
    } catch (e) {
      console.error("Failed to delete", e);
    }
  };

  const onEditorSave = async (data: Partial<Solution>) => {
    try {
      if (editingSolution) {
        // Update
        const res = await api.solutions.updateStatus(editingSolution.id, data.status as any, currentUserId);
        if (res.success) {
          // Note: In a real app we'd call a full update endpoint.
          // For the mock, we assume the local DB handle this.
          loadSolutions();
        }
      } else {
        // Create
        const res = await api.solutions.create(data as Solution, currentUserId);
        if (res.success) {
          loadSolutions();
        }
      }
    } catch (e) {
      console.error("Save failed", e);
    } finally {
      setEditingSolution(null);
      setIsAddingNew(false);
    }
  };

  const handleImport = () => {
    if (!importUrl) return;
    setIsImporting(false);
    // Simulate AI extraction
    const mockSolution: Partial<Solution> = {
      title: importUrl.split('/').pop() || 'Imported Solution',
      githubRepo: importUrl.replace('https://github.com/', ''),
      description: 'Extracted from repository using Digital Architect AI...',
      industry: t.industries[0],
      price: 5000,
      status: 'pending'
    };
    setEditingSolution(mockSolution as Solution);
    setImportUrl('');
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'active': return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'pending': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
      case 'audited': return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20';
      case 'deprecated': return 'bg-red-500/10 text-red-400 border-red-500/20';
      default: return 'bg-slate-500/10 text-slate-400';
    }
  };

  if (editingSolution || isAddingNew) {
    return (
      <SolutionEditor 
        solution={editingSolution || undefined}
        language={language}
        onSave={onEditorSave}
        onCancel={() => {
          setEditingSolution(null);
          setIsAddingNew(false);
        }}
      />
    );
  }

  return (
    <div className="animate-fade-in relative">
      {isImporting && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setIsImporting(false)}></div>
          <div className="relative bg-slate-900 border border-slate-700 w-full max-w-lg rounded-2xl p-8 shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
              <Download size={20} className="text-blue-400" /> {t.admin.importSolution}
            </h3>
            <p className="text-slate-400 text-sm mb-6">Enter a GitHub repository URL. Our AI Architect will audit the code and pre-fill solution attributes.</p>
            <input 
              type="text" 
              value={importUrl}
              onChange={(e) => setImportUrl(e.target.value)}
              placeholder="https://github.com/organization/repo"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white mb-6 focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <div className="flex justify-end gap-3">
               <button onClick={() => setIsImporting(false)} className="px-6 py-2 text-slate-500 hover:text-white transition-colors">Cancel</button>
               <button onClick={handleImport} className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-2 rounded-xl font-bold shadow-lg shadow-blue-900/20">Analyze & Import</button>
            </div>
          </div>
        </div>
      )}

      {auditingSolution && (
        <AuditWorkflowModal 
          solution={auditingSolution}
          language={language}
          onClose={() => setAuditingSolution(null)}
          onComplete={async (id) => {
            await handleStatusChange(id, 'active');
            setAuditingSolution(null);
            loadSolutions();
          }}
        />
      )}

      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-white">{t.admin.solutions}</h2>
          <p className="text-slate-400 text-sm mt-1">Manage product attributes, SKUs, and marketplace visibility.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setIsImporting(true)}
            className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 border border-slate-700"
          >
            <Download size={16} /> {t.admin.importSolution}
          </button>
          <button 
            onClick={() => setIsAddingNew(true)}
            className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 shadow-lg shadow-blue-900/20"
          >
            <Plus size={16} /> {t.admin.addSolution}
          </button>
        </div>
      </div>

      <div className="bg-slate-800 p-4 rounded-t-xl border-x border-t border-slate-700 flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 text-slate-500" size={18} />
          <input 
            type="text" 
            placeholder="Search mall inventory..."
            className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2 pl-10 pr-4 text-sm text-white outline-none focus:border-blue-500"
          />
        </div>
        <select className="bg-slate-900 border border-slate-700 rounded-lg px-4 text-sm text-slate-400">
           <option>All Industries</option>
           {t.industries.map(i => <option key={i}>{i}</option>)}
        </select>
      </div>

      <div className="bg-slate-800 rounded-b-xl border border-slate-700 overflow-hidden shadow-2xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-900/50 border-b border-slate-700 text-[10px] font-black uppercase tracking-widest text-slate-500">
              <th className="p-4">{t.admin.table.name}</th>
              <th className="p-4">{t.admin.editor.price}</th>
              <th className="p-4">{t.admin.table.status}</th>
              <th className="p-4 text-center">{t.admin.table.score}</th>
              <th className="p-4 text-right">{t.admin.table.actions}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {loading ? (
              <tr><td colSpan={5} className="p-12 text-center"><Loader2 className="animate-spin inline text-blue-500" /></td></tr>
            ) : solutions.map((sol) => (
              <tr key={sol.id} className="hover:bg-slate-700/30 transition-colors group">
                <td className="p-4">
                  <div className="flex flex-col">
                    <span className="font-bold text-white">{sol.title}</span>
                    <span className="text-[10px] text-slate-500 font-mono flex items-center gap-1 mt-1">
                      <Database size={10} /> {sol.industry} • <ExternalLink size={10} /> {sol.githubRepo}
                    </span>
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-1.5 font-mono text-yellow-500 font-bold">
                    <DollarSign size={14} />
                    {sol.price.toLocaleString()}
                  </div>
                </td>
                <td className="p-4">
                  <span className={`px-2 py-0.5 rounded border text-[10px] font-bold uppercase tracking-wider ${getStatusColor(sol.status)}`}>
                    {sol.status}
                  </span>
                </td>
                <td className="p-4 text-center">
                  <div className="inline-block px-2 py-1 rounded bg-slate-900 font-bold border border-slate-700 text-cyan-400">
                    {sol.architectReview.qualityScore}
                  </div>
                </td>
                <td className="p-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    {sol.status === 'pending' && (
                      <button onClick={() => setAuditingSolution(sol)} className="p-1.5 hover:bg-blue-500/20 text-blue-400 rounded transition-colors" title="Audit">
                        <ShieldCheck size={16} />
                      </button>
                    )}
                    <button onClick={() => setEditingSolution(sol)} className="p-1.5 hover:bg-slate-700 text-slate-400 rounded transition-colors">
                      <Edit2 size={16} />
                    </button>
                    <button onClick={() => handleDelete(sol.id)} className="p-1.5 hover:bg-red-500/20 text-red-400 rounded transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SolutionManager;
