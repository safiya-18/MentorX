import React from 'react';
import { motion } from 'framer-motion';
import { FiClock, FiTarget, FiCheckCircle, FiTrendingUp } from 'react-icons/fi';

const AnalyticsCards = () => {
  const stats = [
    { label: 'Total Study Hours', value: '124.5', icon: FiClock, color: 'text-blue-500', bg: 'bg-blue-50' },
    { label: 'Focus Sessions', value: '86', icon: FiTarget, color: 'text-orange-500', bg: 'bg-orange-50' },
    { label: 'Tasks Completed', value: '312', icon: FiCheckCircle, color: 'text-green-500', bg: 'bg-green-50' },
    { label: 'Productivity Score', value: '94%', icon: FiTrendingUp, color: 'text-purple-500', bg: 'bg-purple-50' },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <motion.div 
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="glass-card p-6 flex flex-col justify-between"
        >
          <div className="flex justify-between items-start mb-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.bg} ${stat.color}`}>
              <stat.icon size={24} />
            </div>
          </div>
          <div>
            <h3 className="text-3xl font-bold text-slate-800">{stat.value}</h3>
            <p className="text-sm font-medium text-slate-500">{stat.label}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default AnalyticsCards;
