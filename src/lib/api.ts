// Every function here talks directly to a free public sports API from the
// browser - Jolpica-F1 for F1, TheSportsDB for everything else. There is
// no backend: this is what makes the dashboard work as a plain static
// site on GitHub Pages with zero servers to run or pay for.
import { fetchJson, liveOrCached, type DataSource } from './cache';
import {
  resolveTeamId,
  resolveLeagueId,
  eventsNext,
  eventsLast,
  eventsSeason,
  leagueTable,
  currentFootballSeason,
  nhlSeason,
  currentYear,
  mapEvent,
} from './sportsdb';

export type { DataSource };

const TTL_MS = 45000; // re-fetch upstream at most once every 45s per sport
const ERGAST_BASE = 'https://api.jolpi.ca/ergast/f1'; // free Ergast-compatible mirror

interface WithMeta {
  source: DataSource;
  updatedAt: string;
  warning?: string;
  note?: string;
}

// ---------- F1 ----------
export interface F1Data extends WithMeta {
  season: string;
  driverStandings: { position: number; driver: string; constructor: string; points: number; wins: number }[];
  nextRace: { raceName: string; circuit: string; location: string; date: string; time: string; round: number } | null;
  raceName: string | null;
  lastRaceResults: { position: number; driver: string; constructor: string; points: number; status: string }[];
}

const F1_FALLBACK = {
  season: currentYear(),
  driverStandings: [] as F1Data['driverStandings'],
  nextRace: null,
  raceName: null,
  lastRaceResults: [] as F1Data['lastRaceResults'],
  note: 'Live F1 data unavailable right now — showing placeholder standings.',
};

async function fetchF1() {
  const [standingsRes, nextRes, lastRes] = await Promise.all([
    fetchJson<any>(`${ERGAST_BASE}/current/driverStandings.json`),
    fetchJson<any>(`${ERGAST_BASE}/current/next.json`).catch(() => null),
    fetchJson<any>(`${ERGAST_BASE}/current/last/results.json`).catch(() => null),
  ]);

  const standingsList = standingsRes?.MRData?.StandingsTable?.StandingsLists?.[0]?.DriverStandings || [];
  const driverStandings = standingsList.map((d: any) => ({
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
  const lastRaceResults = (lastRaceRaw?.Results || []).slice(0, 10).map((r: any) => ({
    position: Number(r.position),
    driver: `${r.Driver.givenName} ${r.Driver.familyName}`,
    constructor: r.Constructor?.name,
    points: Number(r.points),
    status: r.status,
  }));

  return {
    season: standingsRes?.MRData?.StandingsTable?.season || F1_FALLBACK.season,
    driverStandings,
    nextRace,
    raceName: lastRaceRaw?.raceName || null,
    lastRaceResults,
  };
}

// ---------- MotoGP ----------
export interface MotoGPData extends WithMeta {
  league: string;
  season: string;
  lastRaces: { id: string; race: string; date: string; round: number | null; venue: string; result: string | null }[];
  upcomingRaces: { id: string; race: string; date: string; round: number | null; venue: string; result: string | null }[];
}

const MOTOGP_FALLBACK = {
  league: 'MotoGP',
  season: currentYear(),
  lastRaces: [] as MotoGPData['lastRaces'],
  upcomingRaces: [] as MotoGPData['upcomingRaces'],
  note: 'Live MotoGP calendar unavailable right now — try again shortly.',
};

async function fetchMotoGP() {
  const league = await resolveLeagueId('Motorsport', 'MotoGP');
  if (!league) throw new Error('Could not resolve MotoGP league id');

  const events = await eventsSeason(league.id, currentYear());
  const races = events
    .map((e: any) => ({
      id: e.idEvent,
      race: e.strEvent,
      date: e.dateEvent,
      round: e.intRound ? Number(e.intRound) : null,
      venue: e.strVenue,
      result: e.strResult || null,
    }))
    .sort((a: any, b: any) => (a.date || '').localeCompare(b.date || ''));

  const today = new Date().toISOString().slice(0, 10);
  const lastRaces = races.filter((r: any) => r.date && r.date < today).slice(-5);
  const upcomingRaces = races.filter((r: any) => r.date && r.date >= today).slice(0, 5);

  return { league: league.name, season: currentYear(), lastRaces, upcomingRaces };
}

// ---------- Tennis ----------
export interface TennisData extends WithMeta {
  tour: string;
  season: string;
  recentTournaments: { id: string; tournament: string; date: string; venue: string; winner: string | null }[];
  upcomingTournaments: { id: string; tournament: string; date: string; venue: string; winner: string | null }[];
}

const TENNIS_FALLBACK = {
  tour: 'ATP',
  season: currentYear(),
  recentTournaments: [] as TennisData['recentTournaments'],
  upcomingTournaments: [] as TennisData['upcomingTournaments'],
  note: 'Live tennis calendar unavailable right now — try again shortly.',
};

async function fetchTennis() {
  const league = await resolveLeagueId('Tennis', 'ATP');
  if (!league) throw new Error('Could not resolve ATP tour league id');

  const events = await eventsSeason(league.id, currentYear());
  const tournaments = events
    .map((e: any) => ({
      id: e.idEvent,
      tournament: e.strEvent,
      date: e.dateEvent,
      venue: e.strVenue,
      winner: e.strResult || null,
    }))
    .sort((a: any, b: any) => (a.date || '').localeCompare(b.date || ''));

  const today = new Date().toISOString().slice(0, 10);
  const recentTournaments = tournaments.filter((t: any) => t.date && t.date < today).slice(-5);
  const upcomingTournaments = tournaments.filter((t: any) => t.date && t.date >= today).slice(0, 5);

  return { tour: league.name, season: currentYear(), recentTournaments, upcomingTournaments };
}

// ---------- Football (Real Madrid) ----------
interface SportEvent {
  id: string;
  event: string;
  date: string;
  time: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: string | null;
  awayScore: string | null;
  venue: string;
}

export interface FootballData extends WithMeta {
  team: string;
  league?: string;
  nextFixtures: SportEvent[];
  lastResults: SportEvent[];
  laLigaTable: { position: number; team: string; played: number; won: number; drawn: number; lost: number; goalDiff: number; points: number }[];
}

const FOOTBALL_FALLBACK = {
  team: 'Real Madrid',
  nextFixtures: [] as SportEvent[],
  lastResults: [] as SportEvent[],
  laLigaTable: [] as FootballData['laLigaTable'],
  note: 'Live Real Madrid data unavailable right now — try again shortly.',
};

async function fetchFootball() {
  const team = await resolveTeamId('Real Madrid');
  if (!team) throw new Error('Could not resolve Real Madrid team id');

  const [next, last] = await Promise.all([eventsNext(team.id), eventsLast(team.id)]);

  let table: any[] = [];
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
    laLigaTable: table.slice(0, 10).map((row: any) => ({
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

// ---------- Ice Hockey (San Jose Sharks) ----------
export interface IceHockeyData extends WithMeta {
  team: string;
  league?: string;
  nextGames: SportEvent[];
  lastResults: SportEvent[];
  nhlTable: { position: number; team: string; played: number; won: number; lost: number; points: number }[];
}

const ICEHOCKEY_FALLBACK = {
  team: 'San Jose Sharks',
  nextGames: [] as SportEvent[],
  lastResults: [] as SportEvent[],
  nhlTable: [] as IceHockeyData['nhlTable'],
  note: 'Live Sharks data unavailable right now — try again shortly.',
};

async function fetchIceHockey() {
  const team = await resolveTeamId('San Jose Sharks');
  if (!team) throw new Error('Could not resolve San Jose Sharks team id');

  const [next, last] = await Promise.all([eventsNext(team.id), eventsLast(team.id)]);

  let table: any[] = [];
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
    nhlTable: table.slice(0, 10).map((row: any) => ({
      position: Number(row.intRank),
      team: row.strTeam,
      played: Number(row.intPlayed),
      won: Number(row.intWin),
      lost: Number(row.intLoss),
      points: Number(row.intPoints),
    })),
  };
}

// ---------- Equestrian ----------
export interface EquestrianData extends WithMeta {
  discipline: string;
  season: string;
  recentEvents: { id: string; event: string; date: string; venue: string; result: string | null }[];
  upcomingEvents: { id: string; event: string; date: string; venue: string; result: string | null }[];
}

const EQUESTRIAN_FALLBACK = {
  discipline: 'Equestrian',
  season: currentYear(),
  recentEvents: [] as EquestrianData['recentEvents'],
  upcomingEvents: [] as EquestrianData['upcomingEvents'],
  note: 'Live equestrian calendar unavailable right now — try again shortly.',
};

async function fetchEquestrian() {
  const league =
    (await resolveLeagueId('Equestrian Sport', 'FEI')) ||
    (await resolveLeagueId('Equestrian Sport', 'Equestrian')) ||
    (await resolveLeagueId('Equestrian', 'Equestrian'));
  if (!league) throw new Error('Could not resolve an equestrian league id');

  const events = await eventsSeason(league.id, currentYear());
  const mapped = events
    .map((e: any) => ({
      id: e.idEvent,
      event: e.strEvent,
      date: e.dateEvent,
      venue: e.strVenue,
      result: e.strResult || null,
    }))
    .sort((a: any, b: any) => (a.date || '').localeCompare(b.date || ''));

  const today = new Date().toISOString().slice(0, 10);
  const recentEvents = mapped.filter((t: any) => t.date && t.date < today).slice(-5);
  const upcomingEvents = mapped.filter((t: any) => t.date && t.date >= today).slice(0, 5);

  return { discipline: league.name, season: currentYear(), recentEvents, upcomingEvents };
}

// ---------- Public API ----------
export const api = {
  f1: () => liveOrCached<Omit<F1Data, keyof WithMeta>>('f1', TTL_MS, fetchF1, F1_FALLBACK) as Promise<F1Data>,
  motogp: () =>
    liveOrCached<Omit<MotoGPData, keyof WithMeta>>('motogp', TTL_MS, fetchMotoGP, MOTOGP_FALLBACK) as Promise<MotoGPData>,
  tennis: () =>
    liveOrCached<Omit<TennisData, keyof WithMeta>>('tennis', TTL_MS, fetchTennis, TENNIS_FALLBACK) as Promise<TennisData>,
  football: () =>
    liveOrCached<Omit<FootballData, keyof WithMeta>>('football-real-madrid', TTL_MS, fetchFootball, FOOTBALL_FALLBACK) as Promise<FootballData>,
  icehockey: () =>
    liveOrCached<Omit<IceHockeyData, keyof WithMeta>>('icehockey-sharks', TTL_MS, fetchIceHockey, ICEHOCKEY_FALLBACK) as Promise<IceHockeyData>,
  equestrian: () =>
    liveOrCached<Omit<EquestrianData, keyof WithMeta>>('equestrian', TTL_MS, fetchEquestrian, EQUESTRIAN_FALLBACK) as Promise<EquestrianData>,
};
