import { Router } from 'express';
import { supabase } from '../config/supabase';
import { DataPipeline } from '../pipeline/dataSync';

export const apiRouter = Router();

// Get top predictions for the dashboard
apiRouter.get('/predictions', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('predictions')
      .select(`
        *,
        matches:match_id (
          home_team,
          away_team,
          league_name,
          match_date,
          status
        )
      `)
      .order('confidence_score', { ascending: false })
      .limit(20);

    if (error) {
      console.warn("Supabase fetch failed, returning mock data...", error.message);
      throw error;
    }
    res.json({ data });
  } catch (err) {
    // Return mock data for local testing without Supabase setup
    const mockData = [
      {
        id: '1',
        confidence_score: 96.5,
        market: '1X2',
        prediction_value: 'HOME_WIN',
        is_banker: true,
        is_premium: true,
        matches: {
          home_team: 'Arsenal',
          away_team: 'Chelsea',
          league_name: 'Premier League',
          match_date: new Date(Date.now() + 86400000).toISOString(),
          status: 'NS'
        }
      },
      {
        id: '2',
        confidence_score: 91.2,
        market: 'OVER_UNDER_2.5',
        prediction_value: 'OVER',
        is_banker: false,
        is_premium: true,
        matches: {
          home_team: 'Real Madrid',
          away_team: 'Barcelona',
          league_name: 'La Liga',
          match_date: new Date(Date.now() + 172800000).toISOString(),
          status: 'NS'
        }
      },
      {
        id: '3',
        confidence_score: 84.0,
        market: 'BTTS',
        prediction_value: 'YES',
        is_banker: false,
        is_premium: false,
        matches: {
          home_team: 'AC Milan',
          away_team: 'Inter',
          league_name: 'Serie A',
          match_date: new Date(Date.now() + 4000000).toISOString(),
          status: 'NS'
        }
      }
    ];
    res.json({ data: mockData });
  }
});

// Admin route to trigger pipeline manually
apiRouter.post('/admin/sync', async (req, res) => {
  try {
    // Run async, don't wait for it to finish completely to avoid timeout
    DataPipeline.syncUpcomingMatchesAndPredict();
    res.json({ message: 'Sync pipeline started' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to start sync pipeline' });
  }
});
