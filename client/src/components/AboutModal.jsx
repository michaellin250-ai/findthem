import { useEffect } from 'react';

export default function AboutModal({ onClose }) {
  // Close on Escape
  useEffect(() => {
    const handler = e => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="fade-in relative w-full max-w-lg rounded-2xl overflow-hidden"
        style={{
          background: 'linear-gradient(180deg, #111122 0%, #0d0d1a 100%)',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 40px 100px rgba(0,0,0,0.8)',
        }}
      >
        {/* Header */}
        <div
          className="px-6 pt-6 pb-4 border-b"
          style={{ borderColor: 'rgba(255,255,255,0.07)' }}
        >
          <div className="flex items-start justify-between">
            <div>
              <h2
                className="text-2xl font-bold text-white"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                About FindThem
              </h2>
              <p className="text-sm text-slate-500 mt-1">Missing persons visualization for the United States</p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:text-white hover:bg-white/5 transition-all flex-shrink-0 ml-4"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M1 1L11 11M11 1L1 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-5 max-h-[60vh] overflow-y-auto">

          {/* Data source */}
          <section>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-amber-500 mb-2">
              Data Source
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              All case data is sourced directly from{' '}
              <a
                href="https://namus.nij.ojp.gov"
                target="_blank"
                rel="noopener noreferrer"
                className="text-amber-400 hover:underline"
              >
                NamUs (National Missing and Unidentified Persons System)
              </a>
              , operated by the National Institute of Justice. Data refreshes every 24 hours and is not stored or modified.
            </p>
          </section>

          {/* How to report */}
          <section>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-amber-500 mb-2">
              How to Report a Tip
            </h3>
            <div className="space-y-2 text-sm text-slate-300 leading-relaxed">
              <p>If you have information about a missing person:</p>
              <ul className="list-none space-y-2 mt-2">
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />
                  Visit the individual NamUs case page (linked on each pin)
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />
                  Contact local law enforcement with the case number
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />
                  Submit tips directly via NamUs case contact form
                </li>
              </ul>
            </div>
          </section>

          {/* Emergency contact */}
          <div
            className="rounded-xl p-4 flex items-center gap-4"
            style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }}
          >
            <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(245,158,11,0.15)' }}>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M3 3h3l1.5 3.75-1.875 1.125A12.75 12.75 0 0010.125 12L11.25 10.125 15 11.625V15A1.5 1.5 0 0113.5 16.5 13.5 13.5 0 011.5 4.5 1.5 1.5 0 013 3z"
                  stroke="#F59E0B" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div>
              <p className="text-xs font-semibold text-amber-400 uppercase tracking-wider">NCMEC Hotline</p>
              <a href="tel:18008435678" className="text-xl font-bold text-white hover:text-amber-400 transition-colors tracking-tight">
                1-800-843-5678
              </a>
              <p className="text-xs text-slate-500 mt-0.5">National Center for Missing & Exploited Children — 24/7</p>
            </div>
          </div>

          {/* Disclaimer */}
          <p className="text-xs text-slate-600 leading-relaxed">
            FindThem is an independent visualization tool. We are not affiliated with NamUs, NCMEC, or any law enforcement agency. Always contact official authorities with any information.
          </p>
        </div>

        {/* Footer */}
        <div
          className="px-6 py-4 border-t flex items-center justify-between"
          style={{ borderColor: 'rgba(255,255,255,0.06)' }}
        >
          <span className="text-xs text-slate-600">Data: NamUs · NCMEC</span>
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium rounded-lg transition-all hover:brightness-110"
            style={{ background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.25)', color: '#F59E0B' }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
