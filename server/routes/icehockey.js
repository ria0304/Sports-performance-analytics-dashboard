import { Router } from 'express';
import { liveOrCached } from '../lib/fetchJson.js';
import { resolveTeamId, eventsNext, eventsLast, leagueTable } from '../lib/sportsdb.js';

const router = Router();

const FALLBACK = {
  team: 'San Jose Sharks',
  nextGames: [],
  lastResults: [],
  nhlTable: [],
  note: 'Live Sharks data unavailable right now — try again shortly.',
};

function nhlSeason() {
  const now = new Date();
  const y = now.getFullYear();
  // NHL season runs roughly Oct -> Jun
  return now.getMonth() + 1 >= 9 ? `${y}-${y + 1}` : `${y - 1}-${y}`;
}

async function fetchLive() {
  const team = await resolveTeamId('San Jose Sharks');
  if (!team) throw new Error('Could not resolve San Jose Sharks team id');

  const [next, last] = await Promise.all([eventsNext(team.id), eventsLast(team.id)]);

  let table = [];
  try {
    table = await leagueTable(team.leagueId, nhlSeason());
  } catch {
    table = [];
  }

  return {
    team: 'San Jose Sharks',
    league: team.leagueName,
    nextGames: next.slice(0, 5).map(mapEvent),
    lastResults: last.slice(0, 5).map(mapEvent),
    nhlTable: table.slice(0, 10).map((row) => ({
      position: Number(row.intRank),
      team: row.strTeam,
      played: Number(row.intPlayed),
      won: Number(row.intWin),
      lost: Number(row.intLoss),
      points: Number(row.intPoints),
    })),
  };
}

function mapEvent(e) {
  return {
    id: e.idEvent,
    event: e.strEvent,
    date: e.dateEvent,
    time: e.strTime,
    homeTeam: e.strHomeTeam,
    awayTeam: e.strAwayTeam,
    homeScore: e.intHomeScore,
    awayScore: e.intAwayScore,
    venue: e.strVenue,
  };
}

router.get('/', async (_req, res) => {
  const data = await liveOrCached('icehockey-sharks', Number(process.env.CACHE_TTL_MS || 45000), fetchLive, FALLBACK);
  res.json(data);
});

export default router;
