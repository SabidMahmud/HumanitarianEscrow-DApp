import { ChevronDown, RefreshCw, Search } from "lucide-react";
import { MissionStatus } from "@/types/mission";
import type { StatusFilter } from "@/components/missions/types";

interface MissionsFiltersProps {
  search: string;
  statusFilter: StatusFilter;
  categoryFilter: string;
  regionFilter: string;
  categories: string[];
  regions: string[];
  isLoading: boolean;
  onSearchChange: (value: string) => void;
  onStatusFilterChange: (value: StatusFilter) => void;
  onCategoryFilterChange: (value: string) => void;
  onRegionFilterChange: (value: string) => void;
  onRefresh: () => void;
}

export default function MissionsFilters({
  search,
  statusFilter,
  categoryFilter,
  regionFilter,
  categories,
  regions,
  isLoading,
  onSearchChange,
  onStatusFilterChange,
  onCategoryFilterChange,
  onRegionFilterChange,
  onRefresh,
}: MissionsFiltersProps) {
  const selectClassName =
    "w-full appearance-none rounded-xl border border-white/10 bg-slate-950/50 px-4 py-2.5 pr-10 text-sm text-slate-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition-colors hover:border-white/20 focus:outline-none focus:border-rose-500/50";

  return (
    <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 mb-8 animate-fade-in-up">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <input
          type="text"
          placeholder="Search category, region, donor, agency…"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-rose-500/40 transition-colors"
        />
      </div>

      <div className="relative min-w-[190px]">
        <select
          value={statusFilter}
          onChange={(e) => {
            const value = e.target.value;
            onStatusFilterChange(
              value === "ALL"
                ? "ALL"
                : (Number(value) as MissionStatus),
            );
          }}
          className={selectClassName}
        >
          <option className="bg-slate-900 text-slate-100" value={MissionStatus.Pending}>
            Pending (Default)
          </option>
          <option className="bg-slate-900 text-slate-100" value="ALL">
            All Statuses
          </option>
          <option className="bg-slate-900 text-slate-100" value={MissionStatus.InTransit}>
            In Transit
          </option>
          <option className="bg-slate-900 text-slate-100" value={MissionStatus.AwaitingApproval}>
            Awaiting Approval
          </option>
          <option className="bg-slate-900 text-slate-100" value={MissionStatus.Delivered}>
            Delivered
          </option>
          <option className="bg-slate-900 text-slate-100" value={MissionStatus.Disputed}>
            Disputed
          </option>
          <option className="bg-slate-900 text-slate-100" value={MissionStatus.Resolved}>
            Resolved
          </option>
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
      </div>

      <div className="relative min-w-[180px]">
        <select
          value={categoryFilter}
          onChange={(e) => onCategoryFilterChange(e.target.value)}
          className={selectClassName}
        >
          <option className="bg-slate-900 text-slate-100" value="ALL">
            All Categories
          </option>
          {categories.map((category) => (
            <option
              className="bg-slate-900 text-slate-100"
              key={category}
              value={category}
            >
              {category}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
      </div>

      <div className="relative min-w-[180px]">
        <select
          value={regionFilter}
          onChange={(e) => onRegionFilterChange(e.target.value)}
          className={selectClassName}
        >
          <option className="bg-slate-900 text-slate-100" value="ALL">
            All Regions
          </option>
          {regions.map((region) => (
            <option className="bg-slate-900 text-slate-100" key={region} value={region}>
              {region}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
      </div>

      <button
        onClick={onRefresh}
        disabled={isLoading}
        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-sm text-slate-300 transition-colors disabled:opacity-50 cursor-pointer"
      >
        <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
        Refresh
      </button>
    </div>
  );
}
