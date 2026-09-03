import { Router } from 'express';
import { liveOrCached } from '../lib/fetchJson.js';
import { resolveTeamId, eventsNext, eventsLast, leagueTable, currentFootballSeason } from '../lib/sportsdb.js';

const router = Router();

const FALLBACK = {
  team: 'Real Madrid',
  nextFixtures: [],
  lastResults: [],
  laLigaTable: [],
  note: 'Live Real Madrid data unavailable right now — try again shortly.',
};

async function fetchLive() {
  const team = await resolveTeamId('Real Madrid');
  if (!team) throw new Error('Could not resolve Real Madrid team id');

  const [next, last] = await Promise.all([eventsNext(team.id), eventsLast(team.id)]);

  let table = [];
  try {
    table = await leagueTable(team.leagueId, currentFootballSeason());
  } catch {
    table = [];
  }

  return {
    team: 'Real Madrid',
    league: team.leagueName,
    nextFixtures: next.slice(0, 5).map(mapEvent),
    lastResults: last.slice(0, 5).map(mapEvent),
    laLigaTable: table.slice(0, 10).map((row) => ({
      position: Number(row.intRank),
      team: row.strTeam,
      played: Number(row.intPlayed),
      won: Number(row.intWin),
      drawn: Number(row.intDraw),
      lost: Number(row.intLoss),
      goalDiff: Number(row.intGoalDifference),
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
  const data = await liveOrCached('football-real-madrid', Number(process.env.CACHE_TTL_MS || 45000), fetchLive, FALLBACK);
  res.json(data);
});

export default router;
