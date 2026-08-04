import React from 'react';
import { FiSearch, FiBell, FiSettings } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { NavLink, Link } from 'react-router-dom';

const Navbar = () => {
  const navItems = [
    { name: 'Dashboard', path: '/' },
    { name: 'Planner', path: '/planner' },
    { name: 'Analytics', path: '/analytics' },
    { name: 'Notes', path: '/notes' },
  ];

  return (
    <nav className="sticky top-0 z-50 glass-card mx-4 mt-4 px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
      <Link to="/" className="flex items-center gap-2 mr-4 shrink-0">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-mentorBlue-600 to-mentorBlue-500 flex items-center justify-center text-white font-bold text-xl">
          M
        </div>
        <span className="font-semibold text-xl text-slate-800 tracking-tight">MentorX</span>
      </Link>
      
      <div className="flex gap-1 md:gap-6 items-center overflow-x-auto w-full md:w-auto no-scrollbar pb-1 md:pb-0">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) => 
              `px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                isActive 
                  ? 'bg-mentorBlue-50 text-mentorBlue-600 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
              }`
            }
          >
            {item.name}
          </NavLink>
        ))}
      </div>

      <div className="hidden lg:flex items-center bg-slate-100/80 px-4 py-2 rounded-full border border-slate-200/50 w-64 shrink-0">
        <FiSearch className="text-slate-400 mr-2" />
        <input 
          type="text" 
          placeholder="Search..." 
          className="bg-transparent border-none outline-none text-sm text-slate-600 w-full placeholder-slate-400"
        />
      </div>

      <div className="flex items-center gap-4 text-slate-500 shrink-0 ml-auto md:ml-0">
        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="hover:text-mentorBlue-600 transition-colors">
          <FiBell size={20} />
        </motion.button>
        <Link to="/settings">
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="hover:text-mentorBlue-600 transition-colors">
            <FiSettings size={20} />
          </motion.button>
        </Link>
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
