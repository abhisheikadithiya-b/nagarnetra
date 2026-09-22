'use client';

import React, { useState } from 'react';
import { postScenario } from '@/lib/api';
import { Play, Sparkles, AlertTriangle, CloudRain, ShieldCheck, Car, RefreshCw } from 'lucide-react';

export default function SimulationBar({ onEventTriggered }: { onEventTriggered?: () => void }) {
  const [loadingScenario, setLoadingScenario] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const handleTrigger = async (scenario: string, label: string) => {
    setLoadingScenario(scenario);
    setStatusMessage(`Injecting: ${label}...`);
    try {
      const res = await postScenario(scenario);
      setStatusMessage(res.message || `Scenario ${scenario} active`);
      if (onEventTriggered) onEventTriggered();
    } catch (e: any) {
      setStatusMessage('Scenario injection failed');
    } finally {
      setLoadingScenario(null);
      setTimeout(() => setStatusMessage(null), 4000);
    }
  };

  return (
    <div className="w-full bg-[#F3EFEA] dark:bg-[#131B2A] border-b border-[#E2DDD5] dark:border-[#1E2C44] px-4 py-1.5 flex flex-wrap items-center justify-between text-xs transition-colors">
      <div className="flex items-center gap-2">
        <span className="flex items-center gap-1 font-mono font-bold text-[#16191F] dark:text-[#F8FAFC]">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          EDGE TELEMETRY SCENARIOS:
        </span>
        {statusMessage && (
          <span className="font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-100/60 dark:bg-emerald-950/60 px-2 py-0.5 rounded text-[11px] animate-fade-in">
            {statusMessage}
          </span>
        )}
      </div>

      <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
        <button
          onClick={() => handleTrigger('normal', 'Normal Patrol')}
          disabled={loadingScenario !== null}
          className="px-2.5 py-1 rounded bg-white dark:bg-[#1A2536] hover:bg-gray-100 dark:hover:bg-[#223048] border border-[#DDD5C8] dark:border-[#263750] text-[#374151] dark:text-[#CBD5E1] font-mono text-[11px] flex items-center gap-1"
        >
          <Play className="w-3 h-3 text-emerald-500" />
          Normal Patrol
        </button>

        <button
          onClick={() => handleTrigger('rush_hour', 'Morning Rush Hour')}
          disabled={loadingScenario !== null}
          className="px-2.5 py-1 rounded bg-white dark:bg-[#1A2536] hover:bg-gray-100 dark:hover:bg-[#223048] border border-[#DDD5C8] dark:border-[#263750] text-[#374151] dark:text-[#CBD5E1] font-mono text-[11px] flex items-center gap-1"
        >
          <Car className="w-3 h-3 text-amber-500" />
          Rush Hour (+34m)
        </button>

        <button
          onClick={() => handleTrigger('new_pothole', 'New Critical Pothole')}
          disabled={loadingScenario !== null}
          className="px-2.5 py-1 rounded bg-white dark:bg-[#1A2536] hover:bg-gray-100 dark:hover:bg-[#223048] border border-[#DDD5C8] dark:border-[#263750] text-[#B91C1C] dark:text-red-400 font-mono text-[11px] font-semibold flex items-center gap-1"
        >
          <AlertTriangle className="w-3 h-3 text-red-500" />
          + New Pothole P1
        </button>

        <button
          onClick={() => handleTrigger('hit_and_run', 'Hit-and-Run / Incursion')}
          disabled={loadingScenario !== null}
          className="px-2.5 py-1 rounded bg-white dark:bg-[#1A2536] hover:bg-gray-100 dark:hover:bg-[#223048] border border-[#DDD5C8] dark:border-[#263750] text-[#374151] dark:text-[#CBD5E1] font-mono text-[11px] flex items-center gap-1"
        >
          <AlertTriangle className="w-3 h-3 text-orange-500" />
          Incursion (KA03)
        </button>

        <button
          onClick={() => handleTrigger('heavy_rain', 'Heavy Rain & Flood')}
          disabled={loadingScenario !== null}
          className="px-2.5 py-1 rounded bg-white dark:bg-[#1A2536] hover:bg-gray-100 dark:hover:bg-[#223048] border border-[#DDD5C8] dark:border-[#263750] text-[#374151] dark:text-[#CBD5E1] font-mono text-[11px] flex items-center gap-1"
        >
          <CloudRain className="w-3 h-3 text-blue-500" />
          Tin Factory Flood
        </button>

        <button
          onClick={() => handleTrigger('verify_pass', 'Clean Pass Auto-Verify')}
          disabled={loadingScenario !== null}
          className="px-2.5 py-1 rounded bg-teal-50 dark:bg-teal-950/50 hover:bg-teal-100 dark:hover:bg-teal-900/60 border border-teal-300 dark:border-teal-700 text-teal-800 dark:text-teal-300 font-mono text-[11px] font-semibold flex items-center gap-1"
        >
          <ShieldCheck className="w-3 h-3 text-teal-600" />
          Simulate Clean Pass
        </button>
      </div>
    </div>
  );
}
