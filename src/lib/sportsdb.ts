// Calls TheSportsDB directly from the browser — no backend needed. The
// free test key "3" works with no signup and has a public CORS policy
// (it's built for exactly this kind of hobbyist client-side use).
import { fetchJson } from './cache';

const KEY = '3';
const BASE = `https://www.thesportsdb.com/api/v1/json/${KEY}`;

const idCache = new Map<string, unknown>();

interface TeamLookup {
  id: string;
  leagueId: string;
  leagueName: string;
}

export async function resolveTeamId(teamName: string): Promise<TeamLookup | null> {
  const cacheKey = `team:${teamName}`;
  if (idCache.has(cacheKey)) return idCache.get(cacheKey) as TeamLookup | null;
  const data = await fetchJson<{ teams?: any[] }>(`${BASE}/searchteams.php?t=${encodeURIComponent(teamName)}`);
  const team = data?.teams?.[0] || null;
  const result: TeamLookup | null = team
    ? { id: team.idTeam, leagueId: team.idLeague, leagueName: team.strLeague }
    : null;
  idCache.set(cacheKey, result);
  return result;
}

interface LeagueLookup {
  id: string;
  name: string;
}

export async function resolveLeagueId(sportName: string, nameIncludes: string): Promise<LeagueLookup | null> {
  const cacheKey = `league:${sportName}:${nameIncludes}`;
  if (idCache.has(cacheKey)) return idCache.get(cacheKey) as LeagueLookup | null;
  const data = await fetchJson<{ countrys?: any[]; leagues?: any[] }>(
    `${BASE}/search_all_leagues.php?s=${encodeURIComponent(sportName)}`
  );
  const leagues = data?.countrys || data?.leagues || [];
  const match = leagues.find((l) => (l.strLeague || '').toLowerCase().includes(nameIncludes.toLowerCase()));
  const result: LeagueLookup | null = match ? { id: match.idLeague, name: match.strLeague } : null;
  idCache.set(cacheKey, result);
  return result;
}

export async function eventsNext(teamId: string) {
  const data = await fetchJson<{ events?: any[] }>(`${BASE}/eventsnext.php?id=${teamId}`);
  return data?.events || [];
}

export async function eventsLast(teamId: string) {
  const data = await fetchJson<{ results?: any[] }>(`${BASE}/eventslast.php?id=${teamId}`);
  return data?.results || [];
}

export async function eventsSeason(leagueId: string, season: string) {
  const data = await fetchJson<{ events?: any[] }>(`${BASE}/eventsseason.php?id=${leagueId}&s=${season}`);
  return data?.events || [];
}

export async function leagueTable(leagueId: string, season: string) {
  const data = await fetchJson<{ table?: any[] }>(`${BASE}/lookuptable.php?l=${leagueId}&s=${season}`);
  return data?.table || [];
}

export function currentFootballSeason(): string {
  const now = new Date();
  const y = now.getFullYear();
  return now.getMonth() + 1 >= 7 ? `${y}-${y + 1}` : `${y - 1}-${y}`;
}

export function nhlSeason(): string {
  const now = new Date();
  const y = now.getFullYear();
  return now.getMonth() + 1 >= 9 ? `${y}-${y + 1}` : `${y - 1}-${y}`;
}

export function currentYear(): string {
  return String(new Date().getFullYear());
}

export function mapEvent(e: any) {
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
