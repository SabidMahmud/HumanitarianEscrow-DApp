"use client";

import React, { useEffect } from "react";
import { useWeb3 } from "@/context/Web3Context";
import { useRouter } from "next/navigation";
import { Wallet, Info } from "lucide-react";

export default function ConnectPage() {
  const { address, role, isLoading, connectWallet } = useWeb3();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && address) {
      if (role === "UN_ARBITER") router.push("/arbiter/dashboard");
      else if (role === "DONOR") router.push("/donors/dashboard");
      else if (role === "RELIEF_AGENCY") router.push("/agents/dashboard");
      else if (role === "UNREGISTERED") router.push("/register");
    }
  }, [isLoading, address, role, router]);

  return (
    <div className="min-h-screen bg-[#050b14] flex items-center justify-center p-6 relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-slate-900 via-[#050b14] to-[#050b14]" />
      <div className="relative z-10 max-w-md w-full bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-2xl p-8 shadow-2xl">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
            <Wallet className="w-8 h-8 text-emerald-400" />
          </div>
          <h1 className="text-3xl font-bold text-slate-100 mb-2 font-fraunces">Connect Wallet</h1>
          <p className="text-slate-400">Securely verify your identity on-chain.</p>
        </div>

        <button
          onClick={connectWallet}
          disabled={isLoading}
          className="w-full bg-linear-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-medium py-3 px-4 rounded-xl flex items-center justify-center gap-3 transition-all cursor-pointer shadow-[0_0_20px_rgba(16,185,129,0.3)] disabled:opacity-50 disabled:cursor-not-allowed border border-emerald-400/20"
        >
          {isLoading ? (
            <span className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          ) : (
            <img src="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg" alt="MetaMask" className="w-6 h-6" />
          )}
          {isLoading ? "Connecting..." : "Connect with MetaMask"}
        </button>
        
        <div className="mt-8 flex gap-3 p-4 bg-slate-800/40 rounded-xl border border-slate-700/50">
          <Info className="w-5 h-5 text-emerald-400 shrink-0" />
          <p className="text-xs text-slate-400 leading-relaxed">
            This DApp requires a Web3 wallet (like MetaMask) to connect to the Humanitarian Escrow contract. We do not use email or passwords.
          </p>
        </div>
      </div>
    </div>
  );
}
