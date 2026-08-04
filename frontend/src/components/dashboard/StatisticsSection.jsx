import React from 'react';
import { motion } from 'framer-motion';
import { FiCheckCircle, FiClock, FiList, FiTrendingUp } from 'react-icons/fi';

const StatisticsSection = ({ tasks }) => {
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.completed).length;
  const pendingTasks = totalTasks - completedTasks;
  const completionRate = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

  const stats = [
    { label: 'Total Tasks', value: totalTasks, icon: FiList, color: 'text-blue-500', bg: 'bg-blue-50' },
    { label: 'Completed', value: completedTasks, icon: FiCheckCircle, color: 'text-green-500', bg: 'bg-green-50' },
    { label: 'Pending', value: pendingTasks, icon: FiClock, color: 'text-orange-500', bg: 'bg-orange-50' },
    { label: 'Completion Rate', value: `${completionRate}%`, icon: FiTrendingUp, color: 'text-purple-500', bg: 'bg-purple-50' },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
    >
      {stats.map((stat, index) => (
        <motion.div 
          key={index}
          variants={itemVariants}
          className="glass-card p-5 flex items-center gap-4 hover:shadow-md transition-shadow"
        >
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.bg} ${stat.color}`}>
            <stat.icon size={24} />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-slate-800">{stat.value}</h3>
            <p className="text-sm font-medium text-slate-500">{stat.label}</p>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
};

export default StatisticsSection;
