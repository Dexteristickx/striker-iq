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
}

export const PredictionCard: React.FC<PredictionCardProps> = ({ prediction }) => {
  const { matches, confidence_score, market, prediction_value, is_banker } = prediction;
  
  const matchDate = new Date(matches.match_date);
  const isLive = matches.status !== 'NS' && matches.status !== 'FT';

  return (
    <div className={cn(
      "card p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl group relative overflow-hidden",
      is_banker ? "border-accent-green/50 shadow-[0_0_15px_rgba(0,230,118,0.1)]" : ""
    )}>
      {is_banker && (
        <div className="absolute top-0 right-0 bg-accent-green text-[#0D1B2A] text-[10px] font-bold px-3 py-1 rounded-bl-lg tracking-wider uppercase">
          Banker
        </div>
      )}

      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="text-xs text-text-secondary uppercase tracking-wider mb-1 flex items-center gap-1.5">
            {matches.league_name}
            {isLive && (
              <span className="flex items-center gap-1 text-accent-red font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-accent-red animate-pulse"></span>
                LIVE
              </span>
            )}
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-lg font-bold">{matches.home_team}</span>
            <span className="text-sm text-text-secondary">vs</span>
            <span className="text-lg font-bold">{matches.away_team}</span>
          </div>
        </div>
        
        <div className="flex flex-col items-end">
          <ConfidenceMeter score={confidence_score} size="md" />
        </div>
      </div>

      <div className="pt-4 border-t border-primary-border flex items-center justify-between">
        <div>
          <div className="text-xs text-text-secondary mb-1">Prediction</div>
          <div className="font-semibold text-white flex items-center gap-2">
            {market} - {prediction_value.replace('_', ' ')}
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs text-text-secondary mb-1 flex items-center justify-end gap-1">
            <Clock size={12} />
            {matchDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
          <button className="text-xs font-semibold bg-primary-card border border-primary-border px-3 py-1.5 rounded hover:bg-accent-green hover:text-[#0D1B2A] hover:border-accent-green transition-colors">
            Add to Slip
          </button>
        </div>
      </div>
    </div>
  );
};
