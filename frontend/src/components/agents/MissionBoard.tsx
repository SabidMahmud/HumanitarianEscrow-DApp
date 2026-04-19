"use client";

import { useState } from "react";
import { formatEther } from "ethers";
import { Send, Loader2, CheckCircle2, Inbox } from "lucide-react";
import type { MissionWithBids } from "@/hooks/useMissions";

function truncate(addr: string) {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

interface PendingMissionCardProps {
  mission: MissionWithBids;
  agentAddress: string;
  reputationScore: number;
  isBusy: boolean;
  onBid: (missionId: number, bidAmountEth: string) => void;
}

/** Individual mission card with local bid input state. */
function PendingMissionCard({ mission, agentAddress, reputationScore, isBusy, onBid }: PendingMissionCardProps) {
  const [bidAmount, setBidAmount] = useState("");

  const alreadyBid = mission.bids.some(
    (b) => b.agency.toLowerCase() === agentAddress.toLowerCase()
  );
  const cannotBid = reputationScore < 40;
  const canSubmit = !alreadyBid && !cannotBid && bidAmount.trim() !== "" && Number(bidAmount) > 0 && !isBusy;

  return (
    <div className="glass-card rounded-2xl p-5 hover:border-teal-400/30 transition-all group">
      <div className="flex items-center justify-between mb-3">
        <span className="font-mono text-xs text-slate-400">#{mission.id}</span>
        <span className="text-xs font-medium text-slate-400 font-mono">
          {mission.bids.length} bid{mission.bids.length !== 1 ? "s" : ""} received
        </span>
      </div>
      <h3 className="text-lg font-semibold text-slate-200 mb-1 group-hover:text-teal-300 transition-colors">
        {mission.category}
      </h3>
      <p className="text-sm text-slate-400 mb-4">
        {mission.region} •{" "}
        <span className="text-slate-500">Donor: {truncate(mission.donor)}</span>
      </p>

      <div className="pt-4 border-t border-white/5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest">Max Budget</p>
            <p className="font-mono text-sm text-slate-300">{formatEther(mission.maxBudget)} ETH</p>
          </div>
          {alreadyBid && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-xs font-semibold text-teal-300">
              <CheckCircle2 className="w-3.5 h-3.5" /> Bid Submitted
            </span>
          )}
          {cannotBid && !alreadyBid && (
            <span className="text-xs text-rose-400 font-medium">Rep too low to bid</span>
          )}
        </div>

        {/* Bid input — only show if agent hasn't bid yet and can bid */}
        {!alreadyBid && !cannotBid && (
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
              {isBusy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              Pledge
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

interface MissionBoardProps {
  missions: MissionWithBids[];
  agentAddress: string;
  reputationScore: number;
  processingId: number | null;
  onBid: (missionId: number, bidAmountEth: string) => void;
}

export default function MissionBoard({
  missions,
  agentAddress,
  reputationScore,
  processingId,
  onBid,
}: MissionBoardProps) {
  return (
    <section>
      <h2 className="mb-4 text-xl font-semibold text-slate-100">Available to Bid</h2>

      {missions.length === 0 ? (
        <div className="glass-panel rounded-2xl p-12 text-center">
          <Inbox className="w-10 h-10 text-slate-500 mx-auto mb-3" />
          <p className="text-slate-400 text-sm">No open missions right now. Check back soon.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {missions.map((mission) => (
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
      )}
    </section>
  );
}
