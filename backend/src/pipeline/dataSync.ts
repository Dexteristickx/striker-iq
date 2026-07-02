import { FootballApiService } from '../services/footballApi';
import { PredictionService } from '../services/predictionService';
import { supabase } from '../config/supabase';

// List of popular league IDs from API-Football
const LEAGUE_IDS = [
  39,    // England: Premier League
  140,   // Spain: La Liga
  78,    // Germany: Bundesliga
  135,   // Italy: Serie A
  61,    // France: Ligue 1
];

export class DataPipeline {
  static async syncUpcomingMatchesAndPredict() {
    console.log('[Pipeline] Starting sync pipeline for upcoming matches...');
    
    if (!supabase) {
      console.warn('[Pipeline] Supabase not configured, but will still generate sample predictions');
      // Even without Supabase, we can return sample data via API
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

  // Get sample predictions for when Supabase isn't connected
  static getSamplePredictions(): any[] {
    const now = new Date();
    return [
      {
        id: '1',
        match_id: '101',
        confidence_score: 94.5,
        market: '1X2',
        prediction_value: 'HOME_WIN',
        is_banker: true,
        is_premium: true,
        matches: {
          home_team: 'Manchester City',
          away_team: 'Arsenal',
          league_name: 'Premier League',
          match_date: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString(),
          status: 'SCHEDULED'
        }
      },
      {
        id: '2',
        match_id: '102',
        confidence_score: 91.2,
        market: '1X2',
        prediction_value: 'HOME_WIN',
        is_banker: false,
        is_premium: true,
        matches: {
          home_team: 'Liverpool',
          away_team: 'Chelsea',
          league_name: 'Premier League',
          match_date: new Date(now.getTime() + 48 * 60 * 60 * 1000).toISOString(),
          status: 'SCHEDULED'
        }
      },
      {
        id: '3',
        match_id: '103',
        confidence_score: 87.8,
        market: 'OVER_UNDER_2.5',
        prediction_value: 'OVER',
        is_banker: false,
        is_premium: false,
        matches: {
          home_team: 'Real Madrid',
          away_team: 'Barcelona',
          league_name: 'La Liga',
          match_date: new Date(now.getTime() + 72 * 60 * 60 * 1000).toISOString(),
          status: 'SCHEDULED'
        }
      }
    ];
  }
}
