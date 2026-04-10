import React from "react";

export default function Footer() {
  return (
    <footer className="relative z-10 border-t border-white/10 mt-20 bg-[#050b14]/80 backdrop-blur-lg">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-12 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 rounded bg-linear-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
            <span className="text-[#050b14] font-bold text-xs leading-none">H</span>
          </div>
          <span className="font-semibold text-sm text-slate-300">Humanitarian Escrow</span>
        </div>
        <p className="text-xs text-slate-500 text-center md:text-left">
          Designed for MetaMask detection, Ganache development, and Truffle deployments.
        </p>
        <div className="flex gap-4">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
          <span className="text-xs text-slate-500">System Online</span>
        </div>
      </div>
    </footer>
  );
}
