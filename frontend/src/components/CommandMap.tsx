'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Incident } from '@/lib/types';
import { Plus, Minus, Crosshair, Eye, Map as MapIcon, Grid } from 'lucide-react';

const MapLibreMap = dynamic(() => import('@/components/MapLibreMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-[#F7F5F0] dark:bg-[#0E1524] text-xs font-mono text-gray-500">
      Loading OpenStreetMap GIS Vector Mesh...
    </div>
  ),
});

interface CommandMapProps {
  incidents: Incident[];
  selectedIncident: Incident | null;
  onSelectIncident: (inc: Incident) => void;
}

export default function CommandMap({ incidents, selectedIncident, onSelectIncident }: CommandMapProps) {
  const [viewMode, setViewMode] = useState<'svg' | 'maplibre'>('svg');
  const [zoomLevel, setZoomLevel] = useState(1);
  const [timeFilter, setTimeFilter] = useState<'live' | '1h' | 'today' | '7d'>('live');

  // Layer toggles
  const [layers, setLayers] = useState({
    defects: true,
    hazards: true,
    rails: true,
    busMesh: true
  });

  // Bus movement simulation
  const [bus1Pos, setBus1Pos] = useState({ x: 410, y: 250, speed: 28 });
  const [bus2Pos, setBus2Pos] = useState({ x: 650, y: 120, speed: 38 });

  useEffect(() => {
    const interval = setInterval(() => {
      setBus1Pos(prev => ({
        ...prev,
        x: prev.x > 500 ? 380 : prev.x + 0.8,
        speed: Math.floor(26 + Math.random() * 6)
      }));
      setBus2Pos(prev => ({
        ...prev,
        y: prev.y > 220 ? 100 : prev.y + 0.6,
        speed: Math.floor(36 + Math.random() * 5)
      }));
    }, 400);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full h-[640px] lg:h-[calc(100vh-170px)] bg-[#F7F5F0] dark:bg-[#0E1524] overflow-hidden select-none border-b lg:border-b-0 lg:border-r border-[#E2DDD5] dark:border-[#1E2C44] transition-colors duration-200">
      {viewMode === 'maplibre' ? (
        <MapLibreMap
          incidents={incidents}
          selectedIncident={selectedIncident}
          onSelectIncident={onSelectIncident}
        />
      ) : (
        /* SVG Cartographic Grid Canvas */
        <svg
          className="w-full h-full"
          viewBox="0 0 1000 700"
          preserveAspectRatio="xMidYMid slice"
        >
        {/* Subtle grid lines */}
        <defs>
          <pattern id="carto-grid" width="100" height="100" patternUnits="userSpaceOnUse">
            <path d="M 100 0 L 0 0 0 100" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-stone-300/40 dark:text-slate-800/60" />
          </pattern>
        </defs>
        <rect width="1000" height="700" fill="url(#carto-grid)" />

        {/* Park polygon: Cubbon Park */}
        <path
          d="M 250 360 C 270 340, 380 345, 430 380 C 470 410, 480 470, 440 500 C 370 540, 260 520, 250 450 Z"
          className="fill-[#E3EBDC] dark:fill-[#162920] opacity-80"
        />
        <text x="310" y="435" className="font-serif text-[11px] font-bold tracking-widest fill-[#4A5D4E] dark:fill-[#4ADE80] uppercase opacity-70">
          Cubbon Park Reserve
        </text>

        {/* Lake polygon: Ulsoor Lake */}
        <path
          d="M 620 570 C 650 540, 710 560, 730 610 C 740 660, 680 690, 640 680 C 600 670, 600 600, 620 570 Z"
          className="fill-[#DCE8EE] dark:fill-[#0F283D] opacity-85"
        />
        <text x="665" y="640" className="font-serif text-[10px] font-bold tracking-wider fill-[#3F6274] dark:fill-[#38BDF8] uppercase opacity-70">
          Ulsoor Lake
        </text>

        {/* Major Road Arterials */}
        {/* 1. Outer Ring Road (Top-Right to Bottom-Right) */}
        <path
          d="M 100 120 L 700 130 L 1050 200"
          className="stroke-[#1F2937] dark:stroke-[#475569]"
          strokeWidth="6"
          fill="none"
          strokeLinecap="round"
        />
        <text x="500" y="125" className="font-mono text-[9px] tracking-wider fill-white font-bold">
          OUTER RING ROAD • NORTH ARTERY
        </text>

        {/* 2. Hosur Highway / Brigade Road Axis (Vertical Diagonal) */}
        <path
          d="M 440 130 L 520 450 L 570 700"
          className="stroke-[#1F2937] dark:stroke-[#334155]"
          strokeWidth="7"
          fill="none"
          strokeLinecap="round"
        />
        <text x="525" y="660" transform="rotate(78, 525, 660)" className="font-mono text-[9px] tracking-widest fill-[#6B7280] dark:fill-[#94A3B8] font-semibold">
          HOSUR HIGHWAY / BRIGADE ROAD AXIS
        </text>

        {/* 3. Mahatma Gandhi Road (Horizontal Cross) */}
        <path
          d="M 20 480 L 400 480 L 700 520"
          className="stroke-[#1F2937] dark:stroke-[#334155]"
          strokeWidth="7"
          fill="none"
          strokeLinecap="round"
        />
        <text x="250" y="495" className="font-mono text-[9px] tracking-wider fill-[#4B5563] dark:fill-[#94A3B8] font-bold">
          MAHATMA GANDHI ROAD (BRTS CORRIDOR)
        </text>

        {/* Bus Fleet Mesh: Live Moving Buses */}
        {layers.busMesh && (
          <g>
            {/* Bus 1: BMTC-4102 on MG Road */}
            <g transform={`translate(${bus1Pos.x}, ${bus1Pos.y + 230})`}>
              <rect x="-6" y="-6" width="12" height="12" rx="2" className="fill-[#0D9488] stroke-white stroke-2" />
              <g transform="translate(10, 3)">
                <rect x="0" y="-12" width="135" height="16" rx="3" className="fill-[#0D1B2A]/90 dark:fill-black/90" />
                <text x="4" y="-1" className="font-mono text-[9px] fill-white">
                  ● BMTC-4102 • {bus1Pos.speed} km/h
                </text>
              </g>
              <text x="12" y="16" className="font-mono text-[8px] fill-[#0D9488] dark:fill-[#2DD4BF] font-semibold">
                CAM CONF 98.4%
              </text>
            </g>

            {/* Bus 2: BMTC-118 on Outer Ring Road */}
            <g transform={`translate(${bus2Pos.x}, ${bus2Pos.y})`}>
              <rect x="-6" y="-6" width="12" height="12" rx="2" className="fill-[#2563EB] stroke-white stroke-2" />
              <g transform="translate(10, -5)">
                <rect x="0" y="-10" width="105" height="14" rx="3" className="fill-[#0D1B2A]/90 dark:fill-black/90" />
                <text x="4" y="0" className="font-mono text-[9px] fill-white">
                  BMTC-118 • {bus2Pos.speed} km/h
                </text>
              </g>
            </g>
          </g>
        )}

        {/* Incident Pins on Map */}
        {layers.defects && (
          <g>
            {/* 1. MG Road Exposed Rebar (P1 Critical) */}
            <g
              className="cursor-pointer group"
              transform="translate(372, 480)"
              onClick={() => {
                const target = incidents.find(i => i.id === 'INC-2025-0849') || incidents[0];
                if (target) onSelectIncident(target);
              }}
            >
              {/* Pulsing Radar Ring */}
              <circle r="22" className="fill-red-500/20 stroke-red-600 stroke-1 animate-radar" />
              <circle r="8" className="fill-[#B91C1C] stroke-white stroke-2 shadow-lg" />
              {/* Label Pill */}
              <g transform="translate(12, -8)">
                <rect x="0" y="-12" width="125" height="18" rx="3" className="fill-[#B91C1C] drop-shadow-md" />
                <text x="6" y="1" className="font-mono text-[9.5px] font-bold fill-white">
                  P1 • EXPOSED REBAR 96.4
                </text>
              </g>
            </g>

            {/* 2. Crushed Bollard (P2) */}
            <g
              className="cursor-pointer"
              transform="translate(150, 545)"
              onClick={() => {
                const target = incidents.find(i => i.priority_level === 'P2_MAJOR') || incidents[0];
                if (target) onSelectIncident(target);
              }}
            >
              <circle r="5" className="fill-amber-500 stroke-white stroke-2" />
              <g transform="translate(10, 2)">
                <rect x="0" y="-10" width="105" height="14" rx="2" className="fill-amber-100 dark:fill-amber-950/80 stroke border-amber-300" />
                <text x="4" y="0" className="font-mono text-[8.5px] font-semibold fill-amber-900 dark:fill-amber-300">
                  P2 • CRUSHED BOLLARD
                </text>
              </g>
            </g>
          </g>
        )}

        {/* 3. Traffic Hazard: Wrong-Way Tempo */}
        {layers.hazards && (
          <g
            className="cursor-pointer"
            transform="translate(535, 560)"
            onClick={() => {
              const target = incidents.find(i => i.id === 'INC-2025-0914') || incidents[0];
              if (target) onSelectIncident(target);
            }}
          >
            <circle r="6" className="fill-red-600 stroke-white stroke-2 animate-pulse" />
            <g transform="translate(10, 0)">
              <rect x="0" y="-10" width="112" height="15" rx="2" className="fill-[#FEF2F2] dark:fill-red-950/80 stroke border-red-300" />
              <text x="4" y="1" className="font-mono text-[8.5px] font-bold fill-red-800 dark:fill-red-300">
                P1 • WRONG-WAY TEMPO
              </text>
            </g>
          </g>
        )}
      </svg>
      )}

      {/* View Mode Toggle Bar (Top Right) */}
      <div className="absolute top-3 right-3 flex items-center rounded-lg bg-white/95 dark:bg-[#131B2A]/95 p-1 border border-[#E2DDD5] dark:border-[#223048] shadow-md backdrop-blur text-xs font-mono z-20">
        <button
          onClick={() => setViewMode('svg')}
          className={`px-2.5 py-1 rounded flex items-center gap-1.5 transition-all ${
            viewMode === 'svg'
              ? 'bg-[#0D1B2A] dark:bg-[#1E293B] text-white shadow-sm font-semibold'
              : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
        >
          <Grid className="w-3.5 h-3.5" />
          Cartographic Grid
        </button>
        <button
          onClick={() => setViewMode('maplibre')}
          className={`px-2.5 py-1 rounded flex items-center gap-1.5 transition-all ${
            viewMode === 'maplibre'
              ? 'bg-[#0D1B2A] dark:bg-[#1E293B] text-white shadow-sm font-semibold'
              : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
        >
          <MapIcon className="w-3.5 h-3.5 text-teal-400" />
          Map View (MapLibre)
        </button>
      </div>

      {/* Map Overlay Controls (Bottom Left, 1:1 with Screenshot 1) */}
      <div className="absolute bottom-3 left-3 flex flex-col gap-2 z-10">
        {/* Time Machine Pill Bar */}
        <div className="flex items-center rounded-lg bg-white/95 dark:bg-[#131B2A]/95 p-1 border border-[#E2DDD5] dark:border-[#223048] shadow-sm backdrop-blur text-xs font-mono">
          <button
            onClick={() => setTimeFilter('live')}
            className={`px-2.5 py-1 rounded flex items-center gap-1.5 transition-all ${
              timeFilter === 'live'
                ? 'bg-[#0D1B2A] dark:bg-[#1E293B] text-white shadow-sm font-semibold'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
            Live Stream
          </button>
          <button
            onClick={() => setTimeFilter('1h')}
            className={`px-2.5 py-1 rounded transition-all ${timeFilter === '1h' ? 'bg-[#0D1B2A] text-white font-semibold' : 'text-gray-600 dark:text-gray-300'}`}
          >
            Past 1h
          </button>
          <button
            onClick={() => setTimeFilter('today')}
            className={`px-2.5 py-1 rounded transition-all ${timeFilter === 'today' ? 'bg-[#0D1B2A] text-white font-semibold' : 'text-gray-600 dark:text-gray-300'}`}
          >
            Today
          </button>
          <button
            onClick={() => setTimeFilter('7d')}
            className={`px-2.5 py-1 rounded transition-all ${timeFilter === '7d' ? 'bg-[#0D1B2A] text-white font-semibold' : 'text-gray-600 dark:text-gray-300'}`}
          >
            7 Days
          </button>
        </div>

        {/* Active GIS Telemetry Layers Box */}
        <div className="w-72 rounded-lg bg-white/95 dark:bg-[#131B2A]/95 p-3 border border-[#E2DDD5] dark:border-[#223048] shadow-md backdrop-blur">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-gray-200 dark:border-gray-800">
            <span className="text-[11px] font-mono font-bold tracking-wider uppercase text-gray-500 dark:text-gray-400">
              Active GIS Telemetry Layers
            </span>
            <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
              All Active
            </span>
          </div>

          <div className="space-y-2 text-xs">
            {/* Layer 1 */}
            <label className="flex items-center justify-between cursor-pointer group">
              <span className="flex items-center gap-2 text-gray-800 dark:text-gray-200">
                <input
                  type="checkbox"
                  checked={layers.defects}
                  onChange={(e) => setLayers({ ...layers, defects: e.target.checked })}
                  className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                />
                Road Surface Defects
              </span>
              <span className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 font-semibold">
                42 flagged
              </span>
            </label>

            {/* Layer 2 */}
            <label className="flex items-center justify-between cursor-pointer group">
              <span className="flex items-center gap-2 text-gray-800 dark:text-gray-200">
                <input
                  type="checkbox"
                  checked={layers.hazards}
                  onChange={(e) => setLayers({ ...layers, hazards: e.target.checked })}
                  className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                />
                Traffic Safety Hazards
              </span>
              <span className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                21 active
              </span>
            </label>

            {/* Layer 3 */}
            <label className="flex items-center justify-between cursor-pointer group">
              <span className="flex items-center gap-2 text-gray-800 dark:text-gray-200">
                <input
                  type="checkbox"
                  checked={layers.rails}
                  onChange={(e) => setLayers({ ...layers, rails: e.target.checked })}
                  className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                />
                Urban Structural Rails
              </span>
              <span className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                11 active
              </span>
            </label>

            {/* Layer 4 */}
            <label className="flex items-center justify-between cursor-pointer group">
              <span className="flex items-center gap-2 text-gray-800 dark:text-gray-200">
                <input
                  type="checkbox"
                  checked={layers.busMesh}
                  onChange={(e) => setLayers({ ...layers, busMesh: e.target.checked })}
                  className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                />
                BMTC Bus Fleet Mesh
              </span>
              <span className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-semibold">
                418 nodes
              </span>
            </label>
          </div>

          {/* Coordinate & Zoom Strip */}
          <div className="mt-3 pt-2 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between text-[10px] font-mono text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-1">
              <button
                onClick={() => setZoomLevel(prev => Math.min(prev + 0.2, 2))}
                className="w-5 h-5 rounded border border-gray-300 dark:border-gray-700 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                +
              </button>
              <button
                onClick={() => setZoomLevel(prev => Math.max(prev - 0.2, 0.8))}
                className="w-5 h-5 rounded border border-gray-300 dark:border-gray-700 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                -
              </button>
              <button
                onClick={() => setZoomLevel(1)}
                className="w-5 h-5 rounded border border-gray-300 dark:border-gray-700 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <Crosshair className="w-3 h-3" />
              </button>
            </div>
            <span>12.9716° N, 77.5946° E</span>
          </div>
        </div>
      </div>
    </div>
  );
}
