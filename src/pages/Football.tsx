import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { footballData } from '../data/mockData';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area, Line, Cell } from 'recharts';
import { Trophy, TrendingUp, Activity, Crosshair, ArrowLeft } from 'lucide-react';

export default function Football() {
  const navigate = useNavigate();
  const [competitionType, setCompetitionType] = useState('League');
  const [selectedLeague, setSelectedLeague] = useState('Premier League');
  const [selectedTeam, setSelectedTeam] = useState('Arsenal');

  const leagues = useMemo(() => {
    const allLeagues = new Set<string>();
    footballData.forEach(match => {
      if (match.competitionType === 'League') {
        allLeagues.add(match.league);
      }
    });
    return Array.from(allLeagues).sort();
  }, []);

  const teams = useMemo(() => {
    const allTeams = new Set<string>();
    footballData.forEach(match => {
      if (match.competitionType === competitionType) {
        if (competitionType === 'League' && match.league !== selectedLeague) return;
        allTeams.add(match.home);
        allTeams.add(match.away);
      }
    });
    const sortedTeams = Array.from(allTeams).sort();
    if (!sortedTeams.includes(selectedTeam) && sortedTeams.length > 0) {
      setSelectedTeam(sortedTeams[0]);
    }
    return sortedTeams;
  }, [competitionType, selectedLeague]);

  const teamStats = useMemo(() => {
    let wins = 0;
    let draws = 0;
    let losses = 0;
    let goalsScored = 0;
    let goalsConceded = 0;
    let xG = 0;
    let xGA = 0;

    const form: { date: string; result: string; points: number }[] = [];
    const rollingAvg: { date: string; goals: number; xG: number }[] = [];

    footballData.forEach(match => {
      if (match.competitionType !== competitionType) return;
      if (competitionType === 'League' && match.league !== selectedLeague) return;

      if (match.home === selectedTeam) {
        goalsScored += match.homeGoals;
        goalsConceded += match.awayGoals;
        xG += match.homeXG;
        xGA += match.awayXG;
        
        if (match.homeGoals > match.awayGoals) { wins++; form.push({ date: match.date, result: 'W', points: 3 }); }
        else if (match.homeGoals === match.awayGoals) { draws++; form.push({ date: match.date, result: 'D', points: 1 }); }
        else { losses++; form.push({ date: match.date, result: 'L', points: 0 }); }

        rollingAvg.push({ date: match.date, goals: match.homeGoals, xG: match.homeXG });
      } else if (match.away === selectedTeam) {
        goalsScored += match.awayGoals;
        goalsConceded += match.homeGoals;
        xG += match.awayXG;
        xGA += match.homeXG;

        if (match.awayGoals > match.homeGoals) { wins++; form.push({ date: match.date, result: 'W', points: 3 }); }
        else if (match.awayGoals === match.homeGoals) { draws++; form.push({ date: match.date, result: 'D', points: 1 }); }
        else { losses++; form.push({ date: match.date, result: 'L', points: 0 }); }

        rollingAvg.push({ date: match.date, goals: match.awayGoals, xG: match.awayXG });
      }
    });

    const smoothedRollingAvg = rollingAvg.map((match, i, arr) => {
      const start = Math.max(0, i - 4);
      const window = arr.slice(start, i + 1);
      const avgXG = window.reduce((sum, m) => sum + m.xG, 0) / window.length;
      return { ...match, avgXG: Number(avgXG.toFixed(2)) };
    });

    const totalMatches = wins + draws + losses;
    const winRate = totalMatches > 0 ? ((wins / totalMatches) * 100).toFixed(1) : '0';
    
    const xGValues = rollingAvg.map(m => m.xG);
    const meanXG = xGValues.reduce((a, b) => a + b, 0) / (xGValues.length || 1);
    const variance = xGValues.reduce((a, b) => a + Math.pow(b - meanXG, 2), 0) / (xGValues.length || 1);
    const consistencyScore = Math.max(0, 100 - (variance * 20)).toFixed(0);

    return {
      wins, draws, losses, goalsScored, goalsConceded, xG: xG.toFixed(1), xGA: xGA.toFixed(1),
      winRate, form, smoothedRollingAvg, consistencyScore
    };
  }, [selectedTeam, competitionType, selectedLeague]);

  const winDrawLossData = [
    { name: 'Wins', value: teamStats.wins, fill: '#10b981' },
    { name: 'Draws', value: teamStats.draws, fill: '#f59e0b' },
    { name: 'Losses', value: teamStats.losses, fill: '#ef4444' },
  ];

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      <button onClick={() => navigate('/')} className="flex items-center text-slate-400 hover:text-white transition-colors">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Hub
      </button>

      <div className="flex flex-col space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-emerald-400">Football Analytics</h1>
          <p className="text-slate-400">Analyze team performance across competitions.</p>
        </div>

        <div className="flex flex-wrap gap-2">
          {['League', 'UCL', 'Europa', 'World Cup', 'FIFA Club World Cup'].map(comp => (
            <button
              key={comp}
              onClick={() => setCompetitionType(comp)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                competitionType === comp 
                  ? 'bg-emerald-600 text-white' 
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {comp}
            </button>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-4 p-4 bg-slate-900 rounded-xl border border-slate-800">
          {competitionType === 'League' && (
            <div className="space-y-2 flex-1">
              <label className="text-sm font-medium text-slate-400">Select League</label>
              <select 
                className="w-full h-10 rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                value={selectedLeague}
                onChange={(e) => setSelectedLeague(e.target.value)}
              >
                {leagues.map(league => (
                  <option key={league} value={league}>{league}</option>
                ))}
              </select>
            </div>
          )}
          <div className="space-y-2 flex-1">
            <label className="text-sm font-medium text-slate-400">Search Team</label>
            <input 
              type="text"
              list="teams-list"
              className="w-full h-10 rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              value={selectedTeam}
              onChange={(e) => setSelectedTeam(e.target.value)}
              placeholder="Type a team name..."
            />
            <datalist id="teams-list">
              {teams.map(team => (
                <option key={team} value={team} />
              ))}
            </datalist>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-200">Win Rate</CardTitle>
              <Trophy className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{teamStats.winRate}%</div>
              <p className="text-xs text-slate-400">
                {teamStats.wins}W - {teamStats.draws}D - {teamStats.losses}L
              </p>
            </CardContent>
          </Card>
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-200">Consistency Score</CardTitle>
              <Activity className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{teamStats.consistencyScore}/100</div>
              <p className="text-xs text-slate-400">Based on xG variance</p>
            </CardContent>
          </Card>
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-200">Expected Goals (xG)</CardTitle>
              <Crosshair className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{teamStats.xG}</div>
              <p className="text-xs text-slate-400">Actual Goals: {teamStats.goalsScored}</p>
            </CardContent>
          </Card>
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-200">Goal Difference</CardTitle>
              <TrendingUp className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {teamStats.goalsScored - teamStats.goalsConceded > 0 ? '+' : ''}{teamStats.goalsScored - teamStats.goalsConceded}
              </div>
              <p className="text-xs text-slate-400">
                {teamStats.goalsScored} For, {teamStats.goalsConceded} Against
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="col-span-4 bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-slate-200">Performance Trends (Rolling xG)</CardTitle>
              <CardDescription className="text-slate-400">5-match rolling average</CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
              <div className="h-[300px] w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={teamStats.smoothedRollingAvg} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorXg" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                    <XAxis dataKey="date" tickFormatter={(val) => val.substring(5)} stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#f8fafc' }} itemStyle={{ color: '#f8fafc' }} />
                    <Legend wrapperStyle={{ color: '#94a3b8' }} />
                    <Area type="monotone" dataKey="avgXG" name="Rolling xG" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorXg)" />
                    <Line type="monotone" dataKey="goals" name="Actual Goals" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          <Card className="col-span-3 bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-slate-200">Result Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={winDrawLossData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#334155" />
                    <XAxis type="number" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip cursor={{fill: '#1e293b'}} contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#f8fafc' }} itemStyle={{ color: '#f8fafc' }} />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={40}>
                      {winDrawLossData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
