import { formatEther } from "ethers";
import { History } from "lucide-react";
import StatusBadge from "@/components/ui/StatusBadge";
import type { MissionWithBids } from "@/hooks/useMissions";

interface DeliveryHistoryProps {
  deliveries: MissionWithBids[];
}

export default function DeliveryHistory({ deliveries }: DeliveryHistoryProps) {
  return (
    <section>
      <h2 className="mb-4 text-xl font-semibold text-slate-100">Delivery History</h2>

      {deliveries.length === 0 ? (
        <div className="glass-panel rounded-2xl p-12 text-center">
          <History className="w-10 h-10 text-slate-500 mx-auto mb-3" />
          <p className="text-slate-400 text-sm">No completed deliveries yet.</p>
        </div>
      ) : (
        <div className="glass-panel rounded-2xl overflow-hidden">
          {deliveries.map((mission, i) => (
            <div
              key={mission.id}
              className={`flex items-center justify-between px-6 py-4 ${
                i !== deliveries.length - 1 ? "border-b border-white/5" : ""
              }`}
            >
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-xs text-slate-500">#{mission.id}</span>
                  <StatusBadge status={mission.status} />
                </div>
                <h4 className="font-medium text-slate-200">{mission.category}</h4>
                <p className="text-xs text-slate-500 mt-0.5">{mission.region}</p>
              </div>
              <div className="text-right shrink-0 ml-4">
                <p className="font-mono font-bold text-emerald-400">
                  {formatEther(mission.lockedFunds)} ETH
                </p>
                <p className="text-[10px] uppercase tracking-wider text-emerald-500/70 font-bold mt-0.5">
                  Paid Out
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
