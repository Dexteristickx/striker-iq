import axios from 'axios';

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://127.0.0.1:8000';

export interface PredictionFeatures {
  home_team: string;
  away_team: string;
  league_id: number;
  match_date: string;
  features: Record<string, any>; // Add specific features later
}

export interface PredictionResult {
  confidence_score: number;
  market: string;
  prediction_value: string;
  probabilities: Record<string, number>;
}

export class PredictionService {
  static async getPrediction(features: PredictionFeatures): Promise<PredictionResult | null> {
    try {
      const response = await axios.post(`${ML_SERVICE_URL}/predict`, features);
      return response.data;
    } catch (error) {
      console.error('Error fetching prediction from ML service:', error);
      return null;
    }
  }
}
