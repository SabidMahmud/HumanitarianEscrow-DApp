import { useMemo, useState } from "react";
import { formatEther } from "ethers";
import { Globe, Loader2 } from "lucide-react";
import StatusBadge from "@/components/ui/StatusBadge";
import type { LiveMission, StatusFilter } from "@/components/missions/types";
import { MissionStatus } from "@/types/mission";

interface MissionsTableProps {
  missions: LiveMission[];
  totalMissionCount: number;
  isLoading: boolean;
  statusFilter: StatusFilter;
}

const PAGE_SIZE_OPTIONS = [15, 30, 60] as const;

export default function MissionsTable({
  missions,
  totalMissionCount,
  isLoading,
  statusFilter,
}: MissionsTableProps) {
  const [pageSize, setPageSize] = useState<number>(PAGE_SIZE_OPTIONS[0]);
  const [requestedPage, setRequestedPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(missions.length / pageSize));
  const currentPage = Math.min(requestedPage, totalPages);

  const paginatedMissions = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    return missions.slice(start, end);
  }, [missions, currentPage, pageSize]);

  if (isLoading) {
    return (
      <div className="glass-panel rounded-3xl p-20 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-rose-400 animate-spin" />
      </div>
    );
  }

  if (missions.length === 0) {
    return (
      <div className="glass-panel rounded-3xl p-20 text-center">
        <Globe className="w-10 h-10 text-slate-500 mx-auto mb-3" />
        <p className="text-slate-400 text-sm">
          {totalMissionCount === 0
            ? "No missions posted yet."
            : statusFilter === MissionStatus.Pending
              ? "No pending missions available. Try another status filter."
              : "No missions match your filters."}
        </p>
      </div>
    );
  }

  return (
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
            {paginatedMissions.map((mission) => (
              <tr key={mission.id} className="hover:bg-white/3 transition-colors">
                <td className="px-6 py-5 font-mono text-slate-500 text-xs">
                  #{mission.id}
                </td>
                <td className="px-6 py-5">
                  <p className="font-medium text-slate-200 mb-0.5">{mission.category}</p>
                  <p className="text-xs text-slate-500">{mission.region}</p>
                </td>
                <td className="px-6 py-5">
                  <StatusBadge status={mission.status} />
                </td>
                <td className="px-6 py-5 text-xs text-slate-300">{mission.donorName}</td>
                <td className="px-6 py-5 text-xs text-slate-300">
                  {mission.selectedAgencyName ?? "—"}
                </td>
                <td className="px-6 py-5 text-right font-mono">
                  {mission.fundedAmount !== null ? (
                    <span className="text-emerald-300 font-bold">
                      {formatEther(mission.fundedAmount)} ETH
                    </span>
                  ) : (
                    <span className="text-slate-400">Max {formatEther(mission.maxBudget)} ETH</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex flex-col gap-3 px-6 py-3 border-t border-white/5 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
        <span>
          Showing {(currentPage - 1) * pageSize + 1}-
          {Math.min(currentPage * pageSize, missions.length)} of{" "}
          {missions.length} filtered missions ({totalMissionCount} total, sorted by
          highest budget)
        </span>
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setRequestedPage(1);
            }}
            className="rounded-lg bg-white/5 border border-white/10 text-xs text-slate-300 px-2.5 py-1.5 focus:outline-none focus:border-rose-500/40 transition-colors cursor-pointer"
          >
            {PAGE_SIZE_OPTIONS.map((size) => (
              <option key={size} value={size}>
                {size} / page
              </option>
            ))}
          </select>
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
            onClick={() => setRequestedPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
