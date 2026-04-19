"use client";

import { useState, useEffect, useCallback } from "react";
import { BrowserProvider, JsonRpcProvider, Contract, formatEther } from "ethers";
import AppShell from "@/components/layout/AppShell";
import { CONTRACT_ADDRESS, HUMANITARIAN_ESCROW_ABI } from "@/config/contract";
import { MissionStatus } from "@/types/mission";
import { RefreshCw, Loader2, HeartHandshake } from "lucide-react";

interface DonorProfile {
  address: string;
  name: string;
  activeMissions: number;
  completedMissions: number;
  totalDeployed: bigint; // sum of lockedFunds across all their missions
}

async function getReadProvider() {
  if (typeof window !== "undefined" && (window as any).ethereum) {
    return new BrowserProvider((window as any).ethereum);
  }
  return new JsonRpcProvider("http://localhost:8545");
}

export default function DonorsRegistryPage() {
  const [donors, setDonors] = useState<DonorProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDonors = useCallback(async () => {
    if (!CONTRACT_ADDRESS) {
      setError("Contract address not configured.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const provider = await getReadProvider();
      const contract = new Contract(CONTRACT_ADDRESS, HUMANITARIAN_ESCROW_ABI, provider);

      const count = Number(await contract.missionCount());
      if (count === 0) {
        setDonors([]);
        setIsLoading(false);
        return;
      }

      const missionData = await Promise.all(
        Array.from({ length: count }, (_, i) =>
          contract.missions(i + 1).then((m: any) => ({
            status: Number(m.status) as MissionStatus,
            donor: (m.donor as string).toLowerCase(),
            lockedFunds: m.lockedFunds as bigint,
          }))
        )
      );

      // Aggregate per donor address
      const donorMap = new Map<
        string,
        { active: number; completed: number; totalDeployed: bigint }
      >();

      const ACTIVE_STATUSES = [
        MissionStatus.Pending,
        MissionStatus.InTransit,
        MissionStatus.AwaitingApproval,
        MissionStatus.Disputed,
      ];
      const COMPLETED_STATUSES = [MissionStatus.Delivered, MissionStatus.Resolved];

      for (const m of missionData) {
        const prev = donorMap.get(m.donor) ?? { active: 0, completed: 0, totalDeployed: BigInt(0) };
        donorMap.set(m.donor, {
          active: prev.active + (ACTIVE_STATUSES.includes(m.status) ? 1 : 0),
          completed: prev.completed + (COMPLETED_STATUSES.includes(m.status) ? 1 : 0),
          totalDeployed: prev.totalDeployed + m.lockedFunds,
        });
      }

      if (donorMap.size === 0) {
        setDonors([]);
        setIsLoading(false);
        return;
      }

      // Fetch user profiles
      const profiles = await Promise.all(
        Array.from(donorMap.entries()).map(async ([addr, stats]) => {
          const userData = await contract.users(addr);
          return {
            address: addr,
            name: userData.name as string,
            activeMissions: stats.active,
            completedMissions: stats.completed,
            totalDeployed: stats.totalDeployed,
          } satisfies DonorProfile;
        })
      );

      // Sort by most missions (active + completed)
      setDonors(
        profiles.sort((a, b) => (b.activeMissions + b.completedMissions) - (a.activeMissions + a.completedMissions))
      );
    } catch (err: any) {
      setError("Could not load donor data from the contract.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDonors();
  }, [fetchDonors]);

  return (
    <AppShell currentPath="/donors">
      <div className="mx-auto max-w-7xl px-6 py-32 lg:px-12">

        {/* Header */}
        <div className="mb-12 animate-fade-in-up flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <span className="mb-3 inline-flex items-center gap-2 rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-amber-200">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-300 shadow-[0_0_10px_rgba(252,211,77,0.8)]" />
              Public Registry
            </span>
            <h1 className="font-fraunces text-4xl font-semibold text-slate-50 md:text-5xl">
              Active Donors
            </h1>
            <p className="mt-2 text-slate-500 text-sm">
              Wallet addresses that have posted at least one mission.
            </p>
          </div>
          <button
            onClick={fetchDonors}
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-sm text-slate-300 transition-colors disabled:opacity-50 cursor-pointer self-start md:self-auto"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm mb-8">
            {error}
          </div>
        )}

        {/* Content */}
        {isLoading ? (
          <div className="glass-panel rounded-3xl p-20 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
          </div>
        ) : donors.length === 0 ? (
          <div className="glass-panel rounded-3xl p-20 text-center animate-fade-in-up">
            <HeartHandshake className="w-10 h-10 text-slate-500 mx-auto mb-3" />
            <p className="text-slate-400 text-sm">No donors have posted missions yet.</p>
          </div>
        ) : (
          <div className="grid gap-4 animate-fade-in-up">
            {donors.map((donor, i) => (
              <div
                key={donor.address}
                className={`glass-card rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 ${
                  i === 0 ? "border-amber-400/30 bg-amber-400/5" : ""
                }`}
              >
                <div className="flex-1 min-w-0">
                  <h2 className="text-xl font-bold text-slate-100 mb-1">{donor.name}</h2>
                  <p className="font-mono text-xs text-slate-500 truncate">{donor.address}</p>
                </div>

                <div className="flex gap-8 border-t md:border-t-0 md:border-l border-white/10 pt-4 md:pt-0 md:pl-8 shrink-0">
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Missions</p>
                    <p className="text-sm text-slate-300 font-medium whitespace-nowrap">
                      <span className="text-emerald-400">{donor.activeMissions} Active</span>
                      <span className="mx-2 opacity-40">•</span>
                      {donor.completedMissions} Done
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Total Deployed</p>
                    <p className="font-mono text-xl font-bold text-amber-300">
                      {formatEther(donor.totalDeployed)} ETH
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
