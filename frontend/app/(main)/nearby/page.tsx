'use client';
import { useEffect, useRef, useState } from 'react';
import { MapPin, Phone, ExternalLink, Navigation, Search } from 'lucide-react';

const RESOURCE_TYPES = ['All', 'Psychiatrist', 'Psychologist', 'Clinic', 'Helpline'];

const MOCK_RESOURCES = [
  { id: 1, name: 'NIMHANS', type: 'Clinic', address: 'Hosur Road, Bangalore', phone: '080-46110007', lat: 12.9415, lng: 77.5955 },
  { id: 2, name: 'iCall Counselling', type: 'Helpline', address: 'Online / Mumbai', phone: '9152987821', lat: 19.0760, lng: 72.8777 },
  { id: 3, name: 'Vandrevala Foundation', type: 'Helpline', address: 'Pan-India', phone: '1860-2662-345', lat: 18.9667, lng: 72.8333 },
  { id: 4, name: 'The Mind Research Foundation', type: 'Clinic', address: 'Chennai', phone: '044-24747050', lat: 13.0827, lng: 80.2707 },
  { id: 5, name: 'LVPrasad Psychiatry', type: 'Psychiatrist', address: 'Hyderabad', phone: '040-30612345', lat: 17.3850, lng: 78.4867 },
];

const TYPE_COLORS: Record<string, string> = {
  Psychiatrist: '#818CF8',
  Psychologist:  '#34D399',
  Clinic:        '#FBBF24',
  Helpline:      '#F87171',
};

export default function NearbyPage() {
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<number | null>(null);
  const [locating, setLocating] = useState(false);
  const [userCity, setUserCity] = useState('');

  const filtered = MOCK_RESOURCES.filter((r) => {
    const matchType = filter === 'All' || r.type === filter;
    const matchSearch = r.name.toLowerCase().includes(search.toLowerCase()) ||
                       r.address.toLowerCase().includes(search.toLowerCase());
    return matchType && matchSearch;
  });

  const handleLocate = () => {
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserCity('Your location detected ✓');
        setLocating(false);
      },
      () => {
        setUserCity('Location access denied');
        setLocating(false);
      }
    );
  };

  return (
    <div className="page-enter" style={{ maxWidth: 1100, margin: '0 auto' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 className="headline-md">Nearby Resources</h1>
        <p style={{ color: 'var(--on-surface-muted)', marginTop: '0.25rem' }}>
          Mental health professionals and helplines near you
        </p>
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1.25rem', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--on-surface-muted)' }} />
          <input
            id="nearby-search"
            className="input"
            placeholder="Search by name or city…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: '2.25rem' }}
          />
        </div>
        <button
          onClick={handleLocate}
          className="btn btn-tonal"
          disabled={locating}
          style={{ gap: '0.375rem', fontSize: '0.875rem' }}
        >
          <Navigation size={15} />
          {locating ? 'Locating…' : userCity || 'Use My Location'}
        </button>
      </div>

      {/* Type filters */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
        {RESOURCE_TYPES.map((t) => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            className={`btn ${filter === t ? 'btn-tonal' : 'btn-ghost'}`}
            style={{ fontSize: '0.8rem', padding: '0.375rem 0.875rem' }}
          >
            {t !== 'All' && <span style={{ width: 8, height: 8, borderRadius: '50%', background: TYPE_COLORS[t], display: 'inline-block', marginRight: 4 }} />}
            {t}
          </button>
        ))}
      </div>

      {/* Main layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1.25rem' }}>
        {/* Map placeholder */}
        <div
          className="glass-card"
          style={{
            height: 480,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            overflow: 'hidden',
            background: 'var(--surface-2)',
          }}
        >
          {/* OSM embed placeholder — in production connect to leaflet/mapbox */}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(135deg, rgba(99,102,241,0.05), rgba(52,211,153,0.05))',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem',
          }}>
            {/* Grid overlay to simulate map */}
            <svg width="100%" height="100%" style={{ position: 'absolute', opacity: 0.08 }}>
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="var(--primary)" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>

            {/* Pins */}
            {filtered.map((r, i) => (
              <button
                key={r.id}
                onClick={() => setSelected(r.id)}
                title={r.name}
                style={{
                  position: 'absolute',
                  left: `${20 + (i * 14) % 60}%`,
                  top: `${25 + (i * 18) % 50}%`,
                  background: selected === r.id ? 'var(--primary)' : TYPE_COLORS[r.type] ?? '#818CF8',
                  color: 'white',
                  border: 'none',
                  borderRadius: 'var(--radius-full)',
                  padding: '0.25rem 0.625rem',
                  fontSize: '0.7rem',
                  fontFamily: 'inherit',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: `0 2px 12px ${TYPE_COLORS[r.type] ?? '#818CF8'}60`,
                  transform: selected === r.id ? 'scale(1.15)' : 'scale(1)',
                  transition: 'all var(--transition)',
                  zIndex: selected === r.id ? 10 : 1,
                  display: 'flex', alignItems: 'center', gap: '0.25rem',
                }}
              >
                <MapPin size={11} /> {r.name.split(' ')[0]}
              </button>
            ))}

            <div style={{ textAlign: 'center', zIndex: 1, pointerEvents: 'none' }}>
              <MapPin size={32} color="var(--primary)" style={{ marginBottom: '0.5rem', opacity: 0.4 }} />
              <p style={{ color: 'var(--on-surface-muted)', fontSize: '0.875rem' }}>
                Interactive map · {filtered.length} resources
              </p>
            </div>
          </div>
        </div>

        {/* Resource list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: 480, overflowY: 'auto' }}>
          {filtered.map((r) => (
            <button
              key={r.id}
              onClick={() => setSelected(selected === r.id ? null : r.id)}
              style={{
                background: selected === r.id ? 'var(--primary-container)' : 'var(--glass-bg)',
                backdropFilter: 'blur(24px)',
                border: `1px solid ${selected === r.id ? 'var(--outline-strong)' : 'var(--glass-border)'}`,
                borderRadius: 'var(--radius-md)',
                padding: '1rem',
                textAlign: 'left',
                cursor: 'pointer',
                transition: 'all var(--transition)',
                fontFamily: 'inherit',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.625rem' }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 8,
                  background: `${TYPE_COLORS[r.type] ?? '#818CF8'}20`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <MapPin size={16} color={TYPE_COLORS[r.type] ?? '#818CF8'} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: '0.875rem', marginBottom: '0.25rem' }}>{r.name}</div>
                  <div style={{ color: 'var(--on-surface-muted)', fontSize: '0.75rem', marginBottom: '0.5rem' }}>
                    <span className="badge" style={{ background: `${TYPE_COLORS[r.type]}18`, color: TYPE_COLORS[r.type], fontSize: '0.65rem', marginRight: '0.25rem' }}>{r.type}</span>
                    {r.address}
                  </div>
                  {selected === r.id && (
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                      <a href={`tel:${r.phone}`} className="btn btn-tonal" style={{ fontSize: '0.75rem', padding: '0.25rem 0.625rem' }}>
                        <Phone size={12} /> {r.phone}
                      </a>
                      <a
                        href={`https://www.openstreetmap.org/?mlat=${r.lat}&mlon=${r.lng}#map=15/${r.lat}/${r.lng}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-ghost"
                        style={{ fontSize: '0.75rem', padding: '0.25rem 0.625rem' }}
                      >
                        <ExternalLink size={12} /> Directions
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </button>
          ))}

          {filtered.length === 0 && (
            <div style={{ textAlign: 'center', color: 'var(--on-surface-muted)', padding: '2rem', fontSize: '0.875rem' }}>
              No resources found matching your search.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
