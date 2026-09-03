import 'dotenv/config';
import express from 'express';
import cors from 'cors';

import f1Router from './routes/f1.js';
import motogpRouter from './routes/motogp.js';
import tennisRouter from './routes/tennis.js';
import footballRouter from './routes/football.js';
import icehockeyRouter from './routes/icehockey.js';
import equestrianRouter from './routes/equestrian.js';

const app = express();
const PORT = process.env.PORT || 8787;
const CORS_ORIGIN = (process.env.CORS_ORIGIN || 'http://localhost:3000').split(',');

app.use(cors({ origin: CORS_ORIGIN }));
app.use(express.json());

// simple request log, useful while wiring up the frontend
app.use((req, _res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
  next();
});

app.get('/api/health', (_req, res) => res.json({ ok: true, time: new Date().toISOString() }));

app.use('/api/f1', f1Router);
app.use('/api/motogp', motogpRouter);
app.use('/api/tennis', tennisRouter);
app.use('/api/football', footballRouter); // Real Madrid
app.use('/api/icehockey', icehockeyRouter); // San Jose Sharks
app.use('/api/equestrian', equestrianRouter);

app.use((_req, res) => res.status(404).json({ error: 'Not found' }));

// last-resort error handler so a single bad request never crashes the process
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error', message: err.message });
});

app.listen(PORT, () => {
  console.log(`Sports dashboard API listening on http://localhost:${PORT}`);
  console.log(`Allowed origins: ${CORS_ORIGIN.join(', ')}`);
});
