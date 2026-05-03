const US_STATES = [
  { abbr: 'AL', name: 'Alabama' }, { abbr: 'AK', name: 'Alaska' },
  { abbr: 'AZ', name: 'Arizona' }, { abbr: 'AR', name: 'Arkansas' },
  { abbr: 'CA', name: 'California' }, { abbr: 'CO', name: 'Colorado' },
  { abbr: 'CT', name: 'Connecticut' }, { abbr: 'DC', name: 'D.C.' },
  { abbr: 'DE', name: 'Delaware' }, { abbr: 'FL', name: 'Florida' },
  { abbr: 'GA', name: 'Georgia' }, { abbr: 'HI', name: 'Hawaii' },
  { abbr: 'ID', name: 'Idaho' }, { abbr: 'IL', name: 'Illinois' },
  { abbr: 'IN', name: 'Indiana' }, { abbr: 'IA', name: 'Iowa' },
  { abbr: 'KS', name: 'Kansas' }, { abbr: 'KY', name: 'Kentucky' },
  { abbr: 'LA', name: 'Louisiana' }, { abbr: 'ME', name: 'Maine' },
  { abbr: 'MD', name: 'Maryland' }, { abbr: 'MA', name: 'Massachusetts' },
  { abbr: 'MI', name: 'Michigan' }, { abbr: 'MN', name: 'Minnesota' },
  { abbr: 'MS', name: 'Mississippi' }, { abbr: 'MO', name: 'Missouri' },
  { abbr: 'MT', name: 'Montana' }, { abbr: 'NE', name: 'Nebraska' },
  { abbr: 'NV', name: 'Nevada' }, { abbr: 'NH', name: 'New Hampshire' },
  { abbr: 'NJ', name: 'New Jersey' }, { abbr: 'NM', name: 'New Mexico' },
  { abbr: 'NY', name: 'New York' }, { abbr: 'NC', name: 'North Carolina' },
  { abbr: 'ND', name: 'North Dakota' }, { abbr: 'OH', name: 'Ohio' },
  { abbr: 'OK', name: 'Oklahoma' }, { abbr: 'OR', name: 'Oregon' },
  { abbr: 'PA', name: 'Pennsylvania' }, { abbr: 'RI', name: 'Rhode Island' },
  { abbr: 'SC', name: 'South Carolina' }, { abbr: 'SD', name: 'South Dakota' },
  { abbr: 'TN', name: 'Tennessee' }, { abbr: 'TX', name: 'Texas' },
  { abbr: 'UT', name: 'Utah' }, { abbr: 'VT', name: 'Vermont' },
  { abbr: 'VA', name: 'Virginia' }, { abbr: 'WA', name: 'Washington' },
  { abbr: 'WV', name: 'West Virginia' }, { abbr: 'WI', name: 'Wisconsin' },
  { abbr: 'WY', name: 'Wyoming' },
];

function FilterSection({ title, children }) {
  return (
    <div className="mb-6">
      <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-3">
        {title}
      </h3>
      {children}
    </div>
  );
}

const RACE_OPTIONS = [
  'White / Caucasian',
  'Black / African American',
  'Hispanic / Latino',
  'Asian',
  'American Indian / Alaska Native',
  'Native Hawaiian / Other Pacific Islander',
  'Multiple Races',
  'Other',
  'Uncertain',
  'Unknown',
];

export default function Sidebar({ open, filters, onChange }) {
  const { state, ageMin, ageMax, gender, race, dateFrom, dateTo } = filters;

  const update = (key, val) => onChange({ ...filters, [key]: val });

  const activeCount = [
    state,
    gender && gender !== 'all',
    race,
    ageMin !== 0,
    ageMax !== 100,
    dateFrom,
    dateTo,
  ].filter(Boolean).length;

  return (
    <aside
      className="absolute left-0 z-30 top-[88px] bottom-8 w-72 flex flex-col transition-transform duration-300 ease-in-out"
      style={{
        background: 'rgba(11, 11, 22, 0.97)',
        borderRight: '1px solid rgba(255,255,255,0.06)',
        backdropFilter: 'blur(16px)',
        transform: open ? 'translateX(0)' : 'translateX(-100%)',
        boxShadow: open ? '4px 0 40px rgba(0,0,0,0.5)' : 'none',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        <div>
          <span className="text-sm font-semibold text-slate-100">Filters</span>
          {activeCount > 0 && (
            <span className="ml-2 text-xs font-medium px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400">
              {activeCount}
            </span>
          )}
        </div>
        {activeCount > 0 && (
          <button
            onClick={() => onChange({ state: '', gender: 'all', race: '', ageMin: 0, ageMax: 100, dateFrom: '', dateTo: '' })}
            className="text-xs text-slate-500 hover:text-amber-400 transition-colors"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Scrollable filter body */}
      <div className="flex-1 overflow-y-auto px-5 pt-5">

        <FilterSection title="State">
          <select
            value={state}
            onChange={e => update('state', e.target.value)}
            className="w-full bg-white/5 border text-sm text-slate-200 rounded-lg px-3 py-2.5 appearance-none cursor-pointer transition-colors hover:border-amber-500/30 focus:outline-none focus:border-amber-500/50"
            style={{ borderColor: 'rgba(255,255,255,0.1)' }}
          >
            <option value="">All States</option>
            {US_STATES.map(s => (
              <option key={s.abbr} value={s.abbr}>{s.name}</option>
            ))}
          </select>
        </FilterSection>

        <FilterSection title="Gender">
          <div className="flex rounded-lg overflow-hidden border" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
            {['all', 'male', 'female'].map(g => (
              <button
                key={g}
                onClick={() => update('gender', g)}
                className="flex-1 py-2 text-xs font-medium capitalize transition-all duration-150"
                style={{
                  background: gender === g ? 'rgba(245,158,11,0.15)' : 'transparent',
                  color: gender === g ? '#F59E0B' : '#94a3b8',
                  borderRight: g !== 'female' ? '1px solid rgba(255,255,255,0.06)' : 'none',
                }}
              >
                {g === 'all' ? 'All' : g.charAt(0).toUpperCase() + g.slice(1)}
              </button>
            ))}
          </div>
        </FilterSection>

        <FilterSection title="Race / Ethnicity">
          <select
            value={race || ''}
            onChange={e => update('race', e.target.value)}
            className="w-full bg-white/5 border text-sm text-slate-200 rounded-lg px-3 py-2.5 appearance-none cursor-pointer transition-colors hover:border-amber-500/30 focus:outline-none focus:border-amber-500/50"
            style={{ borderColor: 'rgba(255,255,255,0.1)' }}
          >
            <option value="">All Races</option>
            {RACE_OPTIONS.map(r => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </FilterSection>

        <FilterSection title={`Age Range — ${ageMin}–${ageMax === 100 ? '100+' : ageMax}`}>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs text-slate-500 mb-1.5">
                <span>Min: {ageMin}</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={ageMin}
                onChange={e => update('ageMin', Math.min(parseInt(e.target.value), ageMax - 1))}
              />
            </div>
            <div>
              <div className="flex justify-between text-xs text-slate-500 mb-1.5">
                <span>Max: {ageMax === 100 ? '100+' : ageMax}</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={ageMax}
                onChange={e => update('ageMax', Math.max(parseInt(e.target.value), ageMin + 1))}
              />
            </div>
          </div>
        </FilterSection>

        <FilterSection title="Date Missing">
          <div className="space-y-2.5">
            <div>
              <label className="text-xs text-slate-500 block mb-1.5">From</label>
              <input
                type="date"
                value={dateFrom}
                onChange={e => update('dateFrom', e.target.value)}
                className="w-full bg-white/5 border text-sm text-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:border-amber-500/50 transition-colors"
                style={{ borderColor: 'rgba(255,255,255,0.1)', colorScheme: 'dark' }}
              />
            </div>
            <div>
              <label className="text-xs text-slate-500 block mb-1.5">To</label>
              <input
                type="date"
                value={dateTo}
                onChange={e => update('dateTo', e.target.value)}
                className="w-full bg-white/5 border text-sm text-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:border-amber-500/50 transition-colors"
                style={{ borderColor: 'rgba(255,255,255,0.1)', colorScheme: 'dark' }}
              />
            </div>
          </div>
        </FilterSection>
      </div>

      {/* Footer note */}
      <div className="px-5 py-4 border-t text-xs text-slate-600 leading-relaxed" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
        Filters apply in real-time. Data refreshes every 24h.
      </div>
    </aside>
  );
}
