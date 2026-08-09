import React from 'react';
import { motion } from 'framer-motion';
import { FiEdit3 } from 'react-icons/fi';
import { useFirestoreSingleton } from '../../hooks/useFirestoreSingleton';

const DailyReflectionCard = () => {
  const [reflection, setReflection] = useFirestoreSingleton('dailyReflection', 'dailyReflection', { text: '' });

  const handleChange = (e) => {
    setReflection({ text: e.target.value });
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
      className="glass-card p-6 h-full flex flex-col"
    >
      <div className="flex items-center gap-2 mb-4">
        <FiEdit3 className="text-mentorBlue-500" size={20} />
        <h2 className="text-lg font-semibold text-slate-800">Today's Reflection</h2>
      </div>
      
      <div className="flex-grow">
        <textarea 
          value={reflection.text !== undefined ? reflection.text : (typeof reflection === 'string' ? reflection : '')}
          onChange={handleChange}
          placeholder="What did you learn today?"
          className="w-full h-full min-h-[120px] p-4 bg-slate-50/50 border border-slate-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-mentorBlue-300 focus:border-transparent text-slate-700 text-sm transition-all"
        ></textarea>
      </div>
    </motion.div>
  );
};

export default DailyReflectionCard;
