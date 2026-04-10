import React from "react";
import Link from "next/link";

const navItems = [
  { label: "Donors", href: "/donors" },
  { label: "Agents", href: "/agents" },
  { label: "Missions", href: "/missions" },
  { label: "About us", href: "/#roles" },
];

type NavbarProps = {
  currentPath?: string;
};

export default function Navbar({ currentPath }: NavbarProps) {
  return (
    <nav className="fixed top-0 w-full z-50 animate-fade-in-up bg-[#050b14]/50 backdrop-blur-xl border-b border-white/5">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 flex items-center justify-between h-20">
        <Link href="/" className="flex items-center gap-3 relative group">
          <div className="absolute inset-0 bg-emerald-400/20 blur-xl group-hover:bg-emerald-400/40 transition-all duration-500" />
          <div className="w-8 h-8 rounded-lg bg-linear-to-br from-emerald-400 to-teal-500 flex items-center justify-center relative z-10 shadow-[0_0_15px_rgba(16,185,129,0.5)]">
            <span className="text-[#050b14] font-bold text-xl leading-none">H</span>
          </div>
          <span className="font-semibold text-lg tracking-wide bg-clip-text text-transparent bg-linear-to-r from-slate-100 to-slate-400 relative z-10">
            Humanitarian<span className="font-light">Escrow</span>
          </span>
        </Link>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
          {navItems.map((item) => {
            const isActive = currentPath === item.href;

            return (
              <Link
                key={item.label}
                href={item.href}
                className={`transition-colors ${
                  isActive ? "text-emerald-300" : "hover:text-emerald-400"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
        <Link href="/connect" className="glass-button text-xs hidden sm:inline-flex border-emerald-500/20 text-emerald-300 hover:bg-emerald-500/10 hover:border-emerald-500/50">
          Connect Wallet
        </Link>
      </div>
    </nav>
  );
}
