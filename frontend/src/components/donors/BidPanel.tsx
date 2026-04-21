"use client";

import { useState, useEffect } from "react";
import { BrowserProvider, Contract, formatEther } from "ethers";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import StatusBadge from "@/components/ui/StatusBadge";
import type { MissionWithBids } from "@/hooks/useMissions";
import { MissionStatus } from "@/types/mission";
import { CONTRACT_ADDRESS, HUMANITARIAN_ESCROW_ABI } from "@/config/contract";

const NULL_ADDRESS = "0x0000000000000000000000000000000000000000";

interface BidPanelProps {
  mission: MissionWithBids | null;
  processingId: number | "post" | null;
  onFund: (missionId: number, agency: string, amount: bigint) => void;
}

export default function BidPanel({
  mission,
  processingId,
  onFund,
}: BidPanelProps) {
  // Map of address → registered name, fetched on demand
  const [agencyNames, setAgencyNames] = useState<Record<string, string>>({});

  // Resolve names for all bidders whenever the mission/bids change
  useEffect(() => {
    if (
      !mission ||
      mission.bids.length === 0 ||
      !CONTRACT_ADDRESS ||
      !(window as any).ethereum
    )
      return;

    const addresses = mission.bids
      .map((b) => b.agency.toLowerCase())
      .filter((addr) => !agencyNames[addr]); // only fetch unknown ones

    if (addresses.length === 0) return;

    (async () => {
      try {
        const provider = new BrowserProvider((window as any).ethereum);
        const contract = new Contract(
          CONTRACT_ADDRESS,
          HUMANITARIAN_ESCROW_ABI,
          provider,
        );
        const resolved: Record<string, string> = {};
        await Promise.all(
          addresses.map(async (addr) => {
            const userData = await contract.users(addr);
            resolved[addr] =
              userData.isRegistered && userData.name.trim().length > 0
                ? userData.name.trim()
                : "Unknown agency";
          }),
        );
        setAgencyNames((prev) => ({ ...prev, ...resolved }));
      } catch {
        // Keep existing names and rely on Unknown agency fallback.
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mission?.id, mission?.bids.length]);

  const title = mission
    ? `Bids for Mission #${mission.id}`
    : "Select a Mission";

  let content: React.ReactNode;

  if (!mission) {
    content = (
      <div className="glass-panel rounded-2xl p-10 text-center min-h-50 flex flex-col items-center justify-center">
        <AlertCircle className="w-8 h-8 text-slate-500 mb-3" />
        <p className="text-slate-400 text-sm">
          Click a mission on the left to review its bids.
        </p>
      </div>
    );
  } else if (mission.status !== MissionStatus.Pending) {
    const isEscrowLocked =
      mission.status === MissionStatus.InTransit &&
      mission.lockedFunds > BigInt(0);
    content = (
      <div className="glass-panel rounded-2xl p-6">
        <p className="text-slate-400 text-sm mb-4">
          This mission is <StatusBadge status={mission.status} /> — bidding is
          closed.
        </p>
        {isEscrowLocked && (
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/15 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-emerald-300">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Funds in Escrow
          </div>
        )}
        {mission.selectedAgency !== NULL_ADDRESS && (
          <div className="mt-4">
            <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">
              Selected Agency
            </p>
            <p className="text-sm text-slate-300 font-semibold">
              {agencyNames[mission.selectedAgency.toLowerCase()] ||
                mission.selectedAgencyName ||
                "Unknown agency"}
            </p>
          </div>
        )}
        {mission.lockedFunds > BigInt(0) && (
          <div className="mt-4">
            <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">
              Locked Funds
            </p>
            <p className="font-mono text-lg text-emerald-300 font-bold">
              {formatEther(mission.lockedFunds)} ETH
            </p>
          </div>
        )}
      </div>
    );
  } else if (mission.bids.length === 0) {
    content = (
      <div className="glass-panel rounded-2xl p-10 text-center">
        <p className="text-slate-400 text-sm">
          No bids received yet for this mission.
        </p>
      </div>
    );
  } else {
    const isBusy = processingId === mission.id;
    content = (
      <div className="glass-panel rounded-2xl p-6">
        <div className="mb-5 pb-5 border-b border-white/5">
          <h3 className="font-semibold text-slate-200">{mission.category}</h3>
          <p className="text-sm text-slate-400">
            {mission.region} • Max {formatEther(mission.maxBudget)} ETH
          </p>
        </div>
        <div className="space-y-4">
          {mission.bids.map((bid, i) => {
            const resolvedName = agencyNames[bid.agency.toLowerCase()];
            const agencyDisplayName =
              resolvedName ?? bid.agencyName ?? "Unknown agency";
            return (
              <div
                key={i}
                className="rounded-xl bg-white/5 border border-white/10 p-4 hover:bg-white/[0.07] transition-colors"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">
                      Agency
                    </p>
                    <p className="text-sm font-semibold text-slate-100">
                      {agencyDisplayName}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">
                      Bid Amount
                    </p>
                    <p className="font-mono font-bold text-slate-200">
                      {formatEther(bid.amount)} ETH
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => onFund(mission.id, bid.agency, bid.amount)}
                  disabled={isBusy}
                  className="w-full rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 text-sm font-semibold text-emerald-300 py-2.5 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                >
                  {isBusy ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4" />
                  )}
                  Accept & Fund ({formatEther(bid.amount)} ETH)
                </button>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <section>
      <h2 className="mb-4 text-xl font-semibold text-slate-100">{title}</h2>
      {content}
    </section>
  );
}
