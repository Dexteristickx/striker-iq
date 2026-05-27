import React from 'react';
import { X, Calendar, BarChart3, AlertCircle, Sparkles } from 'lucide-react';
import { ConfidenceMeter } from './ConfidenceMeter';

interface Prediction {
  id: string;
  confidence_score: number;
  market: string;
  prediction_value: string;
  is_banker: boolean;
  is_premium: boolean;
  odds?: number;
  matches: {
    home_team: string;
    away_team: string;
    league_name: string;
    match_date: string;
    status: string;
  };
}

interface PredictionDetailModalProps {
  prediction: Prediction | null;
  onClose: () => void;
}

export const PredictionDetailModal: React.FC<PredictionDetailModalProps> = ({ prediction, onClose }) => {
  if (!prediction) return null;

  const { matches, confidence_score, market, prediction_value, is_banker, odds = 1.80 } = prediction;
  const matchDate = new Date(matches.match_date);

  // Mocked rich telemetry for prediction details
  const probabilities = {
    home: Math.round(confidence_score * 0.7),
    draw: Math.round((100 - confidence_score) * 0.4),
    away: 100 - Math.round(confidence_score * 0.7) - Math.round((100 - confidence_score) * 0.4)
  };

  const aiFactors = [
    { name: 'Recent Team Form', weight: 42, details: 'Consistent 4-match win streak for Home' },
    { name: 'Head-to-Head History', weight: 23, details: 'Home won 4 of last 5 matchups' },
    { name: 'Squad Availability', weight: 18, details: 'Away team missing starting CB' },
    { name: 'Market Odds Value', weight: 17, details: 'Odds shortening on Home win market' }
  ];

  const headToHead = [
    { date: '2025-11-12', home: matches.home_team, away: matches.away_team, score: '3 - 1', winner: 'home' },
    { date: '2025-04-03', home: matches.away_team, away: matches.home_team, score: '0 - 2', winner: 'away' },
    { date: '2024-10-22', home: matches.home_team, away: matches.away_team, score: '1 - 1', winner: 'draw' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-[#060D15]/80 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative bg-[#0D1B2A] border border-[#28374D] w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-primary-border bg-[#1B263B]/40">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold bg-accent-green/10 text-accent-green px-2.5 py-1 rounded-full border border-accent-green/20 uppercase tracking-wider">
              {matches.league_name}
            </span>
            {is_banker && (
              <span className="text-xs font-semibold bg-amber-500/10 text-amber-500 px-2.5 py-1 rounded-full border border-amber-500/20 uppercase tracking-wider">
                ⭐ Banker Choice
              </span>
            )}
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 rounded-lg bg-[#28374D]/40 text-text-secondary hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-8">
          
          {/* Match Info Header */}
          <div className="text-center py-4 bg-[#1B263B]/20 rounded-xl border border-primary-border/40">
            <div className="grid grid-cols-3 items-center max-w-2xl mx-auto px-4">
              <div className="text-right">
                <div className="text-xl font-bold text-white mb-1">{matches.home_team}</div>
                <span className="text-xs text-text-secondary font-semibold">HOME</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-sm font-semibold bg-[#28374D] px-3 py-1 rounded text-accent-green mb-2">VS</span>
                <span className="text-[10px] text-text-secondary uppercase tracking-wider flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {matchDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                </span>
              </div>
              <div className="text-left">
                <div className="text-xl font-bold text-white mb-1">{matches.away_team}</div>
                <span className="text-xs text-text-secondary font-semibold">AWAY</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Left Column: AI Prediction Telemetry */}
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-accent-green" /> Prediction & Probability
                </h3>
                <div className="bg-[#1B263B]/30 rounded-xl p-5 border border-primary-border/30 space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-xs text-text-secondary mb-1">Target Market</div>
                      <div className="font-bold text-lg text-white">{market}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-text-secondary mb-1">AI Recommendation</div>
                      <div className="font-bold text-lg text-accent-green">{prediction_value.replace('_', ' ')}</div>
                    </div>
                  </div>

                  {/* Probability Bar */}
                  <div>
                    <div className="flex justify-between text-xs text-text-secondary font-semibold mb-2">
                      <span>Home ({probabilities.home}%)</span>
                      <span>Draw ({probabilities.draw}%)</span>
                      <span>Away ({probabilities.away}%)</span>
                    </div>
                    <div className="w-full h-3 rounded-full overflow-hidden flex bg-primary-border">
                      <div className="h-full bg-accent-green transition-all" style={{ width: `${probabilities.home}%` }} />
                      <div className="h-full bg-gray-500 transition-all" style={{ width: `${probabilities.draw}%` }} />
                      <div className="h-full bg-accent-red transition-all" style={{ width: `${probabilities.away}%` }} />
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t border-primary-border/40">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-text-secondary">Composite Confidence</span>
                      <ConfidenceMeter score={confidence_score} size="sm" />
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-text-secondary block">Model Confidence</span>
                      <span className="font-bold text-white">{confidence_score}%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Head to Head */}
              <div>
                <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-text-secondary" /> Head-to-Head History
                </h3>
                <div className="space-y-3">
                  {headToHead.map((h2h, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-[#1B263B]/20 p-3 rounded-lg border border-primary-border/20 text-xs">
                      <span className="text-text-secondary font-mono">{h2h.date}</span>
                      <div className="flex items-center gap-2 font-semibold">
                        <span className={h2h.winner === 'home' ? 'text-accent-green' : 'text-white'}>{h2h.home}</span>
                        <span className="px-2 py-0.5 bg-[#28374D] rounded text-white font-mono">{h2h.score}</span>
                        <span className={h2h.winner === 'away' ? 'text-accent-green' : 'text-white'}>{h2h.away}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: AI Feature Weights */}
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-accent-green" /> AI Model Influence Factors
                </h3>
                <div className="space-y-4">
                  {aiFactors.map((factor, idx) => (
                    <div key={idx} className="bg-[#1B263B]/30 p-4 rounded-xl border border-primary-border/30">
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-sm font-bold text-white">{factor.name}</span>
                        <span className="text-xs font-bold text-accent-green">{factor.weight}% weight</span>
                      </div>
                      <div className="w-full bg-[#28374D] h-2 rounded-full mb-2">
                        <div className="bg-accent-green h-full rounded-full" style={{ width: `${factor.weight}%` }} />
                      </div>
                      <p className="text-xs text-text-secondary">{factor.details}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-primary-border bg-[#1B263B]/40 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2 text-xs text-text-secondary">
            <AlertCircle className="w-4 h-4 text-accent-amber" />
            <span>AI probability outputs are updated real-time using current bookmaker odds ({odds}).</span>
          </div>
          <button 
            onClick={onClose} 
            className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-accent-green text-[#0D1B2A] font-bold text-sm hover:opacity-90 transition-opacity"
          >
            Close Telemetry Report
          </button>
        </div>

      </div>
    </div>
  );
};
