import axios from 'axios';

// API Documentation: https://www.api-football.com/documentation-v3

const API_KEY = process.env.API_FOOTBALL_KEY;
const BASE_URL = 'https://v3.football.api-sports.io';

if (!API_KEY) {
  console.warn('⚠️ WARNING: API_FOOTBALL_KEY NOT SET - using sample data');
} else {
  console.log('✅ API_FOOTBALL_KEY is configured');
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
  static async getUpcomingFixtures(leagueId: number, season: number = 2025, nextDays: number = 2): Promise<ApiFixture[]> {
    if (!API_KEY) {
      console.warn('API_FOOTBALL_KEY missing, returning sample data');
      return this.getSampleFixtures();
    }

    try {
      console.log(`🔍 Fetching REAL data for league ${leagueId}, season ${season}, next 30 fixtures`);
      const response = await axios.get(`${BASE_URL}/fixtures`, {
        headers: { 'x-apisports-key': API_KEY },
        params: { league: leagueId, season: season, next: 30 }
      });

      const fixtures = response.data.response || [];
      if (fixtures.length > 0) {
        console.log(`✅ Found ${fixtures.length} REAL fixtures for league ${leagueId}`);
        return fixtures;
      }

      console.warn(`⚠️ No upcoming fixtures, trying last 30 matches for league ${leagueId}`);
      const lastResponse = await axios.get(`${BASE_URL}/fixtures`, {
        headers: { 'x-apisports-key': API_KEY },
        params: { league: leagueId, season: season, last: 30 }
      });

      const lastFixtures = lastResponse.data.response || [];
      if (lastFixtures.length > 0) {
        console.log(`✅ Found ${lastFixtures.length} recent matches for league ${leagueId}`);
        return lastFixtures;
      }

      console.warn(`⚠️ No fixtures found from API, falling back to sample data`);
      return this.getSampleFixtures();
    } catch (error: any) {
      console.error('❌ Error fetching real fixtures:', error.message || error);
      console.warn('Falling back to sample data');
      return this.getSampleFixtures();
    }
  }

  static async getOdds(fixtureId: number): Promise<ApiOdds | null> {
    if (!API_KEY) {
      return null;
    }
    try {
      const response = await axios.get(`${BASE_URL}/odds`, {
        headers: { 'x-apisports-key': API_KEY },
        params: { fixture: fixtureId }
      });
      return response.data.response[0] || null;
    } catch (error: any) {
      console.error('Error fetching odds for fixture', fixtureId, ':', error.message || error);
      return null;
    }
  }

  // Sample test data - only used if real API fails
  private static getSampleFixtures(): ApiFixture[] {
    const now = new Date();
    return [
      {
        fixture: { id: 2000001, date: new Date(now.getTime() + 12 * 60 * 60 * 1000).toISOString(), status: { short: 'NS' } },
        league: { id: 1, name: 'World Cup 2026' },
        teams: { home: { name: 'Brazil', id: 6 }, away: { name: 'Argentina', id: 52 } },
        goals: { home: null, away: null }
      },
      {
        fixture: { id: 2000002, date: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString(), status: { short: 'NS' } },
        league: { id: 1, name: 'World Cup 2026' },
        teams: { home: { name: 'Germany', id: 9 }, away: { name: 'France', id: 2 } },
        goals: { home: null, away: null }
      },
      {
        fixture: { id: 2000003, date: new Date(now.getTime() + 36 * 60 * 60 * 1000).toISOString(), status: { short: 'NS' } },
        league: { id: 1, name: 'World Cup 2026' },
        teams: { home: { name: 'Spain', id: 10 }, away: { name: 'England', id: 1 } },
        goals: { home: null, away: null }
      },
      {
        fixture: { id: 1000001, date: new Date(now.getTime() + 6 * 60 * 60 * 1000).toISOString(), status: { short: 'NS' } },
        league: { id: 39, name: 'Premier League' },
        teams: { home: { name: 'Manchester City', id: 50 }, away: { name: 'Arsenal', id: 42 } },
        goals: { home: null, away: null }
      },
      {
        fixture: { id: 1000002, date: new Date(now.getTime() + 30 * 60 * 60 * 1000).toISOString(), status: { short: 'NS' } },
        league: { id: 39, name: 'Premier League' },
        teams: { home: { name: 'Liverpool', id: 40 }, away: { name: 'Chelsea', id: 49 } },
        goals: { home: null, away: null }
      },
      {
        fixture: { id: 1000003, date: new Date(now.getTime() + 18 * 60 * 60 * 1000).toISOString(), status: { short: 'NS' } },
        league: { id: 140, name: 'La Liga' },
        teams: { home: { name: 'Real Madrid', id: 541 }, away: { name: 'Barcelona', id: 529 } },
        goals: { home: null, away: null }
      }
    ];
  }
}
