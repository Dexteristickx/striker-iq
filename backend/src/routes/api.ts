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
      console.error('[API] Error fetching predictions from Supabase:', error);
      return res.status(500).json({ 
        data: [], 
        error: 'Failed to fetch predictions from database',
        tip: 'Try calling /api/admin/sync to populate the database first!' 
      });
    }

    console.log(`[API] Found ${data?.length || 0} predictions in Supabase`);

    let results: any[] = data || [];
    
    // Only use sample data if DB is empty AND we don't have a sync running
    if (results.length === 0) {
      console.warn('[API] No predictions in Supabase - use /api/admin/sync to populate data');
      // Still return sample data for now, but with a tip
      return res.json({ 
        data: DataPipeline.getSamplePredictions().slice(0, 30),
        tip: 'No real data yet - call /api/admin/sync to start syncing real matches!' 
      });
    }

    if (search && results.length > 0) {
      results = results.filter((p: any) =>
        p.matches?.home_team?.toLowerCase().includes(search) ||
        p.matches?.away_team?.toLowerCase().includes(search) ||
        p.matches?.league_name?.toLowerCase().includes(search)
      );
    }

    if (date && results.length > 0) {
      results = results.filter((p: any) => {
        const d = p.matches?.match_date?.slice(0, 10);
        return d === date;
      });
    }

    res.json({ data: results.slice(0, 30) });
  } catch (err) {
    console.error('[API] Error handling /predictions:', err);
    res.json({ data: DataPipeline.getSamplePredictions().slice(0, 30) });
  }
});


// Admin route to trigger pipeline manually - support both GET and POST for easy testing
apiRouter.get('/admin/sync', async (req, res) => {
  console.log('[API] 🚀 MANUAL SYNC TRIGGERED VIA GET');
  try {
    // Run in background so request doesn't time out
    DataPipeline.syncUpcomingMatchesAndPredict()
      .then(() => console.log('[API] ✅ Sync completed successfully!'))
      .catch(err => console.error('[API] ❌ Sync failed:', err));

    res.json({ 
      message: 'Sync pipeline started successfully! Check your Vercel logs for details.',
      next_step: 'Wait 30-60 seconds, then refresh /api/predictions!'
    });
  } catch (err) {
    console.error('[API] Error starting sync:', err);
    res.status(500).json({ error: 'Failed to start sync pipeline' });
  }
});

apiRouter.post('/admin/sync', async (req, res) => {
  console.log('[API] 🚀 MANUAL SYNC TRIGGERED VIA POST');
  try {
    DataPipeline.syncUpcomingMatchesAndPredict()
      .then(() => console.log('[API] ✅ Sync completed successfully!'))
      .catch(err => console.error('[API] ❌ Sync failed:', err));

    res.json({ 
      message: 'Sync pipeline started successfully! Check your Vercel logs for details.',
      next_step: 'Wait 30-60 seconds, then refresh /api/predictions!'
    });
  } catch (err) {
    console.error('[API] Error starting sync:', err);
    res.status(500).json({ error: 'Failed to start sync pipeline' });
  }
});
