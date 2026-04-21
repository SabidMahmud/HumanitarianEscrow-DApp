"use client";

import { useMemo, useState } from "react";
import MissionsFilters from "@/components/missions/MissionsFilters";
import MissionsTable from "@/components/missions/MissionsTable";
import type { StatusFilter } from "@/components/missions/types";
import AppShell from "@/components/layout/AppShell";
import { useMissionFeed } from "@/hooks/useMissionFeed";
import { MissionStatus } from "@/types/mission";

export default function MissionsPage() {
  const { missions, isLoading, error, fetchMissions } = useMissionFeed();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>(
    MissionStatus.Pending,
  );
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [regionFilter, setRegionFilter] = useState<string>("ALL");

  const sortedMissions = useMemo(
    () =>
      [...missions].sort((a, b) =>
        a.maxBudget > b.maxBudget ? -1 : a.maxBudget < b.maxBudget ? 1 : 0,
      ),
    [missions],
  );

  const categories = useMemo(
    () =>
      Array.from(new Set(sortedMissions.map((mission) => mission.category))).sort(
        (a, b) => a.localeCompare(b),
      ),
    [sortedMissions],
  );

  const regions = useMemo(
    () =>
      Array.from(new Set(sortedMissions.map((mission) => mission.region))).sort(
        (a, b) => a.localeCompare(b),
      ),
    [sortedMissions],
  );

  const filteredMissions = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return sortedMissions.filter((mission) => {
      const matchSearch =
        normalizedSearch === "" ||
        mission.category.toLowerCase().includes(normalizedSearch) ||
        mission.region.toLowerCase().includes(normalizedSearch) ||
        mission.donorName.toLowerCase().includes(normalizedSearch) ||
        (mission.selectedAgencyName ?? "")
          .toLowerCase()
          .includes(normalizedSearch);
      const matchStatus =
        statusFilter === "ALL" || mission.status === statusFilter;
      const matchCategory =
        categoryFilter === "ALL" || mission.category === categoryFilter;
      const matchRegion =
        regionFilter === "ALL" || mission.region === regionFilter;

      return matchSearch && matchStatus && matchCategory && matchRegion;
    });
  }, [sortedMissions, search, statusFilter, categoryFilter, regionFilter]);

  return (
    <AppShell currentPath="/missions">
      <div className="mx-auto max-w-7xl px-6 py-32 lg:px-12">
        <div className="mb-12 animate-fade-in-up">
          <span className="mb-3 inline-flex items-center gap-2 rounded-full border border-rose-400/20 bg-rose-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-rose-200">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-400 shadow-[0_0_10px_rgba(251,113,133,0.8)]" />
            Public Ledger
          </span>
          <h1 className="font-fraunces text-4xl font-semibold text-slate-50 md:text-5xl">
            Global Mission Ledger
          </h1>
        </div>

        <MissionsFilters
          search={search}
          statusFilter={statusFilter}
          categoryFilter={categoryFilter}
          regionFilter={regionFilter}
          categories={categories}
          regions={regions}
          isLoading={isLoading}
          onSearchChange={setSearch}
          onStatusFilterChange={setStatusFilter}
          onCategoryFilterChange={setCategoryFilter}
          onRegionFilterChange={setRegionFilter}
          onRefresh={fetchMissions}
        />

        {error && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm mb-8 animate-fade-in-up">
            {error}
          </div>
        )}

        <section className="animate-fade-in-up">
          <MissionsTable
            missions={filteredMissions}
            totalMissionCount={sortedMissions.length}
            isLoading={isLoading}
            statusFilter={statusFilter}
          />
        </section>
      </div>
    </AppShell>
  );
}
