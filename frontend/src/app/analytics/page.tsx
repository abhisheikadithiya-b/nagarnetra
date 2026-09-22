'use client';

import React, { useState, useEffect } from 'react';
import { fetchCongestionSegments, fetchODFlows } from '@/lib/api';
import { CongestionSegment } from '@/lib/types';
import {
  BarChart3, TrendingUp, AlertCircle, Compass, Flame, Map, CheckCircle2
} from 'lucide-react';

export default function AnalyticsGISPage() {
  const [segments, setSegments] = useState<CongestionSegment[]>([]);
  const [odFlows, setOdFlows] = useState<any[]>([]);
  const [selectedSegment, setSelectedSegment] = useState<CongestionSegment | null>(null);

  useEffect(() => {
    fetchCongestionSegments().then(setSegments).catch(console.error);
    fetchODFlows().then(setOdFlows).catch(console.error);
  }, []);

  return (
    <div className="flex-1 bg-[#FAF8F5] dark:bg-[#0B0F17] p-4 lg:p-6 space-y-6 transition-colors">
      {/* Title */}
      <div className="border-b border-[#E2DDD5] dark:border-[#1E2C44] pb-4">
        <div className="flex items-center gap-2 text-xs font-mono text-gray-500 uppercase">
          <span>CIVIC GIS INTELLIGENCE</span>
          <span>•</span>
          <span>SPATIAL DENSITY & O-D MATRIX</span>
        </div>
        <h1 className="font-serif font-bold text-2xl text-[#16191F] dark:text-white mt-1">
          Road Health, Traffic Congestion & O-D Audit
        </h1>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Corridor roughness telemetry (IRI), 15-minute speed binning against free-flow baselines, and origin-destination transit demand.
        </p>
      </div>

      {/* Top Congestion Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-white dark:bg-[#131B2A] border border-[#E2DDD5] dark:border-[#223048] shadow-sm">
          <div className="flex justify-between items-center text-xs font-mono text-gray-500">
            <span>CITYWIDE ROAD HEALTH INDEX</span>
            <span className="text-emerald-600 font-bold">78.4 / 100</span>
          </div>
          <div className="text-2xl font-serif font-bold text-gray-900 dark:text-white mt-1">Fair Surface</div>
          <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full mt-3 overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full w-[78%]" />
          </div>
          <span className="text-[10px] font-mono text-gray-400 mt-2 block">
            Aggregated over 1,842.6 km audited today
          </span>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-[#131B2A] border border-[#E2DDD5] dark:border-[#223048] shadow-sm">
          <div className="flex justify-between items-center text-xs font-mono text-gray-500">
            <span>RECURRING CHOKEPOINTS</span>
            <span className="text-red-600 font-bold">4 Arterials</span>
          </div>
          <div className="text-2xl font-serif font-bold text-gray-900 dark:text-white mt-1">Tin Factory Peak</div>
          <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full mt-3 overflow-hidden">
            <div className="h-full bg-red-500 rounded-full w-[85%]" />
          </div>
          <span className="text-[10px] font-mono text-red-600 dark:text-red-400 mt-2 block">
            Index &lt; 0.40 across ≥ 3 weekday windows
          </span>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-[#131B2A] border border-[#E2DDD5] dark:border-[#223048] shadow-sm">
          <div className="flex justify-between items-center text-xs font-mono text-gray-500">
            <span>TRANSIT ORIGIN-DESTINATION</span>
            <span className="text-blue-600 font-bold">4 Primary Corridors</span>
          </div>
          <div className="text-2xl font-serif font-bold text-gray-900 dark:text-white mt-1">128,200 Trips/day</div>
          <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full mt-3 overflow-hidden">
            <div className="h-full bg-blue-500 rounded-full w-[65%]" />
          </div>
          <span className="text-[10px] font-mono text-gray-400 mt-2 block">
            Derived directly from on-bus GPS & stop dwells
          </span>
        </div>
      </div>

      {/* Main Sections: Left Recurring Bottlenecks & Right O-D Desire Lines */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Congestion Segments & Bottlenecks */}
        <div className="lg:col-span-7 space-y-4">
          <div className="rounded-xl bg-white dark:bg-[#131B2A] border border-[#E2DDD5] dark:border-[#223048] p-4 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-2">
              <div>
                <h3 className="font-serif font-bold text-sm text-[#16191F] dark:text-white">
                  Corridor Congestion & Speed Ratio (15-min Bins)
                </h3>
                <p className="text-[11px] font-mono text-gray-500">
                  Congestion Index = Observed Speed ÷ Free-flow speed
                </p>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 font-bold">
                Live Snapped
              </span>
            </div>

            <div className="space-y-3">
              {segments.map((seg) => (
                <div
                  key={seg.segment_id}
                  onClick={() => setSelectedSegment(seg)}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    selectedSegment?.segment_id === seg.segment_id
                      ? 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-400'
                      : 'bg-gray-50 dark:bg-[#0E1524] border-gray-200 dark:border-gray-800 hover:border-gray-400'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-gray-900 dark:text-white">
                          {seg.name}
                        </span>
                        <span className="text-[10px] font-mono text-gray-500">
                          ({seg.corridor})
                        </span>
                      </div>
                      <div className="text-[11px] font-mono text-gray-600 dark:text-gray-300 mt-1 flex items-center gap-3">
                        <span>Speed: <b>{seg.observed_speed_kmh} km/h</b> (Free: {seg.free_flow_speed_kmh})</span>
                        <span>Density: <b>{seg.density_pcu_per_km} PCU/km</b></span>
                        <span className="text-red-600 dark:text-red-400 font-semibold">+{seg.delay_minutes}m delay</span>
                      </div>
                    </div>

                    <div className="text-right font-mono">
                      <div className={`text-sm font-bold ${
                        seg.congestion_index < 0.4
                          ? 'text-red-600 dark:text-red-400'
                          : 'text-emerald-600 dark:text-emerald-400'
                      }`}>
                        {(seg.congestion_index * 100).toFixed(0)}% Flow
                      </div>
                      <span className="text-[9.5px] text-gray-400 block uppercase">
                        Index: {seg.congestion_index.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Factors list */}
                  <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-800 text-[10.5px] font-mono text-gray-500">
                    <span className="font-semibold text-gray-700 dark:text-gray-300">Observed Factors: </span>
                    {seg.contributing_factors.join('; ')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: O-D Desire Lines & Flow Matrix */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-xl bg-white dark:bg-[#131B2A] border border-[#E2DDD5] dark:border-[#223048] p-4 shadow-sm space-y-3">
            <div className="border-b border-gray-200 dark:border-gray-800 pb-2">
              <h3 className="font-serif font-bold text-sm text-[#16191F] dark:text-white">
                Origin-Destination (O-D) Desire Flows
              </h3>
              <p className="text-[11px] font-mono text-gray-500">
                Major transit trip desires tracked via fleet GPS entry/exit zones
              </p>
            </div>

            <div className="space-y-3">
              {odFlows.map((flow, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-lg bg-gray-50 dark:bg-[#0E1524] border border-gray-200 dark:border-gray-800 text-xs font-mono space-y-1.5"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-gray-900 dark:text-white">
                      {flow.origin} ➔ {flow.destination}
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold">
                      {flow.corridor}
                    </span>
                  </div>

                  <div className="flex justify-between text-[11px] text-gray-600 dark:text-gray-400">
                    <span>Daily Volume: <b>{flow.daily_trips.toLocaleString()}</b></span>
                    <span>Transit Share: <b>{flow.transit_share}</b></span>
                    <span>Avg Time: <b>{flow.avg_traversal_mins} mins</b></span>
                  </div>

                  <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mt-1">
                    <div
                      className="h-full bg-blue-600 rounded-full"
                      style={{ width: `${Math.min(100, (flow.daily_trips / 50000) * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Road Digital Twin Inspector (If segment clicked) */}
          {selectedSegment && (
            <div className="rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-300 dark:border-amber-800 p-4 space-y-2 text-xs font-mono">
              <div className="flex justify-between items-center">
                <span className="font-bold text-amber-900 dark:text-amber-200">
                  ROAD DIGITAL TWIN: {selectedSegment.name}
                </span>
                <button
                  onClick={() => setSelectedSegment(null)}
                  className="text-gray-500 hover:text-black dark:hover:text-white"
                >
                  ✕
                </button>
              </div>
              <p className="text-gray-600 dark:text-gray-300">
                Sub-segment Length: 420m • Health Condition Score: <b>54 / 100</b> • 14-day trend: ↘ -8 pts.
              </p>
              <div className="flex gap-2 pt-1">
                <span className="px-2 py-1 bg-white dark:bg-[#131B2A] rounded border border-gray-300 dark:border-gray-700">
                  Defects on edge: 2 open
                </span>
                <span className="px-2 py-1 bg-white dark:bg-[#131B2A] rounded border border-gray-300 dark:border-gray-700">
                  Bus passes/day: 320
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
