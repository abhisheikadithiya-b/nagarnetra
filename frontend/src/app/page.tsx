'use client';

import React, { useEffect, useState, useRef } from 'react';
import { fetchIncidents, fetchFleetStatus, connectRealtimeWebSocket } from '@/lib/api';
import { Incident, FleetStatus } from '@/lib/types';
import { useTheme } from '@/context/ThemeContext';
import CommandMap from '@/components/CommandMap';
import PriorityQueue from '@/components/PriorityQueue';
import IncidentInspector from '@/components/IncidentInspector';
import SimulationBar from '@/components/SimulationBar';
import { Radio, Activity, AlertCircle, Zap, Search } from 'lucide-react';

export default function CommandCenterPage() {
  const { dataMode } = useTheme();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [fleetStatus, setFleetStatus] = useState<FleetStatus | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [wsStatus, setWsStatus] = useState<string>('connecting');
  const selectedIncidentRef = useRef<Incident | null>(null);
  selectedIncidentRef.current = selectedIncident;

  const loadData = async () => {
    try {
      const [incData, statusData] = await Promise.all([
        fetchIncidents({ data_mode: dataMode }),
        fetchFleetStatus()
      ]);
      setIncidents(incData);
      if (incData.length > 0 && !selectedIncidentRef.current) {
        setSelectedIncident(incData[0]);
      }
      setFleetStatus(statusData);
    } catch (e) {
      console.error('Data load error', e);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000);

    // Setup resilient real-time WebSocket connection
    const disconnectWs = connectRealtimeWebSocket(
      (msg) => {
        if (msg.event === 'detection_ingested' || msg.event === 'incident_action' || msg.event === 'scenario_triggered') {
          loadData();
        }
      },
      (status) => setWsStatus(status)
    );

    return () => {
      clearInterval(interval);
      disconnectWs();
    };
  }, [dataMode]);

  const filteredIncidents = incidents.filter(i =>
    i.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    i.ward.toLowerCase().includes(searchQuery.toLowerCase()) ||
    i.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col">
      {/* Top KPI Header Bar (Matching Screenshot 1) */}
      <div className="w-full bg-[#FAF8F5] dark:bg-[#0B0F17] border-b border-[#E2DDD5] dark:border-[#1E2C44] px-4 py-2 flex flex-wrap items-center justify-between gap-3 transition-colors">
        <div className="flex flex-wrap items-center gap-2 sm:gap-4">
          {/* Card 1: Active Bus Mesh */}
          <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-white dark:bg-[#131B2A] border border-[#E2DDD5] dark:border-[#223048] shadow-sm">
            <div className="w-8 h-8 rounded-md bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Radio className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="font-mono font-bold text-sm text-gray-900 dark:text-white">
                  {fleetStatus?.active_mesh_str || '418 / 450'}
                </span>
                <span className="font-mono text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                  {fleetStatus?.active_mesh_pct || 92.8}%
                </span>
              </div>
              <span className="block text-[9.5px] font-mono uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Active Bus Mesh
              </span>
            </div>
          </div>

          {/* Card 2: Today's Defects */}
          <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-white dark:bg-[#131B2A] border border-[#E2DDD5] dark:border-[#223048] shadow-sm">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-base text-gray-900 dark:text-white">
                  {fleetStatus?.kpis.today_defects || 74}
                </span>
                <span className="text-[11px] font-mono text-gray-500 dark:text-gray-400">
                  Active in {fleetStatus?.kpis.today_wards || 14} Wards
                </span>
              </div>
              <span className="block text-[9.5px] font-mono uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Today's Defects
              </span>
            </div>
          </div>

          {/* Card 3: P-1 Critical */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white dark:bg-[#131B2A] border border-[#E2DDD5] dark:border-[#223048] shadow-sm">
            <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
            <div>
              <span className="font-mono font-bold text-sm text-red-600 dark:text-red-400">
                06 P-1 CRITICAL
              </span>
              <span className="block text-[9.5px] font-mono uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Requires Dispatch
              </span>
            </div>
          </div>

          {/* Card 4: Sight-to-Ticket Latency */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white dark:bg-[#131B2A] border border-[#E2DDD5] dark:border-[#223048] shadow-sm">
            <Zap className="w-4 h-4 text-emerald-500" />
            <div>
              <div className="flex items-baseline gap-1">
                <span className="font-mono font-bold text-sm text-gray-900 dark:text-white">
                  {fleetStatus?.kpis.optical_sync_latency_sec || 4.2}s
                </span>
                <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400">
                  Edge AI Sync
                </span>
              </div>
              <span className="block text-[9.5px] font-mono uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Sight-to-Ticket
              </span>
            </div>
          </div>
        </div>

        {/* Global Search Bar */}
        <div className="relative min-w-[260px]">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-gray-400" />
          <input
            type="text"
            placeholder="Route, BMTC unit, ward..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-8 py-1.5 rounded-md bg-white dark:bg-[#131B2A] border border-[#E2DDD5] dark:border-[#223048] text-xs font-mono text-gray-800 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-slate-500"
          />
          <kbd className="absolute right-2 top-2 text-[10px] font-mono text-gray-400 border border-gray-300 dark:border-gray-700 px-1 rounded">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Simulation Scenario Toolbar */}
      <SimulationBar onEventTriggered={loadData} />

      {/* Main Grid: Command Map + Right Side Panel */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
        {/* Map View */}
        <div className="lg:col-span-8 relative">
          <CommandMap
            incidents={filteredIncidents}
            selectedIncident={selectedIncident}
            onSelectIncident={setSelectedIncident}
          />
        </div>

        {/* Right Panel: Priority Queue + Selected Ticket Inspector */}
        <div className="lg:col-span-4 flex flex-col bg-white dark:bg-[#0E1524] border-l border-[#E2DDD5] dark:border-[#1E2C44] h-[640px] lg:h-[calc(100vh-170px)] overflow-y-auto">
          <PriorityQueue
            incidents={filteredIncidents}
            selectedIncident={selectedIncident}
            onSelectIncident={setSelectedIncident}
          />
          <IncidentInspector
            incident={selectedIncident}
            onActionComplete={loadData}
          />
        </div>
      </div>
    </div>
  );
}
