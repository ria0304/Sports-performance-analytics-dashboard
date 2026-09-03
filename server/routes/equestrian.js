import { Router } from 'express';
import { liveOrCached } from '../lib/fetchJson.js';
import { resolveLeagueId, eventsSeason, currentYear } from '../lib/sportsdb.js';

const router = Router();

const FALLBACK = {
  discipline: 'Equestrian',
  season: currentYear(),
  events: [],
  note: 'Live equestrian calendar unavailable right now — try again shortly.',
};

async function fetchLive() {
  // TheSportsDB lists this sport under slightly different names depending
  // on the mirror, so try a couple of spellings before giving up.
  const league =
    (await resolveLeagueId('Equestrian Sport', 'FEI')) ||
    (await resolveLeagueId('Equestrian Sport', 'Equestrian')) ||
    (await resolveLeagueId('Equestrian', 'Equestrian'));
  if (!league) throw new Error('Could not resolve an equestrian league id');

  const events = await eventsSeason(league.id, currentYear());
  const mapped = events
    .map((e) => ({
      id: e.idEvent,
      event: e.strEvent,
      date: e.dateEvent,
      venue: e.strVenue,
      result: e.strResult || null,
    }))
    .sort((a, b) => (a.date || '').localeCompare(b.date || ''));

  const today = new Date().toISOString().slice(0, 10);
  const past = mapped.filter((t) => t.date && t.date < today).slice(-5);
  const upcoming = mapped.filter((t) => t.date && t.date >= today).slice(0, 5);

  return {
    discipline: league.name,
    season: currentYear(),
    recentEvents: past,
    upcomingEvents: upcoming,
  };
}

router.get('/', async (_req, res) => {
  const data = await liveOrCached('equestrian', Number(process.env.CACHE_TTL_MS || 45000), fetchLive, FALLBACK);
  res.json(data);
});

export default router;
