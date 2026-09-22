'use client';

import React from 'react';
import {
  Layers, ShieldCheck, Cpu, Database, GitMerge
} from 'lucide-react';

export default function ArchitecturePage() {
  return (
    <div className="flex-1 bg-[#FAF8F5] dark:bg-[#0B0F17] p-4 lg:p-8 space-y-8 transition-colors">
      {/* Title */}
      <div className="border-b border-[#E2DDD5] dark:border-[#1E2C44] pb-5">
        <div className="flex items-center gap-2 text-xs font-mono text-gray-500 uppercase tracking-widest">
          <span>SYSTEM ARCHITECTURE</span>
          <span>•</span>
          <span>EDGE SENSOR FUSION SPECIFICATION</span>
        </div>
        <h1 className="font-serif font-bold text-3xl text-[#16191F] dark:text-white mt-2">
          NagarNetra Platform Architecture & Technical Design
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 max-w-3xl">
          NagarNetra transforms ordinary municipal transit buses into mobile edge perception sensors. Mounted smartphones running a Progressive Web App (PWA) process windshield optics, GPS, and 50Hz 3-axis accelerometer telemetry.
        </p>
      </div>

      {/* Architecture Flowchart Image */}
      <div className="bg-white dark:bg-[#131B2A] rounded-xl border border-[#E2DDD5] dark:border-[#1E2C44] p-6 shadow-sm">
        <h2 className="text-lg font-serif font-bold text-[#16191F] dark:text-white mb-4 flex items-center gap-2">
          <Layers className="w-5 h-5 text-teal-600 dark:text-teal-400" />
          End-to-End System Pipeline & Data Flow
        </h2>
        <div className="rounded-lg overflow-hidden border border-[#E2DDD5] dark:border-[#223048] bg-[#F7F5F0] dark:bg-[#0D1520] flex items-center justify-center p-4">
          <img
            src="/nagarnetra_architecture_flowchart.png"
            alt="NagarNetra End-to-End Architecture Flowchart"
            className="max-w-full h-auto object-contain rounded shadow"
          />
        </div>
      </div>

      {/* Key Architectural Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-[#131B2A] rounded-xl border border-[#E2DDD5] dark:border-[#1E2C44] p-5 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-lg bg-teal-50 dark:bg-teal-950/50 flex items-center justify-center text-teal-600 dark:text-teal-400">
            <Cpu className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-[#16191F] dark:text-white text-base">Edge PWA Processing</h3>
          <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
            Client-side WebGL and WebGPU inference directly on transit phones. On-device face and license plate anonymization ensures privacy before frames leave volatile memory.
          </p>
        </div>

        <div className="bg-white dark:bg-[#131B2A] rounded-xl border border-[#E2DDD5] dark:border-[#1E2C44] p-5 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-blue-600 dark:text-blue-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-[#16191F] dark:text-white text-base">Cryptographic Chain</h3>
          <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
            Every telemetry packet is signed via HMAC-SHA256 with rotating device keys. IndexedDB store-and-forward queue guarantees delivery during cellular blackouts.
          </p>
        </div>

        <div className="bg-white dark:bg-[#131B2A] rounded-xl border border-[#E2DDD5] dark:border-[#1E2C44] p-5 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-950/50 flex items-center justify-center text-amber-600 dark:text-amber-400">
            <GitMerge className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-[#16191F] dark:text-white text-base">Bayesian Fusion & Deduplication</h3>
          <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
            DBSCAN spatial clustering (eps=20m) merges multiple bus sightings into singular incident records with Bayesian probability updates and multi-factor risk scores.
          </p>
        </div>
      </div>

      {/* Data Tiers */}
      <div className="bg-white dark:bg-[#131B2A] rounded-xl border border-[#E2DDD5] dark:border-[#1E2C44] p-6 shadow-sm">
        <h2 className="text-lg font-serif font-bold text-[#16191F] dark:text-white mb-4 flex items-center gap-2">
          <Database className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          Data Isolation & Verification Tiers
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg border border-emerald-200 dark:border-emerald-900/40 bg-emerald-50/50 dark:bg-emerald-950/20">
            <span className="inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-600 text-white uppercase tracking-wider mb-2">LIVE</span>
            <h4 className="font-bold text-sm text-emerald-900 dark:text-emerald-300">Physical Bus Ingestion</h4>
            <p className="text-xs text-emerald-800/80 dark:text-emerald-400 mt-1">
              Genuine telemetry arriving from verified hardware registered in the device registry.
            </p>
          </div>

          <div className="p-4 rounded-lg border border-blue-200 dark:border-blue-900/40 bg-blue-50/50 dark:bg-blue-950/20">
            <span className="inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-600 text-white uppercase tracking-wider mb-2">DEMO</span>
            <h4 className="font-bold text-sm text-blue-900 dark:text-blue-300">Pilot Corridor Baseline</h4>
            <p className="text-xs text-blue-800/80 dark:text-blue-400 mt-1">
              High-fidelity seed dataset with authentic road photography and verified work orders.
            </p>
          </div>

          <div className="p-4 rounded-lg border border-amber-200 dark:border-amber-900/40 bg-amber-50/50 dark:bg-amber-950/20">
            <span className="inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-600 text-white uppercase tracking-wider mb-2">SIMULATION</span>
            <h4 className="font-bold text-sm text-amber-900 dark:text-amber-300">Scenario Injections</h4>
            <p className="text-xs text-amber-800/80 dark:text-amber-400 mt-1">
              Dynamic stress testing scenarios (waterlogging, sudden cave-ins, fleet shocks) for emergency training.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}