import React from 'react';
import { TrendingUp, Award, Activity, CheckCircle2 } from 'lucide-react';

export const StatsBanner: React.FC = () => {
  // Mock historical performance stats
  const stats = [
    {
      label: '90%+ Win Rate',
      value: '94.2%',
      change: '+1.4% this week',
      icon: <Award className="w-5 h-5 text-accent-green" />,
      color: 'border-accent-green/20'
    },
    {
      label: 'Average Profit Yield',
      value: '+18.4%',
      change: 'Based on flat stakes',
      icon: <TrendingUp className="w-5 h-5 text-accent-green" />,
      color: 'border-accent-green/20'
    },
    {
      label: 'Verified Picks',
      value: '248',
      change: '100% transparent history',
      icon: <Activity className="w-5 h-5 text-text-secondary" />,
      color: 'border-primary-border'
    }
  ];

  const recentStreak = [true, true, true, false, true, true, true, true, false, true];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-10">
      {stats.map((stat, i) => (
        <div 
          key={i} 
          className={`bg-[#1B263B]/40 backdrop-blur-md border rounded-xl p-5 flex flex-col justify-between transition-all duration-300 hover:border-accent-green/30 ${stat.color}`}
        >
          <div className="flex justify-between items-start mb-2">
            <span className="text-sm font-medium text-text-secondary">{stat.label}</span>
            <div className="p-2 bg-[#28374D]/60 rounded-lg">
              {stat.icon}
            </div>
          </div>
          <div>
            <div className="text-3xl font-bold tracking-tight text-white mb-1">{stat.value}</div>
            <div className="text-xs text-accent-green flex items-center gap-1 font-medium">
              {stat.change}
            </div>
          </div>
        </div>
      ))}

      {/* Streak Tracker */}
      <div className="bg-[#1B263B]/40 backdrop-blur-md border border-primary-border rounded-xl p-5 flex flex-col justify-between">
        <div className="flex justify-between items-start mb-2">
          <span className="text-sm font-medium text-text-secondary">Recent Settled Form</span>
          <div className="p-2 bg-[#28374D]/60 rounded-lg">
            <CheckCircle2 className="w-5 h-5 text-accent-green" />
          </div>
        </div>
        <div>
          <div className="text-sm font-semibold text-white mb-2 flex items-center gap-1.5">
            Streak: <span className="text-accent-green font-mono">W3</span>
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {recentStreak.map((win, idx) => (
              <span 
                key={idx}
                className={`w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold ${
                  win 
                    ? 'bg-accent-green/20 text-accent-green border border-accent-green/35' 
                    : 'bg-accent-red/20 text-accent-red border border-accent-red/35'
                }`}
                title={win ? 'Win' : 'Loss'}
              >
                {win ? 'W' : 'L'}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
