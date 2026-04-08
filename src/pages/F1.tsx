import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { f1Data, f1Drivers, f1Calendar } from '../data/mockData';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend, Cell } from 'recharts';
import { Flag, Timer, Trophy, Zap, ArrowLeft, Calendar, TrendingUp } from 'lucide-react';

export default function F1() {
  const navigate = useNavigate();
  const [selectedDriver, setSelectedDriver] = useState('Max Verstappen');

  const driverStats = useMemo(() => {
    const races = f1Data.filter(r => r.driver === selectedDriver);
    
    let totalPoints = 0;
    let wins = 0;
    let podiums = 0;
    let dnfs = 0;
    
    const positions: { race: string; position: number; points: number }[] = [];
    const cumulativePoints: { race: string; points: number }[] = [];

    races.forEach(race => {
      totalPoints += race.points;
      if (race.position === 1) wins++;
      if (race.position <= 3) podiums++;
      if (race.position > 15) dnfs++;
      
      positions.push({
        race: race.race,
        position: race.position,
        points: race.points
      });

      cumulativePoints.push({
        race: race.race,
        points: totalPoints
      });
    });

    const avgFinish = races.length > 0 
      ? (races.reduce((sum, r) => sum + r.position, 0) / races.length).toFixed(1) 
      : '0';

    const posValues = races.map(r => r.position);
    const meanPos = posValues.reduce((a, b) => a + b, 0) / (posValues.length || 1);
    const variance = posValues.reduce((a, b) => a + Math.pow(b - meanPos, 2), 0) / (posValues.length || 1);
    const consistencyScore = Math.max(0, 100 - (variance * 5)).toFixed(0);

    return {
      totalPoints, wins, podiums, dnfs, avgFinish, consistencyScore, positions, cumulativePoints, team: races[0]?.team || 'Unknown'
    };
  }, [selectedDriver]);

  const teamDominance = useMemo(() => {
    const teamPoints: Record<string, number> = {};
    f1Data.forEach(race => {
      teamPoints[race.team] = (teamPoints[race.team] || 0) + race.points;
    });
    return Object.entries(teamPoints)
      .map(([name, points]) => ({ name, points }))
      .sort((a, b) => b.points - a.points);
  }, []);

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      <button onClick={() => navigate('/')} className="flex items-center text-slate-400 hover:text-white transition-colors">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Hub
      </button>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-red-500">Formula 1 Analytics</h1>
          <p className="text-slate-400">Analyze driver consistency, team dominance, and race results.</p>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-400">Search Driver</label>
          <input 
            type="text"
            list="drivers-list"
            className="flex h-10 w-[250px] items-center justify-between rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-red-500"
            value={selectedDriver}
            onChange={(e) => setSelectedDriver(e.target.value)}
            placeholder="Type a driver name..."
          />
          <datalist id="drivers-list">
            {f1Drivers.map(driver => (
              <option key={driver} value={driver} />
            ))}
          </datalist>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-200">Total Points</CardTitle>
            <Trophy className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{driverStats.totalPoints}</div>
            <p className="text-xs text-slate-400">{driverStats.team}</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-200">Podiums (Wins)</CardTitle>
            <Flag className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{driverStats.podiums} ({driverStats.wins})</div>
            <p className="text-xs text-slate-400">In {driverStats.positions.length} races</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-200">Avg Finish</CardTitle>
            <Timer className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">P{driverStats.avgFinish}</div>
            <p className="text-xs text-slate-400">{driverStats.dnfs} DNFs</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-200">Consistency Score</CardTitle>
            <Zap className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{driverStats.consistencyScore}/100</div>
            <p className="text-xs text-slate-400">Based on finish variance</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-slate-200">Championship Progression</CardTitle>
            <CardDescription className="text-slate-400">Cumulative points over the season</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[300px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={driverStats.cumulativePoints} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                  <XAxis dataKey="race" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#f8fafc' }}
                    itemStyle={{ color: '#f8fafc' }}
                  />
                  <Line type="monotone" dataKey="points" name="Total Points" stroke="#ef4444" strokeWidth={3} dot={{ r: 4, fill: '#ef4444', strokeWidth: 2, stroke: '#1e293b' }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card className="col-span-3 bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-slate-200">Team Dominance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={teamDominance} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip cursor={{fill: '#1e293b'}} contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#f8fafc' }} itemStyle={{ color: '#f8fafc' }} />
                  <Bar dataKey="points" radius={[4, 4, 0, 0]} barSize={40}>
                    {teamDominance.map((entry, index) => {
                      const colors: Record<string, string> = {
                        'Red Bull': '#3b82f6', // Bright Blue
                        'Ferrari': '#ef4444',  // Bright Red
                        'McLaren': '#f97316',  // Bright Orange
                        'Mercedes': '#2dd4bf', // Teal
                        'Aston Martin': '#10b981' // Emerald
                      };
                      return <Cell key={`cell-${index}`} fill={colors[entry.name] || '#64748b'} />;
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-red-500" />
            <CardTitle className="text-slate-200">2024 Race Calendar</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-slate-400">
              <thead className="text-xs text-slate-300 uppercase bg-slate-800/50">
                <tr>
                  <th className="px-6 py-3 rounded-tl-lg">Round</th>
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3">Grand Prix</th>
                  <th className="px-6 py-3 rounded-tr-lg">Track</th>
                </tr>
              </thead>
              <tbody>
                {f1Calendar.map((race, i) => (
                  <tr key={i} className="border-b border-slate-800 last:border-0 hover:bg-slate-800/30">
                    <td className="px-6 py-4 font-medium text-white">{race.round}</td>
                    <td className="px-6 py-4">{race.date}</td>
                    <td className="px-6 py-4">{race.race}</td>
                    <td className="px-6 py-4">{race.track}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
