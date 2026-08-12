import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSend, FiTrash2, FiMessageSquare, FiCpu, FiAlertCircle } from 'react-icons/fi';
import ReactMarkdown from 'react-markdown';
import toast from 'react-hot-toast';

const Mentor = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = { role: 'user', content: input.trim() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage.content })
      });

      if (!response.ok) {
        throw new Error('Failed to communicate with AI Mentor.');
      }

      const data = await response.json();
      
      if (data.error) {
         throw new Error(data.error);
      }

      const aiMessage = { role: 'ai', content: data.reply };
      setMessages(prev => [...prev, aiMessage]);
    } catch (err) {
      console.error(err);
      setError('Unable to reach the AI Mentor. Please make sure the backend is running and try again.');
      toast.error('Failed to get response');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClearChat = () => {
    setMessages([]);
    setError(null);
  };

  const exampleQuestions = [
    "What should I study today?",
    "Explain DBMS normalization.",
    "How can I prepare for GATE effectively?"
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] mt-4 mb-8">
      {/* Header */}
      <div className="glass-card mb-4 p-4 flex justify-between items-center bg-white/70 dark:bg-slate-800/70 border-slate-200/50 dark:border-slate-700/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-mentorBlue-100 dark:bg-mentorBlue-900/50 flex items-center justify-center text-mentorBlue-600 dark:text-mentorBlue-400">
            <FiCpu size={22} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800 dark:text-white">MentorX AI Mentor</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Your personal intelligent study assistant.</p>
          </div>
        </div>
        {messages.length > 0 && (
          <button 
            onClick={handleClearChat}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            title="Clear Conversation"
            aria-label="Clear Conversation"
          >
            <FiTrash2 size={16} />
            <span className="hidden sm:inline">Clear Chat</span>
          </button>
        )}
      </div>

      {/* Chat Area */}
      <div className="glass-card flex-grow flex flex-col bg-slate-50/50 dark:bg-slate-900/50 border-slate-200/50 dark:border-slate-700/50 overflow-hidden relative shadow-inner">
        <div className="flex-grow overflow-y-auto p-4 sm:p-6 space-y-6 no-scrollbar">
          <AnimatePresence initial={false}>
            {messages.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="h-full flex flex-col items-center justify-center text-center max-w-lg mx-auto px-4"
              >
                <div className="w-16 h-16 bg-mentorBlue-50 dark:bg-mentorBlue-900/20 rounded-full flex items-center justify-center text-mentorBlue-500 mb-4">
                  <FiMessageSquare size={32} />
                </div>
                <h2 className="text-2xl font-semibold text-slate-800 dark:text-white mb-2">How can I help you today?</h2>
                <p className="text-slate-500 dark:text-slate-400 mb-8">Ask me anything about your studies, schedules, or technical concepts.</p>
                
                <div className="w-full space-y-3">
                  {exampleQuestions.map((q, i) => (
                    <button
                      key={i}
                      onClick={() => setInput(q)}
                      className="w-full text-left px-4 py-3 bg-white dark:bg-slate-800 hover:bg-mentorBlue-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-200 text-sm transition-colors shadow-sm"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </motion.div>
            ) : (
              messages.map((msg, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 ${
                    msg.role === 'user' 
                      ? 'bg-mentorBlue-600 text-white rounded-tr-sm shadow-md' 
                      : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-tl-sm shadow-sm'
                  }`}>
                    {msg.role === 'user' ? (
                      <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.content}</p>
                    ) : (
                      <div className="prose prose-sm dark:prose-invert max-w-none prose-p:leading-relaxed prose-pre:bg-slate-900 prose-pre:text-slate-100 prose-pre:p-3 prose-pre:rounded-lg">
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))
            )}
            
            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-start"
              >
                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 rounded-2xl rounded-tl-sm p-4 shadow-sm flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-mentorBlue-400 animate-bounce" />
                  <div className="w-2 h-2 rounded-full bg-mentorBlue-400 animate-bounce" style={{ animationDelay: '0.2s' }} />
                  <div className="w-2 h-2 rounded-full bg-mentorBlue-400 animate-bounce" style={{ animationDelay: '0.4s' }} />
                </div>
              </motion.div>
            )}

            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-center my-4"
              >
                <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-4 py-2 rounded-lg text-sm flex items-center gap-2 border border-red-100 dark:border-red-900/30">
                  <FiAlertCircle />
                  {error}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white dark:bg-slate-800 border-t border-slate-200/50 dark:border-slate-700/50">
          <div className="relative max-w-4xl mx-auto flex items-end gap-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Message MentorX AI..."
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:border-mentorBlue-400 dark:focus:border-mentorBlue-500 rounded-xl px-4 py-3 pr-12 text-sm text-slate-800 dark:text-white resize-none outline-none transition-colors max-h-32 min-h-[44px]"
              rows={input.split('\n').length > 1 ? Math.min(input.split('\n').length, 5) : 1}
              disabled={isLoading}
              aria-label="Chat input"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="absolute right-2 bottom-1.5 p-2 bg-mentorBlue-600 hover:bg-mentorBlue-700 disabled:bg-slate-200 dark:disabled:bg-slate-700 disabled:text-slate-400 dark:disabled:text-slate-500 text-white rounded-lg transition-colors"
              aria-label="Send message"
            >
              <FiSend size={16} />
            </button>
          </div>
          <p className="text-center text-xs text-slate-400 dark:text-slate-500 mt-2">
            AI Mentor can make mistakes. Verify important information.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Mentor;
