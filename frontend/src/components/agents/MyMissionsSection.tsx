import { useMemo, useState } from "react";
import { formatEther } from "ethers";
import { CheckCircle2, Loader2, PackageCheck, Search } from "lucide-react";
import StatusBadge from "@/components/ui/StatusBadge";
import type { MissionWithBids } from "@/hooks/useMissions";
import { MissionStatus } from "@/types/mission";

interface MyMission extends MissionWithBids {
  payoutToAgency?: bigint;
  donorName: string;
  selectedAgencyName: string | null;
}

interface MyMissionsSectionProps {
  missions: MyMission[];
  processingId: number | null;
  onMarkDelivered: (missionId: number) => void;
}

type StatusFilter = MissionStatus | "ALL";

const PAGE_SIZE_OPTIONS = [12, 25, 50] as const;

export default function MyMissionsSection({
  missions,
  processingId,
  onMarkDelivered,
}: MyMissionsSectionProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [pageSize, setPageSize] = useState<number>(PAGE_SIZE_OPTIONS[0]);
  const [requestedPage, setRequestedPage] = useState(1);

  const filteredMissions = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return [...missions]
      .sort((a, b) => b.id - a.id)
      .filter((mission) => {
        const matchesStatus =
          statusFilter === "ALL" || mission.status === statusFilter;
        const matchesSearch =
          normalizedSearch === "" ||
          mission.category.toLowerCase().includes(normalizedSearch) ||
          mission.region.toLowerCase().includes(normalizedSearch) ||
          mission.donorName.toLowerCase().includes(normalizedSearch) ||
          String(mission.id).includes(normalizedSearch);

        return matchesStatus && matchesSearch;
      });
  }, [missions, search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredMissions.length / pageSize));
  const currentPage = Math.min(requestedPage, totalPages);

  const paginatedMissions = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    return filteredMissions.slice(start, end);
  }, [filteredMissions, currentPage, pageSize]);

  return (
    <section className="mb-12 animate-fade-in-up">
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <h2 className="text-xl font-semibold text-slate-100 flex items-center gap-3">
          My Missions
          <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-teal-500/20 px-2 text-xs text-teal-300 border border-teal-500/30">
            {filteredMissions.length}
          </span>
        </h2>

        <div className="flex flex-col sm:flex-row gap-3 md:min-w-[460px]">
          <div className="relative flex-1">
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

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as MissionStatus | "ALL");
              setRequestedPage(1);
            }}
            className="rounded-xl bg-white/5 border border-white/10 text-sm text-slate-300 px-4 py-2.5 focus:outline-none focus:border-teal-500/40 transition-colors cursor-pointer"
          >
            <option value="ALL">All Statuses</option>
            <option value={MissionStatus.InTransit}>In Transit</option>
            <option value={MissionStatus.AwaitingApproval}>Awaiting Approval</option>
            <option value={MissionStatus.Disputed}>Disputed</option>
            <option value={MissionStatus.Delivered}>Delivered</option>
          </select>

          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setRequestedPage(1);
            }}
            className="rounded-xl bg-white/5 border border-white/10 text-sm text-slate-300 px-4 py-2.5 focus:outline-none focus:border-teal-500/40 transition-colors cursor-pointer"
          >
            {PAGE_SIZE_OPTIONS.map((size) => (
              <option key={size} value={size}>
                {size} / page
              </option>
            ))}
          </select>
        </div>
      </div>

      {filteredMissions.length === 0 ? (
        <div className="glass-panel rounded-2xl p-12 text-center">
          <PackageCheck className="w-10 h-10 text-slate-500 mx-auto mb-3" />
          <p className="text-slate-400 text-sm">
            {missions.length === 0
              ? "No in-transit, awaiting approval, disputed, or delivered missions assigned to your agency right now."
              : "No missions match your filters."}
          </p>
        </div>
      ) : (
        <div className="glass-panel rounded-2xl overflow-hidden">
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
                  <th className="px-6 py-4 font-semibold text-slate-400 text-[11px] uppercase tracking-widest text-right">
                    Escrow / Payout
                  </th>
                  <th className="px-6 py-4 font-semibold text-slate-400 text-[11px] uppercase tracking-widest text-right">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-white/5">
                {paginatedMissions.map((mission) => {
                  const isBusy = processingId === mission.id;
                  const isInTransit = mission.status === MissionStatus.InTransit;
                  const showsEscrow =
                    mission.status === MissionStatus.InTransit ||
                    mission.status === MissionStatus.AwaitingApproval ||
                    mission.status === MissionStatus.Disputed;

                  return (
                    <tr key={mission.id} className="hover:bg-white/3 transition-colors">
                      <td className="px-6 py-5 font-mono text-slate-500 text-xs">
                        #{mission.id}
                      </td>

                      <td className="px-6 py-5">
                        <p className="font-medium text-slate-200 mb-0.5">
                          {mission.category}
                        </p>
                        <p className="text-xs text-slate-500">{mission.region}</p>
                      </td>

                      <td className="px-6 py-5">
                        <StatusBadge status={mission.status} />
                      </td>

                      <td className="px-6 py-5 text-xs text-slate-300">
                        {mission.donorName}
                      </td>

                      <td className="px-6 py-5 text-right font-mono">
                        {mission.payoutToAgency !== undefined ? (
                          <span className="text-cyan-300 font-bold">
                            {formatEther(mission.payoutToAgency)} ETH
                          </span>
                        ) : showsEscrow ? (
                          <span className="text-emerald-300 font-bold">
                            {formatEther(mission.lockedFunds)} ETH
                          </span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>

                      <td className="px-6 py-5 text-right">
                        {isInTransit ? (
                          <button
                            onClick={() => onMarkDelivered(mission.id)}
                            disabled={isBusy}
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/30 px-4 py-2 text-xs font-semibold text-teal-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                          >
                            {isBusy ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            )}
                            Mark Delivered
                          </button>
                        ) : (
                          <span className="text-xs text-slate-500">
                            {mission.status === MissionStatus.AwaitingApproval
                              ? "Waiting for donor"
                              : mission.status === MissionStatus.Disputed
                                ? "Under review"
                                : "Completed"}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between gap-3 px-6 py-3 border-t border-white/5 text-xs text-slate-500">
            <span>
              Showing {(currentPage - 1) * pageSize + 1}-
              {Math.min(currentPage * pageSize, filteredMissions.length)} of{" "}
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
