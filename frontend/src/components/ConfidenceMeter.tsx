import React from 'react';
import { cn } from '../lib/utils';

interface ConfidenceMeterProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const ConfidenceMeter: React.FC<ConfidenceMeterProps> = ({ score, size = 'md', className }) => {
  // Determine color based on score
  let colorClass = 'text-accent-red glow-red';
  let strokeColor = '#EF4444';
  
  if (score >= 90) {
    colorClass = 'text-accent-green glow-green';
    strokeColor = '#00E676';
  } else if (score >= 75) {
    colorClass = 'text-accent-amber glow-amber';
    strokeColor = '#F59E0B';
  }

  // Size mapping
  const sizeMap = {
    sm: { radius: 18, stroke: 4, text: 'text-xs' },
    md: { radius: 36, stroke: 6, text: 'text-xl' },
    lg: { radius: 54, stroke: 8, text: 'text-3xl' }
  };

  const { radius, stroke, text } = sizeMap[size];
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className={cn('relative flex items-center justify-center', className)}>
      <svg
        height={radius * 2}
        width={radius * 2}
        className="transform -rotate-90"
      >
        <circle
          stroke="#28374D"
          fill="transparent"
          strokeWidth={stroke}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        <circle
          stroke={strokeColor}
          fill="transparent"
          strokeWidth={stroke}
          strokeDasharray={circumference + ' ' + circumference}
          style={{ strokeDashoffset }}
          strokeLinecap="round"
          r={normalizedRadius}
          cx={radius}
          cy={radius}
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className={cn("absolute font-bold", colorClass, text)}>
        {Math.round(score)}<span className="text-[0.6em] opacity-70">%</span>
      </div>
    </div>
  );
};
