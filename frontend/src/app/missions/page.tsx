"use client";

import { useState, useEffect, useCallback } from "react";
import {
  BrowserProvider,
  JsonRpcProvider,
  Contract,
  formatEther,
} from "ethers";
import AppShell from "@/components/layout/AppShell";
import StatusBadge from "@/components/ui/StatusBadge";
import { CONTRACT_ADDRESS, HUMANITARIAN_ESCROW_ABI } from "@/config/contract";
import { MissionStatus } from "@/types/mission";
import { RefreshCw, Loader2, Search, Globe } from "lucide-react";

const NULL_ADDRESS = "0x0000000000000000000000000000000000000000";

interface LiveMission {
  id: number;
  category: string;
  region: string;
  maxBudget: bigint;
  lockedFunds: bigint;
  status: MissionStatus;
  donor: string;
  selectedAgency: string;
}

function truncate(addr: string) {
  return addr === NULL_ADDRESS ? "—" : `${addr.slice(0, 8)}…${addr.slice(-6)}`;
}

/** Try BrowserProvider first, fall back to a raw JsonRpc provider for read-only access */
async function getReadProvider() {
  if (typeof window !== "undefined" && (window as any).ethereum) {
    return new BrowserProvider((window as any).ethereum);
  }
  // Fallback to Ganache directly (read-only, no wallet needed)
  return new JsonRpcProvider("http://localhost:8545");
}

export default function MissionsPage() {
  const [missions, setMissions] = useState<LiveMission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<MissionStatus | "ALL">(
    "ALL",
  );
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [regionFilter, setRegionFilter] = useState<string>("ALL");

  const fetchMissions = useCallback(async () => {
    if (!CONTRACT_ADDRESS) {
      setError("Contract address not configured.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const provider = await getReadProvider();
      const contract = new Contract(
        CONTRACT_ADDRESS,
        HUMANITARIAN_ESCROW_ABI,
        provider,
      );
      const count = Number(await contract.missionCount());

      if (count === 0) {
        setMissions([]);
        return;
      }

      const results = await Promise.all(
        Array.from({ length: count }, (_, i) =>
          contract.missions(i + 1).then((m: any) => ({
            id: Number(m.id),
            category: m.category as string,
            region: m.region as string,
            maxBudget: m.maxBudget as bigint,
            lockedFunds: m.lockedFunds as bigint,
            status: Number(m.status) as MissionStatus,
            donor: m.donor as string,
            selectedAgency: m.selectedAgency as string,
          })),
        ),
      );

      setMissions(
        [...results].sort((a, b) =>
          a.maxBudget > b.maxBudget ? -1 : a.maxBudget < b.maxBudget ? 1 : 0,
        ),
      );
    } catch (err: any) {
      setError(
        "Could not connect to the contract. Make sure MetaMask or Ganache is reachable.",
      );
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMissions();
  }, [fetchMissions]);

  useEffect(() => {
    if (
      typeof window === "undefined" ||
      !(window as any).ethereum ||
      !CONTRACT_ADDRESS
    ) {
      return;
    }

    const provider = new BrowserProvider((window as any).ethereum);
    const contract = new Contract(
      CONTRACT_ADDRESS,
      HUMANITARIAN_ESCROW_ABI,
      provider,
    );
    const refresh = () => {
      fetchMissions();
    };

    const eventNames = [
      "MissionPosted",
      "PledgeSubmitted",
      "MissionFunded",
      "AidDelivered",
      "DeliveryApproved",
      "MissionDisputed",
      "DisputeResolved",
    ];

    eventNames.forEach((eventName) => contract.on(eventName, refresh));

    return () => {
      eventNames.forEach((eventName) => contract.off(eventName, refresh));
    };
  }, [fetchMissions]);

  const categories = Array.from(new Set(missions.map((m) => m.category))).sort(
    (a, b) => a.localeCompare(b),
  );
  const regions = Array.from(new Set(missions.map((m) => m.region))).sort(
    (a, b) => a.localeCompare(b),
  );

  // Client-side filtering
  const filtered = missions.filter((m) => {
    const matchSearch =
      search.trim() === "" ||
      m.category.toLowerCase().includes(search.toLowerCase()) ||
      m.region.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "ALL" || m.status === statusFilter;
    const matchCategory =
      categoryFilter === "ALL" || m.category === categoryFilter;
    const matchRegion = regionFilter === "ALL" || m.region === regionFilter;
    return matchSearch && matchStatus && matchCategory && matchRegion;
  });

  return (
    <AppShell currentPath="/missions">
      <div className="mx-auto max-w-7xl px-6 py-32 lg:px-12">
        {/* Header */}
        <div className="mb-12 animate-fade-in-up">
          <span className="mb-3 inline-flex items-center gap-2 rounded-full border border-rose-400/20 bg-rose-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-rose-200">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-400 shadow-[0_0_10px_rgba(251,113,133,0.8)]" />
            Public Ledger
          </span>
          <h1 className="font-fraunces text-4xl font-semibold text-slate-50 md:text-5xl">
            Global Mission Ledger
          </h1>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 mb-8 animate-fade-in-up">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search category or region…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-rose-500/40 transition-colors"
            />
          </div>

          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as MissionStatus | "ALL")
            }
            className="rounded-xl bg-white/5 border border-white/10 text-sm text-slate-300 px-4 py-2.5 focus:outline-none focus:border-rose-500/40 transition-colors cursor-pointer"
          >
            <option value="ALL">All Statuses</option>
            <option value={MissionStatus.Pending}>Pending</option>
            <option value={MissionStatus.InTransit}>In Transit</option>
            <option value={MissionStatus.AwaitingApproval}>
              Awaiting Approval
            </option>
            <option value={MissionStatus.Delivered}>Delivered</option>
            <option value={MissionStatus.Disputed}>Disputed</option>
            <option value={MissionStatus.Resolved}>Resolved</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="rounded-xl bg-white/5 border border-white/10 text-sm text-slate-300 px-4 py-2.5 focus:outline-none focus:border-rose-500/40 transition-colors cursor-pointer"
          >
            <option value="ALL">All Categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>

          <select
            value={regionFilter}
            onChange={(e) => setRegionFilter(e.target.value)}
            className="rounded-xl bg-white/5 border border-white/10 text-sm text-slate-300 px-4 py-2.5 focus:outline-none focus:border-rose-500/40 transition-colors cursor-pointer"
          >
            <option value="ALL">All Regions</option>
            {regions.map((region) => (
              <option key={region} value={region}>
                {region}
              </option>
            ))}
          </select>

          {/* Refresh */}
          <button
            onClick={fetchMissions}
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-sm text-slate-300 transition-colors disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw
              className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`}
            />
            Refresh
          </button>
        </div>

        {/* Error state */}
        {error && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm mb-8 animate-fade-in-up">
            {error}
          </div>
        )}

        {/* Table */}
        <section className="animate-fade-in-up">
          {isLoading ? (
            <div className="glass-panel rounded-3xl p-20 flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-rose-400 animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="glass-panel rounded-3xl p-20 text-center">
              <Globe className="w-10 h-10 text-slate-500 mx-auto mb-3" />
              <p className="text-slate-400 text-sm">
                {missions.length === 0
                  ? "No missions posted yet."
                  : "No missions match your filters."}
              </p>
            </div>
          ) : (
            <div className="glass-panel rounded-3xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="px-6 py-4 font-semibold text-slate-400 text-[11px] uppercase tracking-widest">
                        ID
                      </th>
                      <th className="px-6 py-4 font-semibold text-slate-400 text-[11px] uppercase tracking-widest">
                        Mission
                      </th>
                      <th className="px-6 py-4 font-semibold text-slate-400 text-[11px] uppercase tracking-widest">
                        Status
                      </th>
                      <th className="px-6 py-4 font-semibold text-slate-400 text-[11px] uppercase tracking-widest">
                        Donor
                      </th>
                      <th className="px-6 py-4 font-semibold text-slate-400 text-[11px] uppercase tracking-widest">
                        Agency
                      </th>
                      <th className="px-6 py-4 font-semibold text-slate-400 text-[11px] uppercase tracking-widest text-right">
                        Budget / Escrow
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filtered.map((mission) => (
                      <tr
                        key={mission.id}
                        className="hover:bg-white/3 transition-colors"
                      >
                        <td className="px-6 py-5 font-mono text-slate-500 text-xs">
                          #{mission.id}
                        </td>
                        <td className="px-6 py-5">
                          <p className="font-medium text-slate-200 mb-0.5">
                            {mission.category}
                          </p>
                          <p className="text-xs text-slate-500">
                            {mission.region}
                          </p>
                        </td>
                        <td className="px-6 py-5">
                          <StatusBadge status={mission.status} />
                        </td>
                        <td className="px-6 py-5 font-mono text-xs text-slate-400">
                          {truncate(mission.donor)}
                        </td>
                        <td className="px-6 py-5 font-mono text-xs text-slate-400">
                          {truncate(mission.selectedAgency)}
                        </td>
                        <td className="px-6 py-5 text-right font-mono">
                          {mission.lockedFunds > BigInt(0) ? (
                            <span className="text-emerald-300 font-bold">
                              {formatEther(mission.lockedFunds)} ETH
                            </span>
                          ) : (
                            <span className="text-slate-400">
                              Max {formatEther(mission.maxBudget)} ETH
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="px-6 py-3 border-t border-white/5 text-xs text-slate-500">
                {filtered.length} of {missions.length} missions
              </div>
            </div>
          )}
        </section>
      </div>
    </AppShell>
  );
}
