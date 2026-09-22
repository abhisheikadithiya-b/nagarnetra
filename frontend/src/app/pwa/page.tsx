'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Camera, CheckCircle2, ShieldCheck, QrCode, Smartphone,
  HardDrive, RefreshCw, ArrowRight
} from 'lucide-react';

export default function PwaOnboardingPage() {
  const router = useRouter();
  const [scanning, setScanning] = useState(false);

  return (
    <div className="flex-1 bg-[#F9F8F5] dark:bg-[#0B0F17] flex items-center justify-center p-4 transition-colors">
      <div className="w-full max-w-md bg-white dark:bg-[#131B2A] border border-[#E2DDD5] dark:border-[#223048] rounded-2xl shadow-xl overflow-hidden p-5 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#0D1B2A] dark:bg-[#1E293B] text-white flex items-center justify-center">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-serif font-bold text-sm text-gray-900 dark:text-white">NAGARNETRA</span>
                <span className="px-1.5 py-0.2 rounded bg-gray-100 dark:bg-gray-800 text-[9px] font-mono font-bold text-gray-600 dark:text-gray-400">
                  NODE-PWA
                </span>
              </div>
              <span className="text-[10px] font-mono text-gray-400 block">
                BMTC Hub • Central Fleet Relay
              </span>
            </div>
          </div>

          <span className="px-2.5 py-1 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 font-mono text-[11px] font-bold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
            DEPOT-25 SYNC
          </span>
        </div>

        {/* Step Indicator */}
        <div className="space-y-1 font-mono text-xs">
          <div className="flex justify-between text-[11px] text-gray-600 dark:text-gray-400 font-bold">
            <span>STEP 1 OF 2</span>
            <span>Device & Sensor Pairing</span>
          </div>
          <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
            <div className="h-full bg-[#0D1B2A] dark:bg-sky-500 rounded-full w-1/2" />
          </div>
        </div>

        {/* HUD Optical Lock Box (Screenshot 5) */}
        <div className="relative rounded-xl overflow-hidden aspect-[16/9] bg-[#0A1424] border border-cyan-500/40 p-4 flex flex-col justify-between text-cyan-400 font-mono shadow-inner">
          <div className="flex justify-between items-center text-[10px] tracking-wider">
            <span className="flex items-center gap-1 font-bold">
              <QrCode className="w-3.5 h-3.5" /> HUD OPTICAL LOCK
            </span>
            <span>60 FPS • AI-VISION</span>
          </div>

          {/* Target Reticle */}
          <div className="flex flex-col items-center justify-center my-auto">
            <div className="w-20 h-20 border-2 border-dashed border-cyan-400/80 rounded-xl flex items-center justify-center relative">
              <CheckCircle2 className="w-8 h-8 text-teal-400" />
              <span className="absolute -top-1 -left-1 w-2.5 h-2.5 border-t-2 border-l-2 border-cyan-400" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 border-t-2 border-r-2 border-cyan-400" />
              <span className="absolute -bottom-1 -left-1 w-2.5 h-2.5 border-b-2 border-l-2 border-cyan-400" />
              <span className="absolute -bottom-1 -right-1 w-2.5 h-2.5 border-b-2 border-r-2 border-cyan-400" />
            </div>
          </div>

          <div className="flex justify-between items-center text-[10px]">
            <span>DASH-QR: BMTC-V9-BLR-1042</span>
            <span className="font-bold text-teal-400">SYNC 100%</span>
          </div>
        </div>

        {/* Paired Status Box */}
        <div className="p-3.5 rounded-xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 space-y-2 font-mono text-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-teal-600" />
              <span className="font-serif font-bold text-sm text-teal-950 dark:text-teal-200">
                Bus ID: BUS-1042 linked
              </span>
            </div>
            <span className="px-2 py-0.5 rounded bg-teal-200 dark:bg-teal-900 text-teal-900 dark:text-teal-200 text-[10px] font-bold">
              PAIRED
            </span>
          </div>
          <p className="text-[11px] text-teal-800 dark:text-teal-300">
            Corridor 500-D (Silk Board ⇄ Hebbal) • BMTC Depot 25 • Volvo B9R
          </p>
          <div className="flex justify-between text-[10px] text-teal-700 dark:text-teal-400 pt-1 border-t border-teal-200 dark:border-teal-800">
            <span>NODE-UUID: 9f2a-7c01</span>
            <span className="font-semibold">Edge Key Exchanged</span>
          </div>
        </div>

        {/* Sensor Telemetry Grants (3 of 3 Active) */}
        <div className="space-y-2 font-mono text-xs">
          <div className="flex justify-between items-center text-[11px] text-gray-500 font-bold uppercase">
            <span>Sensor Telemetry Grants</span>
            <span className="text-teal-600">3 of 3 Active</span>
          </div>

          <div className="space-y-2">
            <div className="p-2.5 rounded-lg bg-gray-50 dark:bg-[#0E1524] border border-gray-200 dark:border-gray-800 flex items-center justify-between">
              <div>
                <span className="font-bold text-gray-900 dark:text-white block">Camera Access (Windshield)</span>
                <span className="text-[10px] text-gray-500">Granted (1080p 60fps ready • Wide FOV)</span>
              </div>
              <CheckCircle2 className="w-4 h-4 text-teal-600" />
            </div>

            <div className="p-2.5 rounded-lg bg-gray-50 dark:bg-[#0E1524] border border-gray-200 dark:border-gray-800 flex items-center justify-between">
              <div>
                <span className="font-bold text-gray-900 dark:text-white block">High-Precision GPS & RTK</span>
                <span className="text-[10px] text-gray-500">Granted (±0.4m spatial lane accuracy)</span>
              </div>
              <CheckCircle2 className="w-4 h-4 text-teal-600" />
            </div>

            <div className="p-2.5 rounded-lg bg-gray-50 dark:bg-[#0E1524] border border-gray-200 dark:border-gray-800 flex items-center justify-between">
              <div>
                <span className="font-bold text-gray-900 dark:text-white block">Motion, Gyro & IMU Sensors</span>
                <span className="text-[10px] text-gray-500">Active (Z-axis pothole & rut detection)</span>
              </div>
              <CheckCircle2 className="w-4 h-4 text-teal-600" />
            </div>
          </div>
        </div>

        {/* Edge Storage & Thermal Guard */}
        <div className="p-3 rounded-lg bg-gray-50 dark:bg-[#0E1524] border border-gray-200 dark:border-gray-800 text-[11px] font-mono text-gray-600 dark:text-gray-300">
          <span className="font-bold uppercase text-gray-800 dark:text-gray-200 block text-[10px]">
            Edge Storage & Thermal Guard
          </span>
          Local Ring-Buffer (4GB allocated) • Continuous thermal throttling protection armed
        </div>

        {/* Action Button */}
        <Link
          href="/pwa/live"
          className="w-full py-3 px-4 rounded-xl bg-[#0D1B2A] dark:bg-[#1E293B] hover:bg-slate-800 text-white font-mono text-xs font-bold flex items-center justify-center gap-2 shadow-lg transition-all"
        >
          Mount Phone & Enter Live Mode
          <ArrowRight className="w-4 h-4" />
        </Link>

        <button
          onClick={() => setScanning(true)}
          className="w-full text-center text-xs font-mono text-gray-500 hover:text-gray-800 dark:hover:text-white flex items-center justify-center gap-1"
        >
          <RefreshCw className="w-3 h-3" /> Re-scan bus dashboard QR code
        </button>

        {/* Footer Badge */}
        <div className="p-2.5 rounded-lg bg-stone-100 dark:bg-[#0E1524] border border-[#E2DDD5] dark:border-[#223048] flex items-center justify-center gap-1.5 text-[10px] font-mono text-gray-500">
          <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
          End-to-End Signed by BMTC Telemetry Authority
        </div>
      </div>
    </div>
  );
}
