import React from 'react';
import Navbar from './Navbar';
import FloatingActionButton from './FloatingActionButton';

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen relative pb-20 overflow-x-hidden">
      {/* Background decorations for premium feel */}
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-mentorBlue-50/80 to-transparent -z-10 pointer-events-none transition-colors duration-300" />
      <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-mentorBlue-200/20 blur-[100px] -z-10 pointer-events-none transition-colors duration-300" />
      <div className="absolute top-[20%] left-[-10%] w-[400px] h-[400px] rounded-full bg-indigo-200/20 blur-[100px] -z-10 pointer-events-none transition-colors duration-300" />

      <Navbar />

      <main className="max-w-7xl mx-auto px-4 mt-8 space-y-6 relative z-0">
        {children}
      </main>

      <FloatingActionButton />
    </div>
  );
};

export default Layout;
