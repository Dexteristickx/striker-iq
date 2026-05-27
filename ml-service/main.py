from fastapi import FastAPI
from pydantic import BaseModel
import random

app = FastAPI(title="StrikerIQ ML Service")

class MatchFeatures(BaseModel):
    home_team: str
    away_team: str
    league_id: int
    match_date: str
    features: dict

class PredictionResponse(BaseModel):
    confidence_score: float
    market: str
    prediction_value: str
    probabilities: dict

@app.get("/health")
def health_check():
    return {"status": "ok", "message": "StrikerIQ ML Service is running"}

@app.post("/predict", response_model=PredictionResponse)
def predict_match(match: MatchFeatures):
    # Dummy implementation for Phase 1/2
    # Simulates an XGBoost model prediction
    outcomes = ["HOME_WIN", "DRAW", "AWAY_WIN"]
    probs = {
        "HOME_WIN": random.uniform(0.1, 0.8),
        "DRAW": random.uniform(0.1, 0.5),
        "AWAY_WIN": random.uniform(0.1, 0.8)
    }
    
    # Normalize probabilities
    total = sum(probs.values())
    for k in probs:
        probs[k] = probs[k] / total
        
    best_outcome = max(probs, key=probs.get)
    confidence = min(probs[best_outcome] * 100 + random.uniform(0, 20), 99.9)

    return {
        "confidence_score": round(confidence, 2),
        "market": "1X2",
        "prediction_value": best_outcome,
        "probabilities": {k: round(v, 4) for k, v in probs.items()}
    }
