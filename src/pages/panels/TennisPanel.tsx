import React from 'react';
import { RefreshCw, Trophy, CalendarClock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import LiveBadge from '../../components/LiveBadge';
import { useLiveData } from '../../hooks/useLiveData';
import { api } from '../../lib/api';

export default function TennisPanel() {
  const { data, loading, error, refresh } = useLiveData(api.tennis, 30000);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-lime-400" />
          <h2 className="text-2xl font-bold">Tennis</h2>
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
      <p className="text-xs text-slate-500">{data?.tour || 'ATP'} tour · {data?.season}</p>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-100">
              <CalendarClock className="w-4 h-4 text-lime-400" /> Upcoming Tournaments
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {data?.upcomingTournaments?.length ? (
              data.upcomingTournaments.map((t) => (
                <div key={t.id} className="flex justify-between border-b border-slate-800 pb-2 text-sm">
                  <div>
                    <p className="text-slate-100">{t.tournament}</p>
                    <p className="text-slate-500 text-xs">{t.venue}</p>
                  </div>
                  <span className="text-lime-400 text-xs whitespace-nowrap">{t.date}</span>
                </div>
              ))
            ) : (
              <p className="text-slate-500 text-sm">No upcoming tournaments found.</p>
            )}
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-slate-100">Recent Results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {data?.recentTournaments?.length ? (
              [...data.recentTournaments].reverse().map((t) => (
                <div key={t.id} className="flex justify-between border-b border-slate-800 pb-2 text-sm">
                  <div>
                    <p className="text-slate-100">{t.tournament}</p>
                    <p className="text-slate-500 text-xs">{t.winner ? `Winner: ${t.winner}` : t.venue}</p>
                  </div>
                  <span className="text-slate-500 text-xs whitespace-nowrap">{t.date}</span>
                </div>
              ))
            ) : (
              <p className="text-slate-500 text-sm">No recent results found.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
