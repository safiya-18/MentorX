import React from 'react';
import StudyPlannerCard from '../components/planner/StudyPlannerCard';

const Planner = () => {
  return (
    <div className="grid grid-cols-1 gap-6">
      <div className="col-span-1 min-h-[600px]">
        <StudyPlannerCard />
      </div>
    </div>
  );
};

export default Planner;
