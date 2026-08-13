import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiRefreshCw, FiBarChart2, FiAward, FiTarget, FiTrendingUp, FiAlertCircle } from 'react-icons/fi';
import AnalyticsCards from '../components/analytics/AnalyticsCards';
import ChartsSection from '../components/analytics/ChartsSection';
import { useLocalStorage } from '../hooks/useLocalStorage';

const Analytics = () => {
  const [aiReport, setAiReport] = useLocalStorage('aiAnalyticsReport', null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const generateReport = async () => {
    setIsLoading(true);
    setError(null);

    try {
      let sessions = [];
      let practice = { score: 0, totalAttempted: 0 };
      let profile = {};

      try {
        const sStr = localStorage.getItem('studySessions');
        if (sStr) sessions = JSON.parse(sStr);

        const pStr = localStorage.getItem('practiceSession');
        if (pStr) practice = JSON.parse(pStr);

        const profStr = localStorage.getItem('mentorxProfile');
        if (profStr) profile = JSON.parse(profStr);
      } catch (e) {
        console.warn("Failed to parse local data", e);
      }

      const totalCompleted = sessions.filter(s => s.status === 'Completed').length;
      const totalPending = sessions.filter(s => s.status === 'Pending' || !s.status).length;
      const practiceAccuracy = practice.totalAttempted > 0 
        ? Math.round((practice.score / practice.totalAttempted) * 100) 
        : 0;

      let daysUntilExam = "Unknown";
      if (profile.examDate) {
        const days = Math.ceil((new Date(profile.examDate) - new Date()) / (1000 * 60 * 60 * 24));
        daysUntilExam = days > 0 ? days : "Exam passed";
      }

      const contextStr = `
      Student Profile:
      - Target Exam: ${profile.targetExam || 'GATE'}
      - Days until Exam: ${daysUntilExam}
      - Daily Study Goal: ${profile.dailyGoalCount || 'Not set'} sessions/day
      
      Study History:
      - Completed Sessions: ${totalCompleted}
      - Pending Sessions: ${totalPending}
      
      Practice History:
      - Total Attempted: ${practice.totalAttempted}
      - Accuracy: ${practiceAccuracy}%
      `;

      const promptText = `You are a GATE CS exam mentor. Analyze the student's progress data below and generate a realistic AI Performance and Exam Readiness Report.

      ${contextStr}

      IMPORTANT RULES:
      1. If the student has zero completed sessions and zero practice, welcome them and provide a "Getting Started" analysis with a low readiness score (e.g. 0-10).
      2. Provide actionable strategic advice based on their accuracy and volume.
      3. Return exactly and ONLY valid JSON matching this schema (do NOT wrap in markdown \`\`\`json):
      {
        "readinessScore": 45, // Number between 0 and 100
        "readinessLabel": "Needs Improvement", // Short string
        "consistencyAnalysis": "Analysis of their study volume vs goals...",
        "strengths": ["Strength 1", "Strength 2"], // Array of strings
        "areasForImprovement": ["Area 1", "Area 2"], // Array of strings
        "strategicAdvice": "Your main focus this week should be..."
      }`;

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
        console.error("AI returned malformed JSON:", rawJson, parseError);
        throw new Error("The AI generated a malformed report. Please try again.", { cause: parseError });
      }

      if (
        typeof parsed.readinessScore !== 'number' ||
        !parsed.readinessLabel ||
        !parsed.consistencyAnalysis ||
        !Array.isArray(parsed.strengths) ||
        !Array.isArray(parsed.areasForImprovement) ||
        !parsed.strategicAdvice
      ) {
        throw new Error("The AI response was missing required fields.");
      }

      setAiReport(parsed);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Unable to generate analytics. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-emerald-600 dark:text-emerald-400';
    if (score >= 50) return 'text-amber-500 dark:text-amber-400';
    return 'text-rose-600 dark:text-rose-400';
  };

  const getScoreBg = (score) => {
    if (score >= 80) return 'bg-emerald-100 border-emerald-200 dark:bg-emerald-900/40 dark:border-emerald-800/50';
    if (score >= 50) return 'bg-amber-100 border-amber-200 dark:bg-amber-900/40 dark:border-amber-800/50';
    return 'bg-rose-100 border-rose-200 dark:bg-rose-900/40 dark:border-rose-800/50';
  };

  return (
    <div className="space-y-8 pb-12 max-w-7xl mx-auto">
      
      {/* AI Readiness Section */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50 flex items-center gap-2">
              <span>📈</span> AI Performance & Readiness
            </h1>
            <p className="text-slate-700 dark:text-slate-200 mt-1">
              AI-driven analysis of your study consistency and practice accuracy.
            </p>
          </div>
          
          <button
            onClick={generateReport}
            disabled={isLoading}
            className="w-full md:w-auto px-5 py-2.5 bg-mentorBlue-600 hover:bg-mentorBlue-700 text-white rounded-lg font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoading ? <FiRefreshCw className="animate-spin" /> : <FiBarChart2 />}
            {aiReport ? 'Regenerate Report' : 'Generate AI Report'}
          </button>
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-rose-50 dark:bg-rose-900/30 border border-rose-200 dark:border-rose-800/60 rounded-xl flex items-center gap-3 text-rose-900 dark:text-rose-200"
          >
            <FiAlertCircle size={20} className="shrink-0 text-rose-600 dark:text-rose-400" />
            <p className="font-semibold">{error}</p>
          </motion.div>
        )}

        {isLoading && (
          <div className="py-16 flex flex-col items-center justify-center text-slate-700 dark:text-slate-300 glass-card bg-white dark:bg-slate-800/90 border-slate-300 dark:border-slate-700">
            <div className="flex gap-2 mb-4">
              <div className="w-3 h-3 rounded-full bg-mentorBlue-600 dark:bg-mentorBlue-400 animate-bounce" />
              <div className="w-3 h-3 rounded-full bg-mentorBlue-600 dark:bg-mentorBlue-400 animate-bounce" style={{ animationDelay: '0.2s' }} />
              <div className="w-3 h-3 rounded-full bg-mentorBlue-600 dark:bg-mentorBlue-400 animate-bounce" style={{ animationDelay: '0.4s' }} />
            </div>
            <p className="font-bold text-lg text-slate-900 dark:text-slate-100">Analyzing performance...</p>
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mt-2">Evaluating consistency and practice accuracy.</p>
          </div>
        )}

        {!isLoading && !aiReport && !error && (
          <div className="py-12 flex flex-col items-center justify-center text-slate-700 dark:text-slate-300 glass-card bg-white dark:bg-slate-800/90 border-slate-300 dark:border-slate-700 text-center px-4">
            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-900 rounded-full flex items-center justify-center mb-4 border border-slate-300 dark:border-slate-600">
              <FiBarChart2 size={28} className="text-slate-500 dark:text-slate-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">No Report Generated</h3>
            <p className="text-slate-700 dark:text-slate-300 max-w-md font-medium">
              Click the button above to generate a comprehensive AI evaluation of your GATE readiness.
            </p>
          </div>
        )}

        {!isLoading && aiReport && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Score Card */}
              <div className={`glass-card p-6 md:p-8 flex flex-col items-center justify-center text-center border ${getScoreBg(aiReport.readinessScore)}`}>
                <div className="relative mb-2">
                  <FiAward size={48} className={getScoreColor(aiReport.readinessScore)} />
                </div>
                <h3 className={`text-4xl font-black mb-1 ${getScoreColor(aiReport.readinessScore)}`}>
                  {aiReport.readinessScore}<span className="text-xl">%</span>
                </h3>
                <p className="text-lg font-bold text-slate-900 dark:text-slate-100">{aiReport.readinessLabel}</p>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mt-1 uppercase tracking-wider">Readiness Score</p>
              </div>

              {/* Consistency & Advice */}
              <div className="md:col-span-2 glass-card p-6 bg-white dark:bg-slate-800/90 border-slate-300 dark:border-slate-700 flex flex-col justify-center">
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2 flex items-center gap-2">
                  <FiTrendingUp className="text-mentorBlue-600 dark:text-mentorBlue-400" /> Consistency Analysis
                </h3>
                <p className="text-slate-700 dark:text-slate-200 font-medium leading-relaxed mb-6">
                  {aiReport.consistencyAnalysis}
                </p>
                
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2 flex items-center gap-2">
                  <FiTarget className="text-mentorBlue-600 dark:text-mentorBlue-400" /> Strategic Advice
                </h3>
                <p className="text-slate-700 dark:text-slate-200 font-medium leading-relaxed">
                  {aiReport.strategicAdvice}
                </p>
              </div>
            </div>

            {/* Strengths & Weaknesses */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="glass-card p-6 bg-emerald-50 dark:bg-slate-800/90 border-emerald-200 dark:border-emerald-800/60">
                <h3 className="text-lg font-bold text-emerald-900 dark:text-emerald-300 mb-4 border-b border-emerald-200 dark:border-emerald-800/60 pb-2">
                  Core Strengths
                </h3>
                <ul className="space-y-3">
                  {aiReport.strengths.map((str, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 mt-2 shrink-0"></span>
                      <span className="text-slate-900 dark:text-slate-100 font-semibold">{str}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="glass-card p-6 bg-rose-50 dark:bg-slate-800/90 border-rose-200 dark:border-rose-800/60">
                <h3 className="text-lg font-bold text-rose-900 dark:text-rose-300 mb-4 border-b border-rose-200 dark:border-rose-800/60 pb-2">
                  Areas for Improvement
                </h3>
                <ul className="space-y-3">
                  {aiReport.areasForImprovement.map((area, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500 dark:bg-rose-400 mt-2 shrink-0"></span>
                      <span className="text-slate-900 dark:text-slate-100 font-semibold">{area}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      <hr className="border-slate-200 dark:border-slate-700/50" />

      {/* Existing Analytics Section */}
      <AnalyticsCards />
      <ChartsSection />
    </div>
  );
};

export default Analytics;
