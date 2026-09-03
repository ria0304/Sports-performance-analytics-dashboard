import React from 'react';
import { RefreshCw, Flag, Trophy } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import LiveBadge from '../../components/LiveBadge';
import { useLiveData } from '../../hooks/useLiveData';
import { api } from '../../lib/api';

export default function F1Panel() {
  const { data, loading, error, refresh } = useLiveData(api.f1, 30000);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <Flag className="w-5 h-5 text-red-400" />
          <h2 className="text-2xl font-bold">Formula 1</h2>
        </div>
        <div className="flex items-center gap-3">
          <LiveBadge source={data?.source} updatedAt={data?.updatedAt} />
          <button onClick={refresh} className="p-1.5 rounded-md hover:bg-slate-800 transition-colors" aria-label="Refresh">
            <RefreshCw className={`w-4 h-4 text-slate-400 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {error && !data && <p className="text-red-400 text-sm">{error}</p>}
      {(data?.note || data?.warning) && (
        <p className="text-xs text-amber-400/80">{data?.note || data?.warning}</p>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-100">
              <Trophy className="w-4 h-4 text-red-400" /> Driver Standings — {data?.season || '…'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!data ? (
              <p className="text-slate-500 text-sm">Loading…</p>
            ) : (
              <table className="w-full text-sm">
                <thead className="text-slate-500 text-left">
                  <tr>
                    <th className="pb-2">#</th>
                    <th className="pb-2">Driver</th>
                    <th className="pb-2">Team</th>
                    <th className="pb-2 text-right">Pts</th>
                  </tr>
                </thead>
                <tbody>
                  {data.driverStandings.map((d) => (
                    <tr key={d.position} className="border-t border-slate-800">
                      <td className="py-2 text-slate-400">{d.position}</td>
                      <td className="py-2 text-slate-100 font-medium">{d.driver}</td>
                      <td className="py-2 text-slate-400">{d.constructor}</td>
                      <td className="py-2 text-right text-red-400 font-semibold">{d.points}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-slate-100">Next Race</CardTitle>
            </CardHeader>
            <CardContent>
              {data?.nextRace ? (
                <div className="space-y-1">
                  <p className="text-lg font-semibold text-white">{data.nextRace.raceName}</p>
                  <p className="text-slate-400 text-sm">{data.nextRace.circuit}</p>
                  <p className="text-slate-500 text-sm">{data.nextRace.location}</p>
                  <p className="text-red-400 text-sm mt-2">
                    Round {data.nextRace.round} · {data.nextRace.date} {data.nextRace.time}
                  </p>
                </div>
              ) : (
                <p className="text-slate-500 text-sm">No upcoming race data.</p>
              )}
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-slate-100">Last Race — {data?.raceName || ''}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1.5">
              {data?.lastRaceResults?.length ? (
                data.lastRaceResults.slice(0, 5).map((r) => (
                  <div key={r.position} className="flex justify-between text-sm">
                    <span className="text-slate-300">
                      {r.position}. {r.driver}
                    </span>
                    <span className="text-slate-500">{r.points} pts</span>
                  </div>
                ))
              ) : (
                <p className="text-slate-500 text-sm">No recent results.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
