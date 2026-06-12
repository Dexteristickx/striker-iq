import axios from 'axios';

// This is a mock service mimicking API-Football's structure
// API Documentation: https://www.api-football.com/documentation-v3

const API_KEY = process.env.API_FOOTBALL_KEY || 'mock_key';
const BASE_URL = 'https://v3.football.api-sports.io';

export interface ApiFixture {
  fixture: {
    id: number;
    date: string;
    status: { short: string };
  };
  league: {
    id: number;
    name: string;
    country: string;
  };
  teams: {
    home: { name: string; id: number };
    away: { name: string; id: number };
  };
  goals: {
    home: number | null;
    away: number | null;
  };
}

export interface ApiOdds {
  fixture: { id: number };
  bookmakers: {
    id: number;
    name: string;
    bets: {
      id: number;
      name: string;
      values: { value: string; odd: string }[];
    }[];
  }[];
}

export class FootballApiService {
  // Simulates fetching upcoming fixtures for a specific league
  static async getUpcomingFixtures(leagueId: number, nextDays: number = 2): Promise<ApiFixture[]> {
    if (API_KEY === 'mock_key') {
      console.log(`[Mock] Fetching upcoming fixtures for league ${leagueId}`);
      // Return dummy data
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const leagueMap: Record<number, { name: string, country: string }> = {
        39: { name: 'Premier League', country: 'England' },
        40: { name: 'Championship', country: 'England' },
        140: { name: 'La Liga', country: 'Spain' },
        141: { name: 'Segunda Division', country: 'Spain' },
        78: { name: 'Bundesliga', country: 'Germany' },
        79: { name: '2. Bundesliga', country: 'Germany' },
        135: { name: 'Serie A', country: 'Italy' },
        136: { name: 'Serie B', country: 'Italy' },
        61: { name: 'Ligue 1', country: 'France' },
        62: { name: 'Ligue 2', country: 'France' },
        88: { name: 'Eredivisie', country: 'Netherlands' },
        94: { name: 'Primeira Liga', country: 'Portugal' },
        71: { name: 'Serie A', country: 'Brazil' },
        128: { name: 'Liga Profesional', country: 'Argentina' },
        253: { name: 'MLS', country: 'USA' },
        262: { name: 'Liga MX', country: 'Mexico' },
        203: { name: 'Süper Lig', country: 'Turkey' },
        179: { name: 'Premiership', country: 'Scotland' },
        144: { name: 'Jupiler Pro League', country: 'Belgium' },
        119: { name: 'Superliga', country: 'Denmark' },
        103: { name: 'Eliteserien', country: 'Norway' },
        113: { name: 'Allsvenskan', country: 'Sweden' },
        207: { name: 'Super League', country: 'Switzerland' },
        218: { name: 'Bundesliga', country: 'Austria' }
      };

      const league = leagueMap[leagueId] || { name: 'Unknown League', country: 'International' };

      return [
        {
          fixture: { id: leagueId * 1000 + 1, date: tomorrow.toISOString(), status: { short: 'NS' } },
          league: { id: leagueId, name: league.name, country: league.country },
          teams: {
            home: { id: 1, name: `${league.country} Team A` },
            away: { id: 2, name: `${league.country} Team B` }
          },
          goals: { home: null, away: null }
        },
        {
          fixture: { id: leagueId * 1000 + 2, date: tomorrow.toISOString(), status: { short: 'NS' } },
          league: { id: leagueId, name: league.name, country: league.country },
          teams: {
            home: { id: 3, name: `${league.country} Team C` },
            away: { id: 4, name: `${league.country} Team D` }
          },
          goals: { home: null, away: null }
        }
      ];
    }

    // Real API call
    try {
      const response = await axios.get(`${BASE_URL}/fixtures`, {
        headers: { 'x-apisports-key': API_KEY },
        params: {
          league: leagueId,
          season: new Date().getFullYear(),
          next: Math.max(10, nextDays * 5)
        }
      });
      return response.data.response;
    } catch (error) {
      console.error('Error fetching fixtures:', error);
      return [];
    }
  }

  // Simulates fetching odds for a fixture
  static async getOdds(fixtureId: number): Promise<ApiOdds | null> {
    if (API_KEY === 'mock_key') {
      console.log(`[Mock] Fetching odds for fixture ${fixtureId}`);
      return {
        fixture: { id: fixtureId },
        bookmakers: [
          {
            id: 1,
            name: 'Bet365',
            bets: [
              {
                id: 1,
                name: 'Match Winner',
                values: [
                  { value: 'Home', odd: (Math.random() * 2 + 1).toFixed(2) },
                  { value: 'Draw', odd: (Math.random() * 2 + 2).toFixed(2) },
                  { value: 'Away', odd: (Math.random() * 3 + 1).toFixed(2) }
                ]
              }
            ]
          }
        ]
      };
    }

    try {
      const response = await axios.get(`${BASE_URL}/odds`, {
        headers: { 'x-apisports-key': API_KEY },
        params: { fixture: fixtureId }
      });
      return response.data.response[0] || null;
    } catch (error) {
      console.error('Error fetching odds:', error);
      return null;
    }
  }
}
