'use client';

import React from 'react';
import { Incident } from '@/lib/types';
import { SlidersHorizontal } from 'lucide-react';

interface PriorityQueueProps {
  incidents: Incident[];
  selectedIncident: Incident | null;
  onSelectIncident: (inc: Incident) => void;
}

export default function PriorityQueue({ incidents, selectedIncident, onSelectIncident }: PriorityQueueProps) {
  const criticalCount = incidents.filter(i => i.priority_level === 'P1_CRITICAL').length;

  return (
    <div className="w-full border-b border-[#E2DDD5] dark:border-[#1E2C44] p-3">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <h2 className="font-serif font-bold text-sm text-[#16191F] dark:text-white">
            Priority Queue
          </h2>
          <span className="px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 font-mono text-[11px] font-semibold">
            {criticalCount} Critical
          </span>
        </div>
        <button className="flex items-center gap-1 text-[11px] font-mono text-gray-500 hover:text-gray-900 dark:hover:text-white">
          <SlidersHorizontal className="w-3 h-3" />
          Risk Score ☰
        </button>
      </div>

      <div className="space-y-1.5">
        {incidents.slice(0, 3).map((inc) => {
          const isSelected = selectedIncident?.id === inc.id;
          return (
            <div
              key={inc.id}
              onClick={() => onSelectIncident(inc)}
              className={`p-2 rounded cursor-pointer transition-all border ${
                isSelected
                  ? 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-400 dark:border-amber-600 shadow-sm'
                  : 'bg-white dark:bg-[#131B2A] border-[#E2DDD5] dark:border-[#223048] hover:border-gray-400'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-xs font-semibold text-gray-900 dark:text-white leading-tight">
                    {inc.title}
                  </h3>
                  <p className="text-[11px] font-mono text-gray-500 dark:text-gray-400 mt-0.5">
                    {inc.ward} • {inc.subtitle.split(',')[0]} • <span className="text-red-600 dark:text-red-400 font-semibold">{inc.sightings_count} sightings / 18 min</span>
                  </p>
                </div>
                <div className={`px-2 py-0.5 rounded font-mono text-xs font-bold ${
                  inc.priority >= 90
                    ? 'bg-red-600 text-white'
                    : inc.priority >= 80
                    ? 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300'
                }`}>
                  {inc.priority.toFixed(1)}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
