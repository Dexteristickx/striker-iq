import { Router } from 'express';
import { supabase } from '../config/supabase';
import { DataPipeline } from '../pipeline/dataSync';

export const apiRouter = Router();


// ──────────────────────────────────────────────────────────
// GET /api/predictions
// Query params: search, country, date
// ──────────────────────────────────────────────────────────
apiRouter.get('/predictions', async (req, res) => {
  const search  = (req.query.search  as string || '').trim().toLowerCase();
  const country = (req.query.country as string || '').trim().toLowerCase();
  
  // Default to today's date in local system/server time format YYYY-MM-DD
  const todayStr = new Date().toISOString().slice(0, 10);
  const date    = (req.query.date    as string || todayStr).trim();
  const status  = (req.query.status  as string || '').trim();

  try {
    let query = supabase
      .from('predictions')
      .select(`
        *,
        matches:match_id (
          home_team,
          away_team,
          league_name,
          match_date,
          status,
          sport,
          country
        )
      `)
      .order('confidence_score', { ascending: false });

    const { data, error } = await query;

    if (error) throw error;

    let results = data || [];

    // Filter by search
    if (search) {
      results = results.filter((p: any) =>
        p.matches?.home_team?.toLowerCase().includes(search) ||
        p.matches?.away_team?.toLowerCase().includes(search) ||
        p.matches?.league_name?.toLowerCase().includes(search)
      );
    }

    // Filter by country
    if (country) {
      results = results.filter((p: any) =>
        p.matches?.country?.toLowerCase() === country
      );
    }

    // Filter by date
    if (date) {
      results = results.filter((p: any) => {
        const d = p.matches?.match_date?.slice(0, 10);
        return d === date;
      });
    }

    // Filter by status
    if (status === 'history') {
      results = results.filter((p: any) => p.matches?.status === 'FT');
    } else if (status === 'upcoming') {
      results = results.filter((p: any) => p.matches?.status !== 'FT');
    }

    res.json({ data: results });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});


// Admin route to trigger pipeline manually
apiRouter.post('/admin/sync', async (req, res) => {
  try {
    DataPipeline.syncUpcomingMatchesAndPredict();
    res.json({ message: 'Sync pipeline started' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to start sync pipeline' });
  }
});
