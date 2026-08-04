import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiCheckSquare, FiBookOpen, FiClock, FiFileText } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

const FloatingActionButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const toggleOpen = () => setIsOpen(!isOpen);

  const actions = [
    { icon: FiFileText, label: 'Add Note', color: 'text-purple-600 bg-purple-100', path: '/notes' },
    { icon: FiClock, label: 'Start Focus Timer', color: 'text-orange-600 bg-orange-100', path: '/' },
    { icon: FiBookOpen, label: 'Add Study Session', color: 'text-blue-600 bg-blue-100', path: '/planner' },
    { icon: FiCheckSquare, label: 'Add Task', color: 'text-green-600 bg-green-100', path: '/' },
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="flex flex-col gap-3 mb-4 items-end"
          >
            {actions.map((action, index) => (
              <motion.button
                key={index}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => {
                  navigate(action.path);
                  setIsOpen(false);
                }}
                className="flex items-center gap-3 group"
              >
                <span className="glass-card px-3 py-1.5 text-sm font-medium text-slate-700 shadow-md group-hover:scale-105 transition-transform">
                  {action.label}
                </span>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform ${action.color}`}>
                  <action.icon size={20} />
                </div>
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={toggleOpen}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="w-14 h-14 bg-mentorBlue-600 hover:bg-mentorBlue-700 text-white rounded-full flex items-center justify-center shadow-xl transition-colors float-right"
      >
        <motion.div animate={{ rotate: isOpen ? 45 : 0 }}>
          <FiPlus size={28} />
        </motion.div>
      </motion.button>
    </div>
  );
};

export default FloatingActionButton;
