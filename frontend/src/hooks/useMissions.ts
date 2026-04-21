import { useState, useEffect, useCallback } from "react";
import { BrowserProvider, Contract } from "ethers";
import { CONTRACT_ADDRESS, HUMANITARIAN_ESCROW_ABI } from "@/config/contract";
import { Mission, MissionStatus } from "@/types/mission";

export interface Bid {
  agency: string;
  amount: bigint; // wei
  agencyName?: string;
}

export interface MissionWithBids extends Mission {
  bids: Bid[];
  donorName?: string;
  selectedAgencyName?: string | null;
}

/**
 * useMissions — fetch and cache all missions from on-chain.
 *
 * Reads missionCount(), then fetches each mission in parallel.
 * Also fetches bids for any mission with status Pending.
 */
export function useMissions() {
  const [missions, setMissions] = useState<MissionWithBids[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMissions = useCallback(async () => {
    if (typeof window === "undefined" || !(window as any).ethereum || !CONTRACT_ADDRESS) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const provider = new BrowserProvider((window as any).ethereum);
      const contract = new Contract(CONTRACT_ADDRESS, HUMANITARIAN_ESCROW_ABI, provider);

      const count = await contract.missionCount();
      const total = Number(count);

      if (total === 0) {
        setMissions([]);
        return;
      }

      const ids = Array.from({ length: total }, (_, i) => i + 1);

      const results = await Promise.all(
        ids.map(async (id) => {
          const m = await contract.missions(id);
          const status = Number(m.status) as MissionStatus;

          // Fetch bids only for Pending missions (the only state they matter)
          let bids: Bid[] = [];
          if (status === MissionStatus.Pending) {
            const rawBids = await contract.getMissionBids(id);
            bids = rawBids.map((b: any) => ({
              agency: b.agency as string,
              amount: b.amount as bigint,
            }));
          }

          return {
            id: Number(m.id),
            category: m.category,
            maxBudget: m.maxBudget as bigint,
            region: m.region,
            status,
            donor: m.donor as string,
            selectedAgency: m.selectedAgency as string,
            lockedFunds: m.lockedFunds as bigint,
            bids,
          } satisfies MissionWithBids;
        })
      );

      setMissions(results);
    } catch (err: any) {
      setError(err?.message ?? "Failed to load missions from chain.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMissions();
  }, [fetchMissions]);

  return { missions, isLoading, error, refetch: fetchMissions };
}
