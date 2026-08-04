import React from 'react';
import { motion } from 'framer-motion';
import { FiBookOpen } from 'react-icons/fi';

const subjects = [
  { name: 'DBMS', topicsCompleted: 12, totalTopics: 20, color: 'bg-blue-500' },
  { name: 'Operating Systems', topicsCompleted: 8, totalTopics: 15, color: 'bg-green-500' },
  { name: 'Computer Networks', topicsCompleted: 14, totalTopics: 25, color: 'bg-purple-500' },
  { name: 'DSA', topicsCompleted: 30, totalTopics: 50, color: 'bg-orange-500' },
  { name: 'Aptitude', topicsCompleted: 5, totalTopics: 10, color: 'bg-pink-500' },
];

const SubjectProgressCard = () => {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass-card p-6 h-full flex flex-col"
    >
      <div className="flex items-center gap-2 mb-6">
        <FiBookOpen className="text-mentorBlue-500" size={20} />
        <h2 className="text-lg font-semibold text-slate-800">Subject Progress</h2>
      </div>

      <div className="flex-grow space-y-4">
        {subjects.map((subject, index) => {
          const percentage = Math.round((subject.topicsCompleted / subject.totalTopics) * 100);
          return (
            <div key={index} className="space-y-1.5">
              <div className="flex justify-between items-center text-sm">
                <span className="font-medium text-slate-700">{subject.name}</span>
                <span className="text-slate-500 font-medium">
                  {subject.topicsCompleted}/{subject.totalTopics} ({percentage}%)
                </span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 1, delay: 0.2 + (index * 0.1) }}
                  className={`h-full rounded-full ${subject.color}`}
                />
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default SubjectProgressCard;
