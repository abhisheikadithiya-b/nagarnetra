'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { fetchIncident, postIncidentAction, getPoliceReportPdfUrl } from '@/lib/api';
import { Incident } from '@/lib/types';
import {
  ShieldAlert, Download, Play, Pause, RotateCcw, Copy, ExternalLink,
  Radio, CheckCircle2, AlertTriangle, Video, MapPin, Eye, Compass
} from 'lucide-react';

export default function SafetyAlertsPage() {
  const [incident, setIncident] = useState<Incident | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [scrubberTime, setScrubberTime] = useState<number>(3.42);
  const [selectedDismissReason, setSelectedDismissReason] = useState('Legitimate Ambulance Escort');
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  useEffect(() => {
    fetchIncident('INC-2025-0914')
      .then(setIncident)
      .catch(() => {
        // Fallback demo incident
      });
  }, []);

  const handleAction = async (action: string) => {
    if (!incident) return;
    try {
      const res = await postIncidentAction(incident.id, action, selectedDismissReason);
      setActionNotice(res.message);
      setTimeout(() => setActionNotice(null), 5000);
    } catch {
      setActionNotice('Protocol execution failed');
    }
  };

  return (
    <div className="flex-1 bg-[#FAF8F5] dark:bg-[#0B0F17] p-4 lg:p-6 space-y-4 transition-colors">
      {/* Top Breadcrumb & Incident Header (Screenshot 2) */}
      <div className="space-y-1 border-b border-[#E2DDD5] dark:border-[#1E2C44] pb-4">
        <div className="flex items-center gap-2 text-xs font-mono text-gray-500 dark:text-gray-400">
          <Link href="/" className="hover:underline">Live Command Center</Link>
          <span>/</span>
          <span>Zone 4 North</span>
          <span>/</span>
          <span className="text-gray-900 dark:text-white font-semibold">INC-2025-0914 • Auto-Correlated (3 Feeds)</span>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pt-1">
          <h1 className="font-serif font-bold text-xl lg:text-2xl text-[#16191F] dark:text-white leading-tight">
            Dangerous Reckless Driving & Illegal Lane Incursion into Bus Rapid Corridor
          </h1>

          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 font-mono text-xs font-bold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
              CRITICAL ALERT (P1)
            </span>
            <span className="px-3 py-1 rounded bg-white dark:bg-[#131B2A] border border-[#E2DDD5] dark:border-[#223048] text-xs font-mono text-gray-700 dark:text-gray-300">
              ⏱ TIME DELTA Discovered 04m 16s ago
            </span>
            <span className="px-3 py-1 rounded bg-white dark:bg-[#131B2A] border border-[#E2DDD5] dark:border-[#223048] text-xs font-mono text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
              <Radio className="w-3.5 h-3.5" />
              8 Transit Buses Echoing
            </span>
          </div>
        </div>
      </div>

      {actionNotice && (
        <div className="p-3 rounded bg-emerald-100 dark:bg-emerald-950/70 border border-emerald-300 dark:border-emerald-700 text-emerald-900 dark:text-emerald-300 font-mono text-xs font-semibold">
          ✓ {actionNotice}
        </div>
      )}

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Forensic Player + Chain of Custody (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Forensic Video Replay Card */}
          <div className="rounded-xl overflow-hidden border border-[#E2DDD5] dark:border-[#223048] bg-black shadow-lg">
            {/* Realtime PII Masking Banner */}
            <div className="bg-[#0D1B2A] dark:bg-[#070D18] px-4 py-2 flex items-center justify-between text-[11px] font-mono text-gray-300 border-b border-white/10">
              <div className="flex items-center gap-1.5 text-cyan-400 font-semibold">
                <span>🛡</span>
                <span>AUTOMATED REALTIME PII MASKING APPLIED AT EDGE (DPDP ACT 2023 COMPLIANT)</span>
              </div>
              <span className="text-gray-400">SHA256: 8f9b2...4a1</span>
            </div>

            {/* Video Viewport with Edge AI Visual Overlays */}
            <div className="relative aspect-[16/10] bg-slate-900 overflow-hidden group">
              <img
                src="/images/truck_incursion.jpg"
                alt="Corridor Incursion Replay"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Video Controls & Timeline Bar */}
            <div className="p-3 bg-[#0B0F17] text-white font-mono text-xs space-y-2 border-t border-white/10">
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="0"
                  max="8.5"
                  step="0.01"
                  value={scrubberTime}
                  onChange={(e) => setScrubberTime(parseFloat(e.target.value))}
                  className="w-full accent-red-500 h-1.5 bg-gray-700 rounded-lg cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between text-gray-300 text-[11px]">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="p-1.5 rounded hover:bg-gray-800 border border-gray-700"
                  >
                    {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    onClick={() => setScrubberTime(Math.max(0, scrubberTime - 0.05))}
                    className="px-2 py-1 rounded hover:bg-gray-800 border border-gray-700 text-[10px]"
                  >
                    -1F
                  </button>
                  <button
                    onClick={() => setScrubberTime(Math.min(8.5, scrubberTime + 0.05))}
                    className="px-2 py-1 rounded hover:bg-gray-800 border border-gray-700 text-[10px]"
                  >
                    +1F
                  </button>
                  <button
                    onClick={() => setScrubberTime(0)}
                    className="px-2 py-1 rounded hover:bg-gray-800 border border-gray-700 text-[10px] flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" /> Loop
                  </button>
                </div>

                <div className="text-emerald-400 font-bold">
                  00:0{scrubberTime.toFixed(3)} / 00:08.500 IST (255 Frames)
                </div>

                <div className="flex items-center gap-1">
                  {[0.5, 1.0, 2.0].map((s) => (
                    <button
                      key={s}
                      onClick={() => setPlaybackSpeed(s)}
                      className={`px-1.5 py-0.5 rounded text-[10px] ${
                        playbackSpeed === s ? 'bg-red-600 text-white' : 'hover:bg-gray-800 text-gray-400'
                      }`}
                    >
                      {s}x
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Tamper-Proof Chain of Custody (WORM Ledger) */}
          <div className="rounded-xl p-4 bg-white dark:bg-[#131B2A] border border-[#E2DDD5] dark:border-[#223048] shadow-sm space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-200 dark:border-gray-800 pb-3">
              <div>
                <h2 className="font-serif font-bold text-sm text-[#16191F] dark:text-white flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  Tamper-Proof Chain of Custody
                </h2>
                <p className="text-[11px] font-mono text-gray-500 dark:text-gray-400">
                  BBMP Urban Mobility Ledger • WORM Cryptographic Storage
                </p>
              </div>

              {/* Export Signed Audit Button */}
              <a
                href={getPoliceReportPdfUrl('INC-2025-0914')}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 rounded bg-[#0D1B2A] dark:bg-[#1E293B] hover:bg-slate-800 text-white font-mono text-[11px] font-medium flex items-center gap-1.5 shadow-sm transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                Export Signed Audit (.JSON & PDF)
              </a>
            </div>

            {/* 4 Stages Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Step 1 */}
              <div className="p-3 rounded-lg bg-gray-50 dark:bg-[#0E1524] border border-[#E2DDD5] dark:border-[#1E2C44] space-y-1">
                <div className="flex justify-between items-center text-[11px] font-mono">
                  <span className="font-bold text-gray-900 dark:text-white">01. Edge Ingestion</span>
                  <span className="text-gray-500">09:38:11.204 IST</span>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-300">
                  Captured via Sony IMX728 on BMTC Bus #9412. Hardware TPM v2.0 signed.
                </p>
                <div className="pt-1 flex items-center justify-between text-[10px] font-mono text-gray-400">
                  <span>SHA: 8f9b2c3d88190fa7e4a1</span>
                  <Copy className="w-3 h-3 cursor-pointer hover:text-gray-200" />
                </div>
              </div>

              {/* Step 2 */}
              <div className="p-3 rounded-lg bg-gray-50 dark:bg-[#0E1524] border border-[#E2DDD5] dark:border-[#1E2C44] space-y-1">
                <div className="flex justify-between items-center text-[11px] font-mono">
                  <span className="font-bold text-gray-900 dark:text-white">02. Edge Neural Inference</span>
                  <span className="text-gray-500">09:38:11.450 IST</span>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-300">
                  YOLO-v11-Urban (Model v3.2.1) • Latency: 246ms • Zero Cloud Offload
                </p>
                <div className="pt-1 flex items-center justify-between text-[10px] font-mono text-gray-400">
                  <span>SHA: c71d41890abf42e1998b</span>
                  <Copy className="w-3 h-3 cursor-pointer hover:text-gray-200" />
                </div>
              </div>

              {/* Step 3 */}
              <div className="p-3 rounded-lg bg-gray-50 dark:bg-[#0E1524] border border-[#E2DDD5] dark:border-[#1E2C44] space-y-1">
                <div className="flex justify-between items-center text-[11px] font-mono">
                  <span className="font-bold text-gray-900 dark:text-white">03. Civic 5G MQTT Broadcast</span>
                  <span className="text-gray-500">09:38:12.012 IST</span>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-300">
                  Transmitted via encrypted slice APN-BBMP-URBAN. Network transit: 180ms.
                </p>
                <div className="pt-1 flex items-center justify-between text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                  <span>PKI Cert: TLS1.3_ECDSA_P384</span>
                  <span>VERIFIED</span>
                </div>
              </div>

              {/* Step 4 */}
              <div className="p-3 rounded-lg bg-gray-50 dark:bg-[#0E1524] border border-[#E2DDD5] dark:border-[#1E2C44] space-y-1">
                <div className="flex justify-between items-center text-[11px] font-mono">
                  <span className="font-bold text-gray-900 dark:text-white">04. Merkle Root Fusion</span>
                  <span className="text-gray-500">09:38:12.380 IST</span>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-300">
                  Cross-validated by 2 adjacent BMTC units. Root Hash committed to node.
                </p>
                <div className="pt-1 flex items-center justify-between text-[10px] font-mono text-cyan-600 dark:text-cyan-400 font-semibold">
                  <span>MERKLE: e5a019ff...7799ef</span>
                  <span>🔒 PBFT-Quorum</span>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between text-[10px] font-mono text-gray-500 dark:text-gray-400">
              <span>Municipal Node ID: KA-BLR-CMD-04</span>
              <span>Ledger Block: #4,910,248 • Consensus: PBFT-Quorum (14 Validators)</span>
            </div>
          </div>
        </div>

        {/* Right Column: Plate OCR + Context + Enforcement Protocols (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Card 1: High-Speed Plate OCR (Exact Match with Yellow Plate in Screenshot 2) */}
          <div className="rounded-xl p-4 bg-white dark:bg-[#131B2A] border border-[#E2DDD5] dark:border-[#223048] shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-mono font-bold text-xs uppercase tracking-wider text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-blue-500" />
                High-Speed Plate OCR
              </span>
              <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-mono text-xs font-bold">
                94.8% MATCH
              </span>
            </div>

            {/* Yellow Indian License Plate Badge */}
            <div className="relative rounded-lg bg-[#FBBF24] p-3 border-2 border-gray-900 flex items-center justify-between text-gray-950 shadow-md">
              <div className="flex items-center gap-3">
                <div className="bg-[#1D4ED8] text-white font-mono text-[9px] font-bold px-1.5 py-3 rounded flex flex-col items-center leading-none">
                  <span>I</span>
                  <span>N</span>
                  <span>D</span>
                </div>
                <div>
                  <div className="font-mono font-black text-2xl tracking-widest text-black">
                    KA 03 MG 8842
                  </div>
                  <div className="text-[9px] font-mono uppercase tracking-wider font-semibold text-gray-800">
                    Karnataka RTO • Bengaluru East (Indiranagar)
                  </div>
                </div>
              </div>
              <Copy className="w-4 h-4 text-gray-800 cursor-pointer hover:text-black" />
            </div>

            {/* Edge Sensor Crop with Confidence Breakdown */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-1">
              <div className="sm:col-span-6 rounded overflow-hidden border border-gray-300 dark:border-gray-700 relative aspect-[16/9] bg-black">
                <img src="/images/plate_crop.jpg" alt="Plate Crop" className="w-full h-full object-cover" />
                <span className="absolute bottom-1 left-1 bg-black/80 text-white font-mono text-[8px] px-1 rounded">
                  🔍 EDGE SENSOR CROP (3.8x)
                </span>
              </div>

              <div className="sm:col-span-6 space-y-1.5 text-xs font-mono">
                <div className="text-[10px] text-gray-500 dark:text-gray-400 uppercase font-semibold">
                  Prediction Confidence
                </div>
                <div>
                  <div className="flex justify-between font-bold text-gray-900 dark:text-white">
                    <span>KA 03 MG 8842</span>
                    <span className="text-teal-600 dark:text-teal-400">94.8%</span>
                  </div>
                  <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full mt-0.5">
                    <div className="h-full bg-teal-600 rounded-full" style={{ width: '94.8%' }} />
                  </div>
                </div>

                <div className="text-[10px] text-gray-500 space-y-0.5 pt-1">
                  <div className="flex justify-between">
                    <span>KA 03 MC 8842</span>
                    <span>4.2% (Occlusion)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>KA 08 MG 8842</span>
                    <span>1.0% (Glare)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Spatial & Incident Context */}
          <div className="rounded-xl p-4 bg-white dark:bg-[#131B2A] border border-[#E2DDD5] dark:border-[#223048] shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-mono font-bold text-xs uppercase text-gray-700 dark:text-gray-300">
                Spatial & Incident Context
              </span>
              <span className="px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-mono text-[10px] font-semibold">
                Awaiting Verification
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="block text-[10px] font-mono text-gray-500 uppercase">Vehicle Classification</span>
                <span className="font-semibold text-gray-900 dark:text-white">Tata Ace / Bolero Pickup</span>
                <span className="block text-[10px] text-gray-400">Class: Commercial Goods LCV</span>
              </div>
              <div>
                <span className="block text-[10px] font-mono text-gray-500 uppercase">Vector Trajectory</span>
                <span className="font-semibold text-gray-900 dark:text-white">Northward to Domlur</span>
                <span className="block text-[10px] font-mono text-gray-400">Track ID: #TRK-88492-B</span>
              </div>
              <div>
                <span className="block text-[10px] font-mono text-gray-500 uppercase">Location Pin</span>
                <span className="font-semibold text-gray-900 dark:text-white">Old Airport Road</span>
                <span className="block text-[10px] text-gray-400">Opposite Command Hospital, Ward 112</span>
              </div>
              <div>
                <span className="block text-[10px] font-mono text-gray-500 uppercase">Environment Telemetry</span>
                <span className="font-semibold text-gray-900 dark:text-white">Dry Asphalt • 32°C</span>
                <span className="block text-[10px] text-gray-400">12,400 Lux • High Visibility</span>
              </div>
            </div>

            {/* Geofence Priority Zone Banner */}
            <div className="p-2 rounded bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 flex items-center gap-2 text-red-800 dark:text-red-300 text-xs font-mono font-bold">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              <span>GEO-FENCE: BUS RAPID PRIORITY ZONE</span>
            </div>
          </div>

          {/* Card 3: Transit Fleet Triangulation */}
          <div className="rounded-xl p-4 bg-white dark:bg-[#131B2A] border border-[#E2DDD5] dark:border-[#223048] shadow-sm space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-mono font-bold text-xs uppercase text-gray-700 dark:text-gray-300">
                Transit Fleet Triangulation
              </span>
              <span className="text-teal-600 dark:text-teal-400 font-mono text-xs font-semibold">
                3 Feeds Synchronized
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-2 rounded bg-gray-50 dark:bg-[#0E1524] flex items-center justify-between border border-gray-200 dark:border-gray-800">
                <div>
                  <span className="font-mono font-bold text-gray-900 dark:text-white">Bus BMTC-4012</span>
                  <span className="block text-[11px] text-gray-500">Rear-Right Wide Angle • Initial Lane Swerve</span>
                </div>
                <span className="font-mono text-[10px] text-gray-400">09:37:50 IST</span>
              </div>

              <div className="p-2 rounded bg-blue-50 dark:bg-blue-950/40 flex items-center justify-between border border-blue-200 dark:border-blue-900">
                <div>
                  <span className="font-mono font-bold text-blue-900 dark:text-blue-300">Bus BMTC-8819 (Current Feed)</span>
                  <span className="block text-[11px] text-blue-700 dark:text-blue-400">Front Dash Cam • Sighted Corridor Incursion & Near-Miss</span>
                </div>
                <span className="font-mono text-[10px] text-blue-700 dark:text-blue-400">09:38:11 IST</span>
              </div>

              <div className="p-2 rounded bg-gray-50 dark:bg-[#0E1524] flex items-center justify-between border border-gray-200 dark:border-gray-800">
                <div>
                  <span className="font-mono font-bold text-gray-900 dark:text-white">Bus BMTC-2104</span>
                  <span className="block text-[11px] text-gray-500">Captain Console Hazard Tap • Severe Lane Breach</span>
                </div>
                <span className="font-mono text-[10px] text-gray-400">09:38:18 IST</span>
              </div>
            </div>
          </div>

          {/* Card 4: Officer Enforcement Protocols */}
          <div className="rounded-xl p-4 bg-white dark:bg-[#131B2A] border border-[#E2DDD5] dark:border-[#223048] shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-mono font-bold text-xs uppercase text-gray-700 dark:text-gray-300">
                Officer Enforcement Protocols
              </span>
              <span className="font-mono text-[10px] text-gray-400">OPERATOR ID: #DESHMUKH-88</span>
            </div>

            <div className="space-y-2">
              <button
                onClick={() => handleAction('verify_interceptor')}
                className="w-full py-2.5 px-4 rounded bg-[#7F1D1D] hover:bg-red-900 text-white font-mono text-xs font-bold flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.99]"
              >
                <ShieldAlert className="w-4 h-4" />
                Verify & Dispatch Traffic Interceptor Unit
              </button>

              <button
                onClick={() => handleAction('escalate_bbmp')}
                className="w-full py-2 px-4 rounded bg-gray-100 dark:bg-[#1A2536] hover:bg-gray-200 dark:hover:bg-[#233146] text-gray-800 dark:text-gray-200 font-mono text-xs font-medium flex items-center justify-center gap-1.5 transition-colors border border-gray-300 dark:border-gray-700"
              >
                Escalate Defect to BBMP Road Infrastructure Cell
              </button>

              <div className="flex items-center gap-2 pt-1">
                <select
                  value={selectedDismissReason}
                  onChange={(e) => setSelectedDismissReason(e.target.value)}
                  className="flex-1 px-2 py-1.5 rounded bg-gray-50 dark:bg-[#0E1524] border border-gray-300 dark:border-gray-700 text-xs font-mono text-gray-800 dark:text-gray-200"
                >
                  <option>Reason: Legitimate Ambulance Escort</option>
                  <option>Reason: Authorized Municipal Utility Vehicle</option>
                  <option>Reason: Edge Occlusion False Positive</option>
                </select>
                <button
                  onClick={() => handleAction('dismiss')}
                  className="px-3 py-1.5 rounded border border-gray-300 dark:border-gray-700 text-xs font-mono hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300"
                >
                  Dismiss Notice
                </button>
              </div>

              <div className="p-2.5 rounded bg-stone-100 dark:bg-[#0E1524] border border-[#E2DDD5] dark:border-[#223048] text-[10.5px] font-mono text-gray-600 dark:text-gray-400">
                ⚖ Motor Vehicles (Amendment) Act Sec 192A: Corridor Incursion Penalty ₹10,000 + Impound
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
