'use client';

import React, { useState, useEffect } from 'react';
import { fetchFleetStatus, fetchCorridors, fetchCorridorTelemetry } from '@/lib/api';
import { FleetStatus, RouteItem } from '@/lib/types';
import {
  Radio, Clock, AlertTriangle, Activity, Wifi, RefreshCw,
  Search, SlidersHorizontal, ArrowRight, ShieldCheck, Download
} from 'lucide-react';

export default function FleetSensorOpsPage() {
  const [fleetStatus, setFleetStatus] = useState<FleetStatus | null>(null);
  const [corridors, setCorridors] = useState<RouteItem[]>([]);
  const [selectedRouteId, setSelectedRouteId] = useState<string>('500-D');
  const [telemetryDock, setTelemetryDock] = useState<any>(null);
  const [searchFilter, setSearchFilter] = useState('');

  useEffect(() => {
    fetchFleetStatus().then(setFleetStatus).catch(console.error);
    fetchCorridors().then(setCorridors).catch(console.error);
    fetchCorridorTelemetry(selectedRouteId).then(setTelemetryDock).catch(console.error);
  }, [selectedRouteId]);

  return (
    <div className="flex-1 bg-[#FAF8F5] dark:bg-[#0B0F17] p-4 lg:p-6 space-y-4 transition-colors">
      {/* Subheader & Top Title (Screenshot 4) */}
      <div className="space-y-1 border-b border-[#E2DDD5] dark:border-[#1E2C44] pb-4">
        <div className="flex items-center gap-2 text-xs font-mono text-gray-500 uppercase tracking-wider">
          <span className="font-bold text-gray-800 dark:text-gray-200">BMTC • AUTONOMOUS VISION MESH TELEMETRY</span>
          <span>•</span>
          <span className="text-emerald-600 dark:text-emerald-400 font-semibold">GRID REFRESH: 1.4s</span>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-1">
          <div>
            <h1 className="font-serif font-bold text-2xl text-[#16191F] dark:text-white leading-tight">
              Transit Sensor Mesh & Route Operations
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Continuous streaming edge telematics across BBMP transit arteries: optical hardware telemetry, route trajectory variance, lane-surface auditing, and real-time headway fidelity.
            </p>
          </div>

          {/* Top Status Pills */}
          <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
            <span className="px-3 py-1 rounded bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 font-semibold">
              ● 362 Buses Nominal 86.6%
            </span>
            <span className="px-3 py-1 rounded bg-red-50 dark:bg-red-950/60 border border-red-300 dark:border-red-800 text-red-800 dark:text-red-300 font-semibold">
              ● 44 Delayed avg +14m
            </span>
            <span className="px-3 py-1 rounded bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-300 font-semibold">
              ⚠ 12 Sensor Offline
            </span>
            <span className="px-3 py-1 rounded bg-[#0D1B2A] dark:bg-[#1E293B] text-white font-bold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              ((•)) 418 Active Units
            </span>
          </div>
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white dark:bg-[#131B2A] border border-[#E2DDD5] dark:border-[#223048] shadow-sm">
          <span className="block text-[10px] font-mono text-gray-500 uppercase tracking-wider">OPTICAL SIGHT-TO-CLOUD SYNC</span>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="font-mono font-bold text-2xl text-gray-900 dark:text-white">3.82</span>
            <span className="text-xs text-gray-500 font-mono">seconds latency</span>
          </div>
          <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full mt-3 overflow-hidden">
            <div className="h-full bg-teal-600 rounded-full w-4/5" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-[#131B2A] border border-[#E2DDD5] dark:border-[#223048] shadow-sm">
          <span className="block text-[10px] font-mono text-gray-500 uppercase tracking-wider">DAILY KILOMETERS SCANNED</span>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="font-mono font-bold text-2xl text-gray-900 dark:text-white">48,240</span>
            <span className="text-xs text-gray-500 font-mono">km / 24h</span>
          </div>
          <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full mt-3 overflow-hidden">
            <div className="h-full bg-stone-800 dark:bg-slate-300 rounded-full w-3/4" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-[#131B2A] border border-[#E2DDD5] dark:border-[#223048] shadow-sm">
          <span className="block text-[10px] font-mono text-gray-500 uppercase tracking-wider">ROADWAY AUDITED TODAY</span>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="font-mono font-bold text-2xl text-emerald-600 dark:text-emerald-400">1,842.6</span>
            <span className="text-xs text-gray-500 font-mono">km verified</span>
          </div>
          <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full mt-3 overflow-hidden">
            <div className="h-full bg-emerald-600 rounded-full w-2/3" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-[#131B2A] border border-[#E2DDD5] dark:border-[#223048] shadow-sm">
          <span className="block text-[10px] font-mono text-gray-500 uppercase tracking-wider">ACTIVE AI DEFECT DETECTIONS</span>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="font-mono font-bold text-2xl text-red-600 dark:text-red-400">184</span>
            <span className="text-xs text-gray-500 font-mono">potholes & ruts</span>
          </div>
          <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full mt-3 overflow-hidden">
            <div className="h-full bg-red-600 rounded-full w-1/2" />
          </div>
        </div>
      </div>

      {/* Main Content Grid: Left Active Corridors Table & Map, Right Diagnostic Dock */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Table & Spatial Route Geometry (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Active Corridors Table */}
          <div className="rounded-xl bg-white dark:bg-[#131B2A] border border-[#E2DDD5] dark:border-[#223048] shadow-sm overflow-hidden">
            <div className="p-3 border-b border-gray-200 dark:border-gray-800 flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="font-serif font-bold text-sm text-[#16191F] dark:text-white">
                  Active Corridors & Fleet Nodes
                </h2>
                <p className="text-[11px] font-mono text-gray-500">Live telemetry sorted by corridor density and variance</p>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-2 top-2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Filter route or bus reg..."
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                    className="pl-7 pr-2 py-1 rounded border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-[#0E1524] text-xs font-mono"
                  />
                </div>
                <button className="p-1 rounded border border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-300">
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-[#FAF8F5] dark:bg-[#0E1524] text-gray-500 uppercase text-[10px] border-b border-gray-200 dark:border-gray-800">
                  <tr>
                    <th className="p-2.5">Corridor Route</th>
                    <th className="p-2.5">Sensor Buses</th>
                    <th className="p-2.5">Schedule Latency</th>
                    <th className="p-2.5">Route Fidelity</th>
                    <th className="p-2.5">Headway Gap</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {corridors.map((c) => {
                    const isSelected = selectedRouteId === c.id;
                    return (
                      <tr
                        key={c.id}
                        onClick={() => setSelectedRouteId(c.id)}
                        className={`cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-amber-50/70 dark:bg-amber-950/20'
                            : 'hover:bg-gray-50 dark:hover:bg-[#1A2536]'
                        }`}
                      >
                        <td className="p-2.5">
                          <div className="flex items-center gap-2">
                            <span className="px-1.5 py-0.5 rounded bg-black text-white font-bold text-[11px]">
                              {c.id}
                            </span>
                            <div>
                              <span className="font-bold text-gray-900 dark:text-white block">{c.name}</span>
                              <span className="text-[10px] text-gray-400">{c.corridor_name}</span>
                            </div>
                          </div>
                        </td>
                        <td className="p-2.5">
                          <span className="font-bold">{c.nominal_buses} Units</span>
                          <span className="block text-[10px] text-emerald-600 dark:text-emerald-400">
                            {c.sensor_status_text}
                          </span>
                        </td>
                        <td className="p-2.5">
                          <span className={`px-1.5 py-0.5 rounded text-[11px] font-bold ${
                            c.schedule_latency_min.includes('+24') || c.schedule_latency_min.includes('+34')
                              ? 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300'
                              : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                          }`}>
                            {c.schedule_latency_min}
                          </span>
                        </td>
                        <td className="p-2.5">
                          <span className="text-[11px] text-gray-800 dark:text-gray-200">
                            {c.route_fidelity}
                          </span>
                        </td>
                        <td className="p-2.5">
                          <span className={`text-[11px] font-semibold ${
                            c.headway_gap.includes('22m') ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'
                          }`}>
                            {c.headway_gap}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Spatial Route Sensor Geometry Map Box */}
          <div className="rounded-xl p-4 bg-white dark:bg-[#131B2A] border border-[#E2DDD5] dark:border-[#223048] shadow-sm space-y-2">
            <div className="flex justify-between items-center text-xs font-mono">
              <div>
                <span className="font-bold text-gray-900 dark:text-white">Spatial Route Sensor Geometry</span>
                <span className="block text-[10px] text-gray-500">Corridor telemetry ping cloud & speed scatter</span>
              </div>
              <span className="text-gray-400 text-[10px]">12.9352° N, 77.6245° E</span>
            </div>

            {/* Visual Corridor Snippet with Density & Chokepoint Markers */}
            <div className="relative rounded-lg overflow-hidden h-44 bg-[#EAE4DC] dark:bg-[#0E1524] border border-gray-300 dark:border-gray-800 flex items-center justify-center">
              <svg className="w-full h-full" viewBox="0 0 500 180">
                {/* Route Line */}
                <path d="M 50 150 Q 200 40 450 60" fill="none" stroke="#2563EB" strokeWidth="6" />
                <path d="M 50 150 Q 200 40 450 60" fill="none" stroke="#60A5FA" strokeWidth="2" strokeDasharray="4,4" />

                {/* Chokepoint Tin Factory Marker */}
                <circle cx="280" cy="55" r="7" className="fill-red-600 animate-ping" />
                <circle cx="280" cy="55" r="5" className="fill-red-600 stroke-white stroke-2" />
                <g transform="translate(180, 25)">
                  <rect x="0" y="-12" width="200" height="18" rx="3" className="fill-black/85" />
                  <text x="6" y="0" className="fill-white font-mono text-[9px]">
                    🔴 Chokepoint: Tin Factory (+24m Delay)
                  </text>
                </g>
              </svg>

              <div className="absolute bottom-2 right-2 bg-black/80 text-white font-mono text-[9px] px-2 py-1 rounded">
                ORR Optical Density: 9.4 sensors / km
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Route 500-D Diagnostic Dock (5 cols) */}
        <div className="lg:col-span-5 rounded-xl bg-white dark:bg-[#131B2A] border border-[#E2DDD5] dark:border-[#223048] p-4 shadow-sm space-y-4">
          <div className="border-b border-gray-200 dark:border-gray-800 pb-3">
            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="px-2 py-0.5 rounded bg-black text-white font-bold">ROUTE 500-D</span>
              <span className="text-gray-500">DIAGNOSTIC DOCK</span>
            </div>
            <h3 className="font-serif font-bold text-base text-gray-900 dark:text-white mt-1">
              Silk Board ⇄ Hebbal Corridor Telemetry
            </h3>
            <p className="text-[11px] font-mono text-gray-500">
              BMTC Central Ring Arterial • 34.2 km total traversal
            </p>
          </div>

          {/* Delay-By-Hour Progression Chart */}
          <div className="p-3 rounded-lg bg-gray-50 dark:bg-[#0E1524] border border-gray-200 dark:border-gray-800 space-y-2">
            <div className="flex justify-between items-center text-[11px] font-mono">
              <span className="text-gray-600 dark:text-gray-300 font-semibold">
                DELAY-BY-HOUR PROGRESSION (06:00 to 22:00 IST)
              </span>
              <span className="text-red-600 dark:text-red-400 font-bold">Peak: +32m @ 09:30</span>
            </div>

            {/* Delay Curve SVG */}
            <div className="h-32 w-full pt-2">
              <svg className="w-full h-full" viewBox="0 0 400 100">
                {/* Horizontal grid lines */}
                <line x1="20" y1="20" x2="380" y2="20" stroke="#CBD5E1" strokeDasharray="2,2" />
                <line x1="20" y1="50" x2="380" y2="50" stroke="#CBD5E1" strokeDasharray="2,2" />
                <line x1="20" y1="80" x2="380" y2="80" stroke="#CBD5E1" />

                <text x="20" y="16" className="font-mono text-[8px] fill-gray-400">+30m</text>
                <text x="20" y="46" className="font-mono text-[8px] fill-gray-400">+15m</text>
                <text x="20" y="76" className="font-mono text-[8px] fill-gray-400">0m</text>

                {/* Delay Curve Path */}
                <path
                  d="M 30 80 Q 80 75 120 50 Q 150 15 180 20 Q 210 25 240 65 Q 280 65 310 40 Q 340 45 370 80"
                  fill="none"
                  stroke="#EA580C"
                  strokeWidth="2.5"
                />

                {/* Peak Point */}
                <circle cx="170" cy="20" r="4" fill="#DC2626" />
                <rect x="145" y="4" width="60" height="12" rx="2" fill="#0D1B2A" />
                <text x="150" y="13" className="fill-white font-mono text-[7.5px] font-bold">+32m Peak Rush</text>
              </svg>
            </div>

            <div className="flex justify-between text-[9px] font-mono text-gray-500 pt-1 border-t border-gray-200 dark:border-gray-800">
              <span>06:00</span>
              <span>09:30</span>
              <span>12:00</span>
              <span>18:00</span>
              <span>22:00</span>
            </div>
          </div>

          {/* Active Vision Buses on Route */}
          <div className="space-y-2">
            <div className="flex justify-between items-center font-mono text-xs">
              <span className="font-bold text-gray-800 dark:text-gray-200">Active Vision Buses on Route</span>
              <span className="text-teal-600 dark:text-teal-400">22 Online Telemetry Feeds</span>
            </div>

            <div className="space-y-2 text-xs font-mono">
              {/* Bus 1 */}
              <div className="p-2.5 rounded bg-gray-50 dark:bg-[#0E1524] border border-gray-200 dark:border-gray-800 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-900 dark:text-white">BMTC-KA-01-F-9412</span>
                    <span className="px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 text-[10px]">Healthy</span>
                  </div>
                  <span className="text-[10px] text-gray-500 block">Speed: 38 km/h • Cam: 60 FPS HDR • Pilot: S. Kumar</span>
                </div>
                <div className="text-right text-[10px] text-gray-500">
                  <span>Ping 82ms</span>
                  <span className="block text-emerald-600">4 pings/s</span>
                </div>
              </div>

              {/* Bus 2: Excess Vibration */}
              <div className="p-2.5 rounded bg-red-50/80 dark:bg-red-950/30 border border-red-200 dark:border-red-900 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-red-900 dark:text-red-300">BMTC-KA-01-F-8819</span>
                    <span className="px-1.5 py-0.2 rounded bg-red-200 text-red-800 text-[10px] font-bold">Excess Vibration</span>
                  </div>
                  <span className="text-[10px] text-red-700 dark:text-red-400 block">Speed: 14 km/h • Cam: 60 FPS • Heavy Road Ruts</span>
                </div>
                <div className="text-right text-[10px] text-red-700 dark:text-red-400">
                  <span className="font-bold">IRI: 6.4 (Poor)</span>
                  <span className="block">Sync Lag 2.1s</span>
                </div>
              </div>

              {/* Bus 3 */}
              <div className="p-2.5 rounded bg-gray-50 dark:bg-[#0E1524] border border-gray-200 dark:border-gray-800 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-900 dark:text-white">BMTC-KA-01-F-4102</span>
                    <span className="px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 text-[10px]">Healthy</span>
                  </div>
                  <span className="text-[10px] text-gray-500 block">Speed: 42 km/h • Cam: 60 FPS HDR • Pilot: R. Naik</span>
                </div>
                <div className="text-right text-[10px] text-gray-500">
                  <span>Ping 94ms</span>
                  <span className="block text-emerald-600">4 pings/s</span>
                </div>
              </div>
            </div>
          </div>

          {/* Diagnostic Actions */}
          <div className="pt-2 border-t border-gray-200 dark:border-gray-800 space-y-2">
            <div className="grid grid-cols-3 gap-2">
              <button className="py-2 px-2 rounded bg-[#0D1B2A] dark:bg-[#1E293B] text-white font-mono text-[10.5px] font-semibold flex items-center justify-center gap-1">
                ⇄ Rebalance
              </button>
              <button className="py-2 px-2 rounded border border-gray-300 dark:border-gray-700 font-mono text-[10.5px] text-gray-700 dark:text-gray-300 flex items-center justify-center gap-1">
                📡 Ping Node
              </button>
              <button className="py-2 px-2 rounded border border-gray-300 dark:border-gray-700 font-mono text-[10.5px] text-gray-700 dark:text-gray-300 flex items-center justify-center gap-1">
                <Download className="w-3 h-3" /> Report
              </button>
            </div>

            <div className="text-[10px] font-mono text-gray-500 dark:text-gray-400">
              🛡 Telemetry stream complies with BBMP Unified Urban Mobility Standard (UUMS) v4.2.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
