import React from 'react';
import { RefreshCw, Award, CalendarClock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import LiveBadge from '../../components/LiveBadge';
import { useLiveData } from '../../hooks/useLiveData';
import { api } from '../../lib/api';

export default function EquestrianPanel() {
  const { data, loading, error, refresh } = useLiveData(api.equestrian, 30000);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <Award className="w-5 h-5 text-amber-400" />
          <h2 className="text-2xl font-bold">Equestrian</h2>
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
      <p className="text-xs text-slate-500">{data?.discipline || 'Equestrian'} · {data?.season}</p>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-100">
              <CalendarClock className="w-4 h-4 text-amber-400" /> Upcoming Events
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {data?.upcomingEvents?.length ? (
              data.upcomingEvents.map((e) => (
                <div key={e.id} className="flex justify-between border-b border-slate-800 pb-2 text-sm">
                  <div>
                    <p className="text-slate-100">{e.event}</p>
                    <p className="text-slate-500 text-xs">{e.venue}</p>
                  </div>
                  <span className="text-amber-400 text-xs whitespace-nowrap">{e.date}</span>
                </div>
              ))
            ) : (
              <p className="text-slate-500 text-sm">No upcoming events found.</p>
            )}
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-slate-100">Recent Results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {data?.recentEvents?.length ? (
              [...data.recentEvents].reverse().map((e) => (
                <div key={e.id} className="flex justify-between border-b border-slate-800 pb-2 text-sm">
                  <div>
                    <p className="text-slate-100">{e.event}</p>
                    <p className="text-slate-500 text-xs">{e.result ? `Winner: ${e.result}` : e.venue}</p>
                  </div>
                  <span className="text-slate-500 text-xs whitespace-nowrap">{e.date}</span>
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
