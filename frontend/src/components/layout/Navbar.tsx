"use client";

import React, { useState } from "react";
import Link from "next/link";
import { LogOut, Wallet, ChevronDown, User } from "lucide-react";
import { useWeb3, Role } from "@/context/Web3Context";
import { useRouter } from "next/navigation";

const navItems = [
  { label: "Donors", href: "/donors" },
  { label: "Agents", href: "/agents" },
  { label: "Missions", href: "/missions" },
  { label: "About us", href: "/#roles" },
];

const ROLE_LABELS: Record<NonNullable<Role>, { label: string; color: string }> = {
  UN_ARBITER:   { label: "UN Arbiter",     color: "text-violet-300 bg-violet-500/10 border-violet-500/30" },
  DONOR:        { label: "Donor",          color: "text-emerald-300 bg-emerald-500/10 border-emerald-500/30" },
  RELIEF_AGENCY:{ label: "Relief Agency",  color: "text-sky-300 bg-sky-500/10 border-sky-500/30" },
  UNREGISTERED: { label: "Unregistered",   color: "text-slate-400 bg-slate-500/10 border-slate-500/30" },
};

function truncateAddress(addr: string) {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

type NavbarProps = {
  currentPath?: string;
};

export default function Navbar({ currentPath }: NavbarProps) {
  const { address, role, disconnectWallet } = useWeb3();
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const isConnected = !!address && !!role && role !== null;
  const roleInfo = role ? ROLE_LABELS[role] : null;

  const handleDisconnect = () => {
    setDropdownOpen(false);
    disconnectWallet();
    router.push("/");
  };

  const dashboardHref =
    role === "UN_ARBITER"    ? "/arbiter/dashboard"
    : role === "DONOR"       ? "/donors/dashboard"
    : role === "RELIEF_AGENCY" ? "/agents/dashboard"
    : "/register";

  return (
    <nav className="fixed top-0 w-full z-50 animate-fade-in-up bg-[#050b14]/50 backdrop-blur-xl border-b border-white/5">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 flex items-center justify-between h-20">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 relative group">
          <div className="absolute inset-0 bg-emerald-400/20 blur-xl group-hover:bg-emerald-400/40 transition-all duration-500" />
          <div className="w-8 h-8 rounded-lg bg-linear-to-br from-emerald-400 to-teal-500 flex items-center justify-center relative z-10 shadow-[0_0_15px_rgba(16,185,129,0.5)]">
            <span className="text-[#050b14] font-bold text-xl leading-none">H</span>
          </div>
          <span className="font-semibold text-lg tracking-wide bg-clip-text text-transparent bg-linear-to-r from-slate-100 to-slate-400 relative z-10">
            Humanitarian<span className="font-light">Escrow</span>
          </span>
        </Link>

        {/* Nav links */}
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
          {navItems.map((item) => {
            const isActive = currentPath === item.href;
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`transition-colors ${isActive ? "text-emerald-300" : "hover:text-emerald-400"}`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>

        {/* Right side: wallet state */}
        {isConnected && roleInfo ? (
          <div className="relative hidden sm:block">
            <button
              onClick={() => setDropdownOpen((v) => !v)}
              className="flex items-center gap-2.5 bg-slate-900/60 border border-white/10 hover:border-emerald-500/30 rounded-xl px-3 py-2 text-sm transition-all duration-200 cursor-pointer"
            >
              {/* Role badge */}
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${roleInfo.color}`}>
                {roleInfo.label}
              </span>
              {/* Address */}
              <span className="text-slate-300 font-mono text-xs">
                {truncateAddress(address!)}
              </span>
              <ChevronDown
                className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`}
              />
            </button>

            {/* Dropdown */}
            {dropdownOpen && (
              <>
                {/* Backdrop to close */}
                <div className="fixed inset-0" onClick={() => setDropdownOpen(false)} />
                <div className="absolute right-0 mt-2 w-52 bg-slate-900 border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50">
                  <div className="px-4 py-3 border-b border-white/5">
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Connected as</p>
                    <p className="text-xs text-slate-300 font-mono">{truncateAddress(address!)}</p>
                  </div>
                  <Link
                    href={dashboardHref}
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-sm text-slate-300 hover:bg-emerald-500/10 hover:text-emerald-300 transition-colors"
                  >
                    <User className="w-4 h-4" />
                    My Dashboard
                  </Link>
                  <button
                    onClick={handleDisconnect}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    Disconnect
                  </button>
                </div>
              </>
            )}
          </div>
        ) : (
          <Link
            href="/connect"
            className="glass-button text-xs hidden sm:inline-flex items-center gap-2 border-emerald-500/20 text-emerald-300 hover:bg-emerald-500/10 hover:border-emerald-500/50"
          >
            <Wallet className="w-3.5 h-3.5" />
            Connect Wallet
          </Link>
        )}
      </div>
    </nav>
  );
}
