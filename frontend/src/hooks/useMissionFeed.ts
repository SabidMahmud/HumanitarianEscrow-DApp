import { useCallback, useEffect, useState } from "react";
import {
  BrowserProvider,
  JsonRpcProvider,
  Contract,
  type Eip1193Provider,
} from "ethers";
import { CONTRACT_ADDRESS, HUMANITARIAN_ESCROW_ABI } from "@/config/contract";
import type { LiveMission } from "@/components/missions/types";
import { MissionStatus } from "@/types/mission";

const NULL_ADDRESS = "0x0000000000000000000000000000000000000000";

interface MissionRow {
  id: bigint;
  category: string;
  region: string;
  maxBudget: bigint;
  lockedFunds: bigint;
  status: bigint;
  donor: string;
  selectedAgency: string;
}

interface UserRow {
  name: string;
  role: bigint;
  wallet: string;
  reputationScore: bigint;
  isRegistered: boolean;
}

interface EthereumWindow extends Window {
  ethereum?: Eip1193Provider;
}

function getEthereumProvider() {
  if (typeof window === "undefined") {
    return null;
  }

  return (window as EthereumWindow).ethereum ?? null;
}

async function getReadProvider() {
  // Prefer direct RPC for log queries; some wallet providers are inconsistent
  // with historical event ranges.
  const rpcProvider = new JsonRpcProvider("http://localhost:8545");
  try {
    await rpcProvider.getBlockNumber();
    return rpcProvider;
  } catch {
    const ethereum = getEthereumProvider();
    if (ethereum) {
      return new BrowserProvider(ethereum);
    }
  }
  throw new Error("No read provider available");
}

export function useMissionFeed() {
  const [missions, setMissions] = useState<LiveMission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMissions = useCallback(async () => {
    if (!CONTRACT_ADDRESS) {
      setError("Contract address not configured.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const provider = await getReadProvider();
      const contract = new Contract(
        CONTRACT_ADDRESS,
        HUMANITARIAN_ESCROW_ABI,
        provider,
      );
      const [
        countRaw,
        missionFundedEvents,
        deliveryApprovedEvents,
        disputeResolvedEvents,
      ] =
        await Promise.all([
          contract.missionCount(),
          contract.queryFilter(contract.filters.MissionFunded(), 0, "latest"),
          contract.queryFilter(contract.filters.DeliveryApproved(), 0, "latest"),
          contract.queryFilter(contract.filters.DisputeResolved(), 0, "latest"),
        ]);
      const count = Number(countRaw);

      if (count === 0) {
        setMissions([]);
        return;
      }

      const fundedAmountByMission = new Map<number, bigint>();

      for (const event of missionFundedEvents) {
        if (!("args" in event)) continue;

        const missionId = Number(event.args[0] ?? 0);
        const fundedAmount = event.args[3] as bigint | undefined;

        if (missionId > 0 && fundedAmount !== undefined) {
          fundedAmountByMission.set(missionId, fundedAmount);
        }
      }

      const settledAmountByMission = new Map<number, bigint>();

      for (const event of deliveryApprovedEvents) {
        if (!("args" in event)) continue;

        const missionId = Number(event.args[0] ?? 0);
        const agencyPayout = event.args[1] as bigint | undefined;

        if (missionId > 0 && agencyPayout !== undefined) {
          settledAmountByMission.set(missionId, agencyPayout);
        }
      }

      for (const event of disputeResolvedEvents) {
        if (!("args" in event)) continue;

        const missionId = Number(event.args[0] ?? 0);
        const amountResolved = event.args[2] as bigint | undefined;

        if (missionId > 0 && amountResolved !== undefined) {
          settledAmountByMission.set(missionId, amountResolved);
        }
      }

      const results = await Promise.all(
        Array.from({ length: count }, (_, i) =>
          contract.missions(i + 1).then((m: MissionRow) => ({
            id: Number(m.id),
            category: m.category as string,
            region: m.region as string,
            maxBudget: m.maxBudget as bigint,
            lockedFunds: m.lockedFunds as bigint,
            status: Number(m.status) as MissionStatus,
            donor: m.donor as string,
            selectedAgency: m.selectedAgency as string,
          })),
        ),
      );

      const missionsMissingSettledAmount = results
        .filter(
          (mission) =>
            (mission.status === MissionStatus.Delivered ||
              mission.status === MissionStatus.Resolved) &&
            !settledAmountByMission.has(mission.id),
        )
        .map((mission) => mission.id);

      if (missionsMissingSettledAmount.length > 0) {
        const fallbackSettlements = await Promise.all(
          missionsMissingSettledAmount.map(async (missionId) => {
            const [deliveryLogs, disputeLogs] = await Promise.all([
              contract.queryFilter(
                contract.filters.DeliveryApproved(missionId),
                0,
                "latest",
              ),
              contract.queryFilter(
                contract.filters.DisputeResolved(missionId),
                0,
                "latest",
              ),
            ]);

            const latestDeliveryLog = deliveryLogs[deliveryLogs.length - 1];
            if (latestDeliveryLog && "args" in latestDeliveryLog) {
              const payout = latestDeliveryLog.args[1] as bigint | undefined;
              if (payout !== undefined) {
                return { missionId, amount: payout };
              }
            }

            const latestDisputeLog = disputeLogs[disputeLogs.length - 1];
            if (latestDisputeLog && "args" in latestDisputeLog) {
              const resolvedAmount = latestDisputeLog.args[2] as
                | bigint
                | undefined;
              if (resolvedAmount !== undefined) {
                return { missionId, amount: resolvedAmount };
              }
            }

            return null;
          }),
        );

        fallbackSettlements.forEach((entry) => {
          if (entry) {
            settledAmountByMission.set(entry.missionId, entry.amount);
          }
        });
      }

      const participantAddresses = Array.from(
        new Set(
          results
            .flatMap((mission) => [mission.donor, mission.selectedAgency])
            .filter((wallet) => wallet !== NULL_ADDRESS),
        ),
      );

      const users = await Promise.all(
        participantAddresses.map((wallet) =>
          contract.users(wallet).then((user: UserRow) => ({
            wallet: wallet.toLowerCase(),
            name:
              user.isRegistered && user.name.trim().length > 0
                ? user.name.trim()
                : null,
          })),
        ),
      );

      const nameByWallet = new Map(users.map((user) => [user.wallet, user.name]));

      setMissions(
        results.map((mission) => ({
          ...mission,
          fundedAmount:
            fundedAmountByMission.get(mission.id) ??
            (mission.lockedFunds > 0n ? mission.lockedFunds : null),
          settledAmount: settledAmountByMission.get(mission.id) ?? null,
          donorName: nameByWallet.get(mission.donor.toLowerCase()) ?? "Unknown donor",
          selectedAgencyName:
            mission.selectedAgency === NULL_ADDRESS
              ? null
              : (nameByWallet.get(mission.selectedAgency.toLowerCase()) ??
                "Unknown agency"),
        })),
      );
    } catch (err) {
      setError(
        "Could not connect to the contract. Make sure MetaMask or Ganache is reachable.",
      );
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMissions();
  }, [fetchMissions]);

  useEffect(() => {
    const ethereum = getEthereumProvider();
    if (!ethereum || !CONTRACT_ADDRESS) {
      return;
    }

    const provider = new BrowserProvider(ethereum);
    const contract = new Contract(
      CONTRACT_ADDRESS,
      HUMANITARIAN_ESCROW_ABI,
      provider,
    );

    const refresh = () => {
      fetchMissions();
    };

    const eventNames = [
      "MissionPosted",
      "PledgeSubmitted",
      "MissionFunded",
      "AidDelivered",
      "DeliveryApproved",
      "MissionDisputed",
      "DisputeResolved",
    ];

    eventNames.forEach((eventName) => contract.on(eventName, refresh));

    return () => {
      eventNames.forEach((eventName) => contract.off(eventName, refresh));
    };
  }, [fetchMissions]);

  return {
    missions,
    isLoading,
    error,
    fetchMissions,
  };
}
