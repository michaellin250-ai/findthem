export default function BottomBar({ onAboutClick }) {
  return (
    <div
      className="absolute bottom-0 left-0 right-0 z-30 flex items-center justify-between px-4 md:px-6 h-8"
      style={{
        background: 'rgba(10,10,20,0.92)',
        borderTop: '1px solid rgba(255,255,255,0.05)',
        backdropFilter: 'blur(8px)',
      }}
    >
      <div className="flex items-center gap-4 text-xs text-slate-600">
        <span>
          Data:{' '}
          <a
            href="https://namus.nij.ojp.gov"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-amber-500 transition-colors"
          >
            NamUs
          </a>
          {' · '}
          <a
            href="https://www.missingkids.org"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-amber-500 transition-colors"
          >
            NCMEC
          </a>
          {' · '}
          <a
            href="https://www.openstreetmap.org/copyright"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-amber-500 transition-colors"
          >
            © OpenStreetMap
          </a>
        </span>
      </div>

      <div className="flex items-center gap-3 text-xs text-slate-600">
        <span className="hidden sm:inline">Map: © Mapbox</span>
        <button onClick={onAboutClick} className="hover:text-amber-500 transition-colors">
          About
        </button>
      </div>
    </div>
  );
}
