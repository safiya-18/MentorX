import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiRefreshCw, FiBook, FiCode, FiAlertTriangle, FiCheckCircle, FiEdit3 } from 'react-icons/fi';
import { useLocalStorage } from '../hooks/useLocalStorage';

const Revision = () => {
  const [revisionNotes, setRevisionNotes] = useLocalStorage('revisionNotes', null);
  
  const [availableSubjects, setAvailableSubjects] = useState([]);
  const [topicsMap, setTopicsMap] = useState({}); // { subject: [topics] }
  
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('');
  const [customTopic, setCustomTopic] = useState('');
  const [isCustomMode, setIsCustomMode] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    try {
      const sessionsStr = localStorage.getItem('studySessions');
      if (sessionsStr) {
        const sessions = JSON.parse(sessionsStr);
        const map = {};
        sessions.forEach(s => {
          if (s.subject && s.topic) {
            if (!map[s.subject]) map[s.subject] = new Set();
            map[s.subject].add(s.topic);
          }
        });

        const subjects = Object.keys(map).sort();
        
        const finalMap = {};
        subjects.forEach(sub => {
          finalMap[sub] = Array.from(map[sub]).sort();
        });

        setTimeout(() => {
          setAvailableSubjects(subjects);
          setTopicsMap(finalMap);
          if (subjects.length === 0) {
            setIsCustomMode(true);
          } else if (subjects.length > 0) {
            setSelectedSubject(prev => prev ? prev : subjects[0]);
          }
        }, 0);
      } else {
        setTimeout(() => setIsCustomMode(true), 0);
      }
    } catch (e) {
      console.warn("Failed to parse study sessions", e);
      setTimeout(() => setIsCustomMode(true), 0);
    }
  }, []);

  useEffect(() => {
    if (selectedSubject && topicsMap[selectedSubject] && topicsMap[selectedSubject].length > 0) {
      if (!topicsMap[selectedSubject].includes(selectedTopic)) {
        setTimeout(() => setSelectedTopic(topicsMap[selectedSubject][0]), 0);
      }
    } else {
      setTimeout(() => setSelectedTopic(''), 0);
    }
  }, [selectedSubject, topicsMap, selectedTopic]);

  const generateNotes = async () => {
    let finalTopic = '';
    if (isCustomMode && customTopic.trim()) {
      finalTopic = customTopic.trim();
    } else if (!isCustomMode && selectedSubject && selectedTopic) {
      finalTopic = `${selectedTopic} (${selectedSubject})`;
    }

    if (!finalTopic) {
      setError("Please select or enter a topic to generate notes.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const promptText = `You are a GATE CS revision mentor. Generate highly concise, exam-focused, high-yield revision notes for the topic: "${finalTopic}".

These are revision notes, not a full lecture. Prioritize definitions, rules, conditions, formulas, comparisons, common traps, and GATE-relevant facts. Avoid unnecessary historical or background explanations. 

You MUST return ONLY valid JSON in the exact structure below, with no markdown formatting outside the JSON, and do NOT wrap the JSON in prose.

{
  "topic": "${finalTopic}",
  "summary": "Short high-yield summary.",
  "keyConcepts": [
    "Concept 1",
    "Concept 2",
    "Concept 3"
  ],
  "formulasOrSyntax": [
    "Formula or syntax 1"
  ],
  "commonPitfalls": [
    "Common GATE mistake 1"
  ]
}

Rules:
- summary should be short.
- keyConcepts should contain approximately 3-6 high-value points.
- formulasOrSyntax should contain only relevant formulas/syntax. Use plain text math or code notation. Do not use advanced LaTeX. If none apply, return an empty array [].
- commonPitfalls should contain realistic GATE mistakes.
- Never fabricate formulas.`;

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
        throw new Error("The AI generated malformed notes. Please try again.", { cause: parseError });
      }

      // Validate
      if (
        !parsed.topic || typeof parsed.topic !== 'string' ||
        !parsed.summary || typeof parsed.summary !== 'string' ||
        !Array.isArray(parsed.keyConcepts) ||
        !Array.isArray(parsed.formulasOrSyntax) ||
        !Array.isArray(parsed.commonPitfalls)
      ) {
        throw new Error("The AI response was missing required fields.");
      }

      const isStringArray = (arr) => arr.every(i => typeof i === 'string');
      if (!isStringArray(parsed.keyConcepts) || !isStringArray(parsed.formulasOrSyntax) || !isStringArray(parsed.commonPitfalls)) {
        throw new Error("The AI response contained invalid array items.");
      }

      setRevisionNotes(parsed);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to generate revision notes. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <span>📚</span> AI Revision Notes
          </h1>
          <p className="text-slate-700 dark:text-slate-300 mt-1">
            High-yield GATE concepts, formulas, and common mistakes.
          </p>
        </div>
      </div>

      <div className="glass-card p-6 bg-white dark:bg-slate-800/90 border border-slate-300 dark:border-slate-700">
        <div className="flex flex-col md:flex-row gap-4 items-end">
          
          {!isCustomMode && availableSubjects.length > 0 ? (
            <>
              <div className="w-full md:w-1/3">
                <label className="block text-sm font-semibold text-slate-900 dark:text-slate-100 mb-2">Subject Filter</label>
                <select 
                  value={selectedSubject} 
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  disabled={isLoading}
                  className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-2.5 text-slate-900 dark:text-slate-100 font-medium focus:outline-none focus:ring-2 focus:ring-mentorBlue-500"
                >
                  {availableSubjects.map(sub => (
                    <option key={sub} value={sub}>{sub}</option>
                  ))}
                </select>
              </div>
              <div className="w-full md:w-1/3">
                <label className="block text-sm font-semibold text-slate-900 dark:text-slate-100 mb-2">Topic Selector</label>
                <select 
                  value={selectedTopic} 
                  onChange={(e) => setSelectedTopic(e.target.value)}
                  disabled={isLoading || !selectedSubject}
                  className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-2.5 text-slate-900 dark:text-slate-100 font-medium focus:outline-none focus:ring-2 focus:ring-mentorBlue-500"
                >
                  {topicsMap[selectedSubject]?.map(top => (
                    <option key={top} value={top}>{top}</option>
                  ))}
                </select>
              </div>
            </>
          ) : (
            <div className="w-full md:w-2/3">
              <label className="block text-sm font-semibold text-slate-900 dark:text-slate-100 mb-2">Custom Topic</label>
              <input 
                type="text" 
                value={customTopic}
                onChange={(e) => setCustomTopic(e.target.value)}
                placeholder="e.g. B-Trees, TCP Congestion Control..."
                disabled={isLoading}
                className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-2.5 text-slate-900 dark:text-slate-100 font-medium focus:outline-none focus:ring-2 focus:ring-mentorBlue-500 placeholder-slate-400 dark:placeholder-slate-500"
              />
              {availableSubjects.length === 0 && (
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-2">
                  Choose a custom GATE topic to generate revision notes.
                </p>
              )}
            </div>
          )}

          <div className="w-full md:w-auto shrink-0 flex items-center gap-3">
            {availableSubjects.length > 0 && (
              <button
                onClick={() => setIsCustomMode(!isCustomMode)}
                disabled={isLoading}
                className="px-4 py-2.5 text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg font-medium transition-colors border border-slate-300 dark:border-slate-600 flex items-center justify-center"
                title={isCustomMode ? "Select from existing topics" : "Enter custom topic"}
              >
                <FiEdit3 size={18} />
              </button>
            )}
            <button
              onClick={generateNotes}
              disabled={isLoading || (isCustomMode && !customTopic.trim()) || (!isCustomMode && !selectedTopic)}
              className="px-6 py-2.5 bg-mentorBlue-600 hover:bg-mentorBlue-700 text-white rounded-lg font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-2 w-full md:w-auto"
            >
              {isLoading ? <FiRefreshCw className="animate-spin" /> : <FiBook />}
              Generate
            </button>
          </div>
        </div>
      </div>

      {error && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-rose-50 dark:bg-rose-900/30 border border-rose-200 dark:border-rose-800/60 rounded-xl flex items-center gap-3 text-rose-900 dark:text-rose-200"
        >
          <FiAlertTriangle size={20} className="shrink-0 text-rose-600 dark:text-rose-400" />
          <p className="font-semibold">{error}</p>
        </motion.div>
      )}

      {isLoading && (
        <div className="py-24 flex flex-col items-center justify-center text-slate-700 dark:text-slate-300 glass-card bg-white dark:bg-slate-800/90 border-slate-300 dark:border-slate-700">
          <div className="flex gap-2 mb-4">
            <div className="w-3 h-3 rounded-full bg-mentorBlue-600 dark:bg-mentorBlue-400 animate-bounce" />
            <div className="w-3 h-3 rounded-full bg-mentorBlue-600 dark:bg-mentorBlue-400 animate-bounce" style={{ animationDelay: '0.2s' }} />
            <div className="w-3 h-3 rounded-full bg-mentorBlue-600 dark:bg-mentorBlue-400 animate-bounce" style={{ animationDelay: '0.4s' }} />
          </div>
          <p className="font-bold text-lg text-slate-900 dark:text-slate-100">Compiling high-yield notes...</p>
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mt-2">Extracting critical GATE concepts and common pitfalls.</p>
        </div>
      )}

      {!isLoading && !revisionNotes && !error && (
        <div className="py-24 flex flex-col items-center justify-center text-slate-700 dark:text-slate-300 glass-card bg-white dark:bg-slate-800/90 border-slate-300 dark:border-slate-700 text-center px-4">
          <div className="w-16 h-16 bg-slate-100 dark:bg-slate-900 rounded-full flex items-center justify-center mb-4 border border-slate-300 dark:border-slate-600">
            <FiBook size={28} className="text-slate-500 dark:text-slate-400" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">No Notes Generated</h3>
          <p className="text-slate-700 dark:text-slate-300 max-w-md font-medium">
            Select a topic and click Generate to create a concise, exam-focused revision sheet.
          </p>
        </div>
      )}

      {!isLoading && revisionNotes && (
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          className="space-y-6"
        >
          {/* Summary Card */}
          <div className="glass-card p-6 md:p-8 bg-white dark:bg-slate-800/90 border-slate-300 dark:border-slate-700 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-mentorBlue-500"></div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50 mb-3 ml-2">
              {revisionNotes.topic}
            </h2>
            <p className="text-slate-700 dark:text-slate-200 font-medium leading-relaxed ml-2 text-lg">
              {revisionNotes.summary}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Key Concepts Card */}
            <div className="glass-card p-6 bg-emerald-50 dark:bg-slate-800/90 border-emerald-200 dark:border-emerald-800/60 flex flex-col h-full">
              <div className="flex items-center gap-3 mb-4 text-emerald-800 dark:text-emerald-300">
                <FiCheckCircle size={22} />
                <h3 className="text-xl font-bold">Key Concepts</h3>
              </div>
              <ul className="space-y-3 flex-grow">
                {revisionNotes.keyConcepts.map((concept, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 mt-2 shrink-0"></span>
                    <span className="text-slate-900 dark:text-slate-100 font-semibold leading-relaxed">
                      {concept}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Common Pitfalls Card */}
            <div className="glass-card p-6 bg-rose-50 dark:bg-slate-800/90 border-rose-200 dark:border-rose-800/60 flex flex-col h-full">
              <div className="flex items-center gap-3 mb-4 text-rose-800 dark:text-rose-300">
                <FiAlertTriangle size={22} />
                <h3 className="text-xl font-bold">Common Pitfalls</h3>
              </div>
              <ul className="space-y-3 flex-grow">
                {revisionNotes.commonPitfalls.map((pitfall, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 dark:bg-rose-400 mt-2 shrink-0"></span>
                    <span className="text-slate-900 dark:text-slate-100 font-semibold leading-relaxed">
                      {pitfall}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Formulas / Syntax Card */}
          {revisionNotes.formulasOrSyntax && revisionNotes.formulasOrSyntax.length > 0 && (
            <div className="glass-card p-6 bg-indigo-50 dark:bg-slate-800/90 border-indigo-200 dark:border-indigo-800/60">
              <div className="flex items-center gap-3 mb-4 text-indigo-800 dark:text-indigo-300">
                <FiCode size={22} />
                <h3 className="text-xl font-bold">Formulas & Syntax</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {revisionNotes.formulasOrSyntax.map((formula, idx) => (
                  <div key={idx} className="p-4 bg-white dark:bg-slate-900 rounded-lg border border-indigo-100 dark:border-indigo-900/50 shadow-sm">
                    <code className="text-indigo-900 dark:text-indigo-100 font-mono font-bold text-sm block whitespace-pre-wrap word-break">
                      {formula}
                    </code>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="flex justify-end pt-4">
            <button
              onClick={generateNotes}
              disabled={isLoading}
              className="px-6 py-2.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-100 rounded-lg font-bold transition-colors border border-slate-300 dark:border-slate-600 flex items-center gap-2"
            >
              <FiRefreshCw />
              Regenerate Notes
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default Revision;
