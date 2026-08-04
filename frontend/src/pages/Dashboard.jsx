import React, { useState } from 'react';
import Navbar from '../components/layout/Navbar';
import HeroSection from '../components/dashboard/HeroSection';
import CountdownCard from '../components/dashboard/CountdownCard';
import MissionCard from '../components/dashboard/MissionCard';
import StatisticsSection from '../components/dashboard/StatisticsSection';
import WeeklyProgressCard from '../components/dashboard/WeeklyProgressCard';
import DailyMotivationCard from '../components/dashboard/DailyMotivationCard';
import DailyReflectionCard from '../components/dashboard/DailyReflectionCard';

const initialTasks = [
  { id: 1, title: 'Complete Data Structures Graph Theory Module', completed: false, category: 'Study' },
  { id: 2, title: 'Solve 20 PYQs from Algorithms', completed: true, category: 'Practice' },
  { id: 3, title: 'Revise Engineering Mathematics Notes', completed: false, category: 'Revision' },
];

const Dashboard = () => {
  const [tasks, setTasks] = useState(initialTasks);

  const toggleTask = (id) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

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

        {/* Row 2: Statistics */}
        <StatisticsSection tasks={tasks} />

        {/* Row 3: Countdown & Mission */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <CountdownCard />
          </div>
          <div className="lg:col-span-2">
            <MissionCard tasks={tasks} toggleTask={toggleTask} />
          </div>
        </div>

        {/* Row 4: Progress, Motivation, Reflection */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <WeeklyProgressCard tasks={tasks} />
          </div>
          <div className="md:col-span-1">
            <DailyMotivationCard />
          </div>
          <div className="md:col-span-1">
            <DailyReflectionCard />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
