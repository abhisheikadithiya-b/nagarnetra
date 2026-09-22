'use client';

import React, { useState, useEffect } from 'react';
import { fetchWorkOrders, updateWorkOrder, getWorkOrderPdfUrl } from '@/lib/api';
import { WorkOrder } from '@/lib/types';
import { useTheme } from '@/context/ThemeContext';
import {
  Clock, CheckCircle, AlertTriangle, ShieldCheck, Download, Plus,
  Search, SlidersHorizontal, ArrowRight, FileText, CheckCircle2
} from 'lucide-react';

export default function WorkOrdersPage() {
  const { dataMode } = useTheme();
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [selectedWard, setSelectedWard] = useState<string>('All');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);

  const loadWorkOrders = async () => {
    try {
      const data = await fetchWorkOrders({ data_mode: dataMode });
      setWorkOrders(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadWorkOrders();
  }, [dataMode]);

  const filteredOrders = workOrders.filter(wo => {
    const matchesSearch = wo.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          wo.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          wo.location_desc.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesWard = selectedWard === 'All' || wo.ward === selectedWard;
    const matchesSeverity = selectedSeverity === 'All' || wo.severity === selectedSeverity;
    return matchesSearch && matchesWard && matchesSeverity;
  });

  const columns = [
    { key: 'open_unassigned', title: 'Open / Unassigned', count: 18, color: 'text-red-600', dot: 'bg-red-600' },
    { key: 'assigned_in_progress', title: 'Assigned / In Progress', count: 24, color: 'text-blue-600', dot: 'bg-blue-600' },
    { key: 'fixed_pending_verif', title: 'Fixed (Pending Verif.)', count: 16, color: 'text-emerald-600', dot: 'bg-emerald-600' },
    { key: 'verified_closed', title: 'Verified & Closed', count: 16, color: 'text-teal-600', dot: 'bg-teal-600' }
  ];

  return (
    <div className="flex-1 bg-[#FAF8F5] dark:bg-[#0B0F17] p-4 lg:p-6 space-y-4 transition-colors">
      {/* Title & Deck Header (Screenshot 3) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E2DDD5] dark:border-[#1E2C44] pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-gray-500 uppercase tracking-wider">
            <span className="font-bold text-gray-800 dark:text-gray-200">MUNICIPAL OPS</span>
            <span>•</span>
            <span>GEO-TELEMETRY DISPATCH DECK</span>
          </div>
          <h1 className="font-serif font-bold text-2xl text-[#16191F] dark:text-white mt-1">
            Civic Infrastructure Work Orders
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Multi-bus verified road defect lifecycle, optical detection bounding, and engineering contractor SLA tracking.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button className="px-3 py-1.5 rounded bg-white dark:bg-[#131B2A] border border-[#E2DDD5] dark:border-[#223048] text-xs font-mono text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#1C2638] flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            Audit Trail
          </button>
          <button className="px-3 py-1.5 rounded bg-white dark:bg-[#131B2A] border border-[#E2DDD5] dark:border-[#223048] text-xs font-mono text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#1C2638] flex items-center gap-1.5">
            <Download className="w-3.5 h-3.5" />
            Export BBMP Ledger
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-3.5 py-1.5 rounded bg-[#0D1B2A] dark:bg-[#1E293B] hover:bg-slate-800 text-white text-xs font-mono font-semibold flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            + Create Manual Work Order
          </button>
        </div>
      </div>

      {/* 4 Metric Cards (Matching Screenshot 3) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: SLA Compliance */}
        <div className="p-4 rounded-xl bg-white dark:bg-[#131B2A] border border-[#E2DDD5] dark:border-[#223048] shadow-sm flex items-center gap-4">
          <div className="relative w-14 h-14 flex items-center justify-center">
            <div className="w-14 h-14 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin-slow flex items-center justify-center font-mono font-bold text-xs">
              84.2%
            </div>
          </div>
          <div>
            <span className="block text-[10px] font-mono text-gray-500 uppercase tracking-wider">SLA Metric Health</span>
            <span className="font-serif font-bold text-base text-gray-900 dark:text-white">Compliance High</span>
            <div className="flex items-center gap-2 text-[10px] font-mono text-gray-500 mt-0.5">
              <span>● 84.2% On-Time</span>
              <span className="text-red-600 dark:text-red-400">● 4.3% Crit.</span>
            </div>
          </div>
        </div>

        {/* Card 2: MTTR */}
        <div className="p-4 rounded-xl bg-white dark:bg-[#131B2A] border border-[#E2DDD5] dark:border-[#223048] shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <span className="block text-[10px] font-mono text-gray-500 uppercase tracking-wider">Mean Time To Repair (MTTR)</span>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="font-mono font-bold text-2xl text-gray-900 dark:text-white">18.4</span>
                <span className="text-xs text-gray-500 font-mono">hours</span>
              </div>
            </div>
            <span className="text-emerald-600 dark:text-emerald-400 font-mono text-xs font-bold">↘ -2.1h</span>
          </div>
          <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full mt-3 overflow-hidden">
            <div className="h-full bg-teal-600 rounded-full w-2/3" />
          </div>
        </div>

        {/* Card 3: Contractor Squads */}
        <div className="p-4 rounded-xl bg-white dark:bg-[#131B2A] border border-[#E2DDD5] dark:border-[#223048] shadow-sm">
          <span className="block text-[10px] font-mono text-gray-500 uppercase tracking-wider">Active Contractor Squads</span>
          <div className="flex items-baseline gap-2 mt-0.5">
            <span className="font-mono font-bold text-2xl text-gray-900 dark:text-white">26</span>
            <span className="text-xs text-gray-500 font-mono">teams deployed</span>
          </div>
          <p className="text-[10px] font-mono text-gray-500 dark:text-gray-400 mt-2">
            18 Rapid Paving • 5 Drainage • 3 Signage
          </p>
        </div>

        {/* Card 4: Open Defects */}
        <div className="p-4 rounded-xl bg-white dark:bg-[#131B2A] border border-[#E2DDD5] dark:border-[#223048] shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <span className="block text-[10px] font-mono text-gray-500 uppercase tracking-wider">Active Open Defects</span>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="font-mono font-bold text-2xl text-gray-900 dark:text-white">74</span>
                <span className="text-xs text-gray-500 font-mono">tracked by fleet</span>
              </div>
            </div>
            <span className="px-1.5 py-0.5 rounded bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 font-mono text-[10px] font-bold">
              4 Escalate
            </span>
          </div>
          <div className="flex justify-between text-[10px] font-mono text-gray-500 dark:text-gray-400 mt-2">
            <span>Target Close: &lt; 24h</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">91.8% Validated</span>
          </div>
        </div>
      </div>

      {/* Filter Bar (Search, Ward, Severity, SLA thresholds) */}
      <div className="p-2.5 rounded-lg bg-white dark:bg-[#131B2A] border border-[#E2DDD5] dark:border-[#223048] flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
        <div className="flex flex-wrap items-center gap-2 flex-1">
          {/* Search Input */}
          <div className="relative min-w-[280px]">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search ticket (#WO-...), corridor, street or lane..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-[#0E1524] text-xs text-gray-900 dark:text-white focus:outline-none"
            />
          </div>

          {/* Ward Dropdown */}
          <select
            value={selectedWard}
            onChange={(e) => setSelectedWard(e.target.value)}
            className="px-2.5 py-1.5 rounded border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-[#0E1524] text-xs text-gray-800 dark:text-gray-200"
          >
            <option value="All">All Wards (4, 7, 112, 142)</option>
            <option value="Ward 112">Ward 112</option>
            <option value="Ward 7">Ward 7</option>
            <option value="Ward 4">Ward 4</option>
            <option value="Ward 142">Ward 142</option>
          </select>

          {/* Severity Pills */}
          <div className="flex items-center gap-1">
            <span className="text-gray-500 font-semibold mr-1">SEVERITY:</span>
            {['All', 'P1_CRITICAL', 'P2_MAJOR', 'P3_MINOR'].map((sev) => (
              <button
                key={sev}
                onClick={() => setSelectedSeverity(sev)}
                className={`px-2 py-1 rounded text-[11px] font-semibold transition-colors ${
                  selectedSeverity === sev
                    ? 'bg-[#0D1B2A] text-white dark:bg-[#1E293B]'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200'
                }`}
              >
                {sev === 'All' ? 'All' : sev.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        <button className="flex items-center gap-1 px-2.5 py-1.5 rounded border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100">
          <SlidersHorizontal className="w-3.5 h-3.5" />
          SLA Thresholds
        </button>
      </div>

      {/* 4-Column Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {columns.map((col) => {
          const colTickets = filteredOrders.filter(wo => wo.state === col.key);
          return (
            <div
              key={col.key}
              className="rounded-xl bg-[#F3EFEA]/80 dark:bg-[#0E1524] p-3 border border-[#E2DDD5] dark:border-[#1E2C44] flex flex-col space-y-3"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-2 border-b border-gray-300/70 dark:border-gray-800">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${col.dot}`} />
                  <span className="font-serif font-bold text-xs text-gray-900 dark:text-white">
                    {col.title}
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-white dark:bg-[#1A2536] text-xs font-mono font-bold text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
                  {colTickets.length}
                </span>
              </div>

              {/* Cards list */}
              <div className="space-y-3 flex-1 overflow-y-auto max-h-[620px]">
                {colTickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    className="p-3 rounded-lg bg-white dark:bg-[#131B2A] border border-[#E2DDD5] dark:border-[#223048] shadow-sm space-y-2 hover:shadow-md transition-shadow"
                  >
                    {/* Card Top: ID & SLA Pill */}
                    <div className="flex items-center justify-between text-[11px] font-mono">
                      <span className="font-bold text-gray-900 dark:text-white">{ticket.id}</span>
                      <span className={`px-1.5 py-0.5 rounded font-semibold ${
                        ticket.breached
                          ? 'bg-red-600 text-white animate-pulse'
                          : ticket.remaining_time_str.includes('Passes')
                          ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                          : ticket.auto_verified
                          ? 'bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 font-bold'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                      }`}>
                        {ticket.remaining_time_str}
                      </span>
                    </div>

                    {/* Image preview with bounding box if available */}
                    {ticket.image_url && (
                      <div className="relative rounded overflow-hidden aspect-[16/9] bg-black border border-gray-200 dark:border-gray-800">
                        <img src={ticket.image_url} alt={ticket.title} className="w-full h-full object-cover" />
                        <span className="absolute bottom-1 left-1 bg-black/80 text-white font-mono text-[8px] px-1 rounded">
                          {ticket.acceleration_delta || 'BMTC-CAM-FRONT'}
                        </span>
                      </div>
                    )}

                    {/* Title & Description */}
                    <div>
                      <h4 className="font-serif font-bold text-xs text-gray-900 dark:text-white leading-tight">
                        {ticket.title}
                      </h4>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 line-clamp-2 mt-0.5">
                        {ticket.description}
                      </p>
                    </div>

                    {/* Location */}
                    <div className="text-[10.5px] font-mono text-gray-500 dark:text-gray-400">
                      📍 {ticket.location_desc}
                    </div>

                    {/* Verification / Corroboration progress bar for Fixed column */}
                    {col.key === 'fixed_pending_verif' && (
                      <div className="space-y-1 pt-1 font-mono text-[10px]">
                        <div className="flex justify-between text-gray-600 dark:text-gray-400">
                          <span>Fleet Telemetry Corroboration</span>
                          <span className="font-bold text-emerald-600">66%</span>
                        </div>
                        <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-600 rounded-full" style={{ width: '66%' }} />
                        </div>
                        <span className="text-gray-500 text-[9px] block">
                          Requires 2 more clean transit bus passes
                        </span>
                      </div>
                    )}

                    {/* Auto-Verified Badge for Closed column */}
                    {col.key === 'verified_closed' && (
                      <div className="p-1.5 rounded bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 text-[10px] font-mono text-teal-800 dark:text-teal-300 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
                        <span>Auto-Verified by Bus Fleet ({ticket.passes_completed}/{ticket.passes_total} passes)</span>
                      </div>
                    )}

                    {/* Assigned Squad or Action Footer */}
                    <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-800 text-[10.5px] font-mono">
                      <span className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-semibold">
                        {ticket.severity.replace('_', ' ')}
                      </span>
                      <a
                        href={getWorkOrderPdfUrl(ticket.id)}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                        title="Download Work Order PDF"
                      >
                        <FileText className="w-3 h-3" />
                        PDF
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Closed-Loop Engine Rule Banner */}
      <div className="rounded-lg p-3 bg-stone-100 dark:bg-[#131B2A] border border-[#E2DDD5] dark:border-[#223048] flex flex-col sm:flex-row items-center justify-between gap-2 text-xs font-mono text-gray-700 dark:text-gray-300">
        <div className="flex items-center gap-2 font-bold">
          <ShieldCheck className="w-4 h-4 text-teal-600" />
          <span>FLEET CORROBORATION ENGINE: Auto-Closes when &gt; 6 consecutive transit passes record z-axis shock &lt; 0.25G</span>
        </div>
        <div className="flex items-center gap-3 text-[11px]">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-teal-500" /> Verified SLA
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-blue-500" /> Pending Fleet
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-red-500" /> SLA Penalty Risk
          </span>
        </div>
      </div>
    </div>
  );
}
