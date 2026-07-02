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
      return [];
    }
    try {
      const response = await axios.get(`${BASE_URL}/fixtures`, {
        headers: { 'x-apisports-key': API_KEY },
        params: { league: leagueId, season: new Date().getFullYear(), next: 20 } // More matches
      });
      return response.data.response;
    } catch (error) {
      console.error('Error fetching fixtures:', error);
      return [];
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
}
