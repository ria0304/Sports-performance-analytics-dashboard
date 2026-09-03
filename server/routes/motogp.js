import { Router } from 'express';
import { liveOrCached } from '../lib/fetchJson.js';
import { resolveLeagueId, eventsSeason, currentYear } from '../lib/sportsdb.js';

const router = Router();

const FALLBACK = {
  league: 'MotoGP',
  season: currentYear(),
  races: [],
  note: 'Live MotoGP calendar unavailable right now — try again shortly.',
};

async function fetchLive() {
  const league = await resolveLeagueId('Motorsport', 'MotoGP');
  if (!league) throw new Error('Could not resolve MotoGP league id');

  const events = await eventsSeason(league.id, currentYear());
  const races = events
    .map((e) => ({
      id: e.idEvent,
      race: e.strEvent,
      date: e.dateEvent,
      round: e.intRound ? Number(e.intRound) : null,
      venue: e.strVenue,
      result: e.strResult || null,
    }))
    .sort((a, b) => (a.date || '').localeCompare(b.date || ''));

  const today = new Date().toISOString().slice(0, 10);
  const past = races.filter((r) => r.date && r.date < today).slice(-5);
  const upcoming = races.filter((r) => r.date && r.date >= today).slice(0, 5);

  return {
    league: league.name,
    season: currentYear(),
    lastRaces: past,
    upcomingRaces: upcoming,
  };
}

router.get('/', async (_req, res) => {
  const data = await liveOrCached('motogp', Number(process.env.CACHE_TTL_MS || 45000), fetchLive, FALLBACK);
  res.json(data);
});

export default router;
