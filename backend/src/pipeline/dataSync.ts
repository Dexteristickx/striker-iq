import { FootballApiService } from '../services/footballApi';
import { PredictionService } from '../services/predictionService';
import { supabase } from '../config/supabase';

export class DataPipeline {
  static async syncUpcomingMatchesAndPredict() {
    console.log('[Pipeline] Starting sync pipeline for upcoming matches...');
    
    // Major Leagues to sync: Premier League (39), La Liga (140), Bundesliga (78), Serie A (135), Ligue 1 (61)
    const LEAGUE_IDS = [39, 140, 78, 135, 61];
    
    for (const leagueId of LEAGUE_IDS) {
      console.log(`[Pipeline] Syncing league ID: ${leagueId}`);
      // 1. Fetch upcoming matches
      const fixtures = await FootballApiService.getUpcomingFixtures(leagueId, 7);

      for (const item of fixtures) {
      try {
        const fixtureId = item.fixture.id;
        
        // 2. Insert or update the match in Supabase
        const { data: matchData, error: matchError } = await supabase
          .from('matches')
          .upsert({
            api_fixture_id: fixtureId,
            sport: 'football',
            league_id: item.league.id,
            league_name: item.league.name,
            country: item.league.country,
            home_team: item.teams.home.name,
            away_team: item.teams.away.name,
            match_date: item.fixture.date,
            status: item.fixture.status.short,
            updated_at: new Date().toISOString()
          }, { onConflict: 'api_fixture_id' })
          .select('id')
          .single();

        if (matchError) {
          console.error(`Error upserting match ${fixtureId}:`, matchError);
          continue;
        }

        const internalMatchId = matchData.id;

        // 3. Fetch odds (to use as a feature)
        const odds = await FootballApiService.getOdds(fixtureId);
        
        // 4. Prepare features for ML Model
        const features = {
          home_team: item.teams.home.name,
          away_team: item.teams.away.name,
          league_id: item.league.id,
          match_date: item.fixture.date,
          features: {
            has_odds: odds !== null,
            // Mocking other features that would normally be calculated from historical data
            home_form: Math.random(),
            away_form: Math.random(),
            h2h_home_win_rate: 0.4,
            home_xg: 1.5,
            away_xg: 1.1
          }
        };

        // 5. Get Prediction
        const prediction = await PredictionService.getPrediction(features);
        
        if (prediction) {
          // 6. Save prediction to Supabase
          const { error: predError } = await supabase
            .from('predictions')
            .upsert({
              match_id: internalMatchId,
              confidence_score: prediction.confidence_score,
              market: prediction.market,
              prediction_value: prediction.prediction_value,
              is_banker: prediction.confidence_score >= 95,
              is_premium: prediction.confidence_score >= 90,
              features_json: features.features,
              updated_at: new Date().toISOString()
            }, { onConflict: 'match_id, market' });

            if (predError) {
              console.error(`Error saving prediction for match ${fixtureId}:`, predError);
            } else {
              console.log(`[Pipeline] Processed and predicted for ${item.teams.home.name} vs ${item.teams.away.name} (Confidence: ${prediction.confidence_score})`);
            }
          }

        } catch (err) {
          console.error(`[Pipeline] Error processing fixture ${item.fixture.id}:`, err);
        }
      }
    }
    console.log('[Pipeline] Sync pipeline finished.');
  }
}
