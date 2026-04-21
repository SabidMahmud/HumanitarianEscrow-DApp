import { formatEther } from "ethers";
import { CheckCircle2, Gavel, Loader2 } from "lucide-react";
import StatusBadge from "@/components/ui/StatusBadge";
import type { MissionWithBids } from "@/hooks/useMissions";
import { MissionStatus } from "@/types/mission";

function truncate(addr: string) {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

interface AwaitingApprovalSectionProps {
  missions: MissionWithBids[];
  processingId: number | "post" | null;
  onApprove: (id: number) => void;
  onDispute: (id: number) => void;
}

export default function AwaitingApprovalSection({
  missions,
  processingId,
  onApprove,
  onDispute,
}: AwaitingApprovalSectionProps) {
  const actionable = missions.filter(
    (m) =>
      m.status === MissionStatus.AwaitingApproval ||
      m.status === MissionStatus.InTransit,
  );
  if (actionable.length === 0) return null;

  return (
    <section className="mb-12 animate-fade-in-up">
      <h2 className="mb-4 text-xl font-semibold text-slate-100 flex items-center gap-3">
        Action Required: Review Active Missions
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/20 text-xs text-emerald-300 border border-emerald-500/30">
          {actionable.length}
        </span>
      </h2>

      <div className="grid gap-4">
        {actionable.map((mission) => {
          const isBusy = processingId === mission.id;
          const isAwaitingApproval =
            mission.status === MissionStatus.AwaitingApproval;
          return (
            <div
              key={mission.id}
              className="glass-panel rounded-2xl p-6 border-l-4 border-emerald-500"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <div className="flex gap-3 mb-2">
                    <span className="font-mono text-sm text-slate-400 border border-white/10 bg-white/5 px-2 py-0.5 rounded">
                      #{mission.id}
                    </span>
                    <StatusBadge status={mission.status} />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-100">
                    {mission.category}
                  </h3>
                  <p className="text-sm text-slate-400 mt-1">
                    {mission.region} • Agency:{" "}
                    <span className="font-mono text-slate-300">
                      {truncate(mission.selectedAgency)}
                    </span>
                  </p>
                </div>

                <div className="flex flex-col items-end gap-3 min-w-50">
                  <div className="text-right">
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest">
                      Locked Escrow
                    </p>
                    <p className="text-2xl font-mono text-emerald-300 font-bold">
                      {formatEther(mission.lockedFunds)} ETH
                    </p>
                  </div>
                  <div className="flex w-full gap-3">
                    <button
                      onClick={() => onDispute(mission.id)}
                      disabled={isBusy}
                      className="flex-1 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2 text-sm font-semibold text-slate-300 transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                    >
                      {isBusy ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Gavel className="w-3.5 h-3.5" />
                      )}
                      Dispute
                    </button>
                    {isAwaitingApproval && (
                      <button
                        onClick={() => onApprove(mission.id)}
                        disabled={isBusy}
                        className="flex-1 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 px-4 py-2 text-sm font-semibold text-emerald-300 transition-colors flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(16,185,129,0.15)] disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                      >
                        {isBusy ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        )}
                        Approve
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
