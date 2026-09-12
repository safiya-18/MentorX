import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiRefreshCw, FiCalendar, FiClock, FiTarget, FiAlertCircle, FiBookOpen, FiActivity } from 'react-icons/fi';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import toast from 'react-hot-toast';

const AIStudyPlanner = () => {
  const [studyPlan, setStudyPlan] = useLocalStorage('aiStudyPlan', null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const generatePlan = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Gather local data
      let profile = {};
      let sessions = [];
      let analytics = null;

      try {
        const profileStr = localStorage.getItem('mentorxProfile');
        if (profileStr) profile = JSON.parse(profileStr);
        
        const sessionsStr = localStorage.getItem('studySessions');
        if (sessionsStr) sessions = JSON.parse(sessionsStr);

        const analyticsStr = localStorage.getItem('aiAnalyticsReport');
        if (analyticsStr) analytics = JSON.parse(analyticsStr);
      } catch (e) {
        console.warn('Could not parse localStorage data', e);
      }

      const pendingSessions = sessions.filter(s => s.status !== 'Completed');
      const completedSessions = sessions.filter(s => s.status === 'Completed');

      let contextStr = `Student Profile:\n- Target Exam: ${profile.targetExam || 'GATE CSE'}\n- Exam Date: ${profile.examDate || 'Not Set'}\n`;

      if (analytics && analytics.topicPerformance) {
        const weak = analytics.topicPerformance.filter(t => t.status === 'Weak');
        if (weak.length > 0) {
          contextStr += `\nEmpirical Weak Topics (Must Prioritize):\n`;
          weak.forEach(w => {
            contextStr += `- ${w.topic} (Accuracy: ${w.accuracy})\n`;
          });
        }
      }

      if (pendingSessions.length > 0) {
        contextStr += `\nPending Planner Tasks:\n`;
        pendingSessions.slice(0, 10).forEach(s => {
          contextStr += `- ${s.subject}: ${s.topic} (Priority: ${s.priority})\n`;
        });
      }

      if (completedSessions.length > 0) {
        contextStr += `\nRecently Completed:\n`;
        completedSessions.slice(-5).forEach(s => {
          contextStr += `- ${s.subject}: ${s.topic}\n`;
        });
      }

      const promptText = `You are MentorX, an AI study planner for a GATE CSE aspirant.
Analyze the following student data and generate a personalized daily study plan.

Data:
${contextStr}

Your task is to generate a comprehensive AI Study Plan.
1. Identify Today's Priorities. Include suggested study duration and priority level.
2. Provide Revision Recommendations based on completed work or weak topics.
3. Provide Practice Recommendations.
4. Include a short reason for EACH recommendation.

You MUST return ONLY valid JSON in the exact structure below, with no markdown formatting or extra text outside the JSON:
{
  "overview": "Short motivational summary and strategy for today.",
  "todayPriorities": [
    {
      "topic": "Topic Name",
      "priority": "High | Medium | Low",
      "duration": "e.g. 2 hours",
      "reason": "Why study this today?"
    }
  ],
  "revisionRecommendations": [
    {
      "topic": "Topic Name",
      "reason": "Why revise this?"
    }
  ],
  "practiceRecommendations": [
    {
      "topic": "Topic Name",
      "reason": "Why practice this?"
    }
  ]
}

Return raw JSON only. Do not invent student statistics. Use the provided data to make realistic recommendations.`;

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
      if (data.error) throw new Error(data.error);

      let rawJson = data.reply.trim();
      if (rawJson.startsWith('```json')) {
        rawJson = rawJson.replace(/^```json/, '').replace(/```$/, '').trim();
      } else if (rawJson.startsWith('```')) {
        rawJson = rawJson.replace(/^```/, '').replace(/```$/, '').trim();
      }

      const parsed = JSON.parse(rawJson);

      // Validate structure
      if (
        !parsed.overview || 
        !Array.isArray(parsed.todayPriorities) || 
        !Array.isArray(parsed.revisionRecommendations) || 
        !Array.isArray(parsed.practiceRecommendations)
      ) {
        throw new Error("Invalid AI response structure.");
      }

      setStudyPlan(parsed);
      toast.success('Study plan generated!');
    } catch (err) {
      console.error(err);
      setError(err.message || 'Could not generate study plan at this time.');
      toast.error('Failed to generate AI plan.');
    } finally {
      setIsLoading(false);
    }
  };

  const PriorityBadge = ({ priority }) => {
    let p = String(priority).replace(/[^A-Za-z]/g, '');
    const colors = {
      High: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300 border-red-200 dark:border-red-800/50',
      Medium: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300 border-orange-200 dark:border-orange-800/50',
      Low: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 border-blue-200 dark:border-blue-800/50',
    };
    return (
      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${colors[p] || colors.Medium} uppercase`}>
        {p}
      </span>
    );
  };

  return (
    <div className="glass-card p-6 h-full flex flex-col bg-white/60 dark:bg-slate-800/80 border border-slate-200/50 dark:border-slate-700/50 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50 flex items-center gap-2">
            <span>✨</span> AI Study Planner
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
            Data-driven personalized daily plan.
          </p>
        </div>
        <button
          onClick={generatePlan}
          disabled={isLoading}
          className="px-4 py-2 bg-mentorBlue-600 hover:bg-mentorBlue-700 text-white rounded-xl font-medium transition-colors disabled:opacity-50 flex items-center gap-2 shadow-sm"
        >
          {isLoading ? <FiRefreshCw className="animate-spin" /> : <FiCalendar />}
          <span className="hidden sm:inline">{studyPlan ? 'Regenerate Plan' : 'Generate Plan'}</span>
        </button>
      </div>

      {error && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 mb-4 bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-900/30 rounded-xl flex items-center gap-3 text-rose-800 dark:text-rose-200"
        >
          <FiAlertCircle size={20} className="shrink-0" />
          <p className="text-sm font-medium">{error}</p>
        </motion.div>
      )}

      {isLoading && (
        <div className="flex-grow flex flex-col items-center justify-center text-slate-600 dark:text-slate-300 py-12">
          <div className="flex gap-2 mb-4">
            <div className="w-3 h-3 rounded-full bg-mentorBlue-500 animate-bounce" />
            <div className="w-3 h-3 rounded-full bg-mentorBlue-500 animate-bounce" style={{ animationDelay: '0.2s' }} />
            <div className="w-3 h-3 rounded-full bg-mentorBlue-500 animate-bounce" style={{ animationDelay: '0.4s' }} />
          </div>
          <p className="font-semibold text-lg text-slate-800 dark:text-slate-200">Analyzing your study data...</p>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Building a personalized schedule for today.</p>
        </div>
      )}

      {!isLoading && !studyPlan && !error && (
        <div className="flex-grow flex flex-col items-center justify-center text-slate-500 py-12 text-center">
          <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4 border border-slate-200 dark:border-slate-700">
            <FiCalendar size={28} className="text-slate-400" />
          </div>
          <h3 className="text-lg font-bold text-slate-700 dark:text-slate-200 mb-2">No Plan Generated</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm">
            Let MentorX analyze your recent performance, pending sessions, and weak topics to craft the perfect daily study plan.
          </p>
        </div>
      )}

      {!isLoading && studyPlan && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex-grow space-y-6 overflow-y-auto pr-2"
        >
          <div className="p-4 bg-mentorBlue-50 dark:bg-mentorBlue-900/20 border border-mentorBlue-100 dark:border-mentorBlue-800/30 rounded-xl">
            <h3 className="font-bold text-mentorBlue-900 dark:text-mentorBlue-300 mb-1 flex items-center gap-2">
              <FiTarget /> Today's Overview
            </h3>
            <p className="text-sm text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
              {studyPlan.overview}
            </p>
          </div>

          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider mb-3 flex items-center gap-2">
              <FiClock className="text-mentorBlue-500" /> Priorities
            </h3>
            <div className="space-y-3">
              {studyPlan.todayPriorities.map((item, idx) => (
                <div key={idx} className="p-4 bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm">
                  <div className="flex justify-between items-start mb-2 gap-2">
                    <h4 className="font-bold text-slate-900 dark:text-slate-100 leading-tight">
                      {item.topic}
                    </h4>
                    <PriorityBadge priority={item.priority} />
                  </div>
                  <div className="text-xs font-semibold text-mentorBlue-600 dark:text-mentorBlue-400 mb-2">
                    Est. Duration: {item.duration}
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">Reason:</span> {item.reason}
                  </p>
                </div>
              ))}
              {studyPlan.todayPriorities.length === 0 && (
                <p className="text-sm text-slate-500 italic">No specific priorities suggested for today.</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider mb-3 flex items-center gap-2">
                <FiBookOpen className="text-green-500" /> Revision
              </h3>
              <div className="space-y-3">
                {studyPlan.revisionRecommendations.map((item, idx) => (
                  <div key={idx} className="p-3 bg-green-50/50 dark:bg-green-900/10 border border-green-100 dark:border-green-800/30 rounded-lg">
                    <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm mb-1">{item.topic}</h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400">{item.reason}</p>
                  </div>
                ))}
                {studyPlan.revisionRecommendations.length === 0 && (
                  <p className="text-sm text-slate-500 italic">No revision recommended right now.</p>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider mb-3 flex items-center gap-2">
                <FiActivity className="text-orange-500" /> Practice
              </h3>
              <div className="space-y-3">
                {studyPlan.practiceRecommendations.map((item, idx) => (
                  <div key={idx} className="p-3 bg-orange-50/50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-800/30 rounded-lg">
                    <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm mb-1">{item.topic}</h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400">{item.reason}</p>
                  </div>
                ))}
                {studyPlan.practiceRecommendations.length === 0 && (
                  <p className="text-sm text-slate-500 italic">No practice recommended right now.</p>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default AIStudyPlanner;
