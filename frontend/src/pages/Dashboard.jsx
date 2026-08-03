import React from 'react';
import Navbar from '../components/layout/Navbar';
import HeroSection from '../components/dashboard/HeroSection';
import CountdownCard from '../components/dashboard/CountdownCard';
import MissionCard from '../components/dashboard/MissionCard';

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-slate-50 relative pb-20">
      {/* Background decorations for premium feel */}
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-mentorBlue-50/80 to-transparent -z-10 pointer-events-none" />
      <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-mentorBlue-200/20 blur-[100px] -z-10 pointer-events-none" />
      <div className="absolute top-[20%] left-[-10%] w-[400px] h-[400px] rounded-full bg-indigo-200/20 blur-[100px] -z-10 pointer-events-none" />

      <Navbar />

      <main className="max-w-7xl mx-auto px-4 mt-8 space-y-6">
        {/* Row 1: Hero */}
        <HeroSection />

        {/* Row 2: Grid for Countdown & Mission (Will add more later) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <CountdownCard />
          </div>
          <div className="lg:col-span-2">
            <MissionCard />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
