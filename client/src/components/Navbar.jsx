import { useState } from 'react';

export default function Navbar({ totalCases, visibleCases, onAboutClick, onSidebarToggle, sidebarOpen }) {
  return (
    <nav className="absolute top-0 left-0 right-0 z-40 flex items-center justify-between px-4 md:px-6 h-14 border-b"
      style={{
        background: 'linear-gradient(180deg, rgba(10,10,20,0.98) 0%, rgba(10,10,20,0.90) 100%)',
        borderColor: 'rgba(255,255,255,0.07)',
        backdropFilter: 'blur(12px)',
      }}>

      {/* Left: logo + sidebar toggle */}
      <div className="flex items-center gap-3">
        <button
          onClick={onSidebarToggle}
          className="w-8 h-8 flex flex-col justify-center items-center gap-1.5 rounded-md hover:bg-white/5 transition-colors"
          aria-label="Toggle filters"
        >
          <span className={`block w-4 h-px bg-slate-400 transition-all duration-200 ${sidebarOpen ? 'rotate-45 translate-y-[3.5px]' : ''}`} />
          <span className={`block w-4 h-px bg-slate-400 transition-all duration-200 ${sidebarOpen ? 'opacity-0' : ''}`} />
          <span className={`block w-4 h-px bg-slate-400 transition-all duration-200 ${sidebarOpen ? '-rotate-45 -translate-y-[3.5px]' : ''}`} />
        </button>

        <div className="flex items-center gap-2">
          {/* Amber dot */}
          <span className="w-2 h-2 rounded-full bg-amber-500 shadow-amber animate-pulse" />
          <span
            className="text-xl font-display text-white tracking-tight"
            style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700 }}
          >
            FindThem
          </span>
        </div>
      </div>

      {/* Center: tagline (hidden on mobile) */}
      <div className="hidden md:flex items-center gap-6 text-xs text-slate-500 tracking-widest uppercase">
        <span>Missing Persons · United States</span>
      </div>

      {/* Right: case count + about */}
      <div className="flex items-center gap-4">
        <div className="hidden sm:flex flex-col items-end">
          <span className="text-xs text-slate-500 leading-none">Cases in view</span>
          <span className="text-sm font-semibold text-amber-400 leading-none mt-0.5">
            {visibleCases.toLocaleString()}
            <span className="text-slate-600 font-normal"> / {totalCases.toLocaleString()}</span>
          </span>
        </div>

        <button
          onClick={onAboutClick}
          className="px-3 py-1.5 text-xs font-medium rounded-md border transition-all duration-200 hover:border-amber-500/40 hover:text-amber-400"
          style={{
            borderColor: 'rgba(255,255,255,0.1)',
            color: '#94a3b8',
          }}
        >
          About
        </button>
      </div>
    </nav>
  );
}
