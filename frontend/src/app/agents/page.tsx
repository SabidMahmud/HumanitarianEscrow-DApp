"use client";

import { useState, useEffect, useCallback } from "react";
import { BrowserProvider, JsonRpcProvider, Contract } from "ethers";
import AppShell from "@/components/layout/AppShell";
import { CONTRACT_ADDRESS, HUMANITARIAN_ESCROW_ABI } from "@/config/contract";
import { MissionStatus } from "@/types/mission";
import { RefreshCw, Loader2, Users, ShieldCheck } from "lucide-react";

interface AgencyProfile {
  address: string;
  name: string;
  reputationScore: number;
  /** Number of missions where this agency was selected */
  missionsDelivered: number;
}

async function getReadProvider() {
  if (typeof window !== "undefined" && (window as any).ethereum) {
    return new BrowserProvider((window as any).ethereum);
  }
  return new JsonRpcProvider("http://localhost:8545");
}

function RepBadge({ score }: { score: number }) {
  const color =
    score >= 80 ? "text-teal-300 bg-teal-400/10 border-teal-400/20" :
    score >= 50 ? "text-amber-300 bg-amber-400/10 border-amber-400/20" :
                 "text-rose-300 bg-rose-400/10 border-rose-400/20";
  return (
    <span className={`inline-flex items-baseline gap-1 px-3 py-1 rounded-full border text-sm font-mono font-bold ${color}`}>
      {score} <span className="text-[10px] font-normal opacity-70">pts</span>
    </span>
  );
}

export default function AgentsRegistryPage() {
  const [agencies, setAgencies] = useState<AgencyProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAgencies = useCallback(async () => {
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
        setAgencies([]);
        setIsLoading(false);
        return;
      }

      // Fetch all missions and collect unique agency addresses
      const missionData = await Promise.all(
        Array.from({ length: count }, (_, i) =>
          contract.missions(i + 1).then((m: any) => ({
            status: Number(m.status) as MissionStatus,
            selectedAgency: m.selectedAgency as string,
          }))
        )
      );

      // Find all unique non-null agency addresses
      const NULL_ADDR = "0x0000000000000000000000000000000000000000";
      const agencyMap = new Map<string, number>(); // address → delivered count

      for (const m of missionData) {
        if (m.selectedAgency !== NULL_ADDR) {
          const addr = m.selectedAgency.toLowerCase();
          const prev = agencyMap.get(addr) ?? 0;
          const delivered =
            m.status === MissionStatus.Delivered || m.status === MissionStatus.Resolved ? 1 : 0;
          agencyMap.set(addr, prev + delivered);
        }
      }

      if (agencyMap.size === 0) {
        setAgencies([]);
        setIsLoading(false);
        return;
      }

      // Fetch user data for each unique agency address
      const profiles = await Promise.all(
        Array.from(agencyMap.entries()).map(async ([addr, deliveredCount]) => {
          const userData = await contract.users(addr);
          return {
            address: addr,
            name: userData.name as string,
            reputationScore: Number(userData.reputationScore),
            missionsDelivered: deliveredCount,
          } satisfies AgencyProfile;
        })
      );

      // Sort by reputation descending
      setAgencies(profiles.sort((a, b) => b.reputationScore - a.reputationScore));
    } catch (err: any) {
      setError("Could not load agency data from the contract.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAgencies();
  }, [fetchAgencies]);

  return (
    <AppShell currentPath="/agents">
      <div className="mx-auto max-w-7xl px-6 py-32 lg:px-12">

        {/* Header */}
        <div className="mb-12 animate-fade-in-up flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <span className="mb-3 inline-flex items-center gap-2 rounded-full border border-teal-400/20 bg-teal-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-teal-200">
              <span className="h-1.5 w-1.5 rounded-full bg-teal-300 shadow-[0_0_10px_rgba(45,212,191,0.8)]" />
              Public Registry
            </span>
            <h1 className="font-fraunces text-4xl font-semibold text-slate-50 md:text-5xl">
              Verified Relief Agencies
            </h1>
            <p className="mt-2 text-slate-500 text-sm">
              Agencies assigned to at least one mission. Reputation is on-chain.
            </p>
          </div>
          <button
            onClick={fetchAgencies}
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
            <Loader2 className="w-8 h-8 text-teal-400 animate-spin" />
          </div>
        ) : agencies.length === 0 ? (
          <div className="glass-panel rounded-3xl p-20 text-center animate-fade-in-up">
            <Users className="w-10 h-10 text-slate-500 mx-auto mb-3" />
            <p className="text-slate-400 text-sm">
              No agencies have been assigned to a mission yet.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 animate-fade-in-up">
            {agencies.map((agency) => {
              const repColor =
                agency.reputationScore >= 80 ? "border-l-teal-400" :
                agency.reputationScore >= 50 ? "border-l-amber-400" :
                                               "border-l-rose-400";
              return (
                <div
                  key={agency.address}
                  className={`glass-card rounded-2xl p-6 flex flex-col gap-6 border-l-4 ${repColor}`}
                >
                  <div>
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h2 className="text-lg font-bold text-slate-100">{agency.name}</h2>
                        <p className="font-mono text-[11px] text-slate-500 mt-0.5 break-all">
                          {agency.address}
                        </p>
                      </div>
                      <ShieldCheck className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />
                    </div>
                  </div>

                  <div className="flex items-end justify-between border-t border-white/5 pt-4">
                    <div>
                      <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">
                        Missions Delivered
                      </p>
                      <p className="font-mono text-2xl font-bold text-slate-200">
                        {agency.missionsDelivered}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">
                        Reputation
                      </p>
                      <RepBadge score={agency.reputationScore} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
}
