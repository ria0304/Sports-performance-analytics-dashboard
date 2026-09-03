import { Router } from 'express';
import { liveOrCached } from '../lib/fetchJson.js';
import { resolveLeagueId, eventsSeason, currentYear } from '../lib/sportsdb.js';

const router = Router();

const FALLBACK = {
  tour: 'ATP',
  season: currentYear(),
  tournaments: [],
  note: 'Live tennis calendar unavailable right now — try again shortly.',
};

async function fetchLive() {
  const league = await resolveLeagueId('Tennis', 'ATP');
  if (!league) throw new Error('Could not resolve ATP tour league id');

  const events = await eventsSeason(league.id, currentYear());
  const tournaments = events
    .map((e) => ({
      id: e.idEvent,
      tournament: e.strEvent,
      date: e.dateEvent,
      venue: e.strVenue,
      winner: e.strResult || null,
    }))
    .sort((a, b) => (a.date || '').localeCompare(b.date || ''));

  const today = new Date().toISOString().slice(0, 10);
  const past = tournaments.filter((t) => t.date && t.date < today).slice(-5);
  const upcoming = tournaments.filter((t) => t.date && t.date >= today).slice(0, 5);

  return {
    tour: league.name,
    season: currentYear(),
    recentTournaments: past,
    upcomingTournaments: upcoming,
  };
}

router.get('/', async (_req, res) => {
  const data = await liveOrCached('tennis', Number(process.env.CACHE_TTL_MS || 45000), fetchLive, FALLBACK);
  res.json(data);
});

export default router;
