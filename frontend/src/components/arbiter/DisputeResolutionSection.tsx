import { formatEther } from "ethers";
import { Loader2, Shield } from "lucide-react";
import { ZERO_ADDRESS } from "@/components/arbiter/utils";
import type {
  ArbiterProcessingId,
  DisputedMission,
} from "@/components/arbiter/types";

interface DisputeResolutionSectionProps {
  missions: DisputedMission[];
  processingId: ArbiterProcessingId;
  onResolveDispute: (missionId: number, agencyFault: boolean) => void;
}

export default function DisputeResolutionSection({
  missions,
  processingId,
  onResolveDispute,
}: DisputeResolutionSectionProps) {
  return (
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
          <h3 className="text-xl font-semibold text-slate-200 mb-2">
            No active disputes
          </h3>
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
                        <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">
                          Donor
                        </p>
                        <p className="text-sm text-slate-300 font-mono">
                          {mission.donorName}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">
                          Agency
                        </p>
                        <p className="text-sm text-slate-300 font-mono">
                          {mission.selectedAgency === ZERO_ADDRESS
                            ? "—"
                            : mission.agencyName}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 lg:max-w-sm flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-white/10 pt-6 lg:pt-0 lg:pl-8">
                    <div className="mb-6">
                      <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">
                        Contested Escrow
                      </p>
                      <p className="text-3xl font-mono text-rose-300 font-bold">
                        {formatEther(mission.lockedFunds)} ETH
                      </p>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => onResolveDispute(mission.id, true)}
                        disabled={isProcessing}
                        className="flex-1 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 px-4 py-3 text-xs font-semibold text-slate-300 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                      >
                        {isProcessing ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : null}
                        Refund Donor
                      </button>

                      <button
                        onClick={() => onResolveDispute(mission.id, false)}
                        disabled={isProcessing}
                        className="flex-1 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 px-4 py-3 text-xs font-semibold text-rose-300 transition-colors flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(244,63,94,0.15)] disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                      >
                        {isProcessing ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : null}
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
  );
}
