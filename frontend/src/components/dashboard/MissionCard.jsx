import React from 'react';
import { motion } from 'framer-motion';
import { FiCheckCircle, FiCircle, FiList } from 'react-icons/fi';

const MissionCard = ({ tasks, toggleTask }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="glass-card p-6 h-full flex flex-col"
    >
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
          <FiList className="text-mentorBlue-500" /> Today's Mission
        </h2>
        <span className="text-xs font-medium text-slate-500">
          {tasks.filter(t => t.completed).length} / {tasks.length} Done
        </span>
      </div>

      <div className="flex-grow space-y-3">
        {tasks.map((task, index) => (
          <motion.div 
            key={task.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + (index * 0.1) }}
            className={`flex items-start gap-3 p-3 rounded-xl border transition-all ${
              task.completed ? 'bg-slate-50/50 border-transparent' : 'bg-white border-slate-100 hover:border-mentorBlue-200 hover:shadow-sm'
            }`}
          >
            <button 
              onClick={() => toggleTask(task.id)}
              className={`mt-0.5 flex-shrink-0 transition-colors ${
                task.completed ? 'text-green-500' : 'text-slate-300 hover:text-mentorBlue-400'
              }`}
            >
              {task.completed ? <FiCheckCircle size={20} /> : <FiCircle size={20} />}
            </button>
            
            <div>
              <p className={`text-sm font-medium transition-colors ${
                task.completed ? 'text-slate-400 line-through' : 'text-slate-700'
              }`}>
                {task.title}
              </p>
              <span className={`text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded ${
                task.category === 'Study' ? 'bg-blue-100 text-blue-600' :
                task.category === 'Practice' ? 'bg-orange-100 text-orange-600' :
                'bg-purple-100 text-purple-600'
              } mt-1.5 inline-block ${task.completed ? 'opacity-50' : ''}`}>
                {task.category}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
      
      <button className="mt-4 w-full py-2.5 rounded-lg border border-dashed border-slate-300 text-slate-500 text-sm font-medium hover:border-mentorBlue-400 hover:text-mentorBlue-600 transition-colors flex items-center justify-center gap-2">
        + Add New Task
      </button>
    </motion.div>
  );
};

export default MissionCard;
