import type React from 'react';
import { ConfidenceMeter } from './ConfidenceMeter';
import { Clock } from 'lucide-react';
import { cn } from '../lib/utils';

interface Prediction {
  id: string;
  matches: {
    home_team: string;
    away_team: string;
    league_name: string;
    match_date: string;
    status: string;
    country?: string;
  };
  confidence_score: number;
  market: string;
  prediction_value: string;
  is_banker: boolean;
  is_premium: boolean;
  odds?: number;
}

interface PredictionCardProps {
  prediction: Prediction;
  onSelect: (prediction: Prediction) => void;
}

export const PredictionCard: React.FC<PredictionCardProps> = ({ prediction, onSelect }) => {
  const { matches, confidence_score, market, prediction_value, is_banker } = prediction;
  
  const matchDate = new Date(matches.match_date);
  const isLive = matches.status !== 'NS' && matches.status !== 'FT';

  const dateLabel = matchDate.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
  const timeLabel = matchDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div 
      onClick={() => onSelect(prediction)}
      className={cn(
        "card p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl group relative overflow-hidden cursor-pointer border-primary-border/60 hover:border-accent-green/40",
        is_banker ? "border-accent-green/50 shadow-[0_0_15px_rgba(0,230,118,0.1)]" : ""
      )}
    >
      {is_banker && (
        <div className="absolute top-0 right-0 bg-accent-green text-[#0D1B2A] text-[10px] font-bold px-3 py-1 rounded-bl-lg tracking-wider uppercase">
          Banker
        </div>
      )}

      <div className="flex justify-between items-start mb-4">
        <div className="flex-1 pr-2">
          <div className="flex flex-wrap items-center gap-1.5 mb-1">
            <span className="text-xs text-text-secondary uppercase tracking-wider">{matches.league_name}</span>
            {matches.country && (
              <span className="text-[10px] bg-[#28374D] text-text-secondary border border-primary-border/40 rounded-full px-2 py-0.5 font-medium">
                {matches.country}
              </span>
            )}
            {isLive && (
              <span className="flex items-center gap-1 text-accent-red font-bold text-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-accent-red animate-pulse"></span>
                LIVE
              </span>
            )}
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-lg font-bold text-white group-hover:text-accent-green transition-colors">{matches.home_team}</span>
            <span className="text-sm text-text-secondary">vs</span>
            <span className="text-lg font-bold text-white group-hover:text-accent-green transition-colors">{matches.away_team}</span>
          </div>
        </div>
        
        <div className="flex flex-col items-end shrink-0">
          <ConfidenceMeter score={confidence_score} size="md" />
        </div>
      </div>

      <div className="pt-4 border-t border-primary-border flex items-center justify-between gap-2">
        <div>
          <div className="text-xs text-text-secondary mb-1">Prediction</div>
          <div className="font-semibold text-white text-sm">
            {market} · {prediction_value.replace(/_/g, ' ')}
          </div>
        </div>
        <div className="text-right shrink-0">
          <div className="text-xs mb-2 flex items-center justify-end gap-1">
            <Clock size={11} className="text-text-secondary" />
            <span className="font-semibold text-white">{dateLabel}</span>
            <span className="text-text-secondary/50">·</span>
            <span className="text-text-secondary font-mono">{timeLabel}</span>
          </div>
          <button className="text-xs font-semibold bg-[#28374D]/40 border border-primary-border px-3 py-1.5 rounded text-white group-hover:bg-accent-green group-hover:text-[#0D1B2A] group-hover:border-accent-green transition-colors">
            View AI Report
          </button>
        </div>
      </div>
    </div>
  );
};

