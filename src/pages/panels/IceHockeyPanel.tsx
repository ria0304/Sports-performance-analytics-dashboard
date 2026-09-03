import React from 'react';
import { RefreshCw, Shield, ListOrdered } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import LiveBadge from '../../components/LiveBadge';
import { useLiveData } from '../../hooks/useLiveData';
import { api } from '../../lib/api';

interface ScoreEvent {
  homeTeam: string;
  awayTeam: string;
  homeScore: string | null;
  awayScore: string | null;
  date: string;
}

function ScoreLine({ e }: { e: ScoreEvent }) {
  const played = e.homeScore !== null && e.awayScore !== null;
  return (
    <div className="flex items-center justify-between border-b border-slate-800 pb-2 text-sm">
      <span className="text-slate-100">
        {e.homeTeam} <span className="text-slate-500">vs</span> {e.awayTeam}
      </span>
      <span className={played ? 'text-white font-semibold' : 'text-teal-300 text-xs'}>
        {played ? `${e.homeScore} – ${e.awayScore}` : e.date}
      </span>
    </div>
  );
}

export default function IceHockeyPanel() {
  const { data, loading, error, refresh } = useLiveData(api.icehockey, 30000);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-teal-400" />
          <h2 className="text-2xl font-bold">San Jose Sharks</h2>
        </div>
        <div className="flex items-center gap-3">
          <LiveBadge source={data?.source} updatedAt={data?.updatedAt} />
          <button onClick={refresh} className="p-1.5 rounded-md hover:bg-slate-800 transition-colors" aria-label="Refresh">
            <RefreshCw className={`w-4 h-4 text-slate-400 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {error && !data && <p className="text-red-400 text-sm">{error}</p>}
      {(data?.note || data?.warning) && <p className="text-xs text-amber-400/80">{data?.note || data?.warning}</p>}

      <div className="grid md:grid-cols-3 gap-6">
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-slate-100">Next Games</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {data?.nextGames?.length ? (
              data.nextGames.map((e) => <ScoreLine key={e.id} e={e} />)
            ) : (
              <p className="text-slate-500 text-sm">No upcoming games found.</p>
            )}
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-slate-100">Recent Results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {data?.lastResults?.length ? (
              [...data.lastResults].reverse().map((e) => <ScoreLine key={e.id} e={e} />)
            ) : (
              <p className="text-slate-500 text-sm">No recent results found.</p>
            )}
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-100">
              <ListOrdered className="w-4 h-4 text-teal-400" /> {data?.league || 'NHL'} Standings
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data?.nhlTable?.length ? (
              <table className="w-full text-xs">
                <thead className="text-slate-500 text-left">
                  <tr>
                    <th className="pb-1">#</th>
                    <th className="pb-1">Team</th>
                    <th className="pb-1 text-right">P</th>
                    <th className="pb-1 text-right">Pts</th>
                  </tr>
                </thead>
                <tbody>
                  {data.nhlTable.map((row) => (
                    <tr
                      key={row.position}
                      className={`border-t border-slate-800 ${row.team.toLowerCase().includes('sharks') ? 'text-teal-300 font-semibold' : 'text-slate-300'}`}
                    >
                      <td className="py-1.5">{row.position}</td>
                      <td className="py-1.5">{row.team}</td>
                      <td className="py-1.5 text-right">{row.played}</td>
                      <td className="py-1.5 text-right">{row.points}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-slate-500 text-sm">Standings unavailable.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
