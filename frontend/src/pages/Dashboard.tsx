import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { PredictionCard } from '../components/PredictionCard';
import { StatsBanner } from '../components/StatsBanner';
import { PredictionDetailModal } from '../components/PredictionDetailModal';
import { ShieldCheck, Award, Zap, History, Table, Activity, Search, Globe, X, Loader2, CalendarDays, MapPin } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export const Dashboard: React.FC = () => {
  const [predictions, setPredictions] = useState<any[]>([]);
  const [historyPredictions, setHistoryPredictions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(false);
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
  const [availableCountries, setAvailableCountries] = useState<string[]>([]);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchPredictions = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${API_BASE}/api/predictions?status=upcoming`);
        setPredictions(response.data.data || []);
      } catch (error) {
        console.error("Failed to load predictions", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchCountries = async () => {
      try {
        const response = await axios.get(`${API_BASE}/api/countries`);
        setAvailableCountries(response.data.data || []);
      } catch (error) {
        console.error("Failed to load countries", error);
      }
    };

    fetchPredictions();
    fetchCountries();
  }, []);

  useEffect(() => {
    if (activeTab === 'history' && historyPredictions.length === 0) {
      const fetchHistory = async () => {
        setHistoryLoading(true);
        try {
          const response = await axios.get(`${API_BASE}/api/predictions?status=history`);
          setHistoryPredictions(response.data.data || []);
        } catch (error) {
          console.error("Failed to load history", error);
        } finally {
          setHistoryLoading(false);
        }
      };
      fetchHistory();
    }
  }, [activeTab, historyPredictions.length]);

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
      const response = await axios.get(`${API_BASE}/api/predictions?${params.toString()}`);
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


  // Filtering Logic
  const filteredPredictions = predictions.filter(p => {
    // Sport Filter
    if (sportFilter !== 'All Sports' && p.matches.sport !== undefined) {
      if (sportFilter.toLowerCase() !== p.matches.sport.toLowerCase()) return false;
    }

    // Confidence Filter
    if (confidenceFilter === 'Premium' && p.confidence_score < 90) return false;
    if (confidenceFilter === 'High' && (p.confidence_score < 80 || p.confidence_score >= 90)) return false;

    return true;
  });

  const banker = filteredPredictions.find(p => p.is_banker);
  const others = filteredPredictions.filter(p => p.id !== banker?.id);

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 py-5 sm:py-8">
      {/* Platform Title */}
      <header className="mb-6 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 sm:w-8 sm:h-8 text-accent-green shrink-0" />
            Striker<span className="text-accent-green">IQ</span>
          </h1>
          <p className="text-text-secondary text-xs sm:text-sm mt-0.5 hidden sm:block">High-confidence sports outcome forecasting using institutional machine learning models.</p>
        </div>
        <div className="flex gap-1.5 shrink-0">
          <button 
            onClick={() => setActiveTab('upcoming')}
            className={`px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'upcoming' 
                ? 'bg-accent-green text-[#0D1B2A]' 
                : 'bg-primary-card text-text-secondary'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Live Predictions</span>
            <span className="sm:hidden">Live</span>
          </button>
          <button 
            onClick={() => setActiveTab('history')}
            className={`px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'history' 
                ? 'bg-accent-green text-[#0D1B2A]' 
                : 'bg-primary-card text-text-secondary'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Performance Log</span>
            <span className="sm:hidden">History</span>
          </button>
        </div>
      </header>

      {/* ========== GLOBAL TEAM SEARCH ========== */}
      <div className="mb-6 rounded-xl border border-accent-green/20 bg-gradient-to-br from-[#0D1B2A] via-[#1B263B]/80 to-[#0D1B2A] p-4 sm:p-6 shadow-xl shadow-accent-green/5">
        <div className="flex items-center gap-2 mb-2">
          <Globe className="w-4 h-4 text-accent-green" />
          <span className="text-xs font-bold text-accent-green uppercase tracking-widest">Global Team Search</span>
        </div>
        <p className="text-text-secondary text-xs sm:text-sm mb-4 hidden sm:block">Search any team, league or country worldwide. Filter by date to see all matches being played that day — across every division.</p>

        {/* Team search input */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary pointer-events-none" />
          <input
            ref={searchInputRef}
            id="global-team-search-input"
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            placeholder="Search team or league (optional)"
            className="w-full bg-[#0D1B2A] border border-primary-border/60 rounded-lg pl-9 pr-9 py-2.5 text-white text-sm placeholder:text-text-secondary/50 focus:outline-none focus:border-accent-green/60 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Country + Date (side by side on all screens) */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-secondary pointer-events-none" />
            <select
              id="search-country-select"
              value={searchCountry}
              onChange={e => setSearchCountry(e.target.value)}
              className="w-full bg-[#0D1B2A] border border-primary-border/60 rounded-lg pl-8 pr-2 py-2.5 text-xs focus:outline-none focus:border-accent-green/60 transition-all appearance-none cursor-pointer"
              style={{ color: searchCountry ? 'white' : '#64748b' }}
            >
              <option value="">All Countries</option>
              {availableCountries.map(c => (
                <option key={c} value={c} style={{ color: 'white', background: '#0D1B2A' }}>{c}</option>
              ))}
            </select>
          </div>
          <div className="relative">
            <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-secondary pointer-events-none z-10" />
            <input
              id="search-date-input"
              type="date"
              value={searchDate}
              onChange={e => setSearchDate(e.target.value)}
              className="w-full bg-[#0D1B2A] border border-primary-border/60 rounded-lg pl-8 pr-2 py-2.5 text-white text-xs focus:outline-none focus:border-accent-green/60 transition-all cursor-pointer [color-scheme:dark]"
            />
          </div>
        </div>

        {/* Search button – full width on mobile */}
        <button
          id="global-search-btn"
          onClick={handleSearch}
          disabled={searchLoading}
          className="w-full py-3 rounded-lg bg-accent-green text-[#0D1B2A] font-bold text-sm flex items-center justify-center gap-2 hover:bg-accent-green/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-accent-green/20 active:scale-[0.98]"
        >
          {searchLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          {searchLoading ? 'Searching...' : 'Get Predictions'}
        </button>
        {/* Search Results */}
        {searchMode && (
          <div className="mt-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">
                  {searchLoading ? 'Searching...' : `${searchResults.length} result${searchResults.length !== 1 ? 's' : ''}`}
                </span>
                {!searchLoading && searchCountry && (
                  <span className="flex items-center gap-1 text-[10px] bg-accent-green/10 text-accent-green border border-accent-green/20 rounded-full px-2 py-0.5 font-bold">
                    <MapPin className="w-2.5 h-2.5" />{searchCountry}
                  </span>
                )}
                {!searchLoading && searchDate && (
                  <span className="flex items-center gap-1 text-[10px] bg-[#28374D] text-white border border-primary-border/40 rounded-full px-2 py-0.5 font-bold">
                    <CalendarDays className="w-2.5 h-2.5" />
                    {new Date(searchDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                  </span>
                )}
              </div>
              <button onClick={handleClearSearch} className="text-xs text-text-secondary hover:text-accent-green underline transition-colors">Clear</button>
            </div>

            {searchLoading ? (
              <div className="flex justify-center items-center py-10">
                <div className="flex flex-col items-center gap-3">
                  <div className="relative">
                    <Globe className="w-9 h-9 text-accent-green/30 animate-pulse" />
                    <Loader2 className="w-4 h-4 text-accent-green animate-spin absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                  </div>
                  <p className="text-text-secondary text-xs">Scanning global football database...</p>
                </div>
              </div>
            ) : searchResults.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {searchResults.map((prediction: any) => (
                  <PredictionCard
                    key={prediction.id}
                    prediction={prediction}
                    onSelect={setSelectedPrediction}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-[#1B263B]/30 border border-primary-border/40 rounded-xl p-6 text-center">
                <Globe className="w-7 h-7 text-text-secondary/40 mx-auto mb-2" />
                <p className="text-white font-semibold text-sm mb-1">No predictions found</p>
                <p className="text-text-secondary text-xs">Try a different country, date, or team name.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Accuracy Stats Banner */}
      <StatsBanner />

      {activeTab === 'upcoming' ? (
        <>
          {/* Quick Filters Row — single scrollable row on mobile */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 mb-6 scrollbar-hide">
            {['All Sports', 'Football', 'Basketball', 'Tennis'].map(filter => (
              <button 
                key={filter} 
                onClick={() => setSportFilter(filter)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
                  sportFilter === filter 
                    ? 'bg-[#28374D] text-accent-green border border-accent-green/30' 
                    : 'bg-[#1B263B]/60 text-text-secondary border border-transparent'
                }`}
              >
                {filter}
              </button>
            ))}
            <div className="w-px h-4 bg-primary-border/40 mx-1 shrink-0" />
            {[
              { label: 'All', value: 'All' },
              { label: '90%+', value: 'Premium' },
              { label: '80-89%', value: 'High' }
            ].map(item => (
              <button 
                key={item.value} 
                onClick={() => setConfidenceFilter(item.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
                  confidenceFilter === item.value 
                    ? 'bg-accent-green/10 text-accent-green border border-accent-green/20' 
                    : 'bg-[#1B263B]/40 text-text-secondary border border-primary-border/40'
                }`}
              >
                {item.value === 'All' ? 'All Accuracy' : item.label}
              </button>
            ))}
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
            {historyLoading ? (
              <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-accent-green"></div>
              </div>
            ) : historyPredictions.length > 0 ? (
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-primary-border bg-[#1B263B]/60 text-text-secondary font-bold">
                    <th className="p-4">Date</th>
                    <th className="p-4">Match</th>
                    <th className="p-4">League</th>
                    <th className="p-4">Market</th>
                    <th className="p-4">Prediction</th>
                    <th className="p-4 text-center">AI Confidence</th>
                    <th className="p-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-primary-border/40">
                  {historyPredictions.map(pick => (
                    <tr key={pick.id} className="hover:bg-[#1B263B]/45 transition-colors text-white font-medium">
                      <td className="p-4 text-text-secondary font-mono">{pick.matches.match_date.slice(0, 10)}</td>
                      <td className="p-4 font-bold">{pick.matches.home_team} vs {pick.matches.away_team}</td>
                      <td className="p-4 text-text-secondary">{pick.matches.league_name}</td>
                      <td className="p-4 font-mono text-xs">{pick.market}</td>
                      <td className="p-4 font-bold text-accent-green">{pick.prediction_value.replace('_', ' ')}</td>
                      <td className="p-4 text-center font-mono text-accent-green font-bold">{pick.confidence_score}%</td>
                      <td className="p-4 text-center">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold tracking-wider ${
                          pick.status === 'WON'
                            ? 'bg-accent-green/20 text-accent-green border border-accent-green/30'
                            : pick.status === 'LOST'
                            ? 'bg-accent-red/20 text-accent-red border border-accent-red/30'
                            : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                        }`}>
                          {pick.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="py-20 text-center text-text-secondary">
                No historical predictions found in the database.
              </div>
            )}
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
