import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiRefreshCw, FiCheckCircle, FiXCircle, FiBookOpen, FiAlertCircle } from 'react-icons/fi';
import ReactMarkdown from 'react-markdown';
import { useLocalStorage } from '../hooks/useLocalStorage';

const Practice = () => {
  const [sessionState, setSessionState] = useLocalStorage('practiceSession', {
    score: 0,
    totalAttempted: 0,
  });

  const [availableTopics, setAvailableTopics] = useState(['General GATE Practice']);
  const [selectedTopic, setSelectedTopic] = useState('General GATE Practice');
  
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Load topics from study sessions
    try {
      const sessionsStr = localStorage.getItem('studySessions');
      if (sessionsStr) {
        const sessions = JSON.parse(sessionsStr);
        const topics = new Set(['General GATE Practice']);
        sessions.forEach(s => {
          if (s.subject && s.topic) {
            topics.add(`${s.subject} - ${s.topic}`);
          } else if (s.subject) {
            topics.add(s.subject);
          }
        });
        setTimeout(() => {
          setAvailableTopics(Array.from(topics));
        }, 0);
      }
    } catch (e) {
      console.warn('Could not parse study sessions for topics', e);
    }
  }, []);

  const generateQuestion = async () => {
    setIsLoading(true);
    setError(null);
    setCurrentQuestion(null);
    setSelectedOption(null);
    setIsSubmitted(false);

    try {
      let promptTopicContext = selectedTopic === 'General GATE Practice' 
        ? 'General GATE exam topics' 
        : `the specific topic: ${selectedTopic}`;

      const promptText = `You are MentorX, an AI study mentor for a GATE aspirant.
Generate ONE highly relevant multiple-choice practice question for ${promptTopicContext}.
Do NOT claim it is an official GATE question, this is for AI-generated practice.

You MUST return ONLY valid JSON in the exact structure below, with no markdown formatting or extra text outside the JSON.
{
  "question": "Question text here. You can use markdown for math or code.",
  "options": [
    "Option A",
    "Option B",
    "Option C",
    "Option D"
  ],
  "correctIndex": 0,
  "explanation": "Short, concise explanation of why this is correct."
}

Rules:
- Exactly 4 options.
- correctIndex must be an integer between 0 and 3.
- Do NOT wrap in \`\`\`json blocks, just return the raw JSON object.`;

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

      // Clean response if it contains markdown JSON fences
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
        throw new Error("The AI generated a malformed question. Please try again.", { cause: parseError });
      }

      // Validate structure
      if (
        !parsed.question ||
        typeof parsed.question !== 'string' ||
        !Array.isArray(parsed.options) ||
        parsed.options.length !== 4 ||
        typeof parsed.correctIndex !== 'number' ||
        parsed.correctIndex < 0 ||
        parsed.correctIndex > 3 ||
        !parsed.explanation
      ) {
        throw new Error("The AI response was missing required fields. Please try again.");
      }

      setCurrentQuestion(parsed);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Practice question generation is temporarily unavailable. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectOption = (index) => {
    if (isSubmitted) return;
    setSelectedOption(index);
  };

  const handleSubmit = () => {
    if (selectedOption === null || isSubmitted) return;
    setIsSubmitted(true);

    const isCorrect = selectedOption === currentQuestion.correctIndex;
    
    setSessionState(prev => ({
      ...prev,
      totalAttempted: prev.totalAttempted + 1,
      score: isCorrect ? prev.score + 1 : prev.score
    }));
  };

  const handleRestart = () => {
    setSessionState({ score: 0, totalAttempted: 0 });
    setCurrentQuestion(null);
    setSelectedOption(null);
    setIsSubmitted(false);
    setError(null);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <span>🤖</span> AI-Generated Practice
          </h1>
          <p className="text-slate-600 dark:text-slate-300 mt-1">
            Test your knowledge with dynamic, AI-generated questions.
          </p>
        </div>
        <div className="glass-card px-4 py-3 flex items-center gap-4 border border-slate-200 dark:border-slate-700">
          <div className="text-sm">
            <span className="text-slate-600 dark:text-slate-300 font-medium">Session Score:</span>
            <span className="font-bold text-mentorBlue-700 dark:text-mentorBlue-400 ml-2 text-lg">
              {sessionState.score} / {sessionState.totalAttempted}
            </span>
          </div>
          <button 
            onClick={handleRestart}
            className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
            title="Restart Session"
          >
            <FiRefreshCw size={16} />
          </button>
        </div>
      </div>

      <div className="glass-card p-6">
        <div className="mb-6 flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-grow w-full">
            <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-2">
              Select Topic
            </label>
            <select
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
              disabled={isLoading || (currentQuestion && !isSubmitted)}
              className="w-full bg-white dark:bg-slate-800/80 border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-2.5 text-slate-800 dark:text-slate-100 font-medium focus:ring-2 focus:ring-mentorBlue-500 outline-none transition-all disabled:opacity-50"
            >
              {availableTopics.map(topic => (
                <option key={topic} value={topic}>{topic}</option>
              ))}
            </select>
          </div>
          <button
            onClick={generateQuestion}
            disabled={isLoading || (currentQuestion && !isSubmitted)}
            className="w-full md:w-auto px-6 py-2.5 bg-mentorBlue-600 hover:bg-mentorBlue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <FiRefreshCw className="animate-spin" />
            ) : (
              <FiBookOpen />
            )}
            {currentQuestion ? 'Generate Another' : 'Generate Question'}
          </button>
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 rounded-lg flex items-center gap-3 text-red-600 dark:text-red-400"
          >
            <FiAlertCircle size={20} className="shrink-0" />
            <p className="text-sm font-medium">{error}</p>
          </motion.div>
        )}

        {isLoading && (
          <div className="py-12 flex flex-col items-center justify-center text-slate-600 dark:text-slate-300">
            <div className="flex gap-2 mb-4">
              <div className="w-3 h-3 rounded-full bg-mentorBlue-600 dark:bg-mentorBlue-400 animate-bounce" />
              <div className="w-3 h-3 rounded-full bg-mentorBlue-600 dark:bg-mentorBlue-400 animate-bounce" style={{ animationDelay: '0.2s' }} />
              <div className="w-3 h-3 rounded-full bg-mentorBlue-600 dark:bg-mentorBlue-400 animate-bounce" style={{ animationDelay: '0.4s' }} />
            </div>
            <p className="font-semibold">Crafting a relevant question...</p>
          </div>
        )}

        {currentQuestion && !isLoading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <div className="prose prose-slate dark:prose-invert max-w-none bg-slate-50 dark:bg-slate-800/60 p-6 rounded-xl border border-slate-200 dark:border-slate-700/80 text-slate-900 dark:text-slate-50 [&>p]:text-slate-900 dark:[&>p]:text-slate-50">
              <ReactMarkdown>{currentQuestion.question}</ReactMarkdown>
            </div>

            <div className="space-y-3">
              {currentQuestion.options.map((option, index) => {
                const isSelected = selectedOption === index;
                const isCorrectIndex = index === currentQuestion.correctIndex;
                
                let optionClasses = "w-full text-left p-4 rounded-xl border-2 transition-all flex items-start gap-3 ";
                
                if (!isSubmitted) {
                  if (isSelected) {
                    optionClasses += "border-mentorBlue-500 bg-mentorBlue-50 dark:bg-mentorBlue-900/30 text-mentorBlue-800 dark:text-mentorBlue-100 font-semibold";
                  } else {
                    optionClasses += "border-slate-300 dark:border-slate-600 hover:border-mentorBlue-400 dark:hover:border-mentorBlue-600 text-slate-800 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800/60";
                  }
                } else {
                  if (isCorrectIndex) {
                    optionClasses += "border-green-600 bg-green-50 dark:bg-green-900/40 text-green-800 dark:text-green-100 font-bold shadow-sm";
                  } else if (isSelected && !isCorrectIndex) {
                    optionClasses += "border-rose-500 bg-rose-50 dark:bg-rose-900/30 text-rose-800 dark:text-rose-100 font-semibold";
                  } else {
                    optionClasses += "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 opacity-75";
                  }
                }

                return (
                  <button
                    key={index}
                    onClick={() => handleSelectOption(index)}
                    disabled={isSubmitted}
                    className={optionClasses}
                  >
                    <div className={`shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center mt-0.5 transition-colors ${
                      isSubmitted 
                        ? (isCorrectIndex ? 'border-green-600 text-green-600 dark:border-green-400 dark:text-green-400' : (isSelected ? 'border-rose-500 text-rose-500 dark:border-rose-400 dark:text-rose-400' : 'border-slate-300 dark:border-slate-600')) 
                        : (isSelected ? 'border-mentorBlue-500 bg-mentorBlue-500' : 'border-slate-400 dark:border-slate-500')
                    }`}>
                      {isSubmitted && isCorrectIndex && <FiCheckCircle size={16} />}
                      {isSubmitted && isSelected && !isCorrectIndex && <FiXCircle size={16} />}
                      {!isSubmitted && isSelected && <div className="w-2 h-2 bg-white rounded-full" />}
                    </div>
                    <div className="font-medium text-[15px]">
                      {option}
                    </div>
                  </button>
                );
              })}
            </div>

            {!isSubmitted ? (
              <button
                onClick={handleSubmit}
                disabled={selectedOption === null}
                className="w-full py-3.5 bg-slate-800 dark:bg-slate-200 hover:bg-slate-900 dark:hover:bg-white text-white dark:text-slate-900 rounded-xl font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Submit Answer
              </button>
            ) : (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-8 space-y-5 overflow-hidden"
              >
                <div className={`p-6 rounded-xl border-2 ${selectedOption === currentQuestion.correctIndex ? 'bg-green-50 border-green-200 dark:bg-green-900/40 dark:border-green-700/50' : 'bg-rose-50 border-rose-200 dark:bg-rose-950/50 dark:border-rose-800/50'}`}>
                  <h4 className={`text-lg font-bold flex items-center gap-2 mb-3 ${selectedOption === currentQuestion.correctIndex ? 'text-green-800 dark:text-green-300' : 'text-rose-800 dark:text-rose-300'}`}>
                    {selectedOption === currentQuestion.correctIndex ? (
                      <><FiCheckCircle size={20} /> Correct!</>
                    ) : (
                      <><FiXCircle size={20} /> Incorrect</>
                    )}
                  </h4>
                  <div className={`prose prose-sm max-w-none font-medium leading-relaxed ${selectedOption === currentQuestion.correctIndex ? 'text-green-900 dark:text-green-100 [&>p]:text-green-900 dark:[&>p]:text-green-100' : 'text-rose-900 dark:text-rose-100 [&>p]:text-rose-900 dark:[&>p]:text-rose-100'}`}>
                    <ReactMarkdown>{currentQuestion.explanation}</ReactMarkdown>
                  </div>
                </div>
                
                <button
                  onClick={generateQuestion}
                  className="w-full py-3.5 bg-mentorBlue-600 hover:bg-mentorBlue-700 text-white rounded-xl font-bold transition-colors"
                >
                  Next Question
                </button>
              </motion.div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Practice;
