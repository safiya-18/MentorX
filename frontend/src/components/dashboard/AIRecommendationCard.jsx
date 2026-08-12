import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiCpu, FiRefreshCw, FiAlertCircle } from 'react-icons/fi';
import ReactMarkdown from 'react-markdown';
import toast from 'react-hot-toast';

const AIRecommendationCard = ({ tasks }) => {
  const [recommendation, setRecommendation] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasFetched, setHasFetched] = useState(false);

  const fetchRecommendation = async () => {
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

      // 2. Build a compact summary string
      const pendingTasks = tasks.filter(t => !t.completed).map(t => `${t.title} (${t.category})`).join(', ');
      const completedTasks = tasks.filter(t => t.completed).map(t => t.title).join(', ');
      
      const pendingSessions = sessions.filter(s => s.status !== 'Completed')
        .slice(0, 3)
        .map(s => `${s.subject}: ${s.topic} (${s.priority})`)
        .join(', ');

      const examDate = profile.examDate ? profile.examDate : 'Not set';

      let promptText = `You are the MentorX AI Study Mentor.
Analyze this data and recommend ONE clear next study action with a short reason.
Do not invent tasks not listed below. Keep response under 3 sentences.
Data:
- Pending Tasks: ${pendingTasks || 'None'}
- Completed Tasks: ${completedTasks || 'None'}
- Upcoming Sessions: ${pendingSessions || 'None'}
- Exam Date: ${examDate}`;

      // 3. Prevent extremely large payloads (backend limit is 2000 chars)
      if (promptText.length > 1800) {
         promptText = promptText.substring(0, 1800) + '...';
      }

      // 4. Fetch from Backend
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

      setRecommendation(data.reply);
      setHasFetched(true);
    } catch (err) {
      console.error('Failed to fetch AI insight:', err);
      setError('AI insight is temporarily unavailable. Please try again.');
      toast.error('Could not load AI Recommendation');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Only fetch automatically on the first mount if we have tasks or sessions
    if (!hasFetched && tasks.length > 0) {
      fetchRecommendation();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="glass-card p-6 flex flex-col mb-6 bg-white/70 dark:bg-slate-800/80 border border-slate-200/50 dark:border-slate-700/50 shadow-sm"
    >
      <div className="flex justify-between items-center mb-4 border-b border-slate-100 dark:border-slate-700/50 pb-3">
        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <FiCpu className="text-mentorBlue-500 dark:text-mentorBlue-400" />
          🤖 AI Study Insight
        </h2>
        <button 
          onClick={fetchRecommendation}
          disabled={isLoading}
          className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-mentorBlue-600 dark:hover:text-mentorBlue-400 hover:bg-mentorBlue-50 dark:hover:bg-slate-700/50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Refresh Insight"
        >
          <FiRefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>

      <div className="flex-grow">
        {isLoading ? (
          <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400 py-4">
            <div className="flex gap-1">
              <div className="w-2 h-2 rounded-full bg-mentorBlue-400 animate-bounce" />
              <div className="w-2 h-2 rounded-full bg-mentorBlue-400 animate-bounce" style={{ animationDelay: '0.2s' }} />
              <div className="w-2 h-2 rounded-full bg-mentorBlue-400 animate-bounce" style={{ animationDelay: '0.4s' }} />
            </div>
            <span className="text-sm font-medium">Analyzing your study profile...</span>
          </div>
        ) : error ? (
          <div className="flex items-center gap-2 text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-4 rounded-xl text-sm border border-red-100 dark:border-red-900/30">
            <FiAlertCircle className="shrink-0" size={18} />
            <p>{error}</p>
          </div>
        ) : recommendation ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="prose prose-sm dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 font-medium leading-relaxed bg-mentorBlue-50/50 dark:bg-slate-900/50 p-4 rounded-xl border border-mentorBlue-100 dark:border-slate-700/50"
          >
            <ReactMarkdown>{recommendation}</ReactMarkdown>
          </motion.div>
        ) : (
          <div className="text-sm text-slate-500 dark:text-slate-400 py-4 italic text-center">
            Insufficient data to generate an insight. Add some tasks or study sessions!
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default AIRecommendationCard;
