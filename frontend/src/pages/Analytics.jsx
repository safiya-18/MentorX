import React from 'react';
import AnalyticsCards from '../components/analytics/AnalyticsCards';
import ChartsSection from '../components/analytics/ChartsSection';

const Analytics = () => {
  return (
    <div className="space-y-6">
      <AnalyticsCards />
      <ChartsSection />
    </div>
  );
};

export default Analytics;
