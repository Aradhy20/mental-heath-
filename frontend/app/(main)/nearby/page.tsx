'use client';

import React, { useEffect, useState } from 'react';
import { 
  MapPin, 
  Phone, 
  ExternalLink, 
  Navigation, 
  Search, 
  Map as MapIcon, 
  Compass, 
  Sparkles,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Resource {
  id: number;
  name: string;
  type: 'Psychiatrist' | 'Psychologist' | 'Clinic' | 'Helpline';
  address: string;
  phone: string;
  lat: number;
  lng: number;
}

const RESOURCE_TYPES = ['All', 'Psychiatrist', 'Psychologist', 'Clinic', 'Helpline'];

const MOCK_RESOURCES: Resource[] = [
  { id: 1, name: 'NIMHANS Brain Clinic', type: 'Clinic', address: 'Hosur Road, Lakkasandra, Bangalore', phone: '080-26995000', lat: 12.9415, lng: 77.5955 },
  { id: 2, name: 'iCall Counselling Service', type: 'Helpline', address: 'Tata Institute of Social Sciences, Mumbai', phone: '9152987821', lat: 19.0443, lng: 72.9238 },
  { id: 3, name: 'Vandrevala Foundation Helpline', type: 'Helpline', address: 'Pan-India Remote Support, Mumbai', phone: '1860-2662-345', lat: 19.1176, lng: 72.9060 },
  { id: 4, name: 'The Mind Research Foundation', type: 'Clinic', address: 'Indiranagar, Bangalore', phone: '080-25202050', lat: 12.9719, lng: 77.6412 },
  { id: 5, name: 'Spandana Psychiatric Hospital', type: 'Psychiatrist', address: 'Rajajinagar, Bangalore', phone: '080-23152199', lat: 12.9982, lng: 77.5530 },
];

const TYPE_COLORS: Record<Resource['type'], string> = {
  Psychiatrist: '#818CF8', // Indigo
  Psychologist: '#34D399', // Emerald
  Clinic: '#FBBF24',       // Amber
  Helpline: '#F87171',     // Red
};

export default function NearbyPage() {
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<number | null>(1);
  const [locating, setLocating] = useState(false);
  const [userCity, setUserCity] = useState('');
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [mapMode, setMapMode] = useState<'roadmap' | 'satellite'>('roadmap');

  const filtered = MOCK_RESOURCES.filter((r) => {
    const matchType = filter === 'All' || r.type === filter;
    const matchSearch = r.name.toLowerCase().includes(search.toLowerCase()) ||
                       r.address.toLowerCase().includes(search.toLowerCase());
    return matchType && matchSearch;
  });

  const getMapUrl = () => {
    let lat = 12.9415;
    let lng = 77.5955;
    
    if (selected) {
      const activeRes = MOCK_RESOURCES.find(r => r.id === selected);
      if (activeRes) {
        lat = activeRes.lat;
        lng = activeRes.lng;
      }
    } else if (userCoords) {
      lat = userCoords.lat;
      lng = userCoords.lng;
    }

    const tParam = mapMode === 'satellite' ? 'k' : 'm';
    return `https://maps.google.com/maps?q=${lat},${lng}&t=${tParam}&z=15&output=embed`;
  };

  const handleLocate = () => {
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserCity('Detected Location ✓');
        setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setSelected(null);
        setLocating(false);
      },
      () => {
        setUserCity('Access Denied');
        setLocating(false);
      }
    );
  };

  return (
    <div style={{ maxWidth: 1440, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem', height: 'calc(100vh - 6rem)' }}>
      
      {/* Header Banner */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.4), rgba(15, 23, 42, 0.6))',
        border: '1px solid var(--outline)',
        padding: '1.25rem 2rem',
        borderRadius: 'var(--radius-lg)',
        backdropFilter: 'blur(10px)',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <Sparkles size={16} color="var(--primary-dim)" />
            <span style={{ fontSize: '0.68rem', fontWeight: 800, color: 'var(--primary-dim)', textTransform: 'uppercase', letterSpacing: '1.5px' }}>Support Finder</span>
          </div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--on-surface)', margin: 0 }}>Nearby Wellness Resources</h1>
          <p style={{ color: 'var(--on-surface-muted)', fontSize: '0.8rem', marginTop: '0.15rem' }}>
            Instantly locate certified psychiatrists, clinical psychologists, and active crisis helplines.
          </p>
        </div>
        
        {/* Toggle Map Mode */}
        <div style={{ display: 'flex', gap: '0.5rem', background: 'rgba(9, 13, 22, 0.4)', padding: 4, borderRadius: 10, border: '1px solid var(--outline)' }}>
          <button 
            onClick={() => setMapMode('roadmap')}
            style={{
              padding: '0.4rem 0.8rem',
              fontSize: '0.7rem',
              fontWeight: 700,
              background: mapMode === 'roadmap' ? 'linear-gradient(135deg,#7C3AED,#6366F1)' : 'transparent',
              color: mapMode === 'roadmap' ? 'white' : 'var(--on-surface-muted)',
              border: 'none',
              borderRadius: 6,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            Map View
          </button>
          <button 
            onClick={() => setMapMode('satellite')}
            style={{
              padding: '0.4rem 0.8rem',
              fontSize: '0.7rem',
              fontWeight: 700,
              background: mapMode === 'satellite' ? 'linear-gradient(135deg,#7C3AED,#6366F1)' : 'transparent',
              color: mapMode === 'satellite' ? 'white' : 'var(--on-surface-muted)',
              border: 'none',
              borderRadius: 6,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            Satellite View
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 280 }}>
          <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', opacity: 0.5, color: 'var(--on-surface)' }} />
          <input 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, clinic, location..."
            style={{
              width: '100%',
              padding: '0.68rem 1rem 0.68rem 2.5rem',
              background: '#FFFFFF',
              border: '1px solid rgba(124,58,237,0.12)',
              borderRadius: 12,
              outline: 'none',
              fontSize: '0.85rem',
              fontWeight: 600,
              color: '#1E1B4B'
            }}
          />
        </div>

        <button
          onClick={handleLocate}
          disabled={locating}
          style={{
            padding: '0.68rem 1.25rem',
            background: 'rgba(124,58,237,0.06)',
            border: '1px solid rgba(124,58,237,0.15)',
            color: '#7C3AED',
            borderRadius: 12,
            fontWeight: 800,
            fontSize: '0.8rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            cursor: 'pointer'
          }}
        >
          <Navigation size={14} className={locating ? 'animate-pulse' : ''} />
          {locating ? 'Locating...' : userCity || 'Detect My Location'}
        </button>
      </div>

      {/* Type Filters */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        {RESOURCE_TYPES.map((t) => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            style={{
              padding: '0.4rem 0.9rem',
              background: filter === t ? 'rgba(124,58,237,0.08)' : '#FFFFFF',
              border: filter === t ? '1px solid #7C3AED' : '1px solid rgba(124,58,237,0.08)',
              color: filter === t ? '#7C3AED' : 'var(--on-surface-muted)',
              borderRadius: 20,
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.375rem',
              transition: 'all 0.2s'
            }}
          >
            {t !== 'All' && (
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: TYPE_COLORS[t as Resource['type']] }} />
            )}
            {t}
          </button>
        ))}
      </div>

      {/* Main Map Panel Grid Layout */}
      <div style={{ flex: 1, minHeight: 0, display: 'grid', gap: '1.5rem' }} className="lg:grid-cols-[1fr_360px]">
        
        {/* Interactive Google Map Canvas */}
        <div style={{
          position: 'relative',
          borderRadius: 20,
          overflow: 'hidden',
          border: '1px solid rgba(124,58,237,0.12)',
          boxShadow: '0 8px 32px rgba(124,58,237,0.04)',
          background: '#090d16',
          height: '100%'
        }}>
          <iframe 
            width="100%" 
            height="100%" 
            title="Google Maps Location"
            src={getMapUrl()}
            style={{ border: 'none' }}
            allowFullScreen
            loading="lazy"
          />

          {/* Quick Info Overlay */}
          <div style={{
            position: 'absolute',
            bottom: '1rem',
            left: '1rem',
            background: 'rgba(9, 13, 22, 0.85)',
            backdropFilter: 'blur(8px)',
            padding: '0.6rem 1rem',
            borderRadius: 12,
            border: '1px solid rgba(255,255,255,0.08)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: 'white',
            fontSize: '0.72rem',
            fontWeight: 600,
            pointerEvents: 'none',
            zIndex: 10
          }}>
            <Info size={12} color="var(--primary-dim)" />
            Real-Time Google Maps Integration Active
          </div>
        </div>

        {/* Resources Scroll List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', overflowY: 'auto', height: '100%', paddingRight: '0.25rem' }}>
          {filtered.map((r) => {
            const isSelected = selected === r.id;
            return (
              <motion.div
                key={r.id}
                onClick={() => setSelected(isSelected ? null : r.id)}
                whileHover={{ x: 2 }}
                style={{
                  padding: '1.25rem',
                  borderRadius: 16,
                  cursor: 'pointer',
                  border: isSelected ? '1px solid #7C3AED' : '1px solid rgba(124,58,237,0.06)',
                  background: isSelected ? 'rgba(124,58,237,0.04)' : '#FFFFFF',
                  boxShadow: isSelected ? '0 8px 24px rgba(124,58,237,0.02)' : '0 2px 8px rgba(0,0,0,0.005)',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.875rem'
                }}
              >
                <div style={{
                  width: 38,
                  height: 38,
                  borderRadius: 10,
                  background: `${TYPE_COLORS[r.type]}15`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <MapPin size={18} color={TYPE_COLORS[r.type]} />
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 2 }}>
                    <h4 style={{ fontWeight: 800, fontSize: '0.9rem', color: '#1E1B4B', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {r.name}
                    </h4>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: 8 }}>
                    <span style={{ padding: '0.15rem 0.4rem', background: `${TYPE_COLORS[r.type]}12`, color: TYPE_COLORS[r.type], fontSize: '0.625rem', fontWeight: 800, textTransform: 'uppercase', borderRadius: 6 }}>
                      {r.type}
                    </span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--on-surface-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {r.address}
                    </span>
                  </div>

                  <AnimatePresence>
                    {isSelected && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        style={{ overflow: 'hidden', display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}
                      >
                        <a 
                          href={`tel:${r.phone}`}
                          onClick={(e) => e.stopPropagation()}
                          style={{
                            padding: '0.45rem 0.8rem',
                            background: 'rgba(16,185,129,0.08)',
                            border: '1px solid rgba(16,185,129,0.15)',
                            color: '#10B981',
                            borderRadius: 10,
                            fontWeight: 800,
                            fontSize: '0.7rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                            textDecoration: 'none'
                          }}
                        >
                          <Phone size={12} /> Call Service
                        </a>
                        <a 
                          href={`https://maps.google.com/?q=${r.lat},${r.lng}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          style={{
                            padding: '0.45rem 0.8rem',
                            background: 'rgba(124,58,237,0.08)',
                            border: '1px solid rgba(124,58,237,0.15)',
                            color: '#7C3AED',
                            borderRadius: 10,
                            fontWeight: 800,
                            fontSize: '0.7rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                            textDecoration: 'none'
                          }}
                        >
                          <ExternalLink size={12} /> Directions
                        </a>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            );
          })}

          {filtered.length === 0 && (
            <div style={{ textAlign: 'center', color: 'var(--on-surface-muted)', padding: '3rem 1rem', fontSize: '0.85rem' }}>
              No clinics or helplines found matching your search.
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
