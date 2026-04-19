"use client";

import React, { useEffect, useState } from "react";
import { useWeb3 } from "@/context/Web3Context";
import { useRouter } from "next/navigation";
import { useContract } from "@/hooks/useContract";
import { useTxHandler } from "@/hooks/useTxHandler";
import { BrowserProvider } from "ethers";
import {
  UserPlus,
  HeartHandshake,
  Building2,
  CheckCircle2,
  XCircle,
  Loader2,
} from "lucide-react";
import Link from "next/link";

type SelectedRole = 1 | 2 | null; // 1 = Donor, 2 = Relief_Agency (matches contract enum)

const ROLES = [
  {
    value: 1 as const,
    label: "Donor",
    icon: HeartHandshake,
    description:
      "Post aid missions, set budgets, review agency bids, and lock funds into the escrow contract.",
    color: "emerald",
  },
  {
    value: 2 as const,
    label: "Relief Agency",
    icon: Building2,
    description:
      "Bid on active missions, deliver aid in the field, and receive payment upon confirmed delivery.",
    color: "sky",
  },
];

const STATUS_MESSAGES: Record<string, string> = {
  preparing: "Preparing transaction…",
  waitingForSignature: "Waiting for MetaMask signature…",
  pending: "Transaction submitted, waiting for confirmation…",
  confirmed: "Registration confirmed! Redirecting…",
};

export default function RegisterPage() {
  const { address, role, isLoading, connectWallet } = useWeb3();
  const router = useRouter();
  const contract = useContract();
  const { status, error, execute, reset } = useTxHandler();

  const [name, setName] = useState("");
  const [selectedRole, setSelectedRole] = useState<SelectedRole>(null);

  // Redirect if already registered with a valid role
  useEffect(() => {
    if (!isLoading && role && role !== "UNREGISTERED") {
      router.push("/connect");
    }
  }, [isLoading, role, router]);

  // After confirmed, re-fetch user data by re-triggering connectWallet
  useEffect(() => {
    if (status === "confirmed") {
      const timer = setTimeout(async () => {
        await connectWallet();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [status, connectWallet]);

  const handleRegister = async () => {
    if (!name.trim() || selectedRole === null || !contract) return;
    if (!(window as any).ethereum) return;

    await execute(async () => {
      const provider = new BrowserProvider((window as any).ethereum);
      const signer = await provider.getSigner();
      const signedContract = contract.connect(signer);
      return (signedContract as any).registerUser(name.trim(), selectedRole);
    });
  };

  const isSubmitting = ["preparing", "waitingForSignature", "pending", "confirmed"].includes(status);
  const canSubmit = name.trim().length > 0 && selectedRole !== null && !isSubmitting;

  // Not connected at all
  if (!isLoading && !address) {
    return (
      <div className="min-h-screen bg-[#050b14] flex flex-col items-center justify-center p-6">
        <div className="relative z-10 max-w-md w-full bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-2xl p-8 shadow-2xl text-center">
          <p className="text-slate-400 mb-4">No wallet connected.</p>
          <Link href="/connect" className="text-emerald-400 hover:underline text-sm">
            Go to Connect Wallet →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050b14] flex flex-col items-center justify-center p-6 relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-slate-900 via-[#050b14] to-[#050b14]" />

      <div className="relative z-10 max-w-lg w-full bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-2xl p-8 shadow-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.15)]">
            <UserPlus className="w-8 h-8 text-blue-400" />
          </div>
          <h1 className="text-3xl font-bold text-slate-100 mb-2">Register Identity</h1>
          <p className="text-slate-400 text-sm">
            Wallet{" "}
            <span className="font-mono text-xs bg-slate-800 px-2 py-1 rounded text-slate-300 border border-slate-700/50">
              {address ? `${address.slice(0, 6)}…${address.slice(-4)}` : "—"}
            </span>{" "}
            will be registered on-chain.
          </p>
        </div>

        {/* Name input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Display Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name or organisation"
            disabled={isSubmitting}
            className="w-full bg-slate-800/60 border border-white/10 focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/30 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-500 text-sm transition-all disabled:opacity-50"
          />
        </div>

        {/* Role selector */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-slate-300 mb-3">
            Select Your Role
          </label>
          <div className="grid grid-cols-2 gap-3">
            {ROLES.map(({ value, label, icon: Icon, description, color }) => {
              const isSelected = selectedRole === value;
              const colorMap: Record<string, string> = {
                emerald: "border-emerald-500/60 bg-emerald-500/10 shadow-[0_0_20px_rgba(16,185,129,0.15)]",
                sky: "border-sky-500/60 bg-sky-500/10 shadow-[0_0_20px_rgba(14,165,233,0.15)]",
              };
              const iconColorMap: Record<string, string> = {
                emerald: "text-emerald-400",
                sky: "text-sky-400",
              };

              return (
                <button
                  key={value}
                  onClick={() => { setSelectedRole(value); reset(); }}
                  disabled={isSubmitting}
                  className={`relative flex flex-col items-start gap-2 p-4 rounded-xl border text-left transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                    isSelected
                      ? colorMap[color]
                      : "border-white/10 bg-slate-800/30 hover:border-white/20 hover:bg-slate-800/50"
                  }`}
                >
                  <Icon className={`w-6 h-6 ${isSelected ? iconColorMap[color] : "text-slate-400"}`} />
                  <span className={`font-semibold text-sm ${isSelected ? "text-slate-100" : "text-slate-300"}`}>
                    {label}
                  </span>
                  <span className="text-xs text-slate-400 leading-snug">{description}</span>
                  {isSelected && (
                    <div className={`absolute top-2.5 right-2.5 w-2 h-2 rounded-full ${color === "emerald" ? "bg-emerald-400" : "bg-sky-400"}`} />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Transaction status */}
        {status !== "idle" && (
          <div
            className={`flex items-start gap-3 p-4 rounded-xl border mb-5 text-sm transition-all ${
              status === "error"
                ? "bg-red-500/10 border-red-500/30 text-red-300"
                : status === "confirmed"
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                : "bg-slate-800/60 border-slate-700/50 text-slate-300"
            }`}
          >
            {status === "error" ? (
              <XCircle className="w-5 h-5 shrink-0 mt-0.5" />
            ) : status === "confirmed" ? (
              <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
            ) : (
              <Loader2 className="w-5 h-5 shrink-0 mt-0.5 animate-spin" />
            )}
            <span>{status === "error" ? error : STATUS_MESSAGES[status]}</span>
          </div>
        )}

        {/* Submit button */}
        <button
          onClick={handleRegister}
          disabled={!canSubmit}
          className="w-full bg-linear-to-r from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500 disabled:from-slate-700 disabled:to-slate-700 disabled:text-slate-500 text-white font-medium py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer disabled:cursor-not-allowed shadow-[0_0_20px_rgba(99,102,241,0.3)] disabled:shadow-none"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              {status === "waitingForSignature" ? "Check MetaMask…" : "Processing…"}
            </>
          ) : (
            <>
              <UserPlus className="w-4 h-4" />
              Register on Chain
            </>
          )}
        </button>

        <Link
          href="/"
          className="w-full inline-block text-center text-slate-500 hover:text-slate-300 transition-colors text-sm mt-4"
        >
          Cancel and return home
        </Link>
      </div>
    </div>
  );
}
