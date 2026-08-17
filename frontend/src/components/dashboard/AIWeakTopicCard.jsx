import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiAlertTriangle, FiRefreshCw, FiAlertCircle, FiBook } from 'react-icons/fi';
import ReactMarkdown from 'react-markdown';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const AIWeakTopicCard = ({ tasks }) => {
  const navigate = useNavigate();
  const [analysis, setAnalysis] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasFetched, setHasFetched] = useState(false);

  const fetchWeakTopic = async () => {
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

      // Compact context construction
      const pendingTasks = tasks.filter(t => !t.completed).map(t => `${t.title} (${t.category})`).join(', ');
      const completedTasks = tasks.filter(t => t.completed).map(t => `${t.title}`).join(', ');
      
      const pendingSessions = sessions.filter(s => s.status !== 'Completed')
        .map(s => `${s.subject}: ${s.topic} [Priority: ${s.priority}, Date: ${s.date}]`)
        .join('; ');

      const completedSessions = sessions.filter(s => s.status === 'Completed')
        .map(s => `${s.subject}: ${s.topic}`)
        .join(', ');

      const examDate = profile.examDate ? profile.examDate : 'Not set';

      // Check if there is enough meaningful data
      const hasMeaningfulData = pendingTasks || pendingSessions || completedTasks || completedSessions;

      if (!hasMeaningfulData) {
        setAnalysis('');
        setIsLoading(false);
        setHasFetched(true);
        return;
      }

      let promptText = `You are MentorX, an AI study mentor for a GATE aspirant.
Analyze the supplied tasks and study sessions.
Identify exactly ONE topic that currently needs the most attention based only on the supplied evidence.
Prefer topics that are repeatedly pending, high priority and pending, approaching their study date, insufficiently completed, or clearly behind.
Do not invent scores, study hours, or performance data. If there isn't enough data to determine a weak topic, state that there is insufficient data.
Return:
1. Topic
2. Why it needs attention
3. One actionable recommendation
Keep the response concise.

Data:
- Pending Tasks: ${pendingTasks || 'None'}
- Completed Tasks: ${completedTasks || 'None'}
- Pending Sessions: ${pendingSessions || 'None'}
- Completed Sessions: ${completedSessions || 'None'}
- Exam Date: ${examDate}`;

      if (promptText.length > 1900) {
         promptText = promptText.substring(0, 1900) + '...';
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

      setAnalysis(data.reply);
      setHasFetched(true);
    } catch (err) {
      console.error('Failed to fetch AI weak topic analysis:', err);
      setError('AI topic analysis is temporarily unavailable. Please try again.');
      toast.error('Could not load Topic Analysis');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let timeoutId;
    let fallbackTimeoutId;

    if (!hasFetched) {
      const hasData = tasks.length > 0 || localStorage.getItem('studySessions');
      if (hasData) {
        timeoutId = setTimeout(() => {
          fetchWeakTopic();
        }, 3000);
      } else {
        fallbackTimeoutId = setTimeout(() => {
          setHasFetched(true);
        }, 0);
      }
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      if (fallbackTimeoutId) clearTimeout(fallbackTimeoutId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const hasData = tasks.length > 0 || (localStorage.getItem('studySessions') && JSON.parse(localStorage.getItem('studySessions')).length > 0);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="glass-card p-6 flex flex-col h-full bg-white/70 dark:bg-slate-800/80 border border-red-100 dark:border-red-900/30 shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="flex justify-between items-center mb-4 border-b border-slate-100 dark:border-slate-700/50 pb-3">
        <h3 className="text-md font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <FiAlertTriangle className="text-orange-500 dark:text-orange-400" />
          🧠 Topic Needing Attention
        </h3>
        <button 
          onClick={fetchWeakTopic}
          disabled={isLoading || !hasData}
          className="flex items-center gap-2 px-2 py-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-slate-700/60 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Refresh Analysis"
        >
          <FiRefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>

      <div className="flex-grow">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-full min-h-[120px] text-slate-500 dark:text-slate-400">
            <div className="flex gap-1.5 mb-3">
              <div className="w-2 h-2 rounded-full bg-orange-400 animate-bounce" />
              <div className="w-2 h-2 rounded-full bg-orange-400 animate-bounce" style={{ animationDelay: '0.2s' }} />
              <div className="w-2 h-2 rounded-full bg-orange-400 animate-bounce" style={{ animationDelay: '0.4s' }} />
            </div>
            <span className="text-xs font-medium">Analyzing topic performance...</span>
          </div>
        ) : error ? (
          <div className="flex items-center gap-2 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg text-sm border border-red-100 dark:border-red-900/30">
            <FiAlertCircle className="shrink-0" size={16} />
            <p>{error}</p>
          </div>
        ) : analysis ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col h-full"
          >
            <div className="prose prose-sm dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 font-medium leading-relaxed bg-orange-50/50 dark:bg-slate-900/50 p-4 rounded-xl border border-orange-100/50 dark:border-slate-700/50 mb-4">
              <ReactMarkdown>{analysis}</ReactMarkdown>
            </div>
            
            <button
              onClick={() => {
                let extractedTopic = "";
                const lines = analysis.split('\n');
                const topicLine = lines.find(l => l.toLowerCase().includes('topic'));
                if (topicLine) {
                  extractedTopic = topicLine.replace(/^(?:\d+\.|\*\*|Topic:|\s|-)+/ig, '').replace(/\*\*$/g, '').trim();
                }
                
                if (extractedTopic) {
                  navigate(`/revision?topic=${encodeURIComponent(extractedTopic)}`);
                } else {
                  navigate('/revision');
                }
              }}
              className="mt-auto w-full py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-bold transition-colors flex items-center justify-center gap-2"
            >
              <FiBook /> Revise Weak Topic
            </button>
          </motion.div>
        ) : (
          <div className="flex items-center justify-center h-full min-h-[120px] text-sm text-slate-500 dark:text-slate-400 italic text-center p-4">
            No clear weak topic yet. Keep adding study sessions and tasks so MentorX can identify where you need more attention.
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default AIWeakTopicCard;
