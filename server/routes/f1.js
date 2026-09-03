import { Router } from 'express';
import { fetchJson, liveOrCached } from '../lib/fetchJson.js';

const router = Router();
const BASE = 'https://api.jolpi.ca/ergast/f1'; // free Ergast-compatible mirror

const FALLBACK = {
  season: '2026',
  driverStandings: [
    { position: 1, driver: 'Max Verstappen', constructor: 'Red Bull', points: 0, wins: 0 },
    { position: 2, driver: 'Lando Norris', constructor: 'McLaren', points: 0, wins: 0 },
    { position: 3, driver: 'Charles Leclerc', constructor: 'Ferrari', points: 0, wins: 0 },
  ],
  nextRace: null,
  lastRaceResults: [],
  note: 'Live F1 data unavailable right now — showing placeholder standings.',
};

async function fetchLive() {
  const [standingsRes, nextRes, lastRes] = await Promise.all([
    fetchJson(`${BASE}/current/driverStandings.json`),
    fetchJson(`${BASE}/current/next.json`).catch(() => null),
    fetchJson(`${BASE}/current/last/results.json`).catch(() => null),
  ]);

  const standingsList =
    standingsRes?.MRData?.StandingsTable?.StandingsLists?.[0]?.DriverStandings || [];
  const driverStandings = standingsList.map((d) => ({
    position: Number(d.position),
    driver: `${d.Driver.givenName} ${d.Driver.familyName}`,
    constructor: d.Constructors?.[0]?.name || '',
    points: Number(d.points),
    wins: Number(d.wins),
  }));

  const nextRaceRaw = nextRes?.MRData?.RaceTable?.Races?.[0] || null;
  const nextRace = nextRaceRaw
    ? {
        raceName: nextRaceRaw.raceName,
        circuit: nextRaceRaw.Circuit?.circuitName,
        location: `${nextRaceRaw.Circuit?.Location?.locality}, ${nextRaceRaw.Circuit?.Location?.country}`,
        date: nextRaceRaw.date,
        time: nextRaceRaw.time,
        round: Number(nextRaceRaw.round),
      }
    : null;

  const lastRaceRaw = lastRes?.MRData?.RaceTable?.Races?.[0] || null;
  const lastRaceResults = (lastRaceRaw?.Results || []).slice(0, 10).map((r) => ({
    position: Number(r.position),
    driver: `${r.Driver.givenName} ${r.Driver.familyName}`,
    constructor: r.Constructor?.name,
    points: Number(r.points),
    status: r.status,
  }));

  return {
    season: standingsRes?.MRData?.StandingsTable?.season || FALLBACK.season,
    driverStandings,
    nextRace,
    raceName: lastRaceRaw?.raceName || null,
    lastRaceResults,
  };
}

router.get('/', async (_req, res) => {
  const data = await liveOrCached('f1', Number(process.env.CACHE_TTL_MS || 45000), fetchLive, FALLBACK);
  res.json(data);
});

export default router;
