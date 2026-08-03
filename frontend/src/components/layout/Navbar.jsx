import React from 'react';
import { FiSearch, FiBell, FiSettings } from 'react-icons/fi';
import { motion } from 'framer-motion';

const Navbar = () => {
  return (
    <nav className="sticky top-0 z-50 glass-card mx-4 mt-4 px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-mentorBlue-600 to-mentorBlue-500 flex items-center justify-center text-white font-bold text-xl">
          M
        </div>
        <span className="font-semibold text-xl text-slate-800 tracking-tight">MentorX</span>
      </div>
      
      <div className="hidden md:flex items-center bg-slate-100/80 px-4 py-2 rounded-full border border-slate-200/50 w-96">
        <FiSearch className="text-slate-400 mr-2" />
        <input 
          type="text" 
          placeholder="Search for subjects, topics, or tasks..." 
          className="bg-transparent border-none outline-none text-sm text-slate-600 w-full placeholder-slate-400"
        />
      </div>

      <div className="flex items-center gap-4 text-slate-500">
        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="hover:text-mentorBlue-600 transition-colors">
          <FiBell size={20} />
        </motion.button>
        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="hover:text-mentorBlue-600 transition-colors">
          <FiSettings size={20} />
        </motion.button>
        <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-white shadow-sm cursor-pointer hover:border-mentorBlue-100 transition-colors">
          <img 
            src="https://api.dicebear.com/7.x/notionists/svg?seed=Safiya&backgroundColor=e0f2fe" 
            alt="Profile Avatar" 
            className="w-full h-full object-cover bg-mentorBlue-50"
          />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
