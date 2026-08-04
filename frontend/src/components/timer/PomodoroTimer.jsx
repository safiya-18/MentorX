import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { FiPlay, FiPause, FiRefreshCw, FiCoffee, FiMonitor } from 'react-icons/fi';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import toast from 'react-hot-toast';

const FOCUS_TIME = 25 * 60;
const BREAK_TIME = 5 * 60;

const PomodoroTimer = () => {
  const [timerState, setTimerState] = useLocalStorage('pomodoroState', {
    timeLeft: FOCUS_TIME,
    mode: 'focus', // 'focus' | 'break'
    isActive: false,
  });

  // Local state for interval to prevent re-renders on every tick reading from local storage
  const [timeLeft, setTimeLeft] = useState(timerState.timeLeft);
  const [isActive, setIsActive] = useState(timerState.isActive);
  const [mode, setMode] = useState(timerState.mode);

  const audioRef = useRef(null);

  useEffect(() => {
    // Sync back to local storage periodically or on change
    setTimerState({ timeLeft, mode, isActive });
  }, [timeLeft, mode, isActive, setTimerState]);

  useEffect(() => {
    let interval = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (isActive && timeLeft === 0) {
      clearInterval(interval);
      setIsActive(false);
      handleComplete();
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const handleComplete = () => {
    if (audioRef.current) {
      audioRef.current.play().catch(e => console.log('Audio play failed:', e));
    }
    
    if (mode === 'focus') {
      toast.success("Focus session complete! Time for a break.", { icon: '🎯' });
      setMode('break');
      setTimeLeft(BREAK_TIME);
    } else {
      toast.success("Break is over! Back to work.", { icon: '☕' });
      setMode('focus');
      setTimeLeft(FOCUS_TIME);
    }
  };

  const toggleTimer = () => setIsActive(!isActive);

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(mode === 'focus' ? FOCUS_TIME : BREAK_TIME);
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const totalTime = mode === 'focus' ? FOCUS_TIME : BREAK_TIME;
  const progress = ((totalTime - timeLeft) / totalTime) * 100;
  
  // Circular progress math
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass-card p-6 flex flex-col items-center justify-center text-center h-full relative"
    >
      <audio ref={audioRef} src="https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3" preload="auto" />
      
      <div className="flex gap-4 mb-4">
        <button 
          onClick={() => { setMode('focus'); setTimeLeft(FOCUS_TIME); setIsActive(false); }}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors flex items-center gap-2 ${mode === 'focus' ? 'bg-mentorBlue-500 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
        >
          <FiMonitor /> Focus
        </button>
        <button 
          onClick={() => { setMode('break'); setTimeLeft(BREAK_TIME); setIsActive(false); }}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors flex items-center gap-2 ${mode === 'break' ? 'bg-orange-500 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
        >
          <FiCoffee /> Break
        </button>
      </div>

      <div className="relative w-40 h-40 flex items-center justify-center mb-6">
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="80"
            cy="80"
            r={radius}
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            className="text-slate-100"
          />
          <motion.circle
            cx="80"
            cy="80"
            r={radius}
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            strokeDasharray={circumference}
            animate={{ strokeDashoffset }}
            transition={{ duration: 0.5 }}
            className={mode === 'focus' ? 'text-mentorBlue-500' : 'text-orange-500'}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-4xl font-bold text-slate-800 tracking-tight">
            {formatTime(timeLeft)}
          </span>
        </div>
      </div>

      <div className="flex gap-4">
        <button 
          onClick={toggleTimer}
          className={`w-12 h-12 rounded-full flex items-center justify-center text-white shadow-lg transition-transform hover:scale-105 ${isActive ? 'bg-orange-500 hover:bg-orange-600' : 'bg-mentorBlue-600 hover:bg-mentorBlue-700'}`}
        >
          {isActive ? <FiPause size={24} /> : <FiPlay size={24} className="ml-1" />}
        </button>
        <button 
          onClick={resetTimer}
          className="w-12 h-12 rounded-full flex items-center justify-center bg-white text-slate-500 border border-slate-200 shadow-sm transition-transform hover:scale-105 hover:text-slate-700"
        >
          <FiRefreshCw size={22} />
        </button>
      </div>
    </motion.div>
  );
};

export default PomodoroTimer;
