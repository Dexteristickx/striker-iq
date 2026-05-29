import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { PredictionCard } from '../components/PredictionCard';
import { StatsBanner } from '../components/StatsBanner';
import { PredictionDetailModal } from '../components/PredictionDetailModal';
import { ShieldCheck, Award, Zap, History, Table, Activity, Search, Globe, X, Loader2, CalendarDays, MapPin } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const [predictions, setPredictions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sportFilter, setSportFilter] = useState('All Sports');
  const [confidenceFilter, setConfidenceFilter] = useState('All');
  const [activeTab, setActiveTab] = useState<'upcoming' | 'history'>('upcoming');
  const [selectedPrediction, setSelectedPrediction] = useState<any | null>(null);

  // Global Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchCountry, setSearchCountry] = useState('');
  const [searchDate, setSearchDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchMode, setSearchMode] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const COUNTRIES = [
    'England','Spain','Germany','Italy','France','Portugal','Netherlands',
    'Brazil','Argentina','Colombia','Mexico','USA',
    'Nigeria','South Africa','Ghana','Kenya','Egypt','Morocco',
    'Saudi Arabia','Japan','Turkey','Russia','Ukraine','Belgium','Scotland',
    'Champions League','Europa League'
  ];

  useEffect(() => {
    const fetchPredictions = async () => {
      try {
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

  const handleSearch = async () => {
    const hasInput = searchQuery.trim() || searchCountry || searchDate;
    if (!hasInput) return;
    setSearchLoading(true);
    setSearchMode(true);
    setSearchResults([]);
    try {
      const params = new URLSearchParams();
      if (searchQuery.trim()) params.set('search', searchQuery.trim());
      if (searchCountry) params.set('country', searchCountry);
      if (searchDate) params.set('date', searchDate);
      const response = await axios.get(`http://localhost:3000/api/predictions?${params.toString()}`);
      setSearchResults(response.data.data || []);
    } catch (error) {
      console.error('Search failed', error);
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setSearchCountry('');
    setSearchDate(new Date().toISOString().slice(0, 10));
    setSearchResults([]);
    setSearchMode(false);
    searchInputRef.current?.focus();
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch();
    if (e.key === 'Escape') handleClearSearch();
  };

  // Mocked historical settled predictions for the transparent performance log
  const historicalPicks = [
    {
      id: 'h1',
      home_team: 'Manchester City',
      away_team: 'Real Madrid',
      league: 'Champions League',
      date: '2026-05-26',
      market: '1X2',
      prediction: 'HOME_WIN',
      confidence: 94.2,
      result: '4 - 0',
      status: 'WON',
      odds: 1.65
    },
    {
      id: 'h2',
      home_team: 'Bayern Munich',
      away_team: 'Dortmund',
      league: 'Bundesliga',
      date: '2026-05-25',
      market: 'OVER_UNDER_2.5',
      prediction: 'OVER',
      confidence: 91.8,
      result: '3 - 2',
      status: 'WON',
      odds: 1.55
    },
    {
      id: 'h3',
      home_team: 'PSG',
      away_team: 'Marseille',
      league: 'Ligue 1',
      date: '2026-05-24',
      market: '1X2',
      prediction: 'HOME_WIN',
      confidence: 90.5,
      result: '2 - 0',
      status: 'WON',
      odds: 1.42
    },
    {
      id: 'h4',
      home_team: 'Juventus',
      away_team: 'Napoli',
      league: 'Serie A',
      date: '2026-05-23',
      market: 'BTTS',
      prediction: 'YES',
      confidence: 88.4,
      result: '1 - 2',
      status: 'WON',
      odds: 1.85
    },
    {
      id: 'h5',
      home_team: 'Liverpool',
      away_team: 'Aston Villa',
      league: 'Premier League',
      date: '2026-05-23',
      market: '1X2',
      prediction: 'HOME_WIN',
      confidence: 92.1,
      result: '1 - 1',
      status: 'LOST',
      odds: 1.50
    }
  ];

  // Filtering Logic
  const filteredPredictions = predictions.filter(p => {
    // Sport Filter
    if (sportFilter !== 'All Sports' && p.matches.league_name !== undefined) {
      const matchLeague = p.matches.league_name.toLowerCase();
      if (sportFilter === 'Football' && !matchLeague.includes('league') && !matchLeague.includes('la liga') && !matchLeague.includes('serie a')) return false;
      if (sportFilter === 'Basketball' && !matchLeague.includes('nba')) return false;
      if (sportFilter === 'Tennis' && !matchLeague.includes('atp') && !matchLeague.includes('wta')) return false;
    }

    // Confidence Filter
    if (confidenceFilter === 'Premium' && p.confidence_score < 90) return false;
    if (confidenceFilter === 'High' && (p.confidence_score < 80 || p.confidence_score >= 90)) return false;

    return true;
  });

  const banker = filteredPredictions.find(p => p.is_banker);
  const others = filteredPredictions.filter(p => p.id !== banker?.id);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Platform Title */}
      <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <ShieldCheck className="w-8 h-8 text-accent-green" /> Striker<span className="text-accent-green">IQ</span>
          </h1>
          <p className="text-text-secondary mt-1">High-confidence sports outcome forecasting using institutional machine learning models.</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setActiveTab('upcoming')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all ${
              activeTab === 'upcoming' 
                ? 'bg-accent-green text-[#0D1B2A] shadow-lg shadow-accent-green/10' 
                : 'bg-primary-card text-text-secondary hover:text-white'
            }`}
          >
            <Zap className="w-4 h-4" /> Live Predictions
          </button>
          <button 
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all ${
              activeTab === 'history' 
                ? 'bg-accent-green text-[#0D1B2A] shadow-lg shadow-accent-green/10' 
                : 'bg-primary-card text-text-secondary hover:text-white'
            }`}
          >
            <History className="w-4 h-4" /> Performance Log
          </button>
        </div>
      </header>

      {/* ========== GLOBAL TEAM SEARCH ========== */}
      <div className="mb-10 rounded-2xl border border-accent-green/20 bg-gradient-to-r from-[#0D1B2A] via-[#1B263B]/80 to-[#0D1B2A] p-6 shadow-xl shadow-accent-green/5">
        <div className="flex items-center gap-2 mb-3">
          <Globe className="w-5 h-5 text-accent-green" />
          <span className="text-sm font-bold text-accent-green uppercase tracking-widest">Global Team Search</span>
        </div>
        <p className="text-text-secondary text-sm mb-5">Search any team, league or country worldwide. Filter by date to see all matches being played that day — across every division.</p>

        {/* Row 1: Team search */}
        <div className="flex gap-3 mb-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary pointer-events-none" />
            <input
              ref={searchInputRef}
              id="global-team-search-input"
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              placeholder="Team name e.g. Kaizer Chiefs, Al Ahly, Flamengo… (optional)"
              className="w-full bg-[#0D1B2A] border border-primary-border/60 rounded-xl pl-10 pr-10 py-3 text-white text-sm placeholder:text-text-secondary/50 focus:outline-none focus:border-accent-green/60 focus:ring-2 focus:ring-accent-green/10 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-white transition-colors"
                aria-label="Clear team search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Row 2: Country + Date + Button */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Country selector */}
          <div className="relative flex-1">
            <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary pointer-events-none" />
            <select
              id="search-country-select"
              value={searchCountry}
              onChange={e => setSearchCountry(e.target.value)}
              className="w-full bg-[#0D1B2A] border border-primary-border/60 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-accent-green/60 focus:ring-2 focus:ring-accent-green/10 transition-all appearance-none cursor-pointer"
              style={{ color: searchCountry ? 'white' : '#64748b' }}
            >
              <option value="">All Countries / Competitions</option>
              {COUNTRIES.map(c => (
                <option key={c} value={c} style={{ color: 'white', background: '#0D1B2A' }}>{c}</option>
              ))}
            </select>
          </div>

          {/* Date picker */}
          <div className="relative flex-1">
            <CalendarDays className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary pointer-events-none z-10" />
            <input
              id="search-date-input"
              type="date"
              value={searchDate}
              onChange={e => setSearchDate(e.target.value)}
              className="w-full bg-[#0D1B2A] border border-primary-border/60 rounded-xl pl-10 pr-4 py-3 text-white text-sm focus:outline-none focus:border-accent-green/60 focus:ring-2 focus:ring-accent-green/10 transition-all cursor-pointer [color-scheme:dark]"
            />
          </div>

          {/* Search button */}
          <button
            id="global-search-btn"
            onClick={handleSearch}
            disabled={searchLoading}
            className="px-7 py-3 rounded-xl bg-accent-green text-[#0D1B2A] font-bold text-sm flex items-center gap-2 hover:bg-accent-green/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-accent-green/20 active:scale-95 whitespace-nowrap"
          >
            {searchLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Search className="w-4 h-4" />
            )}
            {searchLoading ? 'Searching...' : 'Search'}
          </button>
        </div>

        {/* Search Results */}
        {searchMode && (
          <div className="mt-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">
                {searchLoading ? 'Fetching global predictions...' : `${searchResults.length} result${searchResults.length !== 1 ? 's' : ''} for "${searchQuery}"`}
              </span>
              <button onClick={handleClearSearch} className="text-xs text-text-secondary hover:text-accent-green underline transition-colors">Clear results</button>
            </div>

            {searchLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="flex flex-col items-center gap-3">
                  <div className="relative">
                    <Globe className="w-10 h-10 text-accent-green/30 animate-pulse" />
                    <Loader2 className="w-5 h-5 text-accent-green animate-spin absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                  </div>
                  <p className="text-text-secondary text-sm">Scanning global football database...</p>
                </div>
              </div>
            ) : searchResults.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {searchResults.map((prediction: any) => (
                  <PredictionCard
                    key={prediction.id}
                    prediction={prediction}
                    onSelect={setSelectedPrediction}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-[#1B263B]/30 border border-primary-border/40 rounded-xl p-8 text-center">
                <Globe className="w-8 h-8 text-text-secondary/40 mx-auto mb-3" />
                <p className="text-white font-semibold mb-1">No active predictions found</p>
                <p className="text-text-secondary text-sm">No upcoming matches found for <span className="text-accent-green font-bold">"{searchQuery}"</span>. Try a different team name or check back before matchday.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Accuracy Stats Banner */}
      <StatsBanner />

      {activeTab === 'upcoming' ? (
        <>
          {/* Quick Filters Row */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            {/* Sports filters */}
            <div className="flex gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
              {['All Sports', 'Football', 'Basketball', 'Tennis'].map(filter => (
                <button 
                  key={filter} 
                  onClick={() => setSportFilter(filter)}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                    sportFilter === filter 
                      ? 'bg-[#28374D] text-accent-green border border-accent-green/30' 
                      : 'bg-[#1B263B]/60 text-text-secondary hover:text-white border border-transparent'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>

            {/* Confidence Threshold filters */}
            <div className="flex gap-2 w-full sm:w-auto">
              <span className="text-xs font-bold text-text-secondary flex items-center mr-1">Accuracy Filter:</span>
              {[
                { label: 'All', value: 'All' },
                { label: '90%+ Premium', value: 'Premium' },
                { label: '80-89% High', value: 'High' }
              ].map(item => (
                <button 
                  key={item.value} 
                  onClick={() => setConfidenceFilter(item.value)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    confidenceFilter === item.value 
                      ? 'bg-accent-green/10 text-accent-green border border-accent-green/20' 
                      : 'bg-[#1B263B]/40 text-text-secondary border border-primary-border/40 hover:text-white'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-green"></div>
            </div>
          ) : (
            <>
              {/* Banker of the Day */}
              {banker && (
                <div className="mb-10">
                  <h2 className="text-sm font-extrabold text-accent-green uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Award className="w-5 h-5" /> Banker of the Day (Max Accuracy)
                  </h2>
                  <div className="transform scale-[1.01] hover:scale-[1.015] transition-all">
                    <PredictionCard prediction={banker} onSelect={setSelectedPrediction} />
                  </div>
                </div>
              )}

              {/* 90%+ Premium Picks Section */}
              <div className="mb-10">
                <h2 className="text-sm font-extrabold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-accent-green" /> Premium predictions (90%+)
                </h2>
                {others.filter(p => p.confidence_score >= 90).length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {others.filter(p => p.confidence_score >= 90).map(prediction => (
                      <PredictionCard 
                        key={prediction.id} 
                        prediction={prediction} 
                        onSelect={setSelectedPrediction} 
                      />
                    ))}
                  </div>
                ) : (
                  <div className="bg-[#1B263B]/20 border border-primary-border/40 rounded-xl p-8 text-center text-text-secondary text-sm">
                    No active 90%+ predictions available for the selected sport. Check back closer to match kickoff times.
                  </div>
                )}
              </div>
              
              {/* 80-89% High Confidence Section */}
              <div>
                <h2 className="text-sm font-extrabold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-text-secondary" /> High Confidence predictions (80-89%)
                </h2>
                {others.filter(p => p.confidence_score >= 80 && p.confidence_score < 90).length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {others.filter(p => p.confidence_score >= 80 && p.confidence_score < 90).map(prediction => (
                      <PredictionCard 
                        key={prediction.id} 
                        prediction={prediction} 
                        onSelect={setSelectedPrediction} 
                      />
                    ))}
                  </div>
                ) : (
                  <div className="bg-[#1B263B]/20 border border-primary-border/40 rounded-xl p-8 text-center text-text-secondary text-sm">
                    No active 80-89% predictions available.
                  </div>
                )}
              </div>
            </>
          )}
        </>
      ) : (
        /* Historical Performance Log Tab */
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
              <Table className="w-5 h-5 text-accent-green" /> Verified Prediction Log
            </h2>
            <p className="text-text-secondary text-sm">100% transparent historical ledger. Settled predictions are archived immediately post-match.</p>
          </div>

          <div className="overflow-x-auto rounded-xl border border-primary-border bg-[#1B263B]/20 backdrop-blur-md">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-primary-border bg-[#1B263B]/60 text-text-secondary font-bold">
                  <th className="p-4">Date</th>
                  <th className="p-4">Match</th>
                  <th className="p-4">League</th>
                  <th className="p-4">Market</th>
                  <th className="p-4">Prediction</th>
                  <th className="p-4 text-center">AI Confidence</th>
                  <th className="p-4 text-center">Score</th>
                  <th className="p-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary-border/40">
                {historicalPicks.map(pick => (
                  <tr key={pick.id} className="hover:bg-[#1B263B]/45 transition-colors text-white font-medium">
                    <td className="p-4 text-text-secondary font-mono">{pick.date}</td>
                    <td className="p-4 font-bold">{pick.home_team} vs {pick.away_team}</td>
                    <td className="p-4 text-text-secondary">{pick.league}</td>
                    <td className="p-4 font-mono text-xs">{pick.market}</td>
                    <td className="p-4 font-bold text-accent-green">{pick.prediction.replace('_', ' ')}</td>
                    <td className="p-4 text-center font-mono text-accent-green font-bold">{pick.confidence}%</td>
                    <td className="p-4 text-center font-mono">{pick.result}</td>
                    <td className="p-4 text-center">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold tracking-wider ${
                        pick.status === 'WON' 
                          ? 'bg-accent-green/20 text-accent-green border border-accent-green/30' 
                          : 'bg-accent-red/20 text-accent-red border border-accent-red/30'
                      }`}>
                        {pick.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Prediction Details Telemetry Modal */}
      <PredictionDetailModal 
        prediction={selectedPrediction} 
        onClose={() => setSelectedPrediction(null)} 
      />
    </div>
  );
};
