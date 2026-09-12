
import StudyPlannerCard from '../components/planner/StudyPlannerCard';
import AIStudyPlanner from '../components/planner/AIStudyPlanner';

const Planner = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 min-h-[600px]">
        <AIStudyPlanner />
      </div>
      <div className="lg:col-span-1 min-h-[600px]">
        <StudyPlannerCard />
      </div>
    </div>
  );
};

export default Planner;
