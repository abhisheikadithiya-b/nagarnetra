'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme, DataMode } from '@/context/ThemeContext';
import { loginPilot } from '@/lib/api';
import { Sun, Moon, Volume2, VolumeX, Shield, Radio, Activity, UserCheck } from 'lucide-react';

export default function Header() {
  const pathname = usePathname();
  const {
    theme,
    toggleTheme,
    dataMode,
    setDataMode,
    activeRole,
    setActiveRole,
    audioActive,
    toggleAudio
  } = useTheme();

  // Ensure initial JWT token matches active role
  useEffect(() => {
    loginPilot(activeRole).catch(() => {});
  }, [activeRole]);

  const navItems = [
    { label: 'Live Command Center', path: '/' },
    { label: 'Safety Alerts & Evidence', path: '/safety-alerts' },
    { label: 'Work Orders & Road Defects', path: '/work-orders' },
    { label: 'Fleet Sensor Ops', path: '/fleet-ops' },
    { label: 'Analytics & GIS Audit', path: '/analytics' },
    { label: 'Edge Nodes', path: '/edge-nodes' },
    { label: 'AI Assistant', path: '/assistant' },
    { label: 'Mobile PWA', path: '/pwa' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#E2DDD5] dark:border-[#1E2C44] bg-[#FAF8F5]/95 dark:bg-[#0B0F17]/95 backdrop-blur-md transition-colors duration-200">
      <div className="flex h-14 items-center justify-between px-4">
        {/* Brand & Location */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-7 h-7 rounded bg-[#0D1B2A] dark:bg-[#1E293B] border border-black/10 dark:border-white/20 flex items-center justify-center text-white font-serif font-bold text-sm shadow-sm">
              N
            </div>
            <div className="leading-tight">
              <span className="font-serif font-bold text-base tracking-tight text-[#16191F] dark:text-[#F8FAFC]">
                NagarNetra
              </span>
              <span className="block text-[9px] tracking-wider uppercase font-mono text-[#6B7280] dark:text-[#94A3B8]">
                Urban Telemetry
              </span>
            </div>
          </Link>

          <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#EFECE6] dark:bg-[#131B2A] border border-[#E2DDD5] dark:border-[#223048] text-xs font-mono text-[#374151] dark:text-[#CBD5E1]">
            <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse"></span>
            Ward 4 & 7 • Bengaluru North Central
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="hidden xl:flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-[#0D1B2A] text-white dark:bg-[#1E293B] dark:text-[#38BDF8] shadow-sm'
                    : 'text-[#4B5563] dark:text-[#94A3B8] hover:text-[#111827] dark:hover:text-white hover:bg-[#EFECE6]/60 dark:hover:bg-[#131B2A]/60'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Controls & Badges */}
        <div className="flex items-center gap-2">
          {/* Data Mode Selector */}
          <div className="flex items-center rounded border border-[#E2DDD5] dark:border-[#223048] bg-white dark:bg-[#131B2A] text-[11px] font-mono shadow-sm px-1 py-0.5">
            <span className="text-[10px] text-gray-400 font-bold px-1 uppercase hidden md:inline">
              MODE:
            </span>
            <select
              value={dataMode}
              onChange={(e) => setDataMode(e.target.value as DataMode)}
              className="bg-transparent border-none text-xs font-mono font-bold focus:outline-none cursor-pointer text-gray-800 dark:text-gray-200"
              title="Filter telemetry stream by Data Origin Mode"
            >
              <option value="demo" className="dark:bg-[#0B0F17]">DEMO (PILOT)</option>
              <option value="live" className="dark:bg-[#0B0F17]">LIVE (EDGE)</option>
              <option value="sim" className="dark:bg-[#0B0F17]">SIM (CHAOS)</option>
              <option value="all" className="dark:bg-[#0B0F17]">ALL MODES</option>
            </select>
            <span className={`w-2 h-2 rounded-full mx-1 ${
              dataMode === 'live' ? 'bg-emerald-500 animate-ping' :
              dataMode === 'sim' ? 'bg-amber-500 animate-pulse' :
              dataMode === 'demo' ? 'bg-cyan-500' : 'bg-indigo-500'
            }`} />
          </div>

          {/* Pilot RBAC Role Switcher */}
          <div className="hidden md:flex items-center rounded border border-[#E2DDD5] dark:border-[#223048] bg-white dark:bg-[#131B2A] text-[11px] font-mono shadow-sm px-1.5 py-0.5">
            <UserCheck className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 mr-1" />
            <select
              value={activeRole}
              onChange={async (e) => {
                const r = e.target.value;
                setActiveRole(r);
                await loginPilot(r);
              }}
              className="bg-transparent border-none text-xs font-mono font-medium focus:outline-none cursor-pointer text-gray-800 dark:text-gray-200"
              title="Switch RBAC Security Clearance"
            >
              <option value="Incident Officer" className="dark:bg-[#0B0F17]">Incident Officer</option>
              <option value="Transport Planner" className="dark:bg-[#0B0F17]">Transport Planner</option>
              <option value="Road Authority" className="dark:bg-[#0B0F17]">Road Authority</option>
              <option value="Admin" className="dark:bg-[#0B0F17]">Admin (Superuser)</option>
              <option value="Viewer" className="dark:bg-[#0B0F17]">Viewer (Read-Only)</option>
            </select>
          </div>

          {/* Theme Toggle (Light Paper-and-Ink vs Dark Control Room) */}
          <button
            onClick={toggleTheme}
            className="p-1.5 rounded-md text-[#4B5563] dark:text-[#94A3B8] hover:bg-[#EFECE6] dark:hover:bg-[#131B2A] border border-[#E2DDD5] dark:border-[#223048] transition-colors"
            title={`Switch to ${theme === 'light' ? 'Dark Control Room' : 'Paper-and-Ink Light'} Mode`}
            aria-label="Toggle Theme"
          >
            {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4 text-amber-400" />}
          </button>

          {/* Audio Chime Alert Toggle */}
          <button
            onClick={toggleAudio}
            className={`p-1.5 rounded-md border transition-colors ${
              audioActive
                ? 'text-teal-700 dark:text-teal-400 border-teal-300 dark:border-teal-800 bg-teal-50 dark:bg-teal-950/40'
                : 'text-gray-400 border-gray-300 dark:border-gray-700'
            }`}
            title={audioActive ? 'Critical Audio Chime Active' : 'Audio Muted'}
          >
            {audioActive ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* DEFCON Indicator */}
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#F3EFEA] dark:bg-[#131B2A] border border-[#E2DDD5] dark:border-[#223048] text-xs font-mono font-medium text-[#374151] dark:text-[#CBD5E1]">
            <Shield className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>DEFCON 3</span>
          </div>

          {/* Profile Avatar with Role Tooltip */}
          <div
            className="w-7 h-7 rounded-full bg-gradient-to-tr from-slate-700 to-slate-900 border border-[#CBD5E1] dark:border-[#334155] flex items-center justify-center text-white text-xs font-semibold shadow-sm cursor-pointer"
            title={`${activeRole} Clearance • JWT Active`}
          >
            {activeRole.charAt(0)}
          </div>
        </div>
      </div>
    </header>
  );
}
