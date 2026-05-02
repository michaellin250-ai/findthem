import { useEffect, useState } from 'react';

function InfoRow({ label, value }) {
  if (!value) return null;
  return (
    <div className="flex flex-col gap-0.5 py-3 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
      <span className="text-xs font-medium uppercase tracking-widest text-slate-500">{label}</span>
      <span className="text-sm text-slate-200">{value}</span>
    </div>
  );
}

export default function CasePanel({ caseData, onClose }) {
  const [imgError, setImgError] = useState(false);
  const [copied, setCopied] = useState(false);

  // Reset image error when case changes
  useEffect(() => {
    setImgError(false);
    setCopied(false);
  }, [caseData?.id]);

  if (!caseData) return null;

  const handleShare = async () => {
    const text = `Missing: ${caseData.name} | Last seen: ${caseData.city ? `${caseData.city}, ` : ''}${caseData.stateFull} | NamUs: ${caseData.namusUrl}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: `FindThem — ${caseData.name}`, text, url: caseData.namusUrl });
      } else {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      // user cancelled share
    }
  };

  const location = [caseData.city, caseData.county, caseData.stateFull]
    .filter(Boolean)
    .join(', ');

  return (
    <aside
      className="panel-enter absolute right-0 top-0 bottom-0 z-50 w-80 md:w-96 flex flex-col"
      style={{
        background: 'rgba(13, 13, 26, 0.98)',
        borderLeft: '1px solid rgba(255,255,255,0.08)',
        backdropFilter: 'blur(20px)',
        boxShadow: '-8px 0 60px rgba(0,0,0,0.7)',
      }}
    >
      {/* Header bar */}
      <div
        className="flex items-center justify-between px-5 h-14 flex-shrink-0 border-b"
        style={{ borderColor: 'rgba(255,255,255,0.07)' }}
      >
        <span className="text-xs font-semibold uppercase tracking-widest text-amber-500">
          Case Details
        </span>
        <button
          onClick={onClose}
          className="w-7 h-7 flex items-center justify-center rounded-md text-slate-500 hover:text-slate-200 hover:bg-white/5 transition-all"
          aria-label="Close panel"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M1 1L11 11M11 1L1 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto">

        {/* Photo + name header */}
        <div className="relative">
          {/* Photo */}
          <div
            className="w-full bg-white/3 flex items-center justify-center overflow-hidden"
            style={{ height: 200 }}
          >
            {caseData.photoUrl && !imgError ? (
              <img
                src={caseData.photoUrl}
                alt={caseData.name}
                className="w-full h-full object-cover"
                onError={() => setImgError(true)}
              />
            ) : (
              <div className="flex flex-col items-center gap-2 text-slate-600">
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                  <circle cx="24" cy="18" r="9" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M6 42c0-9.941 8.059-18 18-18s18 8.059 18 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                <span className="text-xs">No photo available</span>
              </div>
            )}
          </div>

          {/* Amber accent bar */}
          <div className="h-0.5 w-full" style={{ background: 'linear-gradient(90deg, #F59E0B 0%, transparent 100%)' }} />
        </div>

        {/* Details */}
        <div className="px-5 pt-1 pb-6">
          <h2
            className="text-xl font-semibold text-white mt-4 mb-1 leading-snug"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            {caseData.name}
          </h2>
          <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-full"
            style={{ background: 'rgba(245,158,11,0.12)', color: '#F59E0B' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            Active Case
          </span>

          <div className="mt-4 -mx-0">
            <InfoRow label="Age at Disappearance" value={caseData.age} />
            <InfoRow label="Gender" value={caseData.gender} />
            <InfoRow label="Date Missing" value={caseData.dateMissing} />
            <InfoRow label="Last Known Location" value={location} />
            <InfoRow label="NamUs Case #" value={caseData.id} />
          </div>

          {/* NamUs link */}
          {caseData.namusUrl && (
            <a
              href={caseData.namusUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full mt-5 py-3 rounded-xl text-sm font-semibold transition-all duration-200 hover:brightness-110 active:scale-95"
              style={{ background: 'linear-gradient(135deg, rgba(245,158,11,0.2) 0%, rgba(245,158,11,0.1) 100%)', border: '1px solid rgba(245,158,11,0.35)', color: '#FBBF24' }}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M5.5 2H2.5A1.5 1.5 0 001 3.5v8A1.5 1.5 0 002.5 13h8A1.5 1.5 0 0012 11.5v-3" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
                <path d="M8 1h5v5M13 1L7 7" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              View on NamUs
            </a>
          )}

          {/* Share */}
          <button
            onClick={handleShare}
            className="flex items-center justify-center gap-2 w-full mt-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 hover:bg-white/5"
            style={{ border: '1px solid rgba(255,255,255,0.08)', color: '#64748b' }}
          >
            {copied ? (
              <>
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                  <path d="M2 7l3 3 6-6" stroke="#22c55e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span style={{ color: '#22c55e' }}>Copied to clipboard</span>
              </>
            ) : (
              <>
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                  <path d="M9.5 1C10.328 1 11 1.672 11 2.5S10.328 4 9.5 4c-.452 0-.858-.19-1.148-.494L5.37 5.182c.083.264.13.545.13.818s-.047.554-.13.818l2.982 1.676C8.642 8.19 9.048 8 9.5 8 10.328 8 11 8.672 11 9.5S10.328 11 9.5 11 8 10.328 8 9.5c0-.041.002-.082.005-.122L4.928 7.65C4.638 7.857 4.283 8 3.897 8 3.07 8 2 7.328 2 6.5S2.672 5 3.5 5c.386 0 .741.143 1.031.35L7.495 3.694C7.497 3.63 7.5 3.565 7.5 3.5 7.5 2.672 8.172 2 9 2L9.5 1z" stroke="currentColor" strokeWidth="1.1" />
                </svg>
                Share Case
              </>
            )}
          </button>

          {/* Tip line */}
          <div className="mt-6 p-3 rounded-xl text-xs leading-relaxed" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', color: '#64748b' }}>
            <span className="text-amber-600 font-medium">Have information?</span>{' '}
            Call the NCMEC hotline: <a href="tel:18008435678" className="text-amber-500 hover:underline">1-800-843-5678</a>
          </div>
        </div>
      </div>
    </aside>
  );
}
