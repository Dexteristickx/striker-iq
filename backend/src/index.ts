import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cron from 'node-cron';

import { apiRouter } from './routes/api';
import { DataPipeline } from './pipeline/dataSync';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3003;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api', apiRouter);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'StrikerIQ Backend is running' });
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  
  // Trigger initial sync after server starts
  setTimeout(() => {
    DataPipeline.syncUpcomingMatchesAndPredict();
  }, 1000);
});

// Setup cron jobs
// Run every 6 hours to fetch upcoming matches and predict
cron.schedule('0 */6 * * *', () => {
  console.log('Cron triggered: Syncing upcoming matches...');
  DataPipeline.syncUpcomingMatchesAndPredict();
});

export default app;
