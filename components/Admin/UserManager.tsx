
import React, { useEffect, useState } from 'react';
import { Language, UserRole, AdminUser } from '../../types';
import { translations } from '../../translations';
import { User, Shield, MoreVertical, Mail, Trash2, Loader2, Plus } from 'lucide-react';
import { api } from '../../services/api';

interface UserManagerProps {
  language: Language;
}

const UserManager: React.FC<UserManagerProps> = ({ language }) => {
  const t = translations[language];
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await api.users.list();
      if (res.success && res.data) {
        setUsers(res.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    try {
      await api.users.delete(id, '1'); // '1' is mocked current admin ID
      setUsers(prev => prev.filter(u => u.id !== id));
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreate = async () => {
    const name = prompt("Enter username for new user:");
    if (!name) return;
    try {
      const res = await api.users.create({ username: name, role: UserRole.AUDITOR }, '1');
      if (res.success && res.data) {
        setUsers(prev => [...prev, res.data!]);
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
     return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-blue-500" /></div>;
  }

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-white">{t.admin.users}</h2>
        <button 
          onClick={handleCreate}
          className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2"
        >
          <Plus size={16} /> Add User
        </button>
      </div>

      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-900/50 border-b border-slate-700 text-xs uppercase text-slate-400">
              <th className="p-4">User</th>
              <th className="p-4">Role</th>
              <th className="p-4">Status</th>
              <th className="p-4">Last Login</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-slate-700/30 transition-colors group">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center overflow-hidden">
                      {user.avatar && user.avatar.length > 3 
                        ? <img src={`https://picsum.photos/seed/${user.avatar}/100`} alt="av" className="w-full h-full object-cover" />
                        : <span className="text-xs font-bold text-white">{user.username.charAt(0)}</span>
                      }
                    </div>
                    <div>
                      <div className="font-medium text-white text-sm">{user.username}</div>
                      <div className="text-xs text-slate-500 flex items-center gap-1">
                        <Mail size={10} /> {user.username.toLowerCase()}@ai360.internal
                      </div>
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-1.5 text-xs text-slate-300 bg-slate-900/50 px-2 py-1 rounded border border-slate-700 w-fit">
                    <Shield size={10} className="text-blue-400" />
                    {t.admin.roles[user.role]}
                  </div>
                </td>
                <td className="p-4">
                   <span className={`text-xs px-2 py-1 rounded-full border ${
                     user.isActive 
                     ? 'bg-green-500/10 text-green-400 border-green-500/20' 
                     : 'bg-red-500/10 text-red-400 border-red-500/20'
                   }`}>
                     {user.isActive ? 'Active' : 'Inactive'}
                   </span>
                </td>
                <td className="p-4 text-sm text-slate-400 flex items-center gap-2">
                   {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : '-'}
                </td>
                <td className="p-4 text-right">
                  <button 
                    onClick={() => handleDelete(user.id)}
                    className="text-slate-500 hover:text-red-400 transition-colors opacity-50 group-hover:opacity-100"
                    title="Delete User"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr><td colSpan={5} className="p-8 text-center text-slate-500">No users found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserManager;
