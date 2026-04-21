import { formatEther } from "ethers";
import { HeartHandshake, ChevronRight } from "lucide-react";
import StatusBadge from "@/components/ui/StatusBadge";
import type { MissionWithBids } from "@/hooks/useMissions";
import { MissionStatus } from "@/types/mission";

interface MissionListProps {
  missions: MissionWithBids[];
  selectedId: number | null;
  onSelect: (id: number) => void;
}

export default function MissionList({ missions, selectedId, onSelect }: MissionListProps) {
  if (missions.length === 0) {
    return (
      <div className="glass-panel rounded-2xl p-12 text-center">
        <HeartHandshake className="w-10 h-10 text-slate-500 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-slate-300 mb-1">No missions yet</h3>
        <p className="text-slate-500 text-sm">
          Click "Post New Mission" to create your first aid mission.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {missions.map((mission) => {
        const isSelected = selectedId === mission.id;
        return (
          <button
            key={mission.id}
            onClick={() => onSelect(mission.id)}
            className={`w-full text-left glass-card rounded-2xl p-5 transition-all cursor-pointer ${
              isSelected ? "border-amber-400/40 bg-amber-500/5" : "hover:border-white/20"
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="font-mono text-xs text-slate-400">#{mission.id}</span>
              <div className="flex items-center gap-2">
                <StatusBadge status={mission.status} />
                <ChevronRight
                  className={`w-4 h-4 text-slate-500 transition-transform ${isSelected ? "rotate-90" : ""}`}
                />
              </div>
            </div>
            <h3 className="text-lg font-semibold text-slate-200 mb-1">{mission.category}</h3>
            <p className="text-sm text-slate-400 mb-4">{mission.region}</p>

            <div className="flex items-center justify-between pt-4 border-t border-white/5">
              <div>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest">Max Budget</p>
                <p className="font-mono text-sm text-slate-300">{formatEther(mission.maxBudget)} ETH</p>
              </div>
              {mission.status === MissionStatus.Pending && (
                <p className="text-sm font-medium text-amber-300">
                  {mission.bids.length} Bid{mission.bids.length !== 1 ? "s" : ""} Received
                </p>
              )}
              {mission.status === MissionStatus.InTransit && (
                <p className="text-sm text-sky-300">
                  {mission.selectedAgencyName ?? "Unknown agency"}
                </p>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}
