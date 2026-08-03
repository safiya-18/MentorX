import React from 'react';
import { motion } from 'framer-motion';

const HeroSection = () => {
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="glass-card p-8 flex flex-col md:flex-row justify-between items-start md:items-center bg-gradient-to-br from-white/90 to-mentorBlue-50/50"
    >
      <div>
        <p className="text-mentorBlue-600 font-medium text-sm mb-1">{currentDate}</p>
        <h1 className="text-3xl md:text-4xl font-bold text-slate-800 tracking-tight mb-2">
          Good Evening, Safiya <span className="inline-block origin-[70%_70%] animate-[wave_2s_ease-in-out_infinite]">👋</span>
        </h1>
        <p className="text-slate-500 max-w-lg">
          "The future depends on what you do today." — Mahatma Gandhi
        </p>
      </div>
      
      <div className="mt-6 md:mt-0 hidden md:block">
        <div className="bg-white/80 p-4 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-mentorBlue-100 rounded-full flex items-center justify-center text-mentorBlue-600 font-bold text-xl">
            🔥
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Current Streak</p>
            <p className="text-2xl font-bold text-slate-800">14 Days</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default HeroSection;
