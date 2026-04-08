import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, Flag, Trophy } from 'lucide-react';

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen p-8 max-w-6xl mx-auto flex flex-col items-center justify-center space-y-12">
      <div className="text-center space-y-4">
        <h1 className="text-5xl font-bold tracking-tight">Sports Analytics Hub</h1>
        <p className="text-xl text-slate-400">Select a sport to dive into the data</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
        <button 
          onClick={() => navigate('/football')}
          className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-900 to-slate-900 border border-emerald-800/50 p-8 hover:border-emerald-500 transition-all duration-300 hover:shadow-[0_0_30px_rgba(16,185,129,0.2)] text-left h-64 flex flex-col justify-between"
        >
          <Activity className="w-12 h-12 text-emerald-400 group-hover:scale-110 transition-transform" />
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">Football</h2>
            <p className="text-emerald-200/70">Leagues, UCL, World Cup & Match Analytics</p>
          </div>
        </button>

        <button 
          onClick={() => navigate('/f1')}
          className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-red-900 to-slate-900 border border-red-800/50 p-8 hover:border-red-500 transition-all duration-300 hover:shadow-[0_0_30px_rgba(225,29,72,0.2)] text-left h-64 flex flex-col justify-between"
        >
          <Flag className="w-12 h-12 text-red-400 group-hover:scale-110 transition-transform" />
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">Formula 1</h2>
            <p className="text-red-200/70">Driver Standings, Team Dominance & Calendars</p>
          </div>
        </button>

        <button 
          onClick={() => navigate('/motogp')}
          className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-900 to-slate-900 border border-blue-800/50 p-8 hover:border-blue-500 transition-all duration-300 hover:shadow-[0_0_30px_rgba(59,130,246,0.2)] text-left h-64 flex flex-col justify-between"
        >
          <Trophy className="w-12 h-12 text-blue-400 group-hover:scale-110 transition-transform" />
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">MotoGP</h2>
            <p className="text-blue-200/70">Rider Performance, Track Heatmaps & Stats</p>
          </div>
        </button>
      </div>
    </div>
  );
}
