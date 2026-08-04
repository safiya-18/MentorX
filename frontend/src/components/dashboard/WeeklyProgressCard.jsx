import React from 'react';
import { motion } from 'framer-motion';
import { FiTrendingUp } from 'react-icons/fi';

const WeeklyProgressCard = ({ tasks }) => {
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.completed).length;
  const progressPercentage = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="glass-card p-6 h-full flex flex-col"
    >
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
          <FiTrendingUp className="text-mentorBlue-500" /> Weekly Progress
        </h2>
        <span className="text-2xl font-bold text-mentorBlue-600">
          {progressPercentage}%
        </span>
      </div>

      <div className="flex-grow flex flex-col justify-center gap-4">
        <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-gradient-to-r from-mentorBlue-400 to-mentorBlue-600 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </div>
        
        <p className="text-sm text-slate-500 text-center">
          {completedTasks} out of {totalTasks} tasks completed this week.
          {progressPercentage === 100 ? ' Great job!' : ' Keep going!'}
        </p>
      </div>
    </motion.div>
  );
};

export default WeeklyProgressCard;
