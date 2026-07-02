import { Router } from 'express';
import { supabase } from '../config/supabase';
import { DataPipeline } from '../pipeline/dataSync';

export const apiRouter = Router();

// ──────────────────────────────────────────────────────────
// GET /api/predictions
// Query params: search, date
// ──────────────────────────────────────────────────────────
apiRouter.get('/predictions', async (req, res) => {
  const search  = (req.query.search  as string || '').trim().toLowerCase();
  const date    = (req.query.date    as string || '').trim();

  console.log('[API] /predictions called with:', { search, date });

  try {
    if (!supabase) {
      console.log('[API] Supabase not configured, returning sample data');
      const sampleData: any[] = DataPipeline.getSamplePredictions();
      
      // Filter sample data
      let results: any[] = sampleData;
      if (search && results.length > 0) {
        results = results.filter((p: any) =>
          p.matches?.home_team?.toLowerCase().includes(search) ||
          p.matches?.away_team?.toLowerCase().includes(search) ||
          p.matches?.league_name?.toLowerCase().includes(search)
        );
      }
      
      return res.json({ data: results.slice(0, 30) });
    }

    let query = supabase
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
      .order('confidence_score', { ascending: false });

    const { data, error } = await query;

    if (error) {
      console.error('[API] Error fetching predictions:', error);
      return res.status(500).json({ data: [], error: 'Failed to fetch predictions' });
    }

    console.log(`[API] Found ${data?.length || 0} predictions from Supabase`);

    let results: any[] = data || [];
    
    // If no predictions from DB, use sample data
    if (results.length === 0) {
      console.log('[API] No predictions in DB, using sample data');
      results = DataPipeline.getSamplePredictions();
    }

    // Filter by search
    if (search && results.length > 0) {
      results = results.filter((p: any) =>
        p.matches?.home_team?.toLowerCase().includes(search) ||
        p.matches?.away_team?.toLowerCase().includes(search) ||
        p.matches?.league_name?.toLowerCase().includes(search)
      );
    }

    // Filter by date
    if (date && results.length > 0) {
      results = results.filter((p: any) => {
        const d = p.matches?.match_date?.slice(0, 10);
        return d === date;
      });
    }

    res.json({ data: results.slice(0, 30) });
  } catch (err) {
    console.error('[API] Error handling /predictions:', err);
    // Fallback to sample data on error
    const sampleData: any[] = DataPipeline.getSamplePredictions();
    res.json({ data: sampleData.slice(0, 30) });
  }
});


// Admin route to trigger pipeline manually - support both GET and POST for easy testing
apiRouter.get('/admin/sync', async (req, res) => {
  try {
    console.log('[API] Manual sync triggered via GET');
    await DataPipeline.syncUpcomingMatchesAndPredict();
    res.json({ message: 'Sync pipeline started' });
  } catch (err) {
    console.error('[API] Error starting sync:', err);
    res.status(500).json({ error: 'Failed to start sync pipeline' });
  }
});

apiRouter.post('/admin/sync', async (req, res) => {
  try {
    console.log('[API] Manual sync triggered via POST');
    await DataPipeline.syncUpcomingMatchesAndPredict();
    res.json({ message: 'Sync pipeline started' });
  } catch (err) {
    console.error('[API] Error starting sync:', err);
    res.status(500).json({ error: 'Failed to start sync pipeline' });
  }
});
