import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { motogpData, motogpRiders, motogpCalendar } from '../data/mockData';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ScatterChart, Scatter, ZAxis, Cell, LineChart, Line } from 'recharts';
import { Flag, AlertTriangle, Trophy, Activity, ArrowLeft, Calendar } from 'lucide-react';

export default function MotoGP() {
  const navigate = useNavigate();
  const [selectedRider, setSelectedRider] = useState('Francesco Bagnaia');

  const riderStats = useMemo(() => {
    const races = motogpData.filter(r => r.rider === selectedRider);
    
    let totalPoints = 0;
    let wins = 0;
    let podiums = 0;
    let crashes = 0;
    
    const trackPerformance: { track: string; position: number; points: number }[] = [];
    const cumulativePoints: { race: string; points: number }[] = [];

    races.forEach(race => {
      totalPoints += race.points;
      if (race.position === 1) wins++;
      if (race.position <= 3) podiums++;
      if (race.position > 15 || race.points === 0) crashes++;
      
      trackPerformance.push({
        track: race.race,
        position: race.position,
        points: race.points
      });

      cumulativePoints.push({
        race: race.race,
        points: totalPoints
      });
    });

    const winRate = races.length > 0 ? ((wins / races.length) * 100).toFixed(1) : '0';
    const crashRate = races.length > 0 ? ((crashes / races.length) * 100).toFixed(1) : '0';

    return {
      totalPoints, wins, podiums, crashes, winRate, crashRate, trackPerformance, cumulativePoints, manufacturer: races[0]?.manufacturer || 'Unknown'
    };
  }, [selectedRider]);

  const heatmapData = useMemo(() => {
    return motogpData.map(d => ({
      x: d.race,
      y: d.rider,
      z: 21 - d.position,
      position: d.position,
      points: d.points
    }));
  }, []);

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      <button onClick={() => navigate('/')} className="flex items-center text-slate-400 hover:text-white transition-colors">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Hub
      </button>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-blue-500">MotoGP Analytics</h1>
          <p className="text-slate-400">Analyze rider performance, crash rates, and track-wise dominance.</p>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-400">Search Rider</label>
          <input 
            type="text"
            list="riders-list"
            className="flex h-10 w-[250px] items-center justify-between rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={selectedRider}
            onChange={(e) => setSelectedRider(e.target.value)}
            placeholder="Type a rider name..."
          />
          <datalist id="riders-list">
            {motogpRiders.map(rider => (
              <option key={rider} value={rider} />
            ))}
          </datalist>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-200">Total Points</CardTitle>
            <Trophy className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{riderStats.totalPoints}</div>
            <p className="text-xs text-slate-400">{riderStats.manufacturer}</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-200">Win Rate</CardTitle>
            <Flag className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{riderStats.winRate}%</div>
            <p className="text-xs text-slate-400">{riderStats.wins} Wins, {riderStats.podiums} Podiums</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-200">Crash Rate</CardTitle>
            <AlertTriangle className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{riderStats.crashRate}%</div>
            <p className="text-xs text-slate-400">{riderStats.crashes} DNFs/Crashes</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-200">Risk vs Reward</CardTitle>
            <Activity className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {riderStats.crashes === 0 ? 'High' : (riderStats.totalPoints / riderStats.crashes).toFixed(1)}
            </div>
            <p className="text-xs text-slate-400">Points per crash</p>
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
                <LineChart data={riderStats.cumulativePoints} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                  <XAxis dataKey="race" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#f8fafc' }}
                    itemStyle={{ color: '#f8fafc' }}
                  />
                  <Line type="monotone" dataKey="points" name="Total Points" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#1e293b' }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card className="col-span-3 bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-slate-200">Track-wise Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={riderStats.trackPerformance} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                  <XAxis dataKey="track" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    cursor={{fill: '#1e293b'}}
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#f8fafc' }}
                    itemStyle={{ color: '#f8fafc' }}
                  />
                  <Bar dataKey="points" name="Points" radius={[4, 4, 0, 0]} barSize={40}>
                    {riderStats.trackPerformance.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.points === 0 ? '#ef4444' : '#3b82f6'} />
                    ))}
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
            <Calendar className="w-5 h-5 text-blue-500" />
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
                {motogpCalendar.map((race, i) => (
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
