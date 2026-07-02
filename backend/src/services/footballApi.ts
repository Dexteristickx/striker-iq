import axios from 'axios';

// API Documentation: https://www.api-football.com/documentation-v3

const API_KEY = process.env.API_FOOTBALL_KEY;
const BASE_URL = 'https://v3.football.api-sports.io';

if (!API_KEY) {
  console.warn('WARNING: API_FOOTBALL_KEY not set');
}

export interface ApiFixture {
  fixture: {
    id: number;
    date: string;
    status: { short: string };
  };
  league: {
    id: number;
    name: string;
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
  static async getUpcomingFixtures(leagueId: number, nextDays: number = 2): Promise<ApiFixture[]> {
    if (!API_KEY) {
      console.error('API_FOOTBALL_KEY missing');
      // Return some sample test data if no API key for testing
      return this.getSampleFixtures();
    }
    try {
      // Try upcoming matches first
      console.log(`[FootballApi] Fetching upcoming fixtures for league ${leagueId}`);
      let response = await axios.get(`${BASE_URL}/fixtures`, {
        headers: { 'x-apisports-key': API_KEY },
        params: { league: leagueId, season: 2025, next: 20 }
      });
      let fixtures = response.data.response || [];
      
      // If no upcoming matches, try last matches
      if (fixtures.length === 0) {
        console.log(`[FootballApi] No upcoming fixtures, fetching last matches for league ${leagueId}`);
        response = await axios.get(`${BASE_URL}/fixtures`, {
          headers: { 'x-apisports-key': API_KEY },
          params: { league: leagueId, season: 2025, last: 20 }
        });
        fixtures = response.data.response || [];
      }
      
      // If still no data, return sample data
      if (fixtures.length === 0) {
        console.log(`[FootballApi] No fixtures from API, using sample data`);
        return this.getSampleFixtures();
      }
      
      console.log(`[FootballApi] Found ${fixtures.length} fixtures`);
      return fixtures;
    } catch (error) {
      console.error('Error fetching fixtures:', error);
      return this.getSampleFixtures();
    }
  }

  static async getOdds(fixtureId: number): Promise<ApiOdds | null> {
    if (!API_KEY) {
      console.error('API_FOOTBALL_KEY missing');
      return null;
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

  // Sample test data for when API isn't available
  private static getSampleFixtures(): ApiFixture[] {
    const now = new Date();
    return [
      {
        fixture: {
          id: 1000001,
          date: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString(),
          status: { short: 'NS' }
        },
        league: { id: 39, name: 'Premier League' },
        teams: {
          home: { name: 'Manchester City', id: 50 },
          away: { name: 'Arsenal', id: 42 }
        },
        goals: { home: null, away: null }
      },
      {
        fixture: {
          id: 1000002,
          date: new Date(now.getTime() + 48 * 60 * 60 * 1000).toISOString(),
          status: { short: 'NS' }
        },
        league: { id: 39, name: 'Premier League' },
        teams: {
          home: { name: 'Liverpool', id: 40 },
          away: { name: 'Chelsea', id: 49 }
        },
        goals: { home: null, away: null }
      },
      {
        fixture: {
          id: 1000003,
          date: new Date(now.getTime() + 72 * 60 * 60 * 1000).toISOString(),
          status: { short: 'NS' }
        },
        league: { id: 140, name: 'La Liga' },
        teams: {
          home: { name: 'Real Madrid', id: 541 },
          away: { name: 'Barcelona', id: 529 }
        },
        goals: { home: null, away: null }
      }
    ];
  }
}
