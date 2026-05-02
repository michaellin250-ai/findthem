export default function LoadingSkeleton({ error }) {
  if (error) {
    return (
      <div className="absolute inset-0 z-50 flex flex-col items-center justify-center gap-4"
        style={{ background: '#0a0a14' }}>
        <div className="w-12 h-12 rounded-full flex items-center justify-center"
          style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M10 6v4m0 4h.01M19 10A9 9 0 111 10a9 9 0 0118 0z"
              stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>
        <div className="text-center">
          <p className="text-slate-300 font-medium mb-1">Failed to load cases</p>
          <p className="text-sm text-slate-500 max-w-xs">{error}</p>
          <p className="text-xs text-slate-600 mt-2">Make sure the Flask server is running on port 5001</p>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="mt-2 px-4 py-2 text-sm rounded-lg font-medium transition-all hover:brightness-110"
          style={{ background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)', color: '#F59E0B' }}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center gap-6"
      style={{ background: 'linear-gradient(180deg, #0a0a14 0%, #0d0d1a 100%)' }}>

      {/* Logo */}
      <div className="flex items-center gap-3">
        <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse shadow-amber" />
        <span className="text-3xl font-display text-white tracking-tight"
          style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700 }}>
          FindThem
        </span>
      </div>

      {/* Animated rings */}
      <div className="relative w-20 h-20 flex items-center justify-center">
        {[0, 1, 2].map(i => (
          <div
            key={i}
            className="absolute rounded-full border border-amber-500/20"
            style={{
              width: 40 + i * 20,
              height: 40 + i * 20,
              animation: `ping 1.8s cubic-bezier(0,0,0.2,1) ${i * 0.3}s infinite`,
              borderColor: `rgba(245,158,11,${0.4 - i * 0.1})`,
            }}
          />
        ))}
        <div className="w-10 h-10 rounded-full flex items-center justify-center"
          style={{ background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)' }}>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M9 2a7 7 0 100 14A7 7 0 009 2z" stroke="#F59E0B" strokeWidth="1.25" />
            <path d="M9 5v4l2.5 2.5" stroke="#F59E0B" strokeWidth="1.25" strokeLinecap="round" />
          </svg>
        </div>
      </div>

      <div className="text-center">
        <p className="text-slate-300 font-medium text-sm">Loading cases from NamUs...</p>
        <p className="text-slate-600 text-xs mt-1.5">This may take a moment on first load</p>
      </div>

      {/* Skeleton bars */}
      <div className="w-64 space-y-2.5 mt-2">
        {[100, 80, 60, 90, 70].map((w, i) => (
          <div
            key={i}
            className="h-2 rounded-full skeleton-shimmer"
            style={{ width: `${w}%`, animationDelay: `${i * 0.1}s` }}
          />
        ))}
      </div>
    </div>
  );
}
