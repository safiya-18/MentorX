import React from 'react';
import { motion } from 'framer-motion';
import { FiClock } from 'react-icons/fi';

const CountdownCard = () => {
  // Placeholder target date (e.g., GATE 2027: Feb 6, 2027)
  const daysLeft = 187; // Placeholder

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="glass-card p-6 h-full flex flex-col justify-between bg-gradient-to-br from-white to-slate-50"
    >
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
          <FiClock className="text-mentorBlue-500" /> GATE 2027 Countdown
        </h2>
        <span className="text-xs font-medium bg-mentorBlue-100 text-mentorBlue-700 px-2 py-1 rounded-md">
          Target
        </span>
      </div>
      
      <div className="flex-grow flex flex-col items-center justify-center">
        <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-mentorBlue-600 to-mentorBlue-400 mb-2">
          {daysLeft}
        </div>
        <p className="text-slate-500 font-medium tracking-wide uppercase text-sm">Days Remaining</p>
      </div>
      
      <div className="mt-6">
        <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: '60%' }} // Placeholder progress
            transition={{ duration: 1, delay: 0.5 }}
            className="bg-mentorBlue-500 h-full rounded-full"
          />
        </div>
        <p className="text-xs text-slate-400 mt-2 text-center">Keep pushing! Every day counts.</p>
      </div>
    </motion.div>
  );
};

export default CountdownCard;
