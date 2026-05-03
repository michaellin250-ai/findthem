import { useMemo } from 'react';

export default function StatsStrip({ allCases, visibleCases, loading }) {
  const topState = useMemo(() => {
    if (!visibleCases.length) return null;
    const counts = {};
    visibleCases.forEach(c => {
      counts[c.stateFull || c.state] = (counts[c.stateFull || c.state] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
  }, [visibleCases]);

  const stats = [
    {
      label: 'Total Cases',
      value: loading ? '—' : allCases.length.toLocaleString(),
      sub: 'NamUs database',
    },
    {
      label: 'In Current View',
      value: loading ? '—' : visibleCases.length.toLocaleString(),
      sub: 'after filters',
    },
    {
      label: 'Most Affected State',
      value: loading ? '—' : (topState ? topState[0] : '—'),
      sub: loading ? '' : (topState ? `${topState[1].toLocaleString()} cases` : ''),
    },
  ];

  return (
    <div
      className="absolute top-14 left-0 right-0 z-30 flex items-stretch border-b"
      style={{
        background: 'rgba(10,10,20,0.92)',
        borderColor: 'rgba(255,255,255,0.05)',
        backdropFilter: 'blur(8px)',
      }}
    >
      {stats.map((s, i) => (
        <div
          key={s.label}
          className={`flex-1 flex flex-col justify-center px-4 md:px-6 py-2.5 ${i < stats.length - 1 ? 'border-r' : ''}`}
          style={{ borderColor: 'rgba(255,255,255,0.05)' }}
        >
          <span className="text-xs text-slate-500 uppercase tracking-wider leading-none">{s.label}</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-base md:text-lg font-semibold text-slate-100 leading-none tabular-nums">
              {s.value}
            </span>
            {s.sub && (
              <span className="text-xs text-slate-600 leading-none hidden sm:inline">{s.sub}</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
