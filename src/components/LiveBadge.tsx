import React from 'react';
import type { DataSource } from '../lib/api';

const LABELS: Record<DataSource, { text: string; className: string }> = {
  live: { text: 'Live', className: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' },
  'live-cache': { text: 'Live (cached)', className: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' },
  'cache-stale': { text: 'Stale cache', className: 'bg-amber-500/15 text-amber-400 border-amber-500/30' },
  fallback: { text: 'Offline fallback', className: 'bg-slate-500/15 text-slate-400 border-slate-500/30' },
};

export default function LiveBadge({ source, updatedAt }: { source?: DataSource; updatedAt?: string }) {
  if (!source) return null;
  const label = LABELS[source] ?? LABELS.fallback;
  const time = updatedAt ? new Date(updatedAt).toLocaleTimeString() : '';

  return (
    <div className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${label.className}`}>
      <span className="relative flex h-1.5 w-1.5">
        {source === 'live' && (
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
        )}
        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-current" />
      </span>
      {label.text}
      {time && <span className="text-slate-500">· {time}</span>}
    </div>
  );
}
