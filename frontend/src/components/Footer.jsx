import React from 'react';

export default function Footer() {
  return (
    <footer className="w-full bg-[#0b0f19] border-t border-slate-800/80 py-8 px-4 text-center relative z-10">
      <div className="max-w-7xl mx-auto flex flex-col items-center gap-2">
        {/* First Line (Tagline) */}
        <p className="text-sm font-semibold text-slate-200 tracking-wide">
          Empowering Students Through Digital Innovation
        </p>

        {/* Second Line (Official Portal Information) */}
        <p className="text-xs text-slate-400 font-medium">
          Official Portal • Department of Computer Science • PARS Campus • University of Agriculture Faisalabad
        </p>

        {/* Third Line (Copyright) */}
        <p className="text-[11px] text-slate-500 mt-1">
          © {new Date().getFullYear()} Department of Computer Science, University of Agriculture Faisalabad (PARS Campus). All Rights Reserved.
        </p>
      </div>
    </footer>
  );
}