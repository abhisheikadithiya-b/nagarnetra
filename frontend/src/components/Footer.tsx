import React from 'react';

export default function Footer() {
  return (
    <footer className="w-full border-t border-[#E2DDD5] dark:border-[#1E2C44] bg-[#FAF8F5] dark:bg-[#0B0F17] py-2 px-4 transition-colors">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] font-mono text-[#6B7280] dark:text-[#94A3B8]">
        <div className="flex items-center gap-2">
          <span className="font-serif font-bold text-[#16191F] dark:text-white">NagarNetra</span>
          <span>Bruhat Bengaluru Mahanagara Palike (BBMP) Cartographic Telemetry Grid</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse"></span>
          <span>Sensors Connected: 412 Transit Units</span>
        </div>
        <div>
          <span>© 2025 Municipal Mobility Authority. All rights reserved.</span>
        </div>
      </div>
    </footer>
  );
}
