import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { PredictionCard } from '../components/PredictionCard';

export const Dashboard: React.FC = () => {
  const [predictions, setPredictions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch predictions from backend
    const fetchPredictions = async () => {
      try {
        // In a real scenario, the backend runs on a specific port. We assume 3000 here.
        const response = await axios.get('http://localhost:3000/api/predictions');
        setPredictions(response.data.data || []);
      } catch (error) {
        console.error("Failed to load predictions", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPredictions();
  }, []);

  const banker = predictions.find(p => p.is_banker);
  const others = predictions.filter(p => p.id !== banker?.id);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Today's Top Predictions</h1>
        <p className="text-text-secondary">AI-driven analysis for the sharpest bettors.</p>
      </header>

      {/* Quick Filters */}
      <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
        {['All Sports', 'Football', 'Basketball', 'Tennis'].map(filter => (
          <button key={filter} className="px-4 py-2 rounded-full text-sm font-semibold bg-primary-card text-text-secondary hover:bg-accent-green hover:text-[#0D1B2A] transition-colors whitespace-nowrap">
            {filter}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-green"></div>
        </div>
      ) : (
        <>
          {banker && (
            <div className="mb-10">
              <h2 className="text-xl font-bold text-accent-green mb-4 flex items-center gap-2">
                <span className="glow-green">★</span> Banker of the Day
              </h2>
              <div className="transform scale-[1.02] transition-transform">
                <PredictionCard prediction={banker} />
              </div>
            </div>
          )}

          <div>
            <h2 className="text-xl font-bold text-white mb-4">Premium Picks (90%+)</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {others.filter(p => p.confidence_score >= 90).map(prediction => (
                <PredictionCard key={prediction.id} prediction={prediction} />
              ))}
            </div>
          </div>
          
          <div className="mt-10">
            <h2 className="text-xl font-bold text-white mb-4">High Confidence (80-89%)</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {others.filter(p => p.confidence_score >= 80 && p.confidence_score < 90).map(prediction => (
                <PredictionCard key={prediction.id} prediction={prediction} />
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
