'use client';

import React, { useState } from 'react';
import { Incident } from '@/lib/types';
import { postIncidentAction } from '@/lib/api';
import { Radio, ShieldAlert, Video, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

interface IncidentInspectorProps {
  incident: Incident | null;
  onActionComplete?: () => void;
}

export default function IncidentInspector({ incident, onActionComplete }: IncidentInspectorProps) {
  const [dispatchStatus, setDispatchStatus] = useState<string | null>(null);

  if (!incident) {
    return (
      <div className="p-6 text-center text-gray-400 font-mono text-xs">
        Select an incident to view optical telemetry and priority breakdown.
      </div>
    );
  }

  const handleDispatch = async () => {
    try {
      setDispatchStatus('Dispatching QRU...');
      await postIncidentAction(incident.id, 'dispatch_qru');
      setDispatchStatus('QRU Squad Dispatched! En route (ETA 12m)');
      if (onActionComplete) onActionComplete();
    } catch {
      setDispatchStatus('Failed to dispatch squad');
    }
  };

  const handleAcknowledge = async () => {
    try {
      await postIncidentAction(incident.id, 'acknowledge');
      setDispatchStatus('Incident Acknowledged');
      if (onActionComplete) onActionComplete();
    } catch {
      setDispatchStatus('Failed to acknowledge');
    }
  };

  return (
    <div className="p-4 space-y-3 overflow-y-auto">
      {/* Header Info */}
      <div className="flex items-center justify-between text-[11px] font-mono">
        <span className="font-bold text-gray-900 dark:text-white">{incident.id}</span>
        <span className="px-2 py-0.5 rounded bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 font-bold">
          {incident.priority_level.replace('_', ' ')}
        </span>
        <span className="text-gray-500">09:42:15 IST • 3m ago</span>
      </div>

      <div>
        <h3 className="font-serif font-bold text-base text-[#16191F] dark:text-white leading-snug">
          {incident.title}
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
          {incident.subtitle}
        </p>
      </div>

      {/* Optical Snapshot Viewer with HUD Overlays */}
      <div className="relative rounded-lg overflow-hidden border border-[#E2DDD5] dark:border-[#223048] bg-black aspect-[16/9] shadow-inner">
        <img
          src={incident.image_url || '/images/pothole_rebar.jpg'}
          alt={incident.title}
          className="w-full h-full object-cover"
        />

        {!(incident.image_url?.includes('pothole_rebar') || incident.image_url?.includes('truck_incursion')) && (
          <>
            {/* Top HUD Chips */}
            <div className="absolute top-2 left-2 flex items-center gap-1.5 px-2 py-0.5 rounded bg-black/80 text-white font-mono text-[10px] border border-white/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              ● BMTC-4102 • FRONT OPTICAL
            </div>
            <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-black/80 text-emerald-400 font-mono text-[10px] border border-white/20">
              CONF: {incident.evidence_conf.toFixed(3)}
            </div>

            {/* Bounding box simulation if not already in photo */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div className="w-44 h-28 border-2 border-cyan-400 rounded-sm relative">
                <span className="absolute -top-4 left-0 bg-cyan-400 text-black text-[9px] font-mono font-bold px-1">
                  DEFECT CONF {(incident.evidence_conf).toFixed(2)}
                </span>
              </div>
            </div>

            {/* Bottom Bar on photo */}
            <div className="absolute bottom-0 inset-x-0 bg-black/85 px-3 py-1 flex items-center justify-between text-[10px] font-mono text-gray-300 border-t border-white/10">
              <span>LAT: {incident.lat.toFixed(4)}° N • LON: {incident.lon.toFixed(4)}° E</span>
              <span className="text-cyan-300 font-semibold">DEPTH: ~{incident.depth_cm || 18} cm</span>
            </div>
          </>
        )}
      </div>

      {/* Risk Formula Breakdown */}
      <div className="rounded-lg bg-gray-50/90 dark:bg-[#131B2A]/90 p-3 border border-[#E2DDD5] dark:border-[#223048] space-y-2 text-xs">
        <div className="flex items-center justify-between font-mono text-[11px] font-bold">
          <span className="text-gray-700 dark:text-gray-300">RISK FORMULA INDEX</span>
          <span className="text-red-600 dark:text-red-400">
            P = S × E × V × A : {incident.priority.toFixed(1)} / 100
          </span>
        </div>

        {/* Severity */}
        <div>
          <div className="flex justify-between text-[11px] font-mono text-gray-600 dark:text-gray-400 mb-0.5">
            <span>Severity (Rim / Tyre puncture)</span>
            <span className="font-bold text-red-600 dark:text-red-400">{incident.priority_s.toFixed(2)}</span>
          </div>
          <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div className="h-full bg-red-600 rounded-full" style={{ width: `${incident.priority_s * 100}%` }} />
          </div>
        </div>

        {/* Exposure */}
        <div>
          <div className="flex justify-between text-[11px] font-mono text-gray-600 dark:text-gray-400 mb-0.5">
            <span>Exposure (4,800 PCU / hr density)</span>
            <span className="font-bold">{incident.priority_e.toFixed(2)}</span>
          </div>
          <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div className="h-full bg-stone-800 dark:bg-slate-300 rounded-full" style={{ width: `${incident.priority_e * 100}%` }} />
          </div>
        </div>

        {/* Vulnerability */}
        <div>
          <div className="flex justify-between text-[11px] font-mono text-gray-600 dark:text-gray-400 mb-0.5">
            <span>Vulnerability (Heavy two-wheeler mix)</span>
            <span className="font-bold">{incident.priority_v.toFixed(2)}</span>
          </div>
          <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div className="h-full bg-stone-800 dark:bg-slate-300 rounded-full" style={{ width: `${incident.priority_v * 100}%` }} />
          </div>
        </div>

        {/* Age / Fusion Count */}
        <div>
          <div className="flex justify-between text-[11px] font-mono text-gray-600 dark:text-gray-400 mb-0.5">
            <span>Age / Fusion Count ({incident.sightings_count || 11} passes)</span>
            <span className="font-bold text-teal-600 dark:text-teal-400">{incident.priority_a.toFixed(2)}</span>
          </div>
          <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div className="h-full bg-teal-600 rounded-full" style={{ width: `${incident.priority_a * 100}%` }} />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-2 pt-1">
        <button
          onClick={handleDispatch}
          className="w-full py-2.5 px-4 rounded bg-[#B91C1C] hover:bg-red-800 text-white font-mono text-xs font-bold flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.99]"
        >
          <ShieldAlert className="w-4 h-4" />
          Dispatch QRU Hazard Squad
        </button>

        <div className="grid grid-cols-2 gap-2">
          <Link
            href="/safety-alerts"
            className="py-2 px-3 rounded bg-[#0D1B2A] dark:bg-[#1E293B] hover:bg-slate-800 text-white font-mono text-[11px] font-medium flex items-center justify-center gap-1.5 transition-colors"
          >
            <Video className="w-3.5 h-3.5" />
            Full 4K Video Clip
          </Link>
          <button
            onClick={handleAcknowledge}
            className="py-2 px-3 rounded border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 font-mono text-[11px] font-medium flex items-center justify-center gap-1.5 transition-colors"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-gray-500" />
            Acknowledge
          </button>
        </div>

        {dispatchStatus && (
          <p className="text-[11px] font-mono text-center text-emerald-600 dark:text-emerald-400 font-semibold animate-pulse pt-1">
            {dispatchStatus}
          </p>
        )}
      </div>
    </div>
  );
}
