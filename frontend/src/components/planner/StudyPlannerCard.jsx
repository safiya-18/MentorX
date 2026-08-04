import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiTrash2, FiEdit2, FiCheck, FiX } from 'react-icons/fi';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import toast from 'react-hot-toast';

const initialSessions = [
  { id: 1, subject: 'DBMS', topic: 'SQL Injections', date: new Date().toISOString().split('T')[0], priority: 'High', status: 'Pending' },
];

const StudyPlannerCard = () => {
  const [sessions, setSessions] = useLocalStorage('studySessions', initialSessions);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const [formData, setFormData] = useState({ subject: 'DBMS', topic: '', date: '', priority: 'Medium', status: 'Pending' });

  const subjects = ['DBMS', 'Operating Systems', 'Computer Networks', 'DSA', 'Aptitude'];
  const priorities = ['Low', 'Medium', 'High'];

  const handleSave = () => {
    if (!formData.topic || !formData.date) {
      toast.error("Please fill required fields");
      return;
    }
    
    if (editingId) {
      setSessions(sessions.map(s => s.id === editingId ? { ...formData, id: editingId } : s));
      setEditingId(null);
      toast.success("Session updated!");
    } else {
      setSessions([...sessions, { ...formData, id: Date.now() }]);
      toast.success("Session added!");
    }
    
    setIsAdding(false);
    setFormData({ subject: 'DBMS', topic: '', date: '', priority: 'Medium', status: 'Pending' });
  };

  const handleEdit = (session) => {
    setFormData(session);
    setEditingId(session.id);
    setIsAdding(true);
  };

  const handleDelete = (id) => {
    setSessions(sessions.filter(s => s.id !== id));
    toast.success("Session deleted");
  };

  const toggleStatus = (id) => {
    setSessions(sessions.map(s => {
      if (s.id === id) {
        const newStatus = s.status === 'Completed' ? 'Pending' : 'Completed';
        if (newStatus === 'Completed') toast.success("Task completed! 🎉");
        return { ...s, status: newStatus };
      }
      return s;
    }));
  };

  return (
    <div className="glass-card p-6 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-slate-800">Study Planner</h2>
        <button 
          onClick={() => { setIsAdding(true); setEditingId(null); setFormData({ subject: 'DBMS', topic: '', date: '', priority: 'Medium', status: 'Pending' }); }}
          className="px-4 py-2 bg-mentorBlue-600 hover:bg-mentorBlue-700 text-white rounded-xl font-medium transition-colors flex items-center gap-2"
        >
          <FiPlus /> Add Session
        </button>
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 p-4 border border-slate-200 rounded-xl bg-slate-50/50 flex flex-col gap-4 overflow-hidden"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Subject</label>
                <select 
                  value={formData.subject}
                  onChange={e => setFormData({...formData, subject: e.target.value})}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white outline-none focus:border-mentorBlue-400"
                >
                  {subjects.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Topic</label>
                <input 
                  type="text"
                  value={formData.topic}
                  onChange={e => setFormData({...formData, topic: e.target.value})}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white outline-none focus:border-mentorBlue-400"
                  placeholder="e.g. B-Trees"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Date</label>
                <input 
                  type="date"
                  value={formData.date}
                  onChange={e => setFormData({...formData, date: e.target.value})}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white outline-none focus:border-mentorBlue-400"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Priority</label>
                <select 
                  value={formData.priority}
                  onChange={e => setFormData({...formData, priority: e.target.value})}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white outline-none focus:border-mentorBlue-400"
                >
                  {priorities.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-2">
              <button 
                onClick={() => setIsAdding(false)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleSave}
                className="px-4 py-2 bg-mentorBlue-600 hover:bg-mentorBlue-700 text-white rounded-lg font-medium transition-colors"
              >
                Save Session
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-grow space-y-3 overflow-y-auto pr-2">
        {sessions.length === 0 ? (
          <div className="flex items-center justify-center h-40 text-slate-400">
            No study sessions planned. Click 'Add Session' to get started!
          </div>
        ) : (
          sessions.sort((a,b) => new Date(a.date) - new Date(b.date)).map((session) => (
            <motion.div 
              key={session.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`p-4 rounded-xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all ${
                session.status === 'Completed' ? 'bg-slate-50/50 border-transparent opacity-75' : 'bg-white border-slate-200 shadow-sm'
              }`}
            >
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => toggleStatus(session.id)}
                  className={`flex-shrink-0 w-6 h-6 rounded flex items-center justify-center transition-colors ${
                    session.status === 'Completed' ? 'bg-green-500 text-white' : 'bg-slate-100 border border-slate-300 text-transparent hover:border-mentorBlue-400 hover:text-mentorBlue-400'
                  }`}
                >
                  <FiCheck size={16} />
                </button>
                <div>
                  <h3 className={`font-semibold ${session.status === 'Completed' ? 'text-slate-400 line-through' : 'text-slate-800'}`}>
                    {session.topic}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded uppercase">{session.subject}</span>
                    <span className="text-xs text-slate-500">📅 {session.date}</span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${
                      session.priority === 'High' ? 'bg-red-100 text-red-600' :
                      session.priority === 'Medium' ? 'bg-orange-100 text-orange-600' :
                      'bg-blue-100 text-blue-600'
                    }`}>
                      {session.priority}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2 self-end md:self-auto">
                <button onClick={() => handleEdit(session)} className="p-2 text-slate-400 hover:text-mentorBlue-600 transition-colors" title="Edit">
                  <FiEdit2 />
                </button>
                <button onClick={() => handleDelete(session.id)} className="p-2 text-slate-400 hover:text-red-500 transition-colors" title="Delete">
                  <FiTrash2 />
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

export default StudyPlannerCard;
