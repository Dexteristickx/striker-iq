-- StrikerIQ Supabase Schema

-- Users table extension (Supabase Auth handles the core users table)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  tier TEXT DEFAULT 'free' CHECK (tier IN ('free', 'pro', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Matches
CREATE TABLE public.matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  api_fixture_id INTEGER UNIQUE NOT NULL,
  sport TEXT DEFAULT 'football',
  league_id INTEGER,
  league_name TEXT,
  home_team TEXT NOT NULL,
  away_team TEXT NOT NULL,
  match_date TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT DEFAULT 'SCHEDULED', -- SCHEDULED, IN_PLAY, FINISHED, POSTPONED
  home_score INTEGER,
  away_score INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Predictions
CREATE TABLE public.predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID REFERENCES public.matches ON DELETE CASCADE NOT NULL,
  confidence_score NUMERIC(5,2) NOT NULL, -- 0 to 100
  market TEXT NOT NULL, -- '1X2', 'BTTS', 'OVER_UNDER_2.5'
  prediction_value TEXT NOT NULL, -- 'HOME_WIN', 'DRAW', 'AWAY_WIN', 'YES', 'NO', 'OVER', 'UNDER'
  odds NUMERIC(5,2),
  is_banker BOOLEAN DEFAULT FALSE,
  is_premium BOOLEAN DEFAULT FALSE,
  status TEXT DEFAULT 'PENDING', -- PENDING, WON, LOST, VOID
  features_json JSONB, -- The input data used by the ML model
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Betslips
CREATE TABLE public.betslips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles ON DELETE CASCADE NOT NULL,
  combined_odds NUMERIC(7,2) NOT NULL,
  combined_confidence NUMERIC(5,2) NOT NULL,
  status TEXT DEFAULT 'PENDING', -- PENDING, WON, LOST
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Betslip Selections (Join table between betslips and predictions)
CREATE TABLE public.betslip_selections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  betslip_id UUID REFERENCES public.betslips ON DELETE CASCADE NOT NULL,
  prediction_id UUID REFERENCES public.predictions ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Model Logs (for explainability and retraining)
CREATE TABLE public.model_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prediction_id UUID REFERENCES public.predictions ON DELETE SET NULL,
  model_version TEXT NOT NULL,
  input_features JSONB NOT NULL,
  output_probabilities JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
