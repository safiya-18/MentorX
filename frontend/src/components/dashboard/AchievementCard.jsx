import React from 'react';
import { motion } from 'framer-motion';
import { FiAward } from 'react-icons/fi';
import { useLocalStorage } from '../../hooks/useLocalStorage';

const achievementsList = [
  { id: 'streak_7', title: '7 Day Streak', icon: '🔥', description: 'Study for 7 consecutive days' },
  { id: 'tasks_50', title: '50 Tasks Completed', icon: '📚', description: 'Complete 50 tasks in your mission' },
  { id: 'pomodoro_1', title: 'First Pomodoro', icon: '🎯', description: 'Complete your first focus session' },
  { id: 'hours_100', title: '100 Study Hours', icon: '🏆', description: 'Accumulate 100 hours of study time' },
];

const AchievementCard = () => {
  const [unlocked, setUnlocked] = useLocalStorage('achievements', ['pomodoro_1']);

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass-card p-6 h-full flex flex-col"
    >
      <div className="flex items-center gap-2 mb-4">
        <FiAward className="text-mentorBlue-500" size={24} />
        <h2 className="text-lg font-semibold text-slate-800">Achievements</h2>
      </div>

      <div className="grid grid-cols-2 gap-3 flex-grow">
        {achievementsList.map((achievement, index) => {
          const isUnlocked = unlocked.includes(achievement.id);
          return (
            <motion.div 
              key={achievement.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`p-3 rounded-xl border flex flex-col items-center justify-center text-center gap-2 transition-all ${
                isUnlocked ? 'bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-200 shadow-sm' : 'bg-slate-50/50 border-slate-100 opacity-50 grayscale'
              }`}
            >
              <span className="text-3xl">{achievement.icon}</span>
              <div>
                <h3 className={`text-xs font-bold ${isUnlocked ? 'text-amber-800' : 'text-slate-500'}`}>
                  {achievement.title}
                </h3>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default AchievementCard;
