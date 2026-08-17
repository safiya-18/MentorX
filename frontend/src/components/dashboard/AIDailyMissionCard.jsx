import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiTarget, FiRefreshCw, FiAlertCircle } from 'react-icons/fi';
import ReactMarkdown from 'react-markdown';
import toast from 'react-hot-toast';

const AIDailyMissionCard = ({ tasks }) => {
  const [mission, setMission] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasFetched, setHasFetched] = useState(false);

  const fetchMission = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // 1. Gather Context
      let profile = {};
      let sessions = [];
      try {
        const profileStr = localStorage.getItem('mentorxProfile');
        if (profileStr) profile = JSON.parse(profileStr);
        
        const sessionsStr = localStorage.getItem('studySessions');
        if (sessionsStr) sessions = JSON.parse(sessionsStr);
      } catch (e) {
        console.warn('Could not parse localStorage data for AI context', e);
      }

      const pendingTasks = tasks.filter(t => !t.completed).map(t => `${t.title} (${t.category})`).join(', ');
      
      const pendingSessions = sessions.filter(s => s.status !== 'Completed')
        .slice(0, 3)
        .map(s => `${s.subject}: ${s.topic} (${s.priority})`)
        .join(', ');

      const examDate = profile.examDate ? profile.examDate : 'Not set';

      if (!pendingTasks && !pendingSessions) {
        setMission('');
        setIsLoading(false);
        setHasFetched(true);
        return;
      }

      let promptText = `You are MentorX, an AI study mentor for a GATE aspirant. Analyze the supplied tasks, study sessions, and exam information. Select exactly ONE realistic study mission for today. The mission must be based only on the supplied data. Include an estimated duration and one short reason. Do not invent topics or tasks. Keep the response concise.
Data:
- Pending Tasks: ${pendingTasks || 'None'}
- High-Priority Sessions: ${pendingSessions || 'None'}
- Exam Date: ${examDate}`;

      if (promptText.length > 1800) {
         promptText = promptText.substring(0, 1800) + '...';
      }

      // 2. Fetch from Backend
      const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: promptText })
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      
      if (data.error) {
         throw new Error(data.error);
      }

      setMission(data.reply);
      setHasFetched(true);
    } catch (err) {
      console.error('Failed to fetch AI mission:', err);
      setError('Your AI mission is temporarily unavailable. Please try again.');
      toast.error('Could not load AI Mission');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let timeoutId;
    if (!hasFetched && tasks.length > 0) {
      timeoutId = setTimeout(() => {
        fetchMission();
      }, 1500);
    }
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const hasData = tasks.filter(t => !t.completed).length > 0 || (localStorage.getItem('studySessions') && JSON.parse(localStorage.getItem('studySessions')).filter(s => s.status !== 'Completed').length > 0);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="glass-card mb-6 p-5 bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-slate-800/90 dark:to-slate-900/90 border border-blue-100 dark:border-slate-700/80 shadow-md flex flex-col"
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-md font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <FiTarget className="text-red-500" />
          🎯 Today's AI Mission
        </h3>
        <button 
          onClick={fetchMission}
          disabled={isLoading || !hasData}
          className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-100 dark:hover:bg-slate-700/60 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Refresh Mission"
        >
          <FiRefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
          <span className="hidden sm:inline">Refresh Mission</span>
        </button>
      </div>

      <div className="flex-grow">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-4 text-slate-500 dark:text-slate-400">
            <div className="flex gap-1.5 mb-2">
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" />
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '0.2s' }} />
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '0.4s' }} />
            </div>
            <span className="text-xs font-medium">Generating your daily mission...</span>
          </div>
        ) : error ? (
          <div className="flex items-center gap-2 text-red-600 dark:text-red-400 bg-red-100/50 dark:bg-red-900/30 p-3 rounded-lg text-sm border border-red-200 dark:border-red-900/50">
            <FiAlertCircle className="shrink-0" size={16} />
            <p>{error}</p>
          </div>
        ) : mission ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="prose prose-sm dark:prose-invert max-w-none text-slate-700 dark:text-slate-200 font-medium leading-snug bg-white/60 dark:bg-slate-800 p-4 rounded-xl shadow-inner border border-white/40 dark:border-slate-700/50"
          >
            <ReactMarkdown>{mission}</ReactMarkdown>
          </motion.div>
        ) : (
          <div className="text-sm text-slate-500 dark:text-slate-400 py-3 text-center">
            Add a few study tasks or sessions and I'll create today's mission.
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default AIDailyMissionCard;
