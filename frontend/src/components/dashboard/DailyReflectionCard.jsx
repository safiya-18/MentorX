import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiEdit3 } from 'react-icons/fi';

const DailyReflectionCard = () => {
  const [reflection, setReflection] = useState("");

  useEffect(() => {
    const savedReflection = localStorage.getItem('dailyReflection');
    if (savedReflection) {
      setReflection(savedReflection);
    }
  }, []);

  const handleChange = (e) => {
    const val = e.target.value;
    setReflection(val);
    localStorage.setItem('dailyReflection', val);
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
          value={reflection}
          onChange={handleChange}
          placeholder="What did you learn today?"
          className="w-full h-full min-h-[120px] p-4 bg-slate-50/50 border border-slate-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-mentorBlue-300 focus:border-transparent text-slate-700 text-sm transition-all"
        ></textarea>
      </div>
    </motion.div>
  );
};

export default DailyReflectionCard;
