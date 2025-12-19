
import React, { useEffect, useState } from 'react';
import { Language } from '../../types';
import { translations } from '../../translations';
import { api } from '../../services/api';
import { Save, AlertTriangle, Globe, MessageSquare, Shield, Check } from 'lucide-react';

interface SystemConfigProps {
  language: Language;
}

const SystemConfig: React.FC<SystemConfigProps> = ({ language }) => {
  const t = translations[language];
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [registrationOpen, setRegistrationOpen] = useState(true);
  const [announcement, setAnnouncement] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.system.get();
        if (res.success && res.data) {
          if (res.data.maintenanceMode) setMaintenanceMode(res.data.maintenanceMode === 'true');
          if (res.data.registrationOpen) setRegistrationOpen(res.data.registrationOpen === 'true');
          if (res.data.announcement) setAnnouncement(res.data.announcement);
        }
      } catch (e) { console.error(e); }
    };
    load();
  }, []);

  const handleSave = async () => {
    try {
      await api.system.update({
        maintenanceMode: String(maintenanceMode),
        registrationOpen: String(registrationOpen),
        announcement
      }, '1');
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      alert("Failed to save settings");
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-white">{t.admin.system}</h2>
        <button 
          onClick={handleSave}
          className={`px-6 py-2 rounded-lg font-semibold shadow-lg transition-all flex items-center gap-2 ${
            saved ? 'bg-green-600 text-white' : 'bg-blue-600 hover:bg-blue-500 text-white'
          }`}
        >
          {saved ? <Check size={18} /> : <Save size={18} />} 
          {saved ? 'Saved!' : 'Save Changes'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* General Settings */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 space-y-6">
          <h3 className="text-xl font-semibold text-white flex items-center gap-2 border-b border-slate-700 pb-4">
            <Globe className="text-blue-400" /> General Settings
          </h3>

          <div className="flex items-center justify-between">
             <div>
               <div className="font-medium text-white">Maintenance Mode</div>
               <div className="text-xs text-slate-400">Suspend all user access except admins</div>
             </div>
             <button 
               onClick={() => setMaintenanceMode(!maintenanceMode)}
               className={`w-12 h-6 rounded-full p-1 transition-colors ${maintenanceMode ? 'bg-red-500' : 'bg-slate-600'}`}
             >
               <div className={`w-4 h-4 rounded-full bg-white transition-transform ${maintenanceMode ? 'translate-x-6' : 'translate-x-0'}`}></div>
             </button>
          </div>

          <div className="flex items-center justify-between">
             <div>
               <div className="font-medium text-white">User Registration</div>
               <div className="text-xs text-slate-400">Allow new users to create accounts</div>
             </div>
             <button 
               onClick={() => setRegistrationOpen(!registrationOpen)}
               className={`w-12 h-6 rounded-full p-1 transition-colors ${registrationOpen ? 'bg-green-500' : 'bg-slate-600'}`}
             >
               <div className={`w-4 h-4 rounded-full bg-white transition-transform ${registrationOpen ? 'translate-x-6' : 'translate-x-0'}`}></div>
             </button>
          </div>
        </div>

        {/* Security Alert */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 space-y-6">
           <h3 className="text-xl font-semibold text-white flex items-center gap-2 border-b border-slate-700 pb-4">
            <Shield className="text-orange-400" /> Security
          </h3>

          <div className="p-4 bg-orange-900/10 border border-orange-900/30 rounded-lg flex gap-4">
            <AlertTriangle className="text-orange-500 shrink-0" />
            <div>
              <div className="text-orange-200 font-bold text-sm">Force Password Reset</div>
              <p className="text-xs text-orange-200/70 mt-1">Trigger a mandatory password reset for all users on next login.</p>
              <button className="mt-3 text-xs bg-orange-600 hover:bg-orange-500 text-white px-3 py-1.5 rounded">Execute</button>
            </div>
          </div>
        </div>

        {/* Announcements */}
        <div className="lg:col-span-2 bg-slate-800 rounded-xl border border-slate-700 p-6">
          <h3 className="text-xl font-semibold text-white flex items-center gap-2 border-b border-slate-700 pb-4 mb-6">
            <MessageSquare className="text-purple-400" /> Global Announcement
          </h3>
          <textarea 
            value={announcement}
            onChange={(e) => setAnnouncement(e.target.value)}
            className="w-full h-32 bg-slate-900 border border-slate-700 rounded-lg p-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter system-wide message..."
          />
          <p className="text-xs text-slate-500 mt-2">This message will be displayed on the user dashboard.</p>
        </div>

      </div>
    </div>
  );
};

export default SystemConfig;
