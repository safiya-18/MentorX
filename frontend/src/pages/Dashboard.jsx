import React, { useState } from 'react';
import HeroSection from '../components/dashboard/HeroSection';
import CountdownCard from '../components/dashboard/CountdownCard';
import MissionCard from '../components/dashboard/MissionCard';
import StatisticsSection from '../components/dashboard/StatisticsSection';
import WeeklyProgressCard from '../components/dashboard/WeeklyProgressCard';
import DailyMotivationCard from '../components/dashboard/DailyMotivationCard';
import DailyReflectionCard from '../components/dashboard/DailyReflectionCard';
import DailyGoalCard from '../components/dashboard/DailyGoalCard';
import PomodoroTimer from '../components/timer/PomodoroTimer';
import SubjectProgressCard from '../components/dashboard/SubjectProgressCard';
import AchievementCard from '../components/dashboard/AchievementCard';

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
    <>
      {/* Row 1: Hero */}
      <HeroSection />

      {/* Row 2: Statistics */}
      <StatisticsSection tasks={tasks} />

      {/* Row 3: Goal, Timer, Achievements */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <DailyGoalCard />
        </div>
        <div className="md:col-span-1">
          <PomodoroTimer />
        </div>
        <div className="md:col-span-1">
          <AchievementCard />
        </div>
      </div>

      {/* Row 4: Countdown & Mission */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <CountdownCard />
        </div>
        <div className="lg:col-span-2">
          <MissionCard tasks={tasks} toggleTask={toggleTask} />
        </div>
      </div>

      {/* Row 5: Subjects, Progress, Motivation */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <SubjectProgressCard />
        </div>
        <div className="md:col-span-1">
          <WeeklyProgressCard tasks={tasks} />
        </div>
        <div className="md:col-span-1">
          <DailyMotivationCard />
        </div>
      </div>

      {/* Row 6: Reflection */}
      <div className="grid grid-cols-1 gap-6">
        <div className="col-span-1">
          <DailyReflectionCard />
        </div>
      </div>
    </>
  );
};

export default Dashboard;
