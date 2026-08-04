import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiTarget, FiCheck } from 'react-icons/fi';
import Confetti from 'react-confetti';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import toast from 'react-hot-toast';

const DailyGoalCard = () => {
  const [goal, setGoal] = useLocalStorage('dailyGoal', { text: '', completed: false, date: new Date().toDateString() });
  const [inputValue, setInputValue] = useState(goal.text);
  const [showConfetti, setShowConfetti] = useState(false);

  // Reset goal if it's a new day
  if (goal.date !== new Date().toDateString()) {
    setGoal({ text: '', completed: false, date: new Date().toDateString() });
    setInputValue('');
  }

  const handleSetGoal = () => {
    if (inputValue.trim()) {
      setGoal({ text: inputValue, completed: false, date: new Date().toDateString() });
      toast.success("Daily goal set!");
    }
  };

  const handleComplete = () => {
    setGoal({ ...goal, completed: true });
    setShowConfetti(true);
    toast.success("Goal completed! Amazing work!");
    setTimeout(() => setShowConfetti(false), 5000);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass-card p-6 relative overflow-hidden h-full flex flex-col"
    >
      {showConfetti && <div className="absolute inset-0 pointer-events-none z-50"><Confetti width={400} height={300} recycle={false} /></div>}
      
      <div className="flex items-center gap-2 mb-4">
        <FiTarget className="text-mentorBlue-500" size={24} />
        <h2 className="text-lg font-semibold text-slate-800">Today's Goal</h2>
      </div>

      {!goal.text ? (
        <div className="flex flex-col gap-3 mt-4">
          <input 
            type="text" 
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="What's your main focus today?"
            className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-mentorBlue-400 focus:ring-1 focus:ring-mentorBlue-400 bg-white/50"
          />
          <button 
            onClick={handleSetGoal}
            className="w-full py-2 bg-mentorBlue-600 hover:bg-mentorBlue-700 text-white rounded-xl font-medium transition-colors"
          >
            Set Goal
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center flex-grow text-center gap-4">
          <p className={`text-lg font-medium ${goal.completed ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
            {goal.text}
          </p>
          {!goal.completed ? (
            <button 
              onClick={handleComplete}
              className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-full font-medium flex items-center gap-2 transition-transform hover:scale-105 shadow-md"
            >
              <FiCheck /> Complete Goal
            </button>
          ) : (
            <div className="text-green-500 font-semibold flex items-center gap-2">
              <FiCheck size={24} /> Completed!
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
};

export default DailyGoalCard;
