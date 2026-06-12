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
      
      return [
        {
          fixture: { id: 1001, date: tomorrow.toISOString(), status: { short: 'NS' } },
          league: { id: leagueId, name: 'Premier League', country: 'England' },
          teams: {
            home: { id: 42, name: 'Arsenal' },
            away: { id: 49, name: 'Chelsea' }
          },
          goals: { home: null, away: null }
        },
        {
          fixture: { id: 1002, date: tomorrow.toISOString(), status: { short: 'NS' } },
          league: { id: leagueId, name: 'Premier League', country: 'England' },
          teams: {
            home: { id: 33, name: 'Manchester United' },
            away: { id: 34, name: 'Newcastle' }
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
