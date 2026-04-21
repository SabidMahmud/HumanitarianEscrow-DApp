"use client";

import { useMemo, useState } from "react";
import { formatEther, parseEther } from "ethers";
import { Send, Loader2, CheckCircle2, Inbox, Search } from "lucide-react";
import type { MissionWithBids } from "@/hooks/useMissions";

function parseBidToWei(value: string): bigint | null {
  const trimmed = value.trim();
  if (trimmed === "") return null;

  try {
    return parseEther(trimmed);
  } catch {
    return null;
  }
}

interface PendingMissionCardProps {
  mission: MissionWithBids & { donorName: string };
  agentAddress: string;
  reputationScore: number;
  isBusy: boolean;
  onBid: (missionId: number, bidAmountEth: string) => void;
}

/** Individual mission card with local bid input state. */
function PendingMissionCard({
  mission,
  agentAddress,
  reputationScore,
  isBusy,
  onBid,
}: PendingMissionCardProps) {
  const [bidAmount, setBidAmount] = useState("");

  const alreadyBid = mission.bids.some(
    (b) => b.agency.toLowerCase() === agentAddress.toLowerCase(),
  );
  const cannotBid = reputationScore < 40;
  const bidWei = parseBidToWei(bidAmount);
  const exceedsBudget = bidWei !== null && bidWei > mission.maxBudget;
  const hasPositiveBid = bidWei !== null && bidWei > BigInt(0);
  const canSubmit =
    !alreadyBid && !cannotBid && !exceedsBudget && hasPositiveBid && !isBusy;

  return (
    <div className="glass-card rounded-2xl p-5 hover:border-teal-400/30 transition-all group">
      <div className="flex items-center justify-between mb-3">
        <span className="font-mono text-xs text-slate-400">#{mission.id}</span>
        <span className="text-xs font-medium text-slate-400 font-mono">
          {mission.bids.length} bid{mission.bids.length !== 1 ? "s" : ""}{" "}
          received
        </span>
      </div>
      <h3 className="text-lg font-semibold text-slate-200 mb-1 group-hover:text-teal-300 transition-colors">
        {mission.category}
      </h3>
      <p className="text-sm text-slate-400 mb-4">
        {mission.region} •{" "}
        <span className="text-slate-500">Donor: {mission.donorName}</span>
      </p>

      <div className="pt-4 border-t border-white/5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest">
              Max Budget
            </p>
            <p className="font-mono text-sm text-slate-300">
              {formatEther(mission.maxBudget)} ETH
            </p>
          </div>
          {alreadyBid && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-xs font-semibold text-teal-300">
              <CheckCircle2 className="w-3.5 h-3.5" /> Bid Submitted
            </span>
          )}
          {cannotBid && !alreadyBid && (
            <span className="text-xs text-rose-400 font-medium">
              Rep too low to bid
            </span>
          )}
        </div>

        {/* Bid input — only show if agent hasn't bid yet and can bid */}
        {!alreadyBid && !cannotBid && (
          <div>
            <div className="flex gap-2">
              <input
                type="number"
                min="0"
                step="0.001"
                value={bidAmount}
                onChange={(e) => setBidAmount(e.target.value)}
                placeholder={`Max ${formatEther(mission.maxBudget)} ETH`}
                disabled={isBusy}
                className="flex-1 bg-slate-800/60 border border-white/10 focus:border-teal-500/50 focus:outline-none focus:ring-1 focus:ring-teal-500/30 rounded-xl px-3 py-2 text-slate-100 placeholder-slate-500 text-sm transition-all disabled:opacity-50"
              />
              <button
                onClick={() => onBid(mission.id, bidAmount)}
                disabled={!canSubmit}
                className="shrink-0 inline-flex items-center gap-1.5 rounded-xl bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/30 px-4 py-2 text-sm font-semibold text-teal-300 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                {isBusy ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                Pledge
              </button>
            </div>
            {exceedsBudget && (
              <p className="mt-2 text-xs text-rose-400">Exceeds max budget.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

interface MissionBoardProps {
  missions: (MissionWithBids & { donorName: string })[];
  agentAddress: string;
  reputationScore: number;
  processingId: number | null;
  onBid: (missionId: number, bidAmountEth: string) => void;
}

const PAGE_SIZE = 6;

export default function MissionBoard({
  missions,
  agentAddress,
  reputationScore,
  processingId,
  onBid,
}: MissionBoardProps) {
  const [search, setSearch] = useState("");
  const [requestedPage, setRequestedPage] = useState(1);

  const filteredMissions = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return [...missions]
      .sort((a, b) =>
        a.maxBudget > b.maxBudget ? -1 : a.maxBudget < b.maxBudget ? 1 : 0,
      )
      .filter((mission) => {
        if (normalizedSearch === "") {
          return true;
        }

        return (
          String(mission.id).includes(normalizedSearch) ||
          mission.category.toLowerCase().includes(normalizedSearch) ||
          mission.region.toLowerCase().includes(normalizedSearch) ||
          mission.donorName.toLowerCase().includes(normalizedSearch)
        );
      });
  }, [missions, search]);

  const totalPages = Math.max(1, Math.ceil(filteredMissions.length / PAGE_SIZE));
  const currentPage = Math.min(requestedPage, totalPages);
  const paginatedMissions = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    const end = start + PAGE_SIZE;
    return filteredMissions.slice(start, end);
  }, [filteredMissions, currentPage]);

  return (
    <section>
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <h2 className="text-xl font-semibold text-slate-100 flex items-center gap-3">
          Available to Bid
          <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-teal-500/20 px-2 text-xs text-teal-300 border border-teal-500/30">
            {filteredMissions.length}
          </span>
        </h2>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setRequestedPage(1);
            }}
            placeholder="Search id, mission, region, donor…"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-teal-500/40 transition-colors"
          />
        </div>
      </div>

      {missions.length === 0 ? (
        <div className="glass-panel rounded-2xl p-12 text-center">
          <Inbox className="w-10 h-10 text-slate-500 mx-auto mb-3" />
          <p className="text-slate-400 text-sm">
            No open missions right now. Check back soon.
          </p>
        </div>
      ) : filteredMissions.length === 0 ? (
        <div className="glass-panel rounded-2xl p-12 text-center">
          <Inbox className="w-10 h-10 text-slate-500 mx-auto mb-3" />
          <p className="text-slate-400 text-sm">No missions match your search.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid gap-4 xl:grid-cols-2">
            {paginatedMissions.map((mission) => (
              <PendingMissionCard
                key={mission.id}
                mission={mission}
                agentAddress={agentAddress}
                reputationScore={reputationScore}
                isBusy={processingId === mission.id}
                onBid={onBid}
              />
            ))}
          </div>

          <div className="flex items-center justify-between gap-3 px-1 text-xs text-slate-500">
            <span>
              Showing {(currentPage - 1) * PAGE_SIZE + 1}-
              {Math.min(currentPage * PAGE_SIZE, filteredMissions.length)} of{" "}
              {filteredMissions.length}
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setRequestedPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                Prev
              </button>
              <span>
                Page {currentPage} / {totalPages}
              </span>
              <button
                onClick={() =>
                  setRequestedPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
                className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
