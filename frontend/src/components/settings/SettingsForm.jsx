import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiUser, FiCalendar, FiClock, FiTarget, FiMonitor, FiSave, FiSettings } from 'react-icons/fi';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { useTheme } from '../../hooks/useTheme';
import toast from 'react-hot-toast';

const SettingsForm = () => {
  const [profile, setProfile] = useLocalStorage('mentorxProfile', {
    name: 'Safiya',
    examDate: '2027-02-01',
    pomodoroDuration: 25,
    dailyGoalCount: 5
  });
  
  const [theme, setTheme] = useTheme();

  const [formData, setFormData] = useState({
    name: profile.name,
    examDate: profile.examDate,
    pomodoroDuration: profile.pomodoroDuration,
    dailyGoalCount: profile.dailyGoalCount,
    theme: theme
  });

  const handleSave = () => {
    setProfile({
      name: formData.name,
      examDate: formData.examDate,
      pomodoroDuration: Number(formData.pomodoroDuration),
      dailyGoalCount: Number(formData.dailyGoalCount)
    });
    setTheme(formData.theme);
    toast.success('Settings saved successfully!');
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-6 max-w-2xl mx-auto"
    >
      <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
        <FiSettings className="text-mentorBlue-500" /> Settings
      </h2>

      <div className="space-y-6">
        {/* Profile Settings */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200 pb-2">Profile</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-1">
                <FiUser /> Name
              </label>
              <input 
                type="text" 
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                className="w-full px-4 py-2 rounded-xl border border-slate-200 bg-white/50 focus:outline-none focus:border-mentorBlue-400"
              />
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-1">
                <FiCalendar /> Target Exam Date
              </label>
              <input 
                type="date" 
                value={formData.examDate}
                onChange={e => setFormData({...formData, examDate: e.target.value})}
                className="w-full px-4 py-2 rounded-xl border border-slate-200 bg-white/50 focus:outline-none focus:border-mentorBlue-400"
              />
            </div>
          </div>
        </div>

        {/* App Settings */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200 pb-2">Preferences</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-1">
                <FiMonitor /> Theme
              </label>
              <select 
                value={formData.theme}
                onChange={e => setFormData({...formData, theme: e.target.value})}
                className="w-full px-4 py-2 rounded-xl border border-slate-200 bg-white/50 focus:outline-none focus:border-mentorBlue-400"
              >
                <option value="light">Light Mode</option>
                <option value="dark">Dark Mode</option>
                <option value="theme-blue">Blue Accent</option>
              </select>
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-1">
                <FiClock /> Pomodoro Duration (mins)
              </label>
              <select 
                value={formData.pomodoroDuration}
                onChange={e => setFormData({...formData, pomodoroDuration: e.target.value})}
                className="w-full px-4 py-2 rounded-xl border border-slate-200 bg-white/50 focus:outline-none focus:border-mentorBlue-400"
              >
                <option value="15">15 minutes</option>
                <option value="25">25 minutes</option>
                <option value="45">45 minutes</option>
                <option value="60">60 minutes</option>
              </select>
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-1">
                <FiTarget /> Daily Goal Target (Tasks)
              </label>
              <input 
                type="number" 
                min="1"
                max="20"
                value={formData.dailyGoalCount}
                onChange={e => setFormData({...formData, dailyGoalCount: e.target.value})}
                className="w-full px-4 py-2 rounded-xl border border-slate-200 bg-white/50 focus:outline-none focus:border-mentorBlue-400"
              />
            </div>
          </div>
        </div>

        <div className="pt-4 flex justify-end">
          <button 
            onClick={handleSave}
            className="px-6 py-2 bg-mentorBlue-600 hover:bg-mentorBlue-700 text-white rounded-xl font-medium transition-colors flex items-center gap-2 shadow-md hover:shadow-lg"
          >
            <FiSave /> Save Changes
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default SettingsForm;
