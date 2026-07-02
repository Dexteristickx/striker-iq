import { FootballApiService } from '../services/footballApi';
import { PredictionService } from '../services/predictionService';
import { supabase } from '../config/supabase';

// List of popular leagues, including World Cup 2026
interface LeagueConfig {
  id: number;
  season: number;
  name: string;
}

const LEAGUES: LeagueConfig[] = [
  { id: 1, season: 2026, name: 'World Cup 2026' }, // World Cup!
  { id: 39, season: 2025, name: 'Premier League' },
  { id: 140, season: 2025, name: 'La Liga' },
  { id: 78, season: 2025, name: 'Bundesliga' },
  { id: 135, season: 2025, name: 'Serie A' },
  { id: 61, season: 2025, name: 'Ligue 1' },
  { id: 2, season: 2025, name: 'UEFA Champions League' },
  { id: 3, season: 2025, name: 'UEFA Europa League' },
  { id: 88, season: 2025, name: 'Eredivisie' },
  { id: 94, season: 2025, name: 'Primeira Liga' },
  { id: 13, season: 2025, name: 'Serie A Brasil' },
  { id: 203, season: 2025, name: 'MLS' }
];

export class DataPipeline {
  static async syncUpcomingMatchesAndPredict() {
    console.log('[Pipeline] Starting sync pipeline for upcoming matches...');
    
    if (!supabase) {
      console.warn('[Pipeline] Supabase not configured, but will still generate sample predictions');
      return;
    }

    console.log('[Pipeline] Supabase client initialized successfully');
    const db = supabase as any;

    for (const league of LEAGUES) {
      console.log(`[Pipeline] Processing league: ${league.name} (id: ${league.id}, season: ${league.season})`);
      
      try {
        const fixtures = await FootballApiService.getUpcomingFixtures(league.id, league.season, 2);
        console.log(`[Pipeline] Found ${fixtures.length} fixtures for league ${league.name}`);
        
        if (fixtures.length === 0) {
          console.log(`[Pipeline] No fixtures found for league ${league.name}, moving on...`);
          continue;
        }

        for (const item of fixtures) {
          try {
            const fixtureId = item.fixture.id;
            console.log(`[Pipeline] Processing fixture ${fixtureId}: ${item.teams.home.name} vs ${item.teams.away.name}`);
            
            // Insert or update the match in Supabase
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

            // Fetch odds (to use as a feature)
            const odds = await FootballApiService.getOdds(fixtureId);
            console.log(`[Pipeline] Odds fetched:`, odds ? 'Yes' : 'No');
            
            // Prepare features for ML Model
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

            // Get Prediction
            const prediction = await PredictionService.getPrediction(features);
            console.log(`[Pipeline] Prediction generated:`, prediction);
            
            if (prediction) {
              // Save prediction to Supabase
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
        console.error(`[Pipeline] ❌ Error processing league ${league.name}:`, err);
      }
    }
    
    console.log('[Pipeline] 🎉 Sync pipeline finished.');
  }

  // Get sample predictions for when Supabase isn't connected
  static getSamplePredictions(): any[] {
    const now = new Date();
    return [
      // World Cup 2026
      {
        id: 'wc-1',
        match_id: 'wc-match-1',
        confidence_score: 97,
        market: '1X2',
        prediction_value: 'HOME_WIN',
        is_banker: true,
        is_premium: true,
        matches: {
          home_team: 'Brazil',
          away_team: 'Argentina',
          league_name: 'World Cup 2026',
          match_date: new Date(now.getTime() + 12 * 60 * 60 * 1000).toISOString(),
          status: 'SCHEDULED'
        }
      },
      {
        id: 'wc-2',
        match_id: 'wc-match-2',
        confidence_score: 94,
        market: 'OVER_UNDER_2.5',
        prediction_value: 'OVER',
        is_banker: false,
        is_premium: true,
        matches: {
          home_team: 'Germany',
          away_team: 'France',
          league_name: 'World Cup 2026',
          match_date: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString(),
          status: 'SCHEDULED'
        }
      },
      
      // Premier League
      {
        id: 'pl-1',
        match_id: 'pl-match-1',
        confidence_score: 95,
        market: '1X2',
        prediction_value: 'HOME_WIN',
        is_banker: true,
        is_premium: true,
        matches: {
          home_team: 'Manchester City',
          away_team: 'Arsenal',
          league_name: 'Premier League',
          match_date: new Date(now.getTime() + 6 * 60 * 60 * 1000).toISOString(),
          status: 'SCHEDULED'
        }
      },
      {
        id: 'pl-2',
        match_id: 'pl-match-2',
        confidence_score: 90,
        market: 'BTTS',
        prediction_value: 'YES',
        is_banker: false,
        is_premium: true,
        matches: {
          home_team: 'Liverpool',
          away_team: 'Chelsea',
          league_name: 'Premier League',
          match_date: new Date(now.getTime() + 30 * 60 * 60 * 1000).toISOString(),
          status: 'SCHEDULED'
        }
      },
      
      // La Liga
      {
        id: 'll-1',
        match_id: 'll-match-1',
        confidence_score: 92,
        market: '1X2',
        prediction_value: 'HOME_WIN',
        is_banker: false,
        is_premium: true,
        matches: {
          home_team: 'Real Madrid',
          away_team: 'Barcelona',
          league_name: 'La Liga',
          match_date: new Date(now.getTime() + 18 * 60 * 60 * 1000).toISOString(),
          status: 'SCHEDULED'
        }
      },
      {
        id: 'll-2',
        match_id: 'll-match-2',
        confidence_score: 86,
        market: 'OVER_UNDER_2.5',
        prediction_value: 'OVER',
        is_banker: false,
        is_premium: false,
        matches: {
          home_team: 'Atletico Madrid',
          away_team: 'Real Sociedad',
          league_name: 'La Liga',
          match_date: new Date(now.getTime() + 42 * 60 * 60 * 1000).toISOString(),
          status: 'SCHEDULED'
        }
      },
      
      // Bundesliga
      {
        id: 'bl-1',
        match_id: 'bl-match-1',
        confidence_score: 93,
        market: '1X2',
        prediction_value: 'HOME_WIN',
        is_banker: false,
        is_premium: true,
        matches: {
          home_team: 'Bayern Munich',
          away_team: 'Borussia Dortmund',
          league_name: 'Bundesliga',
          match_date: new Date(now.getTime() + 22 * 60 * 60 * 1000).toISOString(),
          status: 'SCHEDULED'
        }
      },
      
      // Serie A
      {
        id: 'sa-1',
        match_id: 'sa-match-1',
        confidence_score: 89,
        market: '1X2',
        prediction_value: 'DRAW',
        is_banker: false,
        is_premium: false,
        matches: {
          home_team: 'Juventus',
          away_team: 'AC Milan',
          league_name: 'Serie A',
          match_date: new Date(now.getTime() + 28 * 60 * 60 * 1000).toISOString(),
          status: 'SCHEDULED'
        }
      },
      
      // Ligue 1
      {
        id: 'l1-1',
        match_id: 'l1-match-1',
        confidence_score: 91,
        market: '1X2',
        prediction_value: 'HOME_WIN',
        is_banker: false,
        is_premium: true,
        matches: {
          home_team: 'Paris Saint-Germain',
          away_team: 'Marseille',
          league_name: 'Ligue 1',
          match_date: new Date(now.getTime() + 34 * 60 * 60 * 1000).toISOString(),
          status: 'SCHEDULED'
        }
      }
    ];
  }
}
