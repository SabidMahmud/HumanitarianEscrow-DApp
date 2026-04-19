"use client";

import React, { useState, useEffect, useCallback } from "react";
import { BrowserProvider, Contract, formatEther } from "ethers";
import AppShell from "@/components/layout/AppShell";
import { useWeb3 } from "@/context/Web3Context";
import { useRouter } from "next/navigation";
import { CONTRACT_ADDRESS, HUMANITARIAN_ESCROW_ABI } from "@/config/contract";
import { MissionStatus } from "@/types/mission";
import {
  Shield,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Loader2,
  Coins,
  ArrowDownToLine,
  RefreshCw,
} from "lucide-react";
import NoWallet from "@/components/ui/NoWallet";

interface DisputedMission {
  id: number;
  category: string;
  region: string;
  donor: string;
  selectedAgency: string;
  lockedFunds: bigint;
}

function truncate(addr: string) {
  return `${addr.slice(0, 8)}…${addr.slice(-6)}`;
}

export default function ArbiterDashboardPage() {
  const { address, role, isLoading: authLoading } = useWeb3();
  const router = useRouter();

  const [missions, setMissions] = useState<DisputedMission[]>([]);
  const [accumulatedFees, setAccumulatedFees] = useState<bigint>(BigInt(0));
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | "fees" | null>(null);
  const [txError, setTxError] = useState<string | null>(null);
  const [txSuccess, setTxSuccess] = useState<string | null>(null);

  // Role guard
  useEffect(() => {
    if (!authLoading && role && role !== "UN_ARBITER") {
      router.push("/connect");
    }
  }, [authLoading, role, router]);

  const fetchData = useCallback(async () => {
    if (!CONTRACT_ADDRESS || !(window as any).ethereum) return;
    setIsLoading(true);
    try {
      const provider = new BrowserProvider((window as any).ethereum);
      const contract = new Contract(CONTRACT_ADDRESS, HUMANITARIAN_ESCROW_ABI, provider);

      const [count, fees] = await Promise.all([
        contract.missionCount(),
        contract.accumulatedFees(),
      ]);

      setAccumulatedFees(fees as bigint);

      const total = Number(count);
      if (total === 0) {
        setMissions([]);
        setIsLoading(false);
        return;
      }

      const all = await Promise.all(
        Array.from({ length: total }, (_, i) =>
          contract.missions(i + 1).then((m: any) => ({
            id: Number(m.id),
            category: m.category as string,
            region: m.region as string,
            status: Number(m.status),
            donor: m.donor as string,
            selectedAgency: m.selectedAgency as string,
            lockedFunds: m.lockedFunds as bigint,
          }))
        )
      );

      setMissions(all.filter((m) => m.status === MissionStatus.Disputed));
    } catch (err: any) {
      console.error("Failed to fetch arbiter data:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && role === "UN_ARBITER") {
      fetchData();
    }
  }, [authLoading, role, fetchData]);

  const resolveDispute = async (missionId: number, agencyFault: boolean) => {
    if (!(window as any).ethereum || !CONTRACT_ADDRESS) return;
    setProcessingId(missionId);
    setTxError(null);
    setTxSuccess(null);
    try {
      const provider = new BrowserProvider((window as any).ethereum);
      const signer = await provider.getSigner();
      const contract = new Contract(CONTRACT_ADDRESS, HUMANITARIAN_ESCROW_ABI, signer);
      const tx = await contract.resolveDispute(missionId, agencyFault);
      await tx.wait();
      setTxSuccess(
        agencyFault
          ? `Mission #${missionId}: Funds refunded to donor.`
          : `Mission #${missionId}: Funds released to agency.`
      );
      await fetchData();
    } catch (err: any) {
      setTxError(err?.reason ?? err?.message ?? "Transaction failed.");
    } finally {
      setProcessingId(null);
    }
  };

  const withdrawFees = async () => {
    if (!(window as any).ethereum || !CONTRACT_ADDRESS) return;
    setProcessingId("fees");
    setTxError(null);
    setTxSuccess(null);
    try {
      const provider = new BrowserProvider((window as any).ethereum);
      const signer = await provider.getSigner();
      const contract = new Contract(CONTRACT_ADDRESS, HUMANITARIAN_ESCROW_ABI, signer);
      const tx = await contract.withdrawFees();
      await tx.wait();
      setTxSuccess("Accumulated fees withdrawn to your wallet.");
      await fetchData();
    } catch (err: any) {
      setTxError(err?.reason ?? err?.message ?? "Transaction failed.");
    } finally {
      setProcessingId(null);
    }
  };

  if (typeof window !== "undefined" && !(window as any).ethereum) {
    return <AppShell><NoWallet notInstalled /></AppShell>;
  }
  if (!authLoading && !address) {
    return <AppShell><NoWallet /></AppShell>;
  }

  if (authLoading || (isLoading && missions.length === 0)) {
    return (
      <AppShell>
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-violet-400 animate-spin" />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell currentPath="/arbiter/dashboard">
      <div className="mx-auto max-w-7xl px-6 py-32 lg:px-12">

        {/* Header */}
        <div className="mb-12 animate-fade-in-up flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <span className="mb-3 inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-violet-200">
              <span className="h-1.5 w-1.5 rounded-full bg-violet-400 shadow-[0_0_10px_rgba(167,139,250,0.8)]" />
              Arbiter Workspace
            </span>
            <h1 className="font-fraunces text-4xl font-semibold text-slate-50 md:text-5xl">
              UN Arbiter Panel
            </h1>
            <p className="mt-2 text-slate-400 font-mono text-sm">
              {address ? truncate(address) : "—"}
            </p>
          </div>
          <button
            onClick={fetchData}
            disabled={isLoading}
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 px-4 py-2.5 text-sm text-slate-300 transition-colors disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12 animate-fade-in-up">
          {/* Disputed count */}
          <div className="glass-panel rounded-2xl p-5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5 text-rose-400" />
            </div>
            <div>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest">Disputed Missions</p>
              <p className="text-2xl font-bold text-slate-100">{missions.length}</p>
            </div>
          </div>

          {/* Accumulated fees */}
          <div className="glass-panel rounded-2xl p-5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center shrink-0">
              <Coins className="w-5 h-5 text-violet-400" />
            </div>
            <div>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest">Accumulated Fees</p>
              <p className="text-2xl font-bold font-mono text-slate-100">
                {formatEther(accumulatedFees)} ETH
              </p>
            </div>
          </div>

          {/* Withdraw fees */}
          <div className="glass-panel rounded-2xl p-5 flex items-center justify-between">
            <div>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Treasury</p>
            </div>
            <button
              onClick={withdrawFees}
              disabled={accumulatedFees === BigInt(0) || processingId === "fees"}
              className="ml-4 shrink-0 inline-flex items-center gap-2 rounded-xl bg-violet-500/10 hover:bg-violet-500/20 border border-violet-500/30 px-4 py-2.5 text-sm font-semibold text-violet-300 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              {processingId === "fees" ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <ArrowDownToLine className="w-4 h-4" />
              )}
              Withdraw
            </button>
          </div>
        </div>

        {/* Tx feedback */}
        {txSuccess && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm mb-8 animate-fade-in-up">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            {txSuccess}
          </div>
        )}
        {txError && (
          <div className="flex items-start gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm mb-8 animate-fade-in-up">
            <XCircle className="w-5 h-5 shrink-0 mt-0.5" />
            {txError}
          </div>
        )}

        {/* Dispute cards */}
        <section className="animate-fade-in-up">
          <h2 className="mb-6 text-xl font-semibold text-slate-100 flex items-center gap-3">
            Action Required: Resolve Disputes
            {missions.length > 0 && (
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-rose-500/20 text-xs text-rose-300 border border-rose-500/30">
                {missions.length}
              </span>
            )}
          </h2>

          {missions.length === 0 ? (
            <div className="glass-panel rounded-3xl p-12 text-center border border-white/5">
              <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                <Shield className="w-7 h-7 text-emerald-400" />
              </div>
              <h3 className="text-xl font-semibold text-slate-200 mb-2">No active disputes</h3>
              <p className="text-slate-500 text-sm">Queue is clear.</p>
            </div>
          ) : (
            <div className="grid gap-6">
              {missions.map((mission) => {
                const isProcessing = processingId === mission.id;
                return (
                  <div
                    key={mission.id}
                    className="glass-panel rounded-3xl p-6 lg:p-8 border-l-4 border-rose-500"
                  >
                    <div className="flex flex-col lg:flex-row gap-8">
                      {/* Mission info */}
                      <div className="flex-1">
                        <div className="flex gap-3 mb-3">
                          <span className="font-mono text-sm text-slate-400 border border-white/10 bg-white/5 px-2 py-0.5 rounded">
                            #{mission.id}
                          </span>
                          <span className="text-sm font-medium text-rose-400 border border-rose-400/20 bg-rose-400/10 px-2.5 py-0.5 rounded-full animate-pulse">
                            Disputed
                          </span>
                        </div>
                        <h3 className="text-2xl font-semibold text-slate-100 mb-1">
                          {mission.category}
                        </h3>
                        <p className="text-sm text-slate-400 mb-6">{mission.region}</p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Donor</p>
                            <p className="text-sm text-slate-300 font-mono">{truncate(mission.donor)}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Agency</p>
                            <p className="text-sm text-slate-300 font-mono">
                              {mission.selectedAgency === "0x0000000000000000000000000000000000000000"
                                ? "—"
                                : truncate(mission.selectedAgency)}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex-1 lg:max-w-sm flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-white/10 pt-6 lg:pt-0 lg:pl-8">
                        <div className="mb-6">
                          <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Contested Escrow</p>
                          <p className="text-3xl font-mono text-rose-300 font-bold">
                            {formatEther(mission.lockedFunds)} ETH
                          </p>
                        </div>

                        <div className="flex gap-3">
                          {/* Refund Donor (agencyFault = true) */}
                          <button
                            onClick={() => resolveDispute(mission.id, true)}
                            disabled={isProcessing}
                            className="flex-1 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 px-4 py-3 text-xs font-semibold text-slate-300 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                          >
                            {isProcessing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                            Refund Donor
                          </button>
                          {/* Release to Agency (agencyFault = false) */}
                          <button
                            onClick={() => resolveDispute(mission.id, false)}
                            disabled={isProcessing}
                            className="flex-1 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 px-4 py-3 text-xs font-semibold text-rose-300 transition-colors flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(244,63,94,0.15)] disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                          >
                            {isProcessing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                            Release to Agency
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </AppShell>
  );
}
