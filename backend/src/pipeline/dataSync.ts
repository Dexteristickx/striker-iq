import { FootballApiService } from '../services/footballApi';
import { PredictionService } from '../services/predictionService';
import { supabase } from '../config/supabase';

// List of popular league IDs from API-Football - let's start with just a few to test
const LEAGUE_IDS = [
  39,    // England: Premier League (start with just this first!)
];

export class DataPipeline {
  static async syncUpcomingMatchesAndPredict() {
    console.log('[Pipeline] Starting sync pipeline for upcoming matches...');
    
    if (!supabase) {
      console.warn('[Pipeline] Supabase not configured, skipping sync');
      return;
    }

    console.log('[Pipeline] Supabase client initialized successfully');

    const db = supabase as any;

    for (const leagueId of LEAGUE_IDS) {
      console.log(`[Pipeline] Processing league ID ${leagueId}`);
      
      try {
        const fixtures = await FootballApiService.getUpcomingFixtures(leagueId, 2);
        console.log(`[Pipeline] Found ${fixtures.length} fixtures for league ${leagueId}`);
        
        if (fixtures.length === 0) {
          console.log(`[Pipeline] No fixtures found for league ${leagueId}, moving on...`);
          continue;
        }

        for (const item of fixtures) {
          try {
            const fixtureId = item.fixture.id;
            console.log(`[Pipeline] Processing fixture ${fixtureId}: ${item.teams.home.name} vs ${item.teams.away.name}`);
            
            // 2. Insert or update the match in Supabase
            const { data: matchData, error: matchError } = await db
              .from('matches')
              .upsert({
                api_fixture_id: fixtureId,
                sport: 'football',
                league_id: item.league.id,
                league_name: item.league.name,
                home_team: item.teams.home.name,
                away_team: item.teams.away.name,
                match_date: item.fixture.date,
                status: item.fixture.status.short,
                updated_at: new Date().toISOString()
              }, { onConflict: 'api_fixture_id' })
              .select('id')
              .single();

            if (matchError) {
              console.error(`[Pipeline] Error upserting match ${fixtureId}:`, matchError);
              continue;
            }

            console.log(`[Pipeline] Match saved successfully: ${matchData.id}`);

            const internalMatchId = matchData.id;

            // 3. Fetch odds (to use as a feature)
            const odds = await FootballApiService.getOdds(fixtureId);
            console.log(`[Pipeline] Odds fetched:`, odds ? 'Yes' : 'No');
            
            // 4. Prepare features for ML Model
            const features = {
              home_team: item.teams.home.name,
              away_team: item.teams.away.name,
              league_id: item.league.id,
              match_date: item.fixture.date,
              features: {
                has_odds: odds !== null,
                home_form: Math.random(),
                away_form: Math.random(),
                h2h_home_win_rate: 0.4,
                home_xg: 1.5,
                away_xg: 1.1
              }
            };

            // 5. Get Prediction
            const prediction = await PredictionService.getPrediction(features);
            console.log(`[Pipeline] Prediction generated:`, prediction);
            
            if (prediction) {
              // 6. Save prediction to Supabase
              const { error: predError } = await db
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
                console.error(`[Pipeline] Error saving prediction for match ${fixtureId}:`, predError);
              } else {
                console.log(`[Pipeline] ✅ Prediction saved successfully: ${item.teams.home.name} vs ${item.teams.away.name} (Confidence: ${prediction.confidence_score})`);
              }
            }
          } catch (err) {
            console.error(`[Pipeline] ❌ Error processing fixture ${item.fixture.id}:`, err);
          }
        }
      } catch (err) {
        console.error(`[Pipeline] ❌ Error processing league ${leagueId}:`, err);
      }
    }
    
    console.log('[Pipeline] 🎉 Sync pipeline finished.');
  }
}
