// Shared helper for every route that talks to TheSportsDB.
// Free tier key "3" (test key, no signup, low rate limit) works out of the
// box. Swap THESPORTSDB_KEY in server/.env for a real key in production.
import { fetchJson } from './fetchJson.js';

const KEY = process.env.THESPORTSDB_KEY || '3';
const BASE = `https://www.thesportsdb.com/api/v1/json/${KEY}`;

// id resolution rarely changes, so we cache it in memory forever (per process)
const idCache = new Map();

export async function resolveTeamId(teamName) {
  if (idCache.has(`team:${teamName}`)) return idCache.get(`team:${teamName}`);
  const data = await fetchJson(`${BASE}/searchteams.php?t=${encodeURIComponent(teamName)}`);
  const team = data?.teams?.[0] || null;
  const result = team ? { id: team.idTeam, leagueId: team.idLeague, leagueName: team.strLeague } : null;
  idCache.set(`team:${teamName}`, result);
  return result;
}

// Finds a league whose name contains `nameIncludes` within the given sport.
export async function resolveLeagueId(sportName, nameIncludes) {
  const cacheKey = `league:${sportName}:${nameIncludes}`;
  if (idCache.has(cacheKey)) return idCache.get(cacheKey);
  const data = await fetchJson(`${BASE}/search_all_leagues.php?s=${encodeURIComponent(sportName)}`);
  const leagues = data?.countrys || data?.leagues || [];
  const match = leagues.find((l) =>
    (l.strLeague || '').toLowerCase().includes(nameIncludes.toLowerCase())
  );
  const result = match ? { id: match.idLeague, name: match.strLeague } : null;
  idCache.set(cacheKey, result);
  return result;
}

export async function eventsNext(teamId) {
  const data = await fetchJson(`${BASE}/eventsnext.php?id=${teamId}`);
  return data?.events || [];
}

export async function eventsLast(teamId) {
  const data = await fetchJson(`${BASE}/eventslast.php?id=${teamId}`);
  return data?.results || [];
}

export async function eventsSeason(leagueId, season) {
  const data = await fetchJson(`${BASE}/eventsseason.php?id=${leagueId}&s=${season}`);
  return data?.events || [];
}

export async function leagueTable(leagueId, season) {
  const data = await fetchJson(`${BASE}/lookuptable.php?l=${leagueId}&s=${season}`);
  return data?.table || [];
}

export function currentFootballSeason() {
  const now = new Date();
  const y = now.getFullYear();
  // European football seasons run roughly Jul -> May
  return now.getMonth() + 1 >= 7 ? `${y}-${y + 1}` : `${y - 1}-${y}`;
}

export function currentYear() {
  return String(new Date().getFullYear());
}
