import { formatEther } from "ethers";
import { CheckCircle2, Loader2, Clock } from "lucide-react";
import StatusBadge from "@/components/ui/StatusBadge";
import type { MissionWithBids } from "@/hooks/useMissions";

type ActiveMission = MissionWithBids & {
  donorName: string;
};

interface ActiveContractsSectionProps {
  inTransit: ActiveMission[];
  awaitingApproval: ActiveMission[];
  processingId: number | null;
  onMarkDelivered: (missionId: number) => void;
}

export default function ActiveContractsSection({
  inTransit,
  awaitingApproval,
  processingId,
  onMarkDelivered,
}: ActiveContractsSectionProps) {
  if (inTransit.length === 0 && awaitingApproval.length === 0) return null;

  return (
    <section className="mb-12 animate-fade-in-up">
      <h2 className="mb-4 text-xl font-semibold text-slate-100 flex items-center gap-3">
        Active Contracts
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-teal-500/20 text-xs text-teal-300 border border-teal-500/30">
          {inTransit.length + awaitingApproval.length}
        </span>
      </h2>

      <div className="grid gap-4">
        {/* In Transit — action required */}
        {inTransit.map((mission) => {
          const isBusy = processingId === mission.id;
          return (
            <div key={mission.id} className="glass-panel rounded-2xl p-6 border-l-4 border-teal-500">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <div className="flex gap-3 mb-2">
                    <span className="font-mono text-sm text-slate-400 border border-white/10 bg-white/5 px-2 py-0.5 rounded">
                      #{mission.id}
                    </span>
                    <StatusBadge status={mission.status} />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-100">{mission.category}</h3>
                  <p className="text-sm text-slate-400 mt-1">
                    {mission.region} • Donor:{" "}
                    <span className="text-slate-300">{mission.donorName}</span>
                  </p>
                </div>
                <div className="flex flex-col items-end gap-3 min-w-50">
                  <div className="text-right">
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest">Locked Escrow</p>
                    <p className="text-2xl font-mono text-emerald-300 font-bold">
                      {formatEther(mission.lockedFunds)} ETH
                    </p>
                  </div>
                  <button
                    onClick={() => onMarkDelivered(mission.id)}
                    disabled={isBusy}
                    className="w-full rounded-xl bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/30 px-5 py-2.5 text-sm font-semibold text-teal-300 transition-colors flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(20,184,166,0.15)] disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                  >
                    {isBusy ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4" />
                    )}
                    Mark Delivered
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {/* Awaiting Approval — waiting on donor */}
        {awaitingApproval.map((mission) => (
          <div key={mission.id} className="glass-panel rounded-2xl p-6 border-l-4 border-slate-600 opacity-80">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <div className="flex gap-3 mb-2">
                  <span className="font-mono text-sm text-slate-400 border border-white/10 bg-white/5 px-2 py-0.5 rounded">
                    #{mission.id}
                  </span>
                  <StatusBadge status={mission.status} />
                </div>
                <h3 className="text-xl font-semibold text-slate-100">{mission.category}</h3>
                <p className="text-sm text-slate-400 mt-1">{mission.region}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Escrow</p>
                <p className="text-2xl font-mono text-slate-300 font-bold">
                  {formatEther(mission.lockedFunds)} ETH
                </p>
                <p className="text-xs text-slate-500 mt-1 flex items-center justify-end gap-1.5">
                  <Clock className="w-3 h-3" /> Waiting for donor approval
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
