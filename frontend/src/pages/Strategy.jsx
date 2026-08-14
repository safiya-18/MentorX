import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiRefreshCw, FiCalendar, FiClock, FiTarget, FiAlertCircle, FiCheckSquare } from 'react-icons/fi';
import { useLocalStorage } from '../hooks/useLocalStorage';

const Strategy = () => {
  const [weeklyStrategy, setWeeklyStrategy] = useLocalStorage('weeklyStrategy', null);
  const [aiReport] = useLocalStorage('aiAnalyticsReport', null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [examContext, setExamContext] = useState(null);

  useEffect(() => {
    try {
      const profileStr = localStorage.getItem('mentorxProfile');
      if (profileStr) {
        const profile = JSON.parse(profileStr);
        if (profile.examDate) {
          const daysLeft = Math.ceil((new Date(profile.examDate) - new Date()) / (1000 * 60 * 60 * 24));
          setTimeout(() => {
            setExamContext({ date: profile.examDate, daysLeft, targetExam: profile.targetExam });
          }, 0);
        }
      }
    } catch (e) {
      console.warn("Could not parse profile for exam context", e);
    }
  }, []);

  const generateStrategy = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Gather Data
      let sessions = [];
      let profile = {};
      
      let analyticsReport = null;
      
      try {
        const sessionsStr = localStorage.getItem('studySessions');
        if (sessionsStr) sessions = JSON.parse(sessionsStr);
        
        const profileStr = localStorage.getItem('mentorxProfile');
        if (profileStr) profile = JSON.parse(profileStr);

        const analyticsStr = localStorage.getItem('aiAnalyticsReport');
        if (analyticsStr) analyticsReport = JSON.parse(analyticsStr);
      } catch (e) {
        console.warn("Failed to gather local data", e);
      }

      const pendingSessions = sessions.filter(s => s.status === 'Pending' || !s.status);
      const completedSessions = sessions.filter(s => s.status === 'Completed');

      // Create prompt context
      let contextStr = `Student Profile:\n`;
      contextStr += `- Target Exam: ${profile.targetExam || 'GATE'}\n`;
      if (profile.examDate) contextStr += `- Exam Date: ${profile.examDate}\n`;
      if (profile.dailyGoalCount) contextStr += `- Expected Daily Sessions: ${profile.dailyGoalCount}\n`;
      
      contextStr += `\nExisting Pending Work (Must be addressed):\n`;
      if (pendingSessions.length > 0) {
        pendingSessions.slice(0, 15).forEach(s => {
          contextStr += `- ${s.subject}: ${s.topic} (Priority: ${s.priority || 'Normal'})\n`;
        });
      } else {
        contextStr += `- None recorded. Student is starting fresh.\n`;
      }

      contextStr += `\nRecently Completed Work (For revision context):\n`;
      if (completedSessions.length > 0) {
        completedSessions.slice(-10).forEach(s => {
          contextStr += `- ${s.subject}: ${s.topic}\n`;
        });
      } else {
        contextStr += `- None recorded.\n`;
      }

      if (analyticsReport && analyticsReport.topicPerformance && analyticsReport.topicPerformance.length > 0) {
        const weak = analyticsReport.topicPerformance.filter(t => t.status === 'Weak');
        const moderate = analyticsReport.topicPerformance.filter(t => t.status === 'Moderate');
        const strong = analyticsReport.topicPerformance.filter(t => t.status === 'Strong');

        contextStr += `\nEmpirical Practice Performance (CRITICAL FOR ADAPTIVE STRATEGY):\n`;
        if (weak.length) contextStr += `- Weak Topics: ${weak.map(t => `${t.topic} (Acc: ${t.accuracy}, ${t.attempts} att) - ${t.advice}`).join(' | ')}\n`;
        if (moderate.length) contextStr += `- Moderate Topics: ${moderate.map(t => `${t.topic} (${t.accuracy})`).join(', ')}\n`;
        if (strong.length) contextStr += `- Strong Topics: ${strong.map(t => `${t.topic} (${t.accuracy})`).join(', ')}\n`;
      }

      const promptText = `You are MentorX, an AI study mentor. Analyze the provided student data and generate a realistic Weekly Study Strategy for the next 7 days.
      
${contextStr}

IMPORTANT RULES:
1. Return exactly 7 days of strategy.
2. Incorporate the "Existing Pending Work" into the schedule and mark their source as "Existing backlog".
3. Provide AI-suggested revision or practice tasks and mark their source as "AI suggestion".
4. Do NOT claim an AI suggestion already exists in the student's data.
5. EMPIRICAL WEAKNESS PRIORITY: You MUST schedule "Weak Topics" (if any are listed) with the highest priority as Revision/Practice tasks. Do not ignore weak topics.
6. Strong topics should receive lighter revision/PYQ work instead of consuming most of the week.
7. Keep the workload realistic. Respect the expected daily sessions.
8. You MUST return ONLY valid JSON in the exact structure below, with no markdown formatting or extra text outside the JSON.

{
  "weekGoal": "Main objective for the week",
  "overview": "Short motivational or strategic summary",
  "days": [
    {
      "dayName": "Monday",
      "focusSubject": "Subject Name",
      "tasks": [
        {
          "title": "Task or topic description",
          "type": "Existing" | "Revision" | "Practice" | "PYQ",
          "source": "Existing backlog" | "AI suggestion"
        }
      ],
      "estimatedDuration": "e.g., 3 hours",
      "priority": "High" | "Medium" | "Low"
    }
  ]
}

Do NOT wrap the response in \`\`\`json blocks. Return raw JSON.`;

      const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: promptText })
      });

      if (!response.ok) {
        throw new Error('API Response not ok');
      }

      const data = await response.json();
      if (data.error) throw new Error(data.error);

      let rawJson = data.reply.trim();
      if (rawJson.startsWith('```json')) {
        rawJson = rawJson.replace(/^```json/, '').replace(/```$/, '').trim();
      } else if (rawJson.startsWith('```')) {
        rawJson = rawJson.replace(/^```/, '').replace(/```$/, '').trim();
      }

      let parsed;
      try {
        parsed = JSON.parse(rawJson);
      } catch (parseError) {
        console.error("AI returned malformed JSON:", rawJson);
        throw new Error("The AI generated a malformed strategy. Please try again.", { cause: parseError });
      }

      // Validate structure
      if (
        !parsed.weekGoal || typeof parsed.weekGoal !== 'string' ||
        !parsed.overview || typeof parsed.overview !== 'string' ||
        !Array.isArray(parsed.days) || parsed.days.length !== 7
      ) {
        throw new Error("The AI response was missing required fields or didn't return exactly 7 days.");
      }

      parsed.days.forEach((day, index) => {
        if (!day.dayName || !day.focusSubject || !Array.isArray(day.tasks) || !day.estimatedDuration || !day.priority) {
          throw new Error(`Day ${index + 1} is missing required fields.`);
        }
        day.tasks.forEach((task, tIndex) => {
          if (!task.title || !task.type || !task.source) {
            throw new Error(`Task ${tIndex + 1} on ${day.dayName} is missing required fields.`);
          }
        });
      });

      setWeeklyStrategy(parsed);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Weekly strategy generation is temporarily unavailable. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getPriorityColor = (priority) => {
    switch(priority?.toLowerCase()) {
      case 'high': return 'text-rose-700 bg-rose-100 dark:text-rose-300 dark:bg-rose-900/40 border-rose-200 dark:border-rose-800/50';
      case 'medium': return 'text-amber-700 bg-amber-100 dark:text-amber-300 dark:bg-amber-900/40 border-amber-200 dark:border-amber-800/50';
      case 'low': return 'text-green-700 bg-green-100 dark:text-green-300 dark:bg-green-900/40 border-green-200 dark:border-green-800/50';
      default: return 'text-slate-700 bg-slate-100 dark:text-slate-300 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/50';
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50 flex items-center gap-2">
            <span>🗓️</span> AI Weekly Study Strategy
          </h1>
          <div className="flex flex-col gap-2 mt-1">
            <p className="text-slate-700 dark:text-slate-200">
              Your personalized 7-day master plan based on current progress.
            </p>
            {aiReport && aiReport.topicPerformance && aiReport.topicPerformance.length > 0 && (
              <div className="flex items-center gap-2 text-[11px] sm:text-xs font-bold text-mentorBlue-700 dark:text-mentorBlue-300 bg-mentorBlue-50/80 dark:bg-mentorBlue-900/30 border border-mentorBlue-200 dark:border-mentorBlue-800/50 w-fit px-2.5 py-1 rounded-md shadow-sm">
                <FiTarget size={12} className="shrink-0" />
                <span>Strategy adapted from practice performance ({aiReport.topicPerformance.filter(t => t.status === 'Weak').length} weak topics detected)</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          {examContext && examContext.daysLeft > 0 && (
            <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800/80 rounded-lg border border-slate-300 dark:border-slate-600 text-sm">
              <span className="text-slate-700 dark:text-slate-200 font-medium">Exam in:</span>
              <span className="font-bold text-mentorBlue-700 dark:text-mentorBlue-400">
                {examContext.daysLeft} days
              </span>
            </div>
          )}
          <button
            onClick={generateStrategy}
            disabled={isLoading}
            className="w-full md:w-auto px-5 py-2.5 bg-mentorBlue-600 hover:bg-mentorBlue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoading ? <FiRefreshCw className="animate-spin" /> : <FiCalendar />}
            {weeklyStrategy ? 'Regenerate Strategy' : 'Generate Strategy'}
          </button>
        </div>
      </div>

      {error && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-900/30 rounded-xl flex items-center gap-3 text-rose-800 dark:text-rose-200"
        >
          <FiAlertCircle size={20} className="shrink-0" />
          <p className="text-sm font-medium">{error}</p>
        </motion.div>
      )}

      {isLoading && (
        <div className="py-20 flex flex-col items-center justify-center text-slate-700 dark:text-slate-200 glass-card">
          <div className="flex gap-2 mb-4">
            <div className="w-3 h-3 rounded-full bg-mentorBlue-600 dark:bg-mentorBlue-400 animate-bounce" />
            <div className="w-3 h-3 rounded-full bg-mentorBlue-600 dark:bg-mentorBlue-400 animate-bounce" style={{ animationDelay: '0.2s' }} />
            <div className="w-3 h-3 rounded-full bg-mentorBlue-600 dark:bg-mentorBlue-400 animate-bounce" style={{ animationDelay: '0.4s' }} />
          </div>
          <p className="font-semibold text-lg">Drafting your personalized 7-day strategy...</p>
          <p className="text-sm text-slate-600 dark:text-slate-300 mt-2">Analyzing pending tasks and exam timeline.</p>
        </div>
      )}

      {!isLoading && !weeklyStrategy && !error && (
        <div className="py-20 flex flex-col items-center justify-center text-slate-700 dark:text-slate-200 glass-card text-center px-4">
          <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4 border border-slate-300 dark:border-slate-600">
            <FiCalendar size={28} className="text-slate-500 dark:text-slate-400" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">No Strategy Generated</h3>
          <p className="text-slate-700 dark:text-slate-300 max-w-md">
            Click the button above to generate a highly optimized 7-day study schedule based on your current progress and pending work.
          </p>
        </div>
      )}

      {!isLoading && weeklyStrategy && (
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          className="space-y-6"
        >
          {/* Top Overview Card */}
          <div className="glass-card p-6 md:p-8 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800/90 dark:to-slate-900/90 border-slate-300 dark:border-slate-700">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-mentorBlue-100 dark:bg-mentorBlue-900/50 text-mentorBlue-700 dark:text-mentorBlue-300 rounded-xl shrink-0">
                <FiTarget size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50 mb-2">
                  Weekly Goal: {weeklyStrategy.weekGoal}
                </h2>
                <p className="text-slate-700 dark:text-slate-200 font-medium leading-relaxed">
                  {weeklyStrategy.overview}
                </p>
              </div>
            </div>
          </div>

          {/* 7 Days Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {weeklyStrategy.days.map((day, index) => (
              <div key={index} className="glass-card flex flex-col overflow-hidden border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800/90">
                <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80">
                  <div className="flex justify-between items-center mb-1">
                    <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100">{day.dayName}</h3>
                    <span className={`text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${getPriorityColor(day.priority)}`}>
                      {day.priority}
                    </span>
                  </div>
                  <p className="text-indigo-900 dark:text-indigo-300 font-semibold text-sm">
                    {day.focusSubject}
                  </p>
                </div>
                
                <div className="p-4 flex-grow space-y-4">
                  {day.tasks.map((task, tIndex) => (
                    <div key={tIndex} className="flex items-start gap-3">
                      <div className="mt-0.5 text-indigo-600 dark:text-slate-300 shrink-0">
                        <FiCheckSquare size={16} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 leading-snug">
                          {task.title}
                        </p>
                        <div className="flex flex-wrap items-center gap-2 mt-1.5">
                          <span className="text-[10px] font-bold bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 px-2 py-0.5 rounded">
                            {task.type}
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${task.source === 'Existing backlog' ? 'text-indigo-900 bg-indigo-100 dark:text-indigo-100 dark:bg-indigo-900/60' : 'text-emerald-900 bg-emerald-100 dark:text-emerald-100 dark:bg-emerald-900/60'}`}>
                            {task.source}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-3 bg-slate-100 dark:bg-slate-800 border-t border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <FiClock size={14} />
                  Est. {day.estimatedDuration}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default Strategy;
